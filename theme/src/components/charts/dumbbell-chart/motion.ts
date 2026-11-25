import type { MarkState } from "../kits/histogram-kit/kit";
import { duration } from "../../../motion/tokens";
import { springEasing } from "../kits/histogram-kit/kit";
import { easeOut } from "./parts";
import { barD, dotPath, FROM_R, part, TO_R } from "./model";

/** The slope layout's column x positions, the part of it the mark writer needs. @internal */
export type SlopeColumns = { xL: number; xR: number } | null;

/** Writes one row's animated numbers into its element (slope lines or dumbbell bars). @internal */
export function writeDumbbellMark(S: SlopeColumns, el: SVGElement, s: MarkState) {
  if (S) {
    const [y1 = 0, y2 = 0, ly = 0, ry = 0] = s;
    part(el, "line")?.setAttribute("d", `M${S.xL},${y1.toFixed(1)} L${S.xR},${y2.toFixed(1)}`);
    const grad = part(el, "grad");
    grad?.setAttribute("y1", y1.toFixed(1));
    grad?.setAttribute("y2", y2.toFixed(1));
    part(el, "from")?.setAttribute("d", dotPath(S.xL, y1, FROM_R));
    part(el, "to")?.setAttribute("d", dotPath(S.xR, y2, TO_R));
    part(el, "lt")?.setAttribute("transform", `translate(0 ${ly.toFixed(1)})`);
    part(el, "rt")?.setAttribute("transform", `translate(0 ${ry.toFixed(1)})`);
    return;
  }
  const [y = 0, xa = 0, xb = 0] = s;
  el.setAttribute("transform", `translate(0 ${y.toFixed(1)})`);
  part(el, "bar")?.setAttribute("d", barD(xa, xb));
  part(el, "from")?.setAttribute("d", dotPath(xa, 0, FROM_R));
  part(el, "to")?.setAttribute("d", dotPath(xb, 0, TO_R));
}

/** The first-view entrance of one row: the "before" dot pops, then the "after" end lands. @internal */
export function dumbbellEntrance(S: SlopeColumns, step: number, i: number, s: MarkState, el: SVGElement) {
  const pop = { duration: 0.35, easing: springEasing() };
  if (S) {
    // The line draws left to right; the "before" dot and label pop first, the "after" ones land with the line.
    return [
      {
        target: part(el, "from"),
        keyframes: [{ transform: "scale(0)" }, { transform: "none" }],
        delay: 0.05 + i * step,
        ...pop,
      },
      {
        target: part(el, "lt"),
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        delay: 0.05 + i * step,
        duration: duration.base,
      },
      {
        target: part(el, "line"),
        keyframes: [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        delay: 0.25 + i * step,
        duration: duration.slower,
      },
      {
        target: part(el, "to"),
        keyframes: [{ transform: "scale(0)" }, { transform: "none" }],
        delay: 0.25 + i * step + duration.slower * 0.8,
        ...pop,
      },
      {
        target: part(el, "rt"),
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        delay: 0.25 + i * step + duration.slower * 0.8,
        duration: duration.base,
      },
    ];
  }
  // The "before" dot pops in, then the "after" dot travels out of it, drawing the bar behind it.
  const [, xa = 0, xb = 0] = s;
  const travel = (xa - xb).toFixed(1);
  return [
    {
      target: part(el, "from"),
      keyframes: [{ transform: "scale(0)" }, { transform: "none" }],
      delay: 0.05 + i * step,
      ...pop,
    },
    {
      target: part(el, "bar"),
      keyframes: [{ transform: "scaleX(0)" }, { transform: "none" }],
      delay: 0.25 + i * step,
      duration: duration.slower,
    },
    {
      target: part(el, "to"),
      keyframes: [
        { transform: `translateX(${travel}px) scale(0)`, easing: easeOut() },
        { transform: `translateX(${travel}px) scale(1)`, offset: 0.25, easing: easeOut() },
        { transform: "translateX(0px) scale(1)" },
      ],
      delay: 0.05 + i * step,
      duration: 0.2 + duration.slower,
      easing: "linear",
    },
    {
      target: part(el, "chg"),
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      delay: 0.25 + i * step + duration.slower * 0.8,
      duration: duration.base,
    },
  ];
}
