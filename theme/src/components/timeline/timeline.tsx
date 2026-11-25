"use client";

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { motion, useInView, type Transition } from "motion/react";

import { cn } from "../../lib/cn";
import { NoScriptReveal } from "../../lib/no-script-reveal";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, ease, spring } from "../../motion/tokens";
import { useLoopPlayback } from "../../motion/gate";

/** Colour role of a timeline item: "neutral", "accent", "success", "warning" or "danger". */
export type TimelineTone = "neutral" | "accent" | "success" | "warning" | "danger";
/** "box": an icon disc or an avatar (--tl-marker). "dot": a small dot (--tl-dot). Mirrored in data-marker. */
type MarkerKind = "box" | "dot";

type TimelineContextValue = {
  size: "sm" | "md";
  layout: "start" | "alternate";
  animated: boolean;
  /** Reserves a slot in the entrance queue; returns its delay in seconds. */
  reserve: () => number;
};

const TimelineContext = createContext<TimelineContextValue>({
  size: "md",
  layout: "start",
  animated: false,
  reserve: () => 0,
});

/** Where an item sits: its index among items (for alternate sides). */
type PositionValue = { index: number };
const PositionContext = createContext<PositionValue>({ index: 0 });

/** Delay between items that come into view together. */
const STAGGER_MS = 80;

/** The transition, or an instant one when animation is off (reduced motion switched on at runtime included). */
function motionOr(animated: boolean, transition: Transition): Transition {
  return animated ? transition : { duration: 0 };
}

/** Props of `Timeline`: the native `<ol>` props plus its own options, each documented on its field. */
export type TimelineProps = Omit<ComponentProps<"ol">, "className"> & {
  /** "start" (default): markers on the inline start. "alternate": zig-zag around a centred rail on wide containers. */
  layout?: "start" | "alternate";
  /** Sets the marker and text size. Default "md". */
  size?: "sm" | "md";
  /** Animate items as they scroll into view. Always off under reduced motion. Default true. */
  animate?: boolean;
  /** Extra classes for the `<ol>` that holds the items (set its spacing or width here). */
  className?: string;
};

/**
 * Timeline: a vertical activity feed (audit logs, order tracking, changelogs, comments). Compose `TimelineItem`s (and `TimelineHeading` group labels) inside it. Pass `aria-label` to name the list.
 *
 * Markers: an icon in a tinted disc (`icon` + `tone`), an avatar (`avatar`, optionally with a small `icon` badge, like "commented"), or a small dot for minor events.
 *
 * Connectors: each item draws the line to the next one. `connector="dashed"` for what has not happened yet, `"accent"` for a completed path (order tracking). The line stops short of every marker with the same gap whatever the markers' sizes, and it breaks
 * at a `TimelineHeading`. The geometry comes from CSS (each item looks at the next item in the DOM), so items wrapped in your own components (`<FeedItem event={e} />` rendering a `TimelineItem`) work the same.
 *
 * Layout: "start" (markers on the inline start) or "alternate" (zig-zag around a centred rail with the timestamp on the opposite side). Alternate falls back to "start" when the timeline's own width is under 42rem (a container query), so it never squeezes on phones.
 * `size` is "sm" or "md"; `animate` turns the entrance animation off.
 *
 * Keyboard: the list itself is not focusable; links and buttons inside items are normal tab stops. Accessibility: an `<ol>` (pass `aria-label`); timestamps are `<time dateTime>` when `dateTime` is given (plain text otherwise); `current` marks the live step with `aria-current="step"`.
 * Glass and motion: markers and headings are flat or `glass-1` chips. As each item scrolls into view its marker pops in, its line draws down to the next item and its text rises line by line out of a clip, staggered when several arrive together. New items pushed onto a live feed slide
 * the rest down. Only transforms animate on anything that may hold glass (titles can hold a Badge; `children` may be glass cards), so their blur is never lost to a fading ancestor. Reduced motion: no animation. Printing shows everything.
 *
 * @example
 * ```tsx
 * import { Timeline, TimelineHeading, TimelineItem } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const GitMergeIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <Timeline aria-label="Activity">
 *       <TimelineHeading>Today</TimelineHeading>
 *       <TimelineItem icon={<GitMergeIcon />} tone="accent" title="Ada merged #42" time="2h ago" dateTime="2026-10-30T09:12" />
 *       <TimelineItem title="Viewed by Linus" time="5h ago" />
 *     </Timeline>
 *   );
 * }
 * ```
 *
 * @see /layout/timeline
 */
export function Timeline({
  layout = "start",
  size = "md",
  animate = true,
  className,
  children,
  style,
  ...props
}: TimelineProps) {
  const reduced = useSheenReducedMotion();
  const animated = animate && !reduced;
  // The time (ms) at which the next entrance slot is free.
  const queue = useRef(0);
  const reserve = () => {
    const now = performance.now();
    const start = Math.max(now, queue.current);
    queue.current = start + STAGGER_MS;
    return (start - now) / 1000;
  };

  const nodes = Children.toArray(children);
  let itemIndex = 0;

  const vars = {
    "--tl-marker": size === "sm" ? "1.75rem" : "2rem",
    "--tl-dot": "0.625rem",
    "--tl-gap": "0.25rem",
    ...style,
  } as CSSProperties;

  return (
    <TimelineContext value={{ size, layout, animated, reserve }}>
      <ol
        data-slot="timeline"
        data-layout={layout}
        className={cn("@container/timeline flex w-full min-w-0 flex-col", className)}
        style={vars}
        {...props}
      >
        {nodes.map((node, i) => {
          if (!isValidElement(node)) return node;
          const isHeading = node.type === TimelineHeading;
          const position: PositionValue = { index: isHeading ? -1 : itemIndex };
          if (!isHeading) itemIndex++;
          return (
            <PositionContext key={(node as ReactElement).key ?? i} value={position}>
              {node}
            </PositionContext>
          );
        })}
      </ol>
      <NoScriptReveal />
    </TimelineContext>
  );
}

/* ---------- Item ---------- */

/** Props of `TimelineItem`: the native `<li>` props plus its own options, each documented on its field. */
export type TimelineItemProps = Omit<ComponentProps<"li">, "title" | "className" | "children"> & {
  /** What happened. Rich content is fine: "<b>Ada</b> merged <a>#42</a>". */
  title: ReactNode;
  /** Sets when it happened, as shown ("2h ago", "Oct 30, 09:12"). */
  time?: ReactNode;
  /** Machine-readable date for the <time> element (and its hover title). */
  dateTime?: string | Date;
  /** Locale for the full date in the hover title. */
  locale?: string;
  /** Shows supporting text under the title. */
  description?: ReactNode;
  /** Icon in a tinted disc. With `avatar`, a small badge on the avatar instead. */
  icon?: ReactNode;
  /** An avatar as the marker, e.g. <Avatar name="Ada Lovelace" size="sm" />. */
  avatar?: ReactNode;
  /** Colour of the marker: "neutral" (default), "accent", "success", "warning" or "danger". */
  tone?: TimelineTone;
  /** The live step (order tracking): a soft pulse and aria-current="step". Default false. */
  current?: boolean;
  /** Line from this item to the next: "solid" (default), "dashed" for not-yet-happened, "accent" for a completed path. */
  connector?: "solid" | "dashed" | "accent";
  /** Extra content under the text: a comment, attachments, a diff. Moves in, never fades (safe for glass). */
  children?: ReactNode;
  /** Extra classes for the `<li>` of this entry (set its spacing or tone here). */
  className?: string;
  /** Adds a class name to the content column. */
  contentClassName?: string;
};

const toneStyles: Record<TimelineTone, string> = {
  neutral: "border-sheen-border text-sheen-fg-muted [--tint:var(--sheen-hover)]",
  accent: "border-sheen-accent-border text-sheen-accent [--tint:var(--sheen-accent-soft)]",
  success: "border-sheen-success/40 text-sheen-success-text [--tint:var(--sheen-success-soft)]",
  warning: "border-sheen-warning/50 text-sheen-warning-text [--tint:var(--sheen-warning-soft)]",
  danger: "border-sheen-danger/40 text-sheen-danger-text [--tint:var(--sheen-danger-soft)]",
};

const dotStyles: Record<TimelineTone, string> = {
  neutral: "bg-sheen-fg-subtle",
  accent: "bg-sheen-accent",
  success: "bg-sheen-success",
  warning: "bg-sheen-warning",
  danger: "bg-sheen-danger",
};

const haloStyles: Record<TimelineTone, string> = {
  neutral: "bg-sheen-fg-subtle/30",
  accent: "bg-sheen-accent/30",
  success: "bg-sheen-success/35",
  warning: "bg-sheen-warning/40",
  danger: "bg-sheen-danger/35",
};

/** A near-opaque disc with a tint, so icons keep their contrast on any backdrop. */
const disc = "bg-sheen-surface/90 [background-image:linear-gradient(var(--tint),var(--tint))]";

function isoOf(value: string | Date | undefined) {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
}

function fullDate(value: string | Date | undefined, locale?: string) {
  if (value === undefined) return undefined;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/**
 * One event in a `Timeline`: a marker, a `title` ("what happened", rich content is fine), a `time` ("2h ago") with an optional machine-readable `dateTime` (also shown in full as the hover title, in `locale`), an optional `description`, and `children` for extra content under the text
 * (a comment, attachments, a diff; it moves in and never fades, so glass inside keeps its blur). The marker is an `icon` disc, an `avatar`, or a small dot when there is neither; `tone` colours it; `current` marks the live step; `connector` styles the line to the next item.
 *
 * Keyboard: not focusable itself. Accessibility: an `<li>` with `<time>`; the live step has `aria-current="step"`; markers are decorative. Glass and motion: see `Timeline` (marker pop, line draw, text rise; transforms only on glass; none under reduced motion).
 *
 * @example
 * ```tsx
 * import { Avatar, TimelineItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TimelineItem
 *       avatar={<Avatar name="Grace Hopper" size="sm" />}
 *       title="Grace commented"
 *       time="3h ago"
 *       connector="dashed"
 *     >
 *       <p>Looks good to me.</p>
 *     </TimelineItem>
 *   );
 * }
 * ```
 *
 * @see /layout/timeline
 */
export function TimelineItem({
  title,
  time,
  dateTime,
  locale,
  description,
  icon,
  avatar,
  tone = "neutral",
  current = false,
  connector = "solid",
  className,
  contentClassName,
  children,
  style,
  ...props
}: TimelineItemProps) {
  const { size, layout, animated, reserve } = useContext(TimelineContext);
  const { index } = useContext(PositionContext);
  const kind: MarkerKind = avatar || icon ? "box" : "dot";
  const side = layout === "alternate" && index % 2 === 1 ? "end" : "start";

  // Entrance: once the item is (partly) in view, take the next slot in the stagger queue.
  const ref = useRef<HTMLLIElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [delay, setDelay] = useState<number | null>(null);
  // Reserve once, even when effects run twice (StrictMode), so the stagger stays even.
  const reserved = useRef<number | null>(null);
  useEffect(() => {
    if (!animated || !inView || delay !== null) return;
    reserved.current ??= reserve();
    setDelay(reserved.current);
  }, [animated, inView, delay, reserve]);
  const shown = !animated || delay !== null;
  const d = delay ?? 0;
  const state = shown ? "shown" : "hidden";
  const initial = animated ? "hidden" : false;

  const hasTime = time !== undefined && time !== null && time !== false;
  const timeNode = hasTime ? (
    <TimeText dateTime={dateTime} locale={locale} className="shrink-0 text-xs text-sheen-fg-subtle tabular-nums">
      {time}
    </TimeText>
  ) : null;

  // Geometry of the line to the next item: it leaves this marker and stops short of the next
  // one by the same gap, whatever size each marker is. --tl-next comes from CSS on the <li>
  // (the next sibling's data-marker), so wrapped items need no help.
  const lineVars = {
    "--tl-self": kind === "dot" ? "var(--tl-dot)" : "var(--tl-marker)",
    ...style,
  } as CSSProperties;

  const alt = layout === "alternate";

  return (
    <motion.li
      ref={ref}
      layout={animated ? "position" : false}
      transition={motionOr(animated, spring.gentle)}
      data-slot="timeline-item"
      data-marker={kind}
      data-side={side}
      aria-current={current ? "step" : undefined}
      style={lineVars}
      className={cn(
        "group/tl relative grid min-w-0 grid-cols-[var(--tl-marker)_minmax(0,1fr)] gap-x-3.5",
        size === "sm" && "gap-x-3",
        alt && "@2xl/timeline:grid-cols-[minmax(0,1fr)_var(--tl-marker)_minmax(0,1fr)] @2xl/timeline:gap-x-6",
        // Size of the next item's marker, read from the DOM: a dot unless the next item has a box.
        "[--tl-next:var(--tl-dot)] has-[+[data-marker=box]]:[--tl-next:var(--tl-marker)]",
        "print:transform-none!",
        className,
      )}
      {...(props as Omit<ComponentProps<typeof motion.li>, "style">)}
    >
      {/* Line to the next item: none after the last item or before a heading. */}
      <motion.span
        aria-hidden
        data-slot="timeline-connector"
        initial={initial}
        animate={state}
        variants={{ hidden: { scaleY: 0 }, shown: { scaleY: 1 } }}
        transition={motionOr(animated, { duration: duration.slower, ease: ease.out, delay: d + 0.12 })}
        className={cn(
          "pointer-events-none absolute start-[calc(var(--tl-marker)/2-1px)] w-0.5 origin-top rounded-full",
          "top-[calc(var(--tl-marker)/2+var(--tl-self)/2+var(--tl-gap))] bottom-[calc((var(--tl-marker)/2-var(--tl-next)/2-var(--tl-gap))*-1)]",
          "group-last/tl:hidden group-has-[+[data-slot=timeline-heading]]/tl:hidden",
          alt && "@2xl/timeline:start-[calc(50%-1px)]",
          connector === "solid" && "bg-sheen-fg-subtle/30 forced-colors:bg-[GrayText]",
          connector === "dashed" &&
            "bg-[repeating-linear-gradient(to_bottom,var(--sheen-fg-subtle)_0_4px,transparent_4px_9px)] opacity-60 forced-colors:bg-[repeating-linear-gradient(to_bottom,GrayText_0_4px,transparent_4px_9px)]",
          connector === "accent" && "sheen-fill [background-image:var(--sheen-accent-fill)]",
          "forced-colors:[forced-color-adjust:none] print:transform-none!",
        )}
      />

      {/* Marker. */}
      <div
        data-slot="timeline-marker"
        className={cn(
          "relative col-start-1 row-start-1 flex size-(--tl-marker) items-center justify-center self-start",
          alt && "@2xl/timeline:col-start-2",
        )}
      >
        {current && <Halo tone={tone} animated={animated} />}
        <motion.span
          initial={initial}
          animate={state}
          variants={{ hidden: { scale: 0 }, shown: { scale: 1 } }}
          transition={motionOr(animated, { ...spring.bouncy, delay: d })}
          className="relative flex items-center justify-center print:transform-none!"
        >
          <Marker kind={kind} icon={icon} avatar={avatar} tone={tone} size={size} current={current} />
        </motion.span>
      </div>

      {/* Opposite side (alternate layout on wide containers): the timestamp. Only one of the two
          timestamps is ever displayed, so screen readers hear it once. */}
      {alt && timeNode && (
        <div
          className={cn(
            "row-start-1 hidden min-w-0 pt-[calc((var(--tl-marker)-1.25rem)/2)] @2xl/timeline:block",
            side === "start" ? "col-start-1 text-end" : "col-start-3",
          )}
        >
          <motion.span
            data-sheen-reveal=""
            initial={initial}
            animate={state}
            variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
            transition={motionOr(animated, { duration: duration.slow, ease: ease.out, delay: d + 0.08 })}
            className="inline-block text-sm leading-5 font-medium text-sheen-fg-muted tabular-nums print:opacity-100!"
          >
            <TimeText dateTime={dateTime} locale={locale}>
              {time}
            </TimeText>
          </motion.span>
        </div>
      )}

      {/* Content. */}
      <div
        data-slot="timeline-content"
        className={cn(
          "col-start-2 row-start-1 flex min-w-0 flex-col pt-[calc((var(--tl-marker)-1.25rem)/2)]",
          // Room for a line of at least ~20px between one-line items; none after the last item
          // or before a heading (where there is no line).
          size === "sm" ? "pb-8" : "pb-9",
          "group-last/tl:pb-1 group-has-[+[data-slot=timeline-heading]]/tl:pb-1",
          alt &&
            (side === "start"
              ? "@2xl/timeline:col-start-3"
              : "@2xl/timeline:col-start-1 @2xl/timeline:items-end @2xl/timeline:text-end"),
          contentClassName,
        )}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <Rise animated={animated} state={state} delay={d + 0.06}>
            <div
              className={cn(
                "flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5",
                alt && side === "end" && "@2xl/timeline:flex-row-reverse",
              )}
            >
              <p className="min-w-0 text-sm leading-5 text-pretty text-sheen-fg [overflow-wrap:anywhere] [&_a]:font-medium [&_a]:text-sheen-accent [&_a]:underline-offset-4 [&_a:hover]:underline [&_b]:font-semibold [&_strong]:font-semibold">
                {title}
              </p>
              {timeNode && <span className={cn("contents", alt && "@2xl/timeline:hidden")}>{timeNode}</span>}
            </div>
          </Rise>
          {description && (
            <Rise animated={animated} state={state} delay={d + 0.11}>
              <div className="text-sm text-pretty text-sheen-fg-muted [overflow-wrap:anywhere]">{description}</div>
            </Rise>
          )}
        </div>
        {children && (
          <motion.div
            initial={initial}
            animate={state}
            // Transform only: custom content may be glass, and fading its wrapper would break the blur.
            variants={{ hidden: { y: 14 }, shown: { y: 0 } }}
            transition={motionOr(animated, { ...spring.gentle, delay: d + 0.1 })}
            data-slot="timeline-body"
            className="mt-3 flex min-w-0 flex-col gap-3 print:transform-none!"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.li>
  );
}

/** A timestamp: <time dateTime> (with the full date on hover) when there is a machine date, plain text otherwise. */
function TimeText({
  dateTime,
  locale,
  className,
  children,
}: {
  dateTime?: string | Date;
  locale?: string;
  className?: string;
  children: ReactNode;
}) {
  const iso = isoOf(dateTime);
  if (!iso) return <span className={className}>{children}</span>;
  return (
    <time dateTime={iso} title={fullDate(dateTime, locale)} className={className}>
      {children}
    </time>
  );
}

/**
 * Text that rises into place out of its own clip: transform only, so a glass Badge in a title
 * keeps its blur (an opacity fade on its ancestor would cut it). The clip is removed once the
 * text has arrived, so focus rings and shadows inside are never cut afterwards.
 */
function Rise({
  animated,
  state,
  delay,
  children,
}: {
  animated: boolean;
  state: "shown" | "hidden";
  delay: number;
  children: ReactNode;
}) {
  const [arrived, setArrived] = useState(false);
  return (
    <div className={cn("min-w-0", animated && !arrived && "overflow-hidden print:overflow-visible")}>
      <motion.div
        initial={animated ? "hidden" : false}
        animate={state}
        variants={{ hidden: { y: "105%" }, shown: { y: 0 } }}
        transition={motionOr(animated, { duration: duration.slow, ease: ease.out, delay })}
        onAnimationComplete={(definition) => {
          if (definition === "shown") setArrived(true);
        }}
        className="min-w-0 print:transform-none!"
      >
        {children}
      </motion.div>
    </div>
  );
}

function Marker({
  kind,
  icon,
  avatar,
  tone,
  size,
  current,
}: {
  kind: MarkerKind;
  icon?: ReactNode;
  avatar?: ReactNode;
  tone: TimelineTone;
  size: "sm" | "md";
  current: boolean;
}) {
  if (avatar) {
    return (
      <span data-slot="timeline-avatar" className="relative flex size-(--tl-marker) items-center justify-center">
        <span className="flex size-full items-center justify-center [&>*]:size-full">{avatar}</span>
        {icon && (
          <span
            aria-hidden
            className={cn(
              "absolute -end-1.5 -bottom-1 grid size-[1.125rem] place-items-center rounded-full border [&_svg]:size-2.5",
              // A ring in the solid surface colour separates the badge from the avatar.
              "ring-2 ring-sheen-surface",
              disc,
              toneStyles[tone],
              "forced-colors:border-[CanvasText]",
            )}
          >
            {icon}
          </span>
        )}
      </span>
    );
  }

  if (kind === "box") {
    return (
      <span
        aria-hidden
        className={cn(
          "grid size-(--tl-marker) place-items-center rounded-full border",
          size === "sm" ? "[&_svg]:size-3.5" : "[&_svg]:size-4",
          disc,
          toneStyles[tone],
          current && "border-2",
          "shadow-[0_1px_2px_var(--sheen-shadow-near)]",
          "forced-colors:border-[CanvasText]",
        )}
      >
        {icon}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "block size-(--tl-dot) rounded-full",
        dotStyles[tone],
        "ring-[3px] ring-sheen-surface/80",
        // Background colours vanish in high contrast: draw the dot as a system-coloured disc.
        "forced-colors:bg-[CanvasText] forced-colors:[forced-color-adjust:none]",
      )}
    />
  );
}

/** Soft pulse behind the current item's marker. Static ring under reduced motion. */
function Halo({ tone, animated }: { tone: TimelineTone; animated: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Pauses off-screen and in a hidden tab (useLoopPlayback); a CSS animation, so no JS frame loop.
  const playing = useLoopPlayback(ref);
  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center forced-colors:hidden"
    >
      {animated ? (
        <span
          data-playing={playing || undefined}
          className={cn(
            "absolute size-full animate-[sheen-halo_var(--sheen-duration-loop-calm)_var(--sheen-ease-out)_infinite] rounded-full [animation-play-state:paused] data-playing:[animation-play-state:running]",
            haloStyles[tone],
          )}
        />
      ) : (
        <span className={cn("absolute -inset-1 rounded-full", haloStyles[tone])} />
      )}
    </span>
  );
}

/* ---------- Heading ---------- */

/**
 * Props of `TimelineHeading`: the native `<li>` props plus its own options, each documented on its
 * field.
 */
export type TimelineHeadingProps = Omit<ComponentProps<"li">, "className"> & {
  /** Extra classes for the `<li>` of this entry (set its spacing or tone here). */
  className?: string;
};

/**
 * A group label inside the feed ("Today", "October 2026"). The line breaks around it.
 *
 * Keyboard: not focusable. Accessibility: an `<li>` holding the label text, so it is read in place within the list. Glass and motion: a small `glass-1` chip; no motion.
 *
 * @example
 * ```tsx
 * import { Timeline, TimelineHeading, TimelineItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Timeline aria-label="Activity">
 *       <TimelineHeading>October 2026</TimelineHeading>
 *       <TimelineItem title="Released v2" time="Oct 30" />
 *     </Timeline>
 *   );
 * }
 * ```
 *
 * @see /layout/timeline
 */
export function TimelineHeading({ className, children, ...props }: TimelineHeadingProps) {
  const { layout } = useContext(TimelineContext);
  return (
    <li
      data-slot="timeline-heading"
      className={cn(
        "flex min-w-0 items-center gap-3 pb-4 [&:not(:first-child)]:pt-2",
        layout === "alternate" && "@2xl/timeline:justify-center",
        className,
      )}
      {...props}
    >
      <span className="glass-1 inline-flex min-h-6 items-center rounded-sheen-full px-2.5 text-2xs font-semibold tracking-wide text-sheen-fg-muted uppercase">
        {children}
      </span>
    </li>
  );
}
