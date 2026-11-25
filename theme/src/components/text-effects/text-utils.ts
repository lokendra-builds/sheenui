"use client";

import { useEffect, useState, type RefObject } from "react";
import { useLoopPlayback } from "../../motion/gate";
export { useMediaQuery } from "../../hooks/use-media-query";

/**
 * Shared helpers for the text effects (BlurIn, WordRotate, Typewriter, ShimmerText).
 *
 * Accessibility pattern used by every effect that splits text into pieces:
 *   <span class="sr-only">full string</span>      ← what screen readers read, once, in one piece
 *   <span aria-hidden>…animated pieces…</span>    ← what sighted users see
 * (aria-label on a plain span is ignored by several screen readers, so real text is used.)
 */

/** One run of text: a word, or the whitespace between words (kept as-is so wrapping is unchanged). */
export type TextRun = { kind: "word" | "space"; text: string };

/** Splits on whitespace, keeping the whitespace runs. For languages written without spaces, animate by character. */
export function splitWords(text: string): TextRun[] {
  return text
    .split(/(\s+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ kind: /^\s+$/.test(part) ? "space" : "word", text: part }));
}

let graphemeSegmenter: Intl.Segmenter | null | undefined;

/** User-perceived characters: "👍🏽", "é" and "🇫🇷" stay whole (Intl.Segmenter), with a code-point fallback. */
export function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter === undefined) {
    graphemeSegmenter =
      typeof Intl !== "undefined" && "Segmenter" in Intl
        ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
        : null;
  }
  if (!graphemeSegmenter) return Array.from(text);
  return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
}

/** "fast, accessible, and beautiful" in the reader's language (Intl.ListFormat), for screen-reader labels. */
export function listLabel(words: readonly string[], locales?: Intl.LocalesArgument) {
  try {
    return new Intl.ListFormat(locales, { type: "conjunction" }).format(words);
  } catch {
    return words.join(", ");
  }
}

/**
 * True while a mouse or pen is over the element (touch never "hovers"). Used by looping effects to pause
 * under the pointer (WCAG 2.2.2).
 *
 * @param ref The element to watch.
 * @param enabled Pass false to skip listening (the result stays false). Default true.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useHovered } from "./text-utils";
 *
 * export function Example() {
 *   const ref = useRef<HTMLDivElement>(null);
 *
 *   const hovered = useHovered(ref);
 * }
 * ```
 *
 * @see /effects/word-rotate
 */
export function useHovered(ref: RefObject<HTMLElement | null>, enabled = true) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      setHovered(false);
      return;
    }
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") setHovered(true);
    };
    const leave = () => setHovered(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref, enabled]);
  return hovered;
}

/**
 * Whether a looping effect (WordRotate, Typewriter, ShimmerText loop) should run right now:
 * on screen, tab visible, not paused by the app, and (optionally) not under the pointer.
 * Pausing on hover is a pointer convenience only: it does not satisfy WCAG 2.2.2 on its own, because keyboard and touch users cannot hover.
 * For a loop longer than 5 seconds also offer a visible pause control (bind `paused`, as Marquee's Pause button does); the site-wide reduce-motion setting stops these loops too.
 *
 * @param ref The element the effect lives in (the "on screen" check uses it).
 * @param options `paused` stops playback from the outside; `pauseOnHover` (default true) also pauses under a mouse or pen.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { usePlayback } from "./text-utils";
 *
 * export function Example() {
 *   const ref = useRef<HTMLSpanElement>(null);
 *
 *   const playing = usePlayback(ref, { paused: false });
 * }
 * ```
 *
 * @see /effects/word-rotate
 */
export function usePlayback(ref: RefObject<HTMLElement | null>, { paused = false, pauseOnHover = true } = {}) {
  const hovered = useHovered(ref, pauseOnHover);
  // Reduced motion is each effect's own concern, so it is not folded in here; a fifth of the element on screen starts it.
  const playing = useLoopPlayback(ref, { paused, amount: 0.2, respectReducedMotion: false });
  return playing && !hovered;
}
