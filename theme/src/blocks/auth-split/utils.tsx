"use client";

import { type ComponentProps } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { GlassCard } from "../../components/glass-card/glass-card";

/* ---------- Icons ---------- */

/** The shared 24px stroke SVG frame of the auth icons. @internal */
export function Icon({ children, className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

/** The user icon of the name field. @internal */
export const UserIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c.8-4 4-6 8-6s7.2 2 8 6" />
  </Icon>
);
/** The star icon of a testimonial rating. @internal */
export const StarIcon = (p: ComponentProps<"svg">) => (
  <svg aria-hidden focusable="false" viewBox="0 0 24 24" fill="currentColor" className="size-4" {...p}>
    <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" />
  </svg>
);
/** The quotation-mark icon of a testimonial. @internal */
export const QuoteIcon = (p: ComponentProps<"svg">) => (
  <svg aria-hidden focusable="false" viewBox="0 0 32 32" fill="currentColor" className="size-8" {...p}>
    <path d="M13 8c-4.4 1.6-7.5 5.4-7.5 10.3V24h8v-8H9.6c.4-2.6 2-4.6 4.4-5.6L13 8Zm13 0c-4.4 1.6-7.5 5.4-7.5 10.3V24h8v-8h-3.9c.4-2.6 2-4.6 4.4-5.6L26 8Z" />
  </svg>
);
/** The pause icon of the testimonial autoplay control. @internal */
export const PauseIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M9 6v12M15 6v12" />
  </Icon>
);
/** The play icon of the testimonial autoplay control. @internal */
export const PlayIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
  </Icon>
);
/** The send icon of the submit button. @internal */
export const SendIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4 17-6.5Z" />
  </Icon>
);

/* ---------- Password strength ---------- */

/** A tiny block-list: the passwords people try first. A real app should also check a breach API server-side. */
export const COMMON = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "iloveyou",
  "letmein1",
  "welcome1",
  "admin123",
  "abc12345",
  "11111111",
  "00000000",
  "sunshine",
  "football",
]);

/** The scored result of a password check: score, per-rule status and a common-password flag. @internal */
export type Strength = { score: 0 | 1 | 2 | 3 | 4; rules: { id: string; met: boolean }[]; common: boolean };

/** Scores a password from 1 (weak) to 4 (strong) by length (`minLength`, default 8), mixed case, a digit and a symbol; a very common password is capped at 1 and an empty one scores 0. Returns `{ score, rules, common }`. Pure, safe to call on the server.
 *
 * @see /blocks/signup-page
 */
export function passwordStrength(password: string, minLength = 8): Strength {
  const rules = [
    { id: "length", met: password.length >= minLength },
    { id: "case", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { id: "number", met: /\d/.test(password) },
    { id: "symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return { score: 0, rules, common: false };
  const common = COMMON.has(password.toLowerCase());
  let score = rules.filter((r) => r.met).length;
  // Short passwords stay weak whatever they contain; long ones earn a step.
  if (!rules[0]?.met) score = Math.min(score, 1);
  else if (password.length >= 16) score = Math.min(4, score + 1);
  if (common) score = 1;
  return { score: Math.max(1, score) as Strength["score"], rules, common };
}

/** The bar and text colour classes of each strength score. @internal */
export const strengthTone = {
  1: { bar: "bg-sheen-danger", text: "text-sheen-danger-text" },
  2: { bar: "bg-sheen-warning", text: "text-sheen-warning-text" },
  3: { bar: "bg-sheen-accent", text: "text-sheen-accent" },
  4: { bar: "bg-sheen-success", text: "text-sheen-success-text" },
} as const;

/* ---------- Component ---------- */

/** The per-field error messages of the sign-up form. @internal */
export type Errors = { name?: string; email?: string; password?: string; terms?: string; form?: string };

/** The class string of an inline accent link inside the form. @internal */
export const link =
  "rounded-sheen-sm font-medium text-sheen-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus";

/** GlassCard that can animate: the card swaps by animating the glass element itself, never a wrapper. */
export const MotionGlassCard = motion.create(GlassCard);

/**
 * Turns the blur of glass nested inside `root` off (true) or back on (false). A fading
 * element must never contain a backdrop-filter, so this runs while the card around them fades.
 */
export function settleNestedGlass(root: HTMLElement | null, on: boolean) {
  root?.querySelectorAll<HTMLElement>(".glass-1, .glass-2, .glass-3").forEach((el) => {
    if (on) {
      el.style.setProperty("backdrop-filter", "none");
      el.style.setProperty("-webkit-backdrop-filter", "none");
    } else {
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
    }
  });
}
