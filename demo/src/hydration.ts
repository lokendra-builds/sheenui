/** Small hydration helpers for src/main.tsx and the lazy islands. */

/** Called from an effect inside the page's Suspense boundary: effects run only after it hydrates. */
export function markFirstPageHydrated() {
  // A DOM marker for tests: e2e waits for it instead of sleeping.
  document.documentElement.dataset.hydrated = "true";
}

/** Resolves when the browser is idle (or after `timeout` ms). On the server (the prerender) it resolves at once. */
export function whenIdle(timeout = 1000) {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise<void>((resolve) => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout });
    else window.setTimeout(resolve, 200);
  });
}
