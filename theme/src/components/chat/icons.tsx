import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import {
  CheckIcon as SharedCheckIcon,
  ChevronDownIcon as SharedChevronDownIcon,
  CloseIcon,
  CopyIcon as SharedCopyIcon,
} from "../status-icons/icons";

/* Chat icons: 24×24, currentColor, decorative (aria-hidden). Direction-sensitive ones flip in RTL. */

type IconProps = { className?: string };

/** The chat default for the shared glyphs: 16px, never shrunk by a flex row (the drawn-here icons below use the same). */
const chatIconProps = ({ className }: IconProps) => ({ className: cn("size-4 shrink-0", className) });

function Icon({
  children,
  className,
  fill,
  strokeWidth = 1.9,
}: IconProps & { children: ReactNode; fill?: boolean; strokeWidth?: number }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A magnifying glass, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { SearchIcon } from "./icons";
 *
 * export const Mark = () => <SearchIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A cross (close, remove), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { XIcon } from "./icons";
 *
 * export const Mark = () => <XIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const XIcon = (p: IconProps) => <CloseIcon strokeWidth={1.9} {...chatIconProps(p)} />;

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A pushpin (pinned conversation), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { PinIcon } from "./icons";
 *
 * export const Mark = () => <PinIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const PinIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 3.5h5l-.8 5.2 3.3 3.3v1.5H7v-1.5l3.3-3.3-.8-5.2Z" />
    <path d="M12 13.5v7" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A pushpin with a slash (unpin), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { PinOffIcon } from "./icons";
 *
 * export const Mark = () => <PinOffIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const PinOffIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 3.5h5l-.8 5.2 3.3 3.3v1.5H7v-1.5l3.3-3.3-.8-5.2Z" />
    <path d="M12 13.5v7M4 4l16 16" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A bell with a slash (muted), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { BellOffIcon } from "./icons";
 *
 * export const Mark = () => <BellOffIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const BellOffIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 19.5a2.6 2.6 0 0 0 5 0M6.3 6.6A6 6 0 0 0 6 8.5c0 5-2 6.5-2 6.5h11.5M18 13.6c-.1-1-.2-2.5-.2-5.1a5.8 5.8 0 0 0-8.9-4.9" />
    <path d="M3.5 3.5l17 17" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A bell (notifications on), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { BellIcon } from "./icons";
 *
 * export const Mark = () => <BellIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 8.5a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4s2-1.5 2-6.5ZM9.5 19.5a2.6 2.6 0 0 0 5 0" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A single check mark (sent), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { CheckIcon } from "./icons";
 *
 * export const Mark = () => <CheckIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const CheckIcon = (p: IconProps) => <SharedCheckIcon strokeWidth={2.2} {...chatIconProps(p)} />;

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A double check mark (delivered or read), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { CheckCheckIcon } from "./icons";
 *
 * export const Mark = () => <CheckCheckIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const CheckCheckIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.2}>
    <path d="M1.5 12.5 6 17l9.5-10.5M11 16l1 1 9.5-10.5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A clock (sending), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ClockIcon } from "./icons";
 *
 * export const Mark = () => <ClockIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ClockIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.1}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal Three dots (more actions), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { MoreIcon } from "./icons";
 *
 * export const Mark = () => <MoreIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const MoreIcon = (p: IconProps) => (
  <Icon {...p} fill>
    <circle cx="5.5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="18.5" cy="12" r="1.8" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal An archive box, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ArchiveIcon } from "./icons";
 *
 * export const Mark = () => <ArchiveIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ArchiveIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
    <path d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5M10 12.5h4" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal An archive box with an up arrow (restore), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { UnarchiveIcon } from "./icons";
 *
 * export const Mark = () => <UnarchiveIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const UnarchiveIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
    <path d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5M12 17v-5.5M9.5 14l2.5-2.5 2.5 2.5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal An open envelope (mark as read), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { MailOpenIcon } from "./icons";
 *
 * export const Mark = () => <MailOpenIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const MailOpenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10 12 4.5 20.5 10v8.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V10Z" />
    <path d="m3.5 10 8.5 5.5 8.5-5.5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal An envelope with a dot (mark as unread), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { MailDotIcon } from "./icons";
 *
 * export const Mark = () => <MailDotIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const MailDotIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 5.5H5A1.5 1.5 0 0 0 3.5 7v10A1.5 1.5 0 0 0 5 18.5h14a1.5 1.5 0 0 0 1.5-1.5v-6" />
    <path d="m3.5 7.5 8.5 5.5 3-2" />
    <circle cx="18.5" cy="6" r="2.5" fill="currentColor" stroke="none" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A left arrow (back; flips in right-to-left pages), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ArrowLeftIcon } from "./icons";
 *
 * export const Mark = () => <ArrowLeftIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ArrowLeftIcon = ({ className }: IconProps) => (
  <Icon className={cn("rtl:-scale-x-100", className)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A left chevron (flips in right-to-left pages), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ChevronLeftIcon } from "./icons";
 *
 * export const Mark = () => <ChevronLeftIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ChevronLeftIcon = ({ className }: IconProps) => (
  <Icon className={cn("rtl:-scale-x-100", className)}>
    <path d="m15 6-6 6 6 6" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A right chevron (flips in right-to-left pages), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ChevronRightIcon } from "./icons";
 *
 * export const Mark = () => <ChevronRightIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ChevronRightIcon = ({ className }: IconProps) => (
  <Icon className={cn("rtl:-scale-x-100", className)}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A down chevron, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ChevronDownIcon } from "./icons";
 *
 * export const Mark = () => <ChevronDownIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ChevronDownIcon = (p: IconProps) => <SharedChevronDownIcon strokeWidth={1.9} {...chatIconProps(p)} />;

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A phone handset, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { PhoneIcon } from "./icons";
 *
 * export const Mark = () => <PhoneIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const PhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.2 3.5h3l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.2 5.7a2 2 0 0 1 2-2.2Z" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A video camera, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { VideoIcon } from "./icons";
 *
 * export const Mark = () => <VideoIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const VideoIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="m16 10.5 5-3v9l-5-3" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal An i in a circle (details), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { InfoIcon } from "./icons";
 *
 * export const Mark = () => <InfoIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.5h.01" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A curved reply arrow (flips in right-to-left pages), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ReplyIcon } from "./icons";
 *
 * export const Mark = () => <ReplyIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ReplyIcon = ({ className }: IconProps) => (
  <Icon className={cn("rtl:-scale-x-100", className)}>
    <path d="M9.5 6 4 11.5 9.5 17" />
    <path d="M4 11.5h9.5a6.5 6.5 0 0 1 6.5 6.5v1" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A smiley with a plus (add reaction), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { SmilePlusIcon } from "./icons";
 *
 * export const Mark = () => <SmilePlusIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const SmilePlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.6 11.2A8.6 8.6 0 1 1 12.8 3.4" />
    <path d="M8.5 14.5s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01M17 3v5M14.5 5.5h5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A smiley face (emoji), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { SmileIcon } from "./icons";
 *
 * export const Mark = () => <SmileIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const SmileIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M8.5 14.5s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal Two overlapping sheets (copy), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { CopyIcon } from "./icons";
 *
 * export const Mark = () => <CopyIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const CopyIcon = (p: IconProps) => <SharedCopyIcon strokeWidth={1.9} {...chatIconProps(p)} />;

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A pencil (edit), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { PencilIcon } from "./icons";
 *
 * export const Mark = () => <PencilIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const PencilIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16.6 3.9a2.1 2.1 0 0 1 3 3L8.4 18.1l-4.1 1 1-4.1L16.6 3.9Z" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A bin (delete), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { TrashIcon } from "./icons";
 *
 * export const Mark = () => <TrashIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6.5h16M9.5 6.5V4.5h5v2M6.5 6.5l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12M10 10.5v6M14 10.5v6" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A down arrow (scroll to latest), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ArrowDownIcon } from "./icons";
 *
 * export const Mark = () => <ArrowDownIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ArrowDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A paperclip (attach), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { PaperclipIcon } from "./icons";
 *
 * export const Mark = () => <PaperclipIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const PaperclipIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m20 11.5-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.3 3.3 0 0 1 4.7 4.7l-8.2 8.2a1.7 1.7 0 0 1-2.4-2.4l7.5-7.5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A paper plane (send; flips in right-to-left pages), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { SendIcon } from "./icons";
 *
 * export const Mark = () => <SendIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const SendIcon = ({ className }: IconProps) => (
  <Icon className={cn("rtl:-scale-x-100", className)} fill>
    <path d="M3.4 20.4 21 12 3.4 3.6l-.9 6.6L14 12 2.5 13.8l.9 6.6Z" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A file with a folded corner, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { FileIcon } from "./icons";
 *
 * export const Mark = () => <FileIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const FileIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8L14 3.5Z" />
    <path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A down arrow into a tray, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { DownloadIcon } from "./icons";
 *
 * export const Mark = () => <DownloadIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A picture frame with a mountain, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ImageIcon } from "./icons";
 *
 * export const Mark = () => <ImageIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m20.5 15.5-4.5-4.5-8.5 8.5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal An outlined speech bubble, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ChatIcon } from "./icons";
 *
 * export const Mark = () => <ChatIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ChatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.4A8 8 0 1 1 20.5 11.5Z" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A filled speech bubble, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ChatFilledIcon } from "./icons";
 *
 * export const Mark = () => <ChatFilledIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ChatFilledIcon = (p: IconProps) => (
  <Icon {...p} fill>
    <path d="M12 3a8.6 8.6 0 0 0-7.5 12.8L3 20.9l5.3-1.4A8.6 8.6 0 1 0 12 3Zm-4 9.9a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm4 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm4 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal Two people (group), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { UsersIcon } from "./icons";
 *
 * export const Mark = () => <UsersIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const UsersIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 7.4M18.5 14a6.5 6.5 0 0 1 3 5.5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A circle with a slash (block), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { BanIcon } from "./icons";
 *
 * export const Mark = () => <BanIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const BanIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.75" />
    <path d="m5.8 5.8 12.4 12.4" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal An arrow leaving a door (leave), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { LogOutIcon } from "./icons";
 *
 * export const Mark = () => <LogOutIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const LogOutIcon = ({ className }: IconProps) => (
  <Icon className={cn("rtl:-scale-x-100", className)}>
    <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 16.5 5.5 12 10 7.5M5.5 12H15" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal A circular arrow (try again), drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { RetryIcon } from "./icons";
 *
 * export const Mark = () => <RetryIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const RetryIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal Two chain links, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { LinkIcon } from "./icons";
 *
 * export const Mark = () => <LinkIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4.1l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2M14 10a4.5 4.5 0 0 0-6.4-.1l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
  </Icon>
);

/**
 * Accessibility: Decorative: `aria-hidden` and not focusable, so the control around it must carry its own accessible name.
 *
 * @internal Two speech bubbles, drawn in `currentColor` at 16px by default for chat. Takes `className` (for example a `size-*` class).
 *
 * @example
 * ```tsx
 * import { ChatsIcon } from "./icons";
 *
 * export const Mark = () => <ChatsIcon className="size-5" />;
 * ```
 *
 * @see /chat/thread
 */
export const ChatsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15.5 9.5a6 6 0 0 1-8.8 5.3L3 16l1.1-3.3A6 6 0 1 1 15.5 9.5Z" />
    <path d="M10 18.3a6 6 0 0 0 7.3 1.5L21 21l-1.1-3.3a6 6 0 0 0-2.2-8.4" />
  </Icon>
);
