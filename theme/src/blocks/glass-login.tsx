"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type SubmitEvent } from "react";

import { cn } from "../lib/cn";
import { Button } from "../components/button/button";
import { GlassCard } from "../components/glass-card/glass-card";
import { Input } from "../components/input/input";
import { AlertIcon, EyeIcon, GithubIcon, GoogleIcon, LockIcon, MailIcon } from "./icons";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../lib/heading";

/** What `GlassLogin`'s `onSubmit` receives: the trimmed email and the password as typed. */
export type GlassLoginValues = { email: string; password: string };

/** Every user-facing string, so the block can be translated. */
export type GlassLoginLabels = {
  /** The email field's label. */
  email: string;
  /** The email field's placeholder. */
  emailPlaceholder: string;
  /** The password field's label. */
  password: string;
  /** Accessible name of the reveal button while the password is hidden. */
  showPassword: string;
  /** Accessible name of the reveal button while the password is shown. */
  hidePassword: string;
  /** The "Forgot password?" link text. */
  forgot: string;
  /** The submit button text. */
  submit: string;
  /** The text between the form and the social buttons. */
  divider: string;
  /** The GitHub button text. */
  github: string;
  /** The Google button text. */
  google: string;
  /** The sentence before the sign-up link ("New here?"). */
  signUpPrompt: string;
  /** The sign-up link text. */
  signUp: string;
  /** Error for a malformed email. */
  invalidEmail: string;
  /** Receives the minimum length. */
  shortPassword: (min: number) => string;
  /** Shown when `onSubmit` throws an error without a message. */
  genericError: string;
};

/** Props of `GlassLogin`. */
export type GlassLoginProps = {
  /** Sets the heading (`ReactNode`, default "Welcome back"). */
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
  /** Overrides for the built-in English strings (`Partial<GlassLoginLabels>`). */
  labels?: Partial<GlassLoginLabels>;
  /** Level of the title heading (`1` to `6`, default `2`); set it to fit the page's outline. `"none"` renders a paragraph with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** Adds extra classes to the outer glass card (`string`). */
  className?: string;
};

/** The English {@link GlassLoginLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultGlassLoginLabels: GlassLoginLabels = {
  email: "Email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  forgot: "Forgot password?",
  submit: "Sign in",
  divider: "or continue with",
  github: "GitHub",
  google: "Google",
  signUpPrompt: "New here?",
  signUp: "Create an account",
  invalidEmail: "Enter a valid email address.",
  shortPassword: (min) => `Password must be at least ${min} characters.`,
  genericError: "Something went wrong. Try again.",
};

type Errors = { email?: string; password?: string; form?: string };

const link =
  "inline-flex items-center rounded-sheen-sm font-medium text-sheen-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11";

/**
 * A sign-in card: email and password with show/hide, inline validation, a loading state, optional
 * GitHub and Google buttons and a sign-up link. Use it as the whole sign-in page or inside a modal.
 *
 * Props (see `GlassLoginProps`): `title` and `subtitle` (`ReactNode`), `onSubmit(values)` (may
 * return a promise), `onSocial(provider)`, `forgotHref` (`"#"`), `signUpHref` (`"#"`, `null`
 * hides it), `minPasswordLength` (`8`), `labels` (`Partial<GlassLoginLabels>`), `headingLevel` (`2`), `className`.
 *
 * Keyboard: Tab walks email, password, the reveal button, the forgot link, submit, the social
 * buttons and the sign-up link; Enter submits. A failed check moves focus to the first invalid
 * field once its message is linked (`aria-describedby`), and the message is announced.
 * Accessibility: a real `<form>` with `noValidate` and visible, linked error text; the reveal
 * button has a state-aware name; targets are 44 px on touch devices.
 * Glass and motion: one level-3 glass card (a single backdrop blur). The button's loading state
 * and the hover and focus fades use the shared motion tokens; reduced motion and reduced
 * transparency are honoured.
 *
 * @example
 * ```tsx
 * import { GlassLogin } from "@sheenui/theme";
 *
 * const signIn = (email: string, password: string) => fetch("/api/sign-in", { method: "POST", body: JSON.stringify({ email, password }) });
 * const startOAuth = (provider: string) => {
 *   window.location.href = `/auth/${provider}`;
 * };
 *
 * export function Example() {
 *   return (
 *     <GlassLogin
 *       onSubmit={async ({ email, password }) => {
 *         await signIn(email, password); // throw to show the error under the form
 *       }}
 *       onSocial={(provider) => startOAuth(provider)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/glass-login
 */
export function GlassLogin({
  title = "Welcome back",
  subtitle = "Sign in to continue to your workspace.",
  onSubmit,
  onSocial,
  forgotHref = "#",
  signUpHref = "#",
  minPasswordLength = 8,
  labels,
  headingLevel = 2,
  className,
}: GlassLoginProps) {
  const Title = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const L = { ...defaultGlassLoginLabels, ...labels };
  const titleId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef<HTMLInputElement | null>(null);

  // Focus the first invalid field one frame after the errors render, so its message is
  // already linked (aria-describedby) when the screen reader announces the field.
  useEffect(() => {
    const el = pendingFocus.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      pendingFocus.current = null;
      el.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [errors]);

  const checkEmail = (value: string) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? undefined : L.invalidEmail);
  const checkPassword = (value: string) =>
    value.length >= minPasswordLength ? undefined : L.shortPassword(minPasswordLength);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (loading) return;
    const next: Errors = { email: checkEmail(email), password: checkPassword(password) };
    setErrors(next);
    if (next.email || next.password) {
      pendingFocus.current = next.email ? emailRef.current : passwordRef.current;
      return;
    }

    setLoading(true);
    try {
      await onSubmit?.({ email: email.trim(), password });
    } catch (err) {
      setErrors({ form: err instanceof Error && err.message ? err.message : L.genericError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard level={3} className={cn("w-full max-w-sm p-6 sm:p-8", className)}>
      <div className="mb-7 flex flex-col items-center gap-3 text-center">
        <div className="sheen-fill flex size-12 items-center justify-center rounded-sheen-md text-sheen-accent-fg shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--sheen-accent)_80%,transparent)] [background-image:var(--sheen-accent-fill)]">
          <LockIcon className="size-5" />
        </div>
        <div>
          <Title id={titleId} className="text-xl font-semibold tracking-tight">
            {title}
          </Title>
          <p className="mt-1 text-sm text-sheen-fg-muted">{subtitle}</p>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          ref={emailRef}
          label={L.email}
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-required
          placeholder={L.emailPlaceholder}
          leading={<MailIcon />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Clear the message as soon as the value is fixed.
            if (errors.email) setErrors((x) => ({ ...x, email: checkEmail(e.target.value) }));
          }}
          onBlur={() => {
            if (email) setErrors((x) => ({ ...x, email: checkEmail(email) }));
          }}
          error={errors.email}
        />
        <Input
          ref={passwordRef}
          label={L.password}
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          aria-required
          placeholder="••••••••"
          leading={<LockIcon />}
          trailing={
            <button
              type="button"
              aria-label={showPassword ? L.hidePassword : L.showPassword}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}
              className="-me-1.5 flex size-8 items-center justify-center rounded-sheen-sm transition-colors duration-(--sheen-duration-fast) hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus any-pointer-coarse:-me-3 any-pointer-coarse:size-11"
            >
              <EyeIcon off={showPassword} />
            </button>
          }
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((x) => ({ ...x, password: checkPassword(e.target.value) }));
          }}
          error={errors.password}
        />

        <div className="-mt-1 flex justify-end">
          <a href={forgotHref} className={cn(link, "text-sm")}>
            {L.forgot}
          </a>
        </div>

        {errors.form && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-sheen-sm bg-sheen-danger-soft px-3 py-2 text-sm text-sheen-danger-text"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {L.submit}
        </Button>
      </form>

      {onSocial && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-sheen-fg-muted">
            <span aria-hidden className="h-px flex-1 bg-sheen-border" />
            {L.divider}
            <span aria-hidden className="h-px flex-1 bg-sheen-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="glass"
              className="any-pointer-coarse:h-11"
              leading={<GithubIcon />}
              onClick={() => onSocial("github")}
            >
              {L.github}
            </Button>
            <Button
              variant="glass"
              className="any-pointer-coarse:h-11"
              leading={<GoogleIcon />}
              onClick={() => onSocial("google")}
            >
              {L.google}
            </Button>
          </div>
        </>
      )}

      {signUpHref !== null && (
        <p className="mt-6 text-center text-sm text-sheen-fg-muted">
          {L.signUpPrompt}{" "}
          <a href={signUpHref} className={link}>
            {L.signUp}
          </a>
        </p>
      )}
    </GlassCard>
  );
}
