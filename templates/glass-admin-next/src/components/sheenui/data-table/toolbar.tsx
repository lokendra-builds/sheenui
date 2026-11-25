"use client";

import type { ReactNode, RefObject } from "react";

import { cn } from "../lib/cn";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Select } from "../select/select";
import { ViewMenu } from "./column-menu";
import { CloseIcon, DownloadIcon, PlusCircleIcon, SearchIcon } from "./icons";
import {
  DataMenu,
  DataMenuCheckboxItem,
  DataMenuContent,
  DataMenuGroup,
  DataMenuItem,
  DataMenuLabel,
  DataMenuSeparator,
  DataMenuTrigger,
} from "./menu";
import type { Setter } from "./shared";
import type {
  DataTableColumn,
  DataTableColumnFilters,
  DataTableColumnVisibility,
  DataTableDensity,
  DataTableFilterOption,
  DataTableLabels,
  DataTableSorting,
} from "./types";

/** The toolbar above the table: search, faceted filters, the phone sort select, export and the View menu. */
export function Toolbar<TData>({
  labels,
  toolbarLeft,
  toolbarRight,
  enableSearch,
  enableSorting,
  enableViewOptions,
  canExportAll,
  cards,
  total,
  density,
  setDensity,
  sorting,
  setSorting,
  columns,
  visibleColumns,
  columnVisibility,
  setColumnVisibility,
  searchRef,
  searchInput,
  setSearchInput,
  applySearch,
  clearSearch,
  facetedColumns,
  facetOptions,
  filterValues,
  setFilter,
  runExport,
}: {
  labels: DataTableLabels;
  toolbarLeft: ReactNode;
  toolbarRight: ReactNode;
  enableSearch: boolean;
  enableSorting: boolean;
  enableViewOptions: boolean;
  canExportAll: boolean;
  cards: boolean;
  total: number;
  density: DataTableDensity;
  setDensity: (density: DataTableDensity) => void;
  sorting: DataTableSorting;
  setSorting: Setter<DataTableSorting>;
  columns: DataTableColumn<TData>[];
  visibleColumns: DataTableColumn<TData>[];
  columnVisibility: DataTableColumnVisibility;
  setColumnVisibility: Setter<DataTableColumnVisibility>;
  searchRef: RefObject<HTMLInputElement | null>;
  searchInput: string;
  setSearchInput: (value: string) => void;
  applySearch: (value: string) => void;
  clearSearch: () => void;
  facetedColumns: DataTableColumn<TData>[];
  facetOptions: (col: DataTableColumn<TData>) => DataTableFilterOption[];
  filterValues: (columnId: string) => string[];
  setFilter: (columnId: string, values: string[]) => void;
  runExport: (scope: "filtered" | "selected") => void;
}) {
  const sortableColumns = visibleColumns.filter((c) => enableSorting && c.enableSorting !== false);
  // Short visible options ("Signed up ↓") so the select fits beside Export and View on a phone.
  const sortOption = (text: string, short: string) => (
    <>
      <span aria-hidden>{short}</span>
      <span className="sr-only">{text}</span>
    </>
  );
  const sortSelect = cards && sortableColumns.length > 0 && (
    <Select
      aria-label={labels.sortBy}
      className="w-auto min-w-0 flex-1"
      triggerClassName="min-w-0"
      value={sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}` : "__none"}
      onValueChange={(v) => {
        if (!v || v === "__none") {
          setSorting([]);
          return;
        }
        const [colId, dir] = v.split(":");
        setSorting([{ id: colId ?? "", desc: dir === "desc" }]);
      }}
      items={[
        { value: "__none", label: labels.sortDefault },
        ...sortableColumns.flatMap((c) => [
          { value: `${c.id}:asc`, label: sortOption(labels.sortOptionAsc(c.header), `${c.header} ↑`) },
          { value: `${c.id}:desc`, label: sortOption(labels.sortOptionDesc(c.header), `${c.header} ↓`) },
        ]),
      ]}
    />
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {toolbarLeft}
      {enableSearch && (
        <Input
          ref={searchRef}
          type="search"
          aria-label={labels.searchLabel}
          placeholder={labels.searchPlaceholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applySearch(searchInput);
            if (e.key === "Escape" && searchInput) {
              e.preventDefault();
              clearSearch();
            }
          }}
          autoComplete="off"
          spellCheck={false}
          className="w-full sm:w-64 lg:w-72"
          // 44px tall on touch (the field's border would otherwise leave the input at 42px).
          inputClassName="[&::-webkit-search-cancel-button]:appearance-none any-pointer-coarse:h-11"
          leading={<SearchIcon />}
          trailing={
            searchInput ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={labels.clearSearch}
                className="relative -me-1.5 flex size-7 items-center justify-center rounded-sheen-full text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus any-pointer-coarse:after:absolute any-pointer-coarse:after:size-11"
              >
                <CloseIcon className="size-3.5" />
              </button>
            ) : undefined
          }
        />
      )}
      {facetedColumns.map((col) => (
        <FacetedFilter
          key={col.id}
          title={col.header}
          options={facetOptions(col)}
          selected={filterValues(col.id)}
          onChange={(values) => setFilter(col.id, values)}
          labels={labels}
        />
      ))}
      {/* Cards: the sort select shares one row with Export / View and takes the spare width. */}
      <div className={cn("flex items-center gap-2", sortSelect ? "w-full min-w-0" : "ms-auto flex-wrap")}>
        {sortSelect}
        {toolbarRight}
        {canExportAll && (
          <Button
            variant="glass"
            className="h-11"
            leading={<DownloadIcon />}
            onClick={() => runExport("filtered")}
            disabled={total === 0}
          >
            <span className="max-sm:sr-only">{labels.exportCsv}</span>
          </Button>
        )}
        {enableViewOptions && (
          <ViewMenu
            labels={labels}
            density={density}
            onDensityChange={setDensity}
            columns={columns}
            isVisible={(colId) => columnVisibility[colId] !== false}
            visibleCount={visibleColumns.length}
            onToggle={(colId, on) => {
              setColumnVisibility((v) => ({ ...v, [colId]: on }));
              // A hidden column can't show its sort arrow: drop its sort rather than sort invisibly.
              if (!on && sorting.some((s) => s.id === colId)) setSorting((prev) => prev.filter((s) => s.id !== colId));
            }}
          />
        )}
      </div>
    </div>
  );
}

/** One faceted filter: a menu of checkable options with counts, plus a clear item. */
export function FacetedFilter({
  title,
  options,
  selected,
  onChange,
  labels,
}: {
  title: string;
  options: DataTableFilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  labels: DataTableLabels;
}) {
  const set = new Set(selected);
  return (
    <DataMenu>
      <DataMenuTrigger
        render={
          <Button
            data-dt-filter=""
            variant="glass"
            className={cn("h-11 px-3.5", set.size > 0 && "border-sheen-accent-border")}
            aria-label={labels.filterSelected(title, set.size)}
            leading={<PlusCircleIcon className={cn("text-sheen-fg-muted", set.size > 0 && "text-sheen-accent")} />}
          />
        }
      >
        <span className="inline-flex items-center gap-2">
          {title}
          {set.size > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-sheen-full bg-sheen-accent-soft px-1.5 text-2xs font-semibold text-sheen-accent tabular-nums">
              {set.size}
            </span>
          )}
        </span>
      </DataMenuTrigger>
      <DataMenuContent className="w-60">
        <DataMenuGroup>
          <DataMenuLabel>{title}</DataMenuLabel>
          {options.map((option) => (
            <DataMenuCheckboxItem
              key={option.value}
              checked={set.has(option.value)}
              onCheckedChange={(on) => {
                const next = new Set(set);
                if (on) next.add(option.value);
                else next.delete(option.value);
                // Keep the option order, not the click order.
                onChange(options.map((o) => o.value).filter((v) => next.has(v)));
              }}
              trailing={
                option.count !== undefined && (
                  <span className="ms-auto ps-3 text-xs text-sheen-fg-muted tabular-nums">
                    <span aria-hidden>{option.count.toLocaleString()}</span>
                    {/* "Owner, 28 rows" rather than "Owner 28". */}
                    <span className="sr-only">, {labels.facetCount(option.count)}</span>
                  </span>
                )
              }
            >
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
            </DataMenuCheckboxItem>
          ))}
        </DataMenuGroup>
        {set.size > 0 && (
          <>
            <DataMenuSeparator />
            <DataMenuItem onClick={() => onChange([])} className="justify-center text-sheen-fg-muted">
              {labels.clearFilter}
            </DataMenuItem>
          </>
        )}
      </DataMenuContent>
    </DataMenu>
  );
}

/** The removable chips for the active faceted filters, plus a "Clear filters" button. */
export function FilterChips<TData>({
  columnFilters,
  colById,
  labels,
  chipsRef,
  searchRef,
  setFilter,
  clearFilters,
  focusIfLost,
  focusAnchor,
}: {
  columnFilters: DataTableColumnFilters;
  colById: Map<string, DataTableColumn<TData>>;
  labels: DataTableLabels;
  chipsRef: RefObject<HTMLDivElement | null>;
  searchRef: RefObject<HTMLInputElement | null>;
  setFilter: (columnId: string, values: string[]) => void;
  clearFilters: () => void;
  focusIfLost: (pick: () => HTMLElement | null | undefined) => void;
  focusAnchor: () => HTMLElement | null;
}) {
  let chipCount = 0;
  return (
    <div
      ref={chipsRef}
      role="group"
      aria-label={labels.filterChipsLabel}
      className="flex flex-wrap items-center gap-1.5"
    >
      {columnFilters.flatMap((f) => {
        const col = colById.get(f.id);
        if (!col) return [];
        const options = col.filterOptions;
        return f.value.map((value) => {
          const label = options?.find((o) => o.value === value)?.label ?? value;
          const chipIndex = chipCount++;
          return (
            <button
              key={`${f.id}:${value}`}
              type="button"
              data-dt-chip=""
              onClick={() => {
                setFilter(
                  f.id,
                  f.value.filter((v) => v !== value),
                );
                // Focus the chip that took this one's place, else the one before, else the search box.
                focusIfLost(() => {
                  const rest = chipsRef.current?.querySelectorAll<HTMLElement>("[data-dt-chip]");
                  return rest?.[Math.min(chipIndex, rest.length - 1)] ?? searchRef.current ?? focusAnchor();
                });
              }}
              aria-label={labels.removeFilter(col.header, label)}
              className={cn(
                "group/chip relative inline-flex h-8 items-center gap-1.5 rounded-sheen-full border border-sheen-accent-border bg-sheen-accent-soft ps-3 pe-1.5 text-xs font-medium text-sheen-fg",
                "transition-colors hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                "any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:-translate-y-1/2",
              )}
            >
              <span className="text-sheen-fg-muted">{col.header}:</span>
              {label}
              <span
                aria-hidden
                className="flex size-5 items-center justify-center rounded-full group-hover/chip:bg-sheen-hover"
              >
                <CloseIcon className="size-3" />
              </span>
            </button>
          );
        });
      })}
      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sheen-fg-muted hover:text-sheen-fg">
        {labels.clearFilters}
      </Button>
    </div>
  );
}
