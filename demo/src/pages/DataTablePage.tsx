import { Page, PropsTable } from "../layout/Page";
import { KeyboardTable } from "./DocSections";
import { href } from "../router";
import * as PROPS from "../generated/component-props";
import { lazyBlock } from "../layout/lazy-block";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { DataTableScene as DataTableSceneData } from "../layout/ShowcaseStage.data-table";
import { DataTableScene } from "../layout/ShowcaseStage.data-table.scene";

/* The examples below the first two are separate chunks, fetched once idle (the prerendered HTML holds them at full size).
   Each minHeight is the example's whole section at desktop width (measured on the built page, SSR and live agree), so the
   fallback a hydration race shows holds the same height as the server HTML and the finished example. */
const more = () => import("./DataTablePage/data-table-more");
const ServerExample = lazyBlock(() => more().then((m) => m.ServerExample), { minHeight: "61.25rem" });
const MinimalExample = lazyBlock(() => more().then((m) => m.MinimalExample), { minHeight: "32.75rem" });
const StatesExample = lazyBlock(() => more().then((m) => m.StatesExample), { minHeight: "69.75rem" });
const VirtualizedExample = lazyBlock(() => more().then((m) => m.VirtualizedExample), { minHeight: "41.25rem" });
const PaginationExample = lazyBlock(() => more().then((m) => m.PaginationExample), { minHeight: "29.25rem" });

import { AnimatedSortExample } from "./DataTablePage/animated-sort";

// The page's subject, the full-featured table, is an eager island: its chunk is requested while the page hydrates.
const FullExample = lazyBlock(() => import("./DataTablePage/data-table").then((m) => m.FullExample), {
  minHeight: "60rem",
  eager: true,
});

/* ---------- Page ---------- */

export function DataTablePage() {
  return (
    <Page
      eyebrow="Component"
      title="Data table"
      description="A typed, accessible glass data table on TanStack Table v9: search with highlights, faceted filters, multi-sort, pagination, selection with bulk actions, row menus, expandable rows, density, CSV export, loading / empty / error states, server-side mode and a card layout for phones."
      source={["theme/src/components/data-table/", "theme/src/components/pagination/pagination.tsx"]}
    >
      <ShowcaseStage<DataTableSceneData>
        label="Data table demo"
        story={() => import("../layout/ShowcaseStage.data-table")}
        initial={{ sort: "none" }}
        minHeight="26rem"
      >
        {(scene) => <DataTableScene scene={scene} />}
      </ShowcaseStage>
      <FullExample />
      <ServerExample />
      <MinimalExample />
      <AnimatedSortExample />
      <StatesExample />
      <VirtualizedExample />
      <PaginationExample />

      <KeyboardTable
        rows={[
          [
            "Tab / Shift + Tab",
            "Move through the toolbar, sortable headers, row checkboxes, row menus and the pager. A table that overflows becomes a focusable, scrollable region.",
          ],
          ["Enter / Space", "On a sortable header: sort by that column. On a checkbox or button: press it."],
          ["Shift + Enter (or Shift-click)", "On a sortable header: add the column to a multi-sort."],
          ["Shift-click", "On a row checkbox: select the range from the last one."],
          ["Escape", "In the search box: clear the search."],
          [
            "Arrow keys, Home / End, typeahead",
            "In the row, view and filter menus: move between items. Enter runs one; Escape closes the menu.",
          ],
        ]}
      />

      <section className="flex flex-col gap-3">
        <h2 id="accessibility" className="text-xl font-semibold tracking-tight">
          Accessibility
        </h2>
        <ul className="flex max-w-3xl list-disc flex-col gap-1.5 ps-5 text-sm text-pretty text-sheen-fg-muted">
          <li>
            Semantic table: a caption, column headers with scope, aria-sort on the primary sorted column. Secondary
            sorts are read out on their header buttons.
          </li>
          <li>
            Sortable headers are buttons; Shift + Enter (or Shift-click) adds a column to the sort. A plain click on a
            column of a multi-sort makes it the only sort. Escape clears the search box.
          </li>
          <li>Checkboxes are named after their row (“Select row Ravi Kumar”); Shift-click selects a range.</li>
          <li>One polite live region announces result counts, sorting, page and page-size changes, and selection.</li>
          <li>
            Search ignores case and accents (“cafe” finds “Café”) and only looks at visible columns, so every match is
            marked.
          </li>
          <li>
            Focus never drops to the page: clearing the search, removing a filter chip, clearing the selection or
            deleting rows moves it to the next sensible control. Focused cells are kept clear of the sticky header, the
            pinned columns and the selection bar.
          </li>
          <li>
            The scroll area is focusable (and a named region) when it overflows, so it can be scrolled with arrow keys.
            Focus outlines are solid; touch targets are 44px; forced-colors mode is supported.
          </li>
        </ul>
      </section>

      <PropsTable title="DataTable props" of={PROPS.DataTable} />

      <PropsTable
        title="Column options"
        rows={[
          ["id", "string", "", "Unique; also the accessor key unless accessorKey / accessorFn is set."],
          ["header", "string", "", "Header text; reused for the View menu, CSV, cards and announcements."],
          ["accessorKey / accessorFn", "keyof TData / (row) => unknown", "id", "Sets where the value comes from."],
          ["cell", "(ctx) => ReactNode", "text", "Custom cell. ctx has row, value, highlight(), query, density."],
          [
            "align / numeric",
            '"left" | "center" | "right" / boolean',
            '"left"',
            "numeric right-aligns with tabular figures and sorts numerically.",
          ],
          [
            "width / minWidth",
            "number | string",
            "",
            "Preferred and minimum width. For wrap columns, width is also the minimum.",
          ],
          [
            "enableSorting / enableHiding",
            "boolean",
            "true",
            "Switches that turn sorting and hiding on or off for one column.",
          ],
          ["defaultHidden", "boolean", "false", "Starts hidden (show it from the View menu)."],
          [
            "searchable / searchValue",
            "boolean / (row) => string",
            "true",
            "Whether, and on what text, the global search matches. Hidden columns are never searched.",
          ],
          [
            "filter / filterOptions",
            '"faceted" / DataTableFilterOption[]',
            "",
            "Multi-select filter with counts. Options are derived from the data when omitted.",
          ],
          [
            "sortFn",
            '"alphanumeric" | "text" | "basic" | "datetime" | (a, b) => number',
            "by column type",
            "Picks how the column sorts: a built-in sort or your own comparison function.",
          ],
          [
            "exportValue / enableExport",
            "(row) => value / boolean",
            "value / true",
            "Controls what the CSV export writes for this column: the cell value, and whether it is included.",
          ],
          ["wrap / hideInCards", "boolean", "false", "Let text wrap / leave out of the card layout."],
        ]}
      />

      {/* The pager is the Pagination component, whose props table is on its own page: not repeated here. */}
      <section className="flex max-w-3xl flex-col gap-3">
        <h2 id="pagination-props" className="text-xl font-semibold tracking-tight">
          Pagination props
        </h2>
        <p className="text-sm text-pretty text-sheen-fg-muted">
          The pager under the table is the{" "}
          <a
            className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
            href={href("/layout/pagination")}
          >
            Pagination component
          </a>
          . Its props (page, onPageChange, pageCount, siblingCount and the rest) are listed on its page.
        </p>
      </section>

      <PropsTable
        title="Cell helpers"
        as="h2"
        rows={[
          ["UserCell", "{ name, email?, src?, highlight? }", "", "Shows an avatar, name and email."],
          ["StatusCell", "{ value, tones?, label? }", "", "Shows a badge with a tone per value."],
          ["ProgressCell", "{ value, label }", "", "Shows a thin progress bar with a percentage."],
          [
            "CurrencyCell / formatCurrency",
            "{ value, currency?, locale? }",
            '"USD"',
            "Formats the value as currency with tabular figures.",
          ],
          [
            "RelativeDateCell / formatRelativeDate",
            "{ value, now?, locale? }",
            "",
            "“3 days ago”, full date in the title and for screen readers.",
          ],
          ["highlightText / Highlight", "(text, query)", "", "Wrap search matches in <mark>."],
          [
            "toCsv / exportCsv",
            "(headers, rows) / (filename, headers, rows)",
            "",
            "RFC 4180 CSV with formula-injection guard and a UTF-8 BOM.",
          ],
        ]}
      />
      <PropsTable of={PROPS.CurrencyCell} title="CurrencyCell props" as="h3" />
      <PropsTable of={PROPS.Highlight} title="Highlight props" as="h3" />
      <PropsTable of={PROPS.ProgressCell} title="ProgressCell props" as="h3" />
      <PropsTable of={PROPS.RelativeDateCell} title="RelativeDateCell props" as="h3" />
      <PropsTable of={PROPS.StatusCell} title="StatusCell props" as="h3" />
      <PropsTable of={PROPS.UserCell} title="UserCell props" as="h3" />
    </Page>
  );
}
