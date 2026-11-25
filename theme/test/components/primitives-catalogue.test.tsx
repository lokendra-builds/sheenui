import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { ButtonGroup } from "../../src/components/button-group/button-group";
import { Input } from "../../src/components/input/input";
import { Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "../../src/components/sidebar/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/table/table";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("ButtonGroup: one tab stop, arrows rove, Home and End jump, disabled buttons are skipped", async () => {
    renderUi(
      <>
        <button>before</button>
        <ButtonGroup aria-label="View">
          <Button variant="glass">Day</Button>
          <Button variant="glass" disabled>
            Hidden
          </Button>
          <Button variant="glass">Week</Button>
          <Button variant="glass">Month</Button>
        </ButtonGroup>
        <button>after</button>
      </>,
      variant,
    );
    expect(screen.getByRole("group", { name: "View" })).toBeInTheDocument();
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    await expect.poll(() => document.activeElement?.textContent).toBe("Day");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement?.textContent).toBe("Week");
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement?.textContent).toBe("Month");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement?.textContent).toBe("Day");
    // Only the focused button holds a tab stop.
    await expect
      .poll(() => ["Day", "Week", "Month"].map((n) => screen.getByRole("button", { name: n }).tabIndex))
      .toEqual([0, -1, -1]);
    await userEvent.tab();
    await expect.poll(() => document.activeElement?.textContent).toBe("after");
  });

  it("ButtonGroup: vertical uses the up and down arrows; the buttons are attached", async () => {
    renderUi(
      <ButtonGroup orientation="vertical" aria-label="Actions">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
      variant,
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement?.textContent).toBe("Two");
    expect(screen.getByRole("group")).toHaveAttribute("data-orientation", "vertical");
  });

  it("Button: outline and link variants render as buttons with their own look", () => {
    renderUi(
      <>
        <Button variant="outline">Outline</Button>
        <Button variant="link">Link</Button>
      </>,
      variant,
    );
    expect(screen.getByRole("button", { name: "Outline" }).className).toContain("border");
    expect(screen.getByRole("button", { name: "Link" }).className).toContain("text-sheen-accent");
  });

  it("Input: size sm, md and lg set the height (32, 40, 48px, the Button scale)", () => {
    renderUi(
      <>
        <Input size="sm" aria-label="s" />
        <Input size="md" aria-label="m" />
        <Input size="lg" aria-label="l" />
      </>,
      variant,
    );
    const heights = ["s", "m", "l"].map((n) => screen.getByLabelText(n).parentElement!.getBoundingClientRect().height);
    expect(heights).toEqual([32, 40, 48]);
  });

  it("Sidebar: groups open and close, the current item has aria-current and collapsed shows icons with names", async () => {
    const onClick = vi.fn();
    const { rerender } = renderUi(
      <Sidebar aria-label="Workspace">
        <SidebarHeader>Acme</SidebarHeader>
        <SidebarItem href="#home" active>
          Home
        </SidebarItem>
        <SidebarGroup label="Projects">
          <SidebarItem href="#alpha" badge="3">
            Alpha
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup label="Team" defaultOpen={false}>
          <SidebarItem href="#members">Members</SidebarItem>
        </SidebarGroup>
        <SidebarFooter>
          <SidebarItem onClick={onClick}>Collapse</SidebarItem>
        </SidebarFooter>
      </Sidebar>,
      variant,
    );
    expect(screen.getByRole("navigation", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Alpha/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Members" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Team" }));
    await expect.poll(() => screen.queryByRole("link", { name: "Members" })).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Sidebar aria-label="Workspace" collapsed>
        <SidebarItem href="#home" active>
          Home
        </SidebarItem>
        <SidebarGroup label="Projects">
          <SidebarItem href="#alpha">Alpha</SidebarItem>
        </SidebarGroup>
      </Sidebar>,
    );
    expect(screen.getByRole("link", { name: "Alpha" })).toHaveAttribute("title", "Alpha");
    expect(screen.queryByRole("button", { name: "Projects" })).toBeNull();
  });

  it("Table: native table semantics inside a named, focusable scroll region", () => {
    renderUi(
      <Table regionLabel="Plans">
        <TableCaption>Plans</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Plan</TableHead>
            <TableHead scope="col">Seats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead scope="row">Free</TableHead>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Monthly</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
      variant,
    );
    expect(screen.getByRole("table", { name: "Plans" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByRole("rowheader", { name: "Free" })).toBeInTheDocument();
  });

  it("has no axe violations for the new primitives", async () => {
    renderUi(
      <div>
        <ButtonGroup aria-label="View">
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
        </ButtonGroup>
        <Sidebar aria-label="Workspace">
          <SidebarItem href="#home" active>
            Home
          </SidebarItem>
        </Sidebar>
        <Table regionLabel="T">
          <TableCaption>T</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>x</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
