import type { ReactNode } from "react";

/** The title row every page starts with: one h1, a line of context and an optional action. */
export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 px-1">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-sheen-fg-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
