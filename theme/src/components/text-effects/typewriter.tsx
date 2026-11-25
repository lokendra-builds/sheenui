"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState, type ComponentProps } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { splitGraphemes, usePlayback } from "./text-utils";

/** Props of `Typewriter`: the native `<span>` props plus its own options, each documented on its field. */
export type TypewriterProps = Omit<ComponentProps<"span">, "children"> & {
  /** A phrase, or phrases to type one after another. */
  words: string | readonly string[];
  /** Sets the seconds per typed character (on average). Default 0.055. */
  typeSpeed?: number;
  /** Sets the seconds per deleted character. Default 0.028. */
  deleteSpeed?: number;
  /** Seconds a finished phrase stays before it is deleted. Default 1.8. */
  hold?: number;
  /** Sets the number of seconds before the first character. Default 0.2. */
  startDelay?: number;
  /** Start again after the last phrase. Defaults to true when there are several phrases. */
  loop?: boolean;
  /** Show the caret. When typing ends (no loop), it blinks a few times and fades. Default true. */
  cursor?: boolean;
  /** Adds extra classes to the caret (colour, width). */
  cursorClassName?: string;
  /** Reserve the space of the longest phrase so nothing around it moves. Default true. */
  reserveSpace?: boolean;
  /** Stop typing (e.g. from a pause button). Default false. */
  paused?: boolean;
  /** Pause while a mouse or pen rests on the text. Default true. */
  pauseOnHover?: boolean;
  /** Sets what screen readers hear. Defaults to every phrase, in order. */
  label?: string;
  /** Called once the last phrase is typed (when not looping). */
  onComplete?: () => void;
};

type Phase = "waiting" | "typing" | "holding" | "deleting" | "done";
type State = { word: number; length: number; phase: Phase };

const PUNCTUATION = /[.,!?;:…。、！？]/;

/**
 * Typewriter: types a phrase character by character, holds it, deletes it and types the next, with a caret that is solid while typing and blinks while it waits, like a real
 * text cursor. Paused, the caret is solid and still. Use it for one rotating phrase in a hero; use `WordRotate` for a single changing word.
 *
 * - `words` is a phrase or a list; `typeSpeed`, `deleteSpeed`, `hold` and `startDelay` set the timing (typing has a human rhythm: slightly uneven keystrokes and a beat after punctuation);
 *   `loop` defaults to true when there are several phrases; `cursor` and `cursorClassName` control the caret; `onComplete` fires after the last phrase when not looping.
 * - Characters are grapheme clusters (Intl.Segmenter), so emoji and accents never split.
 * - No layout shift: by default (`reserveSpace`) the space of the longest phrase is reserved up front, so the text around it (and the lines below) never move while it types.
 * - It waits until it is on screen, pauses while the tab is hidden or the pointer rests on it (a pointer convenience, not a WCAG 2.2.2 mechanism: for a loop longer than 5 s give a visible pause button wired to `paused`; reduced motion also stops it), and `paused` pauses it from outside.
 *
 * Keyboard: none, it is text. Accessibility: screen readers get every phrase once, as plain text (override with `label`); the typing itself is `aria-hidden`. That copy is unselectable, so copying gets only what is on screen.
 * Glass and motion: no backdrop blur. Reduced motion: the first phrase, complete, with no caret.
 *
 * @example
 * ```tsx
 * import { Typewriter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <p>I build <Typewriter words={["design systems.", "fast websites.", "accessible apps."]} /></p>
 *   );
 * }
 * ```
 *
 * @see /effects/typewriter
 */
export function Typewriter({
  words,
  typeSpeed = 0.055,
  deleteSpeed = 0.028,
  hold = 1.8,
  startDelay = 0.2,
  loop,
  cursor = true,
  cursorClassName,
  reserveSpace = true,
  paused = false,
  pauseOnHover = true,
  label,
  onComplete,
  className,
  ...props
}: TypewriterProps) {
  const reduced = useSheenReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // Compared by content, so an inline `words={[...]}` array does not restart the typing every render.
  const listKey = JSON.stringify(typeof words === "string" ? [words] : words);
  const list = useMemo(() => JSON.parse(listKey) as string[], [listKey]);
  const repeat = loop ?? list.length > 1;
  const graphemes = useMemo(() => list.map(splitGraphemes), [list]);
  const playing = usePlayback(ref, { paused: paused || reduced, pauseOnHover });

  const [state, setState] = useState<State>({ word: 0, length: 0, phase: "waiting" });
  const notifyDone = useEffectEvent(() => onComplete?.());

  // New phrases: start over (adjusting state while rendering, not in an effect).
  const [shownKey, setShownKey] = useState(listKey);
  if (shownKey !== listKey) {
    setShownKey(listKey);
    setState({ word: 0, length: 0, phase: "waiting" });
  }

  useEffect(() => {
    if (!playing || state.phase === "done" || list.length === 0) return;
    const chars = graphemes[state.word] ?? [];
    const last = state.word === list.length - 1;
    let delay = 0;
    let next: State = state;

    switch (state.phase) {
      case "waiting":
        delay = startDelay;
        next = { ...state, phase: "typing" };
        break;
      case "typing": {
        if (state.length < chars.length) {
          // Uneven keystrokes, and a beat after punctuation.
          const previous = chars[state.length - 1] ?? "";
          delay = typeSpeed * (0.55 + Math.random() * 0.9) * (PUNCTUATION.test(previous) ? 5 : 1);
          next = { ...state, length: state.length + 1 };
        } else {
          next = { ...state, phase: last && !repeat ? "done" : "holding" };
        }
        break;
      }
      case "holding":
        delay = hold;
        next = { ...state, phase: "deleting" };
        break;
      case "deleting":
        if (state.length > 0) {
          delay = deleteSpeed;
          next = { ...state, length: state.length - 1 };
        } else {
          delay = Math.max(typeSpeed * 6, 0.25);
          next = { word: (state.word + 1) % list.length, length: 0, phase: "typing" };
        }
        break;
    }

    const timer = window.setTimeout(() => {
      setState(next);
      if (next.phase === "done") notifyDone();
    }, delay * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, state, graphemes, list.length, repeat, typeSpeed, deleteSpeed, hold, startDelay]);

  const typed = reduced ? (list[0] ?? "") : (graphemes[state.word] ?? []).slice(0, state.length).join("");
  // The caret blinks only while it is really waiting (holding a phrase, or about to start). While
  // typing it is solid, and while paused (hover, `paused`, off screen) it is solid and still:
  // nothing keeps moving once the effect has been paused.
  const blinking = playing && (state.phase === "holding" || state.phase === "waiting");

  const caret = cursor && !reduced && (
    <motion.span
      aria-hidden
      data-slot="typewriter-caret"
      className={cn(
        // 1em tall, dropped just below the baseline: inside the line box, so it never changes the line height.
        "ms-[0.06em] inline-block h-[1em] w-[max(2px,0.07em)] rounded-full bg-sheen-accent align-[-0.13em]",
        "forced-colors:bg-[CanvasText]",
        cursorClassName,
      )}
      animate={
        state.phase === "done"
          ? { opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0] }
          : blinking
            ? { opacity: [1, 1, 0, 0] }
            : { opacity: 1 }
      }
      transition={
        state.phase === "done"
          ? { duration: 3.3, ease: "linear" }
          : blinking
            ? { duration: 1.1, ease: "linear", times: [0, 0.5, 0.5, 1], repeat: Infinity }
            : { duration: 0 }
      }
    />
  );

  return (
    <span ref={ref} data-slot="typewriter" className={cn("inline", className)} {...props}>
      <span className="sr-only select-none">{label ?? list.join(" ")}</span>
      {reserveSpace ? (
        // Every phrase sits invisibly in the same grid cell: the cell is as big as the biggest one.
        <span aria-hidden className="inline-grid [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:text-start">
          {list.map((phrase, i) => (
            <span key={i} className="invisible">
              {phrase}
              {cursor && <span className="ms-[0.06em] inline-block h-[1em] w-[max(2px,0.07em)] align-[-0.13em]" />}
            </span>
          ))}
          <span>
            {typed}
            {caret}
          </span>
        </span>
      ) : (
        <span aria-hidden>
          {typed}
          {caret}
        </span>
      )}
    </span>
  );
}
