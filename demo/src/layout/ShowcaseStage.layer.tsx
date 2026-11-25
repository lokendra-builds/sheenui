import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * A layer over the whole stage for overlays that portal to a fixed screen position (a drawer, an alert dialog). The
 * layer has a transform, so `position: fixed` inside it is relative to the stage, and the stage clips what slides out.
 * Pass the returned `layer` element as the overlay's `container`, and render `node` once anywhere in the scene.
 */
export function useStageLayer(host: HTMLElement | null) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const node: ReactNode = host
    ? createPortal(
        <div
          ref={setLayer}
          data-stage-layer=""
          style={{ position: "absolute", inset: 0, zIndex: 5, transform: "translateZ(0)", pointerEvents: "none" }}
        />,
        host,
      )
    : null;
  return { layer, node };
}

/**
 * Keeps a position:fixed popup that was portalled to the page centred (or top-anchored) on the stage while it is open.
 * `find` returns the popup element; it is called on every frame the page scrolls or resizes.
 */
export function usePlaceOnStage(
  host: HTMLElement | null,
  open: boolean,
  find: () => HTMLElement | null,
  topGap?: number,
) {
  useEffect(() => {
    if (!open || !host) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const el = find();
      if (!el) return;
      const r = host.getBoundingClientRect();
      el.style.top = topGap === undefined ? `${r.top + r.height / 2}px` : `${r.top + topGap}px`;
      el.style.left = `${r.left + r.width / 2}px`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    queue();
    const poll = window.setInterval(place, 120);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(poll);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [open, host, find, topGap]);
}
