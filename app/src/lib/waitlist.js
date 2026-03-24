/**
 * [INPUT]: email, verification code, source
 * [OUTPUT]: Supabase Edge Function API client for waitlist
 * [POS]: lib层 - 数据服务
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Edge Function 基础 URL
function getEdgeFunctionUrl(functionName) {
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/functions/v1/${functionName}`;
}

/**
 * 发送验证码到邮箱
 * @param {string} email - 用户邮箱
 * @param {string} lang - 语言代码
 * @param {string} source - 来源标识
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendVerificationCode(email, lang = 'zh-CN', source = 'landing') {
  // 基础验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, message: 'invalid_email' };
  }

  const url = getEdgeFunctionUrl('send-verification');
  
  // 如果没有配置 Supabase，使用 localStorage 降级方案
  if (!url) {
    console.warn('Supabase not configured, using localStorage fallback');
    return sendVerificationCodeLocal(email, lang, source);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, lang, source }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, message: result.message || 'error' };
    }

    return { success: true, message: result.message };
  } catch (err) {
    console.error('Send verification code error:', err);
    // 失败后降级到 localStorage
    return sendVerificationCodeLocal(email, lang, source);
  }
}

/**
 * localStorage 降级方案：发送验证码
 */
function sendVerificationCodeLocal(email, lang, source) {
  const normalizedEmail = email.toLowerCase().trim();
  
  // 检查是否已加入
  const existing = JSON.parse(localStorage.getItem('sendol_waitlist') || '[]');
  if (existing.some((item) => item.email === normalizedEmail)) {
    return { success: false, message: 'already_joined' };
  }
  
  // 生成验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  
  // 存储验证码
  const storedCodes = JSON.parse(localStorage.getItem('sendol_verification_codes') || '{}');
  storedCodes[normalizedEmail] = {
    code,
    expiresAt,
    attempts: 0,
    source,
  };
  localStorage.setItem('sendol_verification_codes', JSON.stringify(storedCodes));
  
  // 开发模式显示验证码
  if (import.meta.env.DEV) {
    console.log(`[DEV LOCAL] Verification code for ${normalizedEmail}: ${code}`);
  }
  
  return { success: true, message: 'code_sent', code: import.meta.env.DEV ? code : undefined };
}

/**
 * 提交邮箱到候补名单（需要验证码）
 * @param {string} email - 用户邮箱
 * @param {string} code - 验证码
 * @param {string} source - 来源标识
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function joinWaitlist(email, code, source = 'landing') {
  const normalizedEmail = email.toLowerCase().trim();
  
  const url = getEdgeFunctionUrl('verify-and-join');
  
  // 如果没有配置 Supabase，使用 localStorage 降级方案
  if (!url) {
    return joinWaitlistLocal(normalizedEmail, code, source);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email: normalizedEmail, code, source }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, message: result.message || 'error' };
    }

    return { success: true, message: result.message };
  } catch (err) {
    console.error('Join waitlist error:', err);
    // 失败后降级到 localStorage
    return joinWaitlistLocal(normalizedEmail, code, source);
  }
}

/**
 * localStorage 降级方案：加入候补名单
 */
function joinWaitlistLocal(email, code, source) {
  const storedCodes = JSON.parse(localStorage.getItem('sendol_verification_codes') || '{}');
  const codeData = storedCodes[email];
  
  if (!codeData) {
    return { success: false, message: 'code_expired' };
  }
  
  if (Date.now() > codeData.expiresAt) {
    delete storedCodes[email];
    localStorage.setItem('sendol_verification_codes', JSON.stringify(storedCodes));
    return { success: false, message: 'code_expired' };
  }
  
  if (codeData.attempts >= 5) {
    delete storedCodes[email];
    localStorage.setItem('sendol_verification_codes', JSON.stringify(storedCodes));
    return { success: false, message: 'too_many_attempts' };
  }
  
  if (codeData.code !== code.trim()) {
    codeData.attempts += 1;
    storedCodes[email] = codeData;
    localStorage.setItem('sendol_verification_codes', JSON.stringify(storedCodes));
    return { success: false, message: 'invalid_code' };
  }
  
  // 检查是否已存在
  const existing = JSON.parse(localStorage.getItem('sendol_waitlist') || '[]');
  if (existing.some((item) => item.email === email)) {
    return { success: false, message: 'already_joined' };
  }
  
  // 加入候补名单
  existing.push({
    email,
    source,
    created_at: new Date().toISOString(),
  });
  localStorage.setItem('sendol_waitlist', JSON.stringify(existing));
  
  // 清理验证码
  delete storedCodes[email];
  localStorage.setItem('sendol_verification_codes', JSON.stringify(storedCodes));
  
  return { success: true, message: 'success_local' };
}

/**
 * 重新发送验证码
 * @param {string} email - 用户邮箱
 * @param {string} lang - 语言代码
 * @param {string} source - 来源标识
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resendVerificationCode(email, lang = 'zh-CN', source = 'landing') {
  return sendVerificationCode(email, lang, source);
}

/**
 * 获取候补名单数量
 * @returns {Promise<number>}
 */
export async function getWaitlistCount() {
  if (!SUPABASE_URL) {
    const existing = JSON.parse(localStorage.getItem('sendol_waitlist') || '[]');
    return existing.length;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Failed to get waitlist count:', err);
    const existing = JSON.parse(localStorage.getItem('sendol_waitlist') || '[]');
    return existing.length;
  }
}
