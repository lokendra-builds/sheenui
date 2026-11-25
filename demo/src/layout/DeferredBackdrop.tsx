import { Suspense, lazy, type ComponentProps } from "react";
import type { SheenBackdrop as SheenBackdropComponent } from "@sheenui/theme";

import { whenIdle } from "../hydration";
import { useHeroStoryPlaying } from "../hero-story";

/**
 * The live sky (its canvas, ribbons and loops, plus the pointer light and the auto-Lite probe) used to mount inside
 * the page's hydration commit and ran as one long task in front of every page's first interaction. It mounts after
 * the browser is idle instead: the prerendered sky and its static grain layer (a pre-baked CSS tile, nothing is
 * generated at runtime) are in the HTML and painted from the first frame, and the live sky takes over a moment later.
 */
const Backdrop = lazy(() => whenIdle().then(() => import("./LazyBackdrop")));

export function DeferredBackdrop(props: ComponentProps<typeof SheenBackdropComponent>) {
  // The wallpaper holds still while the home hero's story plays (see hero-story.ts).
  const storyPlaying = useHeroStoryPlaying();
  return (
    <Suspense fallback={null}>
      <Backdrop {...props} paused={props.paused === true || storyPlaying} />
    </Suspense>
  );
}
