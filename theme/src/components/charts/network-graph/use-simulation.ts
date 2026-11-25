"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { animate } from "motion/react";
import { duration } from "../../../motion/tokens";
import { changeCurve } from "../flow-utils";
import { BUDGET } from "./layout";
import type { Graph } from "./model";
import type { GraphRefs } from "./refs";
import { createForceSimulation, type ForceSimulationOptions } from "./simulation";

/** What the layout needs: the refs, the graph, the box's shape and the simulation options as a key. */
export type SimulationInput = {
  R: GraphRefs;
  graph: Graph;
  n: number;
  /** The box's width / height in coarse steps (0 before it is measured). */
  aspect: number;
  /** `JSON.stringify(forces ?? {})`: the options compared by value, so an inline object does not re-run the layout. */
  forcesKey: string;
  /** Bump the "settled" counter once motion stops. */
  settle: () => void;
  setLayoutVersion: Dispatch<SetStateAction<number>>;
};

/**
 * The force layout: computed in small chunks between frames (never a long task), then shown. Known nodes keep
 * their place and glide to where the new layout settles; new ones appear in place. Returns `startLive`, which runs
 * the simulation frame by frame while a node is dragged.
 */
export function useSimulationLayout({ R, graph, n, aspect, forcesKey, settle, setLayoutVersion }: SimulationInput) {
  const { simRef, posRef, finalRef, centreRef, glideRef, liveRafRef, reducedRef, paintRef } = R;

  function stopLive() {
    cancelAnimationFrame(liveRafRef.current);
    liveRafRef.current = 0;
  }

  useEffect(() => {
    if (aspect === 0) return;
    if (n === 0) {
      simRef.current = null;
      posRef.current = null;
      finalRef.current = null;
      return;
    }
    // Known nodes start where they are; new ones next to a known neighbour.
    const prev = posRef.current;
    const at = (i: number) => {
      const x = prev?.[i * 2];
      const y = prev?.[i * 2 + 1];
      return x !== undefined && y !== undefined && Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    };
    const had = !!prev && graph.nodes.some((_, i) => at(i) !== null);
    const init = had
      ? graph.nodes.map(
          (g, i) => at(i) ?? g.neighbours.map(at).find(Boolean) ?? { x: Math.cos(i) * 20, y: Math.sin(i) * 20 },
        )
      : null;
    const sim = createForceSimulation(
      graph.nodes.map((g) => g.r),
      graph.links.map((l) => ({ source: l.s, target: l.t })),
      init,
      { aspect, ...(JSON.parse(forcesKey) as ForceSimulationOptions | undefined) },
    );
    if (had) sim.alpha = 0.6;
    simRef.current = sim;
    stopLive();
    let raf = 0;
    const step = () => {
      const t0 = performance.now();
      while (sim.alpha > sim.alphaMin && performance.now() - t0 < BUDGET) sim.tick();
      if (sim.alpha > sim.alphaMin) {
        raf = requestAnimationFrame(step);
        return;
      }
      const next = sim.positions();
      finalRef.current = next;
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < n; i++) {
        sx += next[i * 2] ?? 0;
        sy += next[i * 2 + 1] ?? 0;
      }
      centreRef.current = { x: sx / n, y: sy / n };
      glideRef.current?.stop();
      if (had && !reducedRef.current) {
        // Glide from where each node was to where it settled (new nodes appear in place).
        const from = graph.nodes.flatMap((_, i) => {
          const p = at(i) ?? { x: next[i * 2] ?? 0, y: next[i * 2 + 1] ?? 0 };
          return [p.x, p.y];
        });
        const controls = animate(0, 1, {
          duration: duration.slower,
          ease: "linear",
          onUpdate: (k) => {
            const e = changeCurve(k);
            posRef.current = from.map((v, j) => v + ((next[j] ?? v) - v) * e);
            paintRef.current("all");
          },
          onComplete: settle,
        });
        glideRef.current = controls;
      } else {
        posRef.current = next;
        paintRef.current("all");
      }
      setLayoutVersion((v) => v + 1);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      glideRef.current?.stop();
    };
    // `settle` and `stopLive` are fresh closures every render over the same refs; only the data, options and box shape re-run the layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the layout re-runs for new data, new options or a new box shape, not for a new render's closures
  }, [
    graph,
    forcesKey,
    aspect,
    n,
    simRef,
    posRef,
    finalRef,
    centreRef,
    glideRef,
    reducedRef,
    paintRef,
    setLayoutVersion,
  ]);

  function startLive() {
    if (liveRafRef.current || reducedRef.current) return;
    const loop = () => {
      const sim = simRef.current;
      if (!sim) {
        liveRafRef.current = 0;
        return;
      }
      sim.tick();
      const next = sim.positions();
      finalRef.current = next;
      posRef.current = next;
      paintRef.current("all");
      if (sim.alpha > sim.alphaMin || sim.alphaTarget > 0) liveRafRef.current = requestAnimationFrame(loop);
      else {
        liveRafRef.current = 0;
        settle();
      }
    };
    liveRafRef.current = requestAnimationFrame(loop);
  }
  useEffect(() => () => cancelAnimationFrame(liveRafRef.current), [liveRafRef]);

  return { startLive };
}
