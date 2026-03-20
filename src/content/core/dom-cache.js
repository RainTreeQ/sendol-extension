// Sendol - DOM Node Cache
// Caches frequently-accessed DOM nodes (input, send button) to avoid repeated querySelector.
// Entries are invalidated when the node is disconnected from the DOM or on SPA navigation.

const cache = new Map();
let lastUrl = location.href;

// 缓存 TTL: 30秒 - 防止高频使用下缓存过期元素
const CACHE_TTL = 30000;
// 最大缓存条目数 - 防止内存泄漏
const MAX_CACHE_SIZE = 20;

function isElementValid(node) {
  if (!node || !(node instanceof HTMLElement)) return false;
  if (!node.isConnected) return false;

  // 检查元素是否可见
  try {
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  } catch (_) {
    // 如果无法获取样式，保守地视为无效
    return false;
  }

  return true;
}

function cleanupOldestEntries() {
  if (cache.size <= MAX_CACHE_SIZE) return;

  // 按 cachedAt 排序，删除最旧的条目
  const entries = [...cache.entries()];
  entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);

  const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
  for (const [key] of toDelete) {
    cache.delete(key);
  }
}

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  // 检查 TTL
  if (Date.now() - entry.cachedAt > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  // 检查元素是否仍然有效
  if (!isElementValid(entry.node)) {
    cache.delete(key);
    return null;
  }

  return entry.node;
}

export function setCache(key, node) {
  if (!node || !isElementValid(node)) return;

  cache.set(key, { node, cachedAt: Date.now() });
  cleanupOldestEntries();
}

export function invalidate(key) {
  if (key) cache.delete(key);
  else cache.clear();
}

// Detect SPA navigation and invalidate all caches
export function checkNavigation() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    cache.clear();
    return true;
  }
  return false;
}
