# AI Broadcast Extension

一键将同一条消息同步广播到所有的 AI 会话窗口。专为重度 AI 玩家与效率极客设计的 Chrome/Edge 浏览器扩展。

![Hero Screenshot](assets/screenshot.png)

## 💡 特性 (Features)
- **多端同步输入**：一次输入，自动分发给所有打开的 AI 助手。
- **Auto Send (自动发送)**：支持直接提交对话，无需在各个标签页手动点击发送。
- **New Chat (新对话)**：可选是否在各平台开启新的对话窗口。
- **极简拟物 UI**：类 Vercel 的现代设计风格，全键盘快捷键支持 (Ctrl+Enter 发送)。

## 🚀 支持平台 (Supported Platforms)
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- Grok (xAI)
- DeepSeek

## 📂 开发时注意：哪些修改会生效

- **弹窗界面**（Logo、样式、交互）：改 `app/src/popup/Popup.jsx` 等，改完在 `app/` 下执行 `npm run build`，再到扩展管理页点「重新加载」。
- **后台 / 注入脚本、manifest、图标**：改根目录的 `background.js`、`content.js`、`manifest.json`、`icons/` 即可，保存后重载扩展即生效。  
详见 [app/docs/L3-EXTENSION-INTEGRATION.md](app/docs/L3-EXTENSION-INTEGRATION.md)。

## 🛠 手动安装 (Installation)

由于此插件暂未上架 Chrome Web Store，请通过**开发者模式**手动加载：

1. 下载本仓库代码：
   - 点击右上角绿色的 **Code** 按钮，选择 **Download ZIP** 并解压。
   - 或使用 Git 克隆：`git clone https://github.com/your-username/ai-broadcast-extension.git`
2. 打开 Chrome/Edge 浏览器，进入扩展程序页面：
   - Chrome: 地址栏输入 `chrome://extensions/`
   - Edge: 地址栏输入 `edge://extensions/`
3. 开启页面右上角的 **开发者模式 (Developer mode)**。
4. 点击 **加载已解压的扩展程序 (Load unpacked)**。
5. 选择解压后的项目**根目录**（包含 `manifest.json` 的文件夹）即可完成安装。

## 🎯 使用说明 (Usage)
1. 在浏览器中打开你需要咨询的各个 AI 平台网页（如 ChatGPT, Claude 等）。
2. 点击浏览器右上角的 AI Broadcast 插件图标。
3. 插件会自动扫描当前已打开的所有支持的 AI 窗口。
4. 在输入框内输入你的问题。
5. （可选）勾选 `Auto Send` 让各平台自动发送；勾选 `New Chat` 在各平台开启新话题。
6. 按下 `Ctrl + Enter` 或点击发送按钮即可完成广播。

## 🔒 隐私安全 (Privacy)
本插件基于客户端运行，使用点对点广播机制。所有数据均在本地处理，**不收集、不存储、不上传**任何用户聊天记录、账号密码或隐私信息。详情见 [Privacy Policy](privacy.md)。

## 📄 许可证 (License)
本项目基于 [MIT License](LICENSE) 开源。
