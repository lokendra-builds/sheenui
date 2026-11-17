"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { useLatest } from "../../hooks/use-latest";

import { cn } from "../../lib/cn";
import { useConfirm } from "../alert-dialog/alert-dialog";
import { Button } from "../button/button";
import { KbdShortcut } from "../kbd/kbd";
import { useToast } from "../toast/toast";
import { SEAL_HOLD_MS, SEAL_HOLD_REDUCED_MS, SuccessSeal, motionIsReduced } from "./parts/seal";
import { AlertIcon } from "../status-icons/icons";
import {
  SideDrawerBody,
  SideDrawerFooter,
  firstField,
  lastInteractionWasTouch,
  useSideDrawer,
  useSideDrawerCloseGuard,
} from "./side-drawer";

/* ---------- Edit-mode hook-up (set by SideDrawerDetail) ---------- */

/**
 * What `SideDrawerDetail` gives its edit form so the form can leave edit mode: `exit(reason)` after
 * Cancel or a successful save.
 */
export type SideDrawerEditContextValue = {
  /** Leave edit mode: after Cancel (changes dropped) or a successful save. */
  exit: (reason: "cancel" | "saved") => void;
};

/**
 * Provided by `SideDrawerDetail` around its editor: Cancel / Save in a `SideDrawerForm` return to the view instead of closing the drawer. You only need it to build your own view/edit switcher: provide
 * `{ exit(reason) }` (reason is "cancel" or "saved") and `SideDrawerForm` calls it instead of closing.
 *
 * Keyboard and accessibility: none, it is a React context. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { Input, SideDrawerEditContext, SideDrawerForm } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const setEditing: (editing: boolean) => void;
 * declare const values: { name: string };
 * declare function save(values: { name: string }): void;
 *
 * export function Example() {
 *   return (
 *     <SideDrawerEditContext value={{ exit: (reason) => setEditing(false) }}>
 *       <SideDrawerForm initialValues={values} onSubmit={save}>{(form) => <Input label="Name" {...form.field("name")} />}</SideDrawerForm>
 *     </SideDrawerEditContext>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export const SideDrawerEditContext = createContext<SideDrawerEditContextValue | null>(null);

/* ---------- Types ---------- */

type Keys<T> = Extract<keyof T, string>;
/** Keys whose values are strings: the ones `form.field()` can wire to an Input / Textarea. */
type StringKeys<T> = { [K in Keys<T>]: T[K] extends string ? K : never }[Keys<T>];

/** What a `validate` callback may return: field errors, or nothing when the values are valid. */
export type SideDrawerFormValidateResult<TValues> =
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- a validator that finds no problem may simply return nothing
  SideDrawerFormErrors<TValues> | undefined | void;

/** Field name → message. A falsy message means "no error". */
export type SideDrawerFormErrors<TValues> = Partial<Record<Keys<TValues>, string | null | false | undefined>>;

/**
 * What `onSubmit` of `SideDrawerForm` may return: nothing on success, or `{ errors, error }` to show
 * field errors and a form-level message.
 */
export type SideDrawerFormSubmitResult<TValues> =
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- an async `onSubmit` that returns nothing on success must stay assignable
  | void
  | undefined
  | {
      /** Field errors (e.g. from the server), shown inline like validation errors. */
      errors?: SideDrawerFormErrors<TValues>;
      /** A message about the whole form. */
      error?: string;
    };

/** Props for an Input or Textarea: `<Input label="Name" {...form.field("name")} />`. */
export type SideDrawerTextFieldProps = {
  /** The field's name. */
  name: string;
  /** The current value. */
  value: string;
  /** Updates the value as the person types. */
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** The error shown for this field, if any. */
  error?: string;
};

/**
 * The form state and helpers `SideDrawerForm` hands to its render function: values, errors, dirty and
 * submitting flags, `setValue`, `field`, `error` and `reset`.
 */
export type SideDrawerFormApi<TValues> = {
  /** The current values. */
  values: TValues;
  /** Errors currently shown, by field. */
  errors: Partial<Record<Keys<TValues>, string>>;
  /** Some value differs from the initial values. */
  dirty: boolean;
  /** onSubmit is running. */
  submitting: boolean;
  setValue: <K extends keyof TValues>(name: K, value: TValues[K]) => void;
  /** name / value / onChange / error for a string field. */
  field: (name: StringKeys<TValues>) => SideDrawerTextFieldProps;
  /** The error shown for a field, if any. */
  error: (name: Keys<TValues>) => string | undefined;
  /** Start over from `values` (default: the current initial values). */
  reset: (values?: TValues) => void;
};

/**
 * Every user-facing string of `SideDrawerForm` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type SideDrawerFormLabels = {
  /** Save button text. */
  save: ReactNode;
  /** Save button text (and spoken status) while onSubmit runs. */
  saving: string;
  /** Cancel button text. */
  cancel: ReactNode;
  /** Footer hint while there are changes. */
  unsaved: string;
  /** After the ⌘↵ key caps in the footer. */
  shortcut: string;
  /** Heading of the error summary. */
  errorSummary: (count: number) => string;
  /** Title of the "discard changes?" question. */
  discardTitle: string;
  /** Body of the "discard changes?" question. */
  discardDescription: string;
  /** The destructive button of the question. */
  discard: string;
  /** The safe button of the question. */
  keepEditing: string;
  /** Shown when onSubmit throws without a message. */
  saveFailed: string;
  /** The in-place confirmation next to the title after a save that keeps the drawer open. */
  saved: string;
};

/**
 * Default English strings of `SideDrawerFormLabels`; spread it and override single keys to reword.
 * Plain data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a
 * React Server Component receives a client reference instead of the object: read it from a client
 * component.
 */
export const defaultSideDrawerFormLabels: SideDrawerFormLabels = {
  save: "Save",
  saved: "Saved",
  saving: "Saving…",
  cancel: "Cancel",
  unsaved: "Unsaved changes",
  shortcut: "to save",
  errorSummary: (count) => (count === 1 ? "There is 1 problem to fix" : `There are ${count} problems to fix`),
  discardTitle: "Discard unsaved changes?",
  discardDescription: "Your edits will be lost. This can’t be undone.",
  discard: "Discard",
  keepEditing: "Keep editing",
  saveFailed: "Couldn’t save your changes. Please try again.",
};

/**
 * Props of `SideDrawerForm`: the native `<form>` props plus its own options, each documented on its
 * field.
 */
export type SideDrawerFormProps<TValues extends object> = Omit<
  ComponentProps<"form">,
  "onSubmit" | "children" | "onReset"
> & {
  /** Starting values. Read once (give the form a `key` to reset it for another record). */
  initialValues: TValues;
  /** Return a message per invalid field. Runs on submit, then again as fields are fixed. */
  validate?: (values: TValues) => SideDrawerFormValidateResult<TValues>;
  /** Save. Return or resolve { errors } / { error } to show server-side problems, or throw. */
  onSubmit: (values: TValues) => SideDrawerFormSubmitResult<TValues> | Promise<SideDrawerFormSubmitResult<TValues>>;
  /** After a successful save (before the drawer closes / returns to the view). */
  onSuccess?: (values: TValues) => void;
  /** After Cancel (once any discard question is answered). */
  onCancel?: () => void;
  /** Close the drawer after a successful save (or Cancel). Inside SideDrawerDetail it returns to the view instead. Default true. */
  closeOnFinish?: boolean;
  /** Toast title after a successful save (needs a <ToastProvider> above); announced when confirmed inline. */
  successToast?: ReactNode;
  /**
   * How a successful save is confirmed. "auto": a toast when the drawer closes, "✓ Saved" next to
   * the title when it stays open (inside SideDrawerDetail, or closeOnFinish={false}).
   */
  successFeedback?: "auto" | "toast" | "inline";
  /**
   * Confirm a successful save with a seal: the form dims, a check in a success-lit disc folds in and the panel
   * closes (or returns to the view) about a second later, with the `successToast`. With reduced motion the seal
   * only fades in. Default false.
   */
  successSeal?: boolean;
  /** Ask before throwing away changes. Default true. */
  confirmDiscard?: boolean;
  /** Shorthand for labels.save. */
  submitLabel?: ReactNode;
  /** Shorthand for labels.cancel. */
  cancelLabel?: ReactNode;
  /** The fields. Receives the form API. */
  children: (form: SideDrawerFormApi<TValues>) => ReactNode;
  /** Extra footer content on the inline start (replaces the "Unsaved changes" hint). */
  footerStart?: ReactNode;
  /** Adds extra classes to the scrolling body. */
  bodyClassName?: string;
  /** Any UI string (i18n). */
  labels?: Partial<SideDrawerFormLabels>;
};

/* ---------- Helpers ---------- */

function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object") {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every((key) => sameValue(left[key], right[key]));
  }
  return false;
}

/** Drops empty messages. */
function clean<TValues>(errors: SideDrawerFormValidateResult<TValues>): Partial<Record<Keys<TValues>, string>> {
  const out: Partial<Record<Keys<TValues>, string>> = {};
  if (!errors) return out;
  for (const [key, message] of Object.entries(errors) as [Keys<TValues>, unknown][]) {
    if (typeof message === "string" && message) out[key] = message;
  }
  return out;
}

type ToastFn = (title: ReactNode) => void;

/** Only mounted when `successToast` is set, so the form works without a ToastProvider otherwise. */
function ToastBridge({ toastRef }: { toastRef: RefObject<ToastFn | null> }) {
  const toast = useToast();
  useEffect(() => {
    toastRef.current = (title) => toast.success(title);
    return () => {
      toastRef.current = null;
    };
  }, [toast, toastRef]);
  return null;
}

/* ---------- Component ---------- */

/**
 * SideDrawerForm: the "edit in a side panel" pattern, wired up. Put it inside `SideDrawerContent` after a `SideDrawerHeader`. `children` is a function that receives the form API
 * (`values`, `errors`, `dirty`, `submitting`, `setValue`, `field(name)`, `error(name)`, `reset`); `form.field("name")` returns the `name`, `value`, `onChange` and `error` props for an `Input` or `Textarea`.
 *
 * What it does for you:
 * - Body + sticky footer with Cancel and Save. Save shows a spinner (and ignores presses) while an async `onSubmit` runs; the fields are locked (a disabled fieldset) so nothing typed during the save can get lost,
 *   and the drawer can't be closed half-way through a save.
 * - Dirty tracking: the footer says "Unsaved changes", and closing by ×, Escape, the scrim, a swipe or Cancel asks "Discard unsaved changes?" (Keep editing / Discard). `confirmDiscard={false}` turns it off.
 * - Validation on submit (`validate`): inline errors, focus moves to the first invalid field and an error summary (`role="alert"`, with links to each field) is announced. Errors clear as fields are fixed; new ones wait for the
 *   next submit (no scolding while typing).
 * - Server errors: return `{ errors: { email: "Already taken" } }` or `{ error: "..." }` from `onSubmit`, or throw. They show the same way.
 * - Cmd+Enter / Ctrl+Enter submits from any field.
 * - Success: the drawer closes with a toast (`successToast`, needs `<ToastProvider>`). Inside `SideDrawerDetail` it returns to the detail view instead, and confirms in place ("Saved" next to the title, `successToast`
 *   announced), because a corner toast would cover the panel's header. `successFeedback` overrides the choice. Saving with no changes just closes.
 * - `successSeal`: Save folds into a seal (a check in a success-lit disc over the dimmed form), then the panel closes with the toast. Reduced motion: the seal only fades in.
 * - `labels` translates every string; `footerStart` replaces the "Unsaved changes" hint.
 *
 * `initialValues` is read once: give the form a `key` to start over for another record.
 *
 * Keyboard: standard form keys; Cmd/Ctrl+Enter saves; Escape asks the discard question when dirty. Accessibility: a `<form noValidate>` with `aria-busy` while saving; errors are linked to their fields, summarised in a `role="alert"` region, and
 * focus moves to the first invalid field. Glass and motion: flat form inside the panel's glass; the fields rise in sequence when the panel opens (transform and opacity, none with reduced motion) and the Save spinner and the optional seal are the only other motion.
 *
 * @example
 * ```tsx
 * import { Input, SideDrawerForm } from "@sheenui/theme";
 *
 * const user = { name: "Ada Lovelace" };
 * const save = (values: { name: string }) => fetch("/api/profile", { method: "PUT", body: JSON.stringify(values) });
 *
 * export function Example() {
 *   return (
 *     <SideDrawerForm
 *       initialValues={{ name: user.name }}
 *       validate={(v) => ({ name: v.name.trim() ? undefined : "Enter a name" })}
 *       onSubmit={async (v) => { await save(v); }}
 *       successToast="Profile saved"
 *     >
 *       {(form) => <Input label="Name" {...form.field("name")} />}
 *     </SideDrawerForm>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerForm<TValues extends object>({
  initialValues,
  validate,
  onSubmit,
  onSuccess,
  onCancel,
  closeOnFinish = true,
  successToast,
  successFeedback = "auto",
  successSeal = false,
  confirmDiscard = true,
  submitLabel,
  cancelLabel,
  children,
  footerStart,
  bodyClassName,
  labels: labelsProp,
  className,
  onKeyDown,
  ...props
}: SideDrawerFormProps<TValues>) {
  const labels = { ...defaultSideDrawerFormLabels, ...labelsProp };
  const drawer = useSideDrawer();
  const edit = useContext(SideDrawerEditContext);
  const [baseline, setBaseline] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  /** Fields that failed the last submit's validation: only their errors show (and clear as they're fixed). */
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set());
  const [serverErrors, setServerErrors] = useState<Partial<Record<Keys<TValues>, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  /** Counts failed submits: re-mounts (and so re-announces) the error summary each time. */
  const [failures, setFailures] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  /** The success seal is showing (until the form finishes). */
  const [sealed, setSealed] = useState(false);
  const [confirm, confirmDialog] = useConfirm();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<ToastFn | null>(null);
  const summaryId = useId();

  // The panel's state light: saving is "working", a failed save "error", the seal "success". Written on the panel
  // (like the edge publisher does), where the panel's own layer reads it; cleared when the form goes away.
  const lightState = sealed ? "success" : submitting ? "working" : formError ? "error" : null;
  useLayoutEffect(() => {
    const popup = formRef.current?.closest<HTMLElement>("[data-slot='side-drawer']");
    if (!popup || !lightState) return;
    popup.dataset.state = lightState;
    return () => {
      delete popup.dataset.state;
    };
  }, [lightState]);

  const dirty = useMemo(() => !sameValue(values, baseline), [values, baseline]);

  const validation = useMemo(
    () => (checked.size > 0 && validate ? clean(validate(values)) : {}),
    [checked, validate, values],
  );
  const errors = useMemo(() => {
    const shown: Partial<Record<Keys<TValues>, string>> = { ...serverErrors };
    for (const [key, message] of Object.entries(validation) as [Keys<TValues>, string][]) {
      if (checked.has(key)) shown[key] = message;
    }
    return shown;
  }, [serverErrors, validation, checked]);
  const errorEntries = Object.entries(errors) as [Keys<TValues>, string][];

  // Read by the close guard, which runs outside render.
  const liveRef = useLatest({ dirty, submitting, confirmDiscard });
  // The values right now: a save compares them with what it sent.
  const latestValuesRef = useLatest(values);

  /* The fields are locked while saving. A save started from a field (⌘↵) parks focus on the busy
     Save button meanwhile (a locked field would drop it on the page), and if the form stays open
     afterwards, the field gets it back. */
  const fieldsRef = useRef<HTMLFieldSetElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (submitting) return;
    const target = restoreFocus.current;
    restoreFocus.current = null;
    if (!target?.isConnected) return;
    const active = document.activeElement;
    // Only from where the lock put it, never from somewhere the person moved to.
    if (
      active === submitRef.current ||
      active === document.body ||
      active === formRef.current?.closest("[data-slot='side-drawer']")
    ) {
      target.focus({ preventScroll: true });
    }
  }, [submitting]);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function askDiscard() {
    return confirm({
      tone: "danger",
      title: labels.discardTitle,
      description: labels.discardDescription,
      confirmLabel: labels.discard,
      cancelLabel: labels.keepEditing,
    });
  }

  // Every way of closing the drawer (×, Escape, scrim, swipe) goes through this.
  useSideDrawerCloseGuard(() => {
    if (liveRef.current.submitting) return false;
    if (!liveRef.current.dirty || !liveRef.current.confirmDiscard) return true;
    return askDiscard();
  });

  /* Opened inside an already-open drawer (View → Edit): start in the first field. On touch screens
     focus the form itself instead, so the on-screen keyboard doesn't jump up uninvited. Done in the
     commit (layout effect): the Edit button that had focus is gone, and focusing now keeps Base UI
     from parking focus on the panel instead. */
  const openedAsEdit = useRef(edit);
  useLayoutEffect(() => {
    if (!openedAsEdit.current) return;
    const form = formRef.current;
    if (
      !form ||
      (document.activeElement !== document.body &&
        !form.closest("[data-slot='side-drawer']")?.contains(document.activeElement))
    )
      return;
    const target = lastInteractionWasTouch() ? form : (firstField(form) ?? form);
    target.focus({ preventScroll: true });
    // Mount only.
  }, []);

  /* After a failed submit: focus the first invalid field (or the summary for a form-level error). */
  useEffect(() => {
    if (failures === 0) return;
    const frame = requestAnimationFrame(() => {
      const form = formRef.current;
      const invalid = form?.querySelector<HTMLElement>("[aria-invalid='true']");
      (invalid ?? summaryRef.current)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [failures]);

  const setValue = useCallback(<K extends keyof TValues>(name: K, value: TValues[K]) => {
    setValues((previous) => (Object.is(previous[name], value) ? previous : { ...previous, [name]: value }));
    // A server error is about the value that was sent: editing the field clears it.
    setServerErrors((previous) => {
      if (!(name in previous)) return previous;
      return Object.fromEntries(Object.entries(previous).filter(([key]) => key !== name)) as Partial<
        Record<Keys<TValues>, string>
      >;
    });
  }, []);

  const finish = useCallback(
    (reason: "cancel" | "saved") => {
      if (edit) edit.exit(reason);
      else if (closeOnFinish) void drawer?.requestClose({ force: true });
    },
    [edit, closeOnFinish, drawer],
  );

  async function handleCancel() {
    if (submitting) return;
    if (dirty && confirmDiscard && !(await askDiscard())) return;
    if (!mounted.current) return;
    onCancel?.();
    finish("cancel");
  }

  function fail(next: {
    checked?: ReadonlySet<string>;
    server?: Partial<Record<Keys<TValues>, string>>;
    message?: string | null;
  }) {
    if (next.checked) setChecked(next.checked);
    setServerErrors(next.server ?? {});
    setFormError(next.message ?? null);
    setFailures((n) => n + 1);
  }

  const isMounted = () => mounted.current;

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found = validate ? clean(validate(values)) : {};
    const invalidKeys = Object.keys(found);
    if (invalidKeys.length > 0) {
      fail({ checked: new Set(invalidKeys) });
      return;
    }
    setChecked(new Set());

    // Nothing changed: nothing to send.
    if (!dirty) {
      setServerErrors({});
      setFormError(null);
      finish("saved");
      return;
    }

    setServerErrors({});
    setFormError(null);
    const submitted = values;
    const active = document.activeElement;
    restoreFocus.current = active instanceof HTMLElement && fieldsRef.current?.contains(active) ? active : null;
    if (restoreFocus.current) submitRef.current?.focus({ preventScroll: true });
    setSubmitting(true);
    let result: SideDrawerFormSubmitResult<TValues>;
    try {
      result = await onSubmit(submitted);
    } catch (caught) {
      if (!mounted.current) return;
      setSubmitting(false);
      fail({ message: caught instanceof Error && caught.message ? caught.message : labels.saveFailed });
      return;
    }
    if (!mounted.current) return;
    setSubmitting(false);

    const server = clean(result?.errors);
    if (Object.keys(server).length > 0 || result?.error) {
      fail({ server, message: result?.error ?? null });
      return;
    }

    // What was sent is saved. Anything changed since (a custom control outside the locked
    // fieldset) stays as unsaved changes, and the form stays open for it.
    setBaseline(submitted);
    const changedSince = !sameValue(latestValuesRef.current, submitted);
    liveRef.current = { ...liveRef.current, dirty: changedSince };
    const staysOpen = changedSince || (!edit && !closeOnFinish);
    const inline = successFeedback === "inline" || (successFeedback === "auto" && (Boolean(edit) || staysOpen));
    // With a seal the toast comes as the panel closes, not before.
    const sealing = successSeal && !changedSince && !staysOpen;
    const toastNow = toastRef.current;
    if (inline && drawer) drawer.notify(labels.saved, { announce: successToast ?? labels.saved });
    else if (successToast && !sealing) toastRef.current?.(successToast);
    onSuccess?.(submitted);
    if (changedSince) return;
    if (sealing) {
      setSealed(true);
      await new Promise((resolve) =>
        window.setTimeout(resolve, motionIsReduced() ? SEAL_HOLD_REDUCED_MS : SEAL_HOLD_MS),
      );
      // Closed meanwhile (Escape): the toast still says it was saved.
      if (successToast && !inline) toastNow?.(successToast);
      // (read through a function: TypeScript narrowed the ref before the await)
      if (!isMounted()) return;
      setSealed(false);
    }
    restoreFocus.current = staysOpen ? restoreFocus.current : null;
    finish("saved");
  }

  /* While saving, controls a disabled fieldset can't reach (e.g. a role="switch" span) are kept still too. */
  function blockWhileSaving(event: {
    key?: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    preventDefault: () => void;
    stopPropagation: () => void;
  }) {
    if (!submitting) return;
    if (event.key !== undefined && event.key !== " " && event.key !== "Enter") return;
    if (event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    // ⌘↵ / Ctrl+Enter saves from anywhere in the form (also from a textarea).
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function focusField(name: string) {
    const form = formRef.current;
    if (!form) return;
    // A Select's hidden input hands focus to its trigger, so the named element always works.
    const named = form.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`);
    (named ?? form.querySelector<HTMLElement>("[aria-invalid='true']"))?.focus();
  }

  const api: SideDrawerFormApi<TValues> = {
    values,
    errors,
    dirty,
    submitting,
    setValue,
    field: (name) => ({
      name,
      value: String(values[name] ?? ""),
      onChange: (event) => setValue(name, event.target.value as TValues[typeof name]),
      error: errors[name],
    }),
    error: (name) => errors[name],
    reset: (next) => {
      const start = next ?? initialValues;
      setBaseline(start);
      setValues(start);
      setChecked(new Set());
      setServerErrors({});
      setFormError(null);
    },
  };

  const showSummary = failures > 0 && (errorEntries.length > 0 || formError);

  const hint =
    footerStart ??
    (dirty ? (
      <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-sheen-fg-muted">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-sheen-warning forced-colors:bg-[CanvasText]" />
        <span className="truncate">{labels.unsaved}</span>
        <span className="hidden items-center gap-1.5 font-normal text-sheen-fg-subtle pointer-fine:@md/side-drawer:inline-flex">
          <span aria-hidden>·</span>
          <KbdShortcut keys="mod+enter" />
          {labels.shortcut}
        </span>
      </span>
    ) : null);

  return (
    <>
      {successToast ? <ToastBridge toastRef={toastRef} /> : null}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Cmd/Ctrl+Enter submits from any field */}
      <form
        ref={formRef}
        noValidate
        tabIndex={-1}
        data-side-drawer-form=""
        data-dirty={dirty || undefined}
        data-sealed={sealed || undefined}
        aria-busy={submitting || undefined}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex min-h-0 flex-1 flex-col outline-none",
          // The content steps back behind the seal's scrim layer (never an opacity fade on the content: glass inputs would flatten).
          className,
        )}
        {...props}
      >
        <SideDrawerBody className={bodyClassName}>
          <div className="flex flex-col gap-5">
            {showSummary && (
              <div
                key={failures}
                ref={summaryRef}
                role="alert"
                tabIndex={-1}
                aria-labelledby={`${summaryId}-title`}
                data-slot="side-drawer-form-errors"
                className={cn(
                  "flex gap-3 rounded-sheen-md border border-sheen-danger-text/25 px-3.5 py-3 text-sm text-sheen-danger-text outline-none",
                  "bg-sheen-surface/85 [background-image:linear-gradient(var(--sheen-danger-soft),var(--sheen-danger-soft))]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                  "forced-colors:border-[CanvasText]",
                )}
              >
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <p id={`${summaryId}-title`} className="font-semibold">
                    {errorEntries.length > 0 ? labels.errorSummary(errorEntries.length) : formError}
                  </p>
                  {errorEntries.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {errorEntries.map(([name, message]) => (
                        <li key={name}>
                          <button
                            type="button"
                            onClick={() => focusField(name)}
                            className="text-start underline decoration-current/40 underline-offset-2 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
                          >
                            {message}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errorEntries.length > 0 && formError && <p>{formError}</p>}
                </div>
              </div>
            )}
            <fieldset
              ref={fieldsRef}
              disabled={submitting || sealed}
              data-slot="side-drawer-form-fields"
              onKeyDownCapture={blockWhileSaving}
              onClickCapture={blockWhileSaving}
              className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0 disabled:cursor-progress [&:disabled_*]:pointer-events-none"
            >
              {children(api)}
            </fieldset>
          </div>
        </SideDrawerBody>
        <SideDrawerFooter start={hint}>
          <Button variant="ghost" onClick={handleCancel} disabled={submitting || sealed}>
            {cancelLabel ?? labels.cancel}
          </Button>
          <Button ref={submitRef} type="submit" loading={submitting} aria-keyshortcuts="Meta+Enter Control+Enter">
            {submitting ? labels.saving : (submitLabel ?? labels.save)}
          </Button>
        </SideDrawerFooter>
        {/* Announces the pending state (aria-busy alone is not read out). */}
        <span role="status" className="sr-only">
          {submitting ? labels.saving : sealed ? labels.saved : ""}
        </span>
        {sealed && <SuccessSeal label={labels.saved} />}
      </form>
      {confirmDialog}
    </>
  );
}
