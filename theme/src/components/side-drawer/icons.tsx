import type { ReactNode, SVGProps } from "react";

import { ChevronDownIcon as SharedChevronDownIcon, CloseIcon as SharedCloseIcon } from "../status-icons/icons";

/** 24px stroke icons used by the side drawer parts (decorative: always aria-hidden). */
type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

function Icon({ children, strokeWidth = 2, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/**
 * A 24px stroke "x" icon.
 * Used by the side drawer parts; size it with a class such as `size-4`, it uses `currentColor`.
 * Accepts every `svg` prop except `children`.
 *
 * Keyboard: none. Accessibility: decorative, always `aria-hidden`; put the meaning in the surrounding
 * button's `aria-label` or text. Glass and motion: static, none.
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
 * @see /overlays/side-drawer
 */
export function CloseIcon(props: IconProps) {
  return <SharedCloseIcon strokeWidth={2} {...props} />;
}

/**
 * A 24px stroke check mark inside a circle.
 * Used by the side drawer parts; size it with a class such as `size-4`, it uses `currentColor`.
 * Accepts every `svg` prop except `children`.
 *
 * Keyboard: none. Accessibility: decorative, always `aria-hidden`; put the meaning in the surrounding
 * button's `aria-label` or text. Glass and motion: static, none.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { CheckCircleIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <button type="button" aria-label="Done"><CheckCircleIcon className="size-4" /></button>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Icon>
  );
}

/**
 * A 24px stroke chevron pointing up.
 * Used by the side drawer parts; size it with a class such as `size-4`, it uses `currentColor`.
 * Accepts every `svg` prop except `children`.
 *
 * Keyboard: none. Accessibility: decorative, always `aria-hidden`; put the meaning in the surrounding
 * button's `aria-label` or text. Glass and motion: static, none.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ChevronUpIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <button type="button" aria-label="Collapse"><ChevronUpIcon className="size-4" /></button>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function ChevronUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 15 6-6 6 6" />
    </Icon>
  );
}

/**
 * A 24px stroke chevron pointing down.
 * Used by the side drawer parts; size it with a class such as `size-4`, it uses `currentColor`.
 * Accepts every `svg` prop except `children`.
 *
 * Keyboard: none. Accessibility: decorative, always `aria-hidden`; put the meaning in the surrounding
 * button's `aria-label` or text. Glass and motion: static, none.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ChevronDownIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <button type="button" aria-label="Expand"><ChevronDownIcon className="size-4" /></button>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function ChevronDownIcon(props: IconProps) {
  return <SharedChevronDownIcon {...props} />;
}

/**
 * A 24px stroke pencil (edit) icon.
 * Used by the side drawer parts; size it with a class such as `size-4`, it uses `currentColor`.
 * Accepts every `svg` prop except `children`.
 *
 * Keyboard: none. Accessibility: decorative, always `aria-hidden`; put the meaning in the surrounding
 * button's `aria-label` or text. Glass and motion: static, none.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { PencilIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <button type="button" aria-label="Edit"><PencilIcon className="size-4" /></button>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" />
      <path d="m13.5 8.5 3 3" />
    </Icon>
  );
}

/**
 * A 24px stroke "more" (three dots) icon.
 * Used by the side drawer parts; size it with a class such as `size-4`, it uses `currentColor`.
 * Accepts every `svg` prop except `children`.
 *
 * Keyboard: none. Accessibility: decorative, always `aria-hidden`; put the meaning in the surrounding
 * button's `aria-label` or text. Glass and motion: static, none.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { MoreIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <button type="button" aria-label="More actions"><MoreIcon className="size-4" /></button>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function MoreIcon(props: IconProps) {
  return (
    <Icon strokeWidth={3} {...props}>
      <path d="M5.5 12h.01M12 12h.01M18.5 12h.01" />
    </Icon>
  );
}

/**
 * A 24px stroke inbox icon.
 * Used by the side drawer parts; size it with a class such as `size-4`, it uses `currentColor`.
 * Accepts every `svg` prop except `children`.
 *
 * Keyboard: none. Accessibility: decorative, always `aria-hidden`; put the meaning in the surrounding
 * button's `aria-label` or text. Glass and motion: static, none.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { InboxIcon } from "./icons";
 *
 * export function Example() {
 *   return (
 *     <button type="button" aria-label="Inbox"><InboxIcon className="size-4" /></button>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function InboxIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 13h5l1.5 2.5h5L16 13h5" />
      <path d="M5.5 5.5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
    </Icon>
  );
}
