"use client";

import { AnimatePresence, motion } from "motion/react";

import { duration } from "../../../motion/tokens";
import { changeEase, exitTransition } from "../chart-utils";
import { textWidth } from "../chart-pointer";
import { edgeAnchor } from "../histogram/model";
import type { computeLollipopLayout } from "./layout";

type LollipopLayout = ReturnType<typeof computeLollipopLayout>;

/**
 * The lollipop's value axis: gridlines and tick labels that glide when the scale changes and fade as they
 * leave (the baseline drawn firmer), the baseline itself when it is not a tick, and the axis title.
 * Instant under reduced motion.
 * @internal
 */
export function LollipopAxis({
  layout,
  horizontal,
  baseline,
  valueLabel,
  title,
  rtl,
  reduced,
}: {
  layout: Pick<
    LollipopLayout,
    "ticks" | "X" | "sv" | "fmtAxis" | "xShown" | "axisLo" | "axisHi" | "vBase" | "innerW" | "innerH"
  >;
  horizontal: boolean;
  baseline: number;
  valueLabel?: string;
  /** Where the axis title sits and how it anchors. */
  title: { x: number; y: number; anchor: "start" | "middle" | "end" };
  rtl: boolean;
  reduced: boolean;
}) {
  const { ticks, X, sv, fmtAxis, xShown, axisLo, axisHi, vBase, innerW, innerH } = layout;
  const instant = { duration: 0 };
  const morph = reduced ? instant : { duration: duration.slow, ease: changeEase };
  return (
    <>
      {valueLabel && (
        <text x={title.x} y={title.y} textAnchor={title.anchor} className="fill-sheen-fg-muted text-2xs font-medium">
          {valueLabel}
        </text>
      )}

      {/* Value grid; the baseline gets a firmer line. */}
      <AnimatePresence initial={false}>
        {ticks.map((tk, ti) => {
          const p = horizontal ? X(sv(tk)) : sv(tk);
          const text = fmtAxis(tk);
          const strong = tk === baseline;
          const labelled = !xShown || xShown.has(ti);
          return (
            <motion.g
              key={`t${tk}`}
              initial={horizontal ? { opacity: 0, x: p } : { opacity: 0, y: p }}
              animate={horizontal ? { opacity: 1, x: p } : { opacity: 1, y: p }}
              exit={{ opacity: 0, transition: reduced ? instant : exitTransition }}
              transition={{ x: morph, y: morph, opacity: reduced ? instant : { duration: duration.base } }}
            >
              {horizontal ? (
                <>
                  <line y1={-4} y2={innerH} stroke={strong ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  {labelled && (
                    <text
                      y={innerH + 18}
                      textAnchor={edgeAnchor(p, textWidth(text), axisLo, axisHi)}
                      className="fill-sheen-fg-muted text-2xs tabular-nums"
                    >
                      {text}
                    </text>
                  )}
                </>
              ) : (
                <>
                  <line x2={innerW} stroke={strong ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  <text
                    x={rtl ? innerW + 10 : -10}
                    dy="0.32em"
                    textAnchor={rtl ? "start" : "end"}
                    className="fill-sheen-fg-muted text-2xs tabular-nums"
                  >
                    {text}
                  </text>
                </>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>
      {/* The baseline itself, when it isn't a tick. */}
      {!ticks.includes(baseline) &&
        (horizontal ? (
          <line x1={X(vBase)} x2={X(vBase)} y1={-4} y2={innerH} stroke="var(--sheen-border)" />
        ) : (
          <line x1={0} x2={innerW} y1={vBase} y2={vBase} stroke="var(--sheen-border)" />
        ))}
    </>
  );
}
