"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration, ease, spring } from "../../motion/tokens";
import { Button } from "../../components/button/button";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../../lib/heading";

/** What the card's light is telling: nothing, a payment in flight, a refused payment, or a paid one. */
export type CheckoutLightState = "idle" | "processing" | "error" | "success";

/** The fields of the card form the preview can point at. */
export type CardPreviewField = "number" | "name" | "expiry" | "cvc" | "upi";

const digits = (s: string) => s.replace(/\D/g, "");

const layers: { state: Exclude<CheckoutLightState, "idle">; glow: string }[] = [
  { state: "processing", glow: "[--glow:var(--sheen-warning-glow)]" },
  { state: "error", glow: "[--glow:var(--sheen-danger-glow)]" },
  { state: "success", glow: "[--glow:var(--sheen-success-glow)]" },
];

/**
 * The light inside the checkout card: an aura from the top edge plus a lit rim that follows the payment state
 * (warning while processing, danger after a refusal, success when paid). Visual only: the state is also written
 * as text. Opacity only, on layers that hold no glass.
 *
 * @internal
 */
export function StateLight({ state, reduced }: { state: CheckoutLightState; reduced: boolean }) {
  return (
    <div
      aria-hidden
      data-slot="checkout-light"
      data-state={state}
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {layers.map(({ state: s, glow }) => (
        <motion.div
          key={s}
          initial={false}
          animate={{ opacity: state === s ? 1 : 0 }}
          transition={{ duration: reduced ? duration.fast : duration.slower, ease: ease.out }}
          className={cn(
            glow,
            "absolute inset-0 rounded-[inherit] opacity-0",
            "[background-image:radial-gradient(120%_70%_at_50%_0%,var(--glow),transparent_70%)]",
            "shadow-[inset_0_0_0_1px_var(--glow),inset_0_0_56px_-18px_var(--glow)]",
          )}
        />
      ))}
    </div>
  );
}

/**
 * A check that draws itself inside a ring (stroke-dash only); under reduced motion it is drawn at once.
 *
 * @internal
 */
export function DrawnCheck({ reduced }: { reduced: boolean }) {
  const draw = (delay: number) => ({
    initial: { pathLength: reduced ? 1 : 0 },
    animate: { pathLength: 1 },
    transition: { duration: reduced ? 0 : duration.slower, ease: ease.out, delay: reduced ? 0 : delay },
  });
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className="size-9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.circle cx="24" cy="24" r="20" strokeWidth="2.5" {...draw(0)} />
      <motion.path d="M14.5 25.5 21 32l12.5-14" strokeWidth="3.5" {...draw(duration.slow)} />
    </svg>
  );
}

/**
 * The paid result: a green ring with a drawn check, the heading (which takes focus), the body and the reset button.
 *
 * @internal
 */
export function SuccessPanel({
  headingLevel,
  reduced,
  title,
  body,
  again,
  onAgain,
}: {
  headingLevel: HeadingLevelOption;
  reduced: boolean;
  title: string;
  body: string;
  again: string;
  onAgain: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  // The form (and the focused Pay button) just unmounted: move focus to the result so it's announced.
  useEffect(() => headingRef.current?.focus(), []);

  return (
    // Safe to fade: no glass inside (the button is ghost, not glass).
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: reduced ? { duration: duration.fast } : spring.bouncy }}
      exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
      className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center"
    >
      <div
        data-slot="checkout-seal"
        className="flex size-16 items-center justify-center rounded-sheen-full bg-sheen-success-soft text-sheen-success-text shadow-[0_0_36px_-6px_var(--sheen-success-glow)] motion-ok:animate-[sheen-ripple_var(--sheen-duration-gentle)_var(--sheen-ease-out)]"
      >
        <DrawnCheck reduced={reduced} />
      </div>
      <Heading ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        {title}
      </Heading>
      <p className="text-sm text-sheen-fg-muted">{body}</p>
      <Button variant="ghost" className="mt-2 any-pointer-coarse:h-11" onClick={onAgain}>
        {again}
      </Button>
    </motion.div>
  );
}

const cardSlot =
  "rounded-md outline outline-1 outline-offset-2 outline-transparent transition-[outline-color] duration-(--sheen-duration-base)";

const face =
  "sheen-fill absolute inset-0 overflow-hidden rounded-sheen-lg p-5 text-sheen-accent-fg [background-image:var(--sheen-accent-fill)] shadow-[0_18px_40px_-16px_color-mix(in_oklch,var(--sheen-accent)_75%,transparent)] [backface-visibility:hidden]";

/**
 * The live card above the fields. With `flip` it turns over to show the back (the security code strip) while the
 * CVC field has focus; with reduced motion the two faces cross-fade instead. Decorative (`aria-hidden`): the
 * fields carry all the information.
 *
 * @internal
 */
export function CardPreview({
  number,
  name,
  expiry,
  cvc,
  focused,
  placeholderName,
  cvcLabel,
  flip,
  reduced,
}: {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  focused: CardPreviewField | null;
  placeholderName: string;
  cvcLabel: string;
  flip: boolean;
  reduced: boolean;
}) {
  const shown = digits(number)
    .padEnd(16, "•")
    .replace(/(.{4})(?=.)/g, "$1 ");
  const on = (key: CardPreviewField) => focused === key && "outline-sheen-accent-fg/60";
  const back = flip && focused === "cvc";
  const turn = (to: number) => (reduced ? {} : { rotateY: to });
  const fade = (visible: boolean) => (reduced ? { opacity: visible ? 1 : 0 } : {});
  const t = reduced ? { duration: duration.fast } : spring.gentle;

  return (
    <div
      aria-hidden
      data-slot="card-preview"
      data-side={back ? "back" : "front"}
      className="@container relative aspect-[1.586] max-h-52 w-full [perspective:900px]"
    >
      <motion.div
        initial={false}
        animate={turn(back ? 180 : 0)}
        transition={t}
        className="absolute inset-0 [transform-style:preserve-3d]"
      >
        <motion.div initial={false} animate={fade(!back)} transition={t} className={face}>
          <div className="absolute -top-16 -end-10 size-48 rounded-full bg-sheen-accent-fg/15 blur-2xl" />
          <div className="absolute -bottom-20 -start-12 size-44 rounded-full bg-[color-mix(in_oklch,var(--sheen-accent-2)_24%,transparent)] blur-2xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-7 w-10 rounded-md bg-[linear-gradient(135deg,var(--sheen-amber-400),color-mix(in_oklch,var(--sheen-amber-400)_70%,black))]" />
              <span className="text-sm font-semibold tracking-widest">SHEEN</span>
            </div>
            <p
              className={cn(
                // Sized to the card's own width (container units), so the 19 characters never wrap or clip.
                "w-fit font-sheen-mono text-[clamp(0.75rem,7cqw,1.125rem)] tracking-[0.1em] whitespace-nowrap tabular-nums",
                cardSlot,
                on("number"),
              )}
            >
              {shown}
            </p>
            <div className="flex justify-between gap-4 text-xs uppercase">
              <span className={cn("min-w-0 truncate", cardSlot, on("name"))}>{name || placeholderName}</span>
              <span className={cn("tabular-nums", cardSlot, on("expiry"))}>{expiry || "MM/YY"}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ ...turn(180), ...fade(back) }}
          transition={t}
          // Hidden once its turn has finished while the front shows (the delay outlasts the flip), so the CVC chip is never
          // presented (or measured) as text under the front face.
          className={cn(
            face,
            "px-0 py-5",
            back ? "visible" : "invisible [transition:visibility_0s_linear_var(--sheen-duration-slower)]",
          )}
        >
          <div className="absolute -bottom-20 -start-12 size-44 rounded-full bg-sheen-accent-fg/10 blur-2xl" />
          <div className="relative flex h-full flex-col gap-4">
            <div className="mt-2 h-9 w-full bg-[var(--sheen-ink-950)]" />
            <div className="mx-5 flex items-center justify-end gap-3 text-xs uppercase">
              <span className="font-semibold tracking-widest">{cvcLabel}</span>
              <span className="min-w-16 rounded-sm bg-[var(--sheen-ink-0)] px-3 py-1.5 text-end font-sheen-mono tracking-[0.2em] text-[var(--sheen-ink-900)] tabular-nums">
                {cvc.replace(/\d/g, "•").padEnd(3, "•")}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
