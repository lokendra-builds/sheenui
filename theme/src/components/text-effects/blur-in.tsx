"use client";

import { Fragment, useMemo, useRef } from "react";
import { motion, stagger as staggerDelay, useInView, type Variants } from "motion/react";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "../../lib/cn";
import { duration as durations, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { splitGraphemes, splitWords } from "./text-utils";

/** Props of `BlurIn`: the native `<span>` props plus its own options, each documented on its field. */
export type BlurInProps = Omit<useRender.ComponentProps<"span">, "children"> & {
  /** The text to reveal. */
  text: string;
  /** Reveal word by word (default), or character by character (also the choice for languages written without spaces). */
  by?: "word" | "character";
  /** Seconds before the first piece starts. Default 0. */
  delay?: number;
  /** Sets the seconds between pieces. Defaults to 0.07 for words, 0.025 for characters. */
  stagger?: number;
  /** Seconds each piece takes to arrive. Default `duration.slower`. */
  duration?: number;
  /** Starting blur in px. 0 for a plain fade-up. Default 10. */
  blur?: number;
  /** How far each piece rises, as a CSS length. "0" for none. Default "0.35em". */
  offset?: string;
  /** Wait until the text is on screen. Off: play on mount. Default true. */
  animateOnView?: boolean;
  /** Play only the first time it enters the view. Off: replay every time it comes back. Default true. */
  once?: boolean;
  /** Called when the last piece has landed. */
  onComplete?: () => void;
  /** Classes for each animated piece (e.g. a gradient per word). */
  pieceClassName?: string;
};

/**
 * Blur in: words (or characters) arrive one after another, sharpening out of a soft blur while they rise a little and fade in. The classic
 * hero-headline reveal. Use it once per page on the headline; do not animate body copy. Use `render={<h1 />}` to choose the element (it
 * renders a `span` by default), `text` for the string, `by` for word or character reveal and `delay`, `stagger`, `duration`, `blur` and `offset` to tune it.
 *
 * - Words never break mid-word in "character" mode: each word is one unbreakable box.
 * - It plays when the text scrolls into view (once, by default; `animateOnView={false}` plays on mount, `once={false}` replays).
 * - `pieceClassName` styles each animated piece (for example a gradient per word); `onComplete` fires when the last piece has landed.
 *
 * Keyboard: none, it is text. Accessibility: screen readers get the whole string once (a visually hidden copy); the animated pieces are `aria-hidden`, so nothing is read
 * word by word. The hidden copy is unselectable, so copying the text gets exactly what is on screen, once.
 * Glass and motion: no backdrop blur. Only opacity, transform and a filter on the letters themselves animate; when a piece lands its filter is removed, so finished text is ordinary
 * text. Reduced motion (OS or the in-app toggle): plain static text, nothing to wait for.
 *
 * @example
 * ```tsx
 * import { BlurIn } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BlurIn render={<h1 className="text-5xl font-bold" />} text="Interfaces you can see through" />
 *   );
 * }
 * ```
 *
 * @see /effects/blur-in
 */
export function BlurIn({
  text,
  by = "word",
  delay = 0,
  stagger,
  duration = durations.slower,
  blur = 10,
  offset = "0.35em",
  animateOnView = true,
  once = true,
  onComplete,
  pieceClassName,
  render,
  className,
  ref,
  ...props
}: BlurInProps) {
  const reduced = useSheenReducedMotion();
  const ownRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ownRef, { once, amount: 0.4 });
  const play = !animateOnView || inView;
  const step = stagger ?? (by === "word" ? 0.07 : 0.025);

  const runs = useMemo(() => splitWords(text), [text]);

  const variants = useMemo(
    () =>
      ({
        hidden: { opacity: 0, filter: `blur(${blur}px)`, y: offset },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          transition: { duration, ease: ease.out },
          // A finished piece is plain text again: no filter layer left behind.
          transitionEnd: { filter: "none" },
        },
      }) satisfies Variants,
    [blur, offset, duration],
  );

  const container: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: staggerDelay(step, { startDelay: delay }) } },
  };

  const piece = (content: string, key: string | number) => (
    <motion.span key={key} variants={variants} className={cn("inline-block", pieceClassName)}>
      {content}
    </motion.span>
  );

  const children = reduced ? (
    text
  ) : (
    <>
      <span className="sr-only select-none">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        animate={play ? "visible" : "hidden"}
        variants={container}
        onAnimationComplete={(definition) => {
          if (definition === "visible") onComplete?.();
        }}
      >
        {runs.map((run, i) =>
          run.kind === "space" ? (
            <Fragment key={i}>{run.text}</Fragment>
          ) : by === "word" ? (
            piece(run.text, i)
          ) : (
            // One unbreakable box per word, so letters never wrap on their own.
            <span key={i} className="inline-block whitespace-nowrap">
              {splitGraphemes(run.text).map((char, j) => piece(char, j))}
            </span>
          ),
        )}
      </motion.span>
    </>
  );

  return useRender({
    defaultTagName: "span",
    render,
    ref: ref ? [ownRef, ref] : ownRef,
    props: { ...props, "data-slot": "blur-in", className, children },
  });
}
