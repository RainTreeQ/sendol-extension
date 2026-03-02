#!/usr/bin/env node
/**
 * Extension popup UI regression test.
 * Builds app, serves app/dist, mocks chrome API, opens popup and asserts key elements.
 * Run from repo root: npm run build (in app) then node scripts/test-popup-ui.mjs
 * Or: npx playwright install chromium && node scripts/test-popup-ui.mjs
 */

import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'app', 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function serveStatic(req, res) {
  let pathname = new URL(req.url || '/', 'http://localhost').pathname;
  if (pathname === '/') pathname = '/popup.html';
  const file = join(distDir, pathname === '/popup.html' ? 'popup.html' : pathname.slice(1));
  if (!file.startsWith(distDir) || !existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const ext = extname(file);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.end(readFileSync(file));
}

async function main() {
  if (!existsSync(join(distDir, 'popup.html'))) {
    console.error('Run "cd app && npm run build" first.');
    process.exit(1);
  }

  const server = createServer(serveStatic);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 400, height: 600 } });

  await page.addInitScript(() => {
    window.chrome = {
      runtime: {
        id: 'test-extension-id',
        sendMessage: (msg) =>
          Promise.resolve(
            msg.type === 'GET_AI_TABS' ? { tabs: [] } : { results: [], summary: {} }
          ),
      },
      storage: {
        local: {
          get: (keys, cb) => (typeof cb === 'function' ? cb({}) : undefined),
          set: () => {},
        },
      },
    };
  });

  await page.goto(`${base}/popup.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const header = page.getByText(/SendAll|广发/).first();
  await header.waitFor({ state: 'visible', timeout: 5000 });

  const textarea = page.getByPlaceholder(/Message AI Agents/i);
  const sendButton = page.getByRole('button', { name: /Select tabs|Send to|发送/i });
  const noTabs = page.locator('text=No AI tabs detected');

  const hasHeader = await header.isVisible();
  const hasTextarea = await textarea.isVisible();
  const hasSendButton = await sendButton.isVisible();
  const hasNoTabs = await noTabs.isVisible();

  await browser.close();
  server.close();

  if (hasHeader && hasTextarea && hasSendButton && hasNoTabs) {
    console.log('Popup UI regression: OK (header, textarea, send button, no-tabs message visible)');
    process.exit(0);
  }
  console.error('Popup UI regression FAILED:', {
    hasHeader,
    hasTextarea,
    hasSendButton,
    hasNoTabs,
  });
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
