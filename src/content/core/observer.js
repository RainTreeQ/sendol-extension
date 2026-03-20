// Sendol - MutationObserver helpers

/**
 * 等待元素出现，使用 MutationObserver 监听 DOM 变化
 * @param {Function} matchFn - 匹配函数，返回匹配的元素或 falsy 值
 * @param {Object} options - 配置选项
 * @param {number} options.timeout - 超时时间(ms)，默认 6000
 * @param {Node} options.root - 观察的根节点，默认 document.body
 * @param {boolean} options.checkOnStart - 是否立即检查一次，默认 true
 */
export function waitForElementByMutation(matchFn, options = {}) {
  const timeout = Number.isFinite(options.timeout) ? options.timeout : 6000;
  const root = options.root || document.body || document.documentElement;
  const checkOnStart = options.checkOnStart !== false;

  return new Promise((resolve, reject) => {
    // 立即检查一次
    if (checkOnStart) {
      try {
        const immediate = matchFn();
        if (immediate) {
          resolve(immediate);
          return;
        }
      } catch (err) {
        // 如果 matchFn 抛出，可能是环境还没准备好，继续观察
        if (options.throwOnError) {
          reject(err);
          return;
        }
      }
    }

    let done = false;
    let observer = null;
    let timer = null;
    let rafId = null;

    // 清理所有资源
    const cleanup = () => {
      done = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    // 完成回调
    const finish = (value, error = null) => {
      if (done) return;
      cleanup();
      if (error && options.throwOnError) {
        reject(error);
      } else {
        resolve(value || null);
      }
    };

    // 超时处理
    timer = setTimeout(() => {
      finish(null);
    }, timeout);

    // 检查函数 - 使用 requestAnimationFrame 节流
    const check = () => {
      if (done) return;

      try {
        const next = matchFn();
        if (next) {
          finish(next);
          return;
        }
      } catch (err) {
        if (options.throwOnError) {
          finish(null, err);
          return;
        }
        // 静默忽略非致命错误
      }

      // 继续检查
      rafId = requestAnimationFrame(check);
    };

    // 启动 MutationObserver
    try {
      observer = new MutationObserver((mutations) => {
        // 只在有实际变化时检查
        if (!done && mutations.some(m => m.addedNodes.length > 0)) {
          check();
        }
      });

      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: false, // 不监听属性变化以提高性能
        characterData: false
      });

      // 启动 RAF 循环作为后备
      rafId = requestAnimationFrame(check);
    } catch (err) {
      // observer 创建失败，使用 RAF 作为后备
      rafId = requestAnimationFrame(check);
    }
  });
}
