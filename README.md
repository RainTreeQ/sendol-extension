# Sendol

<p align="center">
  <a href="#-chinese">🌏 中文</a> · <a href="#-english">🌍 English</a>
</p>

---

<h2 id="-chinese">🌏 中文</h2>

**一键将同一条消息同步广播到所有 AI 会话窗口。** 支持 ChatGPT、Claude、Gemini、DeepSeek、Kimi、豆包、元宝，专为重度 AI 用户与效率极客设计。

<!-- Use a fixed width to avoid GitHub scaling blur; source image is 1024px for Retina displays -->
<img src="assets/hero-earth.png" alt="Sendol — Multi-screen Sync" width="800" />

<!-- Keep screenshot width fixed to reduce GitHub compression blur -->
<img src="assets/screenshot.png" alt="Sendol popup — ChatGPT / Claude / Gemini multi-tab sync" width="800" />

---

## 💡 特性

| 特性 | 说明 |
|------|------|
| **多端同步输入** | 一次输入，自动分发给所有打开的 AI 助手。 |
| **同步发送** | 两阶段广播：先注入全部标签，再统一触发发送，各平台近乎同时发出。 |
| **智能加载反馈** | 发送按钮采用软超时（约 50 秒）；超时后停止 loading，并在后台持续更新广播进度。 |
| **自动发送** | 无需在各标签页手动点击发送。 |
| **新对话** | 可选在各平台开启新对话。 |
| **极简拟物 UI** | 全键盘支持，Ctrl+Enter 发送。 |

## 🔄 最近更新

<!-- AUTO_README_UPDATES_START -->
- 2026-03-20 14:42 | v1.2.21 (PATCH) | Core | `app/src/components/layout/Footer.jsx` <!-- auto:791e9c40075e -->
- 2026-03-20 14:41 | v1.2.20 (PATCH) | Core | `app/src/components/layout/Header.jsx` <!-- auto:bba3fd0c7f45 -->
- 2026-03-20 14:39 | v1.2.19 (PATCH) | Tooling | `scripts/capture-popup-screenshot.mjs` <!-- auto:c0008c4646d5 -->
- 2026-03-20 14:25 | v1.2.18 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:5ed6e7de1d74 -->
- 2026-03-20 14:22 | v1.2.17 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:978f7e67ef4e -->
- 2026-03-20 14:20 | v1.2.16 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:65815068e781 -->
- 2026-03-20 14:12 | v1.2.15 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:c44975002235 -->
- 2026-03-20 13:51 | v1.2.14 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:a18a5a967490 -->
- 2026-03-20 13:51 | v1.2.13 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:258980a549a6 -->
- 2026-03-20 13:49 | v1.2.12 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:a8ff17cd963d -->
- 2026-03-20 13:46 | v1.2.11 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:47c9fe3130a6 -->
- 2026-03-20 13:45 | v1.2.10 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:c4faeef286c6 -->
<!-- AUTO_README_UPDATES_END -->

---

## 🚀 支持平台

| 平台 | 官网 |
|------|------|
| ChatGPT (OpenAI) | chatgpt.com, chat.openai.com |
| Claude (Anthropic) | claude.ai |
| Gemini (Google) | gemini.google.com |
| DeepSeek | chat.deepseek.com |
| 豆包（字节跳动） | www.doubao.com |
| 元宝（腾讯） | yuanbao.tencent.com |
| Kimi（月之暗面） | kimi.com, kimi.moonshot.cn, kimi.ai |

---

## 🛠 安装

本插件暂未上架 Chrome 网上应用店，请通过**开发者模式**手动加载：

1. **获取代码**
   - 点击 **Code** → **Download ZIP**，解压。
   - 或 Git 克隆：`git clone https://github.com/RainTreeQ/sendol-extension.git`
2. **打开扩展页面**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 开启右上角 **开发者模式**。
4. 点击 **加载已解压的扩展程序**。
5. 选择**项目根目录**（包含 `manifest.json` 的文件夹）。
6. 弹窗入口为 `app/dist-extension/popup.html`（仓库已预构建）；若本地缺失，请在项目根执行一次 `npm run build:extension`。

## 🎯 使用说明

1. 在浏览器中打开需要使用的 AI 平台页面（如 ChatGPT、Claude、Gemini）。
2. 点击浏览器右上角的 Sendol 图标。
3. 插件会自动扫描并列出当前支持的 AI 窗口。
4. 在输入框内输入内容。
5. （可选）勾选「自动发送」「新对话」。
6. 按 **Ctrl+Enter** 或点击发送，完成广播。

---

## ⚠️ 行为说明

- 部分平台必须登录后才会出现输入框；未登录时可能出现「未检测到」。
- 发送按钮 loading 有软超时（约 50 秒）。超过后会显示「后台处理中」提示，并继续广播流程。
- 默认启用自动文本注入的安全策略。后台会自动评估风控信号，并在必要时临时关闭自动发送。
- 图片上传默认采用最安全方式：在各平台页面手动上传。你可以使用「定位上传」按钮高亮可能的上传入口（仍不做跨站自动图片上传）。
- 当前版本明确不支持 Microsoft Copilot / Bing。

---

## 🌐 网站

- **落地页**：[https://sendol.chat](https://sendol.chat) - 功能展示、定价、安装入口（**闭源**）
- 落地页和设计系统已迁移至私有仓库，不再开源。

**说明**：本仓库仅包含浏览器扩展源码。落地页作为专有软件单独开发。

本地开发（仅扩展弹窗）：
```bash
npm run dev --prefix app
# 打开 popup.html 进行开发
```

构建命令：
```bash
npm run build:extension
```

---

## 📂 开发说明

**哪些修改会生效**

| 模块 | 文件 | 生效方式 |
|------|------|----------|
| Popup UI（源码） | `app/src/popup/`、`app/src/components/ui/`、`app/src/index.css` | 执行 `npm run build:extension` 后，在 chrome://extensions 里点「重新加载」 |
| Popup UI（运行产物） | `app/dist-extension/` | 仅作为扩展运行产物，不手工编辑 |
| 落地页/站点运行产物 | `app/dist-site/` | 仅用于落地页构建产物，不参与扩展运行 |
| 后台/广播逻辑 | `background.js` | 保存后到 chrome://extensions 点击「重新加载」 |
| 注入与平台适配 | `content*.js`、`shared/platform-registry.js` | 同上 |
| 扩展配置与权限 | `manifest.json` | 同上 |

详见 [app/docs/L3-EXTENSION-INTEGRATION.md](app/docs/L3-EXTENSION-INTEGRATION.md)。

**发布前检查**

- `npm run build:extension`
- `npm run package:extension`（生成最小发布包与体积报告）
- `npm run test:popup`
- `npm run release:stage`（构建并暂存 `app/dist-extension/`）

---

## 🔒 隐私安全

本插件**完全在本地运行**。使用点对点广播机制，**不收集、不存储、不上传**任何聊天记录、账号密码或隐私信息。

详见 [隐私政策](privacy.md)。

---

## 📄 许可证

### 浏览器扩展（本仓库）
- **开源**：[GNU AGPL-3.0-or-later](LICENSE)
- **商业**：[商业许可说明](COMMERCIAL_LICENSE.md)
- **品牌**：[商标政策](TRADEMARK_POLICY.md)

### 落地页与网站
- **闭源/专有**：[sendol.chat](https://sendol.chat) 的落地页**不是**开源软件，在独立的私有仓库中维护。保留所有权利。

早期 MIT 版本（如 `1.x`）的发布代码仍保持 MIT 许可证。

---

<p align="center">
  <a href="#-english">↓ 查看英文文档</a>
</p>

---

<h2 id="-english">🌍 English</h2>

**Broadcast one message to all AI chat windows at once.** A Chrome/Edge extension for power users who juggle ChatGPT, Claude, Gemini, DeepSeek, Kimi, Doubao, and Yuanbao.

<!-- Use a fixed width to avoid GitHub scaling blur; source image is 1024px for Retina displays -->
<img src="assets/hero-earth.png" alt="Sendol — Multi-screen Sync" width="800" />

<!-- Keep screenshot width fixed to reduce GitHub compression blur -->
<img src="assets/screenshot.png" alt="Sendol popup — ChatGPT / Claude / Gemini multi-tab sync" width="800" />

---

## 💡 Features

| Feature | Description |
|---------|-------------|
| **One input, sync everywhere** | Type once, send to all open AI tabs. |
| **Simultaneous send** | Two-phase broadcast: inject to all tabs first, then trigger send at once. |
| **Smart loading feedback** | Send button uses a soft timeout (~50s); if longer, UI exits loading and keeps progress in background. |
| **Auto Send** | Submit to each AI without clicking Send in every tab. |
| **New Chat** | Optionally start a new conversation on each platform. |
| **Minimal UI, keyboard-first** | Clean design, `Ctrl+Enter` to send. |

## 🔄 Recent Updates

<!-- AUTO_README_UPDATES_START -->
- 2026-03-20 14:42 | v1.2.21 (PATCH) | Core | `app/src/components/layout/Footer.jsx` <!-- auto:791e9c40075e -->
- 2026-03-20 14:41 | v1.2.20 (PATCH) | Core | `app/src/components/layout/Header.jsx` <!-- auto:bba3fd0c7f45 -->
- 2026-03-20 14:39 | v1.2.19 (PATCH) | Tooling | `scripts/capture-popup-screenshot.mjs` <!-- auto:c0008c4646d5 -->
- 2026-03-20 14:25 | v1.2.18 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:5ed6e7de1d74 -->
- 2026-03-20 14:22 | v1.2.17 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:978f7e67ef4e -->
- 2026-03-20 14:20 | v1.2.16 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:65815068e781 -->
- 2026-03-20 14:12 | v1.2.15 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:c44975002235 -->
- 2026-03-20 13:51 | v1.2.14 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:a18a5a967490 -->
- 2026-03-20 13:51 | v1.2.13 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:258980a549a6 -->
- 2026-03-20 13:49 | v1.2.12 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:a8ff17cd963d -->
- 2026-03-20 13:46 | v1.2.11 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:47c9fe3130a6 -->
- 2026-03-20 13:45 | v1.2.10 (PATCH) | Core | `app/src/components/layout/Hero.jsx` <!-- auto:c4faeef286c6 -->
<!-- AUTO_README_UPDATES_END -->

---

## 🚀 Supported Platforms

| Platform | Official URL |
|----------|--------------|
| ChatGPT (OpenAI) | chatgpt.com, chat.openai.com |
| Claude (Anthropic) | claude.ai |
| Gemini (Google) | gemini.google.com |
| DeepSeek | chat.deepseek.com |
| Doubao (ByteDance) | www.doubao.com |
| Yuanbao (Tencent) | yuanbao.tencent.com |
| Kimi (Moonshot) | kimi.com, kimi.moonshot.cn, kimi.ai |

---

## 🛠 Installation

This extension is not on the Chrome Web Store yet. Load it manually in **Developer mode**:

1. **Get the code**
   - Click **Code** → **Download ZIP**, then unzip.
   - Or Git clone: `git clone https://github.com/RainTreeQ/sendol-extension.git`
2. **Open extensions**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Turn on **Developer mode** (toggle in top-right corner).
4. Click **Load unpacked**.
5. Select the **project root folder** (the one containing `manifest.json`).
6. Popup entry is `app/dist-extension/popup.html` (prebuilt in repo). If missing locally, run `npm run build:extension` in project root once.

## 🎯 Usage

1. Open the AI sites you need (e.g. ChatGPT, Claude, Gemini) in separate tabs.
2. Click the **Sendol** icon in the toolbar.
3. The extension scans and lists all detected AI tabs.
4. Type your message in the input box.
5. (Optional) Enable **Auto Send** and/or **New Chat**.
6. Press **Ctrl+Enter** (or Cmd+Enter on Mac) or click Send to broadcast.

---

## ⚠️ Behavior Notes

- Some sites only expose the message input after login; if not logged in, detection may fail.
- The send button loading has a soft timeout (about 50 seconds). If exceeded, popup shows background-progress text and continues processing.
- Safe guard rules are enabled for auto text injection by default. Risk controls are evaluated automatically in background and can temporarily disable auto-send.
- Image upload keeps the safest default path: manual upload on each platform tab. You can use **Locate Upload** to highlight likely upload entries (still no automatic cross-site image upload).
- Microsoft Copilot / Bing is intentionally out of scope in current versions.

---

## 🌐 Website

- **Landing Page**: [https://sendol.chat](https://sendol.chat) - Features, pricing, and installation (**Closed Source**)
- The landing page and design system have been moved to a private repository and are no longer open source.

**Note**: This repository only contains the browser extension source code. The landing page is developed separately as proprietary software.

Local development (extension popup only):
```bash
npm run dev --prefix app
# Open popup.html for development
```

Build commands:
```bash
npm run build:extension
```

---

## 📂 Development

**Which files affect what**

| Module | Files | How to apply changes |
|--------|-------|---------------------|
| Popup UI (source) | `app/src/popup/`, `app/src/components/ui/`, `app/src/index.css` | Run `npm run build:extension`, then reload in chrome://extensions |
| Popup UI (runtime) | `app/dist-extension/` | Build output, do not edit manually |
| Landing / Site runtime | `app/dist-site/` | Build output, not used by extension |
| Background / Broadcast logic | `background.js` | Save file, then reload in chrome://extensions |
| Content scripts & Platform adapters | `content*.js`, `shared/platform-registry.js` | Same as above |
| Extension config & permissions | `manifest.json` | Same as above |

See [app/docs/L3-EXTENSION-INTEGRATION.md](app/docs/L3-EXTENSION-INTEGRATION.md) for details.

**Release checklist**

- `npm run build:extension`
- `npm run package:extension` (generates minified release package and size report)
- `npm run test:popup`
- `npm run release:stage` (builds and stages `app/dist-extension/`)

---

## 🔒 Privacy & Security

This extension runs **entirely on your device**. It uses a local broadcast flow only — **no collection, storage, or upload** of your chats, passwords, or any personal data.

See [Privacy Policy](privacy.md) for details.

---

## 📄 License

### Browser Extension (This Repository)
- **Open-source**: [GNU AGPL-3.0-or-later](LICENSE)
- **Commercial**: [Commercial Licensing Notice](COMMERCIAL_LICENSE.md)
- **Branding**: [Trademark Policy](TRADEMARK_POLICY.md)

### Landing Page & Website
- **Closed Source / Proprietary**: The landing page at [sendol.chat](https://sendol.chat) is **NOT** open source and is maintained in a separate private repository. All rights reserved.

Historical releases published under MIT (such as `1.x`) remain under MIT for the corresponding released code.

---

<p align="center">
  <a href="#-chinese">↑ 返回中文文档</a>
</p>
