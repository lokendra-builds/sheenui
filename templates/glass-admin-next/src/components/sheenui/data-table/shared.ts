import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type ReactTable,
  type Row,
  type RowData,
} from "@tanstack/react-table";

import { cn } from "../lib/cn";
import type { RowMenuHandle } from "./column-menu";
import type { DataTableColumn, DataTableLabels, DataTableProps } from "./types";

/** The table features (and their row models), created once at module scope so they stay stable across renders. */
export const features = tableFeatures({
  columnVisibilityFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic, datetime: sortFn_datetime },
});

/** The table instance DataTable builds (its feature set is fixed). */
export type DtTable<TData extends RowData> = ReactTable<typeof features, TData>;
/** One row of that table. */
export type DtRow<TData extends RowData> = Row<typeof features, TData>;

/** The two members of a TanStack row the filters read. */
export type RowLike<TData> = { original: TData; getValue: (columnId: string) => unknown };

/** A state setter that takes a value or an updater, like the one `useControllable` returns. */
export type Setter<T> = (update: T | ((prev: T) => T)) => void;

/** Faceted filter: keep rows whose value is one of the picked values. */
export const inSetFilter = Object.assign(
  (row: RowLike<unknown>, columnId: string, filterValue: unknown) =>
    !Array.isArray(filterValue) || filterValue.length === 0 || filterValue.includes(stringify(row.getValue(columnId))),
  { autoRemove: (value: unknown) => !Array.isArray(value) || value.length === 0 },
);

/** A stable empty list, so a default prop does not change identity on every render. */
export const EMPTY: never[] = [];
/** The page sizes offered when `pageSizeOptions` is not set. */
export const PAGE_SIZES = [10, 20, 50, 100];
/** Width of the selection checkbox column, in rem. */
export const SELECT_W = 3; // rem
/** Width of the expand-chevron column, in rem. */
export const EXPAND_W = 2.75; // rem

/** Any cell value as text: dates as ISO strings, arrays joined, `null` and `undefined` empty. */
export function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(stringify).join(", ");
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- arbitrary cell data: a custom toString() is honoured, plain objects fall back to the default
  return String(value);
}

/** A column width as a CSS length: numbers are pixels. */
export const cssLength = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v);

/** The global filter as TanStack sees it: a new object whenever the query or the searched columns change. */
export type SearchState = { folded: string; columns: string };

/** A state value or an updater function, the two forms TanStack hands to its change callbacks. */
export type Updater<T> = T | ((prev: T) => T);

/** The raw value of a column for a row: its accessor function, else the `accessorKey` (or `id`) property. */
export function readValue<TData>(col: DataTableColumn<TData>, row: TData): unknown {
  return col.accessorFn ? col.accessorFn(row) : (row as Record<string, unknown>)[col.accessorKey ?? col.id];
}

/** Text alignment classes of a column. */
export const alignClass = <TData>(col: DataTableColumn<TData>) => {
  const align = col.align ?? (col.numeric ? "right" : "left");
  // Explicit start alignment: browsers centre <th> by default.
  return cn(
    align === "right" ? "text-end" : align === "center" ? "text-center" : "text-start",
    col.numeric && "tabular-nums",
  );
};

/** Sticky offsets are logical (inset-inline-*), so pinning works in RTL too. */
export const pinStyle = (offset: string | number) => ({ insetInlineStart: offset });

/** Everything the header, the rows and the card list share: which columns exist, which are pinned, and the density. */
export type GridEnv<TData extends RowData> = {
  labels: DataTableLabels;
  enableSelection: boolean;
  renderExpanded: DataTableProps<TData>["renderExpanded"];
  hasActions: boolean;
  compact: boolean;
  cellPad: string;
  pinStartCols: boolean;
  pinFirst: boolean;
  firstLeft: number;
  /** The start-pinned column that carries the edge shadow. */
  lastPinned: "first" | "expand" | "select" | null;
  pinCap: string | undefined;
  pinnedBg: string;
  colCount: number;
  visibleColumns: DataTableColumn<TData>[];
  colById: Map<string, DataTableColumn<TData>>;
  pageIds: string[];
  allPageSelected: boolean;
  somePageSelected: boolean;
  setSelected: (ids: string[], on: boolean) => void;
  /** Links each row's "..." button to the table's one shared actions menu. */
  rowMenu: RowMenuHandle<TData>;
};

/** Shift-click (range select, multi-sort) would otherwise also select the page's text. */
export const preventShiftSelect = (event: { shiftKey: boolean; preventDefault: () => void }) => {
  if (event.shiftKey) event.preventDefault();
};

/* ---------- shared class strings ---------- */

/** Classes of a body cell: the bottom border, the row tint (hover or selected) over any pinned background, and no border on the last row. */
export const tdBase = cn(
  "border-b border-sheen-border align-middle",
  // Row tint (hover / selected) layered over any pinned background.
  "[background-image:linear-gradient(var(--dt-tint,transparent),var(--dt-tint,transparent))]",
  "[tr:last-child>&]:border-b-0",
);

/** Soft shadow on the pinned column's edge once rows slide under it. */
export const pinShadow = cn(
  "after:pointer-events-none after:absolute after:inset-y-0 after:-end-4 after:w-4 after:bg-gradient-to-r after:from-sheen-fg/15 after:to-transparent rtl:after:bg-gradient-to-l",
  "after:opacity-0 after:transition-opacity group-data-scrolled-x/dt:after:opacity-100",
);
/** Soft shadow on the end-pinned column's edge once rows slide under it. */
export const pinShadowEnd = cn(
  "before:pointer-events-none before:absolute before:inset-y-0 before:-start-4 before:w-4 before:bg-gradient-to-l before:from-sheen-fg/15 before:to-transparent rtl:before:bg-gradient-to-r",
  "before:opacity-0 before:transition-opacity group-data-more-end/dt:before:opacity-100",
);
/** "More this way" fade over the scroll area's edge (shown with opacity-100). */
export const edgeFade = cn(
  "pointer-events-none absolute inset-y-0 z-[4] w-12 from-sheen-fg/20 via-sheen-fg/5 to-transparent",
  "opacity-0 transition-opacity duration-(--sheen-duration-base)",
);

/** Classes of an icon-only button of the toolbar and headers: 36px, 44px on touch screens. */
export const iconButton = cn(
  "relative inline-flex size-9 items-center justify-center rounded-sheen-md text-sheen-fg-muted",
  "transition-colors hover:bg-sheen-hover hover:text-sheen-fg data-popup-open:bg-sheen-hover data-popup-open:text-sheen-fg",
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
  "any-pointer-coarse:size-11",
);

/** Classes of an inline link button: at least 24px tall (WCAG 2.5.8), 44px on touch. */
export const linkButton =
  "inline-flex min-h-7 items-center rounded-sheen-sm px-1.5 font-semibold text-sheen-accent underline decoration-sheen-accent/40 underline-offset-2 hover:bg-sheen-hover hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11";

/**
 * The pinned first column's header on a phone: no fixed width, at most `--dt-pin-cap` (set on the cell) and at least 7.5rem
 * (or the cap, if smaller), so a name does not wrap letter by letter (a 4000px-tall table) when the other columns squeeze it.
 */
export const PIN_CAP_TH = "max-sm:w-auto! max-sm:min-w-[min(var(--dt-pin-cap),7.5rem)]! max-sm:max-w-(--dt-pin-cap)";
