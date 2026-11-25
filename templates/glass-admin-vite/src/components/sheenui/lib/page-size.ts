export function pageSize(list: HTMLElement | null | undefined, optionHeight: number, fallback = 8): number {
  if (!list || list.clientHeight === 0 || optionHeight <= 0) return fallback;
  const style = getComputedStyle(list);
  const inner = list.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0);
  return Math.max(1, Math.floor(inner / optionHeight));
}
