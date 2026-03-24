/**
 * Supabase Edge Function: 验证验证码并加入候补名单
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code, source = 'pro_card' } = await req.json()

    // 基础验证
    if (!email || !code) {
      return new Response(
        JSON.stringify({ success: false, message: 'missing_fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 创建 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'server_config_error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 检查是否已在候补名单
    const { data: existingUser } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', normalizedEmail)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'already_joined' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 获取验证码记录
    const { data: codeRecord, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (codeError || !codeRecord) {
      return new Response(
        JSON.stringify({ success: false, message: 'code_expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 检查是否过期
    if (new Date() > new Date(codeRecord.expires_at)) {
      await supabase.from('verification_codes').delete().eq('email', normalizedEmail)
      return new Response(
        JSON.stringify({ success: false, message: 'code_expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 检查尝试次数
    if (codeRecord.attempts >= 5) {
      await supabase.from('verification_codes').delete().eq('email', normalizedEmail)
      return new Response(
        JSON.stringify({ success: false, message: 'too_many_attempts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 验证验证码
    if (codeRecord.code !== code.trim()) {
      await supabase
        .from('verification_codes')
        .update({ attempts: codeRecord.attempts + 1 })
        .eq('email', normalizedEmail)
      
      return new Response(
        JSON.stringify({ success: false, message: 'invalid_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 验证成功，加入候补名单
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: normalizedEmail,
        source,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ success: false, message: 'already_joined' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw insertError
    }

    // 删除已使用的验证码
    await supabase.from('verification_codes').delete().eq('email', normalizedEmail)

    console.log(`User ${normalizedEmail} joined waitlist`)

    return new Response(
      JSON.stringify({ success: true, message: 'success' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
