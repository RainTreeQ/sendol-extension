export function createChatgptAdapter(deps) {
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
    name: 'ChatGPT',
    findInput: async () => {
      return await findInputForPlatform('chatgpt') || waitFor(() => findInputHeuristically());
    },
    async inject(el, text, options) {
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        setReactValue(el, text);
        return { strategy: 'chatgpt-react-value', fallbackUsed: false };
      }

      const isLexical = el.hasAttribute('data-lexical-editor') || el.closest('[data-lexical-editor]');
      if (isLexical) {
        el.focus();
        await sleep(30);
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        await sleep(16);

        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        el.dispatchEvent(new ClipboardEvent('paste', {
          clipboardData: dt,
          bubbles: true,
          cancelable: true,
          composed: true
        }));
        await sleep(100);
        const actual = normalizeText(getContent(el));
        const expected = normalizeText(text);
        // 改进验证：检查完整内容或至少90%匹配
        if (actual && (actual === expected || 
            actual.includes(expected) || 
            expected.includes(actual) ||
            (actual.length >= expected.length * 0.9 && actual.length <= expected.length * 1.1))) {
          return { strategy: 'chatgpt-lexical-paste', fallbackUsed: false };
        }

        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        await sleep(8);
        document.execCommand('insertText', false, text);
        await sleep(100);
        const actual2 = normalizeText(getContent(el));
        // 改进验证：检查完整内容或至少90%匹配
        if (actual2 && (actual2 === expected || 
            actual2.includes(expected) || 
            expected.includes(actual2) ||
            (actual2.length >= expected.length * 0.9 && actual2.length <= expected.length * 1.1))) {
          return { strategy: 'chatgpt-lexical-insertText', fallbackUsed: true };
        }

        return { strategy: 'chatgpt-lexical-best-effort', fallbackUsed: true };
      }

      return setContentEditable(el, text, options);
    },
    async send(el, options) {
      const logger = options?.logger;
      const expected = normalizeText(options?.text || '');

      // 防御性等待：确保Lexical状态同步完成
      // 初次加载时，Lexical可能需要额外时间将DOM内容同步到内部状态
      let before = normalizeText(getContent(el));
      if (expected && expected.length > 0) {
        let syncChecks = 0;
        // 如果内容为空，短暂等待让Lexical完成同步（最多等300ms）
        while (syncChecks < 3 && before.length === 0) {
          await sleep(100);
          before = normalizeText(getContent(el));
          syncChecks++;
        }
        logger?.debug?.('chatgpt-send-start', { hasContent: before.length > 0, contentLen: before.length, expectedLen: expected.length, syncChecks });
      } else {
        logger?.debug?.('chatgpt-send-start', { hasContent: before.length > 0, contentLen: before.length, expectedLen: 0 });
      }

      // 扩展搜索范围：先在输入框附近找，再用选择器
      const findNearbySendBtn = () => {
        if (!el?.getBoundingClientRect) return null;
        const rect = el.getBoundingClientRect();
        const nodes = document.querySelectorAll('button:not([disabled]), [role="button"]');
        let best = null;
        let bestScore = -Infinity;
        for (const node of nodes) {
          if (!node || node.disabled || node.getAttribute('aria-disabled') === 'true') continue;
          const hint = `${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''} ${(node.textContent || '').trim()}`.toLowerCase();
          if (hint.includes('login') || hint.includes('log in') || hint.includes('search') || hint.includes('upload') || hint.includes('attach')) continue;
          const nr = node.getBoundingClientRect();
          // 按钮应该在输入框的右侧或下方
          const dx = nr.left + nr.width / 2 - (rect.left + rect.width);
          const dy = nr.top + nr.height / 2 - (rect.top + rect.height / 2);
          if (dx < -50 || dx > 400 || Math.abs(dy) > 200) continue;
          const semanticScore = hint.includes('send') || hint.includes('submit') || hint.includes('发送') || hint.includes('提交') ? 50 : 0;
          const svgScore = node.querySelector('svg') ? 20 : 0;
          const score = semanticScore + svgScore - Math.abs(dx) * 0.2 - Math.abs(dy) * 0.1;
          if (score > bestScore) {
            bestScore = score;
            best = node;
          }
        }
        return best;
      };

      const selectorCandidate = await findSendBtnForPlatform('chatgpt');
      const isReady = (b) => b && !b.disabled && b.getAttribute('aria-disabled') !== 'true';
      const btn = await waitFor(
        () => {
          const b = selectorCandidate || findSendBtnHeuristically(el) || findNearbySendBtn();
          return isReady(b) ? b : null;
        },
        8000, 100
      );

      if (btn) {
        btn.click();
        await sleep(400);
        const after = normalizeText(getContent(el));
        // 发送成功：内容应该变短或被清空
        if (before.length > 0 && after.length < before.length) {
          logger?.debug?.('chatgpt-send-click-success', { beforeLen: before.length, afterLen: after.length });
          return true;
        }
        // 如果原本就没有内容，无法验证，假设成功
        if (before.length === 0 && after.length === 0) {
          logger?.debug?.('chatgpt-send-click-assumed');
          return true;
        }
        logger?.debug?.('chatgpt-send-click-no-change', { beforeLen: before.length, afterLen: after.length });
      } else {
        logger?.debug?.('chatgpt-send-btn-not-found');
      }

      // Fallback: 尝试键盘发送
      const target = el || document.activeElement;
      if (target) {
        target.focus();
        const beforeKey = normalizeText(getContent(target)).length;
        pressEnterOn(target);
        await sleep(400);
        const afterKey = normalizeText(getContent(target)).length;
        if (beforeKey > 0 && afterKey < beforeKey) {
          logger?.debug?.('chatgpt-send-keyboard-success', { beforeLen: beforeKey, afterLen: afterKey });
          return true;
        }
      } else {
        pressEnterOn(null);
        await sleep(400);
      }

      // Final fallback: 尝试 Ctrl+Enter
      if (target) {
        target.focus();
        target.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
          composed: true,
          ctrlKey: true
        }));
        await sleep(300);
        const afterCtrl = normalizeText(getContent(target)).length;
        if (before.length > 0 && afterCtrl < before.length) {
          logger?.debug?.('chatgpt-send-ctrl-enter-success');
          return true;
        }
      }

      logger?.debug?.('chatgpt-send-failed');
      return false;
    }
  };
}
