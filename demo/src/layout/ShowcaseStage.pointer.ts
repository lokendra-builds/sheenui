import { useEffect } from "react";

const MOUSE = { bubbles: true, pointerType: "mouse", pointerId: 1, isPrimary: true } as const;

/**
 * A pointer the story moves: sends the same pointer events a mouse would (over, move, out) to an element inside
 * `scope`, so the effect runs its real code path (the dock swells, the card tilts, the spotlight follows).
 * `selector` picks the element inside `scope` (default: `scope` itself); `point` is where on its box the pointer is,
 * 0 to 1 on each axis, or `null` to take the pointer off it.
 */
export function useVirtualPointer(
  scope: HTMLElement | null,
  selector: string | null,
  point: { x: number; y: number } | null,
) {
  const x = point?.x;
  const y = point?.y;
  useEffect(() => {
    if (!scope) return;
    const target = selector ? scope.querySelector<HTMLElement>(selector) : scope;
    if (!target) return;
    if (x === undefined || y === undefined) {
      // No relatedTarget: the pointer left the window, which every effect treats as "gone".
      target.dispatchEvent(new PointerEvent("pointerout", MOUSE));
      target.dispatchEvent(new PointerEvent("pointerleave", { ...MOUSE, bubbles: false }));
      return;
    }
    const box = target.getBoundingClientRect();
    const init = { ...MOUSE, clientX: box.left + box.width * x, clientY: box.top + box.height * y };
    target.dispatchEvent(new PointerEvent("pointerover", init));
    target.dispatchEvent(new PointerEvent("pointerenter", { ...init, bubbles: false }));
    target.dispatchEvent(new PointerEvent("pointermove", init));
    window.dispatchEvent(new PointerEvent("pointermove", init));
  }, [scope, selector, x, y]);
}
