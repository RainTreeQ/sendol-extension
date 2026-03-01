// AI Broadcast - Content Script v7
// Faster input path, structured timings, and guarded fallbacks

if (!window.__aiBroadcastLoaded) {
  window.__aiBroadcastLoaded = true;

  (function() {
    'use strict';

    const hostname = window.location.hostname;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const now = () => Date.now();

    function createLogger(requestId, debug) {
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

    async function waitFor(fn, timeout = 6000, interval = 80) {
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

    async function waitForCheck(check, timeout = 120, interval = 20) {
      const deadline = now() + timeout;
      while (now() < deadline) {
        try {
          if (check()) return true;
        } catch (err) {}
        await sleep(interval);
      }
      return false;
    }

    function normalizeText(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function getContent(el) {
      if (!el) return '';
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        return (el.value || '').trim();
      }
      return (el.innerText || el.textContent || '').trim();
    }

    function contentLooksInjected(el, text) {
      const expected = normalizeText(text);
      const actual = normalizeText(getContent(el));
      if (!expected) return actual.length === 0;
      if (!actual) return false;
      if (actual === expected) return true;
      return actual.includes(expected.slice(0, Math.min(expected.length, 24)));
    }

    async function verifyContent(el, text, timeout = 120, interval = 20) {
      return waitForCheck(() => contentLooksInjected(el, text), timeout, interval);
    }

    // ── React textarea/input ─────────────────────────────────────────────────
    function setReactValue(el, value) {
      const proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(el, value);
      else el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { strategy: 'react-value', fallbackUsed: false };
    }

    async function tryInsertText(el, text) {
      el.focus();
      await sleep(16);
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      const ok = document.execCommand('insertText', false, text);
      const verified = await verifyContent(el, text);
      if (verified && ok) {
        el.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          inputType: 'insertText',
          data: text
        }));
      }
      return verified;
    }

    async function tryClipboardPaste(el, text) {
      await navigator.clipboard.writeText(text);
      el.focus();
      await sleep(16);
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('paste');
      return verifyContent(el, text);
    }

    async function tryDataTransferPaste(el, text) {
      el.focus();
      await sleep(16);
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

    async function runStrategies(el, strategyList, logger) {
      for (const strategy of strategyList) {
        try {
          if (await strategy.run()) {
            logger.debug('inject-strategy-success', { strategy: strategy.name });
            return { strategy: strategy.name, fallbackUsed: Boolean(strategy.fallbackUsed) };
          }
          logger.debug('inject-strategy-miss', { strategy: strategy.name });
        } catch (err) {
          logger.debug('inject-strategy-error', {
            strategy: strategy.name,
            error: err.message
          });
        }
      }
      throw new Error('输入注入失败');
    }

    // ── Generic contenteditable injection (ChatGPT, Claude) ─────────────────
    async function setContentEditable(el, text, options) {
      const { fastPathEnabled, logger } = options;

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

    // ── Gemini-specific injection: no clipboard/paste events ────────────────
    function notifyGeminiFramework(el, text) {
      el.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: text
      }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      const richTextarea = el.closest('rich-textarea');
      if (richTextarea) {
        richTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        richTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    async function setGeminiInput(el, text, options) {
      const { logger } = options;

      el.focus();
      await sleep(16);

      const richTextarea = el.closest('rich-textarea') || el.parentElement;
      const quill = richTextarea?.__quill || el.__quill;
      if (quill) {
        quill.setText('');
        quill.insertText(0, text, 'user');
        quill.setSelection(text.length, 0);
        notifyGeminiFramework(el, text);
        await sleep(30);
        if (await verifyContent(el, text, 200, 25)) {
          return { strategy: 'gemini-quill', fallbackUsed: false };
        }
      }

      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      if (await verifyContent(el, text)) {
        notifyGeminiFramework(el, text);
        return { strategy: 'gemini-insertText', fallbackUsed: Boolean(quill) };
      }

      el.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = text;
      el.appendChild(p);
      notifyGeminiFramework(el, text);
      if (await verifyContent(el, text)) {
        return { strategy: 'gemini-direct-dom', fallbackUsed: true };
      }

      logger.debug('gemini-inject-failed-after-fallbacks');
      throw new Error('Gemini 输入注入失败');
    }

    // ── Enter — only keydown, no keypress/keyup ─────────────────────────────
    function pressEnterOn(el) {
      const target = el || document.activeElement;
      if (!target) return;
      target.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
        composed: true
      }));
    }

    // ── Platforms ────────────────────────────────────────────────────────────
    const platforms = {
      'chatgpt.com': {
        name: 'ChatGPT',
        findInput: () => waitFor(() =>
          document.querySelector('#prompt-textarea') ||
          document.querySelector('div[contenteditable="true"][data-lexical-editor]') ||
          document.querySelector('div[contenteditable="true"][role="textbox"]')
        ),
        async inject(el, text, options) {
          if (el.tagName === 'TEXTAREA') return setReactValue(el, text);
          return setContentEditable(el, text, options);
        },
        async send() {
          const btn = await waitFor(() => {
            const found = document.querySelector('[data-testid="send-button"]') ||
                          document.querySelector('button[aria-label="Send prompt"]') ||
                          document.querySelector('button[aria-label="Send message"]');
            return found && !found.disabled ? found : null;
          }, 4000, 40);
          if (btn) btn.click();
          else pressEnterOn(null);
        }
      },

      'claude.ai': {
        name: 'Claude',
        findInput: () => waitFor(() =>
          document.querySelector('div.ProseMirror[contenteditable="true"]') ||
          document.querySelector('[data-testid="chat-input"] div[contenteditable]') ||
          document.querySelector('fieldset div[contenteditable="true"]') ||
          document.querySelector('div[contenteditable="true"]')
        ),
        inject: (el, text, options) => setContentEditable(el, text, options),
        async send() {
          const btn = await waitFor(() => {
            const candidates = [
              document.querySelector('button[aria-label="Send Message"]'),
              document.querySelector('button[aria-label*="Send"]'),
              ...[...document.querySelectorAll('fieldset button, form button')]
            ].filter(Boolean);
            for (const candidate of candidates) {
              if (candidate.disabled) continue;
              const label = (candidate.getAttribute('aria-label') || '').toLowerCase();
              if (label.includes('attach') || label.includes('file') || label.includes('upload')) continue;
              if (candidate.querySelector('svg')) return candidate;
            }
            return null;
          }, 4000, 40);
          if (btn) btn.click();
          else {
            const input = document.querySelector('div.ProseMirror[contenteditable="true"]');
            pressEnterOn(input);
          }
        }
      },

      'gemini.google.com': {
        name: 'Gemini',
        findInput: () => waitFor(() =>
          document.querySelector('.ql-editor[contenteditable="true"]') ||
          document.querySelector('rich-textarea .ql-editor') ||
          document.querySelector('div[contenteditable="true"][role="textbox"]') ||
          document.querySelector('p[data-placeholder]')?.closest('[contenteditable="true"]')
        ),
        inject: (el, text, options) => setGeminiInput(el, text, options),
        async send(el, options) {
          await sleep(60);
          const btn = await waitFor(() => {
            for (const selector of [
              'button[aria-label="Send message"]',
              'button[aria-label="Send"]',
              'button.send-button',
              'button[data-test-id="send-button"]',
              'button[mattooltip="Send message"]',
              'button[mattooltip="Send"]',
              'button[jsname="Qx7uuf"]'
            ]) {
              const found = document.querySelector(selector);
              if (found && !found.disabled) return found;
            }
            const container = el?.closest('rich-textarea')?.parentElement?.parentElement
                           || el?.closest('.input-area-container')
                           || el?.closest('[role="complementary"]')?.parentElement;
            if (container) {
              for (const b of container.querySelectorAll('button:not([disabled])')) {
                const hint = (b.getAttribute('aria-label') || b.getAttribute('mattooltip') || '').toLowerCase();
                if (hint.includes('send')) return b;
              }
            }
            return null;
          }, 5000, 50);
          if (btn) {
            btn.click();
          } else {
            options.logger.debug('gemini-send-button-not-found', { hasInput: Boolean(el) });
          }
        }
      },

      'grok.com': {
        name: 'Grok',
        findInput: () => waitFor(() =>
          document.querySelector('textarea[placeholder*="Ask"]') ||
          document.querySelector('textarea') ||
          document.querySelector('div[contenteditable="true"]')
        ),
        async inject(el, text, options) {
          if (el.tagName === 'TEXTAREA') return setReactValue(el, text);
          return setContentEditable(el, text, options);
        },
        async send() {
          const btn = await waitFor(() => {
            const found = document.querySelector('button[type="submit"]') ||
                          document.querySelector('button[aria-label*="Send"]');
            return found && !found.disabled ? found : null;
          }, 2000, 40);
          if (btn) btn.click();
          else pressEnterOn(null);
        }
      },

      'deepseek.com': {
        name: 'DeepSeek',
        findInput: () => waitFor(() =>
          document.querySelector('textarea#chat-input') ||
          document.querySelector('textarea[placeholder*="Ask"]') ||
          document.querySelector('textarea')
        ),
        inject: (el, text) => Promise.resolve(setReactValue(el, text)),
        async send() {
          const btn = await waitFor(() => {
            const found = document.querySelector('button[type="submit"]') ||
                          document.querySelector('[aria-label*="send"]');
            return found && !found.disabled ? found : null;
          }, 2000, 40);
          if (btn) btn.click();
          else pressEnterOn(null);
        }
      }
    };

    function getPlatform() {
      for (const [domain, platform] of Object.entries(platforms)) {
        if (hostname.includes(domain)) return platform;
      }
      return null;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'PING') {
        const platform = getPlatform();
        sendResponse({ success: true, platform: platform ? platform.name : 'Unknown' });
        return true;
      }

      if (message.type === 'INJECT_MESSAGE') {
        const requestId = message.requestId || `req_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const debug = Boolean(message.debug);
        const fastPathEnabled = message.fastPathEnabled !== false;
        const text = message.text || '';
        const autoSend = Boolean(message.autoSend);
        const logger = createLogger(requestId, debug);
        const platform = getPlatform();

        if (!platform) {
          sendResponse({
            success: false,
            platform: 'Unknown',
            error: '不支持的平台',
            stage: 'findInput',
            strategy: 'n/a',
            fallbackUsed: false,
            timings: { findInputMs: 0, injectMs: 0, sendMs: 0, totalMs: 0 }
          });
          return true;
        }

        (async () => {
          const timings = {
            findInputMs: 0,
            injectMs: 0,
            sendMs: 0,
            totalMs: 0
          };
          let stage = 'findInput';
          let strategy = 'n/a';
          let fallbackUsed = false;
          const startedAt = now();

          logger.info('inject-start', {
            platform: platform.name,
            autoSend,
            fastPathEnabled
          });

          try {
            const findStartedAt = now();
            const input = await platform.findInput();
            timings.findInputMs = now() - findStartedAt;
            if (!input) {
              const err = new Error(`找不到 ${platform.name} 输入框`);
              err.stage = 'findInput';
              throw err;
            }

            stage = 'inject';
            const injectStartedAt = now();
            const injectMeta = await platform.inject(input, text, {
              fastPathEnabled,
              logger,
              debug
            });
            timings.injectMs = now() - injectStartedAt;
            strategy = injectMeta?.strategy || strategy;
            fallbackUsed = Boolean(injectMeta?.fallbackUsed);

            if (autoSend) {
              stage = 'send';
              const sendStartedAt = now();
              await platform.send(input, { logger, debug });
              timings.sendMs = now() - sendStartedAt;
            }

            timings.totalMs = now() - startedAt;
            logger.info('inject-end', {
              platform: platform.name,
              timings,
              strategy,
              fallbackUsed
            });
            sendResponse({
              success: true,
              platform: platform.name,
              timings,
              strategy,
              fallbackUsed
            });
          } catch (err) {
            timings.totalMs = now() - startedAt;
            const failedStage = err.stage || stage || 'inject';
            logger.error('inject-failure', {
              platform: platform.name,
              stage: failedStage,
              error: err.message,
              timings,
              strategy,
              fallbackUsed
            });
            sendResponse({
              success: false,
              platform: platform.name,
              error: err.message,
              stage: failedStage,
              timings,
              strategy,
              fallbackUsed
            });
          }
        })();

        return true;
      }
    });
  })();
}
