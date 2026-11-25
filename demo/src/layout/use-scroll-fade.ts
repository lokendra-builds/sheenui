import { useEffect, useRef } from "react";

/**
 * Marks which edges of a sideways-scrolling region still hide content (`data-fade="end"`, `"start"`, `"both"`), so the CSS
 * (`.scroll-fade` and `.home-cta__cmd` in index.css) can fade exactly those edges: the cue that a region scrolls, with no extra text.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const x = Math.abs(el.scrollLeft);
      const start = x > 4;
      const end = max - x > 4;
      el.dataset.fade = start && end ? "both" : start ? "start" : end ? "end" : "none";
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  return ref;
}
