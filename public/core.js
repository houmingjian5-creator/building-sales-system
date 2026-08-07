const browserFetch = window.fetch.bind(window);
const routeRequestControllers = new Map();

async function apiFetch(input, options = {}) {
  const timeoutMs = Number(options.timeoutMs || 20000);
  const requestOptions = { ...options };
  delete requestOptions.timeoutMs;
  const controller = new AbortController();
  const externalSignal = requestOptions.signal;
  const abortFromExternal = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", abortFromExternal, { once: true });
  }
  requestOptions.signal = controller.signal;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const method = String(requestOptions.method || "GET").toUpperCase();
    let response;
    let lastError;
    const attempts = method === "GET" ? 2 : 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        response = await browserFetch(input, requestOptions);
        if (response.status < 500 || attempt === attempts - 1) break;
      } catch (error) {
        lastError = error;
        if (controller.signal.aborted || attempt === attempts - 1) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    if (!response) throw lastError || new Error("网络请求失败");
    const path = typeof input === "string" ? input : String(input && input.url || "");
    if (response.status === 401 && path.indexOf("/api/login") < 0 && state.user) {
      if (typeof persistCart === "function") persistCart(state.orderType, true);
      state.user = null;
      state.route = "dashboard";
      state.auditItems = [];
      state.toast = "登录状态已失效，请重新登录";
      Promise.resolve().then(() => render());
    }
    return response;
  } catch (error) {
    if (controller.signal.aborted && !(externalSignal && externalSignal.aborted)) throw new Error("网络请求超时，请稍后重试");
    throw error;
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener("abort", abortFromExternal);
  }
}

async function latestApiFetch(key, input, options = {}) {
  const previous = routeRequestControllers.get(key);
  if (previous) previous.abort();
  const controller = new AbortController();
  routeRequestControllers.set(key, controller);
  try {
    return await apiFetch(input, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) return null;
    throw error;
  } finally {
    if (routeRequestControllers.get(key) === controller) routeRequestControllers.delete(key);
  }
}
