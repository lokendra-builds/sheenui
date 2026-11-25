import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@sheenui/theme";

/* ---------- Icons (decorative, 24×24, currentColor) ---------- */

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

export const icons = {
  sparkle: (
    <Icon>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5" />
    </Icon>
  ),
  rocket: (
    <Icon>
      <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2" />
      <path d="M9 12a12 12 0 0 1 11-9c0 4-2 8.5-9 11.5L9 12Z" />
      <path d="M9 12H5l2-4h4M12 15v4l4-2v-4" />
    </Icon>
  ),
  building: (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
    </Icon>
  ),
  truck: (
    <Icon>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </Icon>
  ),
  bolt: (
    <Icon>
      <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
    </Icon>
  ),
  store: (
    <Icon>
      <path d="M4 9.5 5.5 4h13L20 9.5M4 9.5V20h16V9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
      <path d="M10 20v-5h4v5" />
    </Icon>
  ),
  list: (
    <Icon>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </Icon>
  ),
  board: (
    <Icon>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="10" y="4" width="5" height="11" rx="1.5" />
      <rect x="17" y="4" width="4" height="7" rx="1.5" />
    </Icon>
  ),
  calendar: (
    <Icon>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Icon>
  ),
  sun: (
    <Icon>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  ),
  moon: (
    <Icon>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </Icon>
  ),
  monitor: (
    <Icon>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </Icon>
  ),
  bold: (
    <Icon strokeWidth="2.4">
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </Icon>
  ),
  italic: (
    <Icon strokeWidth="2.2">
      <path d="M10 5h8M6 19h8M14 5l-4 14" />
    </Icon>
  ),
  underline: (
    <Icon strokeWidth="2.2">
      <path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />
    </Icon>
  ),
  strike: (
    <Icon strokeWidth="2.2">
      <path d="M4 12h16M16.5 7.5C16 5.6 14.3 4.5 12 4.5c-2.6 0-4.5 1.4-4.5 3.4 0 1.5 1 2.5 3 3.1M8 16.5c.5 2 2.3 3 4.5 3 2.6 0 4.5-1.3 4.5-3.4 0-.6-.1-1.1-.4-1.6" />
    </Icon>
  ),
  alignLeft: (
    <Icon strokeWidth="2">
      <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />
    </Icon>
  ),
  alignCenter: (
    <Icon strokeWidth="2">
      <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />
    </Icon>
  ),
  alignRight: (
    <Icon strokeWidth="2">
      <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />
    </Icon>
  ),
  bellOff: (
    <Icon>
      <path d="M9 18a3 3 0 0 0 6 0M6 8a6 6 0 0 1 9.3-5M18 8c0 5 2 7 2 7H8M3 3l18 18M6 8c0 5-2 7-2 7h4" />
    </Icon>
  ),
  bell: (
    <Icon>
      <path d="M9 18a3 3 0 0 0 6 0M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7" />
    </Icon>
  ),
  paperclip: (
    <Icon>
      <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7" />
    </Icon>
  ),
  smile: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
    </Icon>
  ),
};

/** A small caption under a demo showing its current state. */
export function Readout({ children }: { children: ReactNode }) {
  return <p className="text-xs text-sheen-fg-muted [&_strong]:font-semibold [&_strong]:text-sheen-fg">{children}</p>;
}
