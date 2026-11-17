"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { duration as durations, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { listLabel, usePlayback } from "./text-utils";

/** Props of `WordRotate`: the native `<span>` props plus its own options, each documented on its field. */
export type WordRotateProps = Omit<ComponentProps<"span">, "children"> & {
  /** The words to cycle through, in order. */
  words: readonly string[];
  /** Seconds each word stays. Default 2.6. */
  interval?: number;
  /** Which way words travel: "up" (in from below, default) or "down" (in from above). */
  direction?: "up" | "down";
  /** Where a shorter word sits in the slot (the slot is as wide as the longest word). Default "start". */
  align?: "start" | "center" | "end";
  /** Stop cycling (e.g. from a pause button). Default false. */
  paused?: boolean;
  /** Pause while a mouse or pen rests on the words. Default true. */
  pauseOnHover?: boolean;
  /** Controlled index of the word shown. */
  index?: number;
  /** Sets the index shown first when uncontrolled. Default 0. */
  defaultIndex?: number;
  /** Called with the index of each new word. */
  onIndexChange?: (index: number) => void;
  /** What screen readers hear instead of the list of words. */
  label?: string;
  /** Locale(s) for the default list label (Intl.ListFormat). */
  locales?: Intl.LocalesArgument;
  /** Classes for each word (padding, gradient text). Put a highlight's padding here. */
  wordClassName?: string;
  /** Classes for a highlight behind the current word (e.g. "rounded-sheen-md bg-sheen-accent-soft"). It morphs to fit each word. */
  highlightClassName?: string;
};

const justify = { start: "justify-self-start", center: "justify-self-center", end: "justify-self-end" } as const;

/**
 * Word rotate: one slot in a sentence that cycles through words, each sliding in from below while the last one slides out the top, inside a clipped window. Use it for a short
 * changing word in a headline; use `Typewriter` for whole phrases.
 *
 * - `words` in order; `interval` seconds each; `direction` "up" or "down"; `align` places a shorter word in the slot; controlled with `index` + `onIndexChange`, or uncontrolled with `defaultIndex`.
 * - No layout shift: the slot is as wide as the longest word from the first paint, so the sentence around it never reflows (and never jumps while a word is in flight).
 * - `highlightClassName` adds a pill behind the current word that morphs to fit each word, with transforms only (its corners are scale-corrected, so they stay round).
 * - It pauses while it is off screen, while the tab is hidden, and while the pointer rests on it (a pointer convenience, not a WCAG 2.2.2 mechanism: keyboard and touch users cannot hover, so give a loop longer than 5 s a visible pause button wired to `paused`; reduced motion also stops it).
 *
 * Keyboard: none, it is text. Accessibility: screen readers hear every word once, as a list ("designers, developers, and everyone"), never a stream of changes. Override with `label`;
 * `locales` sets the list language. That list is unselectable, so a copy of the sentence gets only the word on screen.
 * Glass and motion: no backdrop blur. Reduced motion: it stays on the current word (static).
 *
 * @example
 * ```tsx
 * import { WordRotate } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <h1>Design for <WordRotate words={["designers", "developers", "everyone"]} /></h1>
 *   );
 * }
 * ```
 *
 * @see /effects/word-rotate
 */
export function WordRotate({
  words,
  interval = 2.6,
  direction = "up",
  align = "start",
  paused = false,
  pauseOnHover = true,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  label,
  locales,
  wordClassName,
  highlightClassName,
  className,
  ...props
}: WordRotateProps) {
  const reduced = useSheenReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [rawIndex, setRawIndex] = useControllable(indexProp, defaultIndex, onIndexChange);
  const count = words.length;
  const index = count === 0 ? 0 : ((rawIndex % count) + count) % count;
  const playing = usePlayback(ref, { paused: paused || reduced || count < 2, pauseOnHover });

  const hasOnIndexChange = onIndexChange !== undefined;

  useEffect(() => {
    // Controlled without onIndexChange: nothing can move it forward.
    if (!playing || (indexProp !== undefined && !hasOnIndexChange)) return;
    const timer = window.setTimeout(() => {
      const next = (index + 1) % count;
      setRawIndex(next);
    }, interval * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, index, count, interval, indexProp, hasOnIndexChange, setRawIndex]);

  // Motion only scale-corrects an inline radius, so the highlight's radius (from its classes) is copied inline.
  const highlightRef = useRef<HTMLSpanElement>(null);
  const [radius, setRadius] = useState<string>();
  useLayoutEffect(() => {
    const el = highlightRef.current;
    if (!el) return;
    el.style.borderRadius = "";
    setRadius(getComputedStyle(el).borderTopLeftRadius);
  }, [highlightClassName]);

  const word = words[index] ?? "";
  const from = direction === "up" ? "100%" : "-100%";
  const to = direction === "up" ? "-100%" : "100%";
  // Every layer sits in the same grid cell; the invisible copies of every word size it.
  const cell = "col-start-1 row-start-1 whitespace-nowrap";

  return (
    <span ref={ref} data-slot="word-rotate" className={cn("relative inline-grid", className)} {...props}>
      <span className="sr-only select-none">{label ?? listLabel(words, locales)}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden className={cn(cell, "invisible", wordClassName)}>
          {w}
        </span>
      ))}
      {highlightClassName && (
        <motion.span
          ref={highlightRef}
          aria-hidden
          data-slot="word-rotate-highlight"
          layout={!reduced}
          transition={{ layout: spring.snappy }}
          className={cn(
            cell,
            justify[align],
            "-my-[0.1em] self-stretch forced-colors:border forced-colors:border-[CanvasText]",
            highlightClassName,
          )}
          style={radius ? { borderRadius: radius } : undefined}
        >
          <span className={cn("invisible inline-block py-[0.1em]", wordClassName)}>{word}</span>
        </motion.span>
      )}
      {/*
       * The clipped window, the same height as the highlight. Padding gives ascenders and descenders
       * room inside the clip and the negative margin cancels it. clip-path, not just overflow, so
       * words in flight are clipped too.
       */}
      <span aria-hidden className={cn(cell, "grid overflow-clip [clip-path:inset(0)] -my-[0.1em] py-[0.1em]")}>
        {reduced ? (
          <span className={cn(cell, justify[align], wordClassName)}>{word}</span>
        ) : (
          <AnimatePresence initial={false}>
            <motion.span
              key={`${index}-${word}`}
              data-slot="word-rotate-word"
              className={cn(cell, justify[align], wordClassName)}
              initial={{ y: from, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: spring.gentle }}
              // The outgoing word fades out faster than it travels, so it is gone before it reaches the edge.
              exit={{
                y: to,
                opacity: 0,
                transition: {
                  duration: durations.base,
                  ease: ease.exit,
                  opacity: { duration: durations.exit, ease: "linear" },
                },
              }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </span>
  );
}
