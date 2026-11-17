"use client";

import {
  createContext,
  useContext,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion, stagger, useAnimate, usePresence, type Transition } from "motion/react";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { duration, ease } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

type Place = "trigger" | "content";

type MorphContextValue = {
  id: string;
  open: boolean;
  reduced: boolean;
  actionsRef: RefObject<BaseDialog.Root.Actions | null>;
};

const MorphContext = createContext<MorphContextValue | null>(null);
const PlaceContext = createContext<Place | null>(null);

function useMorph(part: string) {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error(`${part} must be used inside <MorphingDialog>.`);
  return ctx;
}

/** Opening: a spring with a little life (a touch slower than spring.gentle: it travels further). */
const enterMorph: Transition = { type: "spring", visualDuration: 0.55, bounce: 0.14 };
/** Closing: shorter, critically damped (no overshoot). */
const exitMorph: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };

/**
 * A radius token in px. Motion only corrects pixel radii during a morph, so the surfaces carry
 * their radius inline instead of as a class. It is read from the element itself (a theme scoped
 * to a subtree counts) and read again when the root's theme attributes change. Server render
 * and first paint use the fallback; the layout effect corrects it before the browser paints.
 */
function useTokenRadius(
  ref: RefObject<HTMLElement | null>,
  token: string,
  fallback: number,
  radius: number | undefined,
) {
  const [px, setPx] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (radius !== undefined || !el) return;
    const read = () => {
      const previous = el.style.borderRadius;
      el.style.borderRadius = `var(${token}, ${fallback}px)`;
      const value = parseFloat(getComputedStyle(el).borderTopLeftRadius);
      el.style.borderRadius = previous;
      setPx(Number.isFinite(value) ? value : fallback);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-density", "data-radius"],
    });
    return () => observer.disconnect();
  }, [ref, token, fallback, radius]);
  return radius ?? px;
}

const TABBABLE =
  'a[href], area[href], button, input, select, textarea, iframe, summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

/** The Tab stops inside a container, in order (one per radio group), as the browser would visit them. */
function tabStops(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE)).filter((el) => {
    if (el.tabIndex < 0 || el.matches(":disabled, [data-base-ui-focus-guard], [inert] *")) return false;
    if (el instanceof HTMLInputElement && el.type === "hidden") return false;
    if (el.getClientRects().length === 0 || getComputedStyle(el).visibility === "hidden") return false;
    if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
      const group = Array.from(container.querySelectorAll<HTMLInputElement>("input[type=radio]")).filter(
        (r) => r.name === el.name && r.form === el.form,
      );
      const checked = group.find((r) => r.checked);
      return checked ? checked === el : group[0] === el;
    }
    return true;
  });
}

/* ---------- Root ---------- */

/** Translatable text of {@link MorphingDialogContent}. */
export type MorphingDialogLabels = {
  /** Accessible name of the × button. */
  close: string;
};

/** The English {@link MorphingDialogLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultMorphingDialogLabels: MorphingDialogLabels = { close: "Close" };

/** Props of `MorphingDialog`; each option is documented on its field. */
export type MorphingDialogProps = {
  /** The trigger card and the dialog content. */
  children: ReactNode;
  /** Whether the dialog is open (controlled); pair it with `onOpenChange`. */
  open?: boolean;
  /** Open on first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
};

/**
 * Morphing dialog: a card that grows into a dialog. The card's surface, picture, title and subtitle each fly to their place in the dialog (Motion shared layoutIds), then the rest of the
 * content rises in; closing flies everything back into the card. Use it for gallery and product cards that open into detail; use `Dialog` for forms and confirmations. This is the root:
 * compose `MorphingDialogTrigger` (the card) with `MorphingDialogContent` (the dialog), and the shared pieces `MorphingDialogMedia`, `MorphingDialogTitle`, `MorphingDialogSubtitle`,
 * `MorphingDialogDescription` and `MorphingDialogActions`. Controlled with `open` + `onOpenChange`, or uncontrolled with `defaultOpen`.
 *
 * Keep the media's aspect ratio the same in the card and the dialog for a clean morph.
 *
 * Keyboard: Enter or Space on the card opens it; focus moves in and is trapped, Escape closes, and focus returns to the card. Tab and Shift+Tab are moved by the dialog itself, synchronously, through
 * every control in it (buttons included) and round again. That keeps the trap exact in Safari, which by default leaves buttons out of the Tab order and could let quick key presses slip past the focus
 * guards to the page behind.
 * Accessibility: built on Base UI's Dialog, so it is a real modal: an outside click closes it, page scroll is locked, and the popup is labelled by its title and described by its description. The card is
 * a button whose text is its accessible name.
 * Glass and motion: the card is `glass-2` and the dialog `glass-3` (the glass element itself morphs, never a faded wrapper), and corner radii are scale-corrected so they stay round mid-flight. Text only moves,
 * never stretches. Opening is a spring (a touch of overshoot); closing is shorter and never overshoots. The description (text) fades in as one block. Controls go in `MorphingDialogActions`, where each control
 * fades itself, so a glass button never sits in a faded wrapper (that would switch its blur off while it appears). Reduced motion: no flight. The dialog simply fades in over the card, and out.
 *
 * @example
 * ```tsx
 * import { Button, MorphingDialog, MorphingDialogActions, MorphingDialogContent, MorphingDialogDescription, MorphingDialogMedia, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialog>
 *       <MorphingDialogTrigger className="w-72 p-2">
 *         <MorphingDialogMedia className="aspect-[4/3]"><img src="/aurora.jpg" alt="" /></MorphingDialogMedia>
 *         <MorphingDialogTitle>Aurora</MorphingDialogTitle>
 *         <MorphingDialogSubtitle>Lofoten, Norway</MorphingDialogSubtitle>
 *       </MorphingDialogTrigger>
 *       <MorphingDialogContent>
 *         <MorphingDialogMedia className="aspect-[4/3]"><img src="/aurora.jpg" alt="" /></MorphingDialogMedia>
 *         <MorphingDialogTitle>Aurora</MorphingDialogTitle>
 *         <MorphingDialogSubtitle>Lofoten, Norway</MorphingDialogSubtitle>
 *         <MorphingDialogDescription>Best seen between September and March.</MorphingDialogDescription>
 *         <MorphingDialogActions><Button>Plan a trip</Button></MorphingDialogActions>
 *       </MorphingDialogContent>
 *     </MorphingDialog>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialog({ children, open: openProp, defaultOpen = false, onOpenChange }: MorphingDialogProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const id = useId();
  const reduced = useSheenReducedMotion();
  const actionsRef = useRef<BaseDialog.Root.Actions | null>(null);

  function handleOpenChange(next: boolean, details: BaseDialog.Root.ChangeEventDetails) {
    // Base UI keeps the dialog in its closing phase until the morph back has finished.
    if (!next) details.preventUnmountOnClose();
    setOpen(next);
  }

  return (
    <MorphContext value={{ id, open, reduced, actionsRef }}>
      <BaseDialog.Root open={open} onOpenChange={handleOpenChange} actionsRef={actionsRef}>
        {children}
      </BaseDialog.Root>
    </MorphContext>
  );
}

/* ---------- Trigger (the card) ---------- */

type MotionConflicts =
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "style"
  | "children";

/**
 * Props of `MorphingDialogTrigger`: the native `<button>` props plus its own options, each documented
 * on its field.
 */
export type MorphingDialogTriggerProps = Omit<ComponentProps<"button">, MotionConflicts> & {
  /** The card's content: usually `MorphingDialogMedia`, `MorphingDialogTitle` and `MorphingDialogSubtitle`. */
  children?: ReactNode;
  /** Glass level of the card: 1 = subtle, 2 = cards (default), 3 = most opaque. */
  level?: 1 | 2 | 3;
  /** Tints the card with the accent colour. */
  tint?: boolean;
  /** Sets the corner radius in px. Defaults to the theme's --sheen-radius-lg. */
  radius?: number;
  /** Inline styles for the card (the corner radius is added). */
  style?: CSSProperties;
};

/**
 * The card. It is a button (its text is its accessible name) that opens the dialog. `level` (1 to 3, default 2) and `tint` style the glass; `radius` sets the corner in px (default the theme's `--sheen-radius-lg`).
 * Put `MorphingDialogMedia`, `MorphingDialogTitle` and `MorphingDialogSubtitle` inside.
 *
 * Keyboard: Enter or Space opens the dialog. Accessibility: a native `<button>` with `aria-haspopup="dialog"`. Glass and motion: one `backdrop-filter` surface; hover fades a tint layer (opacity only); the surface flies into the dialog.
 *
 * @example
 * ```tsx
 * import { MorphingDialogTitle, MorphingDialogTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogTrigger className="w-72 p-2" tint>
 *       <MorphingDialogTitle>Aurora</MorphingDialogTitle>
 *     </MorphingDialogTrigger>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogTrigger({
  level = 2,
  tint = false,
  radius,
  className,
  style,
  children,
  ...props
}: MorphingDialogTriggerProps) {
  const { id, reduced } = useMorph("MorphingDialogTrigger");
  const ref = useRef<HTMLButtonElement>(null);
  const r = useTokenRadius(ref, "--sheen-radius-lg", 20, radius);
  return (
    <PlaceContext value="trigger">
      <BaseDialog.Trigger
        ref={ref}
        data-slot="morphing-dialog-trigger"
        render={
          <motion.button
            layoutId={reduced ? undefined : `${id}-surface`}
            transition={exitMorph}
            style={{ ...style, borderRadius: r }}
          />
        }
        className={cn(
          `glass-${level}`,
          tint && "glass-tint",
          "group/morph flex cursor-pointer flex-col items-stretch gap-1 overflow-hidden text-start text-sheen-fg",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          // Hover: a hover-tint layer behind the content fades in (opacity only, never a filter on glass).
          "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-sheen-hover after:opacity-0 hover:after:opacity-100",
          "motion-ok:after:transition-opacity motion-ok:after:duration-(--sheen-duration-fast) motion-ok:after:ease-sheen-out",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          className,
        )}
        {...props}
      >
        {children}
      </BaseDialog.Trigger>
    </PlaceContext>
  );
}

/* ---------- Content (the dialog) ---------- */

/**
 * Props of `MorphingDialogContent`: the native `<div>` props plus its own options, each documented on
 * its field.
 */
export type MorphingDialogContentProps = Omit<ComponentProps<"div">, MotionConflicts> & {
  /** The dialog's content: media, title, subtitle, description and actions. */
  children?: ReactNode;
  /** Sets the glass level of the dialog: 1 to 3. Default 3. */
  level?: 1 | 2 | 3;
  /** Sets the corner radius in px. Defaults to the theme's --sheen-radius-xl. */
  radius?: number;
  /** Show the × button in the top-right corner. Default true. */
  showClose?: boolean;
  /** Every string, for translation: `{ close: "Close" }` (accessible name of the × button). */
  labels?: Partial<MorphingDialogLabels>;
  /** Where focus goes when it opens (Base UI): a ref, false, or a function of the interaction type. Default: the first control (the popup itself on touch). */
  initialFocus?: BaseDialog.Popup.Props["initialFocus"];
  /** Where focus goes when it closes (Base UI). Default: back to the card. */
  finalFocus?: BaseDialog.Popup.Props["finalFocus"];
  /** Inline styles for the dialog (the corner radius is added). */
  style?: CSSProperties;
};

/**
 * The dialog. Portalled, with a scrim; the surface, media, title and subtitle fly in from the card. `level` (default 3), `radius`, `showClose` (default true) and `labels.close` (the accessible name of the × button) shape it; `initialFocus` and `finalFocus` pass through to Base UI
 * (by default focus goes to the first control, or the popup itself on touch, and returns to the card).
 *
 * Keyboard: focus is trapped inside; Escape or an outside click closes it. Accessibility: `role="dialog"`, labelled by `MorphingDialogTitle` and described by `MorphingDialogDescription`. Glass and motion: a `glass-3` surface that is the very element morphing;
 * reduced motion fades it in over the card instead of flying.
 *
 * @example
 * ```tsx
 * import { MorphingDialogContent, MorphingDialogDescription, MorphingDialogTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogContent labels={{ close: "Close details" }}>
 *       <MorphingDialogTitle>Aurora</MorphingDialogTitle>
 *       <MorphingDialogDescription>Best seen between September and March.</MorphingDialogDescription>
 *     </MorphingDialogContent>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogContent({
  level = 3,
  radius,
  showClose = true,
  labels: labelsProp,
  initialFocus,
  finalFocus,
  className,
  style,
  children,
  onKeyDown,
  ...props
}: MorphingDialogContentProps) {
  const { id, open, reduced, actionsRef } = useMorph("MorphingDialogContent");
  const ref = useRef<HTMLDivElement>(null);
  const r = useTokenRadius(ref, "--sheen-radius-xl", 28, radius);

  /** Tab / Shift+Tab: the next / previous control in the dialog, wrapping round (see the header). */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
    const popup = event.currentTarget;
    const from = event.target as HTMLElement;
    // From a popup of its own (a Select's list, portalled elsewhere): that popup handles it.
    if (!popup.contains(from)) return;
    const stops = tabStops(popup);
    event.preventDefault();
    if (stops.length === 0) {
      popup.focus();
      return;
    }
    const at = stops.indexOf(from);
    let next: HTMLElement | undefined;
    if (at !== -1) next = stops[(at + (event.shiftKey ? -1 : 1) + stops.length) % stops.length];
    else if (event.shiftKey)
      next =
        [...stops].reverse().find((el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) ??
        stops[stops.length - 1];
    else next = stops.find((el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) ?? stops[0];
    next?.focus();
  }

  return (
    <AnimatePresence onExitComplete={() => actionsRef.current?.unmount()}>
      {open && (
        <BaseDialog.Portal keepMounted key="morphing-dialog">
          <BaseDialog.Backdrop
            render={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: duration.slow, ease: ease.out } }}
                exit={{ opacity: 0, transition: exitTransition }}
              />
            }
            className="fixed inset-0 z-50 min-h-dvh bg-sheen-scrim"
          />
          {/* Centres the dialog. data-framer-portal-id: measure it against the page, not against wherever it sits in the React tree. */}
          <BaseDialog.Viewport
            render={<motion.div data-framer-portal-id={id} />}
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overscroll-contain p-4 sm:p-6"
          >
            <PlaceContext value="content">
              <BaseDialog.Popup
                ref={ref}
                data-slot="morphing-dialog-content"
                initialFocus={initialFocus}
                finalFocus={finalFocus}
                onKeyDown={handleKeyDown}
                render={
                  <motion.div
                    layoutId={reduced ? undefined : `${id}-surface`}
                    layoutScroll
                    transition={enterMorph}
                    initial={reduced ? { opacity: 0 } : undefined}
                    animate={
                      reduced ? { opacity: 1, transition: { duration: duration.base, ease: ease.out } } : undefined
                    }
                    exit={reduced ? { opacity: 0, transition: exitTransition } : undefined}
                    style={{ ...style, borderRadius: r }}
                  />
                }
                className={cn(
                  `glass-${level}`,
                  "relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[36rem] flex-col overflow-y-auto overscroll-contain text-sheen-fg outline-none sm:max-h-[calc(100dvh-3rem)]",
                  "[scrollbar-width:thin]",
                  className,
                )}
                {...props}
              >
                {children}
                {showClose && <MorphingDialogClose labels={labelsProp} />}
              </BaseDialog.Popup>
            </PlaceContext>
          </BaseDialog.Viewport>
        </BaseDialog.Portal>
      )}
    </AnimatePresence>
  );
}

/* ---------- Shared pieces (morph between card and dialog) ---------- */

/** Props of `MorphingDialogMedia`; each option is documented on its field. */
export type MorphingDialogMediaProps = {
  /** The picture: an `<img>`, a video poster or artwork. */
  children?: ReactNode;
  /** Sets the corner radius in px. Defaults to the theme's --sheen-radius-md. */
  radius?: number;
  /** Extra classes (set the aspect ratio here, the same in the card and the dialog). */
  className?: string;
  /** Inline styles for the media box (the corner radius is added). */
  style?: CSSProperties;
};

/**
 * The picture (an `<img>`, a video poster, artwork) that flies from the card into the dialog. Give it the same aspect ratio in both places (`className="aspect-[4/3]"`). Decorative images need `alt=""`.
 *
 * Keyboard: none. Accessibility: describe informative images with `alt`. Glass and motion: it shares a layout id between card and dialog; the corner radius is scale-corrected; reduced motion removes the flight.
 *
 * @example
 * ```tsx
 * import { MorphingDialogMedia } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogMedia className="aspect-[4/3]"><img src="/aurora.jpg" alt="" /></MorphingDialogMedia>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogMedia({ children, radius, className, style }: MorphingDialogMediaProps) {
  const { id, reduced } = useMorph("MorphingDialogMedia");
  const place = useContext(PlaceContext);
  const ref = useRef<HTMLElement>(null);
  const r = useTokenRadius(ref, "--sheen-radius-md", 14, radius);
  const Tag = place === "trigger" ? motion.span : motion.div;
  return (
    <Tag
      ref={ref as RefObject<HTMLDivElement & HTMLSpanElement>}
      layoutId={reduced ? undefined : `${id}-media`}
      transition={place === "trigger" ? exitMorph : enterMorph}
      data-slot="morphing-dialog-media"
      className={cn("relative block shrink-0 overflow-hidden [&>img]:size-full [&>img]:object-cover", className)}
      style={{ ...style, borderRadius: r }}
    >
      {children}
    </Tag>
  );
}

/** Props of the morphing dialog text parts; each option is documented on its field. */
export type MorphingDialogTextProps = {
  /** The text to show; it moves with the card while the dialog opens and closes. */
  children?: ReactNode;
  /** Adds extra classes to the text element. */
  className?: string;
};

/**
 * The title. In the dialog it is the dialog's accessible name (an `h2`). It moves, never stretches.
 *
 * Keyboard: none. Accessibility: always render one in the dialog. Glass and motion: shares a layout id with the card's title (position only); reduced motion removes the flight.
 *
 * @example
 * ```tsx
 * import { MorphingDialogTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogTitle>Aurora</MorphingDialogTitle>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogTitle({ children, className }: MorphingDialogTextProps) {
  const { id, reduced } = useMorph("MorphingDialogTitle");
  const place = useContext(PlaceContext);
  const layoutId = reduced ? undefined : `${id}-title`;
  if (place === "content") {
    return (
      <BaseDialog.Title
        render={<motion.h2 layoutId={layoutId} layout="position" transition={enterMorph} />}
        className={cn("text-xl leading-tight font-semibold tracking-tight text-balance", className)}
      >
        {children}
      </BaseDialog.Title>
    );
  }
  return (
    <motion.span
      layoutId={layoutId}
      layout="position"
      transition={exitMorph}
      className={cn("block font-semibold leading-snug", className)}
    >
      {children}
    </motion.span>
  );
}

/**
 * A line under the title (place, author, price) that also moves from the card into the dialog.
 *
 * Keyboard: none. Accessibility: plain text (a `p` in the dialog). Glass and motion: shares a layout id with the card's subtitle (position only); reduced motion removes the flight.
 *
 * @example
 * ```tsx
 * import { MorphingDialogSubtitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogSubtitle>Lofoten, Norway</MorphingDialogSubtitle>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogSubtitle({ children, className }: MorphingDialogTextProps) {
  const { id, reduced } = useMorph("MorphingDialogSubtitle");
  const place = useContext(PlaceContext);
  const Tag = place === "content" ? motion.p : motion.span;
  return (
    <Tag
      layoutId={reduced ? undefined : `${id}-subtitle`}
      layout="position"
      transition={place === "content" ? enterMorph : exitMorph}
      className={cn("block text-sm text-sheen-fg-muted", className)}
    >
      {children}
    </Tag>
  );
}

/** Props of `MorphingDialogDescription`; each option is documented on its field. */
export type MorphingDialogDescriptionProps = {
  /** Holds the description text (and non-glass figures). */
  children?: ReactNode;
  /** Adds extra classes to the description. */
  className?: string;
};

/**
 * Text that only exists in the dialog. It rises in once the surface has mostly landed and leaves first on close. It is the dialog's accessible description, so keep it to text (and non-glass figures): it fades as one
 * block, and a glass control inside a fading block loses its blur until the fade ends. Put buttons in `MorphingDialogActions`.
 *
 * Keyboard: none. Accessibility: linked as `aria-describedby`. Glass and motion: fades and rises as one block; with reduced motion it only fades.
 *
 * @example
 * ```tsx
 * import { MorphingDialogDescription } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogDescription>Best seen between September and March.</MorphingDialogDescription>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogDescription({ children, className }: MorphingDialogDescriptionProps) {
  const { reduced } = useMorph("MorphingDialogDescription");
  return (
    <BaseDialog.Description
      render={
        <motion.div
          layout={reduced ? false : "position"}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: duration.slow, ease: ease.out, delay: reduced ? 0 : 0.12 },
          }}
          exit={{ opacity: 0, transition: { duration: duration.exit * 0.6, ease: ease.exit } }}
        />
      }
      className={cn("text-sm text-pretty text-sheen-fg-muted", className)}
    >
      {children}
    </BaseDialog.Description>
  );
}

/** Props of `MorphingDialogActions`; each option is documented on its field. */
export type MorphingDialogActionsProps = {
  /** The dialog's buttons and other controls. */
  children?: ReactNode;
  /** Adds extra classes to the row. */
  className?: string;
};

/**
 * The dialog's buttons and other controls (a row by default). The row rises in with the description, but only moves: each direct child fades itself, one after another, so glass buttons keep their blur while they appear.
 * They fade out first on close.
 *
 * Keyboard: the controls inside are normal tab stops inside the trap. Accessibility: a plain `div`. Glass and motion: each child fades in with a 50ms stagger (none under reduced motion).
 *
 * @example
 * ```tsx
 * import { Button, MorphingDialogActions } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogActions>
 *       <Button>Plan a trip</Button>
 *       <Button variant="ghost">Save</Button>
 *     </MorphingDialogActions>
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogActions({ children, className }: MorphingDialogActionsProps) {
  const { reduced } = useMorph("MorphingDialogActions");
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [isPresent, safeToRemove] = usePresence();
  const shown = useRef(false);
  // The stagger and the removal callback are read when presence changes, not watched.
  const startDelay = useEffectEvent(() => (reduced ? 0 : 0.16));
  const removeNow = useEffectEvent(() => safeToRemove?.());

  useLayoutEffect(() => {
    const items = Array.from(scope.current.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
    if (isPresent) {
      // Hidden before the first paint, then each control fades itself in.
      if (!shown.current) for (const el of items) el.style.opacity = "0";
      shown.current = true;
      if (items.length === 0) return;
      const controls = animate(
        items,
        { opacity: 1 },
        { duration: duration.slow, ease: ease.out, delay: stagger(0.05, { startDelay: startDelay() }) },
      );
      return () => controls.stop();
    }
    if (items.length === 0) {
      removeNow();
      return;
    }
    let cancelled = false;
    const controls = animate(items, { opacity: 0 }, { duration: duration.exit * 0.6, ease: ease.exit });
    void controls.then(() => {
      if (!cancelled) removeNow();
    });
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [isPresent, scope, animate]);

  return (
    <motion.div
      ref={scope}
      data-slot="morphing-dialog-actions"
      layout={reduced ? false : "position"}
      initial={reduced ? false : { y: 12 }}
      animate={{ y: 0, transition: { duration: duration.slow, ease: ease.out, delay: reduced ? 0 : 0.14 } }}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {children}
    </motion.div>
  );
}

/** Props of `MorphingDialogClose`; each option is documented on its field. */
export type MorphingDialogCloseProps = {
  /** Every string, for translation: `close` is the button's accessible name (default "Close"). */
  labels?: Partial<MorphingDialogLabels>;
  /** Adds extra classes to the button. */
  className?: string;
};

/**
 * The × button (added automatically by `MorphingDialogContent` unless `showClose={false}`). Render it yourself to place a close control elsewhere in the dialog; `labels.close` is its accessible name (default "Close").
 *
 * Keyboard: Enter or Space closes the dialog and focus returns to the card. Accessibility: a native button with an `aria-label`; 44px on touch screens. Glass and motion: a `glass-1` button that scales and fades in; reduced motion only fades.
 *
 * @example
 * ```tsx
 * import { MorphingDialogClose } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MorphingDialogClose labels={{ close: "Close gallery" }} />
 *   );
 * }
 * ```
 *
 * @see /effects/morphing-dialog
 */
export function MorphingDialogClose({ labels: labelsProp, className }: MorphingDialogCloseProps) {
  const label = { ...defaultMorphingDialogLabels, ...labelsProp }.close;
  const { reduced } = useMorph("MorphingDialogClose");
  return (
    <BaseDialog.Close
      aria-label={label}
      render={
        <motion.button
          layout={reduced ? false : "position"}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: duration.base, ease: ease.out, delay: reduced ? 0 : 0.16 },
          }}
          exit={{ opacity: 0, transition: { duration: duration.exit * 0.6, ease: ease.exit } }}
        />
      }
      className={cn(
        "glass-1 absolute top-3 end-3 z-10 grid size-9 place-items-center rounded-sheen-full text-sheen-fg",
        "hover:bg-sheen-hover motion-ok:transition-[background-color] motion-ok:duration-(--sheen-duration-fast)",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        "any-pointer-coarse:size-11",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </BaseDialog.Close>
  );
}

/** Props of {@link MorphingDialogTitle}. The title. */
export type MorphingDialogTitleProps = ComponentProps<typeof MorphingDialogTitle>;

/** Props of {@link MorphingDialogSubtitle}. A line under the title (place, author, price) that also moves from the card into the dialog. */
export type MorphingDialogSubtitleProps = ComponentProps<typeof MorphingDialogSubtitle>;
