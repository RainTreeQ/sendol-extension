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
      if (!debug) return;
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

// ── Safe Element Operations ──

/**
 * 创建元素的安全引用包装器
 * 防止 await 期间元素被 React/Vue 替换导致的竞态条件
 */
export function createSafeElementRef(el) {
  if (!el) return null;

  // 保存元素的"指纹"用于后续验证
  const fingerprint = {
    tagName: el.tagName,
    id: el.id,
    className: el.className,
    selector: generateSelector(el),
    timestamp: Date.now()
  };

  return {
    original: el,
    fingerprint,

    // 验证元素是否仍然是同一个（未被替换）
    isValid() {
      const node = this.original;
      if (!node || !node.isConnected) return false;
      if (node.tagName !== this.fingerprint.tagName) return false;
      if (node.id !== this.fingerprint.id) return false;
      return true;
    },

    // 安全地执行操作
    async safeOperate(operation) {
      if (!this.isValid()) {
        const recovered = document.querySelector(this.fingerprint.selector);
        if (recovered && recovered.isConnected) {
          this.original = recovered;
          this.fingerprint.timestamp = Date.now();
        } else {
          throw new Error('Element no longer valid and cannot be recovered');
        }
      }
      return operation(this.original);
    }
  };
}

function generateSelector(el) {
  if (el.id) return `#${CSS.escape(el.id)}`;
  if (el.className) {
    const classes = el.className.toString().split(/\s+/).filter(c => c && !c.match(/^\d/));
    if (classes.length > 0) {
      return `${el.tagName.toLowerCase()}.${classes.map(c => CSS.escape(c)).join('.')}`;
    }
  }
  const attrs = ['contenteditable', 'role', 'data-testid'];
  for (const attr of attrs) {
    const val = el.getAttribute(attr);
    if (val) return `${el.tagName.toLowerCase()}[${attr}="${CSS.escape(val)}"]`;
  }
  return el.tagName.toLowerCase();
}

export async function withRetry(operation, options = {}) {
  const maxRetries = options.maxRetries || 2;
  const delay = options.delay || 50;
  let lastError = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (i < maxRetries) {
        await sleep(delay * (i + 1));
      }
    }
  }
  throw lastError;
}

// ── Operation Lock ──

class OperationLock {
  constructor() {
    this.currentOperation = null;
  }

  async acquire(operationId, operation, timeout = 30000) {
    while (this.currentOperation) {
      if (this.currentOperation.id === operationId) {
        return this.currentOperation.promise;
      }
      await this.currentOperation.promise.catch(() => {});
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation ${operationId} timed out`)), timeout);
    });

    const operationPromise = (async () => {
      try {
        return await operation();
      } finally {
        this.currentOperation = null;
      }
    })();

    this.currentOperation = {
      id: operationId,
      promise: operationPromise,
      startTime: Date.now()
    };

    try {
      return await Promise.race([operationPromise, timeoutPromise]);
    } catch (err) {
      this.currentOperation = null;
      throw err;
    }
  }

  isBusy() {
    return this.currentOperation !== null;
  }
}

export const globalOperationLock = new OperationLock();

export async function withInjectionLock(platformId, operation, timeout = 30000) {
  const lockId = `inject:${platformId}:${Date.now()}`;
  return globalOperationLock.acquire(lockId, operation, timeout);
}

// ── Clipboard Permissions ──

export async function checkClipboardPermission() {
  try {
    if (!navigator.permissions || !navigator.clipboard) {
      return { granted: false, reason: 'API not available' };
    }

    const result = await navigator.permissions.query({ name: 'clipboard-write' });
    return {
      granted: result.state === 'granted',
      state: result.state,
      canRequest: result.state === 'prompt'
    };
  } catch (err) {
    return {
      granted: !!navigator.clipboard?.writeText,
      state: 'unknown',
      error: err.message
    };
  }
}

export async function safeClipboardWrite(text, logger = null) {
  const permission = await checkClipboardPermission();

  if (!permission.granted && permission.canRequest) {
    try {
      await navigator.clipboard.writeText('');
    } catch (err) {
      logger?.debug?.('clipboard-permission-denied');
      return { success: false, reason: 'permission denied' };
    }
  } else if (!permission.granted) {
    logger?.debug?.('clipboard-not-granted', { state: permission.state });
    return { success: false, reason: permission.reason || 'not granted' };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    logger?.debug?.('clipboard-write-error', { error: err.message });
    return { success: false, reason: err.message };
  }
}

// ── Shadow DOM Support ──

/**
 * 递归查询 Shadow DOM 中的元素
 * 现代 Web 组件可能将输入框封装在 Shadow DOM 内
 */
export function deepQuerySelector(selector, root = document, maxDepth = 5) {
  // 首先在当前根节点查询
  const found = root.querySelector(selector);
  if (found) return found;

  // 递归查询 Shadow DOM
  if (maxDepth <= 0) return null;

  const allElements = root.querySelectorAll('*');
  for (const el of allElements) {
    if (el.shadowRoot) {
      const shadowFound = deepQuerySelector(selector, el.shadowRoot, maxDepth - 1);
      if (shadowFound) return shadowFound;
    }
  }

  return null;
}

/**
 * 递归查询所有匹配 Shadow DOM 中的元素
 */
export function deepQuerySelectorAll(selector, root = document, maxDepth = 5) {
  const results = [];

  // 当前根节点的匹配
  results.push(...root.querySelectorAll(selector));

  // 递归查询 Shadow DOM
  if (maxDepth <= 0) return results;

  const allElements = root.querySelectorAll('*');
  for (const el of allElements) {
    if (el.shadowRoot) {
      results.push(...deepQuerySelectorAll(selector, el.shadowRoot, maxDepth - 1));
    }
  }

  return results;
}

/**
 * 支持 Shadow DOM 的最近祖先查询
 */
export function deepClosest(el, selector, maxDepth = 5) {
  if (!el) return null;

  // 标准 closest
  const found = el.closest(selector);
  if (found) return found;

  // 检查 Shadow DOM 边界
  let current = el;
  while (current && maxDepth > 0) {
    const host = current.getRootNode()?.host;
    if (!host) break;

    const hostFound = host.closest(selector);
    if (hostFound) return hostFound;

    current = host;
    maxDepth--;
  }

  return null;
}
