"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";

import { createToastGate, type ToastGate } from "./toast-gate";

const ToastGateContext = createContext<ToastGate | null>(null);

/**
 * Glass toasts that stack, expand on hover and can be swiped away. This is the provider: it owns the
 * queue of toasts. Put it once near the root of your app, with a single `Toaster` inside it, then call
 * `useToast()` anywhere below to show messages. Use toasts for short, non-blocking feedback ("Saved");
 * use `Dialog` or an inline message when the person must act.
 *
 * Keyboard: F6 moves focus to the toast viewport (Base UI; the region's name and a hidden line on every toast
 * with an action say so once, in the live region); the stack expands while it is hovered or holds focus; Tab reaches each toast's Dismiss button, Enter or Space closes it, Escape also dismisses the focused toast.
 * Accessibility: toasts are announced politely through a live region (errors are announced too, never
 * stealing focus); they pause their timer while hovered or focused, so there is time to read; the Dismiss button
 * has a 44px hit area on touch screens.
 * Glass and motion: each toast is a `glass-2` surface (the viewport is fixed and clear of notches and home
 * indicators). Toasts slide in from their edge (from above at the top, from below at the bottom) and leave the
 * same way; exits are shorter, ease-in and never overshoot. The newest toast sits at the edge and older ones
 * peek out behind it, towards the middle of the screen; hovering or focusing the stack fans it out the same
 * way. With reduced motion (OS or in-app toggle) toasts only fade and the stack re-arranges without sliding.
 * Swiping still follows the finger: that is direct manipulation, not animation.
 *
 * @example
 * ```tsx
 * import { ToastProvider, Toaster, useToast } from "@sheenui/theme";
 *
 * function SaveButton() {
 *   const toast = useToast();
 *   return <button onClick={() => toast.success("Saved", "Your changes are live.")}>Save</button>;
 * }
 *
 * export function Example() {
 *   return (
 *     <ToastProvider>
 *       <SaveButton />
 *       <Toaster position="bottom-center" />
 *     </ToastProvider>
 *   );
 * }
 * ```
 *
 * @see /components/toast
 */
export function ToastProvider({
  viewportReady = true,
  onViewportNeeded,
  children,
  ...props
}: ComponentProps<typeof BaseToast.Provider> & {
  /**
   * Set to `false` while the `Toaster` is lazy-loaded: toasts raised meanwhile are held (their timer has not started)
   * and shown, in order, once this turns `true`, which is when the `Toaster` has mounted. Default `true`.
   * @default true
   */
  viewportReady?: boolean;
  /**
   * Called when a toast is held because the viewport is not ready, so the app can start loading the `Toaster`. Default
   * `undefined` (nothing is called).
   * @default undefined
   */
  onViewportNeeded?: () => void;
}) {
  const [gate] = useState(() => createToastGate(viewportReady));
  useEffect(() => {
    gate.sync(viewportReady, onViewportNeeded);
  }, [gate, viewportReady, onViewportNeeded]);
  return (
    <BaseToast.Provider {...props}>
      <ToastGateContext value={gate}>{children}</ToastGateContext>
    </BaseToast.Provider>
  );
}

/** Which icon and colour a toast uses. */
export type ToastType = "info" | "success" | "warning" | "danger" | "loading";

/** Corner or edge-centre of the screen where the stack sits. */
export type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
/** What the `position` prop accepts: a physical {@link ToastPosition}, or `top-start` / `top-end` / `bottom-start` / `bottom-end`, which resolve against the text direction (`start` is the left corner in `ltr`, the right corner in `rtl`). */
export type ToastPositionProp = ToastPosition | "top-start" | "top-end" | "bottom-start" | "bottom-end";

/** Options of one toast: how long it stays, whether it has an action, where it sits. */
export type ToastOptions = {
  /** Use this id (to update or dismiss it later). A generated one is used by default. */
  id?: string;
  /**
   * How long it stays, in ms. `0` (or `persistent`) keeps it until it is dismissed. Default 5000, except a toast with an
   * `action`, which stays until dismissed (WCAG 2.2.1); an explicit duration on such a toast is raised to at least 20 000.
   */
  duration?: number;
  /** Keep it until the person (or your code) dismisses it. Same as `duration: 0`. */
  persistent?: boolean;
  /** A button on the toast, such as "Undo". */
  action?: { label: string; onClick: () => void };
  /** Show this toast in the `Toaster` with this position (see `ToasterProps.onlyPositioned`). Default: the main toaster. */
  position?: ToastPositionProp;
  /** "high" announces it assertively (use it for errors that need attention). Default "low" (polite). */
  priority?: "low" | "high";
  /** Called when the toast closes, however it closes. */
  onClose?: () => void;
};

/** What `toast.update(id, ...)` can change on a toast that is already showing. */
export type ToastUpdate = ToastOptions & { type?: ToastType; title?: ReactNode; description?: ReactNode };

/** The three states of `toast.promise(promise, messages)`: each a message, or a function of the result. */
export type ToastPromiseMessages<T> = {
  /** Shown while the promise is pending. */
  loading: ReactNode;
  /** Shown when it resolves: a message or `(result) => message`. */
  success: ReactNode | ((result: T) => ReactNode);
  /** Shown when it rejects: a message or `(error) => message`. */
  error: ReactNode | ((error: unknown) => ReactNode);
};

/**
 * `const toast = useToast()` returns the functions that show toasts. `toast.info`, `toast.success`, `toast.warning`,
 * `toast.error` and `toast.loading` each take `(title, description?, options?)` and return the toast's id;
 * `toast.promise(promise, { loading, success, error })` shows one toast that changes with the promise;
 * `toast.update(id, changes)` edits a showing toast; `toast.dismiss(id?)` closes one toast or all.
 * Options: `duration` (ms, `0` or `persistent` for a toast that stays), `action` (`{ label, onClick }`, such as Undo),
 * `position` (a per-toast spot, see `Toaster`'s `onlyPositioned`), `priority`, `id` and `onClose`.
 * Call it in any component below `ToastProvider`. Titles and descriptions are any React node.
 *
 * Accessibility: the title and description are announced by a polite live region. Keep them short and do
 * not put the only copy of important information in a toast. Glass and motion: see `ToastProvider`.
 *
 * @example
 * ```tsx
 * import { useToast } from "@sheenui/theme";
 *
 * export function Example() {
 *   const toast = useToast();
 *
 *   // Call the toast from an event handler (or an effect), never while rendering.
 *   async function save() {
 *     const id = toast.loading("Saving…");
 *     try {
 *       await fetch("/api/save", { method: "POST" });
 *       toast.update(id, { type: "success", title: "Saved", duration: 4000, action: { label: "Undo", onClick: () => undefined } });
 *     } catch {
 *       toast.update(id, { type: "danger", title: "Upload failed", description: "Check your connection and try again." });
 *     }
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={() => void save()}>Save</button>
 *       <button onClick={() => void toast.promise(fetch("/api/sync"), { loading: "Syncing…", success: "Synced", error: "Could not sync" })}>Sync</button>
 *       <button onClick={() => toast.dismiss()}>Clear all</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /components/toast
 */
export function useToast() {
  const { add: baseAdd, close: baseClose, update: baseUpdate, promise: basePromise } = BaseToast.useToastManager();
  const gate = useContext(ToastGateContext);
  // The functions the manager hands out are stable, so the API object is built once and keeps its identity:
  // `toast` is safe in effect dependency lists and does not re-render memoised children.
  return useMemo(() => {
    // Before the viewport is mounted a call is held (its timer must not run unseen) and the app is asked to load it.
    const held = (run: () => void) => {
      if (!gate || gate.isReady()) return false;
      gate.hold(run);
      gate.request();
      return true;
    };
    const addToast = (options: Parameters<typeof baseAdd>[0]) => {
      if (!gate || gate.isReady()) return baseAdd(options);
      // `add` returns its id at once, so a held toast gets its id up front.
      const id = options.id ?? gate.nextId();
      held(() => void baseAdd({ ...options, id }));
      return id;
    };
    const close = (id?: string) => {
      if (!held(() => baseClose(id))) baseClose(id);
    };
    const updateToast = (id: string, changes: Parameters<typeof baseUpdate>[1]) => {
      if (!held(() => baseUpdate(id, changes))) baseUpdate(id, changes);
    };
    const promiseToast = <T,>(promise: Promise<T>, options: Parameters<typeof basePromise<T>>[1]) => {
      if (!held(() => void basePromise(promise, options).catch(() => undefined))) return basePromise(promise, options);
      return promise;
    };
    const fields = (options: ToastOptions = {}) => ({
      ...(options.id !== undefined && { id: options.id }),
      // WCAG 2.2.1: a toast with an action (Undo) must not vanish before the person can reach it. It stays until
      // dismissed unless a duration is given, and a given one is never shorter than 20 s (timers also pause on hover/focus).
      ...(options.persistent === true
        ? { timeout: 0 }
        : options.duration !== undefined
          ? {
              timeout:
                options.duration === 0 || !options.action ? options.duration : Math.max(options.duration, 20_000),
            }
          : options.action
            ? { timeout: 0 }
            : {}),
      ...(options.priority !== undefined && { priority: options.priority }),
      ...(options.onClose !== undefined && { onClose: options.onClose }),
      ...(options.action && { actionProps: { children: options.action.label, onClick: options.action.onClick } }),
      ...(options.position !== undefined && { data: { position: options.position } }),
    });
    const add = (type: ToastType) => (title: ReactNode, description?: ReactNode, options?: ToastOptions) =>
      addToast({ title, description, type, ...(type === "loading" ? { timeout: 0 } : {}), ...fields(options) });
    // How long a settled promise toast stays: nothing for `persistent`, else the duration (default 5000 ms).
    const settledTimeout = (options?: ToastOptions) => (options?.persistent === true ? 0 : (options?.duration ?? 5000));
    return {
      info: add("info"),
      success: add("success"),
      warning: add("warning"),
      /** A danger toast ("error" is the method name people reach for; the type is "danger"). */
      error: add("danger"),
      /** A toast with a spinner that stays until you `update` or `dismiss` it. */
      loading: add("loading"),
      /** One toast that shows `loading`, then `success` or `error` when the promise settles. Returns the original promise (it still rejects when yours does, so `await` or `.catch` it). */
      promise: <T,>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions) =>
        promiseToast(promise, {
          loading: { title: messages.loading, type: "loading", ...fields(options), timeout: 0 },
          success: (result: T) => ({
            title:
              typeof messages.success === "function"
                ? (messages.success as (r: T) => ReactNode)(result)
                : messages.success,
            type: "success",
            timeout: settledTimeout(options),
          }),
          error: (error: unknown) => ({
            title:
              typeof messages.error === "function"
                ? (messages.error as (e: unknown) => ReactNode)(error)
                : messages.error,
            type: "danger",
            timeout: settledTimeout(options),
          }),
        }),
      /** Change a toast that is showing: its type, title, description, duration or action. */
      update: (id: string, changes: ToastUpdate) => {
        const { type, title, description } = changes;
        updateToast(id, {
          ...(type !== undefined && { type }),
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...fields(changes),
        });
      },
      /** Close one toast by id, or every toast when called without one. */
      dismiss: (id?: string) => close(id),
    };
  }, [gate, baseAdd, baseClose, baseUpdate, basePromise]);
}

/** Props of `Toaster`; each option is documented on its field. */
export type ToasterProps = {
  /**
   * Where the stack sits. Top positions slide in from above and stack downwards; bottom
   * positions slide up and stack upwards. On phones every position spans the screen width
   * (minus 16px gutters), so only top / bottom matters there. Default "top-right". `"top-left"` and the other `left` / `right`
   * names are physical; `"top-start"`, `"top-end"`, `"bottom-start"` and `"bottom-end"` follow the text direction
   * (`start` is the left corner in `ltr`, the right corner in `rtl`).
   */
  position?: ToastPositionProp;
  /** Extra classes for the viewport (the fixed element that holds the stack). */
  className?: string;
  /** Render the stack inside this element instead of the page: the viewport turns `absolute` and sits in the corner of the container (give it `position: relative`), so a demo or a panel can host its own toasts next to what triggers them. Default: the page (`document.body`, fixed to the screen). */
  container?: HTMLElement | null;
  /** Show only toasts that were given this `position` option (a second `Toaster` for per-toast positions). Default false: show toasts without a position. */
  onlyPositioned?: boolean;
  /** Visible-to-assistive-tech text of the toasts. Translate it here; `dismiss` is the accessible name of each toast's × button. */
  labels?: Partial<ToasterLabels>;
};

/** Every user-facing string of the toasts that is not the message itself. */
export type ToasterLabels = {
  /** Accessible name of the × button on each toast. */
  dismiss: string;
  /** Spoken name of the spinner on a "loading" toast. */
  loading: string;
  /** Accessible name of the notifications region. Give each stack on a page its own name. */
  region: string;
  /** Hidden text added to a toast that has an action, so the live region tells the keyboard route once: F6, then Tab. */
  actionHint: (action: string) => string;
};

/** English defaults of `ToasterLabels`. */
export const defaultToasterLabels: ToasterLabels = {
  dismiss: "Dismiss",
  loading: "Loading",
  region: "Toast notifications",
  actionHint: (action) => `Press F6, then Tab to reach ${action}.`,
};

export { Toaster } from "./toaster";

/** Props of {@link ToastProvider}. Glass toasts that stack, expand on hover and can be swiped away. */
export type ToastProviderProps = ComponentProps<typeof ToastProvider>;
