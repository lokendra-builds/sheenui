import type { ComponentProps } from "react";

/**
 * Shared 24×24 stroke icons for components that need a small check, close or alert mark. They inherit
 * `currentColor`, are hidden from assistive tech (`aria-hidden`), and take every `<svg>` prop: `className` for the size
 * (for example `size-4`) and `strokeWidth` for the weight. Components that need a differently drawn glyph keep their own.
 */
type IconProps = ComponentProps<"svg">;

function Svg({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      data-slot="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

/**
 * A check mark, for selected states and success. Sized with `className`; `strokeWidth` defaults to 3.
 *
 * Accessibility: Decorative (`aria-hidden`): put the meaning in nearby text or an `aria-label` on the control.
 *
 * @example
 * ```tsx
 * import { CheckIcon } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CheckIcon className="size-4 text-sheen-success-text" />
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function CheckIcon({ strokeWidth = 3, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

/**
 * A cross, for close and remove buttons. Sized with `className`; `strokeWidth` defaults to 2.4.
 *
 * Accessibility: Decorative (`aria-hidden`): the button needs its own accessible name.
 *
 * @example
 * ```tsx
 * import { CloseIcon } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <button type="button" aria-label="Close"><CloseIcon className="size-4" /></button>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function CloseIcon({ strokeWidth = 2.4, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

/**
 * An exclamation in a circle, for errors and warnings. Sized with `className`; `strokeWidth` defaults to 2.
 *
 * Accessibility: Decorative (`aria-hidden`): state the problem in text as well.
 *
 * @example
 * ```tsx
 * import { AlertIcon } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <AlertIcon className="size-4 text-sheen-danger-text" />
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function AlertIcon({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.2v.3" />
    </Svg>
  );
}

/**
 * Accessibility: Decorative (`aria-hidden`): put the meaning in nearby text.
 *
 * @internal A warning triangle with an exclamation mark, for the warning tone. Sized with `className`; `strokeWidth` defaults to 2.
 *
 * @example
 * ```tsx
 * import { WarningIcon } from "../status-icons/icons";
 *
 * export function Example() {
 *   return <WarningIcon className="size-5" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function WarningIcon({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <path d="M12 4 3 19.5h18L12 4Z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </Svg>
  );
}

/**
 * Accessibility: Decorative (`aria-hidden`): put the meaning in nearby text.
 *
 * @internal A circle with an "i", for the info tone. Sized with `className`; `strokeWidth` defaults to 2.
 *
 * @example
 * ```tsx
 * import { InfoIcon } from "../status-icons/icons";
 *
 * export function Example() {
 *   return <InfoIcon className="size-5" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function InfoIcon({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.2M12 7.8v.3" />
    </Svg>
  );
}

/**
 * Accessibility: Decorative (`aria-hidden`): the trigger needs its own accessible name.
 *
 * @internal A downward chevron, for disclosure and menu triggers. Sized with `className`; `strokeWidth` defaults to 2.
 *
 * @example
 * ```tsx
 * import { ChevronDownIcon } from "../status-icons/icons";
 *
 * export function Example() {
 *   return <ChevronDownIcon className="size-4" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function ChevronDownIcon({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

/**
 * Accessibility: Decorative (`aria-hidden`): the button needs its own accessible name.
 *
 * @internal Two overlapping sheets, for copy buttons. Sized with `className`; `strokeWidth` defaults to 2.
 *
 * @example
 * ```tsx
 * import { CopyIcon } from "../status-icons/icons";
 *
 * export function Example() {
 *   return <CopyIcon className="size-4" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function CopyIcon({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
    </Svg>
  );
}

/**
 * Accessibility: Decorative (`aria-hidden`): the button needs its own accessible name.
 *
 * @internal A bin, for delete and remove actions. Sized with `className`; `strokeWidth` defaults to 2.
 *
 * @example
 * ```tsx
 * import { TrashIcon } from "../status-icons/icons";
 *
 * export function Example() {
 *   return <TrashIcon className="size-4" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function TrashIcon({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...props}>
      <path d="M4.5 7h15M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4.5h6V7" />
    </Svg>
  );
}

/** Props of {@link CheckIcon}. A tick: for success states, completed steps and feature-list rows. */
export type CheckIconProps = ComponentProps<typeof CheckIcon>;

/** Props of {@link CloseIcon}. A cross, for close and remove buttons. */
export type CloseIconProps = ComponentProps<typeof CloseIcon>;

/** Props of {@link AlertIcon}. A circled exclamation mark: for inline error and warning messages. */
export type AlertIconProps = ComponentProps<typeof AlertIcon>;
