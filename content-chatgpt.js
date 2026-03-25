(() => {
  // src/content/adapters/chatgpt.js
  function createChatgptAdapter(deps) {
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
      name: "ChatGPT",
      findInput: async () => {
        return await findInputForPlatform("chatgpt") || waitFor(() => findInputHeuristically());
      },
      async inject(el, text, options) {
        if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
          setReactValue(el, text);
          return { strategy: "chatgpt-react-value", fallbackUsed: false };
        }
        const isLexical = el.hasAttribute("data-lexical-editor") || el.closest("[data-lexical-editor]");
        if (isLexical) {
          el.focus();
          await sleep(30);
          document.execCommand("selectAll", false, null);
          document.execCommand("delete", false, null);
          await sleep(16);
          const dt = new DataTransfer();
          dt.setData("text/plain", text);
          el.dispatchEvent(new ClipboardEvent("paste", {
            clipboardData: dt,
            bubbles: true,
            cancelable: true,
            composed: true
          }));
          await sleep(100);
          const actual = normalizeText(getContent(el));
          const expected = normalizeText(text);
          if (actual && (actual === expected || actual.includes(expected) || expected.includes(actual) || actual.length >= expected.length * 0.9 && actual.length <= expected.length * 1.1)) {
            return { strategy: "chatgpt-lexical-paste", fallbackUsed: false };
          }
          document.execCommand("selectAll", false, null);
          document.execCommand("delete", false, null);
          await sleep(8);
          document.execCommand("insertText", false, text);
          await sleep(100);
          const actual2 = normalizeText(getContent(el));
          if (actual2 && (actual2 === expected || actual2.includes(expected) || expected.includes(actual2) || actual2.length >= expected.length * 0.9 && actual2.length <= expected.length * 1.1)) {
            return { strategy: "chatgpt-lexical-insertText", fallbackUsed: true };
          }
          return { strategy: "chatgpt-lexical-best-effort", fallbackUsed: true };
        }
        return setContentEditable(el, text, options);
      },
      async send(el, options) {
        const logger = options?.logger;
        const expected = normalizeText(options?.text || "");
        let before = normalizeText(getContent(el));
        if (expected && expected.length > 0) {
          let syncChecks = 0;
          while (syncChecks < 3 && before.length === 0) {
            await sleep(100);
            before = normalizeText(getContent(el));
            syncChecks++;
          }
          logger?.debug?.("chatgpt-send-start", { hasContent: before.length > 0, contentLen: before.length, expectedLen: expected.length, syncChecks });
        } else {
          logger?.debug?.("chatgpt-send-start", { hasContent: before.length > 0, contentLen: before.length, expectedLen: 0 });
        }
        const findNearbySendBtn = () => {
          if (!el?.getBoundingClientRect) return null;
          const rect = el.getBoundingClientRect();
          const nodes = document.querySelectorAll('button:not([disabled]), [role="button"]');
          let best = null;
          let bestScore = -Infinity;
          for (const node of nodes) {
            if (!node || node.disabled || node.getAttribute("aria-disabled") === "true") continue;
            const hint = `${node.getAttribute("aria-label") || ""} ${node.getAttribute("title") || ""} ${(node.textContent || "").trim()}`.toLowerCase();
            if (hint.includes("login") || hint.includes("log in") || hint.includes("search") || hint.includes("upload") || hint.includes("attach")) continue;
            const nr = node.getBoundingClientRect();
            const dx = nr.left + nr.width / 2 - (rect.left + rect.width);
            const dy = nr.top + nr.height / 2 - (rect.top + rect.height / 2);
            if (dx < -50 || dx > 400 || Math.abs(dy) > 200) continue;
            const semanticScore = hint.includes("send") || hint.includes("submit") || hint.includes("\u53D1\u9001") || hint.includes("\u63D0\u4EA4") ? 50 : 0;
            const svgScore = node.querySelector("svg") ? 20 : 0;
            const score = semanticScore + svgScore - Math.abs(dx) * 0.2 - Math.abs(dy) * 0.1;
            if (score > bestScore) {
              bestScore = score;
              best = node;
            }
          }
          return best;
        };
        const selectorCandidate = await findSendBtnForPlatform("chatgpt");
        const isReady = (b) => b && !b.disabled && b.getAttribute("aria-disabled") !== "true";
        const btn = await waitFor(
          () => {
            const b = selectorCandidate || findSendBtnHeuristically(el) || findNearbySendBtn();
            return isReady(b) ? b : null;
          },
          8e3,
          100
        );
        if (btn) {
          btn.click();
          await sleep(400);
          const after = normalizeText(getContent(el));
          if (before.length > 0 && after.length < before.length) {
            logger?.debug?.("chatgpt-send-click-success", { beforeLen: before.length, afterLen: after.length });
            return true;
          }
          if (before.length === 0 && after.length === 0) {
            logger?.debug?.("chatgpt-send-click-assumed");
            return true;
          }
          logger?.debug?.("chatgpt-send-click-no-change", { beforeLen: before.length, afterLen: after.length });
        } else {
          logger?.debug?.("chatgpt-send-btn-not-found");
        }
        const target = el || document.activeElement;
        if (target) {
          target.focus();
          const beforeKey = normalizeText(getContent(target)).length;
          pressEnterOn(target);
          await sleep(400);
          const afterKey = normalizeText(getContent(target)).length;
          if (beforeKey > 0 && afterKey < beforeKey) {
            logger?.debug?.("chatgpt-send-keyboard-success", { beforeLen: beforeKey, afterLen: afterKey });
            return true;
          }
        } else {
          pressEnterOn(null);
          await sleep(400);
        }
        if (target) {
          target.focus();
          target.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
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
            logger?.debug?.("chatgpt-send-ctrl-enter-success");
            return true;
          }
        }
        logger?.debug?.("chatgpt-send-failed");
        return false;
      }
    };
  }

  // src/content/entries/chatgpt.js
  if (!window.__aiBroadcastLoaded) {
    window.__aiBroadcastLoaded = true;
    const core = globalThis.__AIB_CORE__;
    const {
      MESSAGE_TYPES,
      createLogger,
      now,
      normalizeText,
      getContent,
      sleep,
      waitFor,
      waitForSendReady,
      getHighRiskPageReason,
      pasteImageToInput,
      findUploadEntryTarget,
      markUploadHighlight,
      clearUploadHighlight,
      onCleanup,
      invalidateDomCache,
      findInputForPlatform,
      findInputHeuristically,
      setReactValue,
      setContentEditable,
      findSendBtnForPlatform,
      findSendBtnHeuristically,
      pressEnterOn
    } = core;
    const platformId = "chatgpt";
    const adapter = createChatgptAdapter({
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
    });
    const listener = (message, sender, sendResponse) => {
      if (message.type === MESSAGE_TYPES.PING) {
        sendResponse({ success: true, platform: adapter.name });
        return true;
      }
      if (message.type === MESSAGE_TYPES.INJECT_IMAGE) {
        const requestId = message.requestId || `req_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const debug = Boolean(message.debug);
        const logger = createLogger(requestId, debug);
        (async () => {
          const startedAt = now();
          try {
            const riskReason = getHighRiskPageReason();
            if (riskReason) {
              sendResponse({ success: false, error: riskReason, platform: adapter.name });
              return;
            }
            const input = await adapter.findInput();
            if (!input) {
              sendResponse({ success: false, error: `\u627E\u4E0D\u5230 ${adapter.name} \u8F93\u5165\u6846`, platform: adapter.name });
              return;
            }
            const result = await pasteImageToInput(input, message.imageBase64, message.mimeType || "image/png", logger);
            const totalMs = now() - startedAt;
            sendResponse({
              success: result.success,
              platform: adapter.name,
              strategy: result.strategy,
              totalMs,
              error: result.success ? void 0 : "\u56FE\u7247\u7C98\u8D34\u5931\u8D25"
            });
          } catch (err) {
            logger.error("inject-image-failure", { error: err?.message });
            sendResponse({ success: false, error: err?.message || "\u56FE\u7247\u6CE8\u5165\u5931\u8D25", platform: adapter.name });
          }
        })();
        return true;
      }
      if (message.type === MESSAGE_TYPES.HIGHLIGHT_UPLOAD_ENTRY) {
        const requestId = message.requestId || `req_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const debug = Boolean(message.debug);
        const logger = createLogger(requestId, debug);
        (async () => {
          const startedAt = now();
          try {
            const target = await waitFor(() => findUploadEntryTarget(), 2200, 90);
            if (!target?.element) {
              sendResponse({
                success: true,
                found: false,
                platform: adapter.name,
                via: "none",
                totalMs: now() - startedAt
              });
              return;
            }
            markUploadHighlight(target.element);
            logger.debug("upload-entry-highlighted", { platform: adapter.name, via: target.via, score: target.score });
            sendResponse({
              success: true,
              found: true,
              platform: adapter.name,
              via: target.via || "unknown",
              totalMs: now() - startedAt
            });
          } catch (err) {
            logger.error("upload-entry-highlight-failure", { error: err?.message });
            sendResponse({
              success: false,
              found: false,
              platform: adapter.name,
              via: "error",
              totalMs: now() - startedAt,
              error: err?.message || "\u5B9A\u4F4D\u4E0A\u4F20\u5165\u53E3\u5931\u8D25"
            });
          }
        })();
        return true;
      }
      if (message.type === MESSAGE_TYPES.SEND_NOW) {
        const requestId = message.requestId || `req_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const debug = Boolean(message.debug);
        const safeMode = Boolean(message.safeMode);
        const expectedText = normalizeText(message.text || "");
        const logger = createLogger(requestId, debug);
        (async () => {
          const t0 = now();
          try {
            const riskReason = getHighRiskPageReason();
            if (riskReason) {
              sendResponse({
                success: false,
                sendMs: now() - t0,
                error: riskReason,
                debugLog: `send_now | platform=${adapter.name} | stage=risk | error=${riskReason}`
              });
              return;
            }
            let input = await adapter.findInput();
            if (!input) {
              sendResponse({
                success: false,
                sendMs: now() - t0,
                error: "\u627E\u4E0D\u5230\u8F93\u5165\u6846",
                debugLog: `send_now | platform=${adapter.name} | stage=findInput | error=\u627E\u4E0D\u5230\u8F93\u5165\u6846`
              });
              return;
            }
            if (expectedText) {
              let current = normalizeText(getContent(input));
              const expectedPrefix = expectedText.slice(0, Math.min(expectedText.length, 24));
              const matches = (value) => {
                if (!value) return false;
                return value.includes(expectedPrefix) || expectedText.includes(value);
              };
              if (!matches(current)) {
                await sleep(180);
                const refreshedInput = await adapter.findInput();
                if (refreshedInput) {
                  input = refreshedInput;
                  current = normalizeText(getContent(input));
                }
              }
              if (!matches(current)) {
                const bodyText = normalizeText((document.body?.innerText || "").slice(0, 6e3));
                const likelyAlreadySent = !current && expectedPrefix && bodyText.includes(expectedPrefix);
                if (likelyAlreadySent) {
                  sendResponse({
                    success: true,
                    sendMs: now() - t0,
                    debugLog: `send_now | platform=${adapter.name} | stage=precheck | ok=already-sent | textLen=${expectedText.length} | inputLen=${current.length}`
                  });
                  return;
                }
                sendResponse({
                  success: false,
                  sendMs: now() - t0,
                  error: "\u53D1\u9001\u524D\u8F93\u5165\u6846\u5185\u5BB9\u4E0D\u5339\u914D",
                  debugLog: `send_now | platform=${adapter.name} | stage=precheck | error=\u53D1\u9001\u524D\u8F93\u5165\u6846\u5185\u5BB9\u4E0D\u5339\u914D | textLen=${expectedText.length} | inputLen=${current.length}`
                });
                return;
              }
            }
            const sent = await adapter.send(input, { logger, debug, safeMode });
            if (sent === false) {
              sendResponse({
                success: false,
                sendMs: now() - t0,
                error: "\u53D1\u9001\u52A8\u4F5C\u672A\u6267\u884C",
                debugLog: `send_now | platform=${adapter.name} | platformId=${platformId} | stage=send | error=\u53D1\u9001\u52A8\u4F5C\u672A\u6267\u884C`
              });
              return;
            }
            sendResponse({
              success: true,
              sendMs: now() - t0,
              debugLog: `send_now | platform=${adapter.name} | platformId=${platformId} | stage=send | ok=true`
            });
          } catch (e) {
            logger.error("send-now-failure", { error: e?.message });
            sendResponse({
              success: false,
              sendMs: now() - t0,
              error: e?.message || "\u53D1\u9001\u5931\u8D25",
              debugLog: `send_now | platform=${adapter.name} | stage=exception | error=${e?.message || "\u53D1\u9001\u5931\u8D25"}`
            });
          }
        })();
        return true;
      }
      if (message.type === MESSAGE_TYPES.INJECT_MESSAGE) {
        const requestId = message.requestId || `req_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const debug = Boolean(message.debug);
        const fastPathEnabled = message.fastPathEnabled !== false;
        const safeMode = Boolean(message.safeMode);
        const text = message.text || "";
        const autoSend = Boolean(message.autoSend);
        const logger = createLogger(requestId, debug);
        (async () => {
          const timings = {
            findInputMs: 0,
            injectMs: 0,
            sendMs: 0,
            totalMs: 0
          };
          const normalizedPayload = normalizeText(text);
          const payloadLen = normalizedPayload.length;
          const payloadPreview = normalizedPayload.slice(0, 40).replace(/\|/g, "\xA6");
          let inputLenAfterInject = 0;
          let stage = "findInput";
          let strategy = "n/a";
          let fallbackUsed = false;
          let sent = false;
          const startedAt = now();
          logger.info("inject-start", {
            platform: adapter.name,
            autoSend,
            fastPathEnabled,
            safeMode
          });
          try {
            const riskReason = getHighRiskPageReason();
            if (riskReason) {
              const err = new Error(riskReason);
              err.stage = "findInput";
              throw err;
            }
            const findStartedAt = now();
            const input = await adapter.findInput();
            timings.findInputMs = now() - findStartedAt;
            if (!input) {
              const err = new Error(`\u627E\u4E0D\u5230 ${adapter.name} \u8F93\u5165\u6846`);
              err.stage = "findInput";
              throw err;
            }
            stage = "inject";
            const injectStartedAt = now();
            const injectMeta = await adapter.inject(input, text, {
              fastPathEnabled,
              safeMode,
              logger,
              debug
            });
            timings.injectMs = now() - injectStartedAt;
            strategy = injectMeta?.strategy || strategy;
            fallbackUsed = Boolean(injectMeta?.fallbackUsed);
            inputLenAfterInject = normalizeText(getContent(input)).length;
            if (payloadLen > 0 && inputLenAfterInject === 0) {
              const injectErr = new Error("\u8F93\u5165\u6846\u5185\u5BB9\u4E3A\u7A7A");
              injectErr.stage = "inject";
              throw injectErr;
            }
            if (autoSend) {
              stage = "send";
              await waitForSendReady(platformId, input);
              const sendStartedAt = now();
              const sendResult = await adapter.send(input, { logger, debug, text, safeMode });
              if (sendResult === false) {
                const sendErr = new Error("\u53D1\u9001\u52A8\u4F5C\u672A\u6267\u884C");
                sendErr.stage = "send";
                throw sendErr;
              }
              sent = true;
              timings.sendMs = now() - sendStartedAt;
            }
            timings.totalMs = now() - startedAt;
            logger.info("inject-end", {
              platform: adapter.name,
              timings,
              strategy,
              fallbackUsed
            });
            sendResponse({
              success: true,
              platform: adapter.name,
              sent,
              timings,
              strategy,
              fallbackUsed,
              debugLog: `inject | platform=${adapter.name} | platformId=${platformId} | stage=${autoSend ? "send" : "inject"} | sent=${sent} | strategy=${strategy} | fallback=${fallbackUsed} | textLen=${payloadLen} | inputLen=${inputLenAfterInject} | textHead=${payloadPreview} | ms=${timings.totalMs}`
            });
          } catch (err) {
            timings.totalMs = now() - startedAt;
            const failedStage = err.stage || stage || "inject";
            logger.error("inject-failure", {
              platform: adapter.name,
              stage: failedStage,
              error: err.message,
              timings,
              strategy,
              fallbackUsed
            });
            sendResponse({
              success: false,
              platform: adapter.name,
              sent: false,
              error: err.message,
              stage: failedStage,
              timings,
              strategy,
              fallbackUsed,
              debugLog: `inject | platform=${adapter.name} | platformId=${platformId} | stage=${failedStage} | error=${err.message} | strategy=${strategy} | fallback=${fallbackUsed} | textLen=${payloadLen} | inputLen=${inputLenAfterInject} | textHead=${payloadPreview} | ms=${timings.totalMs}`
            });
          }
        })();
        return true;
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    onCleanup(() => {
      chrome.runtime.onMessage.removeListener(listener);
      clearUploadHighlight();
      invalidateDomCache();
    });
    onCleanup(() => {
      try {
        window.__aiBroadcastLoaded = false;
      } catch (_) {
      }
    });
  }
})();
