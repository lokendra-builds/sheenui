/**
 * Keeps Tab and Shift+Tab inside a modal popup, synchronously.
 *
 * Base UI traps focus with two invisible guard spans around the popup. Landing on a guard hands focus back
 * on the next animation frame, so a second Tab pressed inside that gap (key repeat on a busy page, a script
 * or a switch device that sends keys quickly) walks on to the page behind the dialog. This wraps at the ends
 * on the keydown itself, so focus never reaches a guard by keyboard. The guards stay in place for everything
 * else (screen-reader virtual cursors, programmatic focus).
 *
 * It is a native listener on the popup element, not a React `onKeyDown` prop: Base UI merges and can skip a
 * popup's own key handler, a listener on the node cannot be skipped. Events from a nested popup that is
 * portalled elsewhere (a select or a menu opened inside the dialog) have a target outside the popup and are
 * left alone.
 *
 * @internal
 */

const TABBABLE =
  'a[href],button,input:not([type="hidden"]),select,textarea,summary,[contenteditable="true"],audio[controls],video[controls],iframe,[tabindex]';

function isTabbable(el: HTMLElement) {
  if (el.tabIndex < 0 || el.hasAttribute("data-base-ui-focus-guard")) return false;
  if (el.matches(":disabled") || el.closest("[inert],[hidden]")) return false;
  if (
    el instanceof HTMLInputElement &&
    el.type === "radio" &&
    !el.checked &&
    el.form?.querySelector(`input[type="radio"][name="${CSS.escape(el.name)}"]:checked`)
  )
    return false;
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
}

/** Keydown listener for a modal popup: wraps Tab at its first and last tabbable element. */
function wrapModalTab(event: KeyboardEvent): void {
  if (event.key !== "Tab" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const popup = event.currentTarget;
  const target = event.target;
  if (!(popup instanceof HTMLElement) || !(target instanceof Node) || !popup.contains(target)) return;
  // A modal rendered inside this one (not portalled out) wraps its own Tab: leave its events to it.
  if (target instanceof Element) {
    const inner = target.closest('[role="dialog"],[role="alertdialog"]');
    if (inner && inner !== popup && popup.contains(inner)) return;
  }
  const tabbable = [...popup.querySelectorAll<HTMLElement>(TABBABLE)].filter(isTabbable);
  const first = tabbable[0];
  const last = tabbable[tabbable.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  if (event.shiftKey ? target === first || target === popup : target === last) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}

/**
 * Wraps Tab at the ends of `popup` while `enabled`; returns the cleanup that removes the listener (the return
 * value of a `useEffect` callback). Pass the popup element from state (a ref callback that sets it), so the
 * listener is attached when the popup mounts: `useEffect(() => modalTabTrap(node, modal), [node, modal])`.
 *
 * @internal
 */
export function modalTabTrap(popup: HTMLElement | null, enabled = true): (() => void) | undefined {
  if (!popup || !enabled) return undefined;
  popup.addEventListener("keydown", wrapModalTab);
  return () => popup.removeEventListener("keydown", wrapModalTab);
}
