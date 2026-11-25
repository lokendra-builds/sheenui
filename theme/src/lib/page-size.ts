/**
 * How many options fit in a list's scroll area (PageUp / PageDown move by that many): the inner height over the height
 * of one option, at least 1. `fallback` when the list has no layout yet. It does not depend on the scroll position.
 *
 * @internal
 */
export function pageSize(list: HTMLElement | null | undefined, optionHeight: number, fallback = 8): number {
  if (!list || list.clientHeight === 0 || optionHeight <= 0) return fallback;
  const style = getComputedStyle(list);
  const inner = list.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0);
  return Math.max(1, Math.floor(inner / optionHeight));
}
