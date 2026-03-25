export function createInjectionTools(deps) {
  const {
    sleep,
    waitForCheck,
    normalizeText,
    getContent
  } = deps;

  async function verifyContent(el, text, timeout = 120, interval = 20) {
    const expected = normalizeText(text);
    const check = () => {
      const actual = normalizeText(getContent(el));
      if (!expected) return actual.length === 0;
      if (!actual) return false;
      if (actual === expected) return true;
      if (expected.length <= 8) return false;
      if (actual.length < expected.length * 0.9) return false;
      if (actual.length > expected.length * 1.35) return false;
      return actual.includes(expected.slice(0, Math.min(expected.length, 24)));
    };
    return waitForCheck(check, timeout, interval);
  }

  async function verifyContentStrict(el, text, timeout = 120, interval = 20) {
    const expected = normalizeText(text);
    const check = () => {
      const actual = normalizeText(getContent(el));
      if (!expected) return actual.length === 0;
      if (!actual) return false;
      if (actual === expected) return true;
      if (expected.length <= 8) return false;
      if (actual.length < expected.length * 0.95) return false;
      if (actual.length > expected.length * 1.2) return false;
      return actual.includes(expected) || expected.includes(actual);
    };
    return waitForCheck(check, timeout, interval);
  }

  function setReactValue(el, value) {
    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    const tracker = el._valueTracker;
    if (tracker) tracker.setValue('');
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return { strategy: 'react-value', fallbackUsed: false };
  }

  // ── Safe Element Operations with Race Condition Protection ──

  /**
   * 验证元素在操作期间是否仍然有效
   * 防止 React/Vue 在 await 期间替换元素导致的竞态条件
   */
  function assertElementValid(el, context = '') {
    if (!el) throw new Error(`${context}: Element is null`);
    if (!el.isConnected) throw new Error(`${context}: Element disconnected from DOM`);
    return true;
  }

  /**
   * 安全的元素操作包装器
   * 在每次 DOM 操作前验证元素有效性
   */
  async function safeElementOperation(el, operation, context = '') {
    assertElementValid(el, context);
    const result = await operation(el);
    assertElementValid(el, `${context}-post`);
    return result;
  }

  async function tryInsertText(el, text) {
    return safeElementOperation(el, async (target) => {
      target.focus();
      await sleep(8);
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      const verified = await verifyContent(target, text);
      if (verified) {
        target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      }
      return verified;
    }, 'tryInsertText');
  }

  async function tryClipboardPaste(el, text) {
    return safeElementOperation(el, async (target) => {
      // 检查剪贴板权限
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API not available');
      }

      await navigator.clipboard.writeText(text);
      target.focus();
      await sleep(8);
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('paste');
      return verifyContent(target, text);
    }, 'tryClipboardPaste');
  }

  async function tryDataTransferPaste(el, text) {
    el.focus();
    await sleep(8);
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    el.dispatchEvent(new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
      cancelable: true
    }));
    return verifyContent(el, text);
  }

  async function tryDirectDom(el, text) {
    el.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = text;
    el.appendChild(p);
    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    return verifyContent(el, text);
  }

  async function trySlateBeforeInput(el, text) {
    el.focus();
    await sleep(10);
    const sel = window.getSelection();
    if (sel && el.childNodes.length > 0) {
      try {
        sel.selectAllChildren(el);
        el.dispatchEvent(new InputEvent('beforeinput', {
          inputType: 'deleteContentBackward',
          bubbles: true,
          cancelable: true
        }));
        await sleep(8);
      } catch (_) {}
    }
    const chunkSize = text.length > 30 ? 3 : 1;
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      el.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: chunk,
        bubbles: true,
        cancelable: true
      }));
      if (i % 30 === 0) await sleep(1);
    }
    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: text, bubbles: true }));
    return verifyContent(el, text);
  }

  async function clearElement(el) {
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
  }

  async function runStrategies(el, strategyList, logger, opts = {}) {
    const skipClear = Boolean(opts.skipClear);
    const maxRetries = opts.maxRetries || 1;

    for (const strategy of strategyList) {
      let attempts = 0;
      let lastError = null;

      while (attempts <= maxRetries) {
        try {
          // 每次尝试前验证元素仍然有效
          if (!el || !el.isConnected) {
            throw new Error('Element disconnected during strategy execution');
          }

          if (await strategy.run()) {
            logger.debug('inject-strategy-success', { strategy: strategy.name, attempt: attempts });
            return { strategy: strategy.name, fallbackUsed: Boolean(strategy.fallbackUsed) || attempts > 0 };
          }

          logger.debug('inject-strategy-miss', { strategy: strategy.name, attempt: attempts });

          // 策略未成功，清理元素准备下一次尝试
          if (!skipClear) {
            try {
              await clearElement(el);
            } catch (clearErr) {
              logger.debug('clear-element-error', { error: clearErr.message });
            }
          }

          attempts++;
          if (attempts <= maxRetries) {
            await sleep(50 * attempts); // 指数退避
          }

        } catch (err) {
          lastError = err;
          logger.debug('inject-strategy-error', { strategy: strategy.name, attempt: attempts, error: err.message });

          // 元素失效，不再重试此策略
          if (err.message.includes('disconnected') || err.message.includes('null')) {
            throw err; // 向上传播，可能需要重新查找元素
          }

          if (!skipClear) {
            try { await clearElement(el); } catch (_) {}
          }

          attempts++;
          if (attempts <= maxRetries) {
            await sleep(50 * attempts);
          }
        }
      }
    }

    throw new Error('输入注入失败');
  }

  async function setContentEditable(el, text, options) {
    const { fastPathEnabled, logger, safeMode } = options;

    if (safeMode) {
      return runStrategies(el, [
        { name: 'insertText-safe', fallbackUsed: false, run: () => tryInsertText(el, text) },
        { name: 'insertText-safe-retry', fallbackUsed: true, run: () => tryInsertText(el, text) }
      ], logger);
    }

    if (fastPathEnabled) {
      return runStrategies(el, [
        { name: 'insertText-fast', fallbackUsed: false, run: () => tryInsertText(el, text) },
        { name: 'clipboard-paste', fallbackUsed: true, run: () => tryClipboardPaste(el, text) },
        { name: 'datatransfer-paste', fallbackUsed: true, run: () => tryDataTransferPaste(el, text) },
        { name: 'direct-dom', fallbackUsed: true, run: () => tryDirectDom(el, text) }
      ], logger);
    }

    return runStrategies(el, [
      { name: 'clipboard-legacy', fallbackUsed: false, run: () => tryClipboardPaste(el, text) },
      { name: 'insertText-legacy', fallbackUsed: true, run: () => tryInsertText(el, text) },
      { name: 'datatransfer-legacy', fallbackUsed: true, run: () => tryDataTransferPaste(el, text) },
      { name: 'direct-dom-legacy', fallbackUsed: true, run: () => tryDirectDom(el, text) }
    ], logger);
  }

  const GEMINI_CHUNK_SIZE = 1200;

  function notifyGeminiFramework(el, text) {
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    const richTextarea = el.closest('rich-textarea');
    if (richTextarea) {
      richTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      richTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function insertTextInChunks(el, text) {
    const len = text.length;
    if (len <= 0) return;
    if (len <= GEMINI_CHUNK_SIZE) {
      document.execCommand('insertText', false, text);
      return;
    }
    for (let i = 0; i < len; i += GEMINI_CHUNK_SIZE) {
      document.execCommand('insertText', false, text.slice(i, i + GEMINI_CHUNK_SIZE));
      await sleep(8);
    }
  }

  async function setGeminiInput(el, text, options) {
    const { logger } = options;

    el.focus();
    await sleep(20);

    // 尝试 Quill API（最快但依赖内部属性）
    try {
      const richTextarea = el.closest('rich-textarea') || el.parentElement;
      const quill = richTextarea?.__quill || el.__quill;

      if (quill) {
        quill.setText('');
        if (text.length <= GEMINI_CHUNK_SIZE) {
          quill.insertText(0, text, 'user');
        } else {
          for (let i = 0; i < text.length; i += GEMINI_CHUNK_SIZE) {
            quill.insertText(i, text.slice(i, i + GEMINI_CHUNK_SIZE), 'user');
            await sleep(8);
          }
        }
        quill.setSelection(text.length, 0);
        notifyGeminiFramework(el, text);
        await sleep(20);
        if (await verifyContentStrict(el, text, 200, 20)) {
          return { strategy: 'gemini-quill', fallbackUsed: false };
        }
        quill.setText('');
      }
    } catch (err) {
      logger?.debug?.('gemini-quill-failed', { error: err?.message });
    }

    // 标准 insertText 策略
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      await insertTextInChunks(el, text);
      if (await verifyContentStrict(el, text, 150, 20)) {
        notifyGeminiFramework(el, text);
        return { strategy: 'gemini-insertText', fallbackUsed: false };
      }
    } catch (err) {
      logger?.debug?.('gemini-insertText-failed', { error: err?.message });
    }

    // 重试一次
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      await insertTextInChunks(el, text);
      if (await verifyContentStrict(el, text, 150, 20)) {
        notifyGeminiFramework(el, text);
        return { strategy: 'gemini-insertText-retry', fallbackUsed: true };
      }
    } catch (err) {
      logger?.debug?.('gemini-insertText-retry-failed', { error: err?.message });
    }

    // 直接 DOM 操作
    try {
      el.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = text;
      el.appendChild(p);
      notifyGeminiFramework(el, text);
      if (await verifyContentStrict(el, text, 150, 20)) {
        return { strategy: 'gemini-direct-dom', fallbackUsed: true };
      }
    } catch (err) {
      logger?.debug?.('gemini-direct-dom-failed', { error: err?.message });
    }

    // 最终回退：标准 contenteditable 策略
    logger?.debug?.('gemini-falling-back-to-standard');
    return setContentEditable(el, text, options);
  }

  async function setYuanbaoInput(el, text, options) {
    const { logger } = options || {};
    el.focus();
    await sleep(16);

    // 尝试 Quill API
    try {
      const quill = el.__quill || el.closest('.ql-container')?.__quill || el.closest('.ql-editor')?.__quill;
      if (quill) {
        quill.setText('');
        quill.insertText(0, text, 'user');
        quill.setSelection(text.length, 0);
        el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        if (await verifyContent(el, text, 150, 20)) {
          return { strategy: 'yuanbao-quill', fallbackUsed: false };
        }
      }
    } catch (err) {
      logger?.debug?.('yuanbao-quill-failed', { error: err?.message });
    }

    // 回退到标准策略
    return setContentEditable(el, text, options);
  }

  // 通义千问任务助理关键词（支持多语言）
  const QIANWEN_TASK_ASSISTANT_KEYWORDS = ['任务助理', 'Task Assistant', '任务助手', 'TaskAssistant', '智能助手', 'AI Assistant'];

  async function closeQianwenTaskAssistant() {
    const allTags = document.querySelectorAll('[class*="tagBtn"][class*="selected"], [class*="tag"][aria-selected="true"]');
    let tag = null;
    for (const node of allTags) {
      const text = node.textContent || '';
      if (QIANWEN_TASK_ASSISTANT_KEYWORDS.some(kw => text.includes(kw))) {
        tag = node;
        break;
      }
    }
    if (!tag) return;
    const closeIcon = tag.querySelector('[data-icon-type*="close"]') || tag.querySelector('svg');
    const target = closeIcon || tag;
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    await sleep(80);
  }

  async function setQianwenInput(el, text, options) {
    const { logger } = options || {};
    el.focus();
    await sleep(16);

    // WARNING: React Fiber 内部 API，可能在 React 版本更新后失效
    // 仅作为优化路径，必须有可靠的 fallback
    const tryReactFiberSlate = async () => {
      try {
        const slateNode = el.closest('[data-slate-editor="true"]') || el;
        const fiberKey = Object.keys(slateNode).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
        if (!fiberKey) return false;

        let fiber = slateNode[fiberKey];
        for (let i = 0; i < 15 && fiber; i++) {
          const editor = fiber.memoizedProps?.editor || fiber.stateNode?.editor;
          if (editor && typeof editor.insertText === 'function' && typeof editor.deleteFragment === 'function') {
            try { editor.deleteFragment(); } catch (_) {}
            editor.insertText(text);
            el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
            await sleep(60);
            const actual = normalizeText(getContent(el));
            const expected = normalizeText(text);
            if (actual && (actual === expected || actual.includes(expected.slice(0, Math.min(expected.length, 20))))) {
              return true;
            }
          }
          fiber = fiber.return;
        }
        return false;
      } catch (err) {
        logger?.debug?.('qianwen-fiber-failed', { error: err?.message });
        return false;
      }
    };

    // 优先尝试 Fiber API（最快），失败则使用标准策略
    if (await tryReactFiberSlate()) {
      return { strategy: 'qianwen-slate-api', fallbackUsed: false };
    }

    // 标准策略序列（稳定可靠）
    const tryQianwenInsertTextStrict = async () => {
      el.focus();
      await sleep(8);
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      return verifyContentStrict(el, text, 220, 20);
    };

    return runStrategies(el, [
      { name: 'qw-insertText-strict', fallbackUsed: false, run: tryQianwenInsertTextStrict },
      { name: 'qw-insertText', fallbackUsed: true, run: () => tryInsertText(el, text) },
      { name: 'qw-datatransfer', fallbackUsed: true, run: () => tryDataTransferPaste(el, text) },
      { name: 'qw-clipboard', fallbackUsed: true, run: () => tryClipboardPaste(el, text) },
      { name: 'qw-direct-dom', fallbackUsed: true, run: () => tryDirectDom(el, text) }
    ], logger, { skipClear: true });
  }

  const qianwenInject = async (el, text, options) => {
    await closeQianwenTaskAssistant();
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return setReactValue(el, text);
    return setQianwenInput(el, text, options);
  };

  // 随机延迟工具函数 - 模拟人类打字的不确定性
  const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const kimiInject = async (el, text, options) => {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return setReactValue(el, text);
    const { logger } = options || {};

    // 策略1: 模拟人类输入 - 使用更自然的输入模式
    const tryKimiHumanLikeInput = async () => {
      el.focus();
      // 人类点击后的反应时间：80-200ms
      await sleep(randomDelay(80, 200));

      // 清除现有内容 - 使用 selectAll + delete 模拟人类行为
      document.execCommand('selectAll', false, null);
      await sleep(randomDelay(30, 80));
      document.execCommand('delete', false, null);
      await sleep(randomDelay(50, 120));

      // 分段输入，模拟人类打字节奏
      // 人类打字速度：平均每秒 3-5 个字符（中文）
      const chunkSize = text.length > 50 ? randomDelay(3, 8) : 1;
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        document.execCommand('insertText', false, chunk);
        
        // 随机间隔：30-150ms 模拟人类打字间隔
        // 偶尔停顿更久（模拟思考）
        const thinkPause = Math.random() < 0.05 ? randomDelay(200, 500) : 0;
        await sleep(randomDelay(30, 120) + thinkPause);
      }

      // 输入完成后短暂停顿
      await sleep(randomDelay(50, 150));

      // 触发 input 事件（但不要太频繁）
      el.dispatchEvent(new InputEvent('input', {
        inputType: 'insertText',
        data: text,
        bubbles: true
      }));

      return verifyContent(el, text, 400, 30);
    };

    // 策略2: Slate 编辑器专用 - 减少事件频率，更像人类
    const tryKimiSlateInput = async () => {
      const isSlate = el.hasAttribute('data-slate-editor') || el.closest('[data-slate-editor="true"]');
      if (!isSlate) return false;

      el.focus();
      await sleep(randomDelay(100, 250));

      // 清除现有内容
      const sel = window.getSelection();
      if (sel && el.childNodes.length > 0) {
        try {
          sel.selectAllChildren(el);
          await sleep(randomDelay(30, 80));
          el.dispatchEvent(new InputEvent('beforeinput', {
            inputType: 'deleteContentBackward',
            bubbles: true,
            cancelable: true
          }));
          await sleep(randomDelay(50, 100));
        } catch (_) {}
      }

      // 分段输入，更大的间隔，更像人类
      const chunkSize = text.length > 100 ? randomDelay(8, 15) : randomDelay(2, 5);
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        el.dispatchEvent(new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: chunk,
          bubbles: true,
          cancelable: true
        }));
        el.dispatchEvent(new InputEvent('input', {
          inputType: 'insertText',
          data: chunk,
          bubbles: true
        }));
        // 人类不会每100字符就休息，而是随机间隔
        await sleep(randomDelay(40, 180));
      }

      // 触发最终事件
      await sleep(randomDelay(80, 200));
      el.dispatchEvent(new InputEvent('input', {
        inputType: 'insertText',
        data: text,
        bubbles: true
      }));
      el.dispatchEvent(new Event('change', { bubbles: true }));

      return verifyContent(el, text, 400, 30);
    };

    // 策略3: 标准的 insertText（不使用剪贴板，避免被检测）
    const tryKimiInsertText = async () => {
      el.focus();
      await sleep(randomDelay(80, 180));
      document.execCommand('selectAll', false, null);
      await sleep(randomDelay(40, 100));
      document.execCommand('delete', false, null);
      await sleep(randomDelay(60, 150));
      document.execCommand('insertText', false, text);
      await sleep(randomDelay(80, 200));

      // 只触发一次 input 事件
      el.dispatchEvent(new InputEvent('input', {
        inputType: 'insertText',
        data: text,
        bubbles: true
      }));

      return verifyContent(el, text, 350, 30);
    };

    // 策略4: 最后 fallback - 直接 DOM 操作（最不自然，但最可靠）
    const tryKimiDirectDom = async () => {
      el.focus();
      await sleep(randomDelay(100, 250));
      el.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = text;
      el.appendChild(p);
      await sleep(randomDelay(80, 200));
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
      return verifyContent(el, text, 300, 25);
    };

    // 注意：移除了所有剪贴板相关策略，避免被检测
    return runStrategies(el, [
      { name: 'kimi-human-like', fallbackUsed: false, run: tryKimiHumanLikeInput },
      { name: 'kimi-slate-input', fallbackUsed: false, run: tryKimiSlateInput },
      { name: 'kimi-insertText', fallbackUsed: false, run: tryKimiInsertText },
      { name: 'kimi-direct-dom', fallbackUsed: true, run: tryKimiDirectDom }
    ], logger);
  };

  const yuanbaoInject = async (el, text, options) => {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return setReactValue(el, text);
    return setYuanbaoInput(el, text, options);
  };

  return {
    setReactValue,
    setContentEditable,
    setGeminiInput,
    closeQianwenTaskAssistant,
    qianwenInject,
    kimiInject,
    yuanbaoInject
  };
}
