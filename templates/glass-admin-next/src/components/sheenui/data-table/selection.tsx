"use client";

import { AnimatePresence, motion } from "motion/react";
import type { RowData } from "@tanstack/react-table";
import { useEffect, useState, type RefObject } from "react";
import { useLatest } from "../hooks/use-latest";

import { duration, ease, spring } from "../motion/tokens";
import { Button } from "../button/button";
import { CloseIcon, DownloadIcon } from "./icons";
import { linkButton, type DtRow } from "./shared";
import type { DataTableLabels, DataTableProps } from "./types";

/**
 * The strip above the table when every row of the page is selected: offers to select all matching rows, or
 * confirms they are all selected and offers to clear.
 */
export function SelectionBanner<TData extends RowData>({
  labels,
  total,
  pageRowCount,
  selectedMatching,
  matchingRows,
  setSelected,
  clearSelection,
  focusIfLost,
  focusAnchor,
}: {
  labels: DataTableLabels;
  total: number;
  pageRowCount: number;
  selectedMatching: number;
  matchingRows: DtRow<TData>[];
  setSelected: (ids: string[], on: boolean) => void;
  clearSelection: () => void;
  focusIfLost: (pick: () => HTMLElement | null | undefined) => void;
  focusAnchor: () => HTMLElement | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-sheen-border bg-sheen-accent-soft px-4 py-1.5 text-center text-sm">
      {/* Compare with the matching rows only: rows selected earlier may be hidden by a filter now. */}
      {selectedMatching >= total ? (
        <>
          <span>{labels.allSelected(total)}</span>
          <button
            type="button"
            onClick={() => {
              clearSelection();
              focusIfLost(focusAnchor);
            }}
            className={linkButton}
          >
            {labels.clearSelection}
          </button>
        </>
      ) : (
        <>
          <span>{labels.allOnPageSelected(pageRowCount)}</span>
          <button
            type="button"
            onClick={() =>
              setSelected(
                matchingRows.map((r) => r.id),
                true,
              )
            }
            className={linkButton}
          >
            {labels.selectAllMatching(total)}
          </button>
        </>
      )}
    </div>
  );
}

/** The floating bar with the selected count and the bulk actions; it slides up while something is selected. */
export function SelectionBar<TData>({
  barRef,
  count,
  hidden,
  labels,
  reduced,
  onClear,
  onClosedWithFocus,
  onExport,
  actions,
  getRows,
}: {
  barRef: RefObject<HTMLDivElement | null>;
  count: number;
  /** Selected rows the search / filters hide. */
  hidden: number;
  labels: DataTableLabels;
  reduced: boolean;
  onClear: () => void;
  /** The bar is closing while it holds focus (Clear, Delete, …): move focus back into the table. */
  onClosedWithFocus: () => void;
  onExport?: () => void;
  actions: DataTableProps<TData>["bulkActions"] & object;
  getRows: () => TData[];
}) {
  // Keep the last counts while the bar animates out.
  const [shown, setShown] = useState({ count, hidden });
  if (count > 0 && (shown.count !== count || shown.hidden !== hidden)) setShown({ count, hidden });
  const onClosedRef = useLatest(onClosedWithFocus);
  useEffect(() => {
    if (count === 0 && barRef.current?.contains(document.activeElement)) onClosedRef.current();
  }, [count, barRef, onClosedRef]);
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        // The slot reserves room (height only, never faded: the bar inside is glass).
        <motion.div
          key="selection-slot"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={reduced ? { duration: 0 } : { duration: duration.base, ease: ease.out }}
          className="pointer-events-none sticky bottom-0 z-30 -mt-3"
        >
          <div className="flex justify-center px-2 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <motion.div
              ref={barRef}
              role="region"
              aria-label={labels.bulkActions}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: duration.exit } }
                  : { opacity: 0, y: 16, scale: 0.98, transition: { duration: duration.exit, ease: ease.exit } }
              }
              transition={reduced ? { duration: duration.fast } : spring.gentle}
              className="glass-3 pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-sheen-xl p-1.5 ps-4 shadow-[0_18px_40px_-16px_color-mix(in_oklab,var(--sheen-fg)_40%,transparent)] sm:flex-nowrap sm:rounded-sheen-full"
            >
              <span className="me-1 flex flex-col text-sm leading-tight font-semibold whitespace-nowrap tabular-nums">
                {labels.selectedCount(shown.count)}
                {shown.hidden > 0 && (
                  <span className="text-2xs font-medium text-sheen-fg-muted">
                    {labels.hiddenSelected(shown.hidden)}
                  </span>
                )}
              </span>
              <span aria-hidden className="mx-1 h-5 w-px bg-sheen-border max-sm:hidden" />
              {onExport && (
                // Visible "Export", accessible name "Export selected" (distinct from the toolbar's Export).
                // Icon-only on phones so the bar stays on one row at 320px.
                <Button
                  variant="ghost"
                  size="sm"
                  leading={<DownloadIcon />}
                  onClick={onExport}
                  aria-label={labels.exportSelected}
                >
                  <span className="max-sm:sr-only">{labels.exportCsv}</span>
                </Button>
              )}
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.tone === "danger" ? "danger" : "ghost"}
                  size="sm"
                  leading={action.icon}
                  onClick={() => action.onSelect(getRows(), onClear)}
                >
                  {action.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                aria-label={labels.clearSelection}
                className="size-8 px-0"
              >
                <CloseIcon />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
