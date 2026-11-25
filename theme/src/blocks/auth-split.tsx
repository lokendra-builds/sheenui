"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";

import { cn } from "../lib/cn";
import { HEADING_TAGS, headingBelow } from "../lib/heading";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { duration, ease, spring } from "../motion/tokens";
import { SheenLogo } from "../components/logo/logo";

import {
  type AuthSplitValues,
  defaultAuthSplitLabels,
  defaultAuthSplitTestimonials,
  type AuthSplitProps,
} from "./auth-split/model";
import { MotionGlassCard, settleNestedGlass } from "./auth-split/utils";
import { SignUpForm } from "./auth-split/form";
import { SuccessView, BrandPanel } from "./auth-split/brand";

export {
  type AuthSplitValues,
  type AuthSplitTestimonial,
  type AuthSplitStat,
  type AuthSplitLabels,
  defaultAuthSplitLabels,
  defaultAuthSplitTestimonials,
  type AuthSplitProps,
} from "./auth-split/model";
export { passwordStrength } from "./auth-split/utils";

/**
 * Auth split: a split-screen sign-up page.
 *
 *   <AuthSplit onSubmit={(values) => api.signUp(values)} onSocial={(p) => signInWith(p)} />
 *
 * Left, a dark brand panel: a slow aurora of colour, a light that follows the pointer, the
 * headline, a feature list, a few numbers and rotating testimonials (with pause and dots).
 * Right, a glass sign-up card in the GlassLogin style: social buttons, name, email, a
 * password with a live strength meter and checklist, the terms checkbox, then a "check your
 * inbox" state once the account is created.
 *
 * The brand panel is a "dark island": it sets color-scheme: dark, so every SheenUI token
 * inside it (text, glass, accents) resolves to its dark value in either theme, and its text
 * keeps AA contrast on the dark ground.
 *
 * Responsive by its own width (container queries): from 56rem the two halves sit side by
 * side; narrower, the form comes first under a small logo and the brand panel follows it.
 *
 * Motion: the aurora drifts (transform only) and the card swaps by animating the glass card
 * itself; while it fades, the glass nested in it (inputs, social buttons) drops its blur, so no
 * backdrop-filter ever sits inside a fading element. Strength segments fill by scaleX.
 * Reduced motion: no drift, no auto-rotation of testimonials (use the dots), the card swaps at once.
 */

/** The glass card that swaps between the form and "check your inbox": it rises in, and leaves quicker without overshoot. */
function SwapCard({ reduced, className, children }: { reduced: boolean; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  // A card that mounts faded out (to animate in) has its whole subtree in place here: its nested
  // glass starts unblurred, before the first frame. One that mounts as is (first render) is left alone.
  const attach = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    if (node && Number.parseFloat(getComputedStyle(node).opacity) < 0.999) settleNestedGlass(node, true);
  }, []);
  return (
    <MotionGlassCard
      ref={attach}
      level={3}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: duration.fast } : spring.gentle }}
      exit={{
        opacity: 0,
        y: reduced ? 0 : -8,
        scale: reduced ? 1 : 0.99,
        transition: { duration: duration.exit, ease: ease.exit },
      }}
      onAnimationStart={() => settleNestedGlass(ref.current, true)}
      onAnimationComplete={() => {
        // Blur comes back only once the card is fully opaque (not at the end of its exit).
        const node = ref.current;
        if (node && Number.parseFloat(getComputedStyle(node).opacity) >= 0.999) settleNestedGlass(node, false);
      }}
      className={className}
    >
      {children}
    </MotionGlassCard>
  );
}

/**
 * Props (see `AuthSplitProps`): `title`, `subtitle`, `headline`, `description`, `features`, `stats`,
 * `testimonials` (`defaultAuthSplitTestimonials`), `rotateEvery` (`7` s), `brand`, `onSubmit(values)`,
 * `onSocial(provider)`, `onResend(email)`, `termsHref`, `privacyHref`, `signInHref` (`"#"`, `null` hides
 * it), `minPasswordLength` (`8`), `reverse` (`false`), `headingLevel` (`1`), `labels`, `className`.
 * Keyboard: Tab walks name, email, password (with its reveal button and strength checklist), the terms
 * checkbox, submit and the social buttons; Enter submits; a failed check moves focus to the first
 * invalid field. Testimonials rotate with a pause button and dots, both reachable by keyboard.
 * Accessibility: a real `<form>` with linked error text (`role="alert"` for a failed submit), a
 * `role="meter"` password-strength bar with the checklist as text, and polite status regions; the
 * success screen takes focus.
 * Glass and motion: the form is one glass card beside a dark brand panel whose aurora drifts (transform
 * only); the card swaps by animating the glass card itself. Reduced motion: no drift, no auto-rotation
 * (use the dots) and the card swaps at once.
 *
 * @example
 * ```tsx
 * import { AuthSplit } from "@sheenui/theme";
 *
 * const post = (url: string, body: unknown) => fetch(url, { method: "POST", body: JSON.stringify(body) });
 * const startOAuth = (provider: string) => {
 *   window.location.href = `/auth/${provider}`;
 * };
 *
 * export function Example() {
 *   return (
 *     <AuthSplit
 *       headline="Build faster with glass"
 *       onSubmit={async ({ name, email, password }) => {
 *         await post("/api/sign-up", { name, email, password }); // throw to show an error above the button
 *       }}
 *       onSocial={(provider) => startOAuth(provider)}
 *       onResend={async (email) => {
 *         await post("/api/resend", { email });
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/signup-page
 */
export function AuthSplit({
  title,
  subtitle,
  headline,
  description,
  features = [
    "Forty-plus glass components, copy-paste ready",
    "Motion that bows out for reduced-motion users",
    "AA contrast in light and dark, measured",
  ],
  stats = [
    { value: "12,400+", label: "teams building" },
    { value: "4.9/5", label: "average rating" },
    { value: "99.99%", label: "uptime last year" },
  ],
  testimonials = defaultAuthSplitTestimonials,
  rotateEvery = 7,
  brand,
  onSubmit,
  onSocial,
  onResend,
  termsHref = "#",
  privacyHref = "#",
  signInHref = "#",
  minPasswordLength = 8,
  reverse = false,
  headingLevel = 1,
  labels,
  className,
}: AuthSplitProps) {
  const L = { ...defaultAuthSplitLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const logo = brand ?? <SheenLogo px={30} />;

  const [done, setDone] = useState<string | null>(null);
  // Back from the success screen: the form opens with the email field focused.
  const [returning, setReturning] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<AuthSplitValues & { terms: boolean }>({
    name: "",
    email: "",
    password: "",
    terms: false,
  });

  const card = "w-full max-w-md rounded-sheen-xl p-6 @lg/auth:p-8";

  return (
    <div data-slot="auth-split" className={cn("@container/auth w-full min-w-0", className)}>
      <div
        className={cn(
          "grid min-h-[inherit] grid-cols-[minmax(0,1fr)] gap-3 p-2 @lg/auth:p-3",
          "@4xl/auth:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]",
          reverse && "@4xl/auth:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]",
        )}
      >
        {/* The form comes first in the DOM (reading and tab order); wide layouts move the panel to its left. */}
        <div
          className={cn(
            "flex min-w-0 flex-col items-center justify-center gap-6 px-2 py-6 @lg/auth:px-6 @4xl/auth:py-10",
            !reverse && "@4xl/auth:order-2",
          )}
        >
          {/* Narrow: the brand panel sits below the form, so the logo leads here. */}
          <div className="flex w-full max-w-md @4xl/auth:hidden">{logo}</div>

          <AnimatePresence mode="wait" initial={false}>
            {done === null ? (
              <SwapCard key="form" reduced={reduced} className={card}>
                <SignUpForm
                  Heading={Heading}
                  title={title ?? L.title}
                  subtitle={subtitle ?? L.subtitle}
                  values={values}
                  setValues={setValues}
                  emailRef={emailRef}
                  L={L}
                  onSubmit={onSubmit}
                  onSocial={onSocial}
                  termsHref={termsHref}
                  privacyHref={privacyHref}
                  signInHref={signInHref}
                  minPasswordLength={minPasswordLength}
                  focusEmailOnMount={returning}
                  onDone={setDone}
                />
              </SwapCard>
            ) : (
              <SwapCard key="done" reduced={reduced} className={card}>
                <SuccessView
                  Heading={Heading}
                  email={done}
                  L={L}
                  onResend={onResend}
                  onBack={() => {
                    setReturning(true);
                    setDone(null);
                  }}
                />
              </SwapCard>
            )}
          </AnimatePresence>
        </div>

        <BrandPanel
          logo={logo}
          headline={headline}
          description={description}
          features={features}
          stats={stats}
          testimonials={testimonials}
          rotateEvery={rotateEvery}
          headingLevel={headingLevel}
          L={L}
          className={reverse ? undefined : "@4xl/auth:order-1"}
        />
      </div>
    </div>
  );
}
