"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
} from "react";

import { useControllable } from "../hooks/use-controllable";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { Input } from "../input/input";

import {
  type AlertDialogTone,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogIcon,
  type AlertDialogContentProps,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  shake,
} from "./parts/icons-content";

export {
  type AlertDialogTone,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  createAlertDialogHandle,
  AlertDialogIcon,
  type AlertDialogContentProps,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  type AlertDialogActionProps,
  AlertDialogAction,
} from "./parts/icons-content";
/* ---------- ConfirmDialog: everything wired up ---------- */

/** Every UI string of {@link ConfirmDialog}; pass a partial through its `labels` prop to translate it. */
export type ConfirmDialogLabels = {
  /** Action button. */
  confirm: ReactNode;
  /** Cancel button. */
  cancel: ReactNode;
  /** Action button text and screen-reader status while onConfirm runs. */
  pending: string;
  /** Shown when onConfirm throws without a message. */
  error: string;
  /** Label of the type-to-confirm field. */
  typeToConfirm: (text: string) => ReactNode;
};

/** The English strings of {@link ConfirmDialog} (Confirm, Cancel, Working…, a generic error, the type-to-confirm prompt). Spread it to build your own set. */
export const defaultConfirmDialogLabels: ConfirmDialogLabels = {
  confirm: "Confirm",
  cancel: "Cancel",
  pending: "Working…",
  error: "Something went wrong. Please try again.",
  typeToConfirm: (text) => (
    <>
      Type <span className="font-sheen-mono font-semibold text-sheen-fg">{text}</span> to confirm
    </>
  ),
};

/** Props of {@link ConfirmDialog}. */
export type ConfirmDialogProps = {
  /** Element that opens the dialog, e.g. <Button variant="danger">Delete</Button>. Omit it to control the dialog with `open`. */
  trigger?: ReactElement;
  /** Controlled open state. Pair it with `onOpenChange`. */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called with the next open state when the dialog opens or is dismissed. */
  onOpenChange?: (open: boolean) => void;
  /** Called after the close animation has finished. */
  onOpenChangeComplete?: (open: boolean) => void;
  /**
   * Colours the icon and the action button, and decides what is focused first.
   * @default "danger"
   */
  tone?: AlertDialogTone;
  /** Replace the tone icon, or pass null to hide it. */
  icon?: ReactNode | null;
  /** The question, e.g. "Delete 3 files?". It names the dialog for screen readers. */
  title: ReactNode;
  /** Supporting text: what happens and whether it can be undone. */
  description?: ReactNode;
  /** Extra content between the text and the buttons (a list of what will be affected, …). */
  children?: ReactNode;
  /** Shorthand for labels.confirm. */
  confirmLabel?: ReactNode;
  /** Shorthand for labels.cancel. */
  cancelLabel?: ReactNode;
  /**
   * Runs when the action is pressed. Return a promise to show a loading state: the dialog stays
   * open (and can't be dismissed) until it settles, closes on success, and shows the error on failure.
   */
  onConfirm?: () => unknown;
  /** Called when the dialog is dismissed without confirming (Cancel, Escape). */
  onCancel?: () => void;
  /** Require typing this text (e.g. a project name) before the action is enabled. */
  confirmationText?: string;
  /** Turn a thrown error into the message shown in the dialog. */
  errorMessage?: (error: unknown) => ReactNode;
  /** Any UI string (i18n). */
  labels?: Partial<ConfirmDialogLabels>;
  /**
   * Element focused when it opens: Cancel for danger / warning, the action for info, and the field with
   * confirmationText.
   *
   * @default Cancel (danger, warning), the action (info)
   */
  initialFocus?: AlertDialogContentProps["initialFocus"];
  /**
   * Where focus goes when it closes. Defaults to the trigger (or the element focused before it
   * opened); if that element is removed (its row was deleted), to the same spot in the list.
   */
  finalFocus?: AlertDialogContentProps["finalFocus"];
  /** Adds extra classes to the dialog panel. */
  className?: string;
};

/* ---------- Focus rescue: when the element focus returns to is removed ---------- */

const ROW_SELECTOR = 'li, tr, [role="row"], [role="listitem"], [role="option"], [role="treeitem"], [role="article"]';
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/** Where an element sits: its row, the row's list, and which of the row's controls it is. */
type FocusSpot = { target: HTMLElement; row: Element; list: Element | null; index: number; slot: number };

function tabbables(root: Element): HTMLElement[] {
  const found = Array.from(root.querySelectorAll<HTMLElement>(TABBABLE));
  if (root instanceof HTMLElement && root.matches(TABBABLE)) found.unshift(root);
  return found.filter((element) => element.getClientRects().length > 0 && !element.closest("[inert]"));
}

function rememberSpot(target: HTMLElement): FocusSpot {
  const row = target.closest(ROW_SELECTOR) ?? target;
  const list = row.parentElement;
  return {
    target,
    row,
    list,
    index: list ? Array.prototype.indexOf.call(list.children, row) : -1,
    slot: Math.max(0, tabbables(row).indexOf(target)),
  };
}

/** The control that now stands where the removed one was. */
function spotFallback(spot: FocusSpot): HTMLElement | null {
  const { list, index, slot } = spot;
  if (!list?.isConnected) return null;
  const rows = Array.from(list.children).filter((row) => row !== spot.row);
  // The row that moved up into its place, then the one before it, then any other.
  const order = [
    rows[index],
    rows[index - 1],
    ...rows.slice(index + 1),
    ...rows.slice(0, Math.max(0, index - 1)).reverse(),
  ];
  for (const row of order) {
    if (!row) continue;
    const controls = tabbables(row);
    const control = controls[Math.min(slot, controls.length - 1)];
    if (control) return control;
  }
  // The list is empty now: the first control around it (an empty state, an "add" button).
  const around = list.parentElement;
  return around ? (tabbables(around)[0] ?? null) : null;
}

/** For a few seconds after closing: if the returned-to element is removed, refocus its spot. */
function watchSpot(spot: FocusSpot, popup: HTMLElement | null) {
  if (typeof MutationObserver === "undefined") return;
  let done = false;
  const observer = new MutationObserver(() => {
    if (spot.target.isConnected) return;
    stop();
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    spotFallback(spot)?.focus();
  });
  // The person (or the app) moved focus somewhere else: nothing to rescue.
  const onFocusIn = (event: globalThis.FocusEvent) => {
    const target = event.target as Node | null;
    if (target === spot.target || (popup && target && popup.contains(target))) return;
    stop();
  };
  const timer = window.setTimeout(() => stop(), 4000);
  function stop() {
    if (done) return;
    done = true;
    observer.disconnect();
    window.clearTimeout(timer);
    document.removeEventListener("focusin", onFocusIn, true);
  }
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("focusin", onFocusIn, true);
}

/**
 * A complete confirmation dialog in one component: tone icon, title, description, Cancel and the
 * action, a loading state while an async `onConfirm` runs, an inline error with a shake, and an
 * optional type-to-confirm field. Use it for destructive or irreversible actions; use
 * {@link useConfirm} when you would rather `await` the answer.
 *
 * Props (see {@link ConfirmDialogProps}): `title` (required), `description`, `trigger`, `tone`
 * ("danger" default), `icon`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`,
 * `confirmationText`, `errorMessage`, `labels`, `open` / `defaultOpen` / `onOpenChange`,
 * `initialFocus`, `finalFocus`, `className`.
 *
 * Keyboard: Escape or Cancel dismisses (blocked while the action runs); Enter in the field submits; Tab is trapped inside. Focus starts on Cancel (danger, warning), the action (info) or the type-to-confirm field, and returns to the trigger; if that element was removed it lands on the same spot in the list.
 * Accessibility: `role="alertdialog"` named by the title; `aria-busy` and a polite status announce the pending state; errors use `role="alert"` and are linked to the field or action.
 * Glass: One `glass-3` panel, no extra blur layers; forced colors get borders.
 * Motion: Springs up and fades in; an outside press nudges the panel; a failed action shakes it. All of it is dropped under reduced motion.
 *
 * @example
 * ```tsx
 * import { Button, ConfirmDialog } from "@sheenui/theme";
 *
 * export function DeleteButton({ remove }: { remove: () => Promise<void> }) {
 *   return (
 *     <ConfirmDialog
 *       trigger={<Button variant="danger">Delete project</Button>}
 *       title="Delete this project?"
 *       description="All of its files are removed for good."
 *       confirmationText="my-project"
 *       onConfirm={remove}
 *     />
 *   );
 * }
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function ConfirmDialog({
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  tone = "danger",
  icon,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmationText,
  errorMessage,
  labels: labelsProp,
  initialFocus: initialFocusProp,
  finalFocus: finalFocusProp,
  className,
}: ConfirmDialogProps) {
  const labels = { ...defaultConfirmDialogLabels, ...labelsProp };
  const [open, setOpenValue] = useControllable(openProp, defaultOpen);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const [typed, setTyped] = useState("");
  const reduced = useSheenReducedMotion();
  const popupRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const mounted = useRef(true);

  // Every opening starts clean (also when `open` is controlled from outside, e.g. useConfirm).
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setError(null);
      setTyped("");
    }
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Remember where focus came from (before Base UI moves it into the dialog)...
  const spot = useRef<FocusSpot | null>(null);
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (!open) return;
    wasOpen.current = true;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body && !popupRef.current?.contains(active)) {
      spot.current = rememberSpot(active);
    }
  }, [open]);

  // ...and after closing, rescue focus if that element goes away (e.g. its row was just deleted).
  useEffect(() => {
    if (open || !wasOpen.current) return;
    wasOpen.current = false;
    if (spot.current && finalFocusProp === undefined) watchSpot(spot.current, popupRef.current);
  }, [open, finalFocusProp]);

  const matches = confirmationText === undefined || typed.trim() === confirmationText;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenValue(next);
      onOpenChange?.(next);
    },
    [setOpenValue, onOpenChange],
  );

  function handleOpenChange(next: boolean) {
    // While the action runs, Escape and Cancel do nothing: the outcome is still unknown.
    if (!next && pending) return;
    // A successful action closes the dialog itself (below), so a close that arrives here is a dismissal.
    if (!next) onCancel?.();
    setOpen(next);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !matches) return;
    setError(null);
    try {
      const result = onConfirm?.();
      if (result instanceof Promise || (typeof result === "object" && result !== null && "then" in result)) {
        setPending(true);
        await (result as PromiseLike<unknown>);
      }
      if (!mounted.current) return;
      setPending(false);
      setOpen(false);
    } catch (caught) {
      if (!mounted.current) return;
      setPending(false);
      setError(
        errorMessage ? errorMessage(caught) : caught instanceof Error && caught.message ? caught.message : labels.error,
      );
      if (!reduced) shake(popupRef.current);
      actionRef.current?.focus();
    }
  }

  // Safe choice first for destructive tones; the action for a plain confirmation.
  const initialFocus =
    initialFocusProp ?? (confirmationText !== undefined ? fieldRef : tone === "info" ? actionRef : cancelRef);

  // Back to where focus came from; if that element is already gone, to the same spot in its list.
  const finalFocus =
    finalFocusProp ??
    (() => {
      const remembered = spot.current;
      if (remembered && !remembered.target.isConnected) return spotFallback(remembered) ?? true;
      return true;
    });

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent
        ref={popupRef}
        tone={tone}
        icon={icon}
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        className={className}
        aria-busy={pending || undefined}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {(Boolean(children) || confirmationText !== undefined || error) && (
            <div className="flex flex-col gap-4">
              {children}
              {confirmationText !== undefined && (
                <Input
                  ref={fieldRef}
                  label={labels.typeToConfirm(confirmationText)}
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                  disabled={pending}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  inputClassName="font-sheen-mono"
                  aria-describedby={error ? errorId : undefined}
                  trailing={
                    matches && typed ? (
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="size-4 text-sheen-success-text"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    ) : undefined
                  }
                />
              )}
              {error && (
                <p
                  id={errorId}
                  role="alert"
                  className="flex items-start gap-2 rounded-sheen-md border border-sheen-danger-text/25 bg-sheen-surface/85 [background-image:linear-gradient(var(--sheen-danger-soft),var(--sheen-danger-soft))] px-3 py-2.5 text-sm text-sheen-danger-text"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="mt-0.5 size-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span>{error}</span>
                </p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel ref={cancelRef} disabled={pending}>
              {cancelLabel ?? labels.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              ref={actionRef}
              type="submit"
              closeOnClick={false}
              loading={pending}
              disabled={!matches}
              aria-describedby={error && confirmationText === undefined ? errorId : undefined}
            >
              {pending ? labels.pending : (confirmLabel ?? labels.confirm)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
        {/* Announces the pending state (aria-busy alone is not read out). */}
        <span role="status" className="sr-only">
          {pending ? labels.pending : ""}
        </span>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------- useConfirm: promise-based confirmation ---------- */

/** Options of the `confirm()` function from {@link useConfirm}: the {@link ConfirmDialogProps} minus the ones the hook controls (trigger, open state, `onCancel`). */
export type ConfirmOptions = Omit<
  ConfirmDialogProps,
  "trigger" | "open" | "defaultOpen" | "onOpenChange" | "onOpenChangeComplete" | "onCancel"
>;

/**
 * Ask from any event handler and await the answer:
 *
 *   const [confirm, confirmDialog] = useConfirm();
 *   async function remove() {
 *     if (await confirm({ title: "Delete 3 files?", confirmLabel: "Delete" })) …
 *   }
 *   return <>{…}{confirmDialog}</>;
 *
 * Resolves true once onConfirm (if any) has finished, false when dismissed. Returns
 * `[confirm, dialog]`: `confirm(options)` takes a {@link ConfirmOptions} and returns the promise;
 * render `dialog` once anywhere in the component. A newer question replaces an unanswered one.
 *
 * Keyboard: Same as {@link ConfirmDialog}: Escape resolves false, Enter confirms the focused action.
 * Accessibility: Renders the same `role="alertdialog"`; focus returns to the element that was focused when you called `confirm()`.
 *
 * @example
 * ```tsx
 * import { Button, useConfirm } from "@sheenui/theme";
 *
 * export function Cleanup() {
 *   const [confirm, confirmDialog] = useConfirm();
 *   async function run() {
 *     if (await confirm({ title: "Delete 3 files?", confirmLabel: "Delete" })) {
 *       console.log("deleted");
 *     }
 *   }
 *   return (
 *     <>
 *       <Button onClick={run}>Clean up</Button>
 *       {confirmDialog}
 *     </>
 *   );
 * }
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function useConfirm() {
  const [request, setRequest] = useState<{ options: ConfirmOptions; resolve: (ok: boolean) => void } | null>(null);
  const [open, setOpen] = useState(false);
  const pendingResolve = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    // A newer question replaces an unanswered one.
    pendingResolve.current?.(false);
    return new Promise<boolean>((resolve) => {
      pendingResolve.current = resolve;
      setRequest({ options, resolve });
      setOpen(true);
    });
  }, []);

  useEffect(() => () => pendingResolve.current?.(false), []);

  const dialog = request ? (
    <ConfirmDialog
      {...request.options}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          request.resolve(false);
          pendingResolve.current = null;
        }
      }}
      onConfirm={() => {
        const finish = () => {
          request.resolve(true);
          pendingResolve.current = null;
        };
        const result = request.options.onConfirm?.();
        // Keep async work async (loading state), and sync answers instant.
        if (result instanceof Promise) return result.then(finish);
        finish();
        return undefined;
      }}
      onOpenChangeComplete={(next) => {
        if (!next) setRequest(null);
      }}
    />
  ) : null;

  return [confirm, dialog] as const;
}

/** Props of {@link AlertDialog}. Root of an alert dialog: holds the open state and wires the trigger, popup and buttons together. */
export type AlertDialogProps = ComponentProps<typeof AlertDialog>;

/** Props of {@link AlertDialogTrigger}. The button that opens an {@link AlertDialog} (Base UI `AlertDialog.Trigger`). */
export type AlertDialogTriggerProps = ComponentProps<typeof AlertDialogTrigger>;

/** Props of {@link AlertDialogClose}. Any element inside the dialog that closes it when pressed (Base UI `AlertDialog.Close`). */
export type AlertDialogCloseProps = ComponentProps<typeof AlertDialogClose>;

/** Props of {@link AlertDialogHeader}. Icon + title + description. */
export type AlertDialogHeaderProps = ComponentProps<typeof AlertDialogHeader>;

/** Props of {@link AlertDialogIcon}. The tone icon in a soft tinted disc. */
export type AlertDialogIconProps = ComponentProps<typeof AlertDialogIcon>;

/** Props of {@link AlertDialogTitle}. The dialog's name (Base UI `AlertDialog.Title`, an `<h2>`). */
export type AlertDialogTitleProps = ComponentProps<typeof AlertDialogTitle>;

/** Props of {@link AlertDialogDescription}. Supporting text under the title (Base UI `AlertDialog.Description`). */
export type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogDescription>;

/** Props of {@link AlertDialogFooter}. Buttons row: stacked full-width on phones (action on top, in thumb reach), a right-aligned row from `sm`. */
export type AlertDialogFooterProps = ComponentProps<typeof AlertDialogFooter>;

/** Props of {@link AlertDialogCancel}. Closes the dialog without doing anything. */
export type AlertDialogCancelProps = ComponentProps<typeof AlertDialogCancel>;
