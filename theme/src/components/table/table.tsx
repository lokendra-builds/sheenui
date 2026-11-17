"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps, type Ref } from "react";

import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/form";

/** Props of {@link Table}. The attributes of a `table` plus the ones below. */
export type TableProps = Omit<ComponentProps<"table">, "ref"> & {
  /** Ref to the scrolling region around the table, the outer element (like every other component's root). */
  ref?: Ref<HTMLDivElement>;
  /** Accessible name of the scrolling region while the table overflows. Defaults to the text of the `TableCaption`. */
  regionLabel?: string;
  /** Extra classes for the `<table>` itself. `className` styles the outer scrolling glass region. */
  tableClassName?: string;
};

/** Whether the table is wider than its region (so the region needs to be a keyboard-scrollable tab stop), and the caption text. */
function useOverflow(region: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState({ overflow: false, caption: "" });
  useLayoutEffect(() => {
    const el = region.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const overflow = el.scrollWidth > el.clientWidth + 1;
      const caption = el.querySelector("caption")?.textContent.trim() ?? "";
      setState((prev) => (prev.overflow === overflow && prev.caption === caption ? prev : { overflow, caption }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const table = el.querySelector("table");
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, [region]);
  return state;
}

/**
 * Plain, styled table primitives for small static tables: a pricing comparison, a spec sheet, a list of keys. They are real
 * `<table>` elements with glass-friendly styling and nothing else. For sorting, filtering, paging or selection use `DataTable`.
 *
 * - Compose `Table`, `TableCaption`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` (a column or row header)
 *   and `TableCell`, like HTML.
 * - `Table` puts the table in a horizontally scrolling glass region, so it never breaks a narrow page. `className` and `ref`
 *   belong to that outer region; `tableClassName` styles the `<table>`, and every other attribute lands on the `<table>`.
 * - Always give the table a `TableCaption` (visible, or `className="sr-only"`) so it has a name; the scrolling region takes
 *   the caption's text as its name unless you pass `regionLabel`.
 *
 * Keyboard: while the table is wider than its space the region becomes a tab stop, so the arrow keys scroll it sideways without
 * a mouse; a table that fits adds no tab stop.
 * Accessibility: native table semantics; use `scope` on `TableHead` (`col` or `row`); an overflowing region is a named `region`.
 * Glass and motion: one `glass-2` surface around the table; rows tint on hover. No movement.
 *
 * @example
 * ```tsx
 * import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableCaption>Plan limits</TableCaption>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead scope="col">Plan</TableHead>
 *           <TableHead scope="col">Seats</TableHead>
 *         </TableRow>
 *       </TableHeader>
 *       <TableBody>
 *         <TableRow>
 *           <TableCell>Free</TableCell>
 *           <TableCell>1</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function Table({ className, tableClassName, regionLabel, ref, ...props }: TableProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const { overflow, caption } = useOverflow(regionRef);
  const mergedRef = useMergedRef(regionRef, ref);
  const label = regionLabel ?? (caption || undefined);
  return (
    <div
      ref={mergedRef}
      data-slot="table-region"
      // A scrollable region must be keyboard-focusable so it can be scrolled without a mouse, but only while it actually scrolls.
      role={overflow ? "region" : undefined}
      aria-label={overflow ? label : undefined}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable only while the table overflows, so it can be scrolled without a mouse
      tabIndex={overflow ? 0 : undefined}
      className={cn(
        "glass-2 w-full overflow-x-auto rounded-sheen-lg [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        className,
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full min-w-max text-start text-sm [:where(&)_th]:text-start", tableClassName)}
        {...props}
      />
    </div>
  );
}

/**
 * The caption of a {@link Table}: its accessible name. Visible above the table by default; add `className="sr-only"` to hide it.
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Table, TableCaption } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableCaption>Example</TableCaption>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("px-4 py-3 text-start text-xs text-sheen-fg-muted", className)}
      {...props}
    />
  );
}

/**
 * The header rows of a {@link Table} (`<thead>`).
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Table, TableHead, TableHeader, TableRow } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead scope="col">Plan</TableHead>
 *         </TableRow>
 *       </TableHeader>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("text-xs text-sheen-fg-muted [&_tr]:border-b [&_tr]:border-sheen-border", className)}
      {...props}
    />
  );
}

/**
 * The body rows of a {@link Table} (`<tbody>`).
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Table, TableBody, TableCell, TableRow } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableBody>
 *         <TableRow>
 *           <TableCell>Free</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

/**
 * The footer rows of a {@link Table} (`<tfoot>`): totals.
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Table, TableCell, TableFooter, TableRow } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableFooter>
 *         <TableRow>
 *           <TableCell>Total</TableCell>
 *         </TableRow>
 *       </TableFooter>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot data-slot="table-footer" className={cn("border-t border-sheen-border font-medium", className)} {...props} />
  );
}

/**
 * One row of a {@link Table} (`<tr>`); it tints on hover.
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Table, TableBody, TableCell, TableRow } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableBody>
 *         <TableRow>
 *           <TableCell>Free</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-sheen-border transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A header cell of a {@link Table} (`<th>`). Pass `scope="col"` or `scope="row"`.
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Table, TableHead, TableHeader, TableRow } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead scope="col">Plan</TableHead>
 *         </TableRow>
 *       </TableHeader>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return <th data-slot="table-head" className={cn("px-4 py-3 font-medium whitespace-nowrap", className)} {...props} />;
}

/**
 * A data cell of a {@link Table} (`<td>`).
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Table, TableBody, TableCell, TableRow } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Table>
 *       <TableBody>
 *         <TableRow>
 *           <TableCell>Free</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 *
 * @see /components/table
 */
export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("px-4 py-3 align-middle text-sheen-fg", className)} {...props} />;
}
