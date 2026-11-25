"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";

import { cn } from "../lib/cn";
import { Button } from "../components/button/button";
import { GlassCard } from "../components/glass-card/glass-card";
import { OtpInput, type OtpStatus } from "../components/otp-input/otp-input";
import { CheckIcon, ShieldIcon } from "./icons";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../lib/heading";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { duration, ease, spring } from "../motion/tokens";

/** Every user-facing string, so the block can be translated. */
export type OtpVerificationLabels = {
  /** Heading while waiting for the code. */
  title: string;
  /** Heading after the code is accepted. */
  titleVerified: string;
  /** Receives the code length and the destination. */
  description: (length: number, destination: ReactNode) => ReactNode;
  /** Description after the code is accepted. */
  descriptionVerified: string;
  /** Accessible name of the code field (not shown). */
  codeLabel: string;
  /** Message for a wrong code. */
  error: string;
  /** Shown when Verify is pressed before every digit is filled. */
  incomplete: (length: number) => string;
  /** Announced when the code is accepted. */
  success: string;
  /** Announced after a new code was requested. */
  resent: string;
  /** The verify button text. */
  verify: string;
  /** The continue button text (shown after success). */
  continue: string;
  /** The sentence before the resend control ("Didn't get it?"). */
  resendPrompt: string;
  /** The disabled resend text while the countdown runs. */
  resendIn: (seconds: number) => string;
  /** The resend button text. */
  resend: string;
  /** Text of the badge that pops in on success with `variant="unlock"` (default "Verified"). */
  verifiedBadge?: string;
};

/** Props of `OtpVerification`. */
export type OtpVerificationProps = {
  /** Where the code was sent, shown in the description (`ReactNode`, default "your email"). */
  destination?: ReactNode;
  /** Sets the number of digits (`number`, default 6). */
  length?: number;
  /** Return true if the code is correct. Throwing counts as a wrong code. */
  onVerify: (code: string) => boolean | Promise<boolean>;
  /** Called when the person asks for a new code. Without it the resend control still resets the field. */
  onResend?: () => void | Promise<void>;
  /** Shows a "Continue" button once the code is accepted. */
  onContinue?: () => void;
  /** Seconds before "Resend" becomes available (`number`, default 30). */
  resendAfter?: number;
  /** Focus the first digit on mount (`boolean`, default `true`). Turn it off when the block is not the main task on the page. */
  autoFocus?: boolean;
  /** Overrides for the built-in English strings (`Partial<OtpVerificationLabels>`). */
  labels?: Partial<OtpVerificationLabels>;
  /** Level of the title heading (`1` to `6`, default `2`); set it to fit the page's outline. `"none"` renders a paragraph with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** Adds extra classes to the outer glass card (`string`). */
  className?: string;
  /**
   * `"default"` (the plain card) or `"unlock"` (`"default" | "unlock"`, default `"default"`): a padlock inside a progress
   * ring that fills with every digit and spins while the code is checked. A right code closes the ring in green, opens the
   * lock, bursts sparks, floods the card with light and shows a "Verified" badge; a wrong code rattles the lock and
   * clears the digits. Reduced motion swaps all of it for an instant change.
   */
  variant?: "default" | "unlock";
};

/** The visible digit slots (Base UI also renders a hidden, aria-hidden input for form submission). */
const SLOT = 'input:not([aria-hidden="true"])';

/** How long the cells stay red after a wrong code before they clear (unlock variant): the rattle plus the fade. */
const UNLOCK_CLEAR_MS = Math.round((duration.slower + duration.slow) * 1000);

/** The English {@link OtpVerificationLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultOtpVerificationLabels: OtpVerificationLabels = {
  title: "Check your inbox",
  titleVerified: "You're verified",
  description: (length, destination) => (
    <>
      Enter the {length}-digit code we sent to {destination}.
    </>
  ),
  descriptionVerified: "Your code was accepted. You can continue.",
  codeLabel: "Verification code",
  error: "That code didn't match. Try again.",
  incomplete: (length) => `Enter all ${length} digits.`,
  success: "Code accepted.",
  resent: "We sent you a new code.",
  verify: "Verify code",
  continue: "Continue",
  resendPrompt: "Didn't get it?",
  resendIn: (s) => `Resend in ${s}s`,
  resend: "Resend code",
  verifiedBadge: "Verified",
};

/**
 * A one-time-code card: digit slots, a verify button, a resend countdown and a success state.
 * Use it for email or SMS verification and two-factor sign-in steps.
 *
 * Props (see `OtpVerificationProps`): `onVerify(code)` (required; resolve `true` for a correct
 * code), `destination` (`ReactNode`), `length` (`6`), `onResend`, `onContinue`, `resendAfter`
 * (seconds), `autoFocus`, `labels` (`Partial<OtpVerificationLabels>`), `headingLevel` (`2`), `className`,
 * `variant` (`"default"`, or `"unlock"` for the padlock-ring design).
 *
 * Keyboard: type or paste the digits (focus advances by itself); Backspace steps back; the code
 * verifies as soon as the last digit is in, and Tab then Enter or Space on Verify does the same.
 * Pressing Verify early moves focus to the first empty slot and explains. After success focus
 * moves to Continue (or the heading).
 * Accessibility: the field is named by `codeLabel`; wrong-code, incomplete, resent and success
 * messages share one polite live region; the resend countdown is text, not colour only.
 * Glass and motion: one level-3 glass card (one backdrop blur). The default variant only fades the badge colour;
 * `variant="unlock"` adds a ring that fills, a spinning arc, a lock that opens, sparks and a light flood (transform,
 * opacity, clip-path and SVG stroke only). All of it follows the motion tokens; with reduced motion there is no spin,
 * flood, sweep or sparks and the states change at once. Forced colours get solid outlines and no glow.
 *
 * @example
 * ```tsx
 * import { OtpVerification } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const api: { verify(code: string): Promise<{ ok: boolean }>; sendCode(): void };
 * declare const router: { push(path: string): void };
 *
 * export function Example() {
 *   return (
 *     <OtpVerification
 *       destination="ada@example.com"
 *       onVerify={async (code) => (await api.verify(code)).ok}
 *       onResend={() => api.sendCode()}
 *       onContinue={() => router.push("/app")}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/otp-verification
 */
export function OtpVerification({
  destination = "your email",
  length = 6,
  onVerify,
  onResend,
  onContinue,
  resendAfter = 30,
  autoFocus = true,
  labels,
  headingLevel = 2,
  className,
  variant = "default",
}: OtpVerificationProps) {
  const Title = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const L = { ...defaultOtpVerificationLabels, ...labels };
  const unlock = variant === "unlock";
  const reduced = useSheenReducedMotion();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [notice, setNotice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(resendAfter);
  // Unlock only: the cells glow red for a moment after a wrong code, then clear themselves.
  const [flash, setFlash] = useState(false);
  const clearTimer = useRef<number | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  const done = status === "success";

  useEffect(() => () => window.clearTimeout(clearTimer.current), []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // The slots are disabled while verifying, which drops focus. Put it somewhere useful afterwards:
  // back in the code after a miss, on "Continue" (or the heading) after a match.
  useEffect(() => {
    if (verifying) return;
    if (status === "error") {
      const inputs = cardRef.current?.querySelectorAll<HTMLInputElement>(SLOT);
      inputs?.[inputs.length - 1]?.focus();
    } else if (status === "success") {
      (continueRef.current ?? headingRef.current)?.focus();
    }
  }, [status, verifying]);

  async function verify(value = code) {
    if (verifying) return;
    if (value.length < length) {
      // Keep the button enabled and explain instead of silently ignoring the press.
      setNotice(L.incomplete(length));
      const inputs = cardRef.current?.querySelectorAll<HTMLInputElement>(SLOT);
      inputs?.[Math.min(value.length, length - 1)]?.focus();
      return;
    }
    setVerifying(true);
    setStatus("idle");
    setNotice("");
    let ok: boolean;
    try {
      ok = await onVerify(value);
    } catch {
      ok = false;
    }
    setStatus(ok ? "success" : "error");
    setVerifying(false);
    if (unlock && !ok) {
      setFlash(true);
      window.clearTimeout(clearTimer.current);
      clearTimer.current = window.setTimeout(() => {
        setCode("");
        setFlash(false);
        // Only take focus back when it is still in the code (or nowhere): never pull it off Verify or Resend.
        const active = document.activeElement;
        if (!active || active === document.body || (active.matches(SLOT) && cardRef.current?.contains(active))) {
          cardRef.current?.querySelector<HTMLInputElement>(SLOT)?.focus();
        }
      }, UNLOCK_CLEAR_MS);
    }
  }

  async function resend() {
    window.clearTimeout(clearTimer.current);
    setFlash(false);
    setCode("");
    setStatus("idle");
    setSeconds(resendAfter);
    cardRef.current?.querySelector<HTMLInputElement>(SLOT)?.focus();
    await onResend?.();
    setNotice(L.resent);
  }

  const message = status === "error" ? L.error : status === "success" ? L.success : notice;
  const mark: UnlockState = done ? "success" : verifying ? "checking" : flash ? "error" : "idle";

  const codeInput = (
    <OtpInput
      className={unlock ? undefined : "mt-5"}
      label={<span className="sr-only">{L.codeLabel}</span>}
      length={length}
      value={code}
      grouped
      // eslint-disable-next-line jsx-a11y/no-autofocus -- an opt-in prop (default false) that the integrator sets when the code step is the page's main task
      autoFocus={autoFocus}
      disabled={verifying || done}
      status={unlock ? (flash ? "error" : "idle") : status}
      onValueChange={(v) => {
        setCode(v);
        if (unlock) {
          window.clearTimeout(clearTimer.current);
          setFlash(false);
        }
        if (status === "error") setStatus("idle");
        if (notice) setNotice("");
      }}
      onComplete={(v) => void verify(v)}
    />
  );

  return (
    <GlassCard
      ref={cardRef}
      level={3}
      data-variant={unlock ? "unlock" : undefined}
      data-state={unlock ? mark : undefined}
      className={cn(
        "w-full max-w-md px-2 py-7 text-center sm:p-8",
        unlock && "relative overflow-hidden pt-8",
        className,
      )}
    >
      {unlock && <UnlockFlood on={done} reduced={reduced} />}
      <div className={unlock ? "relative" : undefined}>
        {unlock ? (
          <UnlockMark state={mark} progress={code.length / length} reduced={reduced} />
        ) : (
          <div
            className={cn(
              "mx-auto mb-5 flex size-14 items-center justify-center rounded-sheen-full transition-colors duration-(--sheen-duration-slow)",
              done ? "bg-sheen-success-soft text-sheen-success-text" : "bg-sheen-accent-soft text-sheen-accent",
            )}
          >
            {done ? <CheckIcon className="size-6" /> : <ShieldIcon className="size-6" />}
          </div>
        )}

        <Title ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-tight outline-none">
          {done ? L.titleVerified : L.title}
        </Title>
        <p className={cn("mt-1.5 text-sm text-sheen-fg-muted", unlock && "min-h-10")}>
          {done ? L.descriptionVerified : L.description(length, destination)}
        </p>

        {unlock ? (
          <div className="relative mt-5">
            <motion.div
              initial={false}
              animate={done ? { opacity: 0, y: reduced ? 0 : 16 } : { opacity: 1, y: 0 }}
              transition={
                done
                  ? {
                      duration: reduced ? 0 : duration.slow,
                      ease: ease.exit,
                      delay: reduced ? 0 : duration.fast,
                    }
                  : { duration: duration.base, ease: ease.out }
              }
              inert={done}
            >
              {codeInput}
            </motion.div>
            <UnlockBadge on={done} reduced={reduced} text={L.verifiedBadge ?? "Verified"} />
          </div>
        ) : (
          codeInput
        )}

        <p
          aria-live="polite"
          className={cn(
            "mt-3 min-h-5 text-sm font-medium",
            status === "error"
              ? "text-sheen-danger-text"
              : status === "success"
                ? "text-sheen-success-text"
                : "text-sheen-fg-muted",
          )}
        >
          {message}
        </p>

        {done ? (
          <>
            {onContinue ? (
              <Button key="continue" ref={continueRef} className="mt-4" size="lg" fullWidth onClick={onContinue}>
                {L.continue}
              </Button>
            ) : (
              unlock && (
                // Keeps the card's height: the unlock design never shifts the layout on success.
                <Button className="invisible mt-4" size="lg" fullWidth tabIndex={-1} aria-hidden inert>
                  {L.verify}
                </Button>
              )
            )}
            {unlock && (
              <p aria-hidden className="invisible mt-5 text-sm">
                {L.resendPrompt} {L.resendIn(0)}
              </p>
            )}
          </>
        ) : (
          <>
            <Button className="mt-4" size="lg" fullWidth loading={verifying} onClick={() => void verify()}>
              {L.verify}
            </Button>
            <p className="mt-5 text-sm text-sheen-fg-muted">
              {L.resendPrompt}{" "}
              {seconds > 0 ? (
                <span className="tabular-nums">{L.resendIn(seconds)}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void resend()}
                  className="inline-flex items-center rounded-sheen-sm font-medium text-sheen-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11"
                >
                  {L.resend}
                </button>
              )}
            </p>
          </>
        )}
      </div>
      {unlock && <UnlockSweep on={done} reduced={reduced} />}
    </GlassCard>
  );
}

/* ---------- Unlock variant: the padlock ring and its effects ---------- */

type UnlockState = "idle" | "checking" | "success" | "error";

/** Light centre of the padlock inside the card: 32px of top padding plus half of the 96px ring. */
const LOCK_Y = "80px";
const RING_R = 44;
/** One turn of the checking arc (a token sum, not a literal). */
const SPIN = duration.slower + duration.base;
/** Share of the ring the spinning arc covers while the code is checked. */
const ARC = 0.28;
const RATTLE = [0, -10, 9, -6, 4, 0];
const PULSE = [1, 1.08, 1];
/** Twelve sparks on a ring of angles, each with its own reach and size. Static, so server and client agree. */
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12);
  const reach = 58 + (i % 3) * 22;
  return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach, size: i % 3 === 0 ? 1.2 : 0.75, wait: i % 4 };
});

const STROKE = {
  idle: "stroke-[color:var(--sheen-accent)]",
  checking: "stroke-[color:var(--sheen-accent)]",
  success: "stroke-[color:var(--sheen-success-border)]",
  error: "stroke-[color:var(--sheen-danger-border)]",
} as const;
const GLOW = {
  idle: "[--ring-glow:var(--sheen-accent-glow)]",
  checking: "[--ring-glow:var(--sheen-accent-glow)]",
  success: "[--ring-glow:var(--sheen-success-glow)]",
  error: "[--ring-glow:var(--sheen-danger-glow)]",
} as const;

/** The padlock in its progress ring. Decorative: the heading and the live region carry the meaning. */
function UnlockMark({ state, progress, reduced }: { state: UnlockState; progress: number; reduced: boolean }) {
  const ok = state === "success";
  const bad = state === "error";
  const checking = state === "checking";
  const fill = ok ? 1 : checking ? ARC : bad ? 0 : progress;
  const spin = useMotionValue(0);

  // The arc keeps turning from wherever it stopped, so it never snaps back when the check ends.
  useEffect(() => {
    if (!checking || reduced) return;
    const loop = animate(spin, spin.get() + 360, { duration: SPIN, ease: "linear", repeat: Infinity });
    return () => loop.stop();
  }, [checking, reduced, spin]);

  // Reduced motion: the ring jumps (a fade longer than 150 ms is not allowed there).
  const fade = { duration: 0 };
  return (
    <motion.div
      aria-hidden
      data-slot="otp-lock"
      className="relative mx-auto mb-4 size-24"
      initial={false}
      animate={{ scale: ok && !reduced ? PULSE : 1 }}
      transition={{ duration: duration.slow, ease: ease.out, delay: ok ? duration.base : 0 }}
    >
      <svg
        viewBox="0 0 100 100"
        focusable="false"
        className={cn(
          "size-full overflow-visible drop-shadow-[0_0_8px_var(--ring-glow)] forced-colors:drop-shadow-none",
          GLOW[state],
        )}
      >
        <motion.g style={{ rotate: spin }}>
          <circle
            cx="50"
            cy="50"
            r={RING_R}
            strokeWidth="5"
            className="fill-[color:color-mix(in_oklab,var(--sheen-fg)_4%,transparent)] stroke-[color:color-mix(in_oklab,var(--sheen-fg)_14%,transparent)] forced-colors:fill-[Canvas]! forced-colors:stroke-[GrayText]!"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RING_R}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            pathLength={1}
            initial={false}
            animate={{ pathLength: fill, opacity: fill > 0 ? 1 : 0 }}
            transition={reduced ? fade : { duration: duration.slow, ease: ease.out }}
            className={cn(
              "transition-[stroke] duration-(--sheen-duration-base) ease-sheen-out forced-colors:stroke-[Highlight]!",
              STROKE[state],
            )}
          />
        </motion.g>
        <motion.g
          initial={false}
          animate={{ rotate: bad && !reduced ? RATTLE : 0 }}
          transition={{ duration: duration.slower, ease: ease.out }}
        >
          <motion.path
            d="M43 47 v-6 a7 7 0 0 1 14 0 v6"
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ transformBox: "view-box", transformOrigin: "57px 47px" }}
            initial={false}
            animate={ok ? { y: -5, rotate: -38 } : { y: 0, rotate: 0 }}
            transition={
              reduced ? { duration: 0 } : ok ? { ...spring.bouncy, delay: duration.base } : { duration: duration.base }
            }
            className={cn(
              "transition-[stroke] duration-(--sheen-duration-slow) ease-sheen-out forced-colors:stroke-[CanvasText]!",
              ok
                ? "stroke-[color:var(--sheen-success-border)]"
                : "stroke-[color:color-mix(in_oklab,var(--sheen-fg)_85%,transparent)]",
            )}
          />
          <rect
            x="38"
            y="47"
            width="24"
            height="19"
            rx="4.5"
            strokeWidth="2"
            className={cn(
              "transition-[fill,stroke] duration-(--sheen-duration-slow) ease-sheen-out forced-colors:fill-[Canvas]! forced-colors:stroke-[CanvasText]!",
              ok
                ? "fill-[color:color-mix(in_oklab,var(--sheen-success)_30%,transparent)] stroke-[color:var(--sheen-success-border)]"
                : "fill-[color:color-mix(in_oklab,var(--sheen-fg)_10%,transparent)] stroke-[color:color-mix(in_oklab,var(--sheen-fg)_85%,transparent)]",
            )}
          />
          <circle
            cx="50"
            cy="55.5"
            r="2.2"
            className="fill-[color:color-mix(in_oklab,var(--sheen-fg)_85%,transparent)] forced-colors:fill-[CanvasText]!"
          />
        </motion.g>
      </svg>
      {ok &&
        !reduced &&
        SPARKS.map((spark, i) => (
          <motion.span
            key={i}
            data-slot="otp-spark"
            className="absolute start-1/2 top-1/2 -ms-0.5 -mt-0.5 size-1 rounded-full bg-sheen-success shadow-[0_0_10px_var(--sheen-success-glow)] forced-colors:hidden"
            initial={{ x: 0, y: 0, scale: spark.size, opacity: 1 }}
            animate={{ x: spark.x, y: spark.y, scale: 0.2, opacity: 0 }}
            transition={{
              duration: duration.slower + spark.wait * duration.fast,
              ease: ease.out,
              delay: duration.base,
            }}
          />
        ))}
    </motion.div>
  );
}

/** A green light that floods the card outward from the padlock (clip-path circle); an instant change with reduced motion. */
function UnlockFlood({ on, reduced }: { on: boolean; reduced: boolean }) {
  const open = `circle(150% at 50% ${LOCK_Y})`;
  const shut = `circle(0% at 50% ${LOCK_Y})`;
  return (
    <motion.div
      aria-hidden
      data-slot="otp-flood"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_80px,color-mix(in_oklab,var(--sheen-success)_36%,transparent),color-mix(in_oklab,var(--sheen-success)_10%,transparent)_46%,transparent_80%)] forced-colors:hidden"
      initial={false}
      animate={reduced ? { opacity: on ? 1 : 0 } : on ? { clipPath: open, opacity: 1 } : { clipPath: shut, opacity: 0 }}
      transition={
        on
          ? {
              duration: reduced ? 0 : duration.slower + duration.slow,
              ease: ease.out,
              delay: reduced ? 0 : duration.base,
            }
          : { duration: duration.base, ease: ease.out }
      }
    />
  );
}

/** A band of light that crosses the card once on success. Not rendered with reduced motion. */
function UnlockSweep({ on, reduced }: { on: boolean; reduced: boolean }) {
  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      data-slot="otp-sweep"
      className="pointer-events-none absolute inset-y-0 start-0 w-1/2 bg-[linear-gradient(105deg,transparent_30%,color-mix(in_oklab,var(--sheen-success)_30%,transparent)_46%,color-mix(in_oklab,white_40%,transparent)_50%,color-mix(in_oklab,var(--sheen-success)_30%,transparent)_54%,transparent_70%)] mix-blend-plus-lighter forced-colors:hidden"
      initial={false}
      animate={{ x: on ? "320%" : "-120%" }}
      transition={
        on
          ? { duration: (duration.slower + duration.slow) * 1.2, ease: ease.inOut, delay: duration.slow }
          : { duration: 0 }
      }
    />
  );
}

/** The "Verified" pill that pops in where the digit cells were. */
function UnlockBadge({ on, reduced, text }: { on: boolean; reduced: boolean; text: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.span
        data-slot="otp-badge"
        className="inline-flex items-center gap-2 rounded-sheen-full border border-sheen-success-border bg-sheen-success-soft px-4 py-2 text-sm font-medium text-sheen-fg shadow-[0_10px_30px_-10px_var(--sheen-success-glow)] forced-colors:border-[CanvasText] forced-colors:shadow-none"
        initial={false}
        animate={on ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: reduced ? 1 : 0.94, y: reduced ? 0 : 6 }}
        transition={
          on
            ? reduced
              ? { duration: 0 }
              : { ...spring.bouncy, delay: duration.slower + duration.fast }
            : { duration: duration.fast, ease: ease.exit }
        }
      >
        <CheckIcon className="size-4 text-sheen-success-text" />
        {text}
      </motion.span>
    </div>
  );
}
