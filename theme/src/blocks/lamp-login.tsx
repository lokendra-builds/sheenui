"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";

import { cn } from "../lib/cn";
import { duration, ease, spring } from "../motion/tokens";
import { useControllable } from "../hooks/use-controllable";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { type HeadingLevelOption } from "../lib/heading";
import { GlassLogin, type GlassLoginLabels, type GlassLoginValues } from "./glass-login";

/** Every string `LampLogin` adds around the login card, so the block can be translated. */
export type LampLoginLabels = {
  /** Accessible name of the pull cord (a toggle button: its pressed state says whether the light is on). */
  cord: string;
  /** Visible hint under the lamp while the light is off. */
  hintOff: string;
  /** Visible hint under the lamp while the light is on. */
  hintOn: string;
};

/** Props of `LampLogin`. */
export type LampLoginProps = {
  /** Controls whether the light is on (`boolean`). Use with `onLitChange`; leave it out to let the block keep the state. */
  lit?: boolean;
  /** The light's starting state when uncontrolled (`boolean`, default `false`; with reduced motion the light starts on). */
  defaultLit?: boolean;
  /** Called when the light is switched by the cord, or by focus entering the card (`(lit: boolean) => void`). */
  onLitChange?: (lit: boolean) => void;
  /** Sets the card heading (`ReactNode`, default "Welcome back"). */
  title?: ReactNode;
  /** The line under the heading (`ReactNode`, default "Sign in to continue to your workspace."). */
  subtitle?: ReactNode;
  /** Called with the form values. Return a promise to show a loading state; throw to show an error. */
  onSubmit?: (values: GlassLoginValues) => void | Promise<void>;
  /** Show "Continue with GitHub / Google" buttons. Without it the social row is hidden. */
  onSocial?: (provider: "github" | "google") => void;
  /** Target of the "Forgot password?" link (`string`, default `"#"`). */
  forgotHref?: string;
  /** Target of the sign-up link (`string | null`, default `"#"`). Hide the sign-up line by passing null. */
  signUpHref?: string | null;
  /** Minimum password length checked before submitting (`number`, default 8). */
  minPasswordLength?: number;
  /** Overrides for the login card's strings (`Partial<GlassLoginLabels>`). */
  loginLabels?: Partial<GlassLoginLabels>;
  /** Overrides for the lamp's strings (`Partial<LampLoginLabels>`). */
  labels?: Partial<LampLoginLabels>;
  /**
   * Level of the card heading (`1` to `6`). `"none"` renders a paragraph with no heading role (for an example).
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Adds extra classes to the stage (`string`). */
  className?: string;
};

/** The English {@link LampLoginLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultLampLoginLabels: LampLoginLabels = {
  cord: "Lamp light",
  hintOff: "Pull the cord to switch the light on",
  hintOn: "Pull the cord to switch it off",
};

/** How far down (px) a drag has to pull the cord to count as a pull. */
const PULL_DISTANCE = 24;

/**
 * A sign-in card on a dark stage: a lamp with a pull cord. Pulling the cord (click, Enter, Space, or a drag down on
 * touch) switches on a warm light cone that lights the glass login card below. Use it for a sign-in page that wants
 * one memorable moment; the form itself is the `GlassLogin` block, so validation, loading and errors work the same.
 *
 * Props (see `LampLoginProps`): `lit` / `defaultLit` / `onLitChange` (`false`), `title`, `subtitle`, `onSubmit(values)`,
 * `onSocial(provider)`, `forgotHref` (`"#"`), `signUpHref` (`"#"`), `minPasswordLength` (`8`), `loginLabels`
 * (`Partial<GlassLoginLabels>`), `labels` (`Partial<LampLoginLabels>`), `headingLevel` (`2`), `className`.
 *
 * Keyboard: Tab reaches the cord first (a real button; Enter or Space pulls it), then the card's fields in order.
 * The card is always in the page and always reachable: the light is only a look. Focus entering the card switches
 * the light on, so a keyboard user never types into the dark.
 * Accessibility: the cord is a toggle button named by `labels.cord` whose pressed state says whether the light is
 * on; the hint under the lamp is text. The lamp, cone and glow are `aria-hidden`; nothing is conveyed by light alone.
 * Glass and motion: the stage is forced dark so the glass and its text keep their contrast whatever the page theme;
 * one level-3 glass card (a single backdrop blur) sits under a dimming layer, never inside a faded wrapper. The cone,
 * glow and dimming are opacity and transform; the cord swings on a spring. Reduced motion starts with the light on,
 * drops the swing and the cone's growth, and keeps only a short fade when the cord is pulled.
 *
 * @example
 * ```tsx
 * import { LampLogin } from "@sheenui/theme";
 *
 * // `signIn` is your own function; throw from it to show the error under the form.
 * declare function signIn(email: string, password: string): Promise<void>;
 *
 * export function Example() {
 *   return (
 *     <LampLogin
 *       title="Welcome back"
 *       onSubmit={async ({ email, password }) => {
 *         await signIn(email, password);
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/lamp-login
 */
export function LampLogin({
  lit: litProp,
  defaultLit = false,
  onLitChange,
  title,
  subtitle,
  onSubmit,
  onSocial,
  forgotHref,
  signUpHref,
  minPasswordLength,
  loginLabels,
  labels,
  headingLevel,
  className,
}: LampLoginProps) {
  const L = { ...defaultLampLoginLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const hintId = useId();
  const [lit, setLit] = useControllable(litProp, defaultLit, onLitChange);

  // Reduced motion: the light starts on (once), so nobody waits on an animation to see the card.
  const settled = useRef(false);
  useEffect(() => {
    if (reduced && !settled.current && litProp === undefined && !defaultLit) setLit(true);
    settled.current = true;
  }, [reduced, litProp, defaultLit, setLit]);

  // The cord: it dips when pulled and swings back on a spring. Drag follows the finger; releasing past the
  // distance counts as a pull.
  const y = useMotionValue(0);
  const swing = useMotionValue(0);
  const dragged = useRef(false);

  function pull() {
    setLit((on) => !on);
    if (reduced) return;
    swing.set(5);
    void animate(swing, 0, spring.bouncy);
    void animate(y, [0, 14, 0], { duration: duration.slow, ease: ease.out });
  }

  const light = reduced ? { opacity: lit ? 1 : 0 } : { opacity: lit ? 1 : 0, scaleY: lit ? 1 : 0.55 };
  const fade = { duration: reduced ? duration.fast : duration.slower, ease: ease.out };

  return (
    <div
      data-theme="dark"
      data-lit={lit ? "on" : "off"}
      data-slot="lamp-login"
      className={cn(
        "relative isolate flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-sheen-xl bg-sheen-bg px-4 pb-8 text-sheen-fg sm:px-8",
        className,
      )}
    >
      {/* The lamp: a shade, a bulb and the beam. All of it is picture; the cord below is the control. */}
      <div aria-hidden className="relative h-[11.5rem] w-full">
        <motion.div
          initial={false}
          animate={light}
          transition={fade}
          style={{ transformOrigin: "top" }}
          className="absolute left-1/2 top-[6rem] -z-10 h-[34rem] w-[min(36rem,140%)] -translate-x-1/2 [background-image:linear-gradient(to_bottom,var(--sheen-warning-glow),transparent_85%)] [clip-path:polygon(43%_0,57%_0,100%_100%,0_100%)]"
        />
        <div className="absolute left-1/2 top-10 h-12 w-36 -translate-x-1/2 [background-image:linear-gradient(var(--sheen-ink-700),var(--sheen-ink-800))] [clip-path:polygon(28%_0,72%_0,100%_100%,0_100%)]" />
        <motion.div
          initial={false}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={fade}
          className="absolute left-1/2 top-10 h-12 w-36 -translate-x-1/2 [background-image:linear-gradient(var(--sheen-amber-400),var(--sheen-amber-700))] [clip-path:polygon(28%_0,72%_0,100%_100%,0_100%)]"
        />
        <motion.div
          initial={false}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={fade}
          className="absolute left-1/2 top-[5.4rem] size-3 -translate-x-1/2 rounded-full bg-[var(--sheen-amber-400)] shadow-[0_0_40px_16px_var(--sheen-warning-glow)]"
        />
      </div>

      {/* The cord hangs from the shade's edge: a thin line and a bead that is the button. */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.35}
        dragSnapToOrigin
        dragMomentum={false}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          if (info.offset.y >= PULL_DISTANCE) pull();
          // A drag that ends on the bead would also click it: swallow that one click.
          setTimeout(() => {
            dragged.current = false;
          }, 0);
        }}
        style={{ y, rotate: swing, transformOrigin: "top" }}
        className="absolute top-[5.5rem] z-20 flex touch-pan-x flex-col items-center left-[calc(50%+3.25rem)] -ml-[1.375rem]"
      >
        <span aria-hidden className="h-12 w-0.5 bg-sheen-fg-muted" />
        <button
          type="button"
          aria-label={L.cord}
          aria-pressed={lit}
          aria-describedby={hintId}
          onClick={() => {
            if (!dragged.current) pull();
          }}
          className="-mt-0.5 flex size-11 cursor-grab items-center justify-center rounded-sheen-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-sheen-focus active:cursor-grabbing"
        >
          <span
            aria-hidden
            className="size-4 rounded-full bg-[var(--sheen-amber-400)] shadow-[0_0_14px_2px_var(--sheen-warning-glow)]"
          />
        </button>
      </motion.div>

      <p id={hintId} className="relative z-10 mb-6 text-center text-sm text-sheen-fg-muted">
        {lit ? L.hintOn : L.hintOff}
      </p>

      {/* The card is always here. The dimming layer above it is the "dark"; it never touches the glass. */}
      <div
        className="relative flex w-full max-w-sm"
        onFocusCapture={() => {
          if (!lit) setLit(true);
        }}
      >
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: lit ? 0 : 0.88 }}
          transition={fade}
          data-slot="lamp-dim"
          className="pointer-events-none absolute -inset-px z-10 rounded-sheen-xl bg-[var(--sheen-ink-950)]"
        />
        <GlassLogin
          className="max-w-none"
          title={title}
          subtitle={subtitle}
          onSubmit={onSubmit}
          onSocial={onSocial}
          forgotHref={forgotHref}
          signUpHref={signUpHref}
          minPasswordLength={minPasswordLength}
          labels={loginLabels}
          headingLevel={headingLevel}
        />
      </div>
    </div>
  );
}
