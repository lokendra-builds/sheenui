import type { ComponentProps } from "react";

import { AlertIcon as SharedAlertIcon, CheckIcon as SharedCheckIcon } from "../status-icons/icons";

/**
 * Small stroke icons used by the blocks. 24×24, inherit currentColor, decorative (aria-hidden).
 * No hooks or client APIs here, so this file stays usable from React Server Components.
 */

function Icon({ children, ...props }: ComponentProps<"svg">) {
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
      className="size-4"
      {...props}
    >
      {children}
    </svg>
  );
}

/**
 * An envelope: for email fields and mail rows. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { MailIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <MailIcon className="size-5" />
 *   );
 * }
 * ```
 *
 * @see /blocks/glass-login
 */
export const MailIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
);

/**
 * A padlock: for password fields and secure-payment hints. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { LockIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <LockIcon className="size-5" />
 *   );
 * }
 * ```
 *
 * @see /blocks/glass-login
 */
export const LockIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <rect x="4" y="10" width="16" height="11" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

/**
 * An eye (struck through with `off`): the show/hide password toggle glyph. Props: `off` (boolean, default `false`) draws the slash for the "hidden" state. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { EyeIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <EyeIcon off className="size-4" />
 *   );
 * }
 * ```
 *
 * @see /blocks/glass-login
 */
export const EyeIcon = ({ off, ...p }: ComponentProps<"svg"> & { off?: boolean }) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </Icon>
);

/**
 * A payment card: for card number fields and payment method rows. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { CardIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <CardIcon className="size-5" />
 *   );
 * }
 * ```
 *
 * @see /blocks/payment-checkout
 */
export const CardIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="M2.5 10h19M6.5 15h4" />
  </Icon>
);

/**
 * A tick: for success states, completed steps and feature-list rows. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @example
 * ```tsx
 * import { CheckIcon } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CheckIcon className="size-5 text-sheen-success" />
 *   );
 * }
 * ```
 *
 * @see /blocks/pricing
 */
export const CheckIcon = (p: ComponentProps<"svg">) => <SharedCheckIcon strokeWidth={1.8} className="size-4" {...p} />;

/**
 * A shield with a tick: for security and verified-account messaging. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ShieldIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <ShieldIcon className="size-5" />
 *   );
 * }
 * ```
 *
 * @see /blocks/otp-verification
 */
export const ShieldIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

/**
 * An upward chevron: for positive deltas and sort-ascending hints. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ArrowUpIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <ArrowUpIcon className="size-4" />
 *   );
 * }
 * ```
 *
 * @see /blocks/dashboard-stats
 */
export const ArrowUpIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M7 14l5-5 5 5" />
  </Icon>
);

/**
 * A downward chevron: for negative deltas and sort-descending hints. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ArrowDownIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <ArrowDownIcon className="size-4" />
 *   );
 * }
 * ```
 *
 * @see /blocks/dashboard-stats
 */
export const ArrowDownIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M7 10l5 5 5-5" />
  </Icon>
);

/**
 * A price tag: for discount codes and labelled amounts. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { TagIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <TagIcon className="size-4" />
 *   );
 * }
 * ```
 *
 * @see /blocks/payment-checkout
 */
export const TagIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M3.5 12.1V5a1.5 1.5 0 0 1 1.5-1.5h7.1a1.5 1.5 0 0 1 1.06.44l7.4 7.4a1.5 1.5 0 0 1 0 2.12l-7.1 7.1a1.5 1.5 0 0 1-2.12 0l-7.4-7.4a1.5 1.5 0 0 1-.44-1.06Z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </Icon>
);

/**
 * Two circling arrows: for retry and reload buttons. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { RefreshIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <RefreshIcon className="size-4" />
 *   );
 * }
 * ```
 *
 * @see /blocks/payment-checkout
 */
export const RefreshIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 0 0-14.5-4.6L4 8" />
    <path d="M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.5 4.6L20 16" />
    <path d="M20 20v-4h-4" />
  </Icon>
);

/**
 * A circled exclamation mark: for inline error and warning messages. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @example
 * ```tsx
 * import { AlertIcon } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <AlertIcon className="size-4 text-sheen-danger" />
 *   );
 * }
 * ```
 *
 * @see /blocks/glass-login
 */
export const AlertIcon = (p: ComponentProps<"svg">) => <SharedAlertIcon strokeWidth={1.8} className="size-4" {...p} />;

/**
 * The GitHub mark, filled with `currentColor`: for social sign-in buttons. A 24×24 stroke icon (1.8 px, rounded caps) that inherits `currentColor`.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; put the meaning in a visible label or the control's `aria-label`.
 * Glass and motion: none of its own; it is a plain SVG, so reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { GithubIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <GithubIcon className="size-5" />
 *   );
 * }
 * ```
 *
 * @see /blocks/signup-page
 */
export const GithubIcon = (p: ComponentProps<"svg">) => (
  <svg aria-hidden focusable="false" viewBox="0 0 24 24" fill="currentColor" className="size-4" {...p}>
    <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.81c0 .27.18.6.69.49A10.1 10.1 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
  </svg>
);

/**
 * Google's multi-colour "G" for social sign-in buttons. The fills are Google's brand colours, fixed artwork rather than theme tokens, so it looks the same in light and dark. A 24×24 icon.
 *
 * Props: every `<svg>` prop. `className` replaces the default `size-4`; `aria-hidden` is set, so it is decorative.
 * Accessibility: hidden from assistive technology and not focusable; the button around it needs its own text ("Continue with Google").
 * Glass and motion: none of its own; reduced motion and reduced transparency do not affect it.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { GoogleIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <button type="button"><GoogleIcon className="size-5" /> Continue with Google</button>
 *   );
 * }
 * ```
 *
 * @see /blocks/signup-page
 */
export const GoogleIcon = (p: ComponentProps<"svg">) => (
  <svg aria-hidden focusable="false" viewBox="0 0 24 24" className="size-4" {...p}>
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.7-.06-1.37-.18-2.02H12v3.82h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.32Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.41 13.91A6 6 0 0 1 6.1 12c0-.66.11-1.31.31-1.91V7.51H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.49l3.34-2.58Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.97c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.51l3.34 2.58C7.2 7.73 9.4 5.97 12 5.97Z"
    />
  </svg>
);
