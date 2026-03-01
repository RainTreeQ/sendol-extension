// AI Broadcast - Background Service Worker v4

const DEFAULT_FLAGS = {
  debugLogs: false,
  perfFastPathEnabled: true
};

function now() {
  return Date.now();
}

function createLogger(scope, requestId, debug) {
  const prefix = `[AIB][${scope}][${requestId}]`;
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

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

async function getRuntimeFlags() {
  const data = await chrome.storage.local.get(['debugLogs', 'perfFastPathEnabled']);
  return {
    debugLogs: typeof data.debugLogs === 'boolean' ? data.debugLogs : DEFAULT_FLAGS.debugLogs,
    perfFastPathEnabled: typeof data.perfFastPathEnabled === 'boolean' ? data.perfFastPathEnabled : DEFAULT_FLAGS.perfFastPathEnabled
  };
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['debugLogs', 'perfFastPathEnabled']);
  const patch = {};
  if (typeof existing.debugLogs !== 'boolean') patch.debugLogs = DEFAULT_FLAGS.debugLogs;
  if (typeof existing.perfFastPathEnabled !== 'boolean') patch.perfFastPathEnabled = DEFAULT_FLAGS.perfFastPathEnabled;
  if (Object.keys(patch).length > 0) {
    await chrome.storage.local.set(patch);
  }
  console.log('AI Broadcast extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_AI_TABS') {
    getAITabs().then(tabs => sendResponse({ tabs }));
    return true;
  }
  if (message.type === 'BROADCAST_MESSAGE') {
    (async () => {
      const { text, autoSend, newChat, tabIds, requestId, clientTs } = message;
      const runtimeFlags = await getRuntimeFlags();
      const resolvedRequestId = requestId || `req_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const debug = typeof message.debug === 'boolean' ? message.debug : runtimeFlags.debugLogs;
      const payload = {
        text,
        autoSend: Boolean(autoSend),
        newChat: Boolean(newChat),
        tabIds: Array.isArray(tabIds) ? tabIds : [],
        requestId: resolvedRequestId,
        clientTs: Number.isFinite(clientTs) ? clientTs : now(),
        debug,
        fastPathEnabled: runtimeFlags.perfFastPathEnabled
      };
      const result = await broadcastToTabs(payload);
      sendResponse(result);
    })().catch((err) => {
      sendResponse({
        results: [],
        summary: {
          requestId: message.requestId || 'unknown',
          totalMs: 0,
          p95TabMs: 0,
          successCount: 0,
          failCount: 0
        },
        error: err.message
      });
    });
    return true;
  }
});

const AI_PATTERNS = [
  'chatgpt.com',
  'chat.openai.com',
  'claude.ai',
  'gemini.google.com',
  'grok.com',
  'deepseek.com',
  'copilot.microsoft.com',
  'chat.mistral.ai'
];

const PLATFORM_NAMES = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'claude.ai': 'Claude',
  'gemini.google.com': 'Gemini',
  'grok.com': 'Grok',
  'deepseek.com': 'DeepSeek',
  'copilot.microsoft.com': 'Copilot',
  'chat.mistral.ai': 'Mistral'
};

const GENERIC_TITLE_PATTERNS = {
  ChatGPT: [/^chatgpt$/i, /^new chat$/i],
  Claude: [/^claude$/i, /^new chat$/i],
  Gemini: [/^google gemini$/i, /^gemini$/i, /^new\s*chat$/i, /^gemini\s*[-–—|]/i, /[-–—|]\s*gemini$/i, /^gemini\s*[-–—|].*gemini$/i],
  Grok: [/^grok$/i, /^new chat$/i],
  DeepSeek: [/^deepseek$/i, /^new chat$/i],
  Copilot: [/^microsoft copilot$/i, /^copilot$/i],
  Mistral: [/^mistral ai$/i, /^mistral$/i, /^new chat$/i]
};

// New chat URLs per platform
const NEW_CHAT_URLS = {
  'ChatGPT':  'https://chatgpt.com/',
  'Claude':   'https://claude.ai/new',
  'Gemini':   'https://gemini.google.com/app',
  'Grok':     'https://grok.com/',
  'DeepSeek': null,
  'Copilot':  null,
  'Mistral':  null,
};

function getPlatformName(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    for (const [key, name] of Object.entries(PLATFORM_NAMES)) {
      if (hostname.includes(key)) return name;
    }
  } catch(e) {}
  return null;
}

function normalizeTitle(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isGenericTitle(platformName, title) {
  const normalized = normalizeTitle(title);
  if (!normalized) return true;
  const patterns = GENERIC_TITLE_PATTERNS[platformName] || [];
  return patterns.some((pattern) => pattern.test(normalized));
}

async function probeConversationTitle(tabId, platformName) {
  try {
    const execution = await chrome.scripting.executeScript({
      target: { tabId },
      func: (platform) => {
        const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
        const pick = (selectors) => {
          for (const selector of selectors) {
            const node = document.querySelector(selector);
            const text = normalize(node?.textContent || node?.innerText);
            if (text) return text;
          }
          return '';
        };
        const pickAll = (selectors) => {
          const out = [];
          for (const selector of selectors) {
            try {
              const nodes = document.querySelectorAll(selector);
              for (const node of nodes) {
                const text = normalize(node?.textContent || node?.innerText);
                if (text && text.length <= 120 && text.length > 0) out.push(text);
              }
            } catch (e) {}
          }
          return out;
        };
        const stripPatterns = {
          Gemini: [/\s*[-–—|]\s*(?:google\s*)?gemini\s*$/i, /^(?:google\s*)?gemini\s*[-–—|]\s*/i, /\s*[-–—|]\s*google\s*$/i],
          ChatGPT: [/\s*[-–—|]\s*chatgpt\s*$/i, /^chatgpt\s*[-–—|]\s*/i],
          Claude: [/\s*[-–—|]\s*claude\s*$/i, /^claude\s*[-–—|]\s*/i],
          Grok: [/\s*[-–—|]\s*grok\s*$/i, /^grok\s*[-–—|]\s*/i],
          DeepSeek: [/\s*[-–—|]\s*deepseek\s*$/i, /^deepseek\s*[-–—|]\s*/i]
        };
        const genericGemini = /^(?:google\s*)?gemini$|^new\s*chat$/i;

        if (platform === 'Gemini') {
          const byTitle = normalize(document.title);
          let stripped = byTitle;
          for (const re of (stripPatterns.Gemini || [])) stripped = stripped.replace(re, '').trim();
          if (stripped && !genericGemini.test(stripped) && stripped.length <= 120) return stripped;

          const domSelectors = [
            '[aria-current="page"]',
            '[aria-selected="true"]',
            'aside [aria-current="page"]',
            'aside [aria-selected="true"]',
            '[role="navigation"] [aria-current="page"]',
            '[role="navigation"] [aria-selected="true"]',
            'nav [aria-current="page"]',
            'nav [aria-selected="true"]',
            '[data-test-id="conversation-title"]',
            '[data-test-id="chat-history-item-active"]',
            '.mdc-list-item--activated',
            '.mdc-list-item--selected',
            'a[aria-current="page"]',
            'button[aria-current="page"]'
          ];
          const byDom = pick(domSelectors);
          if (byDom && !genericGemini.test(byDom)) return byDom;

          const candidates = pickAll(['[aria-current="page"]', '[aria-selected="true"]']);
          for (const c of candidates) {
            if (c && !genericGemini.test(c) && c.length <= 120) return c;
          }

          return stripped && stripped.length <= 120 ? stripped : '';
        }

        const selectorMap = {
          ChatGPT: ['nav a[aria-current="page"]', 'nav [data-active="true"]', 'main h1'],
          Claude: ['nav a[aria-current="page"]', 'main h1'],
          Grok: ['nav a[aria-current="page"]', 'main h1'],
          DeepSeek: ['nav a[aria-current="page"]', 'main h1'],
          Copilot: ['nav a[aria-current="page"]', 'main h1'],
          Mistral: ['nav a[aria-current="page"]', 'main h1']
        };
        const platformSelectors = selectorMap[platform] || ['main h1', 'header h1'];
        const byDom = pick(platformSelectors);
        if (byDom && byDom.length <= 120) return byDom;

        const byTitle = normalize(document.title);
        const patterns = stripPatterns[platform] || [];
        let stripped = byTitle;
        for (const re of patterns) stripped = stripped.replace(re, '').trim();
        if (stripped && stripped !== byTitle && stripped.length <= 120) return stripped;

        return byTitle && byTitle.length <= 120 ? byTitle : '';
      },
      args: [platformName]
    });
    const candidate = normalizeTitle(execution?.[0]?.result || '');
    return candidate;
  } catch (err) {
    return '';
  }
}

async function getAITabs() {
  const allTabs = await chrome.tabs.query({});
  const seenPlatforms = new Map();

  for (const tab of allTabs) {
    if (!tab.url) continue;
    const platformName = getPlatformName(tab.url);
    if (!platformName) continue;

    const existing = seenPlatforms.get(platformName);
    const score = (tab.active ? 1e9 : 0) + (tab.lastAccessed || tab.index || 0);
    const existingScore = existing
      ? ((existing.active ? 1e9 : 0) + (existing.lastAccessed || existing.index || 0))
      : -1;

    if (!existing || score > existingScore) {
      seenPlatforms.set(platformName, {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        platformName,
        windowId: tab.windowId,
        favIconUrl: tab.favIconUrl,
        index: tab.index,
        active: tab.active
      });
    }
  }

  const tabs = [...seenPlatforms.values()];
  const resolved = await Promise.all(
    tabs.map(async (tab) => {
      const shouldProbe = isGenericTitle(tab.platformName, tab.title) || tab.platformName === 'Gemini';
      if (!shouldProbe) return tab;
      const domTitle = await probeConversationTitle(tab.id, tab.platformName);
      if (domTitle && !isGenericTitle(tab.platformName, domTitle)) {
        return { ...tab, title: domTitle };
      }
      return tab;
    })
  );
  return resolved;
}

// Wait for a tab to finish loading
function waitForTabLoad(tabId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('页面加载超时'));
    }, timeout);

    function listener(updatedTabId, info) {
      if (updatedTabId === tabId && info.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pingContent(tabId, requestId, debug) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'PING',
      requestId,
      debug
    });
    return Boolean(response && response.success);
  } catch (err) {
    return false;
  }
}

async function ensureContentReady(tabId, requestId, debug, logger) {
  if (await pingContent(tabId, requestId, debug)) {
    logger.debug('content-ready', { tabId, via: 'ping' });
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
  } catch (err) {
    logger.debug('execute-script-warning', { tabId, error: err.message });
  }

  if (await pingContent(tabId, requestId, debug)) {
    logger.debug('content-ready', { tabId, via: 'inject+ping' });
    return;
  }

  const backoffs = [30, 60, 120, 240];
  for (const delay of backoffs) {
    await sleep(delay);
    if (await pingContent(tabId, requestId, debug)) {
      logger.debug('content-ready', { tabId, via: `retry-${delay}` });
      return;
    }
  }

  throw new Error('内容脚本未就绪');
}

function normalizeResultTimings(result, fallbackMs) {
  const raw = result.timings || {};
  const totalMs = Number.isFinite(raw.totalMs) ? raw.totalMs : fallbackMs;
  return {
    findInputMs: Number.isFinite(raw.findInputMs) ? raw.findInputMs : 0,
    injectMs: Number.isFinite(raw.injectMs) ? raw.injectMs : 0,
    sendMs: Number.isFinite(raw.sendMs) ? raw.sendMs : 0,
    totalMs: Number.isFinite(totalMs) ? totalMs : 0
  };
}

async function broadcastToTabs(payload) {
  const {
    text,
    autoSend,
    newChat,
    tabIds,
    requestId,
    clientTs,
    debug,
    fastPathEnabled
  } = payload;
  const logger = createLogger('background', requestId, debug);
  const startedAt = now();
  const results = [];
  logger.info('broadcast-start', {
    tabCount: tabIds.length,
    autoSend,
    newChat,
    fastPathEnabled,
    queueDelayMs: Math.max(0, startedAt - clientTs)
  });

  for (const tabId of tabIds) {
    const tabStartedAt = now();
    try {
      // ── Step 1: Navigate to new chat if needed (done HERE, not in content script) ──
      if (newChat) {
        const tab = await chrome.tabs.get(tabId);
        const platformName = getPlatformName(tab.url);
        const newUrl = NEW_CHAT_URLS[platformName];

        if (newUrl) {
          await chrome.tabs.update(tabId, { url: newUrl });
          await waitForTabLoad(tabId);
          await sleep(800); // extra settle time for JS frameworks to boot
        }
      }

      // ── Step 2: Ensure content script is ready ──
      await ensureContentReady(tabId, requestId, debug, logger);

      // ── Step 3: Send inject message (no navigation inside content script) ──
      const response = await chrome.tabs.sendMessage(tabId, {
        type: 'INJECT_MESSAGE',
        text,
        autoSend,
        newChat: false,  // navigation already done above
        requestId,
        debug,
        fastPathEnabled
      });
      const tabDuration = now() - tabStartedAt;
      const merged = {
        tabId,
        ...response
      };
      merged.timings = normalizeResultTimings(merged, tabDuration);
      results.push(merged);
      logger.debug('tab-success', {
        tabId,
        platform: merged.platform || 'Unknown',
        stage: merged.stage || 'done',
        timings: merged.timings,
        strategy: merged.strategy || 'n/a',
        fallbackUsed: Boolean(merged.fallbackUsed)
      });
    } catch (err) {
      const tabDuration = now() - tabStartedAt;
      const failed = {
        tabId,
        success: false,
        error: err.message,
        stage: 'inject',
        strategy: 'n/a',
        fallbackUsed: false,
        timings: {
          findInputMs: 0,
          injectMs: 0,
          sendMs: 0,
          totalMs: tabDuration
        }
      };
      results.push(failed);
      logger.error('tab-failure', { tabId, error: err.message, timings: failed.timings });
    }
  }

  const totalMs = now() - startedAt;
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  const p95TabMs = Math.round(percentile(results.map(r => r.timings?.totalMs || 0), 95));
  const summary = {
    requestId,
    totalMs,
    p95TabMs,
    successCount,
    failCount
  };
  logger.info('broadcast-end', summary);
  return { results, summary };
}
