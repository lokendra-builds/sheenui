import type { ReactNode } from "react";

import type { PaginationLabels } from "../pagination/pagination";

/** Row height: "comfortable" (roomier) or "compact" (more rows on screen). */
export type DataTableDensity = "comfortable" | "compact";
/** Horizontal text alignment of a column. */
export type DataTableAlign = "left" | "center" | "right";

/** Sorting: first entry is the primary sort. */
export type DataTableSorting = { id: string; desc: boolean }[];
/** 0-based page index, like TanStack Table. */
export type DataTablePagination = { pageIndex: number; pageSize: number };
/** Faceted filters: the values kept for each filtered column. */
export type DataTableColumnFilters = { id: string; value: string[] }[];
/** Selected row ids → true. Ids come from `getRowId`, so selection survives paging and sorting. */
export type DataTableRowSelection = Record<string, boolean>;
/** Column id → visible. Missing ids are visible. */
export type DataTableColumnVisibility = Record<string, boolean>;

/** One choice in a column's faceted filter. */
export type DataTableFilterOption = {
  /** The cell value this option matches. */
  value: string;
  /** Text shown for the option. */
  label: string;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Count shown next to the option. Client-side tables count for you; pass it in server mode. */
  count?: number;
};

/** What a column's `cell` function receives for each row. */
export type DataTableCellContext<TData> = {
  /** The original row object. */
  row: TData;
  /** The row's id (from `getRowId`). */
  rowId: string;
  /** The column's accessor value. */
  value: unknown;
  /** Wraps the parts that match the current search in <mark>. */
  highlight: (text: string | number | null | undefined) => ReactNode;
  /** The applied (debounced) search text. */
  query: string;
  /** The current row density. */
  density: DataTableDensity;
};

/** Definition of one DataTable column. Only `id` and `header` are required. */
export type DataTableColumn<TData> = {
  /** Unique id. Also the accessor key when neither `accessorKey` nor `accessorFn` is set. */
  id: string;
  /** Header text. Also used for the column menu, CSV header, card labels and announcements. */
  header: string;
  /** Read the value from this key of the row. */
  accessorKey?: Extract<keyof TData, string>;
  /** Read the value with a function (for computed columns). */
  accessorFn?: (row: TData) => unknown;
  /** Custom cell. Defaults to the value as text, with search matches highlighted. */
  cell?: (ctx: DataTableCellContext<TData>) => ReactNode;
  /** Text alignment. Default "left" ("right" when `numeric`). */
  align?: DataTableAlign;
  /** Right-aligned, tabular figures, sorts numerically. */
  numeric?: boolean;
  /** Preferred width (CSS length or px number). For `wrap` columns it is also the minimum. */
  width?: number | string;
  /** Smallest width the column may shrink to (CSS length or px number). */
  minWidth?: number | string;
  /** Default true. */
  enableSorting?: boolean;
  /** Can be hidden from the View menu. Default true. */
  enableHiding?: boolean;
  /** Start hidden (uncontrolled visibility). */
  defaultHidden?: boolean;
  /** Included in the global search while the column is visible. Default true. */
  searchable?: boolean;
  /** Text the global search matches against. Default: the value as a string. */
  searchValue?: (row: TData) => string;
  /** "faceted": a multi-select filter with counts in the toolbar. */
  filter?: "faceted";
  /** Options for the faceted filter. Client-side tables derive them from the data when omitted. */
  filterOptions?: DataTableFilterOption[];
  /** Built-in sort name or a compare function on the original rows. */
  sortFn?: "alphanumeric" | "text" | "basic" | "datetime" | ((a: TData, b: TData) => number);
  /** Value written to CSV. Default: the accessor value. */
  exportValue?: (row: TData) => string | number | boolean | null | undefined;
  /** Include in CSV export. Default true. */
  enableExport?: boolean;
  /** Allow the cell text to wrap (cells are single-line by default). */
  wrap?: boolean;
  /** Hide this column in the mobile card layout. */
  hideInCards?: boolean;
  /** Extra classes for the header cell. */
  headerClassName?: string;
  /** Extra classes for every body cell of the column. */
  cellClassName?: string;
};

/** One item in a row's actions menu (the "⋯" button). */
export type DataTableRowAction<TData> = {
  /** Menu text. */
  label: string;
  /** Runs with the row when the item is chosen. */
  onSelect: (row: TData) => void;
  /** Icon before the label. */
  icon?: ReactNode;
  /** "danger" colours the item as destructive. Default "neutral". */
  tone?: "neutral" | "danger";
  /** Show the item but make it unselectable. */
  disabled?: boolean;
  /** Draw a divider above this item. */
  separatorBefore?: boolean;
};

/** One button in the floating selection bar. */
export type DataTableBulkAction<TData> = {
  /** Button text. */
  label: string;
  /** Receives the selected rows (also those on other pages) and a function that clears the selection. */
  onSelect: (rows: TData[], clearSelection: () => void) => void;
  /** Icon before the label. */
  icon?: ReactNode;
  /** "danger" colours the button as destructive. Default "neutral". */
  tone?: "neutral" | "danger";
};

/**
 * Every UI string of {@link DataTable}, for translation: pass a partial through its `labels` prop.
 * Keys that are functions get the counts or names to build a sentence. The English defaults are
 * `defaultDataTableLabels`.
 */
export type DataTableLabels = {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  /** Announced and shown after searching or filtering. */
  results: (count: number) => string;
  clearFilters: string;
  filterChipsLabel: string;
  /** Accessible name of a filter chip's remove button. */
  removeFilter: (column: string, value: string) => string;
  /** Accessible name of a faceted filter trigger, e.g. "Filter by Status, 2 selected". Keep the column name in it. */
  filterSelected: (column: string, count: number) => string;
  clearFilter: string;
  view: string;
  columns: string;
  density: string;
  comfortable: string;
  compact: string;
  /** Toolbar export (all filtered rows). Also the visible text of the selection bar's export button. */
  exportCsv: string;
  /** Accessible name of the selection bar's export button. Should start with `exportCsv`. */
  exportSelected: string;
  sortBy: string;
  sortDefault: string;
  sortOptionAsc: (column: string) => string;
  sortOptionDesc: (column: string) => string;
  /** Accessible name of the header checkbox. */
  selectAllOnPage: string;
  /** Accessible name of a row checkbox. */
  selectRow: (rowLabel: string) => string;
  allOnPageSelected: (count: number) => string;
  selectAllMatching: (count: number) => string;
  allSelected: (count: number) => string;
  clearSelection: string;
  selectedCount: (count: number) => string;
  /** Selection bar note when selected rows are hidden by the search or filters. */
  hiddenSelected: (count: number) => string;
  /** Screen-reader text after a faceted option's count, e.g. "28 rows". */
  facetCount: (count: number) => string;
  bulkActions: string;
  rowActions: (rowLabel: string) => string;
  actionsColumn: string;
  expandColumn: string;
  /** Accessible name of the expand toggle. Should start with `showDetails` / `hideDetails`. */
  expandRow: (rowLabel: string) => string;
  collapseRow: (rowLabel: string) => string;
  /** Visible text of the expand toggle in the card layout. */
  showDetails: string;
  hideDetails: string;
  /** Screen-reader hint on sortable headers. */
  sortHint: string;
  sortAscending: string;
  sortDescending: string;
  sortPriority: (priority: number) => string;
  sortedBy: (description: string) => string;
  sortCleared: string;
  sortThen: string;
  rowsPerPage: string;
  /** e.g. "Showing 21–40 of 312". */
  showing: (from: number, to: number, total: number) => string;
  pageOf: (page: number, pageCount: number) => string;
  /** Announced when the page size changes. */
  pageSizeChanged: (pageSize: number, page: number, pageCount: number) => string;
  /** Name of the scroll region when the table overflows (it is not a landmark otherwise). */
  scrollRegion: (caption: string) => string;
  goToPage: string;
  loading: string;
  refreshing: string;
  empty: string;
  emptyDescription: string;
  emptyForQuery: (query: string) => string;
  emptyFiltered: string;
  emptyFilteredDescription: string;
  errorTitle: string;
  retry: string;
  pagination: Partial<PaginationLabels>;
};

/** Props of {@link DataTable}. Only `data`, `columns` and `caption` are required. */
export type DataTableProps<TData> = {
  /** The rows. With server-side mode, only the current page. */
  data: TData[];
  /** Column definitions; see {@link DataTableColumn}. */
  columns: DataTableColumn<TData>[];
  /** Returns a stable id for a row; it is the row's React key and keys the selection and expansion state. Default: `row.id` when present, otherwise the index. */
  getRowId?: (row: TData, index: number) => string;
  /** Short name for a row, used in labels ("Select row Ravi Kumar"). Default: the first column's value. */
  getRowLabel?: (row: TData) => string;
  /** Table caption: names the table for screen readers. */
  caption: string;
  /** Show the caption visually (it is visually hidden by default). */
  showCaption?: boolean;
  /** Sets the id of the table element. */
  id?: string;
  /** Accessible name of the scroll region (a landmark only while the table overflows). Default: labels.scrollRegion(caption). */
  "aria-label"?: string;
  /** Class for the outer wrapper (toolbar + table + footer). */
  className?: string;
  /** Class for the glass panel around the table. */
  tableClassName?: string;

  // ---- Features (all optional, sensible defaults) ----
  /** Shows a search box that filters every column. Default true. */
  enableSearch?: boolean;
  /** Delay in ms before typing in the search box filters the rows. Default 200. */
  searchDebounceMs?: number;
  /** Checkbox column, select-all and the bulk-actions bar. Default false. */
  enableSelection?: boolean;
  /** Adds column visibility and density options to a View menu. Default true. */
  enableViewOptions?: boolean;
  /** Shows a button that exports the rows as CSV. Default true. */
  enableExport?: boolean;
  /** File name of the CSV download (".csv" is added). */
  exportFilename?: string;
  /**
   * Replace the built-in CSV download. Receives the rows being exported, in table order.
   * With manual pagination the table only holds the current page, so the toolbar Export
   * is shown only when this is set: fetch the full export from your server here.
   */
  onExport?: (rows: TData[], scope: "filtered" | "selected") => void;
  /** Lets people sort by clicking a column header; set false to turn sorting off for the whole table. Default true. */
  enableSorting?: boolean;
  /** Shift-click headers to sort by more than one column. Default true. */
  enableMultiSort?: boolean;
  /**
   * Pin the first data column (and the checkbox / expand columns) while scrolling sideways.
   * Under 640px the pinned columns are capped at about 45% of the screen. Default true.
   */
  stickyFirstColumn?: boolean;
  /**
   * Slide rows to their new place when sorting, filtering or paging reorders them (Motion `layout`,
   * transform only, `spring.smooth`; rows are measured once per change). Instant with reduced motion.
   * Default true.
   */
  animateRows?: boolean;
  /**
   * Render only the rows in view (plus a few more) with spacers for the rest, so a long page (100 rows) sorts and
   * scrolls without a long task. `"auto"` windows a page of 50 rows or more when `maxHeight` is set and the layout
   * is the table (not cards). Rows are measured as they render, expanded panels included. Rows outside the window are
   * not in the DOM, so Tab skips them and a focused row that scrolls out loses focus: set `false` for tables people
   * tab through row by row. Default "auto".
   */
  virtualize?: boolean | "auto";
  /** Max height of the scroll area; the header sticks to its top. */
  maxHeight?: string;
  /** Page sizes offered in the footer. Default [10, 20, 50]. */
  pageSizeOptions?: number[];
  /** Sets the starting page size when uncontrolled. Default 10. */
  defaultPageSize?: number;
  /** Hide the footer (pagination). Default false. */
  hidePagination?: boolean;
  /** Items of the ⋯ menu at the end of each row: a list, or a function that returns one for a row. */
  rowActions?: DataTableRowAction<TData>[] | ((row: TData) => DataTableRowAction<TData>[]);
  /** Detail panel shown under an expanded row. Enables the chevron column. */
  renderExpanded?: (row: TData) => ReactNode;
  /** Shows the buttons in the floating selection bar. */
  bulkActions?: DataTableBulkAction<TData>[];
  /** Extra controls at the start / end of the toolbar. */
  toolbarLeft?: ReactNode;
  /** Extra controls at the end of the toolbar. */
  toolbarRight?: ReactNode;
  /** "cards": rows become glass cards under 640px. Default "scroll" (the table scrolls sideways). */
  mobileLayout?: "scroll" | "cards";

  // ---- States ----
  /** First load (skeleton) or, when rows are present, a refetch (rows stay, dimmed). */
  loading?: boolean;
  /** Shows an error message (or true for the default). */
  error?: ReactNode;
  /** Called by the error state's Retry button. Without it the button is hidden. */
  onRetry?: () => void;
  /** Custom empty state (replaces the default). */
  emptyState?: ReactNode;

  // ---- Density ----
  /** Row height, controlled: "comfortable" or "compact". Pair with `onDensityChange`; the View menu changes it. */
  density?: DataTableDensity;
  /**
   * Sets the starting density when uncontrolled.
   * @default "comfortable"
   */
  defaultDensity?: DataTableDensity;
  /** Called with the new density from the View menu. */
  onDensityChange?: (density: DataTableDensity) => void;

  // ---- Controlled state (all optional; callbacks receive the next value) ----
  /** Current sort order, as an array of column id and direction; pass it with `onSortingChange` to control sorting. */
  sorting?: DataTableSorting;
  /** Sets the starting sorting when uncontrolled. */
  defaultSorting?: DataTableSorting;
  /** Called with the next sorting. */
  onSortingChange?: (sorting: DataTableSorting) => void;
  /** Sets the page index and size when controlled. */
  pagination?: DataTablePagination;
  /** Called with the next page index and size. */
  onPaginationChange?: (pagination: DataTablePagination) => void;
  /** Current search text; pass it with `onGlobalFilterChange` to control the search box. */
  globalFilter?: string;
  /** Initial search text when uncontrolled (a pre-filled search box). */
  defaultGlobalFilter?: string;
  /** Called with the applied (debounced) search text. */
  onGlobalFilterChange?: (value: string) => void;
  /** Currently applied faceted filters; pass it with `onColumnFiltersChange` to control them. */
  columnFilters?: DataTableColumnFilters;
  /** Sets the starting faceted filters when uncontrolled. */
  defaultColumnFilters?: DataTableColumnFilters;
  /** Called with the next faceted filters. */
  onColumnFiltersChange?: (filters: DataTableColumnFilters) => void;
  /** Selected row ids (controlled). */
  rowSelection?: DataTableRowSelection;
  /** Sets the row ids selected at first when uncontrolled (`{ [rowId]: true }`). */
  defaultRowSelection?: DataTableRowSelection;
  /** Called with the next selection. */
  onRowSelectionChange?: (selection: DataTableRowSelection) => void;
  /** Which columns are shown, keyed by column id; pass it with `onColumnVisibilityChange` to control it. */
  columnVisibility?: DataTableColumnVisibility;
  /** Called with the next visibility map. */
  onColumnVisibilityChange?: (visibility: DataTableColumnVisibility) => void;

  // ---- Server-side mode ----
  /** Works as shorthand for manualPagination + manualSorting + manualFiltering. */
  manual?: boolean;
  /** `data` is already the current page; use `rowCount` for the total. */
  manualPagination?: boolean;
  /** `data` is already sorted. */
  manualSorting?: boolean;
  /** `data` is already searched and filtered. */
  manualFiltering?: boolean;
  /** Sets the total rows on the server (manual pagination). */
  rowCount?: number;

  /** UI strings (i18n). */
  labels?: Partial<DataTableLabels>;
};
