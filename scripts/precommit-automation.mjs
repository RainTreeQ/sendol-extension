#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const README_PATH = join(ROOT, 'README.md');
const MANIFEST_PATH = join(ROOT, 'manifest.json');
const PKG_PATH = join(ROOT, 'package.json');
const APP_PKG_PATH = join(ROOT, 'app/package.json');
const STATE_DIR = join(ROOT, '.git/.codex-hooks');
const STATE_PATH = join(STATE_DIR, 'precommit-automation-state.json');

const README_MARKER_START = '<!-- AUTO_README_UPDATES_START -->';
const README_MARKER_END = '<!-- AUTO_README_UPDATES_END -->';
const README_SECTION_TITLE = '## 🔄 Recent Updates / 自动更新';
const README_INSERT_BEFORE = '## 🚀 Supported Platforms / 支持平台';
const MAX_README_ENTRIES = 12;

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function getStagedFiles() {
  const output = runGit(['diff', '--cached', '--name-only', '--diff-filter=ACMR']);
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function isExcludedForFingerprint(file) {
  if (file.startsWith('app/dist-')) return true;
  if (file.startsWith('app/dist/')) return true;
  if (file === 'README.md') return true;
  return false;
}

function isMeaningfulCodeFile(file) {
  if (file.startsWith('app/dist-')) return false;
  if (file.startsWith('app/dist/')) return false;
  if (file.startsWith('docs/')) return false;
  if (file === 'README.md' || file === 'CONTRIBUTING.md' || file === 'LICENSE' || file === 'privacy.md') return false;
  if (file.endsWith('.md')) return false;
  return true;
}

function normalizePatchForFingerprint(patch) {
  const lines = patch.split('\n');
  const out = [];
  for (const line of lines) {
    if (!(line.startsWith('+') || line.startsWith('-'))) continue;
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    if (/^[+-]\s*"version"\s*:/.test(line)) continue;
    if (/^[+-]\s*"manifest_version"\s*:/.test(line)) continue;
    out.push(line);
  }
  return out.join('\n').trim();
}

function collectMeaningfulDiff(stagedFiles) {
  const patchParts = [];
  const files = [];
  const filesForPatch = stagedFiles.filter((file) => !isExcludedForFingerprint(file));
  for (const file of filesForPatch) {
    const patch = runGit(['diff', '--cached', '--no-color', '--', file]);
    const normalized = normalizePatchForFingerprint(patch);
    if (normalized) {
      patchParts.push(normalized);
      files.push(file);
    }
  }
  return { patchParts, files };
}

function getFingerprint(patchParts) {
  const joined = patchParts.join('\n');
  if (!joined) return null;
  return createHash('sha1').update(joined).digest('hex').slice(0, 12);
}

function readState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function writeState(state) {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function parseVersion(version) {
  const m = String(version || '').match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
  };
}

function bumpVersion(version, level) {
  const parsed = parseVersion(version);
  if (!parsed) throw new Error(`Invalid semver: ${version}`);
  const next = { ...parsed };
  if (level === 'major') {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  } else if (level === 'minor') {
    next.minor += 1;
    next.patch = 0;
  } else {
    next.patch += 1;
  }
  return `${next.major}.${next.minor}.${next.patch}`;
}

function classifyBumpLevel(stagedFiles) {
  const meaningful = stagedFiles.filter(isMeaningfulCodeFile);
  if (meaningful.length === 0) return null;

  const manifestPatch = stagedFiles.includes('manifest.json')
    ? runGit(['diff', '--cached', '--no-color', '--', 'manifest.json'])
    : '';

  if (/^[+-]\s*"manifest_version"\s*:/m.test(manifestPatch)) {
    return 'major';
  }

  const hasMinorSignals = meaningful.some((file) =>
    file === 'background.js' ||
    file === 'content.js' ||
    file === 'manifest.json' ||
    file.startsWith('app/src/popup/') ||
    file.startsWith('_locales/') ||
    file.startsWith('app/src/components/ui/') ||
    file === 'app/src/index.css' ||
    file.startsWith('app/src/lib/')
  );

  if (hasMinorSignals) return 'minor';
  return 'patch';
}

function mapModules(stagedFiles) {
  const modules = new Set();
  for (const file of stagedFiles) {
    if (file === 'background.js') modules.add('Background');
    else if (file === 'content.js') modules.add('Content Script');
    else if (file === 'manifest.json') modules.add('Manifest/Permissions');
    else if (file.startsWith('app/src/popup/')) modules.add('Popup UI');
    else if (file.startsWith('app/src/components/ui/') || file === 'app/src/index.css') modules.add('UI Components');
    else if (file.startsWith('_locales/')) modules.add('i18n');
    else if (file.startsWith('scripts/')) modules.add('Tooling');
    else if (isMeaningfulCodeFile(file)) modules.add('Core');
  }
  if (modules.size === 0) modules.add('Core');
  return [...modules];
}

function formatNow() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function shortenFiles(files, max = 6) {
  const uniq = [...new Set(files)];
  const head = uniq.slice(0, max).map((file) => `\`${file}\``);
  if (uniq.length > max) head.push(`+${uniq.length - max}`);
  return head.join(', ');
}

function ensureReadmeSection(readme) {
  if (readme.includes(README_MARKER_START) && readme.includes(README_MARKER_END)) {
    return readme;
  }
  const block = [
    README_SECTION_TITLE,
    '',
    README_MARKER_START,
    README_MARKER_END,
    '',
    '---',
    '',
  ].join('\n');

  const idx = readme.indexOf(README_INSERT_BEFORE);
  if (idx >= 0) {
    return readme.slice(0, idx) + block + readme.slice(idx);
  }
  return readme + '\n\n' + block;
}

function updateReadmeEntry(summaryFiles, bumpLevel, nextVersion, fingerprint) {
  if (!existsSync(README_PATH)) return false;
  let readme = readFileSync(README_PATH, 'utf8');
  readme = ensureReadmeSection(readme);

  const start = readme.indexOf(README_MARKER_START);
  const end = readme.indexOf(README_MARKER_END, start);
  if (start < 0 || end < 0 || end <= start) return false;

  const before = readme.slice(0, start + README_MARKER_START.length);
  const middleRaw = readme.slice(start + README_MARKER_START.length, end).trim();
  const after = readme.slice(end);
  const existingLines = middleRaw
    ? middleRaw.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];

  if (existingLines.some((line) => line.includes(`auto:${fingerprint}`))) {
    return false;
  }

  const modules = mapModules(summaryFiles).join(' / ');
  const filesText = shortenFiles(summaryFiles.filter(isMeaningfulCodeFile));
  const levelText = bumpLevel.toUpperCase();
  const entry = `- ${formatNow()} | v${nextVersion} (${levelText}) | ${modules} | ${filesText} <!-- auto:${fingerprint} -->`;
  const nextLines = [entry, ...existingLines].slice(0, MAX_README_ENTRIES);

  const updated = `${before}\n${nextLines.join('\n')}\n${after}`;
  if (updated === readme) return false;
  writeFileSync(README_PATH, updated, 'utf8');
  return true;
}

function writeVersionFiles(nextVersion) {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
  const appPkg = JSON.parse(readFileSync(APP_PKG_PATH, 'utf8'));

  manifest.version = nextVersion;
  pkg.version = nextVersion;
  appPkg.version = nextVersion;

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  writeFileSync(APP_PKG_PATH, JSON.stringify(appPkg, null, 2) + '\n', 'utf8');
}

function main() {
  const head = runGit(['rev-parse', 'HEAD']);
  const stagedFiles = getStagedFiles();

  const meaningfulStaged = stagedFiles.filter(isMeaningfulCodeFile);
  if (meaningfulStaged.length === 0) {
    console.log('[auto-meta] no meaningful code changes, skip');
    return;
  }

  const meaningfulDiff = collectMeaningfulDiff(stagedFiles);
  const fingerprint = getFingerprint(meaningfulDiff.patchParts);
  if (!fingerprint) {
    console.log('[auto-meta] no meaningful diff fingerprint, skip');
    return;
  }

  const state = readState();
  if (state && state.head === head && state.fingerprint === fingerprint) {
    console.log('[auto-meta] already processed for this staged change set');
    return;
  }

  const bumpLevel = classifyBumpLevel(stagedFiles);
  if (!bumpLevel) {
    console.log('[auto-meta] bump level not applicable, skip');
    return;
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const currentVersion = manifest.version;
  const nextVersion = process.env.FIXED_VERSION || bumpVersion(currentVersion, bumpLevel);

  writeVersionFiles(nextVersion);
  const readmeUpdated = updateReadmeEntry(meaningfulDiff.files, bumpLevel, nextVersion, fingerprint);

  writeState({
    head,
    fingerprint,
    bumpLevel,
    fromVersion: currentVersion,
    toVersion: nextVersion,
    updatedAt: new Date().toISOString(),
  });

  console.log(
    `[auto-meta] version ${currentVersion} -> ${nextVersion} (${bumpLevel})` +
    (readmeUpdated ? ' + README updated' : '')
  );
}

main();
