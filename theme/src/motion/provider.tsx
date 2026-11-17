"use client";

import { useEffect, type ComponentProps } from "react";
import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

import { useSheenReducedMotion } from "../hooks/use-preferences";
import { useOffscreenLoops } from "./offscreen-loops";
import { spring } from "./tokens";

/**
 * One MotionConfig for the whole app. Without it Motion runs with its default
 * `reducedMotion: "never"` and ignores the OS setting completely.
 *
 *   - reducedMotion: "always" when the OS asks for reduced motion OR html[data-motion="reduced"]
 *     is on (read live, see useSheenReducedMotion); otherwise "user" (Motion follows the OS).
 *     With it, Motion skips x / y / scale / rotate / size / layout animations. It does NOT cover
 *     `transform` strings, filter, clipPath or MotionValues you drive yourself: those branch on
 *     useMotionGate().
 *   - transition: the default for any motion component that sets none (spring.smooth).
 *   - skipAnimations: the `skipAnimations` prop (default false). Visual-test harnesses set it so every value jumps to its end;
 *     the library itself never reads the URL.
 *
 * Each motion component reads `reducedMotion` once, when it mounts: remount the routed page
 * when the preference flips (key it on useSheenReducedMotion()), not the whole shell.
 *
 * Props: `children` (ReactNode, required), `nonce` (string, optional: the CSP nonce for the
 * styles Motion injects) and `skipAnimations` (boolean, default false: jump every animation to its end, for screenshot tests).
 *
 * Accessibility: Makes Motion follow `prefers-reduced-motion` and the in-app switch; it renders no markup of its own.
 *
 * @example
 * ```tsx
 * import { SheenMotionProvider } from "@sheenui/theme";
 *
 * export function Root() {
 *   return (
 *     <SheenMotionProvider>
 *       <main>
 *         <h1>Hello</h1>
 *       </main>
 *     </SheenMotionProvider>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function SheenMotionProvider({
  children,
  nonce,
  skipAnimations = false,
}: {
  children: ReactNode;
  /** CSP nonce for the inline styles Motion injects. */
  nonce?: string;
  /** Turn every Motion animation off (tests, screenshots); the final state is shown at once. */
  skipAnimations?: boolean;
}) {
  const reduced = useSheenReducedMotion();
  // Looping CSS animations pause while off-screen, app-wide (one shared IntersectionObserver).
  useOffscreenLoops();
  // A background tab stops every decorative loop: `data-page-hidden` on <html> pauses all CSS animations
  // (motion.css), so a loop added later is covered too. Per-component pausing off-screen stays as it is.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => root.toggleAttribute("data-page-hidden", document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      root.removeAttribute("data-page-hidden");
    };
  }, []);
  return (
    <MotionConfig
      reducedMotion={reduced ? "always" : "user"}
      transition={spring.smooth}
      skipAnimations={skipAnimations}
      nonce={nonce}
    >
      {children}
    </MotionConfig>
  );
}

/** Props of {@link SheenMotionProvider}. One MotionConfig for the whole app. */
export type SheenMotionProviderProps = ComponentProps<typeof SheenMotionProvider>;
