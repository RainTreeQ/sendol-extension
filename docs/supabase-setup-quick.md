# Supabase 邮件验证码配置清单

## 文件结构

```
supabase/
├── functions/
│   ├── send-verification/
│   │   └── index.ts      # 发送验证码邮件
│   └── verify-and-join/
│       └── index.ts      # 验证并加入候补名单
└── migrations/
    └── 001_create_waitlist_tables.sql

docs/
└── supabase-setup.md     # 完整部署指南

app/
├── src/
│   └── lib/
│       └── waitlist.js   # 更新后的前端 API
└── .env.example          # 环境变量示例
```

## 配置步骤（按顺序执行）

### 1. 注册服务

- [ ] [Supabase](https://supabase.com) - 创建项目
- [ ] [Resend](https://resend.com) - 注册账号，获取 API Key

### 2. 配置 Supabase 数据库

在 Supabase Dashboard → SQL Editor 执行：

```sql
CREATE TABLE waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE verification_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 安装 Supabase CLI

```bash
brew install supabase/tap/supabase
supabase login
supabase init
supabase link --project-ref your-project-ref
```

### 4. 配置 Edge Function 密钥

```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

获取 Service Role Key：
Supabase Dashboard → Project Settings → API → service_role key

### 5. 部署 Edge Functions

```bash
supabase functions deploy
```

### 6. 配置前端

创建 `app/.env`：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 7. 重启并测试

```bash
cd app && npm run dev
```

打开 `http://localhost:5173`，在 Pro 卡片中测试验证码流程。

## 验证是否成功

1. 输入邮箱点击"获取验证码"
2. 检查邮箱是否收到验证码（标题：Sendol Pro - 验证码）
3. 输入验证码点击"确认加入"
4. 查看 Supabase Dashboard → Database → waitlist 表是否有记录

## 常见问题

**Q: 邮箱没收到验证码？**
A: 检查 Resend API Key 是否正确设置，查看 Edge Function Logs

**Q: 部署后提示 CORS 错误？**
A: Edge Function 已配置 CORS，检查 Supabase URL 是否正确

**Q: 开发模式怎么用？**
A: 不配置 Supabase 时会自动使用 localStorage，验证码会输出到控制台

**Q: Resend 需要验证域名吗？**
A: 可以用默认的 `@resend.dev` 域名，但建议用自己的域名
