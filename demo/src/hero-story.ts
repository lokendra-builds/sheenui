import { useSyncExternalStore } from "react";

/**
 * Whether the home hero's login story is playing. The story is a dark room lit by one lamp, the wallpaper behind it
 * is barely visible, and every frame the wallpaper moves the glass above it has to blur again. So the wallpaper
 * holds still while the story plays and drifts on afterwards (DeferredBackdrop reads this).
 */
let playing = false;
const listeners = new Set<() => void>();

/** Called by the story: `true` when its clock starts, `false` when it ends, is replaced or is cut short. */
export function setHeroStoryPlaying(next: boolean) {
  if (playing === next) return;
  playing = next;
  listeners.forEach((listener) => listener());
}

/** True while the home hero's story plays (false on the server and on every other page). */
export function useHeroStoryPlaying() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => playing,
    () => false,
  );
}
