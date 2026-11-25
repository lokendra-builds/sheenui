import { expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { UserCell } from "../../src/components/data-table/cells";
import { DataTable } from "../../src/components/data-table/data-table";
import type { DataTableColumn } from "../../src/components/data-table/types";
import { describeVariants, renderUi, runAxe } from "../render";

type Person = { id: string; name: string; role: string; age: number };

const people: Person[] = [
  { id: "1", name: "Ravi Kumar", role: "Admin", age: 41 },
  { id: "2", name: "Ava Chen", role: "Editor", age: 29 },
  { id: "3", name: "Noah Smith", role: "Viewer", age: 35 },
  { id: "4", name: "Mia Rossi", role: "Editor", age: 52 },
  { id: "5", name: "Liam Novak", role: "Owner", age: 23 },
];

const columns: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "role", header: "Role", accessorKey: "role" },
  { id: "age", header: "Age", accessorKey: "age", numeric: true },
];

function Example() {
  return <DataTable caption="Team members" data={people} columns={columns} getRowLabel={(p) => p.name} />;
}

/** Text of the first column in each body row, in display order. */
function names() {
  const table = screen.getByRole("table", { name: "Team members" });
  return within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]!.textContent.trim());
}

describeVariants((variant) => {
  it("renders a captioned table with scoped headers and every row", () => {
    renderUi(<Example />, variant);
    const table = screen.getByRole("table", { name: "Team members" });
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent.trim())).toEqual(["Name", "Role", "Age"]);
    for (const h of headers) expect(h).toHaveAttribute("scope", "col");
    expect(names()).toEqual(people.map((p) => p.name));
  });

  it("sorts by a column from its header button (aria-sort follows) and by keyboard", async () => {
    renderUi(<Example />, variant);
    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
    const sortButton = within(nameHeader).getByRole("button");
    expect(nameHeader).toHaveAttribute("aria-sort", "none");

    await userEvent.click(sortButton);
    await expect.poll(() => nameHeader.getAttribute("aria-sort")).toBe("ascending");
    expect(names()[0]).toBe("Ava Chen");

    sortButton.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => nameHeader.getAttribute("aria-sort")).toBe("descending");
    expect(names()[0]).toBe("Ravi Kumar");

    const ageHeader = screen.getByRole("columnheader", { name: /Age/ });
    await userEvent.click(within(ageHeader).getByRole("button"));
    await expect.poll(() => ageHeader.getAttribute("aria-sort")).toBe("ascending");
    expect(names()[0]).toBe("Liam Novak");
  });

  it("the search box filters rows and announces the result count", async () => {
    renderUi(<Example />, variant);
    const search = screen.getByRole("searchbox", { name: "Search" });
    await userEvent.click(search);
    await userEvent.keyboard("ros");
    await expect.poll(names).toEqual(["Mia Rossi"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 result");

    await userEvent.keyboard("{Escape}");
    await expect.poll(() => names().length).toBe(people.length);
  });

  it("has no axe violations", async () => {
    renderUi(
      <div className="p-6">
        <Example />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("animates sorted rows with transform only and keeps the table semantics", async () => {
  renderUi(<Example />);
  const table = screen.getByRole("table", { name: "Team members" });
  const nameHeader = within(table).getByRole("columnheader", { name: /Name/ });
  await userEvent.click(within(nameHeader).getByRole("button"));
  await expect.poll(() => names()[0]).toBe("Ava Chen");
  for (const row of within(table).getAllByRole("row").slice(1)) {
    expect(getComputedStyle(row).display).toBe("table-row");
  }
  await expect.poll(() => within(table).getAllByRole("row")[1]!.style.transform, { timeout: 3000 }).toBe("none");
});

describeVariants((variant) => {
  it("UserCell keeps a long name and email on one line with an ellipsis (never splitting mid-word) and keeps the full value", () => {
    const email = "a.very.long.mailbox.name.indeed@example.com";
    renderUi(
      <div style={{ width: 160 }}>
        <UserCell name="Bartholomew Featherstonehaugh-Smythe" email={email} />
      </div>,
      variant,
    );
    for (const text of [email, "Bartholomew Featherstonehaugh-Smythe"]) {
      const el = screen.getByText(text);
      const style = getComputedStyle(el);
      expect(style.textOverflow).toBe("ellipsis");
      expect(style.whiteSpace).toBe("nowrap");
      expect(style.overflowWrap).not.toBe("anywhere");
      // One line: the text is wider than its box and the box is a single line tall.
      expect(el.scrollWidth).toBeGreaterThan(el.clientWidth);
      expect(el.clientHeight).toBeLessThan(2 * parseFloat(style.lineHeight || "0") || 40);
      expect(el).toHaveAttribute("title", text);
    }
  });
});
