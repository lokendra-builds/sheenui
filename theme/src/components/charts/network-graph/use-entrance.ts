"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { animate } from "motion/react";
import { INTRO } from "./layout";
import type { GraphRefs } from "./refs";

/** What the entrance needs: the refs, whether the chart may play, has a layout, and has already played. */
export type EntranceInput = {
  R: GraphRefs;
  play: boolean;
  hasLayout: boolean;
  introDone: boolean;
  reduced: boolean;
  setIntroDone: Dispatch<SetStateAction<boolean>>;
};

/**
 * The entrance: nodes ripple out from the centre (by breadth-first rank), then the links draw in; one tween, painted
 * by the painter. Reduced motion shows the layout in place at once.
 */
export function useGraphEntrance({ R, play, hasLayout, introDone, reduced, setIntroDone }: EntranceInput) {
  const { introRef, paintRef, reducedRef } = R;
  useEffect(() => {
    if (introDone || !play || !hasLayout) return;
    if (reducedRef.current) {
      introRef.current = 1;
      paintRef.current("all");
      setIntroDone(true);
      return;
    }
    const start = introRef.current;
    const controls = animate(start, 1, {
      duration: INTRO * (1 - start),
      ease: "linear",
      onUpdate: (v) => {
        introRef.current = v;
        paintRef.current("all");
      },
      onComplete: () => setIntroDone(true),
    });
    return () => controls.stop();
  }, [play, hasLayout, introDone, introRef, paintRef, reducedRef, setIntroDone]);
  useEffect(() => {
    if (!reduced) return;
    introRef.current = 1;
    paintRef.current("all");
  }, [reduced, introRef, paintRef]);
}
