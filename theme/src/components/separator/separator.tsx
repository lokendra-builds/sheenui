"use client";

import type { ComponentProps, ReactNode } from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";

import { cn } from "../../lib/cn";

/**
 * Props of `Separator`: the Base UI `Separator` props plus SheenUI's own options, each documented on
 * its field.
 */
export type SeparatorProps = Omit<ComponentProps<typeof BaseSeparator>, "className" | "children" | "render"> & {
  /** Direction of the line. Vertical separators stretch to the height of their row. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** "line" hairline (default), "fade" softens toward the ends, "dashed" for looser groupings. */
  variant?: "line" | "fade" | "dashed";
  /** Text or node in the middle of the line, e.g. "or", "Today". */
  label?: ReactNode;
  /** Where the label sits along the line. Default "center". */
  labelAlign?: "start" | "center" | "end";
  /** "text" (default) or "pill": the label sits in a small glass chip. */
  labelVariant?: "text" | "pill";
  /** Purely visual: hidden from assistive tech (no role="separator"). */
  decorative?: boolean;
  /** Extra classes for the outer element, merged after the built-in ones so they can override its spacing or color. */
  className?: string;
  /** Adds a class name to the label element. */
  labelClassName?: string;
};

type Orientation = NonNullable<SeparatorProps["orientation"]>;
type Variant = NonNullable<SeparatorProps["variant"]>;
/** Which way a "fade" line fades: toward both ends, or away from a label at its start / end. */
type Fade = "both" | "to-start" | "to-end";

/** A single line segment. `fade` decides which end(s) of a "fade" line go transparent. */
function lineClass(orientation: Orientation, variant: Variant, fade: Fade) {
  const h = orientation === "horizontal";
  if (variant === "dashed") {
    return cn(h ? "h-0 border-t" : "w-0 border-s", "border-dashed border-sheen-fg-subtle/45");
  }
  if (variant === "line") {
    return cn(h ? "h-0 border-t" : "w-0 border-s", "border-sheen-border");
  }
  // "fade": a gradient that peaks at the label (or the middle). High contrast drops
  // gradients, so it falls back to a real border there.
  const peak = "via-sheen-fg-subtle/40 from-transparent to-transparent";
  const dir = h ? "bg-linear-to-r rtl:bg-linear-to-l" : "bg-linear-to-b";
  return cn(
    h ? "h-px" : "w-px",
    dir,
    fade === "both" && peak,
    // Line before a centred label: transparent → peak. Line after it: peak → transparent.
    fade === "to-start" && "from-transparent to-sheen-fg-subtle/40",
    fade === "to-end" && "from-sheen-fg-subtle/40 to-transparent",
    "forced-colors:bg-none",
    h ? "forced-colors:border-t" : "forced-colors:border-s",
  );
}

/**
 * Separator: a hairline between groups of content, built on Base UI's Separator
 * (role="separator" with aria-orientation). Use it to divide sections, menu groups or inline items.
 *
 * - `<Separator />` is a hairline; `variant="fade"` fades out at both ends (glass-friendly); `variant="dashed"` for looser groupings.
 * - `label="or"` makes a labelled divider ("Continue with Google · or · Email"); `labelAlign` and
 *   `labelVariant="pill"` place and style it.
 * - `orientation="vertical"` sits between inline items and stretches to the row height.
 * - `decorative` removes the separator role for purely visual lines.
 *
 * Keyboard: none, it is not focusable. Accessibility: a separator's children are presentational to assistive
 * tech, so a labelled separator is named with `aria-label` (the label text when it is a string; pass
 * `aria-label` yourself otherwise). Lines are drawn with borders (or a gradient with a border fallback), so they
 * stay visible in Windows High Contrast, where background colours are replaced.
 * Glass and motion: a flat line with no backdrop blur and no motion. The "pill" label is a small glass chip.
 *
 * @example
 * ```tsx
 * import { Separator } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Separator />
 *       <Separator label="or" />
 *       <div className="flex h-6 items-center gap-3">
 *   Docs <Separator orientation="vertical" /> Blog
 *       </div>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /layout/separator
 */
export function Separator({
  orientation = "horizontal",
  variant = "line",
  label,
  labelAlign = "center",
  labelVariant = "text",
  decorative = false,
  className,
  labelClassName,
  ...props
}: SeparatorProps) {
  const h = orientation === "horizontal";
  const hasLabel = label !== undefined && label !== null && label !== false && label !== "";

  // Plain line: the element itself is the line.
  if (!hasLabel) {
    const lineClasses = cn(
      lineClass(orientation, variant, "both"),
      h ? "w-full" : "self-stretch min-h-4",
      "shrink-0",
      className,
    );
    if (decorative) {
      return <div aria-hidden data-slot="separator" data-orientation={orientation} className={lineClasses} />;
    }
    return <BaseSeparator data-slot="separator" orientation={orientation} className={lineClasses} {...props} />;
  }

  const name =
    props["aria-label"] ?? (typeof label === "string" || typeof label === "number" ? String(label) : undefined);
  // Segments either side of the label. A short lead-in keeps a start/end label off the very edge.
  const before = labelAlign === "start" ? (h ? "w-3 flex-none" : "h-3 flex-none") : "flex-1";
  const after = labelAlign === "end" ? (h ? "w-3 flex-none" : "h-3 flex-none") : "flex-1";

  const content = (
    <>
      <span aria-hidden className={cn(lineClass(orientation, variant, "to-start"), before, "min-w-0")} />
      <span
        aria-hidden={decorative || undefined}
        className={cn(
          "shrink-0 text-xs font-medium text-sheen-fg-muted select-none",
          labelVariant === "pill" && "glass-1 rounded-sheen-full px-2.5 py-0.5 text-2xs tracking-wide",
          !h && "py-1",
          labelClassName,
        )}
      >
        {label}
      </span>
      <span aria-hidden className={cn(lineClass(orientation, variant, "to-end"), after, "min-w-0")} />
    </>
  );

  const wrapperClasses = cn(
    "flex shrink-0 items-center",
    h ? "w-full flex-row gap-3" : "min-h-16 flex-col self-stretch gap-2",
    className,
  );

  if (decorative) {
    return (
      <div aria-hidden data-slot="separator" data-orientation={orientation} className={wrapperClasses}>
        {content}
      </div>
    );
  }

  return (
    <BaseSeparator
      data-slot="separator"
      orientation={orientation}
      aria-label={name}
      className={wrapperClasses}
      {...props}
    >
      {content}
    </BaseSeparator>
  );
}
