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
