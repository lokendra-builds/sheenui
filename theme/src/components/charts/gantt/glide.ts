import { duration, ease } from "../../../motion/tokens";
import { cssEase } from "./layout";

/** What a zoom glide animates. @internal */
export type GanttGlideInput = {
  /** The px-per-day before and after the zoom. */
  fromPx: number;
  px: number;
  /** How far the timeline scrolled, in physical px (signed for right-to-left). */
  shift: number;
  rtl: boolean;
  contentW: number;
  stretch: SVGSVGElement | null;
  overlay: SVGSVGElement | null;
  fade: SVGGElement | null;
};

/**
 * The animations of a zoom: the bars and grid (already drawn at the new zoom) stretch from where they
 * were, diamonds slide, labels fade back in. Returns the running animations (the first is the lead).
 * @internal
 */
export function startGanttGlide(o: GanttGlideInput): Animation[] {
  const { fromPx, px, shift, rtl, contentW, stretch, overlay, fade } = o;
  const k = fromPx / px;
  const origin = rtl ? contentW : 0;
  const timing: KeyframeAnimationOptions = { duration: duration.slower * 1000, easing: cssEase(ease.inOut) };
  const list: Animation[] = [];
  if (stretch && typeof stretch.animate === "function") {
    list.push(stretch.animate([{ transform: `translateX(${shift}px) scaleX(${k})` }, { transform: "none" }], timing));
    for (const node of overlay?.querySelectorAll<SVGElement>("[data-fx]") ?? []) {
      const x = Number(node.dataset.fx);
      list.push(
        node.animate([{ transform: `translateX(${(k - 1) * (x - origin) + shift}px)` }, { transform: "none" }], timing),
      );
    }
    if (fade) list.push(fade.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], timing));
  }
  return list;
}
