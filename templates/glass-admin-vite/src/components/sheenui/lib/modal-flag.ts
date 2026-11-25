let surfaces = 0;

/**
 * `data-modal-open` on `<html>` while a modal glass surface is in the DOM.
 *
 * styles/glass.css turns the page's own blur off behind a dialog (the glass budget with a modal open). That rule
 * used to be written as `:root:has([data-slot="dialog-content"])`, which made the browser re-check the whole
 * document against the `:has()` on every DOM insertion while a dialog opened or closed (six to nine re-checks
 * per open at 4x CPU). An attribute the dialog toggles itself gives the same result for one attribute change.
 *
 * Use it as a ref on the modal's popup element (`ref={mergeRefs(ref, modalSurfaceRef)}`): it counts the
 * surfaces attached, so nested or stacked dialogs keep the flag until the last one has left the DOM. It is
 * called with `null` when the node detaches (React 18 style; `mergeRefs` adapts it for React 19's cleanups).
 */
export function modalSurfaceRef(node: HTMLElement | null): void {
  if (typeof document === "undefined") return;
  if (node) {
    surfaces++;
    document.documentElement.setAttribute("data-modal-open", "");
  } else if (surfaces > 0 && --surfaces === 0) {
    document.documentElement.removeAttribute("data-modal-open");
  }
}
