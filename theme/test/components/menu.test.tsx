import { expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../../src/components/menu/menu";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

type Spies = {
  onEdit?: () => void;
  onDelete?: () => void;
  onTheme?: (v: unknown) => void;
  onWrap?: (v: boolean) => void;
};

function Example({ onEdit, onDelete, onTheme, onWrap }: Spies) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="glass" />}>Actions</MenuTrigger>
      <MenuContent aria-label="Actions">
        <MenuHeader>Signed in as ava@example.com</MenuHeader>
        <MenuSeparator />
        <MenuGroup>
          <MenuLabel>Document</MenuLabel>
          <MenuItem shortcut="mod+e" onClick={onEdit}>
            Edit
          </MenuItem>
          <MenuItem disabled>Duplicate</MenuItem>
          <MenuLinkItem href="/docs">Open docs</MenuLinkItem>
          <MenuCheckboxItem defaultChecked onCheckedChange={onWrap}>
            Word wrap
          </MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuRadioGroup defaultValue="system" onValueChange={onTheme}>
          <MenuLabel>Theme</MenuLabel>
          <MenuRadioItem value="light">Light</MenuRadioItem>
          <MenuRadioItem value="system">System</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSub>
          <MenuSubTrigger>Share</MenuSubTrigger>
          <MenuSubContent aria-label="Share">
            <MenuItem>Email</MenuItem>
            <MenuItem>Link</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem tone="danger" onClick={onDelete}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

const menu = () => screen.queryByRole("menu", { name: "Actions" });
const trigger = () => screen.getByRole("button", { name: "Actions" });
const open = async () => {
  await userEvent.click(trigger());
  await expect.poll(menu).not.toBeNull();
};

describeVariants((variant) => {
  it("trigger is a menu button; clicking opens a labelled menu with typed items", async () => {
    renderUi(<Example />, variant);
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await open();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    const m = menu()!;
    expect(within(m).getByRole("menuitem", { name: /Edit/ })).toBeInTheDocument();
    expect(within(m).getByRole("menuitem", { name: "Duplicate" })).toHaveAttribute("aria-disabled", "true");
    expect(within(m).getByRole("menuitem", { name: "Open docs" })).toHaveAttribute("href", "/docs");
    expect(within(m).getByRole("menuitemcheckbox", { name: "Word wrap" })).toHaveAttribute("aria-checked", "true");
    expect(within(m).getByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "true");
    expect(within(m).getByRole("menuitemradio", { name: "Light" })).toHaveAttribute("aria-checked", "false");
    expect(within(m).getAllByRole("separator").length).toBeGreaterThan(1);
    expect(within(m).getByText("Signed in as ava@example.com")).toBeInTheDocument();
    // Items with a shortcut advertise it to assistive tech.
    expect(within(m).getByRole("menuitem", { name: /Edit/ }).getAttribute("aria-keyshortcuts")).toMatch(/\+E$/);
  });

  it("opens from the keyboard (Enter, Space, ArrowDown) and focuses an item; Escape closes and returns focus", async () => {
    renderUi(<Example />, variant);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(menu).not.toBeNull();
    await expect.poll(() => menu()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(menu).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());

    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(menu).not.toBeNull();
    await expect.poll(() => menu()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(menu).toBeNull();

    await userEvent.keyboard(" ");
    await expect.poll(menu).not.toBeNull();
  });

  it("arrows move through items (disabled ones stay focusable), Home/End jump, typeahead finds items", async () => {
    renderUi(<Example />, variant);
    trigger().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(menu).not.toBeNull();
    const m = menu()!;
    const item = (name: string | RegExp, role = "menuitem") => within(m).getByRole(role, { name });
    await userEvent.keyboard("{Home}");
    await expect.poll(() => document.activeElement).toBe(item(/Edit/));
    await userEvent.keyboard("{ArrowDown}");
    // A disabled item stays reachable by arrow keys (APG), but cannot be activated.
    await expect.poll(() => document.activeElement).toBe(item("Duplicate"));
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement).toBe(item("Open docs"));
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement).toBe(item("Word wrap", "menuitemcheckbox"));
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement).toBe(item("Delete"));
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => document.activeElement).toBe(item(/Share/));
    await userEvent.keyboard("l");
    await expect.poll(() => document.activeElement).toBe(item("Light", "menuitemradio"));
  });

  it("Enter on an item runs it and closes the menu, returning focus to the trigger", async () => {
    const onEdit = vi.fn();
    renderUi(<Example onEdit={onEdit} />, variant);
    trigger().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(menu).not.toBeNull();
    await userEvent.keyboard("{Home}");
    await userEvent.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledTimes(1);
    await expect.poll(menu).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("clicking an item runs it and closes; a disabled item does nothing", async () => {
    const onDelete = vi.fn();
    renderUi(<Example onDelete={onDelete} />, variant);
    await open();
    within(menu()!).getByRole("menuitem", { name: "Duplicate" }).click();
    expect(menu()).not.toBeNull();
    await userEvent.click(within(menu()!).getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    await expect.poll(menu).toBeNull();
  });

  it("checkbox and radio items toggle and report; checkbox/radio items keep the menu open", async () => {
    const onWrap = vi.fn();
    const onTheme = vi.fn();
    renderUi(<Example onWrap={onWrap} onTheme={onTheme} />, variant);
    await open();
    const wrap = within(menu()!).getByRole("menuitemcheckbox", { name: "Word wrap" });
    await userEvent.click(wrap);
    expect(onWrap.mock.lastCall![0]).toBe(false);
    await expect.poll(() => wrap.getAttribute("aria-checked")).toBe("false");
    expect(menu()).not.toBeNull();
    const light = within(menu()!).getByRole("menuitemradio", { name: "Light" });
    await userEvent.click(light);
    expect(onTheme.mock.lastCall![0]).toBe("light");
    await expect.poll(() => light.getAttribute("aria-checked")).toBe("true");
    expect(within(menu()!).getByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "false");
  });

  it("submenu: ArrowRight opens it and focuses its first item, ArrowLeft closes it", async () => {
    renderUi(<Example />, variant);
    trigger().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(menu).not.toBeNull();
    const sub = within(menu()!).getByRole("menuitem", { name: /Share/ });
    expect(sub).toHaveAttribute("aria-haspopup", "menu");
    sub.focus();
    await userEvent.keyboard("{ArrowRight}");
    const submenu = await screen.findByRole("menu", { name: "Share" });
    await expect.poll(() => submenu.contains(document.activeElement)).toBe(true);
    expect(
      within(submenu)
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["Email", "Link"]);
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => screen.queryByRole("menu", { name: "Share" })).toBeNull();
    expect(menu()).not.toBeNull();
    await expect.poll(() => document.activeElement).toBe(sub);
  });

  it("clicking outside closes it", async () => {
    renderUi(
      <>
        <button>outside</button>
        <Example />
      </>,
      variant,
    );
    await open();
    // The open menu is modal: an inert layer covers the page and a press on it dismisses the menu.
    await userEvent.click(document.documentElement, { position: { x: 3, y: 3 } });
    await expect.poll(menu).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("has no axe violations while open (with the submenu open too)", async () => {
    renderUi(<Example />, variant);
    await open();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
    within(menu()!).getByRole("menuitem", { name: /Share/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await screen.findByRole("menu", { name: "Share" });
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
