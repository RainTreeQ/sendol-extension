# SendAll

**Broadcast one message to all AI chat windows at once.** A Chrome/Edge extension for power users who juggle ChatGPT, Claude, Gemini, and more.

**一键将同一条消息同步广播到所有 AI 会话窗口。** 专为重度 AI 用户与效率极客设计的浏览器扩展。

<!-- Use a fixed width to avoid GitHub scaling blur; source image is 1024px for Retina displays -->
<img src="assets/hero-earth.png" alt="SendAll — Multi-screen Sync" width="800" />

<!-- Keep screenshot width fixed to reduce GitHub compression blur -->
<img src="assets/screenshot.png" alt="SendAll popup — ChatGPT / Claude / Gemini multi-tab sync" width="800" />

---

## 💡 Features / 特性

| English | 中文 |
|--------|------|
| **One input, sync everywhere** — Type once, send to all open AI tabs. | **多端同步输入** — 一次输入，自动分发给所有打开的 AI 助手。 |
| **Simultaneous send** — Two-phase broadcast: inject to all tabs first, then trigger send at once. | **同步发送** — 两阶段广播：先注入全部标签，再统一触发发送，各平台近乎同时发出。 |
| **Auto Send** — Submit to each AI without clicking Send in every tab. | **自动发送** — 无需在各标签页手动点击发送。 |
| **New Chat** — Optionally start a new conversation on each platform. | **新对话** — 可选在各平台开启新对话。 |
| **Minimal UI, keyboard-first** — Vercel-style design, `Ctrl+Enter` to send. | **极简拟物 UI** — 全键盘支持，Ctrl+Enter 发送。 |

## 🚀 Supported Platforms / 支持平台

| Platform | 官网 / Official URL |
|----------|---------------------|
| ChatGPT (OpenAI) | chatgpt.com, chat.openai.com |
| Claude (Anthropic) | claude.ai |
| Gemini (Google) | gemini.google.com |
| Grok (xAI) | grok.com |
| DeepSeek | chat.deepseek.com |
| 豆包 Doubao (字节跳动) | www.doubao.com |
| 通义千问 Qianwen (阿里云) | www.qianwen.com, tongyi.aliyun.com |
| Kimi (月之暗面) | kimi.moonshot.cn, kimi.ai |

---

## 🛠 Installation / 安装

This extension is not on the Chrome Web Store yet. Load it manually in **Developer mode**:

本插件暂未上架 Chrome 网上应用店，请通过**开发者模式**手动加载：

1. **Get the code** / **获取代码**
   - Click **Code** → **Download ZIP**, then unzip.
   - 或 Git 克隆：`git clone https://github.com/RainTreeQ/sendall-extension.git`
2. **Open extensions** / **打开扩展页面**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Turn on **Developer mode** / 开启右上角 **开发者模式**。
4. Click **Load unpacked** / 点击 **加载已解压的扩展程序**。
5. Select the **project root folder** (the one containing `manifest.json`) / 选择解压后的**项目根目录**（包含 `manifest.json` 的文件夹）。
6. Popup entry is `app/dist/popup.html` (prebuilt in repo). If missing locally, run `npm run build` in project root once. / 弹窗入口为 `app/dist/popup.html`（仓库已预构建）；若你本地缺失，请在项目根执行一次 `npm run build`。

## 🎯 Usage / 使用说明

| Step | English | 中文 |
|------|--------|------|
| 1 | Open the AI sites you need (e.g. ChatGPT, Claude, Gemini) in separate tabs. | 在浏览器中打开需要使用的 AI 平台页面。 |
| 2 | Click the **SendAll** icon in the toolbar. | 点击浏览器右上角的 广发 图标。 |
| 3 | The extension scans and lists all detected AI tabs. | 插件会自动扫描并列出当前支持的 AI 窗口。 |
| 4 | Type your message in the input box. | 在输入框内输入内容。 |
| 5 | (Optional) Enable **Auto Send** and/or **New Chat**. | （可选）勾选「自动发送」「新对话」。 |
| 6 | Press **Ctrl+Enter** (or Cmd+Enter on Mac) or click Send to broadcast. | 按 **Ctrl+Enter** 或点击发送，完成广播。 |

---

## 📂 Development / 开发说明

**Which files affect what** / **哪些修改会生效**

| 模块 | 文件 | 生效方式 |
|------|------|----------|
| Popup UI (source) | `app/src/popup/`, `app/src/components/ui/`, `app/src/index.css` | 修改后执行 `npm run build` 生成 `app/dist/`，再在 chrome://extensions 里点「重新加载」 |
| Popup UI (runtime) | `app/dist/` | 仅作为扩展运行产物，不手工编辑 |
| 后台 / 广播逻辑 | `background.js` | 保存后到 chrome://extensions 点击「重新加载」 |
| 注入与平台适配 | `content.js` | 同上 |
| 扩展配置与权限 | `manifest.json` | 同上 |

See [app/docs/L3-EXTENSION-INTEGRATION.md](app/docs/L3-EXTENSION-INTEGRATION.md) for details. 详见该文档。

---

## 🔒 Privacy / 隐私安全

**English:** This extension runs entirely on your device. It uses a local broadcast flow only — **no collection, storage, or upload** of your chats, passwords, or any personal data. See [Privacy Policy](privacy.md).

**中文：** 本插件在本地运行，使用点对点广播机制。所有数据均在本地处理，**不收集、不存储、不上传**任何聊天记录、账号密码或隐私信息。详见 [隐私政策](privacy.md)。

---

## 📄 License / 许可证

[MIT License](LICENSE)
