export function createDoubaoAdapter(deps) {
  const {
    findInputForPlatform,
    findInputHeuristically,
    waitFor,
    setReactValue,
    setContentEditable,
    findSendBtnForPlatform,
    findSendBtnHeuristically,
    pressEnterOn,
    isDoubaoVerificationPage,
    sleep
  } = deps;

  // 随机延迟，降低触发风控的概率
  async function antiDetectionDelay() {
    // 3-8秒随机延迟
    const delay = 3000 + Math.floor(Math.random() * 5000);
    await sleep(delay);
  }

  return {
    name: 'Doubao',
    findInput: async () => {
      if (isDoubaoVerificationPage()) {
        const err = new Error('豆包当前处于人机验证页面，请先完成验证后再重试');
        err.stage = 'findInput';
        err.isRiskControl = true;  // 标记为风控错误
        err.platformName = 'Doubao';
        throw err;
      }
      return await findInputForPlatform('doubao') || waitFor(() => findInputHeuristically());
    },
    async inject(el, text, options) {
      // 注入前添加人性化行为
      if (el) {
        el.focus();
        el.click();
        await sleep(200 + Math.floor(Math.random() * 300));
      }

      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        return setReactValue(el, text);
      }
      return setContentEditable(el, text, options);
    },
    async send(el, options) {
      if (isDoubaoVerificationPage()) {
        const err = new Error('豆包当前处于人机验证页面，请先完成验证后再重试');
        err.stage = 'send';
        err.isRiskControl = true;  // 标记为风控错误
        err.platformName = 'Doubao';
        throw err;
      }

      // 发送前添加随机延迟
      await antiDetectionDelay();

      const btn = await findSendBtnForPlatform('doubao') || await waitFor(() => findSendBtnHeuristically(el), 3000, 30);
      if (btn) {
        btn.click();
        return true;
      }
      if (el) {
        el.focus();
        pressEnterOn(el);
        return true;
      }
      return false;
    }
  };
}
