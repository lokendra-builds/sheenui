"use client";

import { useEffect, useId, useRef, useState, type SubmitEvent, type ReactNode, type RefObject } from "react";

import { cn } from "../../lib/cn";
import type { HeadingTag } from "../../lib/heading";
import { Button } from "../../components/button/button";
import { Checkbox } from "../../components/checkbox/checkbox";
import { Input } from "../../components/input/input";
import { AlertIcon, CheckIcon, EyeIcon, GithubIcon, GoogleIcon, LockIcon, MailIcon } from "../icons";
import { type AuthSplitValues, type AuthSplitLabels, type AuthSplitProps } from "./model";
import { passwordStrength, UserIcon, type Strength, strengthTone, type Errors, link } from "./utils";

/* ---------- Form ---------- */

/** The sign-up form: fields, validation, strength meter and submit. @internal */
export function SignUpForm({
  Heading,
  title,
  subtitle,
  values,
  setValues,
  emailRef,
  L,
  onSubmit,
  onSocial,
  termsHref,
  privacyHref,
  signInHref,
  minPasswordLength,
  focusEmailOnMount,
  onDone,
}: {
  Heading: HeadingTag;
  title: ReactNode;
  subtitle: ReactNode;
  values: AuthSplitValues & { terms: boolean };
  setValues: (fn: (v: AuthSplitValues & { terms: boolean }) => AuthSplitValues & { terms: boolean }) => void;
  emailRef: RefObject<HTMLInputElement | null>;
  L: AuthSplitLabels;
  onSubmit?: AuthSplitProps["onSubmit"];
  onSocial?: AuthSplitProps["onSocial"];
  termsHref: string;
  privacyHref: string;
  signInHref: string | null;
  minPasswordLength: number;
  focusEmailOnMount: boolean;
  onDone: (email: string) => void;
}) {
  const titleId = useId();
  const meterId = useId();
  const rulesId = useId();
  const termsErrorId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<HTMLElement | null>(null);

  const strength = passwordStrength(values.password, minPasswordLength);

  // The card mounts after the success card has left (AnimatePresence "wait"), so focus from here.
  useEffect(() => {
    if (focusEmailOnMount) emailRef.current?.focus();
  }, [focusEmailOnMount, emailRef]);

  // Focus the first invalid field one frame after the errors render (messages are linked by then).
  useEffect(() => {
    const el = pendingFocus.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      pendingFocus.current = null;
      el.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [errors]);

  const check = {
    name: (v: string) => (v.trim() ? undefined : L.nameRequired),
    email: (v: string) => (/^\S+@\S+\.\S+$/.test(v.trim()) ? undefined : L.invalidEmail),
    password: (v: string) => {
      const s = passwordStrength(v, minPasswordLength);
      return s.rules[0]?.met && s.score >= 2 && !s.common ? undefined : L.weakPassword;
    },
    terms: (v: boolean) => (v ? undefined : L.termsRequired),
  };

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a message as soon as the value is fixed.
    if (key in errors && errors[key as keyof Errors]) {
      const fn = check[key] as (v: unknown) => string | undefined;
      setErrors((e) => ({ ...e, [key]: fn(value), form: undefined }));
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (loading) return;
    const next: Errors = {
      name: check.name(values.name),
      email: check.email(values.email),
      password: check.password(values.password),
      terms: check.terms(values.terms),
    };
    setErrors(next);
    const first = next.name
      ? nameRef.current
      : next.email
        ? emailRef.current
        : next.password
          ? passwordRef.current
          : next.terms
            ? termsRef.current
            : null;
    if (first) {
      pendingFocus.current = first;
      return;
    }
    setLoading(true);
    try {
      await onSubmit?.({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      onDone(values.email.trim());
    } catch (err) {
      setErrors({ form: err instanceof Error && err.message ? err.message : L.genericError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-1.5">
        <Heading id={titleId} className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </Heading>
        <p className="text-sm text-sheen-fg-muted">{subtitle}</p>
      </div>

      {onSocial && (
        <>
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
          <div className="my-5 flex items-center gap-3 text-xs text-sheen-fg-muted">
            <span aria-hidden className="h-px flex-1 bg-sheen-border" />
            {L.divider}
            <span aria-hidden className="h-px flex-1 bg-sheen-border" />
          </div>
        </>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          ref={nameRef}
          label={L.name}
          name="name"
          autoComplete="name"
          aria-required
          placeholder={L.namePlaceholder}
          leading={<UserIcon />}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
        />
        <Input
          ref={emailRef}
          label={L.email}
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-required
          placeholder={L.emailPlaceholder}
          leading={<MailIcon />}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => {
            if (values.email) setErrors((x) => ({ ...x, email: check.email(values.email) }));
          }}
          error={errors.email}
        />
        <div className="flex flex-col gap-2.5">
          <Input
            ref={passwordRef}
            label={L.password}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-required
            aria-describedby={`${meterId} ${rulesId}`}
            placeholder={L.passwordPlaceholder}
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
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
          />
          <StrengthMeter id={meterId} rulesId={rulesId} strength={strength} minLength={minPasswordLength} L={L} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Checkbox
            ref={termsRef}
            name="terms"
            checked={values.terms}
            onCheckedChange={(checked) => update("terms", checked)}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? termsErrorId : undefined}
            label={
              <span className="font-normal text-sheen-fg-muted">
                {L.terms({
                  terms: (
                    <a href={termsHref} className={link}>
                      {L.termsLink}
                    </a>
                  ),
                  privacy: (
                    <a href={privacyHref} className={link}>
                      {L.privacyLink}
                    </a>
                  ),
                })}
              </span>
            }
          />
          {errors.terms && (
            <p id={termsErrorId} className="ps-8 text-xs font-medium text-sheen-danger-text">
              {errors.terms}
            </p>
          )}
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

        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
          {L.submit}
        </Button>
      </form>

      {signInHref !== null && (
        <p className="mt-6 text-center text-sm text-sheen-fg-muted">
          {L.signInPrompt}{" "}
          <a href={signInHref} className={cn(link, "inline-flex items-center any-pointer-coarse:min-h-11")}>
            {L.signIn}
          </a>
        </p>
      )}
    </>
  );
}

/** The password strength bars with the rule checklist. @internal */
export function StrengthMeter({
  id,
  rulesId,
  strength,
  minLength,
  L,
}: {
  id: string;
  rulesId: string;
  strength: Strength;
  minLength: number;
  L: AuthSplitLabels;
}) {
  const { score, rules, common } = strength;
  const level = L.strengthLevel(score);
  const tone = score > 0 ? strengthTone[score as 1 | 2 | 3 | 4] : null;
  const ruleLabels: Record<string, string> = {
    length: L.ruleLength(minLength),
    case: L.ruleCase,
    number: L.ruleNumber,
    symbol: L.ruleSymbol,
  };

  // Announce the level once typing pauses, not on every keystroke.
  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    if (score === 0) return;
    const timer = window.setTimeout(() => setSpoken(L.announceStrength(level)), 700);
    return () => window.clearTimeout(timer);
  }, [score, level, L]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div
          id={id}
          role="meter"
          aria-label={L.strength}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={score}
          aria-valuetext={level || "—"}
          className="grid flex-1 grid-cols-4 gap-1.5"
        >
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className="relative h-1.5 overflow-hidden rounded-full bg-sheen-border forced-colors:border forced-colors:border-[CanvasText]"
            >
              <span
                className={cn(
                  "absolute inset-0 origin-left rounded-full rtl:origin-right",
                  "transition-[scale,background-color] duration-(--sheen-duration-snappy) ease-sheen-snappy",
                  tone?.bar,
                  score >= segment ? "scale-x-100" : "scale-x-0",
                  "forced-colors:bg-[Highlight]",
                )}
                style={{ transitionDelay: `${(segment - 1) * 40}ms` }}
              />
            </span>
          ))}
        </div>
        <span
          aria-hidden
          className={cn(
            "min-w-14 shrink-0 text-end text-xs font-semibold whitespace-nowrap",
            tone?.text ?? "text-sheen-fg-muted",
          )}
        >
          {level || L.strength}
        </span>
      </div>
      <ul id={rulesId} className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 transition-colors duration-(--sheen-duration-base)",
              rule.met ? "text-sheen-success-text" : "text-sheen-fg-muted",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "relative flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-(--sheen-duration-base)",
                rule.met ? "border-transparent bg-sheen-success-soft" : "border-sheen-control-border",
              )}
            >
              <CheckIcon
                className={cn(
                  "size-3 transition-[opacity,scale] duration-(--sheen-duration-snappy) ease-sheen-snappy",
                  rule.met ? "opacity-100" : "opacity-0 motion-ok:scale-50",
                )}
                strokeWidth="2.6"
              />
            </span>
            <span>
              {ruleLabels[rule.id]}
              <span className="sr-only">: {rule.met ? L.ruleMet : L.ruleUnmet}</span>
            </span>
          </li>
        ))}
      </ul>
      {common && <p className="text-xs font-medium text-sheen-warning-text">{L.tooCommon}</p>}
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </div>
  );
}
