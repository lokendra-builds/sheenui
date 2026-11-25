import type { HeadingLevelOption } from "../../lib/heading";
import { type ReactNode } from "react";

/* ---------- Types ---------- */

/** What the sign-up form submits: the person's name, email and password. */
export type AuthSplitValues = { name: string; email: string; password: string };

/** A rotating quote beside the form: the quote, who said it, an optional role and an optional 0 to 5 star rating. */
export type AuthSplitTestimonial = {
  quote: ReactNode;
  name: string;
  role?: string;
  /** 0–5 stars. */
  rating?: number;
};

/** A headline figure in the brand panel: a `value` ("4.9/5") and its `label` ("average rating"). */
export type AuthSplitStat = { value: ReactNode; label: ReactNode };

/** Every user-facing string (i18n). */
export type AuthSplitLabels = {
  title: string;
  subtitle: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  /** Heading of the meter. */
  strength: string;
  /** Word for a score of 1–4 (0 = nothing typed yet). */
  strengthLevel: (score: 0 | 1 | 2 | 3 | 4) => string;
  ruleLength: (min: number) => string;
  ruleCase: string;
  ruleNumber: string;
  ruleSymbol: string;
  /** Read after each checklist rule by screen readers. */
  ruleMet: string;
  ruleUnmet: string;
  tooCommon: string;
  termsLink: string;
  privacyLink: string;
  /** The checkbox label; receives the two links. */
  terms: (links: { terms: ReactNode; privacy: ReactNode }) => ReactNode;
  submit: string;
  divider: string;
  github: string;
  google: string;
  signInPrompt: string;
  signIn: string;
  nameRequired: string;
  invalidEmail: string;
  weakPassword: string;
  termsRequired: string;
  genericError: string;
  successTitle: string;
  successBody: (email: string) => ReactNode;
  resend: string;
  resent: string;
  changeEmail: string;
  testimonials: string;
  showTestimonial: (index: number, total: number) => string;
  pause: string;
  play: string;
  rating: (stars: number) => string;
  announceStrength: (level: string) => string;
};

/** The English `AuthSplitLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultAuthSplitLabels: AuthSplitLabels = {
  title: "Create your account",
  subtitle: "Free for 14 days. No credit card needed.",
  name: "Full name",
  namePlaceholder: "Ada Lovelace",
  email: "Work email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  passwordPlaceholder: "Create a password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  strength: "Strength",
  strengthLevel: (score) => ["", "Weak", "Fair", "Good", "Strong"][score] ?? "",
  ruleLength: (min) => `${min}+ characters`,
  ruleCase: "Upper & lowercase",
  ruleNumber: "A number",
  ruleSymbol: "A symbol",
  ruleMet: "done",
  ruleUnmet: "not yet",
  tooCommon: "That one is on every list of common passwords. Try a phrase only you would use.",
  termsLink: "Terms",
  privacyLink: "Privacy Policy",
  terms: ({ terms, privacy }) => (
    <>
      I agree to the {terms} and {privacy}.
    </>
  ),
  submit: "Create account",
  divider: "or sign up with email",
  github: "GitHub",
  google: "Google",
  signInPrompt: "Already have an account?",
  signIn: "Sign in",
  nameRequired: "Tell us what to call you.",
  invalidEmail: "Enter a valid email address.",
  weakPassword: "Choose a stronger password: Fair or better on the meter.",
  termsRequired: "Please accept the terms to continue.",
  genericError: "Something went wrong. Try again.",
  successTitle: "Check your inbox",
  successBody: (email) => (
    <>
      We sent a confirmation link to{" "}
      <span className="font-semibold text-sheen-fg [overflow-wrap:anywhere]">{email}</span>. It expires in 24 hours.
    </>
  ),
  resend: "Resend email",
  resent: "Sent again",
  changeEmail: "Use a different email",
  testimonials: "What people say",
  showTestimonial: (i, n) => `Show testimonial ${i} of ${n}`,
  pause: "Pause testimonials",
  play: "Play testimonials",
  rating: (n) => `Rated ${n} out of 5`,
  announceStrength: (level) => `Password strength: ${level}`,
};

/** Sample testimonials shown when `testimonials` is omitted; replace them with real customer quotes. */
export const defaultAuthSplitTestimonials: AuthSplitTestimonial[] = [
  {
    quote:
      "We rebuilt onboarding on it in a weekend. Sign-ups went up 31%, and nobody had to fight a single CSS variable.",
    name: "Maya Okafor",
    role: "Head of Product, Lumen Labs",
    rating: 5,
  },
  {
    quote:
      "Tasteful motion by default that bows out politely for reduced-motion users. Our accessibility audit passed first time.",
    name: "Daniel Brandt",
    role: "Staff Engineer, Northwind",
    rating: 5,
  },
  {
    quote: "Glass that stays readable in dark mode is harder than it looks. This feels like a design team shipped it.",
    name: "Sofia Marín",
    role: "Founder, Quietly",
    rating: 5,
  },
];

/** Props of `AuthSplit`. Everything is optional: with none it shows a sample sign-up. */
export type AuthSplitProps = {
  /** Sets the card heading (`ReactNode`, default from `labels`). */
  title?: ReactNode;
  /** The line under the card heading (`ReactNode`, default from `labels`). */
  subtitle?: ReactNode;
  /** Shows a big line on the brand panel. */
  headline?: ReactNode;
  /** Shows a paragraph under the headline (`ReactNode`). */
  description?: ReactNode;
  /** Short selling points with check marks. Pass [] to hide. */
  features?: ReactNode[];
  /** A few numbers under the features. Pass [] to hide. */
  stats?: AuthSplitStat[];
  /** One or more quotes; several rotate. Pass [] to hide. The default is sample content for demos and prototypes: pass your own in production. */
  testimonials?: AuthSplitTestimonial[];
  /** Seconds between testimonials; 0 turns auto-rotation off (`number`, default 7). */
  rotateEvery?: number;
  /** Logo on the panel and above the form on narrow screens. */
  brand?: ReactNode;
  /** Called with the values once they are valid. Return a promise for the loading state; throw to show an error. */
  onSubmit?: (values: AuthSplitValues) => void | Promise<void>;
  /** Shows the GitHub / Google buttons. */
  onSocial?: (provider: "github" | "google") => void;
  /** Runs when the user clicks "Resend email" on the success screen. */
  onResend?: (email: string) => void | Promise<void>;
  /** Target of the terms link (`string`, default `"#"`). */
  termsHref?: string;
  /** Target of the privacy link (`string`, default `"#"`). */
  privacyHref?: string;
  /** Hide the sign-in line with null. */
  signInHref?: string | null;
  /** Minimum password length, the first checklist rule (`number`, default 8). */
  minPasswordLength?: number;
  /** Put the form on the left and the brand panel on the right (`boolean`, default `false`). */
  reverse?: boolean;
  /** Level of the card heading (`1 | 2 | 3`, default 1). `"none"` renders it, and the brand panel's quote heading, as paragraphs with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the built-in English strings (`Partial<AuthSplitLabels>`). */
  labels?: Partial<AuthSplitLabels>;
  /** Adds extra classes to the outer element (`string`). */
  className?: string;
};
