"use client";

import { createContext, useContext, useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { motion } from "motion/react";

import { cn, classNameWith } from "../../../lib/cn";
import { dialogMotion } from "../../../lib/popup-motion";
import { useSheenReducedMotion } from "../../../hooks/use-preferences";
import { duration, ease, spring } from "../../../motion/tokens";
import { Button, type ButtonProps } from "../../button/button";
import { useMergedRef } from "../../../lib/form";

/**
 * Alert dialog: asks for confirmation before something that matters (usually destructive).
 * Unlike Dialog it does not close on an outside press: the person has to choose. An outside
 * press gives the panel a small "nudge" instead, so the click is not silently ignored.
 *
 * Two ways to use it:
 *   - ConfirmDialog: one component with icon, title, description, Cancel + action, a loading
 *     state while an async onConfirm runs, inline errors, and optional type-to-confirm.
 *   - useConfirm(): `if (await confirm({ title: "Delete?" })) …` from any event handler.
 *   - Or compose the parts (AlertDialog, AlertDialogContent, AlertDialogHeader, …) yourself.
 *
 * Focus: Cancel is focused first for destructive tones (the safe choice), the action for "info";
 * the type-to-confirm field when there is one. Focus is trapped and returns to the trigger.
 * When confirming removes the trigger (deleting a row), ConfirmDialog / useConfirm move focus to
 * the same spot instead of dropping it on <body>: the matching control in the row that takes its
 * place (or the row before), else the first control around the list. `finalFocus` overrides it.
 *
 * Motion: the glass popup itself fades and springs up from 95% (never a wrapper); the tone
 * icon pops in with a ring. Exit is shorter, eases in and never overshoots. Reduced motion: fades only.
 *
 * Built on Base UI AlertDialog: https://base-ui.com/react/components/alert-dialog
 */

export type AlertDialogTone = "danger" | "warning" | "info";

/**
 * Root of an alert dialog: holds the open state and wires the trigger, popup and buttons together.
 * Base UI's `AlertDialog.Root` as is: `open` / `defaultOpen` / `onOpenChange` for state, `handle`
 * to share one dialog between triggers rendered elsewhere. Use {@link ConfirmDialog} when you
 * want the whole thing prebuilt.
 *
 * Keyboard: Escape closes the dialog; Tab cycles inside it; focus returns to the trigger on close.
 * Accessibility: Renders `role="alertdialog"` with the title as its name and the description as its description; focus is trapped and the page behind is inert.
 *
 * @example
 * ```tsx
 * import {
 *   AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
 *   AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
 * } from "@sheenui/theme";
 *
 * export function DeleteProject() {
 *   return (
 *     <AlertDialog>
 *       <AlertDialogTrigger>Delete project</AlertDialogTrigger>
 *       <AlertDialogContent tone="danger">
 *         <AlertDialogHeader>
 *           <AlertDialogTitle>Delete this project?</AlertDialogTitle>
 *           <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
 *         </AlertDialogHeader>
 *         <AlertDialogFooter>
 *           <AlertDialogCancel>Keep it</AlertDialogCancel>
 *           <AlertDialogAction>Delete</AlertDialogAction>
 *         </AlertDialogFooter>
 *       </AlertDialogContent>
 *     </AlertDialog>
 *   );
 * }
 * ```
 *
 * @see /overlays/alert-dialog
 */
export const AlertDialog = BaseAlertDialog.Root;
/**
 * The button that opens an {@link AlertDialog} (Base UI `AlertDialog.Trigger`). Renders a native
 * `<button>`; use the `render` prop to style it as a SheenUI `Button`.
 *
 * Keyboard: Enter or Space opens the dialog.
 * Accessibility: Exposes `aria-haspopup="dialog"` and the expanded state.
 *
 * @example
 * ```tsx
 * import { AlertDialog, AlertDialogContent, AlertDialogTrigger, Button } from "@sheenui/theme";
 *
 * export const Open = () => (
 *   <AlertDialog>
 *     <AlertDialogTrigger render={<Button variant="danger" />}>Delete</AlertDialogTrigger>
 *     <AlertDialogContent>Are you sure?</AlertDialogContent>
 *   </AlertDialog>
 * );
 * ```
 *
 * @see /overlays/alert-dialog
 */
export const AlertDialogTrigger = BaseAlertDialog.Trigger;
/**
 * Any element inside the dialog that closes it when pressed (Base UI `AlertDialog.Close`). Use it
 * for a custom close control; {@link AlertDialogCancel} and {@link AlertDialogAction} already close.
 *
 * Keyboard: Enter or Space closes the dialog.
 * Accessibility: A native button; give it a visible text label.
 *
 * @example
 * ```tsx
 * import { AlertDialog, AlertDialogClose, AlertDialogContent, AlertDialogTrigger } from "@sheenui/theme";
 *
 * export const Custom = () => (
 *   <AlertDialog>
 *     <AlertDialogTrigger>Open</AlertDialogTrigger>
 *     <AlertDialogContent>
 *       <AlertDialogClose>Got it</AlertDialogClose>
 *     </AlertDialogContent>
 *   </AlertDialog>
 * );
 * ```
 *
 * @see /overlays/alert-dialog
 */
export const AlertDialogClose = BaseAlertDialog.Close;
/** Connects an AlertDialog to triggers rendered elsewhere (e.g. one dialog for every row of a table). */
export const createAlertDialogHandle = BaseAlertDialog.createHandle;

/* ---------- Context: tone + motion helpers shared by the parts ---------- */

/** The tone and icon the dialog content shares with its parts. @internal */
export type ContentContextValue = {
  tone: AlertDialogTone;
  icon: ReactNode | null | undefined;
};

/** Shares the dialog tone and icon with the content parts. @internal */
export const ContentContext = createContext<ContentContextValue>({ tone: "danger", icon: undefined });

/* ---------- Icons ---------- */

/** The default icon of each alert dialog tone. @internal */
export const toneIcons: Record<AlertDialogTone, ReactNode> = {
  // An octagon (a stop sign) for danger and a triangle for warning: the shape differs, not just the colour.
  danger: (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  warning: (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  info: (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

/** The icon surface classes of each alert dialog tone. @internal */
export const toneSurface: Record<AlertDialogTone, string> = {
  danger: "bg-sheen-danger-soft text-sheen-danger-text",
  warning: "bg-sheen-warning-soft text-sheen-warning-text",
  info: "bg-sheen-accent-soft text-sheen-accent",
};

/**
 * The tone icon in a soft tinted disc. It pops in with a single expanding ring (motion only).
 * {@link AlertDialogHeader} renders it for you; use it directly only for a custom header.
 *
 * Props: `tone` ("danger" | "warning" | "info", default: the tone of the surrounding
 * {@link AlertDialogContent}), `children` (replaces the built-in icon), `className`.
 *
 * Accessibility: Decorative: `aria-hidden`, so the shape (octagon, triangle, circle) backs up the colour only visually; the title carries the meaning. Forced colors draw a border.
 * Motion: Pops in with a spring and one expanding ring; both are skipped under reduced motion.
 *
 * @example
 * ```tsx
 * import { AlertDialogIcon } from "@sheenui/theme";
 *
 * export const Disc = () => <AlertDialogIcon tone="warning" />;
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogIcon({
  tone,
  children,
  className,
}: {
  /** Which tone's shape and color to draw; defaults to the surrounding dialog's tone. */
  tone?: AlertDialogTone;
  children?: ReactNode;
  className?: string;
}) {
  const context = useContext(ContentContext);
  const resolvedTone = tone ?? context.tone;
  const reduced = useSheenReducedMotion();
  return (
    <motion.span
      aria-hidden
      data-slot="alert-dialog-icon"
      initial={reduced ? false : { scale: 0.5, rotate: -12 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ ...spring.bouncy, delay: 0.06 }}
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center rounded-sheen-full",
        "forced-colors:border forced-colors:border-[CanvasText]",
        toneSurface[resolvedTone],
        className,
      )}
    >
      {!reduced && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-current"
          initial={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: duration.slower, ease: ease.out, delay: 0.12 }}
        />
      )}
      {children ?? toneIcons[resolvedTone]}
    </motion.span>
  );
}

/* ---------- Content ---------- */

/** Props of {@link AlertDialogContent}. Everything else goes to Base UI's `AlertDialog.Popup` (`initialFocus`, `finalFocus`, `className`, `ref`). */
export type AlertDialogContentProps = ComponentProps<typeof BaseAlertDialog.Popup> & {
  /**
   * Colours the icon and the default action button.
   * @default "danger"
   */
  tone?: AlertDialogTone;
  /** Replace the tone icon, or pass null to hide it. Default: the built-in icon for the tone. */
  icon?: ReactNode | null;
  /**
   * Sets where the dialog is portalled.
   * @default document.body
   */
  container?: ComponentProps<typeof BaseAlertDialog.Portal>["container"];
  /** Sets the class of the dimmed scrim. */
  backdropClassName?: string;
  /** Holds the dialog body: usually {@link AlertDialogHeader} and {@link AlertDialogFooter}. */
  children?: ReactNode;
};

/** Small scale pulse: "you have to choose". Played on the glass popup itself, never a wrapper. */
export function nudge(element: HTMLElement | null) {
  element?.animate([{ transform: "scale(1)" }, { transform: "scale(1.025)" }, { transform: "scale(1)" }], {
    duration: duration.base * 1000,
    easing: `cubic-bezier(${ease.out.join(",")})`,
  });
}

/** Side-to-side shake for a failed action. */
export function shake(element: HTMLElement | null) {
  element?.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: duration.slow * 1000, easing: `cubic-bezier(${ease.out.join(",")})` },
  );
}

/**
 * The dialog panel: portal, dimmed scrim and a glass popup. Unlike Dialog it does not close on an
 * outside press; the panel gives a small nudge instead, so the person has to choose.
 *
 * Keyboard: Escape closes; Tab is trapped inside; the initial focus lands on Cancel (the safe choice) for danger and warning tones.
 * Accessibility: `role="alertdialog"`, labelled by the title and described by the description. The scrim is hidden in forced colors.
 * Glass: One `glass-3` surface (a single backdrop blur); the scrim is a flat tint with no blur.
 * Motion: Fades and springs up from 95%; the exit is shorter with no overshoot. Reduced motion: opacity only.
 *
 * @example
 * ```tsx
 * import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@sheenui/theme";
 *
 * export const Panel = () => (
 *   <AlertDialog>
 *     <AlertDialogTrigger>Open</AlertDialogTrigger>
 *     <AlertDialogContent tone="warning">
 *       <AlertDialogHeader>
 *         <AlertDialogTitle>Heads up</AlertDialogTitle>
 *       </AlertDialogHeader>
 *     </AlertDialogContent>
 *   </AlertDialog>
 * );
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogContent({
  className,
  children,
  tone = "danger",
  icon,
  container,
  backdropClassName,
  ref,
  ...props
}: AlertDialogContentProps) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const mergedPopupRef = useMergedRef(popupRef, ref);
  const reduced = useSheenReducedMotion();
  const context = useMemo(() => ({ tone, icon }), [tone, icon]);

  return (
    <ContentContext value={context}>
      <BaseAlertDialog.Portal container={container}>
        <BaseAlertDialog.Backdrop
          // An alert dialog ignores outside presses; nudge the panel so the press is acknowledged.
          onPointerDown={() => {
            if (!reduced) nudge(popupRef.current);
          }}
          // Keep focus where it was inside the dialog (a press on the scrim would blur it to <body>).
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            "fixed inset-0 z-50 min-h-dvh bg-sheen-scrim",
            "transition-opacity duration-(--sheen-duration-base) ease-sheen-out motion-reduced:duration-(--sheen-duration-fast)",
            "data-starting-style:opacity-0",
            "data-ending-style:opacity-0 data-ending-style:duration-(--sheen-duration-exit) data-ending-style:ease-sheen-exit",
            "supports-[-webkit-touch-callout:none]:absolute forced-colors:hidden",
            backdropClassName,
          )}
        />
        <BaseAlertDialog.Popup
          ref={mergedPopupRef}
          data-slot="alert-dialog-content"
          aria-modal="true"
          data-tone={tone}
          className={classNameWith(className, (extra) =>
            cn(
              "glass-3 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto overscroll-contain rounded-sheen-xl p-6 outline-none",
              dialogMotion,
              "motion-ok:data-nested-dialog-open:scale-[0.96]",
              extra,
            ),
          )}
          {...props}
        >
          {children}
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    </ContentContext>
  );
}

/**
 * Icon + title + description. Centred on phones, icon on the left from `sm` up. Takes the
 * attributes of a `div`; the icon follows the `tone` and `icon` of {@link AlertDialogContent}.
 *
 * Accessibility: Use inside {@link AlertDialogContent}; the icon is decorative and the title and description name the dialog.
 *
 * @example
 * ```tsx
 * import { AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@sheenui/theme";
 *
 * export const Head = () => (
 *   <AlertDialogHeader>
 *     <AlertDialogTitle>Remove member?</AlertDialogTitle>
 *     <AlertDialogDescription>They lose access immediately.</AlertDialogDescription>
 *   </AlertDialogHeader>
 * );
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogHeader({ className, children, ...props }: ComponentProps<"div">) {
  const { icon } = useContext(ContentContext);
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-start", className)}
      {...props}
    >
      {icon === null ? null : <AlertDialogIcon>{icon}</AlertDialogIcon>}
      <div className="flex min-w-0 flex-col gap-1.5 sm:pt-1">{children}</div>
    </div>
  );
}

/**
 * The dialog's name (Base UI `AlertDialog.Title`, an `<h2>`). Always include one: it is what
 * screen readers announce when the dialog opens. Takes the attributes of a heading.
 *
 * Accessibility: Linked to the dialog through `aria-labelledby`.
 *
 * @example
 * ```tsx
 * import { AlertDialogTitle } from "@sheenui/theme";
 *
 * export const Title = () => <AlertDialogTitle>Delete this file?</AlertDialogTitle>;
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof BaseAlertDialog.Title>) {
  return (
    <BaseAlertDialog.Title
      className={classNameWith(className, (extra) =>
        cn("text-lg leading-tight font-semibold tracking-tight text-balance", extra),
      )}
      {...props}
    />
  );
}

/**
 * Supporting text under the title (Base UI `AlertDialog.Description`). Say what will happen and
 * whether it can be undone. Takes the attributes of a paragraph.
 *
 * Accessibility: Linked to the dialog through `aria-describedby`, so it is read after the title.
 *
 * @example
 * ```tsx
 * import { AlertDialogDescription } from "@sheenui/theme";
 *
 * export const Body = () => <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>;
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogDescription({ className, ...props }: ComponentProps<typeof BaseAlertDialog.Description>) {
  return (
    <BaseAlertDialog.Description
      className={classNameWith(className, (extra) => cn("text-sm text-pretty text-sheen-fg-muted", extra))}
      {...props}
    />
  );
}

/**
 * Buttons row: stacked full-width on phones (action on top, in thumb reach), a right-aligned row
 * from `sm`. Takes the attributes of a `div`; put {@link AlertDialogCancel} and
 * {@link AlertDialogAction} inside.
 *
 * Accessibility: On phones the DOM order is Cancel then Action, shown reversed; Tab still reaches Cancel first.
 *
 * @example
 * ```tsx
 * import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@sheenui/theme";
 *
 * export const Buttons = () => (
 *   <AlertDialogFooter>
 *     <AlertDialogCancel>Cancel</AlertDialogCancel>
 *     <AlertDialogAction>Confirm</AlertDialogAction>
 *   </AlertDialogFooter>
 * );
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>*]:w-full sm:[&>*]:w-auto", className)}
      {...props}
    />
  );
}

/**
 * Closes the dialog without doing anything. A glass {@link Button} by default; takes every
 * `ButtonProps` (`variant` defaults to "glass", then `size`, `loading`, `disabled`, ...).
 *
 * Keyboard: Enter or Space closes the dialog. It receives the first focus for danger and warning tones.
 * Accessibility: A native button; the text label is its accessible name.
 *
 * @example
 * ```tsx
 * import { AlertDialogCancel } from "@sheenui/theme";
 *
 * export const Cancel = () => <AlertDialogCancel>Keep it</AlertDialogCancel>;
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogCancel({ variant = "glass", ...props }: ButtonProps) {
  return <BaseAlertDialog.Close render={<Button variant={variant} {...props} />} />;
}

/** Props of {@link AlertDialogAction}. Every `ButtonProps` plus `closeOnClick`. */
export type AlertDialogActionProps = Omit<ButtonProps, "variant"> & {
  /**
   * Close the dialog when pressed. Turn off to run async work first (and set `loading`).
   * @default true
   */
  closeOnClick?: boolean;
  /**
   * Visual style. By default it follows the dialog's tone: a danger button for the danger tone, a primary one for every other tone.
   * @default "danger" for the danger tone, otherwise "primary"
   */
  variant?: ButtonProps["variant"];
};

/**
 * The confirming action. Danger tone gives a danger button, every other tone a primary one
 * (override with `variant`). Takes every `ButtonProps`.
 *
 * Keyboard: Enter or Space runs it; with the default `closeOnClick` it then closes the dialog.
 * Accessibility: A native button; while `loading` it is disabled and the label stays readable.
 *
 * @example
 * ```tsx
 * import { AlertDialogAction } from "@sheenui/theme";
 *
 * export const Confirm = () => <AlertDialogAction onClick={() => console.log("deleted")}>Delete</AlertDialogAction>;
 * ```
 *
 * @see /overlays/alert-dialog
 */
export function AlertDialogAction({ closeOnClick = true, variant, ...props }: AlertDialogActionProps) {
  const { tone } = useContext(ContentContext);
  const button = <Button variant={variant ?? (tone === "danger" ? "danger" : "primary")} {...props} />;
  return closeOnClick ? <BaseAlertDialog.Close render={button} /> : button;
}
