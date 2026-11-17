import { type ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  AlertIcon as SharedAlertIcon,
  CheckIcon as SharedCheckIcon,
  CloseIcon as SharedCloseIcon,
  CopyIcon as SharedCopyIcon,
} from "../../components/status-icons/icons";

/* ---------- Icons (24×24, currentColor, decorative) ---------- */

/** Props of the chat icons: an optional `className`. */
export type IconProps = { className?: string };

/** The shared 24px SVG frame of the chat icons (decorative, `aria-hidden`). */
export function Icon({ children, className, fill }: IconProps & { children: ReactNode; fill?: boolean }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      {children}
    </svg>
  );
}

/** A sparkle, the assistant's mark. */
export const SparkIcon = ({ className }: IconProps & { "aria-hidden"?: boolean }) => (
  <Icon className={className} fill>
    <path d="M12 2.5c.4 4.6 2.9 7.1 7.5 7.5v.1c-4.6.4-7.1 2.9-7.5 7.5h-.1c-.4-4.6-2.9-7.1-7.5-7.5V10c4.6-.4 7.1-2.9 7.5-7.5Z" />
    <path d="M18.5 15.5c.2 1.8 1.1 2.8 3 3-1.9.2-2.8 1.2-3 3-.2-1.8-1.2-2.8-3-3 1.8-.2 2.8-1.2 3-3Z" />
  </Icon>
);

/** An arrow pointing up (send). */
export const ArrowUpIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
);

/** An arrow pointing down (jump to latest). */
export const ArrowDownIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Icon>
);

/** A stop symbol (stop generating). */
export const StopIcon = ({ className }: IconProps) => (
  <Icon className={className} fill>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
  </Icon>
);

/** A paperclip (attach a file). */
export const PaperclipIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="m20 11.5-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.3 3.3 0 0 1 4.7 4.7l-8.2 8.2a1.7 1.7 0 0 1-2.4-2.4l7.5-7.5" />
  </Icon>
);

/** Two overlapping sheets (copy). */
export const CopyIcon = ({ className }: IconProps) => (
  <SharedCopyIcon strokeWidth={1.9} className={cn("size-4", className)} />
);

/** A check mark (done, copied). */
export const CheckIcon = ({ className }: IconProps) => (
  <SharedCheckIcon strokeWidth={1.9} className={cn("size-4", className)} />
);

/** Outlined, or filled when its rating is chosen (a shape change, not only a colour change). */
export const ThumbIcon = ({ className, down, filled }: IconProps & { down?: boolean; filled?: boolean }) => (
  <Icon className={cn(down && "rotate-180", className)}>
    <path
      d="M7.5 10.5v9h-3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 3.6-6.3a1.6 1.6 0 0 1 2.9 1.2l-.9 3.6h5.2a2 2 0 0 1 2 2.4l-1.3 6.5a2 2 0 0 1-2 1.6H7.5"
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.35 : undefined}
    />
  </Icon>
);

/** A circular arrow (regenerate). */
export const RetryIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5" />
  </Icon>
);

/** A compose symbol (start a new chat). */
export const NewChatIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M12 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V12" />
    <path d="M17.6 3.9a1.9 1.9 0 0 1 2.7 2.7L13 13.9l-3.5.8.8-3.5 7.3-7.3Z" />
  </Icon>
);

/** A page with a folded corner (an attached file). */
export const FileIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8L14 3.5Z" />
    <path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" />
  </Icon>
);

/** A cross (remove, close). */
export const XIcon = ({ className }: IconProps) => (
  <SharedCloseIcon strokeWidth={1.9} className={cn("size-4", className)} />
);

/** An alert symbol (an error). */
export const AlertIcon = ({ className }: IconProps) => (
  <SharedAlertIcon strokeWidth={1.9} className={cn("size-4", className)} />
);
