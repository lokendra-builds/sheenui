import { type ComponentProps, type ReactNode } from "react";

import { cn } from "../../lib/cn";

import { type SettingsSection } from "./model";

/* ---------- Icons (decorative, 24×24, currentColor) ---------- */

/** The shared 24px stroke SVG frame of the settings icons. @internal */
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

/** The user icon of the profile section. @internal */
export const UserIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c.8-4 4-6 8-6s7.2 2 8 6" />
  </Icon>
);
/** The bell icon of the notifications section. @internal */
export const BellIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M6 8.5a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 14.5 6 8.5Z" />
    <path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" />
  </Icon>
);
/** The palette icon of the appearance section. @internal */
export const PaletteIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.6-2.1-.5-1.3.3-2.4 1.7-2.4H18a3 3 0 0 0 3-3C21 7 17 3 12 3Z" />
    <circle cx="7.5" cy="11" r="1.2" />
    <circle cx="10.5" cy="7" r="1.2" />
    <circle cx="15.5" cy="7.5" r="1.2" />
  </Icon>
);
/** The alert icon of the danger zone. @internal */
export const AlertIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </Icon>
);
/** The sun icon of the light theme. @internal */
export const SunIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Icon>
);
/** The moon icon of the dark theme. @internal */
export const MoonIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Icon>
);
/** The monitor icon of the system theme. @internal */
export const MonitorIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="12.5" rx="2.5" />
    <path d="M8.5 20.5h7M12 16.5v4" />
  </Icon>
);
/** The camera icon of the avatar action. @internal */
export const CameraIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </Icon>
);
/** The upload icon. @internal */
export const UploadIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v2.5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5V15" />
  </Icon>
);
/** The download icon of the export action. @internal */
export const DownloadIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 15v2.5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5V15" />
  </Icon>
);
/** The trash icon of a delete action. @internal */
export const TrashIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icon>
);
/** The check-circle icon of the saved state. @internal */
export const CheckCircleIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.8 2.8L16.5 9.5" />
  </Icon>
);
/** The lock icon of a protected setting. @internal */
export const LockIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Icon>
);

/** The navigation icon of each settings section. @internal */
export const sectionIcons: Record<SettingsSection, ReactNode> = {
  profile: <UserIcon className="size-[1.125rem]" />,
  notifications: <BellIcon className="size-[1.125rem]" />,
  appearance: <PaletteIcon className="size-[1.125rem]" />,
  danger: <AlertIcon className="size-[1.125rem]" />,
};

/* ---------- Helpers ---------- */
