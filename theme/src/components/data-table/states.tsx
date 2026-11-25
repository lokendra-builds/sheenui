"use client";

import type { ReactNode } from "react";

import { Alert } from "../alert/alert";
import { Button } from "../button/button";
import { cn } from "../../lib/cn";
import { EmptyIcon } from "./icons";
import { edgeFade } from "./shared";
import type { DataTableLabels } from "./types";

/** A shimmering placeholder bar for loading rows and cards. */
export function Skeleton({ className }: { className?: string }) {
  return (
    // A visible bar (not a hairline) with a clear sweep of light: a loading table must look like one.
    <span className={cn("relative block h-3.5 overflow-hidden rounded-sheen-full bg-sheen-fg/[0.12]", className)}>
      <span className="absolute inset-y-0 start-0 w-1/2 bg-gradient-to-r from-transparent via-sheen-fg/[0.22] to-transparent opacity-0 motion-ok:animate-[sheen-shine_var(--sheen-duration-loop-steady)_var(--sheen-ease-in-out)_infinite] motion-ok:opacity-100" />
    </span>
  );
}

/** A centred icon, title, description and actions: the empty and error states of the table body. */
export function StateBlock({
  icon,
  title,
  description,
  actions,
  tone = "neutral",
  role,
}: {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: "neutral" | "danger";
  role?: "alert";
}) {
  return (
    <div role={role} className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-sheen-full border",
          tone === "danger"
            ? "border-sheen-danger-text/25 bg-sheen-danger-soft text-sheen-danger-text"
            : "border-sheen-accent-border bg-sheen-accent-soft text-sheen-accent",
        )}
      >
        {icon}
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-base font-semibold text-balance text-sheen-fg">{title}</p>
        {description && <p className="text-sm text-pretty text-sheen-fg-muted">{description}</p>}
      </div>
      {actions && <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}

/** The error state that replaces the body when a request failed and there are no rows to keep. */
export function ErrorBlock({
  labels,
  errorText,
  retry,
  loading,
}: {
  labels: DataTableLabels;
  errorText: ReactNode;
  retry: (() => void) | undefined;
  loading: boolean;
}) {
  // A real inline Alert (danger tone, announced at once) with a retry action: impossible to miss in an empty table body.
  return (
    <div className="p-4 sm:p-6">
      <Alert
        tone="danger"
        title={labels.errorTitle}
        action={
          retry && (
            <Button variant="glass" size="sm" onClick={retry} loading={loading}>
              {labels.retry}
            </Button>
          )
        }
      >
        {errorText}
      </Alert>
    </div>
  );
}

/** The empty state: no rows at all, no rows for the search, or none for the filters (with the buttons that undo them). */
export function EmptyBlock({
  labels,
  query,
  filtersActive,
  clearSearch,
  clearFilters,
}: {
  labels: DataTableLabels;
  query: string;
  filtersActive: boolean;
  clearSearch: () => void;
  clearFilters: () => void;
}) {
  return query || filtersActive ? (
    <StateBlock
      icon={<EmptyIcon className="size-5" />}
      title={query ? labels.emptyForQuery(query) : labels.emptyFiltered}
      description={labels.emptyFilteredDescription}
      actions={
        <>
          {query && (
            <Button variant="glass" size="sm" onClick={clearSearch}>
              {labels.clearSearch}
            </Button>
          )}
          {filtersActive && (
            <Button variant="glass" size="sm" onClick={clearFilters}>
              {labels.clearFilters}
            </Button>
          )}
        </>
      }
    />
  ) : (
    <StateBlock icon={<EmptyIcon className="size-5" />} title={labels.empty} description={labels.emptyDescription} />
  );
}

/**
 * Refetch error: the previous rows stay exactly where they are (under the veil) and the alert takes an in-flow slot
 * BELOW them, above the pagination. Nothing above it moves: an in-flow banner above the table pushed the rows down
 * 66-74px when the request failed (an unexpected layout shift, and a page scroll wherever scroll anchoring kicked in).
 * It overlaps nothing, so no focused row control is ever hidden behind it (WCAG 2.4.11) and a one-row table can't be
 * overrun. Opaque surface + tint as an image: text stays >= 4.5:1, and forced colours (which drop background images)
 * map the surface to an opaque Canvas.
 */
export function StaleErrorAlert({
  labels,
  errorText,
  retry,
  loading,
}: {
  labels: DataTableLabels;
  errorText: ReactNode;
  retry: (() => void) | undefined;
  loading: boolean;
}) {
  return (
    <div className="border-t border-sheen-border p-2 sm:p-3">
      <Alert
        tone="danger"
        title={labels.errorTitle}
        action={
          retry && (
            <Button variant="glass" size="sm" onClick={retry} loading={loading}>
              {labels.retry}
            </Button>
          )
        }
      >
        {errorText}
      </Alert>
    </div>
  );
}

/** The "more to scroll this way" fades over the scroll area's edges (only for the table layout). */
export function EdgeFades({
  hasActions,
  lastPinned,
}: {
  hasActions: boolean;
  lastPinned: "first" | "expand" | "select" | null;
}) {
  return (
    <>
      {/* With a pinned actions column, its own edge shadow does this job. */}
      {!hasActions && (
        <span
          aria-hidden
          className={cn(edgeFade, "end-0 bg-gradient-to-l rtl:bg-gradient-to-r", "group-data-more-end/dtw:opacity-100")}
        />
      )}
      {lastPinned === null && (
        <span
          aria-hidden
          className={cn(
            edgeFade,
            "start-0 bg-gradient-to-r rtl:bg-gradient-to-l",
            "group-data-scrolled-x/dtw:opacity-100",
          )}
        />
      )}
    </>
  );
}

/** While a request runs: the veil over the previous rows (refetch or a failed refetch) and the thin progress bar under the header. */
export function LoadingOverlays({
  cards,
  headerHeight,
  loading,
  veil,
}: {
  cards: boolean;
  headerHeight: number;
  loading: boolean;
  veil: boolean;
}) {
  return (
    <>
      {/* Refetch (or a failed refetch): previous rows stay put under a veil; a thin bar runs under the header. */}
      {veil && (
        <span
          aria-hidden
          style={{ top: cards ? 0 : headerHeight }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] bg-sheen-bg/60 motion-ok:animate-pulse"
        />
      )}
      {loading && (
        <span
          aria-hidden
          style={{ top: cards ? 0 : Math.max(0, headerHeight - 1) }}
          className="pointer-events-none absolute inset-x-0 z-[5] h-1.5 overflow-hidden bg-sheen-accent-soft"
        >
          <span className="sheen-fill block h-full w-full opacity-50 [background-image:var(--sheen-accent-fill)] motion-ok:w-1/3 motion-ok:opacity-100 motion-ok:animate-[sheen-indeterminate_var(--sheen-duration-loop-quick)_var(--sheen-ease-in-out)_infinite]" />
        </span>
      )}
    </>
  );
}
