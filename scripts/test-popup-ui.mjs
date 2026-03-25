#!/usr/bin/env node
/**
 * Extension popup UI regression: build output, mock chrome, light + dark, Chromium/Firefox/WebKit.
 * Run from repo root:
 *   cd app && npm run build:extension && cd .. && npx playwright install chromium firefox webkit && node scripts/test-popup-ui.mjs
 */

import { chromium, firefox, webkit } from 'playwright'
import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'app', 'dist-extension')

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
}

function serveStatic(req, res) {
  let pathname = new URL(req.url || '/', 'http://localhost').pathname
  if (pathname === '/') pathname = '/popup.html'
  const file = join(distDir, pathname === '/popup.html' ? 'popup.html' : pathname.slice(1))
  if (!file.startsWith(distDir) || !existsSync(file)) {
    res.writeHead(404)
    res.end()
    return
  }
  const ext = extname(file)
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  res.end(readFileSync(file))
}

async function mockChrome(page) {
  await page.addInitScript(() => {
    window.chrome = {
      runtime: {
        id: 'test-extension-id',
        sendMessage: (msg) =>
          Promise.resolve(
            msg.type === 'GET_AI_TABS' ? { tabs: [] } : { results: [], summary: {} },
          ),
      },
      storage: {
        local: {
          /** MV3-style: Promise API (Popup uses .then / await, not callbacks) */
          get: async () => ({}),
          set: async () => {},
          remove: async () => {},
        },
      },
      tabs: {
        create: async () => {},
      },
    }
  })
}

/**
 * @param {import('playwright').Page} page
 * @param {string} colorScheme 'light' | 'dark'
 */
async function assertPopupVisible(page, colorScheme) {
  const header = page.locator('header span', { hasText: 'Sendol' }).first()
  await header.waitFor({ state: 'visible', timeout: 8000 })

  const textarea = page.locator('textarea').first()
  // Send control: lone button in composer right cluster (not auto-send / new-chat)
  const sendButton = page.locator('div.flex.items-center.gap-2').getByRole('button').first()

  const logoButton = page.locator('header').getByRole('button').first()
  const refreshButton = page.locator('header').getByRole('button').nth(1)

  const emptyState = page.locator('div.text-center').first()

  const hasHeader = await header.isVisible()
  const hasTextarea = await textarea.isVisible()
  const hasSendButton = await sendButton.isVisible()
  const hasEmptyState = await emptyState.isVisible()
  const hasLogo = await logoButton.isVisible()
  const hasRefresh = await refreshButton.isVisible()

  if (
    !(
      hasHeader &&
      hasTextarea &&
      hasSendButton &&
      hasEmptyState &&
      hasLogo &&
      hasRefresh
    )
  ) {
    throw new Error(
      `Assertions failed (${colorScheme}): header=${hasHeader} textarea=${hasTextarea} send=${hasSendButton} empty=${hasEmptyState} logo=${hasLogo} refresh=${hasRefresh}`,
    )
  }

  // Smoke: hover logo shows tooltip role (PopupHoverBubble)
  await logoButton.hover()
  await page.waitForTimeout(200)
  const tip = page.locator('[role="tooltip"]').first()
  const tipVisible = await tip.isVisible().catch(() => false)
  if (!tipVisible) {
    throw new Error(`Tooltip did not appear after logo hover (${colorScheme})`)
  }
}

async function runOneBrowser(launcher, name) {
  const server = createServer(serveStatic)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`

  const browser = await launcher.launch({ headless: true })

  try {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: 400, height: 600 },
        colorScheme,
      })
      const page = await context.newPage()
      await mockChrome(page)
      await page.goto(`${base}/popup.html`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)
      await assertPopupVisible(page, `${name}/${colorScheme}`)
      await context.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
}

async function main() {
  if (!existsSync(join(distDir, 'popup.html'))) {
    console.error('Run "cd app && npm run build:extension" first.')
    process.exit(1)
  }

  const runners = [
    ['chromium', chromium],
    ['firefox', firefox],
    ['webkit', webkit],
  ]

  const failures = []
  for (const [name, launcher] of runners) {
    try {
      await runOneBrowser(launcher, name)
      console.log(`OK  ${name}  (light + dark)`)
    } catch (e) {
      console.error(`FAIL ${name}:`, e?.message || e)
      failures.push(name)
    }
  }

  if (failures.length === runners.length) {
    console.error('All browsers failed. Install: npx playwright install chromium firefox webkit')
    process.exit(1)
  }
  if (failures.length > 0) {
    console.error('Partial failure:', failures.join(', '))
    process.exit(1)
  }
  console.log('Popup UI regression: all browsers × color schemes passed.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
