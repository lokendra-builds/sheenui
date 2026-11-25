"use client";

import { useCallback, useDeferredValue, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { RowData } from "@tanstack/react-table";

import { cn } from "../lib/cn";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { useMediaQuery } from "../hooks/use-media-query";
import { highlightText } from "./cells";
import { HeaderRow } from "./header";
import { useTableModel } from "./model";
import {
  useAnnouncements,
  useCsvExport,
  useDebouncedSearch,
  useFocusRestore,
  useRowSelection,
  useScrollEdges,
  useScrollFocusClearance,
  useSelectionBarClearance,
  useTableState,
} from "./hooks";
import { useKeepFocusOnReorder } from "../motion/reorder";
import { defaultDataTableLabels } from "./labels";
import { RowActionsHost, createRowMenuHandle } from "./column-menu";
import { BodyRows, CardList, SkeletonRows } from "./rows";
import { SelectionBanner, SelectionBar } from "./selection";
import { EMPTY, EXPAND_W, PAGE_SIZES, SELECT_W, readValue, stringify, type GridEnv } from "./shared";
import { EdgeFades, EmptyBlock, ErrorBlock, LoadingOverlays, StaleErrorAlert } from "./states";
import { FilterChips, Toolbar } from "./toolbar";
import { TableFooter } from "./pagination";
import { VIRTUALIZE_FROM, useRowWindow } from "./row-window";
import type {
  DataTableColumn,
  DataTableFilterOption,
  DataTableLabels,
  DataTableProps,
  DataTableRowAction,
} from "./types";

/**
 * DataTable: a glass data grid built on TanStack Table v9 (headless) and SheenUI parts.
 *
 * Client-side by default (search, faceted filters, multi-sort, pagination happen in the
 * browser); pass `manual` + `rowCount` and the controlled state callbacks to let a server
 * do the work. Semantic <table> markup throughout: caption, scoped headers, aria-sort,
 * labelled checkboxes, and one polite live region that announces sort, page, selection
 * and result-count changes.
 *
 * Motion: rows slide to their new place when sorting, filtering or paging reorders them (`animateRows`,
 * on by default, built on `useRowReorder` from motion/reorder; see AnimatedList for the same effect on
 * any list), the selection bar slides up, detail rows open by height, the current-page pill
 * glides. Everything is instant (or a plain fade) with reduced motion. Glass elements are
 * animated themselves; no wrapper around glass is ever faded.
 */

/**
 * A full data table: global search with highlighted matches, multi-column sorting, faceted
 * filters, row selection with bulk actions, column visibility and density, paging, CSV export,
 * expandable rows, row action menus, a card layout on phones, and a server-side mode. Use it for
 * admin lists and reports; it works from plain row objects, with no table library to wire up.
 *
 * Props: see {@link DataTableProps}. Required: `data`, `columns` ({@link DataTableColumn}) and
 * `caption`. Features (all optional): `enableSearch` / `enableSelection` / `enableViewOptions` /
 * `enableExport` / `enableSorting` / `enableMultiSort`, `stickyFirstColumn`, `animateRows` (true), `maxHeight`,
 * `pageSizeOptions`, `defaultPageSize` (10), `hidePagination`, `rowActions`, `renderExpanded`,
 * `bulkActions`, `mobileLayout` ("scroll" | "cards"), `loading`, `error` / `onRetry`, `emptyState`,
 * `density`, controlled state for sorting, pagination, search, filters, selection and visibility,
 * `manual` server mode with `rowCount`, `labels`, `className`.
 *
 * Keyboard: Tab moves through the toolbar, sortable headers (Enter or Space sorts; Shift-click or Shift+Enter adds a sort), row checkboxes, row menus and the pager. Menus use arrow keys, Home / End, typeahead and Escape. A table that overflows becomes a keyboard-scrollable region.
 * Accessibility: A real `<table>` with a caption, `aria-sort` on sorted headers and a screen-reader sort hint; selection, filtering and paging changes are announced politely (result counts, "3 selected", the new page); checkboxes and menus carry row-specific names ("Select row Ravi Kumar"). The card layout keeps the same labels. Fully translatable through `labels`.
 * Glass: One glass panel around the table, plus the shared glass menus and selection bar; the table body itself is flat, so a page of tables stays within the backdrop-blur budget.
 * Motion: Rows slide to their new place on a sort or filter (`animateRows`, default true; transform only, `spring.smooth`; for other lists see `AnimatedList`), and the selection bar and menus use short transform and opacity transitions; reduced motion removes them.
 *
 * @example
 * ```tsx
 * import { DataTable, type DataTableColumn } from "@sheenui/theme";
 *
 * type Person = { id: string; name: string; role: string };
 *
 * const columns: DataTableColumn<Person>[] = [
 *   { id: "name", header: "Name", accessorKey: "name" },
 *   { id: "role", header: "Role", accessorKey: "role", filter: "faceted" },
 * ];
 *
 * export const People = ({ people }: { people: Person[] }) => (
 *   <DataTable data={people} columns={columns} caption="Team members" enableSelection />
 * );
 * ```
 *
 * @see /components/data-table
 */
export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    getRowId: getRowIdProp,
    getRowLabel,
    caption,
    showCaption = false,
    id,
    "aria-label": ariaLabel,
    className,
    tableClassName,
    enableSearch = true,
    searchDebounceMs = 200,
    enableSelection = false,
    enableViewOptions = true,
    enableExport = true,
    exportFilename = "data",
    onExport,
    enableSorting = true,
    enableMultiSort = true,
    stickyFirstColumn = true,
    animateRows = true,
    maxHeight,
    virtualize = "auto",
    pageSizeOptions = PAGE_SIZES,
    defaultPageSize = 10,
    hidePagination = false,
    rowActions,
    renderExpanded,
    bulkActions = EMPTY,
    toolbarLeft,
    toolbarRight,
    mobileLayout = "scroll",
    loading = false,
    error,
    onRetry,
    emptyState,
    manual = false,
    rowCount,
  } = props;

  const manualPagination = props.manualPagination ?? manual;
  const manualSorting = props.manualSorting ?? manual;
  const manualFiltering = props.manualFiltering ?? manual;
  const labels: DataTableLabels = useMemo(() => ({ ...defaultDataTableLabels, ...props.labels }), [props.labels]);
  const reduced = useSheenReducedMotion();
  const uid = useId();
  const captionId = `${uid}-caption`;
  const sortHintId = `${uid}-sort-hint`;
  const rowsPerPageId = `${uid}-rows-per-page`;

  /* ----- state (each slice controlled or uncontrolled) ----- */
  const {
    sorting: sortingNow,
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
  } = useTableState(props, columns, defaultPageSize);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // The header and the rows take a new sort together, in a low-priority render that React slices, so re-ordering
  // a long page never blocks input in one long task. Server-side sorting has nothing to re-order: no delay.
  const deferredSorting = useDeferredValue(sortingNow);
  const sorting = manualSorting ? sortingNow : deferredSorting;

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useKeepFocusOnReorder(scrollRef);
  const { focusAnchor, focusIfLost, focusRowActions } = useFocusRestore(scrollRef, searchRef);

  const resetPage = useCallback(
    () => setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })),
    [setPagination],
  );

  const { searchInput, setSearchInput, applySearch, clearSearch, query } = useDebouncedSearch({
    globalFilter,
    setGlobalFilter,
    resetPage,
    searchDebounceMs,
    searchRef,
  });

  /* ----- columns → TanStack, rows and paging ----- */
  const {
    colById,
    getRowId,
    table,
    rows,
    matchingRows,
    total,
    pageCount,
    page,
    from,
    to,
    visibleColumns,
    firstColumn,
    filtersActive,
    rowLabel,
  } = useTableModel({
    data,
    columns,
    getRowId: getRowIdProp,
    getRowLabel,
    enableSorting,
    enableMultiSort,
    sorting,
    setSorting,
    pagination,
    setPagination,
    query,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount,
    loading,
  });

  /* ----- selection (row ids; persists across pages and sorting) ----- */
  const {
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
  } = useRowSelection({
    data,
    getRowId,
    rows,
    matchingRows,
    table,
    rowSelection,
    setRowSelection,
    manualPagination,
    pagination,
  });

  /* ----- live region ----- */
  const { message, announce } = useAnnouncements({
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
  });

  /* ----- filters ----- */
  const facetedColumns = columns.filter((c) => c.filter === "faceted");
  const filterValues = (columnId: string) => columnFilters.find((f) => f.id === columnId)?.value ?? EMPTY;
  const setFilter = (columnId: string, values: string[]) => {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== columnId);
      return values.length ? [...rest, { id: columnId, value: values }] : rest;
    });
    resetPage();
  };
  const clearFilters = () => {
    setColumnFilters([]);
    resetPage();
    focusIfLost(
      () => searchRef.current ?? rootRef.current?.querySelector<HTMLElement>("[data-dt-filter]") ?? focusAnchor(),
    );
  };
  const facetOptions = (col: DataTableColumn<TData>): DataTableFilterOption[] => {
    const raw = manualFiltering ? null : table.getColumn(col.id)?.getFacetedUniqueValues();
    // TanStack keys counts by the raw value (number, boolean, …); options and filters use strings.
    let counts: Map<string, number> | null = null;
    if (raw) {
      counts = new Map();
      for (const [key, n] of raw as Map<unknown, number>) {
        const k = stringify(key);
        counts.set(k, (counts.get(k) ?? 0) + n);
      }
    }
    const base =
      col.filterOptions ??
      [...(counts?.keys() ?? [])]
        .filter((v) => v !== "")
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((v) => ({ value: v, label: v }));
    return base.map((o: DataTableFilterOption) => ({ ...o, count: counts ? (counts.get(o.value) ?? 0) : o.count }));
  };

  /* ----- export ----- */
  const { canExportAll, runExport } = useCsvExport({
    enableExport,
    manualPagination,
    onExport,
    exportFilename,
    selectedRows,
    matchingRows,
    visibleColumns,
    labels,
    announce,
  });

  /* ----- layout ----- */
  const narrow = useMediaQuery("(max-width: 639.98px)");
  const cards = narrow && mobileLayout === "cards";
  const edges = useScrollEdges(scrollRef, headRef, cards);
  const actionsFor = useCallback(
    (row: TData): DataTableRowAction<TData>[] =>
      rowActions ? (typeof rowActions === "function" ? rowActions(row) : rowActions) : EMPTY,
    [rowActions],
  );
  const hasActions = Boolean(rowActions);
  const [rowMenu] = useState(createRowMenuHandle<TData>);
  const pinStartCols = stickyFirstColumn; // checkbox + chevron columns
  const pinFirst = stickyFirstColumn && Boolean(firstColumn);
  const firstLeft = (enableSelection ? SELECT_W : 0) + (renderExpanded ? EXPAND_W : 0);
  /** The start-pinned column that carries the edge shadow. */
  const lastPinned = pinFirst
    ? "first"
    : !pinStartCols
      ? null
      : renderExpanded
        ? "expand"
        : enableSelection
          ? "select"
          : null;
  // Phones: the pinned columns take at most about 45% of the screen (cell padding included); the rest scrolls beside them.
  // Only the value is set here; the cap itself is a `max-sm:` rule, so the server HTML and the hydrated page lay out alike.
  const pinCap = pinFirst ? `max(5rem, calc(45vw - ${firstLeft + (density === "compact" ? 1.5 : 2)}rem))` : undefined;
  const colCount = visibleColumns.length + (enableSelection ? 1 : 0) + (renderExpanded ? 1 : 0) + (hasActions ? 1 : 0);
  const initialLoading = loading && rows.length === 0 && !error;
  const refetching = loading && rows.length > 0;
  /** A request failed but the previous rows are still shown: the alert floats over them (no layout shift). */
  const staleError = Boolean(error) && rows.length > 0;
  const compact = density === "compact";
  const cellPad = compact ? "px-3 py-1.5" : "px-4 py-3";
  // Opaque once rows slide underneath: translucent pinned cells let the scrolled text ghost through.
  const pinnedBg = "group-data-scrolled-x/dt:bg-sheen-surface";

  const highlight = useCallback((text: string | number | null | undefined) => highlightText(text, query), [query]);

  const renderCell = useCallback(
    (col: DataTableColumn<TData>, row: TData, rowId: string): ReactNode => {
      const value = readValue(col, row);
      if (col.cell) return col.cell({ row, rowId, value, highlight, query, density });
      const text = stringify(value);
      return col.searchable === false ? text : highlight(text);
    },
    [highlight, query, density],
  );

  const toggleExpanded = useCallback((rowId: string) => setExpanded((e) => ({ ...e, [rowId]: !e[rowId] })), []);

  useScrollFocusClearance(scrollRef, headRef, cards);
  useSelectionBarClearance(rootRef, barRef, enableSelection);

  const env: GridEnv<TData> = {
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
    visibleColumns,
    colById,
    pageIds,
    allPageSelected,
    somePageSelected,
    setSelected,
    rowMenu,
  };

  const errorText = error === true ? null : error;
  const retry =
    onRetry &&
    (() => {
      onRetry();
      // The error (and its Retry button) usually goes away.
      focusIfLost(focusAnchor);
    });
  const errorBlock = <ErrorBlock labels={labels} errorText={errorText} retry={retry} loading={loading} />;
  const emptyBlock = emptyState ?? (
    <EmptyBlock
      labels={labels}
      query={query}
      filtersActive={filtersActive}
      clearSearch={clearSearch}
      clearFilters={clearFilters}
    />
  );

  const bodyState: ReactNode =
    error && rows.length === 0 ? errorBlock : !loading && rows.length === 0 ? emptyBlock : null;
  const hasBodyState = bodyState !== null;

  /* ----- table markup ----- */

  const windowed =
    !cards &&
    !initialLoading &&
    (virtualize === true || (virtualize === "auto" && maxHeight !== undefined && rows.length >= VIRTUALIZE_FROM));
  const rowIds = useMemo(() => rows.map((r) => r.id), [rows]);
  // Row heights from the skeleton (h-10 / h-[3.25rem]), until a real row has been measured.
  const { window: rowWindow, report: reportRowSize } = useRowWindow(scrollRef, rowIds, windowed, compact ? 40 : 52);
  const rowProps = {
    rowWindow,
    reportRowSize,
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
    animateRows,
  };
  const tableView = (
    <table
      data-slot="data-table-table"
      aria-busy={loading || undefined}
      aria-rowcount={rowWindow ? rows.length + 1 : undefined}
      aria-describedby={undefined}
      className={cn("w-full border-separate border-spacing-0 text-sm", compact && "text-[0.8125rem]")}
    >
      <caption
        id={captionId}
        className={showCaption ? "px-4 pt-4 pb-2 text-start text-base font-semibold text-sheen-fg" : "sr-only"}
      >
        {caption}
      </caption>
      <thead
        ref={headRef}
        className={cn(
          "sticky top-0 z-[2]",
          // Only tinted once rows slide underneath.
          "[&_th]:transition-[background-color] group-data-scrolled-y/dt:[&_th]:bg-sheen-surface",
        )}
      >
        <HeaderRow
          env={env}
          table={table}
          sorting={sorting}
          setSorting={setSorting}
          enableMultiSort={enableMultiSort}
          sortHintId={sortHintId}
          indexed={rowWindow !== null}
        />
      </thead>
      <tbody>
        {initialLoading ? (
          <SkeletonRows env={env} pageSize={pagination.pageSize} />
        ) : bodyState ? (
          <tr>
            <td colSpan={colCount} className="p-0">
              <div style={{ width: edges.width || undefined }} className="sticky start-0">
                {bodyState}
              </div>
            </td>
          </tr>
        ) : (
          <BodyRows {...rowProps} edgesWidth={edges.width} />
        )}
      </tbody>
    </table>
  );

  return (
    <div ref={rootRef} id={id} data-slot="data-table" className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      <Toolbar
        labels={labels}
        toolbarLeft={toolbarLeft}
        toolbarRight={toolbarRight}
        enableSearch={enableSearch}
        enableSorting={enableSorting}
        enableViewOptions={enableViewOptions}
        canExportAll={canExportAll}
        cards={cards}
        total={total}
        density={density}
        setDensity={setDensity}
        sorting={sorting}
        setSorting={setSorting}
        columns={columns}
        visibleColumns={visibleColumns}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        searchRef={searchRef}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        applySearch={applySearch}
        clearSearch={clearSearch}
        facetedColumns={facetedColumns}
        facetOptions={facetOptions}
        filterValues={filterValues}
        setFilter={setFilter}
        runExport={runExport}
      />
      {filtersActive && (
        <FilterChips
          columnFilters={columnFilters}
          colById={colById}
          labels={labels}
          chipsRef={chipsRef}
          searchRef={searchRef}
          setFilter={setFilter}
          clearFilters={clearFilters}
          focusIfLost={focusIfLost}
          focusAnchor={focusAnchor}
        />
      )}

      <div className={cn("glass-2 relative min-w-0 overflow-hidden rounded-sheen-xl", tableClassName)}>
        {enableSelection && !manualPagination && allPageSelected && total > rows.length && (
          <SelectionBanner
            labels={labels}
            total={total}
            pageRowCount={rows.length}
            selectedMatching={selectedMatching}
            matchingRows={matchingRows}
            setSelected={setSelected}
            clearSelection={clearSelection}
            focusIfLost={focusIfLost}
            focusAnchor={focusAnchor}
          />
        )}
        <div className="group/dtw relative">
          <div
            ref={scrollRef}
            // A named, focusable region only while it scrolls (WCAG 2.1.1); otherwise the table speaks for itself.
            role={edges.overflow ? "region" : undefined}
            aria-label={edges.overflow ? (ariaLabel ?? labels.scrollRegion(caption)) : undefined}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard focusable (WCAG 2.1.1); focusable only while it scrolls
            tabIndex={edges.overflow ? 0 : -1}
            style={{
              // Cards flow with the page on phones: no small scroll box inside the scrolling page.
              maxHeight: cards ? undefined : maxHeight,
              // Keep focused cells clear of the sticky header and the pinned columns (WCAG 2.4.11).
              scrollPaddingBlockStart: cards ? undefined : edges.headerHeight,
              scrollPaddingInlineStart: cards ? undefined : edges.pinStart,
              scrollPaddingInlineEnd: cards ? undefined : edges.pinEnd,
            }}
            className={cn(
              "group/dt relative overflow-auto overscroll-x-contain [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
              "rounded-t-[inherit]",
            )}
          >
            {cards ? (
              <CardList
                {...rowProps}
                captionId={captionId}
                caption={caption}
                showCaption={showCaption}
                initialLoading={initialLoading}
                hasBodyState={hasBodyState}
                bodyState={bodyState}
                pageSize={pagination.pageSize}
              />
            ) : (
              tableView
            )}
          </div>

          {/* Edge fades: there is more to scroll on that side. */}
          {!cards && <EdgeFades hasActions={hasActions} lastPinned={lastPinned} />}
          <LoadingOverlays
            cards={cards}
            headerHeight={edges.headerHeight}
            loading={loading}
            veil={refetching || staleError}
          />
        </div>
        {staleError && <StaleErrorAlert labels={labels} errorText={errorText} retry={retry} loading={loading} />}
        {!hidePagination && (
          <TableFooter
            labels={labels}
            caption={caption}
            pagination={pagination}
            setPagination={setPagination}
            pageSizeOptions={pageSizeOptions}
            rowsPerPageId={rowsPerPageId}
            initialLoading={initialLoading}
            from={from}
            to={to}
            total={total}
            page={page}
            pageCount={pageCount}
            cards={cards}
          />
        )}
      </div>

      {hasActions && <RowActionsHost handle={rowMenu} actionsFor={actionsFor} />}
      {enableSelection && (
        <SelectionBar
          barRef={barRef}
          count={selectedCount}
          hidden={hiddenSelected}
          labels={labels}
          reduced={reduced}
          onClear={clearSelection}
          onClosedWithFocus={() => focusAnchor()?.focus()}
          onExport={enableExport ? () => runExport("selected") : undefined}
          actions={bulkActions}
          getRows={selectedRows}
        />
      )}

      <span id={sortHintId} className="sr-only">
        {labels.sortHint}
      </span>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </div>
    </div>
  );
}
