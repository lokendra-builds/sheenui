import type { TargetAndTransition, Transition, Variants } from "motion/react";

import { budgetStagger, distance, duration, exitTransition, follow, scaleTo, spring, staggerStep } from "./tokens";

/**
 * Ready-made animation presets. Each has a full and a reduced version:
 * the reduced one keeps opacity feedback but drops movement and scaling.
 *
 * Entrances spring in; exits are shorter, ease in and never overshoot.
 * Variant names: "hidden" → "visible" on enter, "exit" on leave (with AnimatePresence).
 */

/** Transition for anything leaving: duration.exit with ease.exit. (Also exported from tokens.) */
export { exitTransition };

/** Opacity tween inside a spring entrance: a fade never springs. */
const fadeTween = { type: "tween", duration: duration.base } as const;

/**
 * Variants for a fade-and-rise entrance (`hidden`, `visible`, `exit`), each with a `full` and a
 * `reduced` (opacity only) version. Plain data: safe on the server.
 */
export const fadeUp = {
  full: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { ...spring.gentle, opacity: fadeTween } },
    exit: { opacity: 0, y: 6, transition: exitTransition },
  },
  reduced: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.fast } },
    exit: { opacity: 0, transition: exitTransition },
  },
} satisfies Record<string, Variants>;

/**
 * Variants for a small scale-and-fade entrance (`hidden`, `visible`, `exit`), each with a `full` and a
 * `reduced` (opacity only) version. Plain data: safe on the server.
 */
export const scaleIn = {
  full: {
    hidden: { opacity: 0, scale: scaleTo.popFrom },
    visible: { opacity: 1, scale: 1, transition: { ...spring.snappy, opacity: fadeTween } },
    exit: { opacity: 0, scale: scaleTo.press, transition: exitTransition },
  },
  reduced: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.fast } },
    exit: { opacity: 0, transition: exitTransition },
  },
} satisfies Record<string, Variants>;

/**
 * Stand-alone exit target for AnimatePresence children: `exit={reduced ? exit.reduced : exit.full}`.
 * A small shrink plus fade, no translation, so it reads as "dismissed" rather than "moved".
 */
export const exit = {
  full: { opacity: 0, scale: 0.98, transition: exitTransition },
  reduced: { opacity: 0, transition: exitTransition },
} satisfies Record<string, TargetAndTransition>;

/**
 * Parent variant that staggers its children's "visible" state. Uses `delayChildren` with a
 * budgeted stagger (the old `staggerChildren` option is deprecated in Motion 14), so the whole
 * group never spreads over more than STAGGER_BUDGET (0.4 s), however many children.
 */
export const stagger = (step: number = staggerStep.items): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren: budgetStagger(step) } },
});

/** The press spring as a transition. `out: true`: the RELEASE uses it too. */
const pressSpring = { type: "spring", ...follow.press, out: true } satisfies Transition;

/** Hover lift + press physics for interactive surfaces (release rebounds on the press spring). */
export const hoverLift = {
  whileHover: { y: -distance.nudge, transition: spring.snappy },
  whileTap: { scale: scaleTo.press, y: 0, transition: pressSpring },
};

/** Press physics: sink to 0.97 on the stiff press spring, rebound 1.5% on release. */
export const press = {
  whileTap: { scale: scaleTo.press, transition: pressSpring },
};
