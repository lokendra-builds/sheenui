"use client";

import { Fragment, useLayoutEffect, useMemo, type ReactNode } from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";

import { cn } from "../../lib/cn";
import { segmentByGroup } from "../../lib/group-segments";
import { useVirtualWindow } from "../../hooks/use-virtual-window";

/** What the windowed list needs to know about an option. @internal */
type WindowedItem = { value: string };

/** Where a row sits and how many options there are, for the row renderer. @internal */
export type WindowedPlacement = { index: number; total: number; top: number; height: number };

/** The handle `WindowedOptions` fills in so the Combobox can scroll to an option by its index. @internal */
export type WindowedScrollApi = { scrollToOption: (index: number) => void };

type Row<T> = { kind: "heading"; label: string } | { kind: "item"; item: T; index: number };

/**
 * The windowed option list of a Combobox: only the rows near the viewport exist. It reads the filtered items from Base UI,
 * lays rows out by hand (a fixed height, so nothing shifts) and gives Base UI the item index it navigates by. A heading row
 * appears where the group changes.
 *
 * @example
 * ```tsx
 * import { Combobox } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Combobox label="Item" options={[{ value: "a", label: "A" }]} virtualized />;
 * }
 * ```
 *
 * @see /components/combobox
 *
 * @internal
 */
export function WindowedOptions<T extends WindowedItem>({
  apiRef,
  selected,
  groupOf,
  otherGroup,
  hasGroups,
  hasDescriptions,
  renderItem,
  ...listProps
}: {
  apiRef: { current: WindowedScrollApi | null };
  selected: string[];
  groupOf: (item: T) => string | undefined;
  otherGroup: string;
  hasGroups: boolean;
  hasDescriptions: boolean;
  renderItem: (item: T, placement: WindowedPlacement) => ReactNode;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}) {
  const filtered = BaseCombobox.useFilteredItems<T>();
  const layout = useMemo(() => {
    const rows: Row<T>[] = [];
    const rowOfOption: number[] = [];
    let previous: string | null = null;
    filtered.forEach((item, index) => {
      const group = hasGroups ? (groupOf(item) ?? otherGroup) : "";
      if (group && group !== previous) rows.push({ kind: "heading", label: group });
      previous = group;
      rowOfOption.push(rows.length);
      rows.push({ kind: "item", item, index });
    });
    return { rows, rowOfOption };
  }, [filtered, hasGroups, groupOf, otherGroup]);
  const { rows, rowOfOption } = layout;
  const {
    ref: listRef,
    element,
    scrollToIndex,
    start,
    end,
    size,
    totalSize,
  } = useVirtualWindow({ count: rows.length, estimateSize: hasDescriptions ? 56 : 40, overscan: 8 });

  useLayoutEffect(() => {
    apiRef.current = {
      scrollToOption(index) {
        const row = rowOfOption[index];
        if (row === undefined) return;
        // Keep the group heading in view when the first option of a group is reached.
        if (rows[row - 1]?.kind === "heading") scrollToIndex(row - 1, "nearest");
        scrollToIndex(row, "nearest");
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, rows, rowOfOption, scrollToIndex]);

  // Opened on a selection: bring it to the middle of the list.
  useLayoutEffect(() => {
    if (!element) return;
    const at = rows.findIndex((r) => r.kind === "item" && selected.includes(r.item.value));
    if (at >= 0) scrollToIndex(at, "center");
  }, [element, rows, selected, scrollToIndex]);

  const heightClass = hasDescriptions ? "h-14" : "h-10 any-pointer-coarse:h-11";
  return (
    <BaseCombobox.List
      ref={listRef}
      {...listProps}
      className={cn(
        "max-h-[min(22rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain",
        rows.length > 0 && "p-1",
      )}
    >
      {rows.length > 0 && (
        <div role="presentation" className="relative w-full" style={{ height: totalSize }}>
          {segmentByGroup(
            rows.slice(start, end).map((row, offset) => ({ row, at: start + offset })),
            ({ row }) =>
              !hasGroups ? undefined : row.kind === "heading" ? row.label : (groupOf(row.item) ?? otherGroup),
          ).map((segment) => {
            const body = segment.entries.map(({ row, at }) =>
              row.kind === "heading" ? (
                <div
                  key={`h:${row.label}`}
                  role="presentation"
                  aria-hidden
                  data-vrow=""
                  className={cn(
                    "absolute inset-x-0 flex items-end truncate px-2.5 pb-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase select-none",
                    heightClass,
                  )}
                  style={{ top: at * size, height: size }}
                >
                  {row.label}
                </div>
              ) : (
                renderItem(row.item, { index: row.index, total: filtered.length, top: at * size, height: size })
              ),
            );
            // A named group per run of rows: the heading is not a node once it has scrolled out of the window.
            return segment.label ? (
              <div key={segment.key} role="group" aria-label={segment.label}>
                {body}
              </div>
            ) : (
              <Fragment key={segment.key}>{body}</Fragment>
            );
          })}
        </div>
      )}
    </BaseCombobox.List>
  );
}

/**
 * "N results" for the polite status region of a windowed list: the count comes from the data, not from the rendered rows.
 *
 * @example
 * ```tsx
 * import { Combobox } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Combobox label="Item" options={[{ value: "a", label: "A" }]} virtualized />;
 * }
 * ```
 *
 * @see /components/combobox
 *
 * @internal
 */
export function WindowedResultCount({ format }: { format: (count: number) => string }) {
  const count = BaseCombobox.useFilteredItems<WindowedItem>().length;
  return <span className="sr-only">{count > 0 ? format(count) : ""}</span>;
}
