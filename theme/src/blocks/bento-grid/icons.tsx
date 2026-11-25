import { type ReactNode } from "react";

import { cn } from "../../lib/cn";

/* ---------- Icons (24×24, currentColor, decorative) ---------- */

/** The shared 24px stroke SVG frame of the bento icons. @internal */
export function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/** The chart icon. @internal */
export const ChartIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M4 19h16" />
    <path d="m5 15 4.5-5 3.5 3 6-7" />
  </Icon>
);

/** The bell icon. @internal */
export const BellIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </Icon>
);

/** The key icon. @internal */
export const KeyIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 8.5-8.5M16.5 6.5l2.5 2.5M14.5 8.5l2 2" />
  </Icon>
);

/** The layers icon. @internal */
export const LayersIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Icon>
);

/** The users icon. @internal */
export const UsersIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
  </Icon>
);

/** The trend arrow icon, pointing up or down. @internal */
export const TrendIcon = ({ up, className }: { up: boolean; className?: string }) => (
  <Icon className={className}>
    <path d={up ? "M7 14l5-5 5 5" : "M7 10l5 5 5-5"} />
  </Icon>
);

/** The plus icon. @internal */
export const PlusIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

/** The right arrow icon. @internal */
export const ArrowRightIcon = ({ className }: { className?: string }) => (
  <Icon className={cn("rtl:-scale-x-100", className)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
