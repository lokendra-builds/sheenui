import { type ReactNode } from "react";

/* ====================================================================== */
/* Shared bits                                                             */
/* ====================================================================== */

export function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export function ControlLabel({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden className="text-sm text-sheen-fg-muted">
      {children}
    </span>
  );
}
