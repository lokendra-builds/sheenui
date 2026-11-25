"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, memo, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import type { RowData } from "@tanstack/react-table";

import { cn } from "../../lib/cn";
import { useRowReorder } from "../../motion/reorder";
import { duration, ease } from "../../motion/tokens";
import { Checkbox } from "../checkbox/checkbox";
import { RowActionsMenu } from "./column-menu";
import { ChevronRightIcon } from "./icons";
import type { ReportRowSize, RowWindow } from "./row-window";
import { Skeleton } from "./states";
import {
  alignClass,
  cssLength,
  iconButton,
  pinShadow,
  pinShadowEnd,
  pinStyle,
  preventShiftSelect,
  tdBase,
  type DtRow,
  type GridEnv,
  SELECT_W,
} from "./shared";
import type { DataTableColumn, DataTableRowAction, DataTableRowSelection } from "./types";

/** Everything the body rows and the card list need on top of the shared grid environment. */
export type RowsProps<TData extends RowData> = {
  env: GridEnv<TData>;
  rows: DtRow<TData>[];
  rowSelection: DataTableRowSelection;
  expanded: Record<string, boolean>;
  toggleExpanded: (rowId: string) => void;
  toggleRow: (index: number, rowId: string, on: boolean, shift: boolean) => void;
  rowLabel: (row: TData, index: number) => string;
  renderCell: (col: DataTableColumn<TData>, row: TData, rowId: string) => ReactNode;
  actionsFor: (row: TData) => DataTableRowAction<TData>[];
  focusRowActions: (index: number) => void;
  /** Id prefix of the detail rows (the table's `useId`). */
  uid: string;
  reduced: boolean;
  /** Slide rows to their new place when the order changes (position-only FLIP). */
  animateRows?: boolean;
  /** Render only these rows (row windowing); `null` renders them all. */
  rowWindow?: RowWindow | null;
  /** Rendered rows report their height here (the windowing spacers are sized from it). */
  reportRowSize?: ReportRowSize;
};

/** The placeholder rows shown while the first page loads (about a real row's height, so rows landing don't push the footer around). */
export function SkeletonRows<TData extends RowData>({ env, pageSize }: { env: GridEnv<TData>; pageSize: number }) {
  const { colCount, enableSelection, cellPad, compact } = env;
  return Array.from({ length: Math.min(pageSize, 20) }, (_, r) => (
    <tr key={`skeleton-${r}`} aria-hidden>
      {Array.from({ length: colCount }, (_, c) => (
        // Roughly a real row's height, so rows landing don't push the footer around.
        <td key={c} className={cn("border-b border-sheen-border", cellPad, compact ? "h-10" : "h-[3.25rem]")}>
          <Skeleton
            className={cn(["w-3/4", "w-1/2", "w-2/3", "w-5/6"][(r + c) % 4], c === 0 && enableSelection && "w-5")}
          />
        </td>
      ))}
    </tr>
  ));
}

/** How many rows (from the top of the page) slide to their new place on a sort; the rest just swap. */
const ANIMATED_ROWS = 24;

/** What a body row's cells read from the grid environment (memoised, so an unchanged environment lets a row skip rendering). */
type RowEnv<TData extends RowData> = Pick<
  GridEnv<TData>,
  | "labels"
  | "enableSelection"
  | "renderExpanded"
  | "hasActions"
  | "compact"
  | "cellPad"
  | "pinStartCols"
  | "pinFirst"
  | "firstLeft"
  | "lastPinned"
  | "pinCap"
  | "pinnedBg"
  | "colById"
  | "rowMenu"
> & { renderCell: RowsProps<TData>["renderCell"]; actionsFor: RowsProps<TData>["actionsFor"] };

/** Row handlers keyed by row id, with a stable identity (they read the latest props), so they never invalidate a memoised row. */
type RowFns = {
  toggleRow: (rowId: string, on: boolean, shift: boolean) => void;
  toggleExpanded: (rowId: string) => void;
  focusRowActions: (rowId: string) => void;
};

type RowCellsProps<TData extends RowData> = {
  row: DtRow<TData>;
  selected: boolean;
  isExpanded: boolean;
  label: string;
  detailId: string;
  rowEnv: RowEnv<TData>;
  fns: RowFns;
};

/**
 * The cells of one body row. Memoised: sorting only moves rows, so a row whose data, selection, expansion
 * and environment are unchanged is not rendered again (the `motion.tr` around it still is, which keeps the
 * layout animation measuring every row).
 */
const RowCells = memo(function RowCells<TData extends RowData>({
  row,
  selected,
  isExpanded,
  label,
  detailId,
  rowEnv,
  fns,
}: RowCellsProps<TData>) {
  const {
    labels,
    enableSelection,
    renderExpanded,
    hasActions,
    compact,
    cellPad,
    pinStartCols,
    pinFirst,
    firstLeft,
    lastPinned,
    pinCap,
    pinnedBg,
    colById,
    rowMenu,
    renderCell,
    actionsFor,
  } = rowEnv;
  const original = row.original;
  const rowId = row.id;
  return (
    <>
      {enableSelection && (
        <td
          style={pinStartCols ? pinStyle(0) : undefined}
          className={cn(
            "ps-4 pe-0",
            tdBase,
            pinStartCols && ["sticky z-[1]", pinnedBg],
            lastPinned === "select" && pinShadow,
            compact ? "py-1.5" : "py-3",
          )}
        >
          <Checkbox
            aria-label={labels.selectRow(label)}
            checked={selected}
            onMouseDown={preventShiftSelect}
            onCheckedChange={(on, details) =>
              fns.toggleRow(rowId, on, Boolean((details.event as MouseEvent | undefined)?.shiftKey))
            }
          />
        </td>
      )}
      {renderExpanded && (
        <td
          style={pinStartCols ? pinStyle(enableSelection ? `${SELECT_W}rem` : 0) : undefined}
          className={cn(
            "px-0",
            tdBase,
            pinStartCols && ["sticky z-[1]", pinnedBg],
            lastPinned === "expand" && pinShadow,
            compact ? "py-0.5" : "py-1.5",
          )}
        >
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={isExpanded ? detailId : undefined}
            aria-label={isExpanded ? labels.collapseRow(label) : labels.expandRow(label)}
            onClick={() => fns.toggleExpanded(rowId)}
            className={iconButton}
          >
            <ChevronRightIcon
              className={cn(
                "rtl:-scale-x-100",
                isExpanded && "rotate-90 rtl:rotate-[-90deg]",
                "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
              )}
            />
          </button>
        </td>
      )}
      {row.getVisibleCells().map((cell, i) => {
        const col = colById.get(cell.column.id);
        if (!col) return null;
        const pinned = pinFirst && i === 0;
        const capped = pinned && pinCap !== undefined;
        const content = renderCell(col, original, rowId);
        return (
          <td
            key={cell.id}
            style={{
              ...(pinned ? pinStyle(`${firstLeft}rem`) : {}),
              maxWidth: col.wrap ? cssLength(col.width) : undefined,
              minWidth: col.wrap ? cssLength(col.minWidth ?? col.width) : undefined,
              ...(capped ? { "--dt-pin-cap": pinCap } : {}),
            }}
            className={cn(
              tdBase,
              cellPad,
              "text-sheen-fg",
              col.wrap ? "whitespace-normal" : "whitespace-nowrap",
              alignClass(col),
              pinned && ["sticky z-[1]", pinnedBg, pinShadow],
              capped && "max-sm:min-w-[min(var(--dt-pin-cap),7.5rem)]! max-sm:max-w-(--dt-pin-cap)",
              col.cellClassName,
            )}
          >
            {capped ? (
              // Capped on phones (a `max-sm:` rule, so the prerendered row is as tall as the hydrated one); the full text
              // stays in the DOM for screen readers.
              <div className="max-sm:max-w-(--dt-pin-cap) max-sm:overflow-clip max-sm:text-ellipsis max-sm:whitespace-normal max-sm:[overflow-clip-margin:4px] max-sm:[overflow-wrap:anywhere]">
                {content}
              </div>
            ) : (
              content
            )}
          </td>
        );
      })}
      {hasActions && (
        <td
          style={{ insetInlineEnd: 0 }}
          className={cn(
            "sticky z-[1] px-2",
            tdBase,
            "group-data-more-end/dt:bg-sheen-surface",
            pinShadowEnd,
            compact ? "py-0.5" : "py-1.5",
          )}
        >
          <RowActionsMenu
            handle={rowMenu}
            label={labels.rowActions(label)}
            hasActions={actionsFor(original).length > 0}
            row={original}
            onFocusLost={() => fns.focusRowActions(rowId)}
          />
        </td>
      )}
    </>
  );
}) as <TData extends RowData>(props: RowCellsProps<TData>) => ReactNode;

/** The table body rows: select checkbox, expand chevron, the cells and the row actions, plus the animated detail row. */
export function BodyRows<TData extends RowData>({
  env,
  rows,
  rowSelection,
  expanded,
  toggleExpanded,
  toggleRow,
  rowLabel,
  renderCell,
  actionsFor,
  focusRowActions,
  uid,
  reduced,
  animateRows = true,
  rowWindow = null,
  reportRowSize,
  edgesWidth,
}: RowsProps<TData> & {
  /** The scroller's visible width, so the detail panel stays in view while the table scrolls sideways. */ edgesWidth: number;
}) {
  const {
    labels,
    enableSelection,
    renderExpanded,
    hasActions,
    compact,
    cellPad,
    pinStartCols,
    pinFirst,
    firstLeft,
    lastPinned,
    pinCap,
    pinnedBg,
    colCount,
    colById,
    rowMenu,
  } = env;
  const edges = { width: edgesWidth };
  const reorder = useRowReorder();
  // Only the first rows are slid into place: measuring every row of a long page for the layout animation is
  // what made a 100-row sort a long task, and rows far down the page are off-screen when the order changes.
  const still = { layout: false as const };
  // Handlers read the latest props through a ref, so their identity never changes and never re-renders a row.
  const latest = useRef({ rows, toggleRow, toggleExpanded, focusRowActions });
  useLayoutEffect(() => {
    latest.current = { rows, toggleRow, toggleExpanded, focusRowActions };
  });
  const fns = useMemo<RowFns>(() => {
    const indexOf = (rowId: string) => latest.current.rows.findIndex((r) => r.id === rowId);
    return {
      toggleRow: (rowId, on, shift) => latest.current.toggleRow(indexOf(rowId), rowId, on, shift),
      toggleExpanded: (rowId) => latest.current.toggleExpanded(rowId),
      focusRowActions: (rowId) => latest.current.focusRowActions(indexOf(rowId)),
    };
  }, []);
  const rowEnv = useMemo<RowEnv<TData>>(
    () => ({
      labels,
      enableSelection,
      renderExpanded,
      hasActions,
      compact,
      cellPad,
      pinStartCols,
      pinFirst,
      firstLeft,
      lastPinned,
      pinCap,
      pinnedBg,
      colById,
      rowMenu,
      renderCell,
      actionsFor,
    }),
    [
      labels,
      enableSelection,
      renderExpanded,
      hasActions,
      compact,
      cellPad,
      pinStartCols,
      pinFirst,
      firstLeft,
      lastPinned,
      pinCap,
      pinnedBg,
      colById,
      rowMenu,
      renderCell,
      actionsFor,
    ],
  );
  const firstRow = useRef<HTMLTableRowElement>(null);
  // Measures the rendered rows (and the expanded panels, which add to their row) for the windowing spacers.
  useLayoutEffect(() => {
    const tbody = firstRow.current?.parentElement;
    if (!rowWindow || !reportRowSize || !tbody) return;
    const measure = (tr: Element) => {
      const rowId = tr.getAttribute("data-row-id") ?? tr.getAttribute("data-detail-for");
      if (rowId) {
        reportRowSize(rowId, tr.hasAttribute("data-row-id") ? "row" : "detail", tr.getBoundingClientRect().height);
      }
    };
    const observer = new ResizeObserver((entries) => entries.forEach((e) => measure(e.target)));
    for (const tr of Array.from(tbody.querySelectorAll("tr[data-row-id], tr[data-detail-for]"))) {
      measure(tr);
      observer.observe(tr);
    }
    return () => observer.disconnect();
  });
  const from = rowWindow?.start ?? 0;
  const shown = rowWindow ? rows.slice(rowWindow.start, rowWindow.end) : rows;
  const bodyRows = shown.map((row, at) => {
    const index = from + at;
    const original = row.original;
    const rowId = row.id;
    const selected = Boolean(rowSelection[rowId]);
    const isExpanded = Boolean(expanded[rowId]);
    const label = rowLabel(original, index);
    const detailId = `${uid}-detail-${rowId}`;
    return (
      <Fragment key={rowId}>
        <motion.tr
          ref={at === 0 ? firstRow : undefined}
          aria-rowindex={rowWindow ? index + 2 : undefined}
          data-row-id={rowWindow ? rowId : undefined}
          {...(animateRows && index < ANIMATED_ROWS ? reorder : still)}
          data-slot="data-table-row"
          data-selected={selected || undefined}
          className={cn(
            "transition-colors duration-(--sheen-duration-fast)",
            "hover:[--dt-tint:var(--sheen-hover)] data-selected:[--dt-tint:var(--sheen-accent-soft)]",
          )}
        >
          <RowCells
            row={row}
            selected={selected}
            isExpanded={isExpanded}
            label={label}
            detailId={detailId}
            rowEnv={rowEnv}
            fns={fns}
          />
        </motion.tr>
        {renderExpanded && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <tr key="detail" id={detailId} data-detail-for={rowWindow ? rowId : undefined}>
                <td colSpan={colCount} className="border-b border-sheen-border p-0">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0, transition: { duration: reduced ? 0 : duration.exit, ease: ease.exit } }}
                    transition={reduced ? { duration: 0 } : { duration: duration.base, ease: ease.out }}
                    className="overflow-clip"
                  >
                    {/* Pinned to the visible width, so the panel stays in view while the table scrolls sideways. */}
                    <div
                      style={{ width: edges.width || undefined }}
                      className="sticky start-0 bg-sheen-hover/60 px-4 py-4 sm:px-6"
                    >
                      {renderExpanded(original)}
                    </div>
                  </motion.div>
                </td>
              </tr>
            )}
          </AnimatePresence>
        )}
      </Fragment>
    );
  });
  return (
    <>
      {rowWindow && <Spacer height={rowWindow.padTop} colSpan={colCount} />}
      {bodyRows}
      {rowWindow && <Spacer height={rowWindow.padBottom} colSpan={colCount} />}
    </>
  );
}

/** Stands in for the rows that are not rendered (row windowing); hidden from assistive technology. */
function Spacer({ height, colSpan }: { height: number; colSpan: number }) {
  if (height <= 0) return null;
  return (
    <tr aria-hidden data-slot="data-table-spacer">
      <td colSpan={colSpan} style={{ height }} className="p-0" />
    </tr>
  );
}

/** The phone layout: one glass card per row, with the first column as its title and the rest as a label/value list. */
export function CardList<TData extends RowData>({
  env,
  rows,
  rowSelection,
  expanded,
  toggleExpanded,
  toggleRow,
  rowLabel,
  renderCell,
  actionsFor,
  focusRowActions,
  uid,
  reduced,
  captionId,
  caption,
  showCaption,
  initialLoading,
  hasBodyState,
  bodyState,
  pageSize,
}: RowsProps<TData> & {
  captionId: string;
  caption: string;
  showCaption: boolean;
  initialLoading: boolean;
  hasBodyState: boolean;
  bodyState: ReactNode;
  pageSize: number;
}) {
  const {
    labels,
    enableSelection,
    renderExpanded,
    hasActions,
    compact,
    visibleColumns,
    allPageSelected,
    somePageSelected,
    setSelected,
    pageIds,
  } = env;
  return (
    <div className="flex flex-col">
      {/* The table's caption names the card list too. */}
      <p id={captionId} className={showCaption ? "px-4 pt-4 pb-2 text-base font-semibold text-sheen-fg" : "sr-only"}>
        {caption}
      </p>
      {enableSelection && rows.length > 0 && (
        <div className="flex items-center gap-3 border-b border-sheen-border px-4 py-3">
          <Checkbox
            data-dt-anchor=""
            label={labels.selectAllOnPage}
            checked={allPageSelected}
            indeterminate={somePageSelected}
            onCheckedChange={() => setSelected(pageIds, !allPageSelected)}
          />
        </div>
      )}
      {initialLoading ? (
        <ul aria-hidden className="flex flex-col gap-2.5 p-2.5">
          {Array.from({ length: Math.min(pageSize, 5) }, (_, i) => (
            <li key={i} className="glass-1 flex flex-col gap-3 rounded-sheen-lg p-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="w-3/4" />
              <Skeleton className="w-2/3" />
            </li>
          ))}
        </ul>
      ) : hasBodyState ? (
        bodyState
      ) : (
        <ul aria-labelledby={captionId} className="flex flex-col gap-2.5 p-2.5">
          {rows.map((row, index) => {
            const original = row.original;
            const rowId = row.id;
            const selected = Boolean(rowSelection[rowId]);
            const isExpanded = Boolean(expanded[rowId]);
            const label = rowLabel(original, index);
            const [primary, ...rest] = visibleColumns;
            const detailId = `${uid}-card-detail-${rowId}`;
            return (
              <li
                key={rowId}
                data-selected={selected || undefined}
                className={cn(
                  "glass-1 rounded-sheen-lg",
                  "data-selected:border-sheen-accent-border data-selected:[background-image:linear-gradient(var(--sheen-accent-soft),var(--sheen-accent-soft))]",
                )}
              >
                <div className={cn("flex items-center gap-3", compact ? "px-3 py-2.5" : "px-4 py-3.5")}>
                  {enableSelection && (
                    <Checkbox
                      aria-label={labels.selectRow(label)}
                      checked={selected}
                      onCheckedChange={(on) => toggleRow(index, rowId, on, false)}
                    />
                  )}
                  <div className="min-w-0 flex-1 font-medium">{primary && renderCell(primary, original, rowId)}</div>
                  {hasActions && (
                    <RowActionsMenu
                      handle={env.rowMenu}
                      label={labels.rowActions(label)}
                      hasActions={actionsFor(original).length > 0}
                      row={original}
                      onFocusLost={() => focusRowActions(index)}
                    />
                  )}
                </div>
                <dl
                  className={cn(
                    "grid grid-cols-[minmax(5.5rem,auto)_minmax(0,1fr)] items-center gap-x-4 border-t border-sheen-border text-sm",
                    compact ? "gap-y-1.5 px-3 py-2.5" : "gap-y-2.5 px-4 py-3.5",
                  )}
                >
                  {rest
                    .filter((c) => !c.hideInCards)
                    .map((c) => (
                      <Fragment key={c.id}>
                        <dt className="text-xs text-sheen-fg-muted">{c.header}</dt>
                        <dd className={cn("min-w-0 text-sheen-fg", c.numeric && "tabular-nums")}>
                          {renderCell(c, original, rowId)}
                        </dd>
                      </Fragment>
                    ))}
                </dl>
                {renderExpanded && (
                  <div className="border-t border-sheen-border">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={isExpanded ? detailId : undefined}
                      // Short visible text; the row's name is in the accessible name (which starts with it).
                      aria-label={isExpanded ? labels.collapseRow(label) : labels.expandRow(label)}
                      onClick={() => toggleExpanded(rowId)}
                      className="flex min-h-11 w-full items-center gap-2 rounded-b-sheen-lg px-4 text-sm font-medium text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus"
                    >
                      <ChevronRightIcon
                        className={cn(
                          "rtl:-scale-x-100",
                          isExpanded && "rotate-90 rtl:rotate-[-90deg]",
                          "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base)",
                        )}
                      />
                      {isExpanded ? labels.hideDetails : labels.showDetails}
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="detail"
                          id={detailId}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0, transition: { duration: reduced ? 0 : duration.exit, ease: ease.exit } }}
                          transition={reduced ? { duration: 0 } : { duration: duration.base, ease: ease.out }}
                          className="overflow-clip"
                        >
                          <div className="px-4 pb-4">{renderExpanded(original)}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
