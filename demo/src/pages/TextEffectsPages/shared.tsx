import { type ReactNode } from "react";

/* =====================================================================
 * Icons (decorative; their controls carry the names)
 * ===================================================================== */

export function Icon({ children, className = "size-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}
