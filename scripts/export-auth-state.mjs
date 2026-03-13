#!/usr/bin/env node
/**
 * Export browser auth state for CI usage.
 *
 * Instead of launching a clean Playwright Chromium (which gets blocked by
 * Cloudflare / bot-detection on ChatGPT etc.), this script copies the
 * user-data-dir from an existing browser profile, launches Playwright on
 * top of that copy, visits each platform to populate storageState, then
 * exports cookies + localStorage as a single JSON file.
 *
 * Usage:
 *   npm run auth:export              # auto-detects Dia > Chrome > Edge
 *   npm run auth:export -- --browser chrome
 *   npm run auth:export -- --browser dia
 *   npm run auth:export -- --browser edge
 *   npm run auth:export -- --profile "Profile 7"   # non-default profile
 *
 * IMPORTANT: Close the source browser first, or the locked DB files may
 * cause issues. The script copies the profile to a temp dir so it never
 * writes to your real profile.
 */

import { chromium } from 'playwright';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, '.auth');
const OUTPUT_PATH = join(OUTPUT_DIR, 'storage-state.json');

const HOME = process.env.HOME || process.env.USERPROFILE || '';

const BROWSER_PROFILES = {
  dia: join(HOME, 'Library/Application Support/Dia/User Data'),
  chrome: join(HOME, 'Library/Application Support/Google/Chrome'),
  edge: join(HOME, 'Library/Application Support/Microsoft Edge'),
  arc: join(HOME, 'Library/Application Support/Arc/User Data'),
};

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

function parseArgs() {
  const args = process.argv.slice(2);
  let browser = '';
  let profile = 'Default';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--browser' && args[i + 1]) {
      browser = args[++i].toLowerCase();
    } else if (args[i] === '--profile' && args[i + 1]) {
      profile = args[++i];
    }
  }
  return { browser, profile };
}

function detectBrowser() {
  const priority = ['dia', 'chrome', 'edge', 'arc'];
  for (const name of priority) {
    const dir = BROWSER_PROFILES[name];
    if (existsSync(join(dir, 'Default'))) return name;
  }
  return null;
}

function copyProfile(userDataDir, profileName) {
  const src = join(userDataDir, profileName);
  if (!existsSync(src)) {
    throw new Error(`Profile not found: ${src}`);
  }

  const tmpBase = mkdtempSync(join(tmpdir(), 'pw-auth-'));
  const tmpProfile = join(tmpBase, profileName);

  console.log(`Copying profile "${profileName}" to temp dir...`);
  console.log(`  from: ${src}`);
  console.log(`  to:   ${tmpProfile}`);

  // Copy only the essential dirs (skip huge caches)
  const essentialItems = [
    'Cookies',
    'Cookies-journal',
    'Local Storage',
    'Session Storage',
    'IndexedDB',
    'Web Data',
    'Web Data-journal',
    'Preferences',
    'Secure Preferences',
    'Login Data',
    'Login Data-journal',
  ];

  mkdirSync(tmpProfile, { recursive: true });

  for (const item of essentialItems) {
    const itemSrc = join(src, item);
    const itemDst = join(tmpProfile, item);
    if (existsSync(itemSrc)) {
      cpSync(itemSrc, itemDst, { recursive: true });
    }
  }

  // Copy Local State from the user-data-dir root (needed for cookie decryption)
  const localStateSrc = join(userDataDir, 'Local State');
  const localStateDst = join(tmpBase, 'Local State');
  if (existsSync(localStateSrc)) {
    cpSync(localStateSrc, localStateDst);
  }

  // Create a minimal First Run marker to suppress welcome screens
  mkdirSync(join(tmpBase, 'Default'), { recursive: true });

  return tmpBase;
}

async function main() {
  const { browser: requestedBrowser, profile } = parseArgs();
  const browserName = requestedBrowser || detectBrowser();

  if (!browserName) {
    console.error('No supported browser found. Install Chrome, Dia, Edge, or Arc.');
    process.exit(1);
  }

  const userDataDir = BROWSER_PROFILES[browserName];
  if (!userDataDir || !existsSync(userDataDir)) {
    console.error(`Browser data dir not found: ${userDataDir}`);
    process.exit(1);
  }

  console.log(`Using browser: ${browserName}`);
  console.log(`Profile: ${profile}`);
  console.log('');
  console.log('IMPORTANT: Close the source browser before continuing to avoid DB lock issues.');
  console.log('');

  // Copy profile to temp dir so we never touch the real one
  const tmpUserData = copyProfile(userDataDir, profile);

  let context;
  try {
    // Launch with the copied profile using launchPersistentContext
    // This gives us the real cookies, localStorage, etc.
    context = await chromium.launchPersistentContext(tmpUserData, {
      headless: false,
      channel: 'chromium',
      viewport: { width: 1440, height: 900 },
      args: [
        '--disable-blink-features=AutomationControlled',
        `--profile-directory=${profile}`,
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = context.pages()[0] || await context.newPage();

    console.log('\nVisiting each platform to collect auth state...\n');

    for (const platform of PLATFORMS) {
      process.stdout.write(`  ${platform.name.padEnd(12)} `);
      try {
        await page.goto(platform.url, {
          waitUntil: 'domcontentloaded',
          timeout: 20000,
        });
        await page.waitForTimeout(3000);
        process.stdout.write('OK\n');
      } catch {
        process.stdout.write('TIMEOUT (skipped)\n');
      }
    }

    // Export storage state
    mkdirSync(OUTPUT_DIR, { recursive: true });
    await context.storageState({ path: OUTPUT_PATH });
    await context.close();

    const raw = readFileSync(OUTPUT_PATH, 'utf8');
    const encoded = Buffer.from(raw).toString('base64');

    console.log('\nSaved:', OUTPUT_PATH);
    console.log(`\nBase64 length: ${encoded.length} chars`);
    console.log('\nAdd this to GitHub Secret PLATFORM_AUTH_STATES_B64:');
    console.log('(value is too long for terminal — use the file instead)\n');
    console.log(`  cat "${OUTPUT_PATH}" | base64 | pbcopy\n`);
    console.log('This copies the base64 to your clipboard. Then paste into GitHub Secrets.');
  } finally {
    // Cleanup temp dir
    try {
      if (context) await context.close().catch(() => {});
      rmSync(tmpUserData, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

main().catch((error) => {
  console.error('Fatal:', error.message);
  process.exit(1);
});
