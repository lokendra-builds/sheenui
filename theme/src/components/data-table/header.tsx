"use client";

import type { RowData } from "@tanstack/react-table";

import { Checkbox } from "../../components/checkbox/checkbox";
import { cn } from "../../lib/cn";
import { SortIcon } from "./icons";
import {
  EXPAND_W,
  PIN_CAP_TH,
  SELECT_W,
  alignClass,
  cssLength,
  pinShadow,
  pinShadowEnd,
  pinStyle,
  preventShiftSelect,
  type DtTable,
  type GridEnv,
} from "./shared";
import type { DataTableSorting } from "./types";

/** The header row: select-all checkbox, expand column, sortable column headers (with `aria-sort`) and the actions column. */
export function HeaderRow<TData extends RowData>({
  env,
  table,
  sorting,
  setSorting,
  enableMultiSort,
  sortHintId,
  indexed,
}: {
  env: GridEnv<TData>;
  table: DtTable<TData>;
  sorting: DataTableSorting;
  setSorting: (sorting: DataTableSorting) => void;
  enableMultiSort: boolean;
  sortHintId: string;
  /** Row windowing is on: the header is row 1 of the table. */
  indexed?: boolean;
}) {
  const {
    labels,
    enableSelection,
    renderExpanded,
    hasActions,
    compact,
    pinStartCols,
    pinFirst,
    firstLeft,
    lastPinned,
    pinCap,
    pinnedBg,
    visibleColumns,
    pageIds,
    allPageSelected,
    somePageSelected,
    setSelected,
  } = env;
  /** Header click: TanStack's cycle, except that a plain click inside a multi-sort makes that column the only sort. */
  const onSortClick = (colId: string, multi: boolean) => {
    const index = sorting.findIndex((s) => s.id === colId);
    const entry = sorting[index];
    if (!multi && sorting.length > 1 && entry) {
      // Never wipe every sort with one plain click: keep this column, flip its direction.
      setSorting([{ id: colId, desc: !entry.desc }]);
      return;
    }
    table.getColumn(colId)?.toggleSorting(undefined, multi);
  };

  return (
    <tr aria-rowindex={indexed ? 1 : undefined}>
      {enableSelection && (
        <th
          scope="col"
          data-pin={pinStartCols ? "start" : undefined}
          style={{ width: `${SELECT_W}rem`, minWidth: `${SELECT_W}rem`, ...(pinStartCols ? pinStyle(0) : {}) }}
          className={cn(
            "border-b border-sheen-border ps-4 pe-0 text-start",
            pinStartCols && ["sticky z-[3]", pinnedBg],
            lastPinned === "select" && pinShadow,
          )}
        >
          {/* The checkbox names the column; no extra "Select" text to read twice. */}
          <Checkbox
            data-dt-anchor=""
            aria-label={labels.selectAllOnPage}
            checked={allPageSelected}
            indeterminate={somePageSelected}
            disabled={pageIds.length === 0}
            onCheckedChange={() => setSelected(pageIds, !allPageSelected)}
          />
        </th>
      )}
      {renderExpanded && (
        <th
          scope="col"
          data-pin={pinStartCols ? "start" : undefined}
          style={{
            width: `${EXPAND_W}rem`,
            minWidth: `${EXPAND_W}rem`,
            ...(pinStartCols ? pinStyle(enableSelection ? `${SELECT_W}rem` : 0) : {}),
          }}
          className={cn(
            "border-b border-sheen-border px-0",
            pinStartCols && ["sticky z-[3]", pinnedBg],
            lastPinned === "expand" && pinShadow,
          )}
        >
          <span className="sr-only">{labels.expandColumn}</span>
        </th>
      )}
      {visibleColumns.map((col, i) => {
        const pinned = pinFirst && i === 0;
        const column = table.getColumn(col.id);
        const canSort = Boolean(column?.getCanSort());
        const sortIndex = sorting.findIndex((s) => s.id === col.id);
        const entry = sorting[sortIndex];
        const dir = entry ? (entry.desc ? "desc" : "asc") : false;
        const right = (col.align ?? (col.numeric ? "right" : "left")) === "right";
        const capped = pinned && pinCap !== undefined;
        return (
          <th
            key={col.id}
            scope="col"
            data-pin={pinned ? "start" : undefined}
            // aria-sort belongs on one header only: the primary sort.
            aria-sort={
              sortIndex === 0
                ? dir === "asc"
                  ? "ascending"
                  : "descending"
                : canSort && sortIndex < 0
                  ? "none"
                  : undefined
            }
            style={{
              width: cssLength(col.width),
              // A wrapping column would otherwise collapse to its longest word once the table overflows.
              minWidth: cssLength(col.minWidth ?? (col.wrap ? col.width : undefined)),
              ...(capped ? { "--dt-pin-cap": pinCap } : {}),
              ...(pinned ? pinStyle(`${firstLeft}rem`) : {}),
            }}
            className={cn(
              "border-b border-sheen-border text-xs font-semibold whitespace-nowrap text-sheen-fg-muted",
              compact ? "h-9 px-3" : "h-11 px-4",
              alignClass(col),
              canSort && (compact ? "px-1.5" : "px-2"),
              pinned && ["sticky z-[3]", pinnedBg, pinShadow],
              capped && PIN_CAP_TH,
              col.headerClassName,
            )}
          >
            {canSort ? (
              <button
                type="button"
                onClick={(event) => onSortClick(col.id, enableMultiSort && event.shiftKey)}
                onMouseDown={preventShiftSelect}
                aria-describedby={sortHintId}
                className={cn(
                  "group/sort relative inline-flex h-8 max-w-full items-center gap-1.5 rounded-sheen-sm px-2 font-semibold whitespace-nowrap",
                  "transition-colors hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
                  "any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:-translate-y-1/2",
                  dir && "text-sheen-fg",
                  right && "flex-row-reverse",
                )}
              >
                <span className="truncate">{col.header}</span>
                <span
                  aria-hidden
                  className={cn(
                    "flex items-center",
                    !dir && "opacity-45 group-hover/sort:opacity-80",
                    dir && "text-sheen-accent",
                  )}
                >
                  <SortIcon dir={dir} />
                  {sorting.length > 1 && sortIndex >= 0 && (
                    <span className="ms-0.5 text-2xs leading-none font-bold tabular-nums">{sortIndex + 1}</span>
                  )}
                </span>
                {/* State for secondary sorts (aria-sort only covers the primary one). */}
                {sortIndex > 0 && (
                  <span className="sr-only">
                    , {labels.sortPriority(sortIndex + 1)},{" "}
                    {dir === "desc" ? labels.sortDescending : labels.sortAscending}
                  </span>
                )}
              </button>
            ) : (
              col.header
            )}
          </th>
        );
      })}
      {hasActions && (
        <th
          scope="col"
          data-pin="end"
          style={{ width: "3.5rem", insetInlineEnd: 0 }}
          className={cn(
            "sticky z-[3] border-b border-sheen-border px-2",
            "group-data-more-end/dt:bg-sheen-surface",
            pinShadowEnd,
          )}
        >
          <span className="sr-only">{labels.actionsColumn}</span>
        </th>
      )}
    </tr>
  );
}
