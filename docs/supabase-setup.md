# Supabase 邮件验证码配置指南

## 概述

候补名单功能使用 Supabase Edge Functions + Resend 邮件服务发送验证码邮件。

## 部署步骤

### 1. 安装 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 验证安装
supabase --version
```

### 2. 登录 Supabase

```bash
supabase login
```

### 3. 初始化项目（在项目根目录）

```bash
supabase init
```

### 4. 链接到远程项目

```bash
supabase link --project-ref your-project-ref
```

`your-project-ref` 在 Supabase Dashboard URL 中，如 `https://app.supabase.com/project/xxxxx` 中的 `xxxxx`

### 5. 执行数据库迁移

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 创建候补名单表
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);
```

### 6. 注册 Resend 并获取 API Key

1. 访问 [resend.com](https://resend.com)
2. 注册账号
3. 添加 Domain（可选，也可以用默认的 `@resend.dev`）
4. 创建 API Key
5. 验证发送域名（如果需要用自己的域名）

### 7. 配置 Edge Function 环境变量

```bash
# 设置环境变量
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set RESEND_API_KEY=your-resend-api-key

# 验证设置
supabase secrets list
```

### 8. 部署 Edge Functions

```bash
# 部署所有 Edge Functions
supabase functions deploy

# 或者分别部署
supabase functions deploy send-verification
supabase functions deploy verify-and-join
```

### 9. 配置前端环境变量

创建 `app/.env` 文件：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 10. 重启开发服务器

```bash
cd app && npm run dev
```

## 验证部署

1. 打开落地页 Pro 卡片
2. 输入邮箱点击"获取验证码"
3. 检查邮箱是否收到验证码邮件
4. 输入验证码完成加入

## 监控和日志

在 Supabase Dashboard 查看：
- **Edge Functions** → Logs：查看函数执行日志
- **Database** → Tables：查看候补名单数据
- **Resend Dashboard**：查看邮件发送状态

## 故障排查

### 邮件未收到

1. 检查 Resend API Key 是否正确设置
2. 查看 Edge Function Logs 是否有错误
3. 检查邮箱是否在垃圾邮件文件夹
4. 使用 Resend Dashboard 查看发送状态

### Edge Function 调用失败

1. 确认 `SUPABASE_ANON_KEY` 正确
2. 检查 Edge Function 是否已部署
3. 查看浏览器网络请求的响应

### 数据库错误

1. 确认表已创建
2. 检查 RLS 策略是否正确
3. 查看 Supabase Logs

## 费用

- **Supabase Edge Functions**：每月 500,000 次调用免费
- **Resend**：每月 100 封邮件免费，之后 $0.001/封

对于候补名单场景，免费额度完全够用。

## 安全建议

1. 生产环境务必使用 Resend 的验证域名
2. 定期轮换 API Keys
3. 监控 Edge Function 调用频率（防止滥用）
4. 考虑添加 IP 限制（可选）
