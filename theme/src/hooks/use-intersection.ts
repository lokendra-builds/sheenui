/**
 * Watches `element` with one IntersectionObserver and calls `onChange` with the latest entry each time its
 * visibility changes (including the first report). Returns the cleanup function; a no-op where
 * IntersectionObserver does not exist (old browsers, test environments), so callers keep their own default
 * state for that case. The one place the library creates a single-target observer for pause-off-screen loops.
 *
 * @internal Call from an effect and return the result as its cleanup.
 * @example
 * ```tsx
 * import { useEffect, useRef, useState } from "react";
 * import { observeIntersection } from "./use-intersection";
 *
 * export function Seen() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const [seen, setSeen] = useState(false);
 *   useEffect(() => {
 *     const el = ref.current;
 *     return el ? observeIntersection(el, (entry) => setSeen(entry.isIntersecting)) : undefined;
 *   }, []);
 *   return <div ref={ref}>{seen ? "in view" : "off screen"}</div>;
 * }
 * ```
 *
 * @see /components
 */
export function observeIntersection(
  element: Element,
  onChange: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit,
): () => void {
  if (typeof IntersectionObserver === "undefined") return () => undefined;
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (entry) onChange(entry);
  }, options);
  observer.observe(element);
  return () => observer.disconnect();
}
