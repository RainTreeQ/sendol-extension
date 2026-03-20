export function createGrokAdapter(deps) {
  const {
    findInputForPlatform,
    findInputHeuristically,
    waitFor,
    setReactValue,
    setContentEditable,
    findSendBtnForPlatform,
    findSendBtnHeuristically,
    pressEnterOn,
    sleep,
    normalizeText,
    getContent
  } = deps;

  return {
    name: 'Grok',
    findInput: async () => {
      const direct = document.querySelector('textarea');
      if (direct) return direct;
      const bySelectors = await findInputForPlatform('grok');
      if (bySelectors) return bySelectors;
      return waitFor(() => findInputHeuristically(), 5000, 60);
    },

    async inject(el, text, options) {
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        setReactValue(el, text);
        return { strategy: 'grok-react-value', fallbackUsed: false };
      }
      return setContentEditable(el, text, options);
    },

    async send(el, options) {
      const expected = normalizeText(options?.text || '');

      // 1. 优先使用选择器和启发式查找（最稳定）
      let btn = await findSendBtnForPlatform('grok')
        || await waitFor(() => findSendBtnHeuristically(el), 3000, 40);

      // 2. 尝试语义属性查找（不依赖布局）
      if (!btn) {
        btn = await waitFor(() => {
          const selectors = [
            '[data-testid="send-button"]',
            '[data-testid*="send"]',
            '[aria-label*="Send" i]',
            '[aria-label*="发送" i]',
            '[aria-label*="submit" i]',
            '[title*="Send" i]',
            'button[class*="send" i]'
          ];
          for (const sel of selectors) {
            const found = document.querySelector(sel);
            if (found && !found.disabled && found.getAttribute('aria-disabled') !== 'true') {
              return found;
            }
          }
          return null;
        }, 2000, 40);
      }

      if (btn) {
        if (el?.tagName === 'TEXTAREA' && expected) {
          setReactValue(el, expected);
          await sleep(60);
        }
        btn.click();
        return;
      }

      // 3. 距离算法作为最后的 fallback
      const findNearbySendBtn = () => {
        if (!el?.getBoundingClientRect) return null;
        const rect = el.getBoundingClientRect();
        const nodes = document.querySelectorAll('button,[role="button"]');
        let best = null;
        let bestScore = -Infinity;
        for (const node of nodes) {
          if (!node || node.disabled || node.getAttribute('aria-disabled') === 'true') continue;
          const hint = `${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''} ${(node.textContent || '').trim()}`.toLowerCase();
          if (hint.includes('login') || hint.includes('log in') || hint.includes('search') || hint.includes('upload')) continue;
          const nr = node.getBoundingClientRect();
          const dx = (nr.left + nr.width / 2) - (rect.left + rect.width);
          const dy = (nr.top + nr.height / 2) - (rect.top + rect.height / 2);
          if (dx < -20 || dx > 320 || Math.abs(dy) > 140) continue;
          const semanticScore = (hint.includes('send') || hint.includes('submit') || hint.includes('提交')) ? 50 : 0;
          const svgScore = node.querySelector('svg') ? 20 : 0;
          const score = semanticScore + svgScore - Math.abs(dx) * 0.4 - Math.abs(dy) * 0.3;
          if (score > bestScore) {
            bestScore = score;
            best = node;
          }
        }
        return best;
      };
      const nearbyBtn = findNearbySendBtn();
      if (nearbyBtn) {
        nearbyBtn.click();
        return;
      }

      const target = el || document.activeElement;
      if (!target) { pressEnterOn(null); return; }
      let activeTarget = target;
      if (!activeTarget.isConnected) {
        const refreshed = document.querySelector('textarea') || document.activeElement;
        if (refreshed) activeTarget = refreshed;
      }

      if (activeTarget.tagName === 'TEXTAREA' && expected) {
        setReactValue(activeTarget, expected);
        await sleep(60);
      }

      const form = activeTarget.closest?.('form');
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit();
        try {
          await sleep(180);
          const afterSubmitLen = normalizeText(getContent(activeTarget)).length;
          if (!expected || afterSubmitLen < expected.length) return;
        } catch (err) {
        }
      }

      activeTarget.focus();
      pressEnterOn(activeTarget);
      try {
        await sleep(180);
        const afterEnterLen = normalizeText(getContent(activeTarget)).length;
        if (!expected || afterEnterLen < expected.length) return;
      } catch (err) {
      }

      // Fallback for editors requiring modifier key to submit.
      const keyOpts = {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
        composed: true,
        ctrlKey: true
      };
      activeTarget.dispatchEvent(new KeyboardEvent('keydown', keyOpts));
      activeTarget.dispatchEvent(new KeyboardEvent('keyup', keyOpts));
      try {
        await sleep(180);
        const afterCtrlEnterLen = normalizeText(getContent(activeTarget)).length;
        if (!expected || afterCtrlEnterLen < expected.length) return;
      } catch (err) {
      }

      return false;
    }
  };
}
