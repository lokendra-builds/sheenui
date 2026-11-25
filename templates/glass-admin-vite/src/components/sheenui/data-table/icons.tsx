import type { ReactNode } from "react";

import { cn } from "../lib/cn";

/** Small stroke icons for DataTable. All decorative (aria-hidden): controls carry their own names. */
function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("size-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal A magnifying glass, drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { SearchIcon } from "./icons";
 *
 * export const Mark = () => <SearchIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const SearchIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal A cross, drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { CloseIcon } from "./icons";
 *
 * export const Mark = () => <CloseIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const CloseIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal A plus in a circle, drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { PlusCircleIcon } from "./icons";
 *
 * export const Mark = () => <PlusCircleIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const PlusCircleIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal Three sliders (the filter / view button), drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { SlidersIcon } from "./icons";
 *
 * export const Mark = () => <SlidersIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const SlidersIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal A down arrow into a tray, drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { DownloadIcon } from "./icons";
 *
 * export const Mark = () => <DownloadIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const DownloadIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal Three dots (the row-actions button), drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { DotsIcon } from "./icons";
 *
 * export const Mark = () => <DotsIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const DotsIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="19" cy="12" r="1.2" fill="currentColor" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal A right-pointing chevron, drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { ChevronRightIcon } from "./icons";
 *
 * export const Mark = () => <ChevronRightIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const ChevronRightIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal Up / down arrows for a column's sort direction (props: `dir` false | "asc" | "desc", `className`), drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { SortIcon } from "./icons";
 *
 * export const Mark = () => <SortIcon dir="asc" />;
 * ```
 *
 * @see /components/data-table
 */
export const SortIcon = ({ dir, className }: { dir: false | "asc" | "desc"; className?: string }) => (
  <Icon className={cn("size-3.5", className)}>
    {dir === "asc" ? (
      <path d="M12 19V5m0 0-5 5m5-5 5 5" />
    ) : dir === "desc" ? (
      <path d="M12 5v14m0 0-5-5m5 5 5-5" />
    ) : (
      <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />
    )}
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal An exclamation mark in a circle, drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { AlertIcon } from "./icons";
 *
 * export const Mark = () => <AlertIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const AlertIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4m0 4h.01" />
  </Icon>
);
/**
 * Accessibility: Decorative: `aria-hidden`, so the button or cell it sits in must carry its own accessible name.
 *
 * @internal A list with a magnifier (the empty-state picture), drawn in `currentColor` at 16px, for DataTable. Takes `className`; use it inside a control that has its own name.
 *
 * @example
 * ```tsx
 * import { EmptyIcon } from "./icons";
 *
 * export const Mark = () => <EmptyIcon className="size-4" />;
 * ```
 *
 * @see /components/data-table
 */
export const EmptyIcon = (p: { className?: string }) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h10M4 17h7" />
    <circle cx="17.5" cy="16.5" r="2.5" />
    <path d="m21 20-1.7-1.7" />
  </Icon>
);
