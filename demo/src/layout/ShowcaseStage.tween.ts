/** Ease in and out (cubic): the shape of a number that eases from one value to another. */
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Eases a number from `from` to `to` over about `ms` and hands each step to `apply`, waiting with the stage's own
 * (pausable, abortable) `wait`. Under reduced motion `wait` is instant, so only the exact final value is applied.
 */
export async function tween(
  wait: (ms: number) => Promise<void>,
  reduced: boolean,
  from: number,
  to: number,
  ms: number,
  apply: (value: number) => void,
): Promise<void> {
  if (!reduced) {
    const steps = Math.max(2, Math.round(ms / 40));
    for (let i = 1; i < steps; i += 1) {
      await wait(ms / steps);
      apply(from + (to - from) * inOut(i / steps));
    }
    await wait(ms / steps);
  }
  apply(to);
}
