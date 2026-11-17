"use client";

import { AnimatePresence, motion } from "motion/react";

import { duration } from "../../../motion/tokens";
import { changeEase, exitTransition } from "../chart-utils";
import { textWidth } from "../chart-pointer";
import { edgeAnchor } from "../histogram/model";
import type { computeDumbbellLayout } from "./layout";

type DumbbellLayout = NonNullable<ReturnType<typeof computeDumbbellLayout>>;

/**
 * The dumbbell's value axis: gridlines with tick labels that glide to their new place when the scale changes
 * and fade as they leave, plus the axis title. Instant under reduced motion.
 * @internal
 */
export function DumbbellAxis({
  layout: B,
  valueLabel,
  reduced,
}: {
  layout: DumbbellLayout;
  valueLabel?: string;
  reduced: boolean;
}) {
  const instant = { duration: 0 };
  const morph = reduced ? instant : { duration: duration.slow, ease: changeEase };
  return (
    <>
      {valueLabel && (
        <text
          x={B.innerW / 2}
          y={B.innerH + 40}
          textAnchor="middle"
          className="fill-sheen-fg-muted text-2xs font-medium"
        >
          {valueLabel}
        </text>
      )}
      <AnimatePresence initial={false}>
        {B.ticks.map((tk, ti) => {
          const p = B.X(tk);
          const text = B.fmtAxis(tk);
          return (
            <motion.g
              key={`t${tk}`}
              initial={{ opacity: 0, x: p }}
              animate={{ opacity: 1, x: p }}
              exit={{ opacity: 0, transition: reduced ? instant : exitTransition }}
              transition={{ x: morph, opacity: reduced ? instant : { duration: duration.base } }}
            >
              <line y1={-4} y2={B.innerH} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
              {B.xShown.has(ti) && (
                <text
                  y={B.innerH + 18}
                  textAnchor={edgeAnchor(p, textWidth(text), B.axisLo, B.axisHi)}
                  className="fill-sheen-fg-muted text-2xs tabular-nums"
                >
                  {text}
                </text>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>
    </>
  );
}
