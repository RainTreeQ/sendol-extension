# Chrome Web Store 截图制作指南

## 📸 所需截图规格

Chrome Web Store 要求：
- **尺寸**: 1280x800 像素 (或 1440x900)
- **格式**: PNG 或 JPEG
- **数量**: 至少 1 张，建议 3-5 张
- **命名**: screenshot-1.png, screenshot-2.png 等

---

## 🎯 建议截图场景

### 截图 1: 主界面展示 (1280x800)
**内容**：
- 浏览器打开 3-4 个 AI 平台标签页（ChatGPT、Claude、Gemini）
- Sendol popup 弹出，展示：
  - 检测到的 AI 标签列表（带平台图标）
  - 输入框中有示例文本
  - "自动发送"按钮开启状态
  - 底部发送按钮

**操作步骤**：
1. 打开 ChatGPT、Claude、Gemini 标签页
2. 点击 Sendol 图标打开 popup
3. 输入测试文本："Compare the approaches to AI safety"
4. 启用"自动发送"开关
5. 截图（包含浏览器标签栏）

---

### 截图 2: 多平台同步发送 (1280x800)
**内容**：
- 分屏或平铺展示多个 AI 平台同时收到消息
- 展示发送成功后的状态

**操作步骤**：
1. 使用"平铺窗口"功能排列标签页
2. 通过 Sendol 发送消息
3. 等待所有平台显示消息已发送
4. 截图展示同步效果

---

### 截图 3: 失败重试功能 (1280x800)
**内容**：
- 展示某个平台发送失败
- 显示红色/琥珀色重试按钮

**操作步骤**：
1. 断开某个平台的网络连接
2. 尝试发送消息
3. 截图展示失败状态和重试按钮

---

## 🎨 视觉设计建议

### 配色方案
- **背景**: 白色/浅色背景优先
- **强调色**: 
  - 成功: 绿色 (#10b981)
  - 失败: 红色 (#ef4444)
  - 警告: 琥珀色 (#f59e0b)
- **平台标识色**: 使用各平台品牌色
  - ChatGPT: 黑色
  - Claude: 橙色
  - Gemini: 蓝色

### 文案标注
- 截图底部可添加简短说明
- 中英文双语标注更佳

---

## 📱 截图工具推荐

### 方案 1: 浏览器开发者工具
```javascript
// 在控制台调整窗口大小
window.resizeTo(1280, 800);
```

### 方案 2: 使用 Playwright（自动化）
```bash
# 安装 Playwright
npm install -D @playwright/test
npx playwright install chromium

# 运行截图脚本
node scripts/capture-screenshots.mjs
```

### 方案 3: 手动截图工具
- macOS: Cmd+Shift+4（区域截图）
- Windows: Win+Shift+S
- Chrome DevTools: Cmd+Shift+P → "Capture full size screenshot"

---

## ✅ 截图检查清单

- [ ] 尺寸正确 (1280x800)
- [ ] 无敏感信息（个人聊天记录）
- [ ] 清晰展示功能
- [ ] UI 无截断或重叠
- [ ] 文件大小 < 5MB

---

## 🚀 快速开始

1. **准备测试数据**：
   - 打开 ChatGPT、Claude、Gemini
   - 确保都已登录

2. **调整浏览器窗口**：
   - 设置为 1280x800
   - 或使用响应式模式

3. **执行截图操作**：
   - 按上述场景截图
   - 保存到 `assets/screenshots/` 目录

4. **验证截图**：
   - 检查尺寸
   - 确保清晰可读

---

## 📝 商店文案准备

### 简短描述 (132 字符内)
```
一键将消息广播到 ChatGPT、Claude、Gemini、Kimi 等多个 AI 平台，提升效率。
```

### 详细描述
```
Sendol — 多 AI 平台消息广播工具

专为重度 AI 用户设计，支持一键将同一条消息发送到多个 AI 平台：

✓ ChatGPT (OpenAI)
✓ Claude (Anthropic)  
✓ Gemini (Google)
✓ DeepSeek
✓ Kimi (月之暗面)
✓ Doubao (字节跳动)
✓ Yuanbao (腾讯)

核心功能：
• 多端同步输入 — 一次输入，自动分发给所有 AI
• 自动发送 — 无需在各平台手动点击
• 失败重试 — 网络问题自动提示，一键重试
• 极简设计 — 快捷键支持，效率优先

使用方法：
1. 打开需要使用的 AI 平台页面
2. 点击浏览器工具栏 Sendol 图标
3. 输入消息，按 Ctrl+Enter 发送

隐私说明：
所有操作在本地完成，不收集用户数据。
```

---

## 🔧 技术备注

### 截图脚本（可选）
如需自动化截图，可创建 `scripts/capture-screenshots.mjs`：

```javascript
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 }
});

// 加载扩展并截图
// ...

await browser.close();
```

### 目录结构
```
assets/
├── screenshots/
│   ├── screenshot-1.png (主界面)
│   ├── screenshot-2.png (多平台同步)
│   └── screenshot-3.png (失败重试)
└── hero.png (商店横幅，可选)
```

---

准备完成后，截图文件应放在 `assets/screenshots/` 目录下，用于 Chrome Web Store 上传。