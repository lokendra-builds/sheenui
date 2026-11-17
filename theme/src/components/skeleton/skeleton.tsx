import type { ComponentProps, CSSProperties, ReactNode } from "react";

import { cn } from "../../lib/cn";

/* ---------- Primitive ---------- */

const radii = {
  rect: "rounded-sheen-md",
  text: "rounded-sheen-full",
  pill: "rounded-sheen-full",
  circle: "rounded-full",
} as const;

/** Shape of a `Skeleton`: `rect`, `text` (one line), `pill` or `circle`. */
export type SkeletonShape = keyof typeof radii;

/** Props of `Skeleton`: the native `<div>` props plus its own options, each documented on its field. */
export type SkeletonProps = Omit<ComponentProps<"div">, "children"> & {
  /** rect (rounded box, default), text (one line), pill (button / chip), circle (avatar). */
  shape?: SkeletonShape;
  /** CSS width: a number is px, a string is used as is ("60%", "12rem"). */
  width?: number | string;
  /** CSS height: a number is px, a string is used as is. Circles default to their width. */
  height?: number | string;
  /** Sweep of light across the shape. Never drawn under reduced motion. Default true. */
  shimmer?: boolean;
};

const size = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v);

/**
 * Skeleton: one placeholder shape that holds the layout while content loads. Use it (with `SkeletonGroup`, or a preset such as `SkeletonCard`) instead of a spinner when
 * you know what the content will look like.
 *
 * - `shape` is "rect" (default), "text" (one line), "pill" (button or chip) or "circle" (avatar); `width` and `height` take a number (px) or any CSS length; circles default to square.
 * - `shimmer` (default on) sweeps a soft band of light across the shape.
 * - It renders a `div` and accepts its props. No hooks, no client APIs: safe in React Server Components.
 *
 * Keyboard: none, it is not focusable. Accessibility: the shape is `aria-hidden`; wrap loading regions in `SkeletonGroup`, or give a preset its own `label`, so screen readers hear
 * "Loading" once. Set `aria-busy` on the container whose content is loading.
 * Glass and motion: no backdrop blur of its own. The shimmer is a soft band of light sweeping across the shapes, transform only (translateX + skew, the shared `sheen-shine` keyframes). Inside a
 * `SkeletonGroup` or a preset the band is positioned and sized by the group itself (each shape only clips it, with clip-path), so all shapes show one beam crossing the card at once, wherever they sit in
 * it. Under reduced motion (OS setting or the in-app toggle) the band is not drawn at all: the shapes are simply still. Forced colors outline each shape.
 *
 * @example
 * ```tsx
 * import { Skeleton, SkeletonGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SkeletonGroup labels={{ loading: "Loading profile" }} className="flex items-center gap-3">
 *       <Skeleton shape="circle" width={40} />
 *       <Skeleton shape="text" width="12rem" />
 *     </SkeletonGroup>
 *   );
 * }
 * ```
 *
 * @see /components/skeleton
 */
export function Skeleton({ shape = "rect", width, height, shimmer = true, className, style, ...props }: SkeletonProps) {
  const w = size(width);
  const h = size(height) ?? (shape === "circle" ? w : undefined);
  // A box sized by aspect-ratio has no height to hand down: the band takes the ratio instead.
  const ratio = h === undefined ? style?.aspectRatio : undefined;
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      data-shape={shape}
      {...props}
      style={{ width: w, height: h, ...style }}
      className={cn(
        // Standalone, a shape positions its own band. Inside a group it doesn't (static), so the
        // band is placed by the group; clip-path (border-box keeps the radius) clips it either way.
        "relative isolate shrink-0 overflow-hidden [clip-path:border-box] [[data-skeleton-group]_&]:static",
        // Two layers of the hover tint: visible on glass and on the bare page, in both themes.
        "bg-sheen-hover [background-image:linear-gradient(var(--sheen-hover),var(--sheen-hover))]",
        // A hairline top light, like the glass rim, so shapes sit "in" the surface.
        "shadow-[inset_0_1px_0_var(--sheen-glass-lowlight)]",
        shape === "text" && "h-3.5",
        shape === "pill" && "h-9 w-24",
        shape === "circle" && "aspect-square",
        radii[shape],
        // Windows High Contrast drops background tints: outline the shape instead.
        "forced-colors:border forced-colors:border-[GrayText]",
        className,
      )}
    >
      {shimmer && <Shimmer ratio={ratio} />}
    </div>
  );
}

/**
 * The band of light. Its horizontal box is the nearest SkeletonGroup / preset (or the shape
 * itself when standalone): left edge and width come from there, so every shape in a group
 * shows the same beam at the same moment. Vertically it sits on its own shape (static top,
 * the shape's height), which keeps each animated layer small.
 * Dark mode uses a brighter sheen than the glass highlight, so the sweep reads on dark glass.
 */
function Shimmer({ ratio }: { ratio?: CSSProperties["aspectRatio"] }) {
  return (
    <span
      aria-hidden
      style={ratio === undefined ? undefined : { aspectRatio: ratio, height: "auto" }}
      className={cn(
        "pointer-events-none absolute start-0 hidden h-[inherit] w-full",
        "[--sk-sheen:light-dark(var(--sheen-glass-sheen),color-mix(in_oklab,var(--sheen-fg)_16%,transparent))]",
        "bg-linear-to-r from-transparent from-35% via-(--sk-sheen) to-transparent to-65%",
        "motion-ok:block motion-ok:animate-[sheen-shine_var(--sheen-duration-loop-slow)_var(--sheen-ease-in-out)_infinite]",
        "forced-colors:hidden",
      )}
    />
  );
}

/* ---------- Group (the accessible loading region) ---------- */

/**
 * Props of `SkeletonGroup`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type SkeletonGroupProps = ComponentProps<"div"> & {
  /** Spoken text. `labels.loading` is what screen readers hear while this region loads (null when an outer region already announces it). */
  labels?: Partial<SkeletonLabels>;
};

/** The spoken text of the skeleton presets. `loading` is what a screen reader hears while a region loads; `null` removes the announcement (an outer region already makes it). */
export type SkeletonLabels = {
  loading: ReactNode | null;
};

/** English defaults of {@link SkeletonLabels}. Pass `labels` to translate or name a region ("Loading projects"). */
export const defaultSkeletonLabels: SkeletonLabels = {
  loading: "Loading…",
};

/**
 * Wraps skeleton shapes: a named loading region (`role="status"` with a visually hidden label) and the box the shimmer sweeps across in one beam. `labels.loading` is what screen readers hear
 * (default "Loading…"); pass `{ loading: null }` when an outer region already announces loading.
 *
 * Note: a live region that mounts together with its text is often not announced (NVDA, JAWS). To announce "Loading…" / "Loaded" reliably, also write it into a status region that stays mounted
 * (for example a toast announcer or your own `<div role="status">`), and set `aria-busy` on the container whose content is loading.
 *
 * Keyboard: none. Accessibility: the shapes inside are `aria-hidden`; the group is `role="status"` unless `labels.loading` is null. Glass and motion: see `Skeleton` (one shared shimmer beam; none under reduced motion).
 *
 * @example
 * ```tsx
 * import { SkeletonGroup, SkeletonRect, SkeletonText } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SkeletonGroup labels={{ loading: "Loading projects" }} className="grid gap-3">
 *       <SkeletonText lines={2} />
 *       <SkeletonRect ratio="16 / 9" />
 *     </SkeletonGroup>
 *   );
 * }
 * ```
 *
 * @see /components/skeleton
 */
export function SkeletonGroup({ labels, className, children, ...props }: SkeletonGroupProps) {
  const label = labels?.loading === undefined ? defaultSkeletonLabels.loading : labels.loading;
  return (
    <div
      data-slot="skeleton-group"
      data-skeleton-group=""
      role={label === null ? undefined : "status"}
      className={cn("relative", className)}
      {...props}
    >
      {label !== null && <span className="sr-only">{label}</span>}
      {children}
    </div>
  );
}

/* ---------- Text ---------- */

/** Natural-looking line widths (%), repeated; the last line is set by `lastLineWidth`. */
const LINE_WIDTHS = [100, 96, 98, 91, 99, 94] as const;

/** Each line is a box as tall as the text's line height, with the bar centred in it. */
const textSizes = {
  xs: { box: "h-4", bar: "h-2.5" }, // 12px text, 16px lines
  sm: { box: "h-5", bar: "h-3" }, // 14px text, 20px lines
  md: { box: "h-6", bar: "h-3.5" }, // 16px text, 24px lines
  lg: { box: "h-7", bar: "h-4" }, // 18px text, 28px lines
  /** A heading: one thick bar in a 32px line. */
  heading: { box: "h-8", bar: "h-6" },
} as const;

/**
 * Props of `SkeletonText`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type SkeletonTextProps = Omit<ComponentProps<"div">, "children"> & {
  /** Number of lines (0 renders none). Default 3. */
  lines?: number;
  /** Matches the text it stands in for: xs 12px … lg 18px body text, or a heading. Default "md". */
  size?: keyof typeof textSizes;
  /** Width of the last line (it is usually shorter). Default "62%". */
  lastLineWidth?: string;
  /** Sets the sweep of light across the lines. Default true. */
  shimmer?: boolean;
  /** When `labels.loading` is set, the block announces itself as a loading region (role="status"). */
  labels?: Partial<SkeletonLabels>;
};

/**
 * Lines of text. Widths vary a little (deterministically, so server and client agree). Text skeletons are measured in line boxes (a 20px box for 14px text, and so on), so N skeleton lines are exactly as tall
 * as N lines of the text they stand in for.
 *
 * `lines` (default 3), `size` ("xs" to "lg" body text, or "heading"), `lastLineWidth` and `shimmer` shape it. When `labels.loading` is set, the block announces itself as a loading region (`role="status"`);
 * without it, put it inside a `SkeletonGroup`.
 *
 * Keyboard: none. Accessibility: decorative lines, `aria-hidden`; see `SkeletonGroup`. Glass and motion: see `Skeleton`.
 *
 * @example
 * ```tsx
 * import { SkeletonText } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SkeletonText lines={4} size="sm" labels={{ loading: "Loading article" }} />
 *   );
 * }
 * ```
 *
 * @see /components/skeleton
 */
export function SkeletonText({ labels, className, ...props }: SkeletonTextProps) {
  // Standalone, the block is its own shimmer box.
  if (labels?.loading === undefined) return <Lines group className={className} {...props} />;
  return (
    <SkeletonGroup labels={labels} className={className}>
      <Lines {...props} />
    </SkeletonGroup>
  );
}

function Lines({
  lines = 3,
  size: sz = "md",
  lastLineWidth = "62%",
  shimmer = true,
  group = false,
  className,
  ...props
}: Omit<SkeletonTextProps, "labels"> & { group?: boolean }) {
  const count = Math.max(0, Math.floor(lines));
  const { box, bar } = textSizes[sz];
  return (
    <div
      data-slot="skeleton-text"
      data-skeleton-group={group ? "" : undefined}
      className={cn("flex w-full flex-col", group && "relative", className)}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn("flex items-center", box)}>
          <Skeleton
            shape="text"
            shimmer={shimmer}
            className={bar}
            width={
              count > 1 && i === count - 1
                ? lastLineWidth
                : sz === "heading"
                  ? "55%"
                  : `${LINE_WIDTHS[i % LINE_WIDTHS.length]}%`
            }
          />
        </div>
      ))}
    </div>
  );
}

/** One line of a name / meta pair in the presets: a bar in a line box. */
function LineBar({ box, bar, width, shimmer }: { box: string; bar: string; width: string; shimmer: boolean }) {
  return (
    <div className={cn("flex items-center", box)}>
      <Skeleton shape="text" width={width} shimmer={shimmer} className={bar} />
    </div>
  );
}

/* ---------- Circle and rect ---------- */

const circleSizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 } as const;

/**
 * Props of `SkeletonCircle`: the props of `Skeleton` minus the ones it sets itself, plus its own
 * options.
 */
export type SkeletonCircleProps = Omit<SkeletonProps, "shape" | "width" | "height"> & {
  /** Sets the size: xs 24 · sm 32 · md 40 (default) · lg 48 · xl 64 px. */
  size?: keyof typeof circleSizes;
};

/**
 * An avatar or icon placeholder: a `Skeleton` circle. `size` is "xs" (24) to "xl" (64) px (default "md", 40).
 *
 * Keyboard: none. Accessibility: decorative, `aria-hidden`. Glass and motion: see `Skeleton`.
 *
 * @example
 * ```tsx
 * import { SkeletonCircle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SkeletonCircle size="lg" />
 *   );
 * }
 * ```
 *
 * @see /components/skeleton
 */
export function SkeletonCircle({ size: sz = "md", ...props }: SkeletonCircleProps) {
  const px = circleSizes[sz];
  return <Skeleton shape="circle" width={px} height={px} {...props} />;
}

/**
 * Props of `SkeletonRect`: the props of `Skeleton` minus the ones it sets itself, plus its own
 * options.
 */
export type SkeletonRectProps = Omit<SkeletonProps, "shape"> & {
  /** CSS aspect ratio, e.g. "16 / 9" (media) or "1" (square). Ignored when `height` is set. */
  ratio?: string;
};

/**
 * A box: media, a chart, a thumbnail. Full width by default. Give it a `height`, or a CSS aspect `ratio` such as "16 / 9" (ignored when `height` is set), so it holds its place.
 *
 * Keyboard: none. Accessibility: decorative, `aria-hidden`. Glass and motion: see `Skeleton`.
 *
 * @example
 * ```tsx
 * import { SkeletonRect } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SkeletonRect ratio="16 / 9" />
 *   );
 * }
 * ```
 *
 * @see /components/skeleton
 */
export function SkeletonRect({ ratio, height, width = "100%", style, ...props }: SkeletonRectProps) {
  const ratioStyle: CSSProperties | undefined = ratio && height === undefined ? { aspectRatio: ratio } : undefined;
  return <Skeleton shape="rect" width={width} height={height} style={{ ...ratioStyle, ...style }} {...props} />;
}

/* ---------- Presets ---------- */

/**
 * Props of `SkeletonCard`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type SkeletonCardProps = Omit<ComponentProps<"div">, "children"> & {
  /** Shows a 16:9 media block on top. Default true. */
  media?: boolean;
  /** An avatar with a name and a meta line. Default true. */
  avatar?: boolean;
  /** Sets the number of body text lines (14px text; 0 for none). Default 3. */
  lines?: number;
  /** Number of pill buttons in the footer, sized like small buttons (0 for none). Default 2. */
  actions?: number;
  /** glass: its own glass card (default). plain: shapes only, to drop into your own card. */
  surface?: "glass" | "plain";
  /** Sets the sweep of light across the shapes. Default true. */
  shimmer?: boolean;
  /** Spoken text: `labels.loading` is heard while loading (null when an outer SkeletonGroup already announces it). Default "Loading…". */
  labels?: Partial<SkeletonLabels>;
};

/**
 * A content card preset: media, author row, text and actions, in a `SkeletonGroup`. Turn parts off with `media`, `avatar`, `lines` (0 for none) and `actions` (0 for none); `surface` is "glass" (its own glass
 * card, default) or "plain" (shapes only, to drop into your own card). `labels.loading` is spoken while loading (null when an outer group announces it).
 *
 * Keyboard: none. Accessibility: one `role="status"` region named by `labels.loading`. Glass and motion: "glass" is one `glass-2` surface; the shapes share one shimmer beam (none under reduced motion).
 *
 * @example
 * ```tsx
 * import { SkeletonCard } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SkeletonCard media={false} lines={2} actions={1} labels={{ loading: "Loading post" }} />
 *   );
 * }
 * ```
 *
 * @see /components/skeleton
 */
export function SkeletonCard({
  media = true,
  avatar = true,
  lines = 3,
  actions = 2,
  surface = "glass",
  shimmer = true,
  labels,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <SkeletonGroup
      labels={labels}
      data-slot="skeleton-card"
      className={cn("flex w-full flex-col gap-5", surface === "glass" && "glass-2 rounded-sheen-lg p-5", className)}
      {...props}
    >
      {media && <SkeletonRect ratio="16 / 9" shimmer={shimmer} className="rounded-sheen-md" />}
      {avatar && (
        // A 40px avatar beside a 14px name (20px line) and a 12px meta line (16px).
        <div className="flex items-center gap-3">
          <SkeletonCircle size="md" shimmer={shimmer} />
          <div className="flex min-w-0 flex-1 flex-col">
            <LineBar box="h-5" bar="h-3.5" width="42%" shimmer={shimmer} />
            <LineBar box="h-4" bar="h-2.5" width="28%" shimmer={shimmer} />
          </div>
        </div>
      )}
      {lines > 0 && <Lines lines={lines} size="sm" shimmer={shimmer} />}
      {actions > 0 && (
        // As tall as small buttons (32px).
        <div className="flex gap-2.5">
          {Array.from({ length: actions }, (_, i) => (
            <Skeleton key={i} shape="pill" width={i === 0 ? 104 : 84} shimmer={shimmer} className="h-8" />
          ))}
        </div>
      )}
    </SkeletonGroup>
  );
}

/**
 * Props of `SkeletonList`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type SkeletonListProps = Omit<ComponentProps<"div">, "children"> & {
  /** Number of rows (0 renders none). Default 4. */
  rows?: number;
  /** Avatar circle at the start of each row. Default true. */
  avatar?: boolean;
  /** A trailing pill (a status badge or button) at the end of each row. Default true. */
  trailing?: boolean;
  /** "glass" puts each row on a glass surface, "plain" draws the shapes alone. Default "glass". */
  surface?: "glass" | "plain";
  /** Sets the sweep of light across the shapes. Default true. */
  shimmer?: boolean;
  /** Spoken text: `labels.loading` is heard while loading (null when an outer SkeletonGroup already announces it). Default "Loading…". */
  labels?: Partial<SkeletonLabels>;
};

/**
 * Rows of a list, inbox or table: avatar, two lines, a trailing pill, in a `SkeletonGroup`. `rows` (default 4), `avatar`, `trailing` and `surface` ("glass" or "plain") shape it; `labels.loading` is spoken while loading.
 *
 * Keyboard: none. Accessibility: one `role="status"` region named by `labels.loading`. Glass and motion: "glass" is one `glass-2` surface; the rows share one shimmer beam (none under reduced motion).
 *
 * @example
 * ```tsx
 * import { SkeletonList } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SkeletonList rows={5} trailing={false} labels={{ loading: "Loading messages" }} />
 *   );
 * }
 * ```
 *
 * @see /components/skeleton
 */
export function SkeletonList({
  rows = 4,
  avatar = true,
  trailing = true,
  surface = "glass",
  shimmer = true,
  labels,
  className,
  ...props
}: SkeletonListProps) {
  return (
    <SkeletonGroup
      labels={labels}
      data-slot="skeleton-list"
      className={cn("flex w-full flex-col", surface === "glass" && "glass-2 rounded-sheen-lg px-5 py-1", className)}
      {...props}
    >
      {Array.from({ length: Math.max(0, Math.floor(rows)) }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-sheen-border py-4 last:border-0">
          {avatar && <SkeletonCircle size="md" shimmer={shimmer} />}
          <div className="flex min-w-0 flex-1 flex-col">
            <LineBar box="h-5" bar="h-3.5" width={`${[48, 36, 54, 40][i % 4]}%`} shimmer={shimmer} />
            <LineBar box="h-4" bar="h-2.5" width={`${[72, 64, 80, 58][i % 4]}%`} shimmer={shimmer} />
          </div>
          {trailing && <Skeleton shape="pill" width={64} shimmer={shimmer} className="h-6" />}
        </div>
      ))}
    </SkeletonGroup>
  );
}
