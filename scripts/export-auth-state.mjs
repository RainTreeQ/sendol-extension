#!/usr/bin/env node

import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, '.auth');
const OUTPUT_PATH = join(OUTPUT_DIR, 'storage-state.json');

const PLATFORMS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com/' },
  { id: 'deepseek', name: 'DeepSeek', url: 'https://www.deepseek.com/' },
  { id: 'doubao', name: 'Doubao', url: 'https://www.doubao.com/' },
  { id: 'qianwen', name: 'Qianwen', url: 'https://www.qianwen.com/' },
  { id: 'yuanbao', name: 'Yuanbao', url: 'https://yuanbao.tencent.com/' },
  { id: 'kimi', name: 'Kimi', url: 'https://www.kimi.com/' },
  { id: 'mistral', name: 'Mistral', url: 'https://chat.mistral.ai/' },
];

async function waitForUser() {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', () => resolve());
  });
}

async function main() {
  console.log('Opening browser for manual login.');
  console.log('For each platform: log in if needed, confirm chat page loads, then press Enter in terminal.');

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  for (const platform of PLATFORMS) {
    console.log(`\n[${platform.name}] ${platform.url}`);
    await page.goto(platform.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Press Enter after you finish login/check for this platform.');
    await waitForUser();
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  await context.storageState({ path: OUTPUT_PATH });
  await browser.close();

  const raw = readFileSync(OUTPUT_PATH);
  const encoded = Buffer.from(raw).toString('base64');

  console.log('\nSaved:', OUTPUT_PATH);
  console.log('\nAdd this to GitHub Secret PLATFORM_AUTH_STATES_B64:');
  console.log(encoded);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
