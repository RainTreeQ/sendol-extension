// Sendol - Content Script Utilities

export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const now = () => Date.now();

export function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function getContent(el) {
  if (!el) return '';
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    return (el.value || '').trim();
  }
  return (el.innerText || el.textContent || '').trim();
}

export function contentLooksInjected(el, text) {
  const expected = normalizeText(text);
  const actual = normalizeText(getContent(el));
  if (!expected) return actual.length === 0;
  if (!actual) return false;
  if (actual === expected) return true;
  if (expected.length <= 8) return false;
  if (actual.length < expected.length * 0.9) return false;
  if (actual.length > expected.length * 1.35) return false;
  return actual.includes(expected.slice(0, Math.min(expected.length, 24)));
}

/** Stricter check: require nearly full text (avoid false success on partial insert). */
export function contentLooksInjectedStrict(el, text) {
  const expected = normalizeText(text);
  const actual = normalizeText(getContent(el));
  if (!expected) return actual.length === 0;
  if (!actual) return false;
  if (actual === expected) return true;
  if (expected.length <= 8) return false;
  if (actual.length < expected.length * 0.95) return false;
  if (actual.length > expected.length * 1.2) return false;
  return actual.includes(expected) || expected.includes(actual);
}

export async function waitFor(fn, timeout = 6000, interval = 50) {
  const deadline = now() + timeout;
  while (now() < deadline) {
    try {
      const result = fn();
      if (result) return result;
    } catch (err) {}
    await sleep(interval);
  }
  return null;
}

export async function waitForCheck(check, timeout = 280, interval = 25) {
  const deadline = now() + timeout;
  while (now() < deadline) {
    try {
      if (check()) return true;
    } catch (err) {}
    await sleep(interval);
  }
  return false;
}

export async function verifyContent(el, text, timeout = 280, interval = 25) {
  return waitForCheck(() => contentLooksInjected(el, text), timeout, interval);
}

export async function verifyContentStrict(el, text, timeout = 200, interval = 25) {
  return waitForCheck(() => contentLooksInjectedStrict(el, text), timeout, interval);
}

export function isNodeDisabled(node) {
  if (!node) return true;
  if (node.disabled === true) return true;
  const ariaDisabled = String(node.getAttribute?.('aria-disabled') || '').toLowerCase();
  if (ariaDisabled === 'true') return true;
  const className = node.className?.toString().toLowerCase() || '';
  if (className.includes('disabled') || className.includes('is-disabled')) return true;
  return false;
}

export function createLogger(requestId, debug) {
  const prefix = `[AIB][content][${requestId}]`;
  return {
    info(event, data = undefined) {
      if (data === undefined) console.log(`${prefix} ${event}`);
      else console.log(`${prefix} ${event}`, data);
    },
    error(event, data = undefined) {
      if (data === undefined) console.error(`${prefix} ${event}`);
      else console.error(`${prefix} ${event}`, data);
    },
    debug(event, data = undefined) {
      if (!debug) return;
      if (data === undefined) console.log(`${prefix} ${event}`);
      else console.log(`${prefix} ${event}`, data);
    }
  };
}

// ── Enter key simulation ──
export function pressEnterOn(el) {
  const target = el || document.activeElement;
  if (!target) return;
  const opts = {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
    composed: true
  };
  target.dispatchEvent(new KeyboardEvent('keydown', opts));
  target.dispatchEvent(new KeyboardEvent('keypress', opts));
  target.dispatchEvent(new KeyboardEvent('keyup', opts));
}

// ── Risk / verification detection ──
export function getHighRiskPageReason() {
  const title = normalizeText(document.title || '').toLowerCase();
  const urlHint = `${window.location.pathname || ''} ${window.location.search || ''}`.toLowerCase();
  const bodyText = normalizeText((document.body?.innerText || '').slice(0, 7000)).toLowerCase();
  const text = `${title} ${urlHint} ${bodyText}`;
  if (includesAny(text, [
    'captcha',
    'verify you are human',
    'security check',
    'waf',
    'risk control',
    '人机验证',
    '安全验证',
    '验证码',
    '滑块验证',
    '请先完成验证'
  ])) {
    return '检测到风控/验证页面';
  }
  return '';
}
