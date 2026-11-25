"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { RowData } from "@tanstack/react-table";

import { useControllable } from "../hooks/use-controllable";
import type { CsvValue } from "../lib/csv";
import { EMPTY, readValue, stringify, type DtRow, type DtTable } from "./shared";
import type {
  DataTableColumn,
  DataTableColumnFilters,
  DataTableDensity,
  DataTableLabels,
  DataTablePagination,
  DataTableProps,
  DataTableRowSelection,
  DataTableSorting,
} from "./types";
import { isRtlAt } from "../hooks/use-direction";

/* ---------- scroll edges ---------- */

/** What the scroll area reports about its edges: whether it overflows, its width, the header height and the widths of the pinned columns. */
export type Edges = {
  overflow: boolean;
  width: number;
  headerHeight: number;
  /** Width of the columns pinned at the start / end (scroll-padding keeps focus clear of them). */
  pinStart: number;
  pinEnd: number;
};

/**
 * Scroll position flags for edge shadows, plus the visible width (for sticky panels). The three
 * scroll flags (data-scrolled-x / data-more-end / data-scrolled-y) go straight onto the scroller
 * and its wrapper as attributes that CSS reads (group-data-*), never through React state: a
 * scroll that crosses an edge must not re-render the whole table (a 100+ ms commit with many rows).
 * Scroll events are coalesced to one measure per frame.
 */
export function useScrollEdges(
  ref: RefObject<HTMLElement | null>,
  headRef: RefObject<HTMLElement | null>,
  key: unknown,
) {
  const [edges, setEdges] = useState<Edges>({
    overflow: false,
    width: 0,
    headerHeight: 0,
    pinStart: 0,
    pinEnd: 0,
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const maxX = el.scrollWidth - el.clientWidth;
      const x = Math.abs(el.scrollLeft); // negative in RTL
      let pinStart = 0;
      let pinEnd = 0;
      headRef.current?.querySelectorAll<HTMLElement>("th[data-pin]").forEach((th) => {
        if (th.dataset.pin === "end") pinEnd += th.offsetWidth;
        else pinStart += th.offsetWidth;
      });
      for (const [name, on] of [
        ["data-scrolled-x", x > 1],
        ["data-more-end", maxX - x > 1],
        ["data-scrolled-y", el.scrollTop > 1],
      ] as const) {
        if (el.hasAttribute(name) !== on) {
          el.toggleAttribute(name, on);
          el.parentElement?.toggleAttribute(name, on);
        }
      }
      const next: Edges = {
        overflow: maxX > 1 || el.scrollHeight - el.clientHeight > 1,
        width: el.clientWidth,
        headerHeight: headRef.current?.offsetHeight ?? 0,
        pinStart,
        pinEnd,
      };
      setEdges((prev) => ((Object.keys(next) as (keyof Edges)[]).every((k) => prev[k] === next[k]) ? prev : next));
    };
    update();
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [ref, headRef, key]);
  return edges;
}

/* ---------- controlled / uncontrolled state ---------- */

/**
 * The seven state slices of the table, each controlled by its prop or kept inside (`useControllable`):
 * sorting, pagination, global filter, column filters, row selection, column visibility and density.
 */
export function useTableState<TData>(
  props: DataTableProps<TData>,
  columns: DataTableColumn<TData>[],
  defaultPageSize: number,
) {
  const [sorting, setSorting] = useControllable<DataTableSorting>(
    props.sorting,
    props.defaultSorting ?? EMPTY,
    props.onSortingChange,
  );
  const [pagination, setPagination] = useControllable<DataTablePagination>(
    props.pagination,
    { pageIndex: 0, pageSize: defaultPageSize },
    props.onPaginationChange,
  );
  const [globalFilter, setGlobalFilter] = useControllable<string>(
    props.globalFilter,
    props.defaultGlobalFilter ?? "",
    props.onGlobalFilterChange,
  );
  const [columnFilters, setColumnFilters] = useControllable<DataTableColumnFilters>(
    props.columnFilters,
    props.defaultColumnFilters ?? EMPTY,
    props.onColumnFiltersChange,
  );
  const [rowSelection, setRowSelection] = useControllable(
    props.rowSelection,
    props.defaultRowSelection ?? {},
    props.onRowSelectionChange,
  );
  const [columnVisibility, setColumnVisibility] = useControllable(
    props.columnVisibility,
    () => Object.fromEntries(columns.filter((c) => c.defaultHidden).map((c) => [c.id, false])),
    props.onColumnVisibilityChange,
  );
  const [density, setDensity] = useControllable<DataTableDensity>(
    props.density,
    props.defaultDensity ?? "comfortable",
    props.onDensityChange,
  );
  return {
    sorting,
    setSorting,
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    density,
    setDensity,
  };
}

/* ---------- focus ---------- */

/**
 * Never strand keyboard users on `<body>` when the focused control goes away: where focus lands (`focusAnchor`),
 * how to move it only if it was lost (`focusIfLost`) and how to refocus a row's menu after a row action (`focusRowActions`).
 */
export function useFocusRestore(
  scrollRef: RefObject<HTMLDivElement | null>,
  searchRef: RefObject<HTMLInputElement | null>,
) {
  /** Where focus lands when its control disappears: the header checkbox, else a header button, else the table region. */
  const focusAnchor = useCallback((): HTMLElement | null => {
    const region = scrollRef.current;
    if (!region) return searchRef.current;
    return (
      region.querySelector<HTMLElement>("[data-dt-anchor]:not([data-disabled])") ??
      region.querySelector<HTMLElement>("thead button") ??
      region
    );
  }, [scrollRef, searchRef]);
  /** After React has updated the DOM: if focus was lost (removed or disabled element), move it to `pick()`. */
  const focusIfLost = useCallback((pick: () => HTMLElement | null | undefined) => {
    window.requestAnimationFrame(() => {
      const active = document.activeElement as HTMLElement | null;
      const lost = !active || active === document.body || !active.isConnected || (active as HTMLButtonElement).disabled;
      if (lost) pick()?.focus();
    });
  }, []);
  /** A row went away from its own menu (Delete): focus the row that took its place, else the anchor. */
  const focusRowActions = useCallback(
    (index: number) => {
      const triggers = scrollRef.current?.querySelectorAll<HTMLElement>("[data-dt-row-actions]");
      const next = triggers && triggers.length > 0 ? triggers[Math.min(index, triggers.length - 1)] : undefined;
      (next ?? focusAnchor())?.focus();
    },
    [focusAnchor, scrollRef],
  );
  return { focusAnchor, focusIfLost, focusRowActions };
}

/* ---------- search ---------- */

/** The search box: typed text is debounced into the global filter; Enter applies at once and the filter can change from outside. */
export function useDebouncedSearch({
  globalFilter,
  setGlobalFilter,
  resetPage,
  searchDebounceMs,
  searchRef,
}: {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  resetPage: () => void;
  searchDebounceMs: number;
  searchRef: RefObject<HTMLInputElement | null>;
}) {
  const [searchInput, setSearchInput] = useState(globalFilter);
  const applied = useRef(globalFilter);
  useEffect(() => {
    // The filter changed from outside (controlled reset, "Clear search"): mirror it in the box.
    if (globalFilter !== applied.current) {
      applied.current = globalFilter;
      setSearchInput(globalFilter);
    }
  }, [globalFilter]);
  const applySearch = useCallback(
    (value: string) => {
      applied.current = value;
      setGlobalFilter(value);
      resetPage();
    },
    [setGlobalFilter, resetPage],
  );
  useEffect(() => {
    if (searchInput === applied.current) return;
    const timer = window.setTimeout(() => applySearch(searchInput), searchDebounceMs);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchDebounceMs, applySearch]);
  const query = globalFilter.trim();
  const clearSearch = () => {
    setSearchInput("");
    applySearch("");
    // The × (and the empty state's button) unmount once the box is empty.
    searchRef.current?.focus();
  };
  return { searchInput, setSearchInput, applySearch, clearSearch, query };
}

/* ---------- selection ---------- */

/** Row selection by id (it persists across pages and sorting): counts, page state, range toggling and the selected rows in table order. */
export function useRowSelection<TData extends RowData>({
  data,
  getRowId,
  rows,
  matchingRows,
  table,
  rowSelection,
  setRowSelection,
  manualPagination,
  pagination,
}: {
  data: TData[];
  getRowId: (row: TData, index: number) => string;
  rows: DtRow<TData>[];
  matchingRows: DtRow<TData>[];
  table: DtTable<TData>;
  rowSelection: DataTableRowSelection;
  setRowSelection: (update: DataTableRowSelection | ((prev: DataTableRowSelection) => DataTableRowSelection)) => void;
  manualPagination: boolean;
  pagination: DataTablePagination;
}) {
  const rowById = useMemo(() => new Map(data.map((row, i) => [getRowId(row, i), row])), [data, getRowId]);
  const seen = useRef(new Map<string, TData>());
  useEffect(() => {
    for (const [rowId, row] of rowById) seen.current.set(rowId, row);
  }, [rowById]);
  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection).filter(
        // Client-side: forget rows that no longer exist (deleted).
        (rowId) => rowSelection[rowId] && (manualPagination || rowById.has(rowId)),
      ),
    [rowSelection, rowById, manualPagination],
  );
  const selectedCount = selectedIds.length;
  // Client-side: how many of the selected rows pass the current search and filters.
  const selectedMatching = manualPagination
    ? selectedCount
    : matchingRows.reduce((n, r) => (rowSelection[r.id] ? n + 1 : n), 0);
  const hiddenSelected = selectedCount - selectedMatching;
  const pageIds = rows.map((r) => r.id);
  const pageSelected = pageIds.filter((rowId) => rowSelection[rowId]).length;
  const allPageSelected = pageIds.length > 0 && pageSelected === pageIds.length;
  const somePageSelected = pageSelected > 0 && !allPageSelected;
  const lastToggled = useRef<number | null>(null);

  const setSelected = useCallback(
    (ids: string[], on: boolean) =>
      setRowSelection((prev) => {
        if (on) return { ...prev, ...Object.fromEntries(ids.map((rowId) => [rowId, true])) };
        const drop = new Set(ids);
        return Object.fromEntries(Object.entries(prev).filter(([rowId]) => !drop.has(rowId)));
      }),
    [setRowSelection],
  );
  const clearSelection = useCallback(() => setRowSelection({}), [setRowSelection]);
  const toggleRow = (index: number, rowId: string, on: boolean, shift: boolean) => {
    // Shift-click: select (or clear) the whole range since the last toggled row on this page.
    if (shift && lastToggled.current !== null && lastToggled.current !== index) {
      const [a, b] = [Math.min(index, lastToggled.current), Math.max(index, lastToggled.current)];
      setSelected(pageIds.slice(a, b + 1), on);
    } else {
      setSelected([rowId], on);
    }
    lastToggled.current = index;
  };
  useEffect(() => {
    lastToggled.current = null;
  }, [pagination.pageIndex, pagination.pageSize]);

  /** Selected rows in table order: matching rows as sorted, then rows hidden by filters, then rows from other server pages. */
  const selectedRows = useCallback(() => {
    const pending = new Set(selectedIds);
    const out: TData[] = [];
    const take = (rowId: string, row: TData | undefined) => {
      if (row !== undefined && pending.delete(rowId)) out.push(row);
    };
    const ordered = manualPagination ? table.getRowModel().rows : table.getPrePaginatedRowModel().rows;
    for (const r of ordered) take(r.id, r.original);
    for (const [rowId, row] of rowById) take(rowId, row);
    for (const rowId of [...pending]) take(rowId, seen.current.get(rowId));
    return out;
  }, [selectedIds, rowById, manualPagination, table]);
  return {
    selectedCount,
    selectedMatching,
    hiddenSelected,
    pageIds,
    allPageSelected,
    somePageSelected,
    setSelected,
    clearSelection,
    toggleRow,
    selectedRows,
  };
}

/* ---------- live region ---------- */

/**
 * The polite live region: it announces sort, page, selection and result-count changes. Returns the text for the
 * region and `announce` for one-off messages (an export).
 */
export function useAnnouncements<TData>({
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  selectedCount,
  loading,
  total,
  page,
  pageCount,
  labels,
  colById,
  data,
  manualFiltering,
}: {
  globalFilter: string;
  columnFilters: DataTableColumnFilters;
  sorting: DataTableSorting;
  pagination: DataTablePagination;
  selectedCount: number;
  loading: boolean;
  total: number;
  page: number;
  pageCount: number;
  labels: DataTableLabels;
  colById: Map<string, DataTableColumn<TData>>;
  data: TData[];
  manualFiltering: boolean;
}) {
  const [message, setMessage] = useState("");
  const flip = useRef(false);
  const announce = useCallback((text: string) => {
    flip.current = !flip.current;
    // A trailing no-break space toggles, so the same sentence is announced again.
    setMessage(text + (flip.current ? " " : ""));
  }, []);
  const filterKey = `${globalFilter}|${JSON.stringify(columnFilters)}`;
  const sortKey = JSON.stringify(sorting);
  const prev = useRef({
    filterKey,
    sortKey,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    selectedCount,
    pending: false,
    pendingData: data,
  });
  useEffect(() => {
    const p = prev.current;
    const parts: string[] = [];
    let pending = p.pending;
    let pendingData = p.pendingData;
    if (filterKey !== p.filterKey) {
      pending = true;
      pendingData = data;
    }
    // Server-side, the count is only known once new rows arrive.
    const settled = !loading && (!manualFiltering || data !== pendingData);
    if (sortKey !== p.sortKey) {
      parts.push(
        sorting.length === 0
          ? labels.sortCleared
          : labels.sortedBy(
              sorting
                .map(
                  (s) =>
                    `${colById.get(s.id)?.header ?? s.id} ${s.desc ? labels.sortDescending : labels.sortAscending}`,
                )
                .join(`, ${labels.sortThen} `),
            ),
      );
    }
    if (pending && settled) {
      parts.push(labels.results(total));
      pending = false;
    } else if (pagination.pageSize !== p.pageSize && !pending) {
      parts.push(labels.pageSizeChanged(pagination.pageSize, page, pageCount));
    } else if (pagination.pageIndex !== p.pageIndex && !pending) {
      parts.push(labels.pageOf(page, pageCount));
    }
    if (selectedCount !== p.selectedCount) parts.push(labels.selectedCount(selectedCount));
    prev.current = {
      filterKey,
      sortKey,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      selectedCount,
      pending,
      pendingData,
    };
    if (parts.length) announce(parts.join(". "));
  }, [
    filterKey,
    sortKey,
    pagination.pageIndex,
    pagination.pageSize,
    selectedCount,
    loading,
    total,
    page,
    pageCount,
    sorting,
    labels,
    colById,
    announce,
    data,
    manualFiltering,
  ]);
  return { message, announce };
}

/* ---------- focus clearance (WCAG 2.4.11) ---------- */

/** Keeps focus inside the scroll area clear of the sticky header and the pinned columns (`scroll-padding` covers most cases; Chrome ignores it when the element is already partly visible). */
export function useScrollFocusClearance(
  scrollRef: RefObject<HTMLDivElement | null>,
  headRef: RefObject<HTMLTableSectionElement | null>,
  cards: boolean,
) {
  useEffect(() => {
    const region = scrollRef.current;
    if (!region || cards) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target === region || !target.closest("td, th")) return;
      window.requestAnimationFrame(() => {
        // Keyboard focus only: scrolling between mousedown and mouseup would swallow a click.
        if (document.activeElement !== target || !target.matches(":focus-visible")) return;
        // Sticky ancestors (the header row, pinned cells, detail panels) already stay in view on their axis.
        let stickyX = false;
        for (let el: HTMLElement | null = target; el && el !== region; el = el.parentElement) {
          if (el.tagName !== "THEAD" && getComputedStyle(el).position === "sticky") stickyX = true;
        }
        const inHead = Boolean(target.closest("thead"));
        const gap = 4;
        const box = region.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        if (!inHead) {
          const top = box.top + region.clientTop + (headRef.current?.offsetHeight ?? 0) + gap;
          if (t.top < top) region.scrollTop -= top - t.top;
        }
        if (!stickyX) {
          const rtl = isRtlAt(region);
          const pins = region.querySelectorAll<HTMLElement>("thead th[data-pin]");
          let start = 0;
          let end = 0;
          pins.forEach((th) => (th.dataset.pin === "end" ? (end += th.offsetWidth) : (start += th.offsetWidth)));
          const left = box.left + region.clientLeft + (rtl ? end : start) + gap;
          const right = box.left + region.clientLeft + region.clientWidth - (rtl ? start : end) - gap;
          // scrollLeft grows towards the right in both directions (negative values in RTL).
          if (t.left < left) region.scrollLeft -= left - t.left;
          else if (t.right > right) region.scrollLeft += Math.min(t.right - right, t.left - left);
        }
      });
    };
    region.addEventListener("focusin", onFocusIn);
    return () => region.removeEventListener("focusin", onFocusIn);
  }, [cards, scrollRef, headRef]);
}

/** Scrolls the focused control clear of the floating selection bar. */
export function useSelectionBarClearance(
  rootRef: RefObject<HTMLDivElement | null>,
  barRef: RefObject<HTMLDivElement | null>,
  enableSelection: boolean,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enableSelection) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const bar = barRef.current;
      if (!target || !bar || bar.contains(target)) return;
      window.requestAnimationFrame(() => {
        if (!bar.isConnected || document.activeElement !== target || !target.matches(":focus-visible")) return;
        const b = bar.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        if (!(t.bottom > b.top - 4 && t.top < b.bottom && t.right > b.left && t.left < b.right)) return;
        const previous = target.style.scrollMarginBottom;
        target.style.scrollMarginBottom = `${Math.ceil(b.height) + 32}px`;
        target.scrollIntoView({ block: "nearest", inline: "nearest" });
        target.style.scrollMarginBottom = previous;
      });
    };
    root.addEventListener("focusin", onFocusIn);
    return () => root.removeEventListener("focusin", onFocusIn);
  }, [enableSelection, rootRef, barRef]);
}

/* ---------- export ---------- */

/** CSV export of the filtered rows or the selected rows (or the `onExport` callback), announced in the live region. */
export function useCsvExport<TData extends RowData>({
  enableExport,
  manualPagination,
  onExport,
  exportFilename,
  selectedRows,
  matchingRows,
  visibleColumns,
  labels,
  announce,
}: {
  enableExport: boolean;
  manualPagination: boolean;
  onExport: DataTableProps<TData>["onExport"];
  exportFilename: string;
  selectedRows: () => TData[];
  matchingRows: DtRow<TData>[];
  visibleColumns: DataTableColumn<TData>[];
  labels: DataTableLabels;
  announce: (text: string) => void;
}) {
  // Server-side the table only has the current page: the toolbar export needs onExport there.
  const canExportAll = enableExport && (!manualPagination || Boolean(onExport));
  const runExport = (scope: "filtered" | "selected") => {
    const source = scope === "selected" ? selectedRows() : matchingRows.map((r) => r.original);
    if (onExport) {
      onExport(source, scope);
    } else {
      const cols = visibleColumns.filter((c) => c.enableExport !== false);
      const headers = cols.map((c) => c.header);
      const rows = source.map((row) =>
        cols.map((c): CsvValue => {
          if (c.exportValue) return c.exportValue(row);
          const value = readValue(c, row);
          return value instanceof Date || typeof value === "number" || typeof value === "boolean"
            ? value
            : stringify(value);
        }),
      );
      // The CSV writer loads on first export: no page that only shows the table pays for it.
      void import("../lib/csv").then(({ downloadCsv, toCsv }) => {
        downloadCsv(scope === "selected" ? `${exportFilename}-selected` : exportFilename, toCsv(headers, rows));
      });
    }
    announce(`${labels.exportCsv}: ${labels.results(source.length)}`);
  };
  return { canExportAll, runExport };
}
