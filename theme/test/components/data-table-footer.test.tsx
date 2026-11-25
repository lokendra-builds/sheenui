// DataTable footer and card list: the rows-per-page select, the go-to-page box, and the phone "cards" layout
// (selection, row actions, expandable detail, loading skeletons).

import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { page, userEvent } from "vitest/browser";

import { DataTable } from "../../src/components/data-table/data-table";
import type { DataTableColumn, DataTablePagination } from "../../src/components/data-table/types";
import { renderUi } from "../render";

type Row = { id: string; name: string; team: string; amount: number };

const rows: Row[] = Array.from({ length: 60 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `Person ${String(i + 1).padStart(2, "0")}`,
  team: ["Design", "Platform", "Growth"][i % 3]!,
  amount: (i + 1) * 10,
}));

const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "team", header: "Team", accessorKey: "team" },
  { id: "amount", header: "Amount", accessorKey: "amount", numeric: true },
];

function Example(props: Partial<React.ComponentProps<typeof DataTable<Row>>>) {
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

afterEach(async () => {
  await page.viewport(1024, 768);
});

describe("DataTable footer", () => {
  it("changing rows per page keeps the first visible row in view and reports the new size", async () => {
    const onPaginationChange = vi.fn();
    function Controlled() {
      const [pagination, setPagination] = useState<DataTablePagination>({ pageIndex: 2, pageSize: 10 });
      return (
        <Example
          pagination={pagination}
          onPaginationChange={(next) => {
            onPaginationChange(next);
            setPagination(next);
          }}
        />
      );
    }
    renderUi(<Controlled />);
    expect(screen.getByText("Showing 21–30 of 60")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await userEvent.click(await screen.findByRole("option", { name: "20" }));
    // Row 21 is still the first visible row: page index 2 at size 10 becomes page index 1 at size 20.
    await expect.poll(() => onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 20 });
    expect(screen.getByText("Showing 21–40 of 60")).toBeInTheDocument();
  });

  it("go-to-page: Enter jumps, a number past the end is clamped, blur commits, an empty box does nothing", async () => {
    renderUi(<Example />);
    const box = screen.getByRole("spinbutton", { name: "Go to page" });
    await userEvent.fill(box, "4");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => screen.queryByText("Showing 31–40 of 60")).not.toBeNull();
    expect(box).toHaveValue(null);
    await userEvent.fill(box, "99");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => screen.queryByText("Showing 51–60 of 60")).not.toBeNull();
    // Blur commits a pending number.
    await userEvent.fill(box, "1");
    await userEvent.click(document.body);
    await expect.poll(() => screen.queryByText("Showing 1–10 of 60")).not.toBeNull();
    // Enter on an empty box changes nothing.
    await userEvent.click(box);
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Showing 1–10 of 60")).toBeInTheDocument();
  });

  it("with three pages or fewer there is no go-to-page box", () => {
    renderUi(<Example data={rows.slice(0, 20)} />);
    expect(screen.queryByRole("spinbutton", { name: "Go to page" })).toBeNull();
  });
});

describe("DataTable cards layout (phones)", () => {
  async function phone(ui: React.ReactElement) {
    await page.viewport(360, 800);
    renderUi(ui);
    await expect.poll(() => screen.queryByRole("table")).toBeNull();
  }

  it("lists each row as a card with its columns, no table, and no go-to-page box", async () => {
    await phone(<Example mobileLayout="cards" />);
    const list = screen.getByRole("list", { name: "People" });
    const cards = within(list).getAllByRole("listitem");
    expect(cards).toHaveLength(10);
    expect(within(cards[0]!).getByText("Person 01")).toBeInTheDocument();
    expect(within(cards[0]!).getByText("Team")).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "Go to page" })).toBeNull();
  });

  it("selection: a card checkbox and the select-all-on-page box drive the selection", async () => {
    const onRowSelectionChange = vi.fn();
    await phone(<Example mobileLayout="cards" enableSelection onRowSelectionChange={onRowSelectionChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /Select row Person 02/ }));
    await expect.poll(() => onRowSelectionChange).toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: /Select row Person 02/ })).toBeChecked();
    await userEvent.click(screen.getByRole("checkbox", { name: /Select all rows on this page/ }));
    await expect.poll(() => screen.getAllByRole("checkbox", { checked: true }).length).toBeGreaterThanOrEqual(10);
  });

  it("row actions and expandable detail work inside a card", async () => {
    const onEdit = vi.fn();
    await phone(
      <Example
        mobileLayout="cards"
        rowActions={() => [{ label: "Edit", onSelect: onEdit }]}
        renderExpanded={(row) => <p>Detail for {row.name}</p>}
      />,
    );
    const toggle = screen.getByRole("button", { name: /Show details for Person 01/ });
    await userEvent.click(toggle);
    await expect.poll(() => screen.queryByText("Detail for Person 01")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Hide details for Person 01/ })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("button", { name: /Actions for Person 01/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("the first load shows skeleton cards instead of rows", async () => {
    await phone(<Example mobileLayout="cards" loading data={[]} />);
    expect(screen.queryByText("Person 01")).toBeNull();
    expect(screen.getByText("Loading rows…")).toBeInTheDocument();
  });
});

describe("DataTable row windowing", () => {
  it("renders only the rows in view on a long page with a bounded height, and says how many there are", () => {
    const { container } = renderUi(
      <Example defaultPageSize={60} pageSizeOptions={[60]} maxHeight="20rem" hidePagination />,
    );
    const body = container.querySelectorAll("tbody tr[data-slot='data-table-row']");
    expect(body.length).toBeGreaterThan(0);
    expect(body.length).toBeLessThan(40);
    expect(container.querySelector("table")?.getAttribute("aria-rowcount")).toBe("61");
    expect(body[0]?.getAttribute("aria-rowindex")).toBe("2");
    expect(container.querySelector("[data-slot='data-table-spacer']")).not.toBeNull();
  });

  it("renders every row when virtualize is off", () => {
    const { container } = renderUi(
      <Example defaultPageSize={60} pageSizeOptions={[60]} maxHeight="20rem" virtualize={false} hidePagination />,
    );
    expect(container.querySelectorAll("tbody tr[data-slot='data-table-row']")).toHaveLength(60);
  });
});
