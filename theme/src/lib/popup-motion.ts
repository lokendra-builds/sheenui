/**
 * Shared enter/exit recipe for every anchored popup (Select, Combobox, Menu, Popover, HoverCard) and the
 * dialog family, so the whole popup family moves as one.
 *
 * - `popupMotion`: opens with a 150 ms fade, a scale from 0.96 and a 4 px drift out of the anchor side, on the
 *   `snappy` spring twin; closes in 100 ms (fade + scale to 0.98, `ease.exit`, no travel). Needs
 *   `origin-(--transform-origin)` on the popup. Menus and hover cards add `data-instant:transition-none` themselves
 *   (closed by Escape or an outside press).
 * - `tooltipMotion`: a 150 ms fade and a 2 px rise (no scale); closes in 100 ms.
 * - `dialogMotion`: for centred dialogs (which already use `translate` for centring): a 150 ms fade, scale 0.96
 *   and an 8 px rise on `smooth` (never bouncy on modals); closes in 150 ms.
 *
 * Reduced motion: transforms are removed by the global rule, the opacity fades stay (150 ms or less).
 *
 * The motion rules are described on the docs site (/foundations).
 */
export const popupMotion = [
  "[transition:opacity_var(--sheen-duration-fast)_var(--sheen-ease-out),scale_var(--sheen-duration-snappy)_var(--sheen-ease-snappy),translate_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)]",
  "data-starting-style:opacity-0 motion-ok:data-starting-style:scale-[0.96]",
  "motion-ok:data-[side=bottom]:data-starting-style:-translate-y-1 motion-ok:data-[side=top]:data-starting-style:translate-y-1",
  "motion-ok:data-[side=left]:data-starting-style:translate-x-1 motion-ok:data-[side=right]:data-starting-style:-translate-x-1",
  "data-ending-style:[transition:opacity_var(--sheen-duration-exit-fast)_var(--sheen-ease-exit),scale_var(--sheen-duration-exit-fast)_var(--sheen-ease-exit)]",
  "data-ending-style:opacity-0 motion-ok:data-ending-style:scale-[0.98]",
].join(" ");

/** Tooltip recipe: see {@link popupMotion}. A 150 ms fade with a 2 px rise from the anchor side, a 100 ms exit. */
export const tooltipMotion = [
  "[transition:opacity_var(--sheen-duration-fast)_var(--sheen-ease-out),translate_var(--sheen-duration-fast)_var(--sheen-ease-out)]",
  "data-starting-style:opacity-0",
  "motion-ok:data-[side=bottom]:data-starting-style:-translate-y-0.5 motion-ok:data-[side=top]:data-starting-style:translate-y-0.5",
  "motion-ok:data-[side=left]:data-starting-style:translate-x-0.5 motion-ok:data-[side=right]:data-starting-style:-translate-x-0.5",
  "data-ending-style:[transition:opacity_var(--sheen-duration-exit-fast)_var(--sheen-ease-exit)]",
  "data-ending-style:opacity-0",
  "data-instant:transition-none",
].join(" ");

/** Dialog recipe: see {@link popupMotion}. Uses `transform` for the rise because the popup centres with `translate`. */
export const dialogMotion = [
  "[transition:opacity_var(--sheen-duration-fast)_var(--sheen-ease-out),scale_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),transform_var(--sheen-duration-smooth)_var(--sheen-ease-smooth)]",
  "data-starting-style:opacity-0 motion-ok:data-starting-style:scale-[0.96] motion-ok:data-starting-style:[transform:translateY(8px)]",
  "data-ending-style:[transition:opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit),scale_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
  "data-ending-style:opacity-0 motion-ok:data-ending-style:scale-[0.98]",
].join(" ");
