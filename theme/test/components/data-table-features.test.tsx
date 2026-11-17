// DataTable (advanced): multi-sort, search highlight, pagination, selection + bulk actions, column
// visibility, faceted filters, states, controlled state, and CSV escaping / formula guard.

import { useState, type ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { DataTable } from "../../src/components/data-table/data-table";
import type { DataTableColumn, DataTablePagination, DataTableSorting } from "../../src/components/data-table/types";
import { escapeCsvValue, toCsv } from "../../src/lib/csv";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

type Row = {
  id: string;
  name: string;
  team: string;
  status: "Active" | "Paused" | "Archived";
  amount: number;
  note: string;
};

const teams = ["Design", "Platform", "Growth"];
const statuses = ["Active", "Paused", "Archived"] as const;
const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `Person ${String(i + 1).padStart(2, "0")}`,
  team: teams[i % 3]!,
  status: statuses[i % 3]!,
  amount: (i + 1) * 10,
  note: i === 0 ? '=HYPERLINK("http://evil")' : i === 1 ? 'Said "hi", twice' : i === 2 ? "line\nbreak" : "plain",
}));

const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "team", header: "Team", accessorKey: "team" },
  { id: "status", header: "Status", accessorKey: "status", filter: "faceted" },
  { id: "amount", header: "Amount", accessorKey: "amount", numeric: true },
  { id: "note", header: "Note", accessorKey: "note", defaultHidden: true },
];

type Overrides = Partial<React.ComponentProps<typeof DataTable<Row>>>;

function Example(props: Overrides) {
  return (
    <DataTable<Row>
      caption="People"
      data={rows}
      columns={columns}
      getRowLabel={(r) => r.name}
      defaultPageSize={10}
      searchDebounceMs={0}
      {...props}
    />
  );
}

const table = () => screen.getByRole("table", { name: "People" });
const bodyRows = () => within(table()).getAllByRole("row").slice(1);
// First data column; skips the checkbox cell when selection is on.
const firstCol = () =>
  bodyRows().map((r) => {
    const cells = within(r).getAllByRole("cell");
    return (within(cells[0]!).queryByRole("checkbox") ? cells[1]! : cells[0]!).textContent.trim();
  });
const live = () => document.querySelector<HTMLElement>('[role="status"][aria-live="polite"]')!;

afterEach(() => vi.restoreAllMocks());

/* ---------- CSV helpers ---------- */

describe("CSV helpers", () => {
  it("quotes fields with commas, quotes, newlines and edge whitespace (RFC 4180)", () => {
    expect(escapeCsvValue("plain")).toBe("plain");
    expect(escapeCsvValue("a,b")).toBe('"a,b"');
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvValue("line\nbreak")).toBe('"line\nbreak"');
    expect(escapeCsvValue(" padded ")).toBe('" padded "');
  });

  it("prefixes text that starts like a spreadsheet formula with an apostrophe (formula injection guard)", () => {
    for (const evil of ["=1+1", "+SUM(A1)", "-2+3", "@cmd", "\tTAB", '=HYPERLINK("http://evil")']) {
      expect(escapeCsvValue(evil).replace(/^"/, "").startsWith("'")).toBe(true);
    }
    expect(escapeCsvValue('=HYPERLINK("http://evil")')).toBe('"\'=HYPERLINK(""http://evil"")"');
  });

  it("leaves real numbers (including negatives) alone and maps null / undefined / NaN to empty", () => {
    expect(escapeCsvValue(-5)).toBe("-5");
    expect(escapeCsvValue(3.14)).toBe("3.14");
    expect(escapeCsvValue(Number.NaN)).toBe("");
    expect(escapeCsvValue(Infinity)).toBe("");
    expect(escapeCsvValue(null)).toBe("");
    expect(escapeCsvValue(undefined)).toBe("");
    expect(escapeCsvValue(true)).toBe("true");
    expect(escapeCsvValue(new Date("2026-11-08T00:00:00Z"))).toBe("2026-11-08T00:00:00.000Z");
  });

  it("toCsv joins with CRLF and escapes headers too", () => {
    expect(
      toCsv(
        ["Name", "=Total"],
        [
          ["Ava", 1],
          ["Bo, Jr.", -2],
        ],
      ),
    ).toBe('Name,\'=Total\r\nAva,1\r\n"Bo, Jr.",-2');
  });
});

/* ---------- Table behaviour ---------- */

describe("DataTable advanced", () => {
  it("paginates: shows the range, next / previous / last, and a rows-per-page select", async () => {
    renderUi(<Example />);
    expect(firstCol()).toHaveLength(10);
    expect(screen.getByText("Showing 1–10 of 25")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: /pagination/i });
    expect(within(nav).getByRole("button", { name: "Previous page" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(within(nav).getByRole("button", { name: "Next page" }));
    await expect.poll(() => firstCol()[0]).toBe("Person 11");
    expect(screen.getByText("Showing 11–20 of 25")).toBeInTheDocument();
    await userEvent.click(within(nav).getByRole("button", { name: "Last page" }));
    await expect.poll(() => firstCol()).toHaveLength(5);
    expect(screen.getByText("Showing 21–25 of 25")).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "Next page" })).toHaveAttribute("aria-disabled", "true");
    // Page changes are announced.
    await expect.poll(() => live().textContent).toMatch(/Page 3 of 3/);
  });

  it("controlled pagination reports the next page and follows the prop", async () => {
    const onPaginationChange = vi.fn();
    function Controlled() {
      const [pagination, setPagination] = useState<DataTablePagination>({ pageIndex: 0, pageSize: 5 });
      return (
        <Example
          pagination={pagination}
          onPaginationChange={(p) => {
            onPaginationChange(p);
            setPagination(p);
          }}
        />
      );
    }
    renderUi(<Controlled />);
    expect(firstCol()).toHaveLength(5);
    await userEvent.click(
      within(screen.getByRole("navigation", { name: /pagination/i })).getByRole("button", { name: "Next page" }),
    );
    await expect.poll(() => firstCol()[0]).toBe("Person 06");
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 5 });
  });

  it("sorts by several columns with Shift+Click; aria-sort and the announcement follow", async () => {
    renderUi(<Example />);
    const team = screen.getByRole("columnheader", { name: /Team/ });
    const amount = screen.getByRole("columnheader", { name: /Amount/ });
    await userEvent.click(within(team).getByRole("button"));
    await expect.poll(() => team.getAttribute("aria-sort")).toBe("ascending");
    await expect.poll(() => live().textContent).toMatch(/Sorted by Team ascending/);
    await userEvent.click(within(amount).getByRole("button"), { modifiers: ["Shift"] });
    await userEvent.click(within(amount).getByRole("button"), { modifiers: ["Shift"] });
    // aria-sort lives on the primary sort only; the secondary one is spoken in the header's text.
    expect(team).toHaveAttribute("aria-sort", "ascending");
    expect(amount).not.toHaveAttribute("aria-sort", "ascending");
    await expect.poll(() => amount.textContent).toMatch(/sort priority 2.*descending/);
    // Design team first, highest amount first inside it.
    const first = bodyRows()[0]!;
    expect(within(first).getAllByRole("cell")[1]!.textContent).toBe("Design");
    expect(Number(within(first).getAllByRole("cell")[3]!.textContent)).toBe(250);
    await expect.poll(() => live().textContent).toMatch(/then/);
  });

  it("Shift+Enter on a focused header adds a secondary sort (keyboard path)", async () => {
    renderUi(<Example />);
    const team = screen.getByRole("columnheader", { name: /Team/ });
    const amount = screen.getByRole("columnheader", { name: /Amount/ });
    within(team).getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => team.getAttribute("aria-sort")).toBe("ascending");
    within(amount).getByRole("button").focus();
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    await expect.poll(() => amount.textContent).toMatch(/sort priority 2.*ascending/);
    expect(team).toHaveAttribute("aria-sort", "ascending");
    expect(amount.getAttribute("aria-sort")).toBeNull();
  });

  it("controlled sorting: reports changes and a third click clears it", async () => {
    const onSortingChange = vi.fn();
    function Controlled() {
      const [sorting, setSorting] = useState<DataTableSorting>([]);
      return (
        <Example
          sorting={sorting}
          onSortingChange={(s) => {
            onSortingChange(s);
            setSorting(s);
          }}
        />
      );
    }
    renderUi(<Controlled />);
    const name = screen.getByRole("columnheader", { name: /Name/ });
    const button = within(name).getByRole("button");
    await userEvent.click(button);
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: "name", desc: false }]);
    await userEvent.click(button);
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: "name", desc: true }]);
    await userEvent.click(button);
    expect(onSortingChange).toHaveBeenLastCalledWith([]);
    await expect.poll(() => name.getAttribute("aria-sort")).toBe("none");
    await expect.poll(() => live().textContent).toMatch(/Sorting removed/);
  });

  it("search highlights matches with <mark> and announces the result count; no matches shows the empty state", async () => {
    renderUi(<Example />);
    const search = screen.getByRole("searchbox", { name: "Search" });
    await userEvent.click(search);
    await userEvent.keyboard("son 07");
    await expect.poll(firstCol).toEqual(["Person 07"]);
    const marks = [...table().querySelectorAll("mark")].map((m) => m.textContent);
    expect(marks.length).toBeGreaterThan(0);
    expect(marks.join("").toLowerCase()).toContain("son 07");
    expect(live().textContent).toMatch(/1 result/);

    await userEvent.clear(search);
    await userEvent.keyboard("nothing matches");
    expect(await screen.findByText("No results for “nothing matches”")).toBeInTheDocument();
    expect(within(table()).queryByText(/Person \d/)).toBeNull();
    await userEvent.click(screen.getAllByRole("button", { name: "Clear search" })[0]!);
    await expect.poll(() => firstCol().length).toBe(10);
  });

  it("search can match hidden columns only after they are shown (searchable follows visibility)", async () => {
    renderUi(<Example />);
    const search = screen.getByRole("searchbox", { name: "Search" });
    await userEvent.click(search);
    await userEvent.keyboard("HYPERLINK");
    expect(await screen.findByText("No results for “HYPERLINK”")).toBeInTheDocument();
  });

  it("selection: row checkboxes, select-all-on-page (indeterminate), count, 'select all N' and clear", async () => {
    const onRowSelectionChange = vi.fn();
    renderUi(<Example enableSelection onRowSelectionChange={onRowSelectionChange} />);
    const header = screen.getByRole("checkbox", { name: "Select all rows on this page" });
    expect(header).not.toBeChecked();
    await userEvent.click(screen.getByRole("checkbox", { name: "Select row Person 02" }));
    await expect.poll(() => screen.getByRole("checkbox", { name: "Select row Person 02" })).toBeChecked();
    expect(header).toHaveAttribute("aria-checked", "mixed");
    expect((await screen.findAllByText("1 selected")).length).toBeGreaterThan(0);
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ r2: true });

    await userEvent.click(header);
    expect((await screen.findAllByText("10 selected")).length).toBeGreaterThan(0);
    expect(screen.getByRole("checkbox", { name: "Select all rows on this page" })).toBeChecked();
    // The selection bar offers every matching row.
    await userEvent.click(await screen.findByRole("button", { name: "Select all 25 rows" }));
    expect((await screen.findAllByText("25 selected")).length).toBeGreaterThan(0);

    // Selection survives paging.
    await userEvent.click(
      within(screen.getByRole("navigation", { name: /pagination/i })).getByRole("button", { name: "Next page" }),
    );
    await expect.poll(() => firstCol()[0]).toBe("Person 11");
    expect(screen.getByRole("checkbox", { name: "Select row Person 11" })).toBeChecked();

    await userEvent.click(screen.getAllByRole("button", { name: "Clear selection" })[0]!);
    await expect.poll(() => screen.queryByText("25 selected")).toBeNull();
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({});
  });

  it("Space toggles a row checkbox from the keyboard; bulk actions get the selected rows", async () => {
    const onSelect = vi.fn<(rows: Row[], clearSelection: () => void) => void>();
    renderUi(<Example enableSelection bulkActions={[{ label: "Archive", onSelect }]} />);
    const box = screen.getByRole("checkbox", { name: "Select row Person 03" });
    box.focus();
    await userEvent.keyboard(" ");
    await expect.poll(() => box.getAttribute("aria-checked")).toBe("true");
    const bar = await screen.findByRole("region", { name: "Selection actions" });
    await userEvent.click(within(bar).getByRole("button", { name: "Archive" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0].map((r: Row) => r.id)).toEqual(["r3"]);
    expect(typeof onSelect.mock.calls[0]![1]).toBe("function");
  });

  it("column visibility: the View menu lists columns as checkboxes; hidden columns leave the table; a hidden-by-default column can be shown", async () => {
    renderUi(<Example />);
    expect(
      within(table())
        .getAllByRole("columnheader")
        .map((h) => h.textContent.trim()),
    ).toEqual(["Name", "Team", "Status", "Amount"]);
    await userEvent.click(screen.getByRole("button", { name: "View" }));
    const menu = await screen.findByRole("menu");
    const team = within(menu).getByRole("menuitemcheckbox", { name: "Team" });
    expect(team).toHaveAttribute("aria-checked", "true");
    expect(within(menu).getByRole("menuitemcheckbox", { name: "Note" })).toHaveAttribute("aria-checked", "false");
    await userEvent.click(team);
    await expect.poll(() => within(table()).queryByRole("columnheader", { name: /Team/ })).toBeNull();
    await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "Note" }));
    await expect.poll(() => within(table()).queryByRole("columnheader", { name: /Note/ })).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("menu")).toBeNull();
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "View" }));
  });

  it("density toggles from the View menu", async () => {
    const onDensityChange = vi.fn();
    renderUi(<Example onDensityChange={onDensityChange} />);
    await userEvent.click(screen.getByRole("button", { name: "View" }));
    const menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitemradio", { name: "Compact" }));
    expect(onDensityChange).toHaveBeenLastCalledWith("compact");
  });

  it("a faceted filter narrows rows, shows a removable chip and a result count", async () => {
    renderUi(<Example />);
    await userEvent.click(screen.getByRole("button", { name: /Filter by Status/ }));
    const option = await screen
      .findByRole("menuitemcheckbox", { name: /Paused/ })
      .catch(() => screen.findByRole("option", { name: /Paused/ }));
    await userEvent.click(option);
    await expect
      .poll(() => bodyRows().every((r) => within(r).getAllByRole("cell")[2]!.textContent.includes("Paused")))
      .toBe(true);
    await userEvent.keyboard("{Escape}");
    const chips = await screen
      .findByRole("group", { name: "Active filters" })
      .catch(() => screen.findByRole("list", { name: "Active filters" }));
    await userEvent.click(within(chips).getByRole("button", { name: /Remove filter Status: Paused/ }));
    await expect.poll(() => firstCol().length).toBe(10);
  });

  it("row expansion: the toggle is a named, expanded-state button", async () => {
    renderUi(<Example renderExpanded={(r) => <p>Details for {r.name}</p>} />);
    const toggle = screen.getByRole("button", { name: "Show details for Person 01" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect
      .poll(() => screen.getByRole("button", { name: "Hide details for Person 01" }).getAttribute("aria-expanded"))
      .toBe("true");
    expect(screen.getByText("Details for Person 01")).toBeInTheDocument();
  });

  it("row actions open a per-row menu named for the row", async () => {
    const onSelect = vi.fn();
    renderUi(
      <Example
        rowActions={[
          { label: "Edit", onSelect },
          { label: "Delete", onSelect: () => undefined, tone: "danger" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions for Person 04" }));
    const menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Edit" }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "r4" }));
    await expect.poll(() => screen.queryByRole("menu")).toBeNull();
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "Actions for Person 04" }));
  });

  it("loading shows a skeleton; error shows an alert with Retry; empty data shows the empty state", async () => {
    const onRetry = vi.fn();
    const view = renderUi(<Example loading data={[]} />);
    expect(screen.getAllByText("Loading rows…").length).toBeGreaterThan(0);
    view.unmount();

    const err = renderUi(<Example error onRetry={onRetry} data={[]} />);
    expect(await screen.findByText("Couldn’t load the data")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    err.unmount();

    renderUi(<Example data={[]} />);
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });

  it("labels override toolbar, search and pagination strings", () => {
    renderUi(
      <Example
        labels={{
          searchLabel: "Buscar",
          view: "Vista",
          showing: (a, b, t) => `Mostrando ${a}–${b} de ${t}`,
          rowsPerPage: "Filas por página",
        }}
      />,
    );
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vista" })).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1–10 de 25")).toBeInTheDocument();
  });

  it("manual mode: shows rowCount in the footer and leaves sorting to the server", async () => {
    const onSortingChange = vi.fn();
    renderUi(<Example manual rowCount={312} data={rows.slice(0, 10)} onSortingChange={onSortingChange} />);
    expect(screen.getByText("Showing 1–10 of 312")).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole("columnheader", { name: /Name/ })).getByRole("button"));
    expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: false }]);
    // Rows are untouched: the server owns the order.
    expect(firstCol()[0]).toBe("Person 01");
  });

  it("onExport receives the filtered rows (all pages) in table order, and the selected rows for the selection bar", async () => {
    const onExport = vi.fn<NonNullable<ComponentProps<typeof Example>["onExport"]>>();
    renderUi(<Example enableSelection onExport={onExport} defaultSorting={[{ id: "amount", desc: true }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    const [exported, scope] = onExport.mock.calls[0]!;
    expect(scope).toBe("filtered");
    expect(exported).toHaveLength(25);
    expect(exported[0]?.id).toBe("r25");

    await userEvent.click(screen.getByRole("checkbox", { name: "Select row Person 25" }));
    await userEvent.click(await screen.findByRole("button", { name: /Export selected/ }));
    expect(onExport).toHaveBeenCalledTimes(2);
    expect(onExport.mock.calls[1]![1]).toBe("selected");
    expect(onExport.mock.calls[1]![0].map((r: Row) => r.id)).toEqual(["r25"]);
  });

  it("the built-in CSV export writes a BOM, visible columns only, escaped values and guards formulas", async () => {
    let blob: Blob | undefined;
    vi.spyOn(URL, "createObjectURL").mockImplementation((b) => {
      blob = b as Blob;
      return "blob:test";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const noteColumns: DataTableColumn<Row>[] = columns.map((c) =>
      c.id === "note" ? { ...c, defaultHidden: false } : c,
    );
    renderUi(<Example columns={noteColumns} exportFilename="people" />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(click).toHaveBeenCalledTimes(1);
    // Blob.text() strips a leading BOM, so read the raw bytes: EF BB BF makes Excel read UTF-8.
    const bytes = new Uint8Array(await blob!.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(blob!.type).toContain("text/csv");
    const text = await blob!.text();
    const [header, first, second, third] = text.split("\r\n");
    expect(header).toBe("Name,Team,Status,Amount,Note");
    // Formula guard: the note that starts with "=" is neutralised (and quoted because it has quotes).
    expect(first).toContain(`"'=HYPERLINK(""http://evil"")"`);
    expect(second).toContain('"Said ""hi"", twice"');
    expect(third).toContain('"line\nbreak"');
  });

  describeVariants((variant) => {
    it("has no axe violations (selection on, one row selected)", async () => {
      renderUi(
        <div className="p-4">
          <Example
            enableSelection
            renderExpanded={(r) => <p>{r.name}</p>}
            rowActions={[{ label: "Edit", onSelect: () => undefined }]}
          />
        </div>,
        variant,
      );
      await userEvent.click(screen.getByRole("checkbox", { name: "Select row Person 02" }));
      await screen.findAllByText("1 selected");
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });

    it("has no axe violations in the loading, error and empty states", async () => {
      const a = renderUi(<Example loading data={[]} />, variant);
      expect(await runAxe()).toHaveNoViolations();
      a.unmount();
      const b = renderUi(<Example error data={[]} />, variant);
      expect(await runAxe()).toHaveNoViolations();
      b.unmount();
      renderUi(<Example data={[]} />, variant);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
