"use client";

import { useMemo, useRef, type ComponentProps, type RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue, type UseScrollOptions } from "motion/react";

import { cn } from "../../lib/cn";
import { useHydrated } from "../../lib/canvas-effects";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** The element a {@link TextReveal} renders. */
export type TextRevealTag = "p" | "h1" | "h2" | "h3" | "h4" | "div";

/** Props of {@link TextReveal}: the native props of the element it renders, plus its own options. */
export type TextRevealProps = Omit<ComponentProps<"p">, "children"> & {
  /** The text to reveal, as one plain string. Words are split on whitespace. */
  children: string;
  /**
   * The element to render: a paragraph for running text, a heading for a statement.
   * @default "p"
   */
  as?: TextRevealTag;
  /**
   * How dim a word is before the scroll reaches it, from 0 (invisible) to 1 (no effect). Keep it at 0.25 or above so the unread words stay legible.
   * @default 0.28
   */
  dim?: number;
  /**
   * Which part of the scroll drives the reveal, in Motion's `offset` format: `["start 0.9", "end 0.5"]` starts when the top of the text reaches 90 % of the viewport height and finishes when its bottom reaches the middle.
   * @default ["start 0.9", "end 0.5"]
   */
  offset?: UseScrollOptions["offset"];
  /** The scrollable element that drives the reveal. Defaults to the page. */
  container?: RefObject<HTMLElement | null>;
};

const DEFAULT_OFFSET: UseScrollOptions["offset"] = ["start 0.9", "end 0.5"];
/** Share of the scroll range over which one word fades in (neighbouring words overlap, so the wave is smooth). */
const WINDOW = 0.18;

/**
 * Text reveal: a statement whose words light up one after another as the reader scrolls. Use it for a manifesto, a mission line or a long hero sentence, where the scroll sets the pace of reading.
 *
 * Pass the text as one string. Each word goes from `dim` to full opacity across its own slice of the scroll range (`offset`), left to right, so the sentence fills in like a progress bar. It is scroll-linked: scrolling back dims the words again. The text stays in the document as ordinary words, so it is selectable, searchable and readable without JavaScript (before hydration every word is fully visible), and nothing changes size or position, so the layout never shifts.
 *
 * Keyboard: Not focusable; the text is plain content in the normal reading order.
 * Accessibility: The words are real text, in order, with normal spaces, and screen readers read them whatever their opacity. Dimmed words are lower contrast until they are revealed, so keep `dim` at 0.25 or above, avoid it on text that must be read at once (instructions, legal copy) and use `as="h2"` only for a heading that belongs in the outline.
 * Glass: Opacity changes on inline spans of plain text; do not wrap glass in it. Put it on a calm surface or the page background.
 * Motion: Each word's opacity is a MotionValue driven by the scroll position (no React renders while scrolling, nothing loops, so there is nothing to pause). Reduced motion: every word is fully visible and nothing moves.
 *
 * @example
 * ```tsx
 * import { TextReveal } from "@sheenui/theme";
 *
 * export function Manifesto() {
 *   return (
 *     <TextReveal as="h2" className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance">
 *       We build interfaces that feel like light passing through glass, calm, precise and never in the way.
 *     </TextReveal>
 *   );
 * }
 * ```
 *
 * @see /effects/text-reveal
 */
export function TextReveal({
  children,
  as = "p",
  dim = 0.28,
  offset = DEFAULT_OFFSET,
  container,
  className,
  ...props
}: TextRevealProps) {
  const reduced = useSheenReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // Before the first client effect every word is fully visible: the server HTML (and a browser without JS) reads normally.
  const armed = useHydrated();
  const { scrollYProgress } = useScroll({ target: ref, container, offset });
  const words = useMemo(() => children.split(/\s+/).filter(Boolean), [children]);
  const Tag = as as "p";
  const live = armed && !reduced;

  return (
    <Tag ref={ref as RefObject<HTMLParagraphElement>} data-slot="text-reveal" className={cn(className)} {...props}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} index={i} total={words.length} dim={dim} live={live}>
          {i < words.length - 1 ? `${word} ` : word}
        </Word>
      ))}
    </Tag>
  );
}

type WordProps = {
  progress: MotionValue<number>;
  index: number;
  total: number;
  dim: number;
  live: boolean;
  children: string;
};

function Word({ progress, index, total, dim, live, children }: WordProps) {
  const start = (index / total) * (1 - WINDOW);
  const opacity = useTransform(progress, [start, start + WINDOW], [Math.min(Math.max(dim, 0), 1), 1]);
  // A soft accent glow behind the words the scroll is reading right now: it fades in as a word lights up and out again after it (opacity only).
  const glow = useTransform(progress, [start, start + WINDOW * 0.6, start + WINDOW * 2.2], [0, 1, 0]);
  return (
    <motion.span className="relative" style={live ? { opacity } : undefined}>
      {live && (
        <motion.span
          aria-hidden="true"
          data-slot="text-reveal-glow"
          className="pointer-events-none absolute -inset-x-1.5 -inset-y-0.5 -z-10 rounded-full"
          style={{
            opacity: glow,
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--sheen-accent) 38%, transparent) 0%, transparent 70%)",
          }}
        />
      )}
      {children}
    </motion.span>
  );
}
