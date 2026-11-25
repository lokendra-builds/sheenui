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
