import { deepQuerySelectorAll } from './core/utils.js';

export function findInputHeuristically() {
  // 支持 Shadow DOM 的查询
  const candidates = [
    ...deepQuerySelectorAll('div[data-slate-editor="true"][contenteditable="true"]'),
    ...deepQuerySelectorAll('div[contenteditable="true"][role="textbox"]'),
    ...deepQuerySelectorAll('div[contenteditable="true"]'),
    ...deepQuerySelectorAll('textarea[placeholder]'),
    ...deepQuerySelectorAll('textarea')
  ];

  if (!candidates.length) return null;

  const unique = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    unique.push(candidate);
  }

  const isVisible = (node) => {
    if (!node) return false;
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = node.getBoundingClientRect();
    return rect.width > 120 && rect.height > 20 && rect.bottom > 0;
  };

  const hasSendButtonNearby = (node) => {
    const root = node.closest('form') || node.closest('section') || node.parentElement?.parentElement || document;
    if (!root?.querySelectorAll) return false;
    const buttons = root.querySelectorAll('button:not([disabled]), [role="button"]');
    for (const btn of buttons) {
      if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') continue;
      const hint = `${btn.getAttribute('aria-label') || ''} ${btn.getAttribute('title') || ''} ${(btn.textContent || '').trim()}`.toLowerCase();
      if (hint.includes('发送') || hint.includes('send') || hint.includes('提交') || hint.includes('submit')) return true;
    }
    return false;
  };

  const scoreInput = (node) => {
    if (!node || !isVisible(node)) return -1;
    if (node.getAttribute('contenteditable') !== 'true' && node.tagName !== 'TEXTAREA') return -1;
    if (node.getAttribute('aria-disabled') === 'true') return -1;

    const rect = node.getBoundingClientRect();
    const role = (node.getAttribute('role') || '').toLowerCase();
    const hasSlate = node.getAttribute('data-slate-editor') === 'true';

    let score = 0;
    if (hasSlate) score += 8;
    if (role === 'textbox') score += 4;
    if (node.tagName === 'TEXTAREA') score += 3;
    if (hasSendButtonNearby(node)) score += 5;
    if (rect.top > 0 && rect.top < window.innerHeight) score += 2;
    if (rect.bottom > window.innerHeight * 0.45) score += 2;
    score += Math.min(4, Math.round(rect.width / 300));
    return score;
  };

  let best = null;
  let bestScore = -1;
  for (const candidate of unique) {
    const score = scoreInput(candidate);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return bestScore >= 0 ? best : null;
}

export function findSendBtnHeuristically(el) {
  const container = el?.closest('form') || el?.closest('section') || el?.parentElement?.parentElement || document;
  const roots = [container, document].filter(Boolean);

  for (const root of roots) {
    if (!root?.querySelectorAll) continue;
    // 使用 deepQuerySelectorAll 支持 Shadow DOM
    const nodes = root === document
      ? deepQuerySelectorAll('button:not([disabled]), [role="button"]')
      : root.querySelectorAll('button:not([disabled]), [role="button"]');
    for (const node of nodes) {
      if (node.disabled || node.getAttribute('aria-disabled') === 'true') continue;
      const klass = node.className?.toString() || '';
      if (klass.includes('is-disabled') || klass.includes('disabled')) continue;

      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const hint = `${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''} ${node.getAttribute('data-testid') || ''} ${(node.textContent || '').trim()}`.toLowerCase();
      if (hint.includes('登录') || hint.includes('log in') || hint.includes('上传') || hint.includes('attach') || hint.includes('搜索') || hint.includes('search')) continue;
      
      if (hint.includes('发送') || hint.includes('send') || hint.includes('提交') || hint.includes('submit')) {
        return node;
      }
    }
  }
  return null;
}
