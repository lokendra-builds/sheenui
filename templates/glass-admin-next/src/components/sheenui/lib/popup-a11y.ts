"use client";

/**
 * Accessibility fix-ups for the Base UI popups (menus, listboxes, comboboxes). Spread `popupA11yProps`
 * on the popup's `*.Positioner`: `<BaseMenu.Positioner {...popupA11yProps}>`.
 *
 * It solves three axe-core findings that every Base UI popup raises while it is open:
 *
 * 1. `region` ("all page content should be contained by landmarks"). Base UI appends the popup's
 *    portal to `<body>`, outside `<main>`. `role="region"` makes the positioner its own region. It has
 *    no accessible name on purpose: an unnamed region is not exposed as a landmark, so landmark lists
 *    stay clean while the popup (which takes focus and has its own role and name) is read as usual.
 *    It sits on the positioner, not the portal, because Select keeps its portal mounted after it
 *    closes while the positioner is hidden. A submenu's positioner is named "Submenu" so two open
 *    menus never share a landmark name (`landmark-unique`).
 * 2. `aria-hidden-focus`, focus guards. Base UI's invisible focus-guard spans are `aria-hidden` and
 *    tabbable on purpose (they redirect Tab). axe accepts that for focus traps: an element with an
 *    `onfocus` handler is treated as a sentinel, so each guard gets a no-op one.
 * 3. `aria-hidden-focus`, the page behind. A typeable combobox hides everything outside it with
 *    `aria-hidden` but leaves links and buttons tabbable. While the popup is open those controls (inside
 *    any `aria-hidden` subtree) are
 *    taken out of the tab order (`tabindex="-1"`, restored on close). They stay clickable, so a
 *    click outside still closes the popup and presses the button in one go (`inert` would swallow it).
 *
 * `typeablePopupA11yProps` is the variant for popups whose input stays in the page (Combobox, the Tags
 * input suggestions). Base UI hides everything outside such a popup from assistive technology
 * (`aria-hidden`, unconditionally: there is no prop to turn it off), including the page's `<h1>` and
 * landmarks. That is the right call on touch screen readers (VoiceOver iOS, TalkBack), which ignore
 * `aria-activedescendant` and need the list to be the only thing to swipe through. On a fine pointer
 * (desktop screen readers follow `aria-activedescendant`, the WAI-ARIA combobox pattern is non-modal
 * and the page stays readable) the variant takes back what Base UI hid: only nodes hidden after the
 * popup mounted, so anything the app or another dialog had already hidden stays hidden. "Fine" means the
 * primary pointer (`(pointer: coarse)`), not `any-pointer`, which also matches touch laptops. On every device
 * Tab inside the open list is handled explicitly: focus moves to the next tabbable element after the input
 * and the list closes (2.1.1 / 2.4.3), so nothing is ever unreachable while the page is held.
 *
 * @internal
 */

import { useCallback, useLayoutEffect, useRef } from "react";

/** The primary pointer only: `(any-pointer: coarse)` also matches touch laptops and phones with a hardware keyboard. */
const PRIMARY_COARSE_QUERY = "(pointer: coarse)";

/** Accessible name of a nested popup's positioner: `level` is 1 for a first submenu, 2 for the one inside it. Default "Submenu" / "Submenu, level 2". */
export type SubmenuName = (level: number) => string;

/** English default of {@link SubmenuName}. */
export const defaultSubmenuName: SubmenuName = (level) => (level === 1 ? "Submenu" : `Submenu, level ${level}`);

const noop = () => undefined;

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[contenteditable="true"],[tabindex]:not([tabindex="-1"])';

/** Elements taken out of the tab order, shared by every open popup (a submenu opens over its parent). */
const held = new Map<HTMLElement, { original: string | null; count: number }>();

function hold(el: HTMLElement) {
  const entry = held.get(el);
  if (entry) {
    entry.count += 1;
    return;
  }
  held.set(el, { original: el.getAttribute("tabindex"), count: 1 });
  el.setAttribute("tabindex", "-1");
}

function release(el: HTMLElement) {
  const entry = held.get(el);
  if (!entry) return;
  entry.count -= 1;
  if (entry.count > 0) return;
  held.delete(el);
  // Leave it alone if the app changed it meanwhile (a roving tabindex, say).
  if (el.getAttribute("tabindex") !== "-1") return;
  if (entry.original === null) el.removeAttribute("tabindex");
  else el.setAttribute("tabindex", entry.original);
}

/** Touch screen readers need the list to be the only reachable content, so they keep Base UI's confinement. */
function keepsPageExposed() {
  return typeof matchMedia === "function" && !matchMedia(PRIMARY_COARSE_QUERY).matches;
}

const FOCUSABLE =
  'a[href],button,input:not([type="hidden"]),select,textarea,summary,[contenteditable="true"],[tabindex]';

/** Tab order as the user sees it: tabindex held by an open popup counts as its original value. */
function isTabbableNow(el: HTMLElement) {
  const entry = held.get(el);
  const tabindex = entry ? entry.original : el.getAttribute("tabindex");
  if (tabindex !== null && Number.parseInt(tabindex, 10) < 0) return false;
  if (tabindex === null && !el.matches('a[href],button,input,select,textarea,summary,[contenteditable="true"]'))
    return false;
  if (el.matches(":disabled") || el.closest("[inert],[hidden]") || el.hasAttribute("data-base-ui-focus-guard"))
    return false;
  if (el.closest("[data-base-ui-portal]")) return false;
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
}

/**
 * Tab inside an open typeable list: Base UI keeps the page hidden on touch-capable devices, which used to send
 * focus to `<body>`. Move focus explicitly to the next tabbable element after the input (before it for Shift+Tab);
 * the list closes when the input loses focus. Independent of pointer type, so no control is ever unreachable.
 */
function handleTab(event: KeyboardEvent, positioner: HTMLElement) {
  if (event.key !== "Tab" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const input = event.target;
  if (!(input instanceof HTMLElement) || positioner.contains(input) || !input.matches("input,textarea,[role=combobox]"))
    return;
  const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el === input || (isTabbableNow(el) && !positioner.contains(el)),
  );
  const at = all.indexOf(input);
  if (at < 0) return;
  const next = all[at + (event.shiftKey ? -1 : 1)];
  if (!next) return; // first/last stop: the browser moves on to its own chrome
  event.preventDefault();
  next.focus();
}

function createPopupRef(exposePage: boolean) {
  return (positioner: HTMLElement | null) => popupRef(positioner, exposePage, defaultSubmenuName);
}

function popupRef(positioner: HTMLElement | null, exposePage: boolean, submenuName: SubmenuName) {
  if (!positioner) return;
  const mine = new Set<HTMLElement>();
  // Hidden before this popup opened: not Base UI's doing for this popup, never un-hidden here.
  const hiddenBefore =
    exposePage && keepsPageExposed() ? new Set(document.querySelectorAll("[aria-hidden='true']")) : null;
  let frame = 0;

  const sweep = () => {
    frame = 0;
    if (!positioner.isConnected) return;
    for (const guard of document.querySelectorAll<HTMLElement>("[data-base-ui-focus-guard]")) {
      guard.onfocus ??= noop;
    }
    for (const root of document.querySelectorAll<HTMLElement>('[aria-hidden="true"]')) {
      if (
        hiddenBefore &&
        !hiddenBefore.has(root) &&
        !root.contains(positioner) &&
        !root.closest("[data-base-ui-portal]") &&
        !root.hasAttribute("data-base-ui-focus-guard")
      ) {
        root.removeAttribute("aria-hidden");
        continue;
      }
      // Never the popup itself, a portal's content or Base UI's own focus guards (they keep tabindex 0 to trap focus).
      if (
        root.contains(positioner) ||
        root.closest("[data-base-ui-portal]") ||
        root.hasAttribute("data-base-ui-focus-guard")
      )
        continue;
      const stops = root.matches(TABBABLE) ? [root] : [];
      for (const el of [...stops, ...root.querySelectorAll<HTMLElement>(TABBABLE)]) {
        if (mine.has(el) || el.hasAttribute("data-base-ui-focus-guard")) continue;
        mine.add(el);
        hold(el);
      }
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(sweep);
  };

  // A nested popup (a submenu) lives in its parent's portal: give it its own landmark name.
  const depth = nestedDepth(positioner);
  if (depth > 0) positioner.setAttribute("aria-label", submenuName(depth));

  const onKeyDown = exposePage ? (event: KeyboardEvent) => handleTab(event, positioner) : null;
  if (onKeyDown) document.addEventListener("keydown", onKeyDown, true);

  schedule();
  // Base UI applies and removes aria-hidden as popups open and close: only that attribute is watched.
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { attributes: true, attributeFilter: ["aria-hidden"], subtree: true });

  return () => {
    observer.disconnect();
    if (onKeyDown) document.removeEventListener("keydown", onKeyDown, true);
    if (frame) cancelAnimationFrame(frame);
    for (const el of mine) release(el);
    mine.clear();
  };
}

function nestedDepth(positioner: HTMLElement) {
  let depth = 0;
  let portal = positioner.parentElement?.closest("[data-base-ui-portal]") ?? null;
  // positioner.parentElement is this popup's own portal; walk up from there.
  portal = portal?.parentElement?.closest("[data-base-ui-portal]") ?? null;
  while (portal) {
    depth += 1;
    portal = portal.parentElement?.closest("[data-base-ui-portal]") ?? null;
  }
  return depth;
}

// Module-level refs: a stable identity, so React attaches each one once per mount.
const menuPopupRef = createPopupRef(false);
const typeablePopupRef = createPopupRef(true);

/** For menu, select and listbox popups: spread it on the `*.Positioner` (role, ref that applies the fix-ups above). */
export const popupA11yProps = { role: "region", ref: menuPopupRef } as const;
/** For popups whose input stays in the page (Combobox, Tags input): also keeps the page exposed on fine pointers. */
export const typeablePopupA11yProps = { role: "region", ref: typeablePopupRef } as const;

/**
 * `popupA11yProps` with a translatable name for nested popups. The ref keeps a stable identity (React attaches it once
 * per mount) and reads the latest `name` when the popup opens.
 *
 * @internal Menu content: `<BaseMenu.Positioner {...usePopupA11yProps(labels.submenu)}>`.
 * @example
 * ```tsx
 * import { Menu as BaseMenu } from "@base-ui/react/menu";
 * import { usePopupA11yProps } from "./popup-a11y";
 *
 * export function Popup({ children }: { children: React.ReactNode }) {
 *   const a11y = usePopupA11yProps((level) => `Untermenue ${level}`);
 *   return <BaseMenu.Positioner {...a11y}>{children}</BaseMenu.Positioner>;
 * }
 * ```
 * @see /overlays/dropdown-menu
 */
export function usePopupA11yProps(submenuName: SubmenuName = defaultSubmenuName) {
  const nameRef = useRef(submenuName);
  useLayoutEffect(() => {
    nameRef.current = submenuName;
  });
  const attach = useCallback(
    (positioner: HTMLElement | null) => popupRef(positioner, false, (level) => nameRef.current(level)),
    [],
  );
  return { role: "region", ref: attach } as const;
}
