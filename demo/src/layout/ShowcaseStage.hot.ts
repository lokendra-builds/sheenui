import { useEffect } from "react";

/**
 * Moves a menu's hover highlight to the item at `index` (the real pointer path, so the glide highlight travels) while
 * the menu with `data-stage-menu="<name>"` is open. A no-op when the menu or item is not there.
 */
export function useHotItem(name: string, open: boolean, index: number | null) {
  useEffect(() => {
    if (!open || index === null) return;
    const id = window.setTimeout(() => {
      const popup = document.querySelector(`[data-stage-menu="${name}"]`);
      const item = popup?.querySelectorAll<HTMLElement>('[role^="menuitem"]')[index];
      if (!item) return;
      const init = { bubbles: true, pointerType: "mouse", pointerId: 1, isPrimary: true } as const;
      item.dispatchEvent(new PointerEvent("pointerenter", { ...init, bubbles: false }));
      item.dispatchEvent(new PointerEvent("pointermove", init));
      item.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
      item.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    }, 60);
    return () => window.clearTimeout(id);
  }, [name, open, index]);
}

/**
 * Ref for a stage menu's popup: names its positioner (a `role="region"` wrapper in `<body>`) so the stage's open menu and
 * a menu the person opens elsewhere on the page never share an unnamed landmark (`landmark-unique`).
 */
export function nameStageMenu(popup: HTMLElement | null) {
  popup?.closest('[role="region"]')?.setAttribute("aria-label", "Preview menu");
}
