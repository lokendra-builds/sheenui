import { Suspense, type ReactNode } from "react";

/**
 * A Suspense boundary that exists to split hydration.
 *
 * React hydrates the root first and then every Suspense boundary it meets in a pass and commit of its own, so a
 * long page hydrates as several short tasks instead of one long one (Total Blocking Time, input delay) and the
 * boundaries nearest to a click hydrate first. Nothing inside suspends, so the fallback is never shown; the
 * prerendered HTML stays in place until its turn.
 */
export function Deferred({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
