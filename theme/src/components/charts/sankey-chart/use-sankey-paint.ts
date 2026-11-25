"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { animate } from "motion/react";

import { useSyncRef } from "../../../hooks/use-latest";
import { duration } from "../../../motion/tokens";
import { changeCurve, fadeOutLeaving, marksById } from "../flow-utils";
import { COLUMN_STAGGER, mixGeo, paintSankey, type SankeyGeo, type SankeyMarks } from "./paint";

/**
 * Paints the sankey outside React: one tween moves every mark. The first view sweeps the columns in, a data
 * change tweens from where the marks are (an interrupted change restarts from the geometry it reached), a
 * resize applies at once, and reduced motion draws the final frame.
 * @internal
 */
export function useSankeyPaint({
  geo,
  columns,
  play,
  reduced,
  width,
  signature,
  nodeWidth,
  layers,
  marksRef,
  copyLit,
}: {
  geo: SankeyGeo;
  columns: number;
  play: boolean;
  reduced: boolean;
  width: number;
  /** Changes when the data changes, not when the size does. */
  signature: string;
  nodeWidth: number;
  layers: {
    links: RefObject<SVGGElement | null>;
    nodes: RefObject<SVGGElement | null>;
    labels: RefObject<SVGGElement | null>;
    leaving: RefObject<SVGGElement | null>;
  };
  /** Receives the marks it just found, so the lit copies follow every frame. */
  marksRef: RefObject<SankeyMarks | null>;
  copyLit: (marks: SankeyMarks | null) => void;
}) {
  const lastSignature = useRef(signature);
  const shownRef = useRef<SankeyGeo | null>(null);
  // The running tween, and the geometry it has reached (an interrupted change restarts from there).
  const runRef = useRef<{ now: () => SankeyGeo } | null>(null);
  // When the first-view entrance began (performance.now()), or -Infinity once it can't run any more.
  const enterAt = useRef<number | null>(null);
  const nodeWidthRef = useRef(nodeWidth);
  useSyncRef(nodeWidthRef, nodeWidth);
  const copyLitRef = useRef(copyLit);
  useSyncRef(copyLitRef, copyLit);

  useLayoutEffect(() => {
    if (width === 0) return;
    // Data changes tween; a resize (same signature, new geometry) applies at once.
    const dataChanged = lastSignature.current !== signature;
    lastSignature.current = signature;
    const prev = marksRef.current;
    const marks: SankeyMarks = {
      links: marksById(layers.links.current),
      nodes: marksById(layers.nodes.current),
      labels: marksById(layers.labels.current),
    };
    marksRef.current = marks;
    const from = runRef.current?.now() ?? shownRef.current;
    runRef.current = null;
    shownRef.current = geo;
    const paint = (t: number, enter: number | null, base: SankeyGeo | null = null) => {
      paintSankey(marks, geo, base, t, enter, nodeWidthRef.current);
      copyLitRef.current(marks);
    };
    if (reduced) {
      enterAt.current ??= -Infinity;
      paint(1, null);
      return;
    }
    if (!play) {
      paint(1, 0); // waiting for the first view: in place, not grown or drawn yet
      return;
    }
    const total = Math.max(0, columns - 1) * COLUMN_STAGGER + 0.25 + duration.slower;
    enterAt.current ??= performance.now();
    const elapsed = (performance.now() - enterAt.current) / 1000;
    if (elapsed < total) {
      // First view (or new data while it runs): carry on from where the entrance is.
      paint(1, elapsed);
      const controls = animate(elapsed, total, {
        duration: total - elapsed,
        ease: "linear",
        onUpdate: (e) => paint(1, e),
      });
      return () => controls.stop();
    }
    // Marks that left the data fade out where they were.
    if (prev)
      fadeOutLeaving(layers.leaving.current, [...prev.links.values(), ...prev.nodes.values(), ...prev.labels.values()]);
    if (!dataChanged || !from) {
      paint(1, null); // a resize: straight to the new geometry
      return;
    }
    let t = 0;
    paint(0, null, from);
    const controls = animate(0, 1, {
      duration: duration.slow,
      ease: "linear",
      onUpdate: (k) => {
        t = changeCurve(k);
        paint(t, null, from);
      },
      onComplete: () => {
        runRef.current = null;
      },
    });
    runRef.current = { now: () => (t >= 1 ? geo : mixGeo(from, geo, t)) };
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `layers` is a bag of refs; the rest is read through refs.
  }, [geo, play, reduced, width, signature, columns]);
}
