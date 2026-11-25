import { spring as springGenerator, type DynamicOption, type SpringOptions, type Transition } from "motion/react";
import { COARSE_POINTER_QUERY, PHONE_QUERY } from "../hooks/use-media-query";

/**
 * SheenUI motion tokens: the single source of truth for timing.
 * Mirrored in src/styles/motion.css as CSS variables; keep the two in sync.
 *
 * Durations are in seconds (Motion's unit).
 */

/** Seconds (Motion's unit). Mirrored in motion.css. */
export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.22,
  slow: 0.35,
  slower: 0.6,
  /** Leaving: shorter than every entrance. Pair with ease.exit. */
  exit: 0.15,
  /** Tooltips, menus and other small things closing. */
  exitFast: 0.1,
  /** One loop of the ambient backdrop drift. */
  ambient: 28,
} as const;

/**
 * Easing curves as cubic-bezier arrays: `out` for entrances, `inOut` for loops, `exit` for leaving
 *. Plain data: safe on the server.
 */
export const ease = {
  /** Entrances and state changes that are not springs. */
  out: [0.22, 1, 0.36, 1],
  /** Loops and ambient drift. */
  inOut: [0.65, 0, 0.35, 1],
  /** Exits only: accelerates away, stops dead on the target (no overshoot). */
  exit: [0.4, 0, 1, 1],
} as const;

/**
 * The four springs. Defined by visualDuration + bounce, so they line up with tweens:
 * the bulk of the motion is done by `visualDuration`, the settle happens after.
 * (The old `duration`-based springs looked done at about half their number)
 */
export const spring = {
  /** Controls: pills, toggles, indicators, press release. ~0.3% overshoot, 99% by ~205 ms. */
  snappy: { type: "spring", visualDuration: 0.22, bounce: 0.12 },
  /** Overlays, layout reflow, page content. Critically damped: never overshoots. 99% by ~380 ms. */
  smooth: { type: "spring", visualDuration: 0.3, bounce: 0 },
  /** Big surfaces and reveals: hero glass, cards, sections. ~1.1% overshoot, settles by ~630 ms. */
  gentle: { type: "spring", visualDuration: 0.55, bounce: 0.18 },
  /** Delight only: success, CTA pop, digit pop, badge count. ~8% overshoot, settles by ~485 ms. */
  bouncy: { type: "spring", visualDuration: 0.4, bounce: 0.38 },
} as const satisfies Record<string, Transition>;

/** Physics springs for MotionValues that chase a moving target (useSpring / useFollowValue). */
export const follow = {
  /** Pointer light, tilt: no overshoot, ~375 ms to catch up. */
  pointer: { stiffness: 320, damping: 32, mass: 0.6 },
  /** Magnetic pull: light and quick, ~0.5% overshoot. */
  magnetic: { stiffness: 220, damping: 18, mass: 0.5 },
  /** whileTap release: fast with a 1.5% rebound. */
  press: { stiffness: 700, damping: 30, mass: 0.5 },
  /** Scroll progress bars only (never parallax). */
  scroll: { stiffness: 140, damping: 30, mass: 0.5, restDelta: 0.001 },
  /** A heavy float for parallax compositions: thick glass moves slower than the pointer. */
  float: { stiffness: 90, damping: 20, mass: 1 },
} as const satisfies Record<string, SpringOptions>;

/**
 * A spring token for View Transition layers (AnimateView, animateView). Those are animated with
 * WAAPI directly and only accept the spring generator FUNCTION. `type: "spring"` (a string) is
 * silently replaced by a 300 ms ease-out in the browser, and throws where `process` exists.
 *   <AnimateView enter={{ opacity: [0, 1], transition: viewSpring(spring.smooth) }}>
 */
export const viewSpring = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }) =>
  ({ type: springGenerator, visualDuration, bounce }) satisfies Transition;

/** Leaving the screen: duration.exit with ease.exit. */
export const exitTransition = { duration: duration.exit, ease: ease.exit } satisfies Transition;

/** Stagger steps in seconds, by what is being staggered. */
export const staggerStep = { chars: 0.025, words: 0.045, items: 0.05, cards: 0.07, sections: 0.1 } as const;

/** No stagger may spread a group over more than this (seconds). */
export const STAGGER_BUDGET = 0.4;

/**
 * A stagger that never spreads a group over more than STAGGER_BUDGET, however many children:
 *   transition: { delayChildren: budgetStagger(staggerStep.cards) }   (variants)
 *   animate("li", { opacity: 1 }, { delay: budgetStagger(staggerStep.items) })
 */
export const budgetStagger =
  (step: number): DynamicOption<number> =>
  (i, total) =>
    i * Math.min(step, STAGGER_BUDGET / Math.max(total - 1, 1));

/** Movement distances in pixels: `nudge`, `rise`, `reveal`, `panel`, `hero`, and the `magneticMax` / `parallaxMax` caps. */
export const distance = {
  nudge: 2,
  rise: 8,
  reveal: 16,
  panel: 24,
  hero: 48,
  magneticMax: 8,
  parallaxMax: 96,
} as const;

/** Scale targets (1 = unchanged) for press, pop-in, overlay entrance and hover. */
export const scaleTo = { press: 0.97, pressSmall: 0.92, popFrom: 0.94, overlayFrom: 0.96, hover: 1.02 } as const;

/** Phone-sized or touch-only screens (read when an animation starts, never during render). */
const isPhone = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(`${PHONE_QUERY}, ${COARSE_POINTER_QUERY}`).matches;

/**
 * Degrees / pixels for the rest.
 *
 * `heroTilt` and `handoffTilt` are the 3D lean of a glass slab's entrance. Phones skip it (0): a
 * perspective transform on a blurred surface re-rasterises its whole backdrop on every frame, and
 * on a small GPU that is the dropped frame. They are getters, so they read the screen when the
 * entrance starts (call sites read them inside effects / animation callbacks, not at module load).
 */
export const misc = {
  tiltMax: 6,
  get heroTilt() {
    return isPhone() ? 0 : 10;
  },
  get handoffTilt() {
    return isPhone() ? 0 : 8;
  },
  textBlur: 8,
} as const;
