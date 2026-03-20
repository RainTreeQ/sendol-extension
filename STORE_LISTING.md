# Chrome Web Store 上架文案

## 📋 基本信息

### 名称 (17 字符)
```
Sendol - AI 消息广播
```

### 简短描述 (132 字符)
```
一键将消息广播到 ChatGPT、Claude、Gemini、Kimi 等 AI 平台。多端同步输入，自动发送，失败重试。
```

### 详细描述

**English:**
```
Sendol — Broadcast messages to multiple AI platforms simultaneously

Save time by sending the same message to ChatGPT, Claude, Gemini, DeepSeek, Kimi, Doubao, and Yuanbao with one click.

Key Features:
• One input, sync everywhere — Type once, broadcast to all open AI tabs
• Auto Send — No need to click send on each platform manually
• Smart Retry — Automatically detects failures and allows one-click retry
• Keyboard-first — Ctrl+Enter to send, minimal UI design
• Safe Mode — Built-in risk detection for stable operation

How to Use:
1. Open the AI platforms you want to use (e.g., ChatGPT, Claude)
2. Click the Sendol icon in your browser toolbar
3. Type your message and press Ctrl+Enter (or Cmd+Enter on Mac)

Privacy:
All operations are performed locally. No data is collected or transmitted to external servers.

Supported Platforms:
✓ ChatGPT (chatgpt.com)
✓ Claude (claude.ai)
✓ Gemini (gemini.google.com)
✓ DeepSeek (chat.deepseek.com)
✓ Kimi (kimi.com)
✓ Doubao (doubao.com)
✓ Yuanbao (yuanbao.tencent.com)
```

**中文:**
```
Sendol — 多 AI 平台消息同步广播工具

一键将同一条消息发送到 ChatGPT、Claude、Gemini、DeepSeek、Kimi、豆包、元宝等多个 AI 平台，提升效率。

核心功能：
• 多端同步输入 — 一次输入，自动分发给所有打开的 AI 标签页
• 自动发送 — 无需在各平台手动点击发送按钮
• 智能重试 — 自动检测发送失败，支持一键重试
• 键盘优先 — Ctrl+Enter 发送，极简拟物设计
• 安全模式 — 内置风控检测，稳定运行

使用方法：
1. 打开需要使用的 AI 平台页面（如 ChatGPT、Claude）
2. 点击浏览器右上角的 Sendol 图标
3. 输入消息，按 Ctrl+Enter（或 Mac 的 Cmd+Enter）发送

隐私说明：
所有操作均在本地完成，不收集用户数据，不上传至外部服务器。

支持平台：
✓ ChatGPT (chatgpt.com)
✓ Claude (claude.ai)
✓ Gemini (gemini.google.com)
✓ DeepSeek (chat.deepseek.com)
✓ Kimi (kimi.com)
✓ 豆包 (doubao.com)
✓ 元宝 (yuanbao.tencent.com)
```

---

## 🏷️ 分类

**Primary Category:** Productivity
**Secondary Category:** Developer Tools

---

## 🔍 关键词 (最多 1000 字符)

```
AI, ChatGPT, Claude, Gemini, broadcast, sync, multi-platform, productivity, efficiency, chatbot, DeepSeek, Kimi, Doubao, Yuanbao, message, automation, tool, extension, browser, chrome, edge
```

---

## 👤 开发者信息

**Developer Name:** Sendol Team
**Website:** (GitHub 或落地页 URL)
**Email:** (支持邮箱)
**Privacy Policy:** (privacy.md 的在线链接)

---

## 📱 图标规格

已准备：
- ✅ icon16.png (16x16)
- ✅ icon48.png (48x48)
- ✅ icon128.png (128x128)

---

## 🖼️ 推广图片（可选）

### 横幅图片 (1400x560)
用于 Chrome Web Store 顶部展示
建议内容：产品 Logo + 核心功能标语

### 小图 (440x280)
用于缩略图展示

---

## 📋 审核检查清单

### 功能完整性
- [x] 扩展能正常安装和运行
- [x] 核心功能（消息广播）工作正常
- [x] 支持的所有平台已测试
- [x] 错误处理完善（失败重试）

### 隐私合规
- [x] 隐私政策已提供
- [x] 权限说明清晰
- [x] 不收集用户数据
- [x] 所有操作本地完成

### 商店规范
- [x] 描述准确，无误导
- [x] 截图展示真实功能
- [x] 关键词相关
- [x] 图标符合规范

### 技术合规
- [x] Manifest V3
- [x] 主机权限合理
- [x] 代码无恶意行为
- [x] 无外部脚本注入

---

## 🚀 提交流程

1. **准备素材**
   - 截图 (1280x800, 3-5 张)
   - 图标 (16/48/128px)
   - 推广图片 (可选)

2. **打包扩展**
   ```bash
   zip -r sendol-extension.zip app/dist-extension/ icons/ manifest.json _locales/ -x "*.DS_Store"
   ```

3. **登录 Chrome Web Store Developer Dashboard**
   - https://chrome.google.com/webstore/devconsole

4. **填写信息**
   - 上传 zip 文件
   - 填写商店文案
   - 上传截图
   - 设置价格和分发范围

5. **提交审核**
   - 通常 1-3 个工作日
   - 可能会收到补充材料要求

6. **发布后**
   - 监控用户反馈
   - 及时更新版本

---

## 📊 发布策略建议

### 分阶段发布
1. **Private** - 先给内部测试（10-100 用户）
2. **Unlisted** - 公开但不展示在商店
3. **Public** - 正式发布

### 定价策略
- **免费** - 吸引用户，后续可添加高级功能
- 或 **一次性付费** - 如 $2.99（去除门槛但获得收入）

### 推广渠道
- GitHub 发布 Release
- 技术社区分享（V2EX、Reddit r/chrome_extensions）
- AI 工具聚合站（Futurepedia、TheresAnAIForThat）

---

## 📝 版本历史（用于商店）

```
v1.2.14 (2025-03-20)
- 优化 Kimi 高频使用稳定性
- 改进失败重试功能
- 添加风控检测和防刷机制

v1.2.0 (2025-03-18)
- 支持 10 个 AI 平台
- 添加图片粘贴功能
- 全新拟物设计 UI

v1.0.0 (2025-03-16)
- 初始版本发布
- 支持 ChatGPT、Claude、Gemini
- 基础消息广播功能
```

---

准备完成后，可直接复制以上内容到 Chrome Web Store Developer Dashboard 提交。
