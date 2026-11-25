/**
 * Resolves when the element with `id` is about to scroll into view (or after `fallbackMs`), for a lazyBlock island far
 * below the fold: `lazyBlock(() => whenNear("my-id").then(() => import("./Heavy")).then((m) => m.Heavy))`, with the island
 * wrapped in a block element carrying that id. The prerendered HTML stays on screen at full size until the code lands.
 * The prerender has no document, so on the server it resolves at once and the server HTML holds the finished block.
 */
export function whenNear(id: string, { rootMargin = "150px 0px", fallbackMs = 20000 } = {}): Promise<void> {
  return new Promise((resolve) => {
    const el = typeof document === "undefined" ? null : document.getElementById(id);
    if (!el || typeof IntersectionObserver === "undefined") {
      resolve();
      return;
    }
    const done = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      resolve();
    };
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && done(), {
      rootMargin,
    });
    const timer = window.setTimeout(done, fallbackMs);
    observer.observe(el);
  });
}
