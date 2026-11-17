import { type ComponentProps, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { type NotificationKind } from "./model";

/* ---------- Icons (decorative, 24×24, currentColor) ---------- */

/** The shared 24px stroke SVG frame of the notification icons. @internal */
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

/** The bell icon of the trigger. @internal */
export const BellIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M6 8.5a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 14.5 6 8.5Z" />
    <path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" />
  </Icon>
);
/** The double-check icon of the mark-all-read action. @internal */
export const CheckAllIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M2.5 12.5 7 17l9.5-10" />
    <path d="m12 16 1 1 9.5-10" />
  </Icon>
);
/** The check icon of the mark-read action. @internal */
export const CheckIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);
/** The dot icon of the unread marker. @internal */
export const DotIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4.5" />
  </Icon>
);
/** The close icon. @internal */
export const XIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
/** The trash icon of the dismiss action. @internal */
export const TrashIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icon>
);
/** The right arrow icon of a notification link. @internal */
export const ArrowRightIcon = ({ className, ...p }: ComponentProps<"svg">) => (
  <Icon {...p} className={cn("rtl:-scale-x-100", className)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
/** The inbox icon of the empty state. @internal */
export const InboxIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M3 13h5l1.5 3h5L16 13h5" />
    <path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2.5-8Z" />
  </Icon>
);
/** The sparkle-check icon of the all-caught-up state. @internal */
export const SparkleCheckIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.8 2.8L16.5 9.5" />
  </Icon>
);

/** The avatar icon of each notification kind. @internal */
export const kindIcons: Record<NotificationKind, ReactNode> = {
  mention: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8" />
    </>
  ),
  comment: <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1 1 20 11.5Z" />,
  reaction: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" />,
  invite: (
    <>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3 20c.5-3.6 3.1-5.5 6.5-5.5s6 1.9 6.5 5.5M19 8v6M16 11h6" />
    </>
  ),
  assign: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
  system: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4M12 17h.01" />
    </>
  ),
};

/* Tinted over a near-opaque surface (like Badge), so the *-text icon colours keep their contrast. */
/** The classes that tint a surface with the `--tint` variable while keeping icon contrast. @internal */
export const tinted = "bg-sheen-surface [background-image:linear-gradient(var(--tint),var(--tint))]";
/** The tint classes of each notification kind. @internal */
export const kindTone: Record<NotificationKind, string> = {
  mention: `${tinted} [--tint:var(--sheen-accent-soft)] text-sheen-accent`,
  comment: `${tinted} [--tint:var(--sheen-accent-soft)] text-sheen-accent`,
  reaction: `${tinted} [--tint:var(--sheen-danger-soft)] text-sheen-danger-text`,
  invite: `${tinted} [--tint:var(--sheen-success-soft)] text-sheen-success-text`,
  assign: `${tinted} [--tint:var(--sheen-warning-soft)] text-sheen-warning-text`,
  system: `${tinted} [--tint:var(--sheen-hover)] text-sheen-fg-muted`,
  success: `${tinted} [--tint:var(--sheen-success-soft)] text-sheen-success-text`,
  warning: `${tinted} [--tint:var(--sheen-warning-soft)] text-sheen-warning-text`,
};
