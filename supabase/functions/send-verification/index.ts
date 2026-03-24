/**
 * Supabase Edge Function: 发送验证码邮件
 * 使用 Resend 服务发送邮件
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 生成 6 位验证码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// HTML 邮件模板
function getEmailTemplate(code: string, lang: string = 'zh-CN') {
  const templates: Record<string, { subject: string; title: string; desc: string; expire: string }> = {
    'zh-CN': {
      subject: 'Sendol Pro - 验证码',
      title: '您的验证码',
      desc: '感谢您预约 Sendol Pro，请输入以下验证码完成验证：',
      expire: '验证码 10 分钟内有效',
    },
    'zh-TW': {
      subject: 'Sendol Pro - 驗證碼',
      title: '您的驗證碼',
      desc: '感謝您預約 Sendol Pro，請輸入以下驗證碼完成驗證：',
      expire: '驗證碼 10 分鐘內有效',
    },
    'en': {
      subject: 'Sendol Pro - Verification Code',
      title: 'Your Verification Code',
      desc: 'Thank you for joining the Sendol Pro waitlist. Please enter the code below to verify:',
      expire: 'Code expires in 10 minutes',
    },
    'ja': {
      subject: 'Sendol Pro - 認証コード',
      title: '認証コード',
      desc: 'Sendol Pro の登録ありがとうございます。以下のコードを入力してください：',
      expire: 'コードの有効期限は10分間です',
    },
    'ko': {
      subject: 'Sendol Pro - 인증 코드',
      title: '인증 코드',
      desc: 'Sendol Pro 사전 예약 감사합니다. 아래 코드를 입력하세요:',
      expire: '코드는 10분간 유효합니다',
    },
    'es': {
      subject: 'Sendol Pro - Código de verificación',
      title: 'Tu código de verificación',
      desc: 'Gracias por unirte a la lista de espera. Introduce el código:',
      expire: 'El código expira en 10 minutos',
    },
    'de': {
      subject: 'Sendol Pro - Bestätigungscode',
      title: 'Ihr Bestätigungscode',
      desc: 'Danke für Ihre Anmeldung. Bitte geben Sie den Code ein:',
      expire: 'Code gültig für 10 Minuten',
    },
    'fr': {
      subject: 'Sendol Pro - Code de vérification',
      title: 'Votre code de vérification',
      desc: 'Merci de rejoindre la liste d\'attente. Entrez le code:',
      expire: 'Code valable 10 minutes',
    },
  }

  const t = templates[lang] || templates['en']

  return {
    subject: t.subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 480px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    .desc {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .code-box {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin-bottom: 24px;
    }
    .code {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #1a1a1a;
      font-family: 'SF Mono', Monaco, monospace;
    }
    .expire {
      font-size: 13px;
      color: #999;
      text-align: center;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Sendol</div>
    <div class="title">${t.title}</div>
    <div class="desc">${t.desc}</div>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    <div class="expire">${t.expire}</div>
    <div class="footer">
      Sendol - AI Broadcast Extension<br>
      <a href="https://sendol.dev" style="color: #999;">sendol.dev</a>
    </div>
  </div>
</body>
</html>
    `,
  }
}

serve(async (req) => {
  // 处理 CORS 预检
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, lang = 'zh-CN', source = 'pro_card' } = await req.json()

    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'invalid_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 创建 Supabase 客户端检查是否已存在
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (supabaseUrl && supabaseServiceKey) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const { data, error } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', normalizedEmail)
        .single()
      
      if (data) {
        return new Response(
          JSON.stringify({ success: false, message: 'already_joined' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 生成验证码
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // 存储验证码到数据库
    if (supabaseUrl && supabaseServiceKey) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      await supabase
        .from('verification_codes')
        .upsert({
          email: normalizedEmail,
          code,
          expires_at: expiresAt,
          attempts: 0,
          source,
        }, { onConflict: 'email' })
    }

    // 发送邮件（使用 Resend）
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey && resendApiKey !== 'your-resend-api-key') {
      const emailTemplate = getEmailTemplate(code, lang)
      
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sendol <noreply@sendol.dev>',
          to: normalizedEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error('Resend API error:', error)
        throw new Error('Failed to send email')
      }

      console.log(`Verification email sent to ${normalizedEmail}`)
    } else {
      // 开发模式：只记录到日志
      console.log(`[DEV] Verification code for ${normalizedEmail}: ${code}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'code_sent' }),
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
