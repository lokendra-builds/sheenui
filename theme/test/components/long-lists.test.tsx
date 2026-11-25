import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { Combobox, type ComboboxOption } from "../../src/components/combobox/combobox";
import { CommandPalette, type CommandItem } from "../../src/components/command/command";
import { Select, type SelectItem } from "../../src/components/select/select";
import { VIRTUALIZE_THRESHOLD, shouldVirtualize } from "../../src/hooks/use-virtual-window";
import { holdFor } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const N = 5000;
const pad = (i: number) => String(i + 1).padStart(4, "0");
const selectItems: SelectItem[] = Array.from({ length: N }, (_, i) => ({
  value: `v${i + 1}`,
  label: `Option ${pad(i)}`,
}));
const comboOptions: ComboboxOption[] = Array.from({ length: N }, (_, i) => ({
  value: `v${i + 1}`,
  label: `Option ${pad(i)}`,
  group: i < 2500 ? "First half" : "Second half",
}));
const commands: CommandItem[] = Array.from({ length: 2000 }, (_, i) => ({
  id: `c${i + 1}`,
  label: `Command ${pad(i)}`,
  group: i < 1000 ? "Alpha" : "Beta",
}));

const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')];
/** Options that fit the open list's scroll area: what one PageUp / PageDown moves by. */
const pageOf = () => {
  const list = document.querySelector<HTMLElement>('[role="listbox"]')!;
  const cs = getComputedStyle(list);
  const inner = list.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  return Math.floor(inner / options()[0]!.getBoundingClientRect().height);
};
const highlighted = () => document.querySelector<HTMLElement>('[role="option"][data-highlighted]');

it("windows automatically above the threshold and only there", () => {
  expect(VIRTUALIZE_THRESHOLD).toBe(200);
  expect(shouldVirtualize(undefined, 200)).toBe(false);
  expect(shouldVirtualize(undefined, 201)).toBe(true);
  expect(shouldVirtualize("auto", 5)).toBe(false);
  expect(shouldVirtualize(true, 5)).toBe(true);
  expect(shouldVirtualize(false, 5000)).toBe(false);
});

describeVariants((variant) => {
  describe("Select with 5,000 options", () => {
    it("renders a window, keeps the set size and reaches every option by keyboard", async () => {
      const onValueChange = vi.fn();
      renderUi(<Select label="Item" items={selectItems} onValueChange={onValueChange} />, variant);
      const trigger = screen.getByRole("combobox", { name: "Item" });
      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      await expect.poll(() => options().length).toBeGreaterThan(0);
      expect(options().length).toBeLessThan(80);
      expect(options()[0]).toHaveAttribute("aria-setsize", String(N));
      expect(options()[0]).toHaveAttribute("aria-posinset", "1");
      await expect.poll(highlighted).not.toBeNull();

      await userEvent.keyboard("{End}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(N));
      expect(highlighted()).toHaveTextContent("Option 5000");
      expect(options().length).toBeLessThan(80);

      await userEvent.keyboard("{ArrowUp}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(N - 1));
      await userEvent.keyboard("{Home}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe("1");
      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe("3");
      const page = pageOf();
      expect(page).toBeGreaterThan(3);
      await userEvent.keyboard("{PageDown}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(3 + page));
      await userEvent.keyboard("{PageUp}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe("3");

      await userEvent.keyboard("{Enter}");
      await expect.poll(() => screen.queryByRole("listbox")).toBeNull();
      expect(onValueChange).toHaveBeenCalledWith("v3");
      expect(trigger).toHaveTextContent("Option 0003");
    });

    it("type-ahead jumps to an option that is not rendered", async () => {
      renderUi(<Select label="Item" items={selectItems} />, variant);
      screen.getByRole("combobox", { name: "Item" }).focus();
      await userEvent.keyboard("{ArrowDown}");
      await expect.poll(highlighted).not.toBeNull();
      await userEvent.keyboard("Option 4321");
      await expect.poll(() => highlighted()?.textContent).toContain("Option 4321");
    });

    it("opens on the selected option, far down the list", async () => {
      renderUi(<Select label="Item" items={selectItems} defaultValue="v3000" />, variant);
      await userEvent.click(screen.getByRole("combobox", { name: "Item" }));
      await expect.poll(() => options().some((o) => o.textContent.includes("Option 3000"))).toBe(true);
      expect(options().length).toBeLessThan(80);
      expect(options().find((o) => o.textContent.includes("Option 3000"))).toHaveAttribute("aria-selected", "true");
    });

    it("virtualized={false} renders every option", async () => {
      renderUi(<Select label="Item" items={selectItems.slice(0, 300)} virtualized={false} defaultOpen />, variant);
      await expect.poll(() => options().length).toBe(300);
    });

    it("has no axe violations open", async () => {
      renderUi(<Select label="Item" items={selectItems} defaultOpen />, variant);
      await expect.poll(() => options().length).toBeGreaterThan(0);
      expect(await runAxe()).toHaveNoViolations();
    });
  });

  describe("Combobox with 5,000 options", () => {
    it("renders a window, walks the list with the arrow keys and filters across all of it", async () => {
      const onValueChange = vi.fn();
      renderUi(<Combobox label="Item" options={comboOptions} onValueChange={onValueChange} />, variant);
      const input = screen.getByRole("combobox", { name: "Item" });
      await userEvent.click(input);
      await expect.poll(() => options().length).toBeGreaterThan(0);
      expect(options().length).toBeLessThan(80);
      expect(options()[0]).toHaveAttribute("aria-setsize", String(N));

      // Far past the rendered window: the active option always exists and is the one aria-activedescendant names.
      for (let i = 1; i <= 41; i++) {
        await userEvent.keyboard("{ArrowDown}");
        await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(i));
      }
      expect(input.getAttribute("aria-activedescendant")).toBe(highlighted()?.id);
      expect(options().length).toBeLessThan(80);

      await userEvent.clear(input);
      await userEvent.type(input, "Option 4999");
      await expect.poll(() => options().length).toBe(1);
      expect(options()[0]).toHaveAttribute("aria-setsize", "1");
      await userEvent.keyboard("{ArrowDown}{Enter}");
      await expect.poll(() => onValueChange.mock.lastCall?.[0] as string | undefined).toBe("v4999");
    });

    it("PageDown / PageUp move the highlight by one page of visible options, across groups and clamped at the ends", async () => {
      renderUi(<Combobox label="Item" options={comboOptions} />, variant);
      const input = screen.getByRole("combobox", { name: "Item" });
      await userEvent.click(input);
      await expect.poll(() => options().length).toBeGreaterThan(0);
      await userEvent.keyboard("{ArrowDown}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe("1");
      const list = document.querySelector<HTMLElement>('[role="listbox"]')!;
      const cs = getComputedStyle(list);
      const page = Math.floor(
        (list.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) /
          options()[0]!.getBoundingClientRect().height,
      );
      expect(page).toBeGreaterThan(3);

      await userEvent.keyboard("{PageDown}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(1 + page));
      expect(input.getAttribute("aria-activedescendant")).toBe(highlighted()?.id);
      await userEvent.keyboard("{PageDown}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(1 + 2 * page));
      await userEvent.keyboard("{PageUp}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(1 + page));
      await userEvent.keyboard("{PageUp}{PageUp}{PageUp}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe("1");
      expect(options().length).toBeLessThan(80);

      expect(highlighted()).toHaveTextContent("Option 0001");
    });

    it("PageDown crosses a group boundary and clamps at the last option of a windowed, grouped list", async () => {
      const grouped = comboOptions
        .slice(0, 600)
        .map((o, i) => ({ ...o, group: i < 300 ? "First half" : "Second half" }));
      renderUi(<Combobox label="Item" options={grouped} />, variant);
      const input = screen.getByRole("combobox", { name: "Item" });
      await userEvent.click(input);
      await expect.poll(() => options().length).toBeGreaterThan(0);
      await userEvent.keyboard("{ArrowDown}" + "{PageDown}".repeat(100));
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset"), { timeout: 10_000 }).toBe("600");
      expect(input.getAttribute("aria-activedescendant")).toBe(highlighted()?.id);
      expect(highlighted()).toHaveTextContent("Option 0600");
      expect(options().length).toBeLessThan(80);
      await userEvent.keyboard("{PageDown}");
      await holdFor(150);
      expect(highlighted()?.getAttribute("aria-posinset")).toBe("600");
      await userEvent.keyboard("{PageUp}");
      await expect.poll(() => Number(highlighted()?.getAttribute("aria-posinset"))).toBeLessThan(600);
    });

    it("PageDown works in a short, unwindowed list too", async () => {
      renderUi(<Combobox label="Item" options={comboOptions.slice(0, 60)} />, variant);
      const input = screen.getByRole("combobox", { name: "Item" });
      await userEvent.click(input);
      await expect.poll(() => options().length).toBe(60);
      await userEvent.keyboard("{ArrowDown}{PageDown}");
      await expect.poll(() => options().indexOf(highlighted()!)).toBeGreaterThan(3);
      await userEvent.keyboard("{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}{PageDown}");
      await expect.poll(() => highlighted()?.textContent).toContain("Option 0060");
    });

    it("has no axe violations open", async () => {
      renderUi(<Combobox label="Item" options={comboOptions} defaultValue="v10" />, variant);
      await userEvent.click(screen.getByRole("combobox", { name: "Item" }));
      await expect.poll(() => options().length).toBeGreaterThan(0);
      expect(await runAxe()).toHaveNoViolations();
    });
  });

  describe("CommandPalette with 2,000 commands", () => {
    it("renders a window and runs a command far down the list from the keyboard", async () => {
      const onSelect = vi.fn();
      renderUi(
        <CommandPalette
          items={commands}
          defaultOpen
          onSelect={onSelect}
          maxRecent={0}
          trigger={<Button>Open</Button>}
        />,
        variant,
      );
      const field = () => screen.getByRole("combobox", { name: /Search commands/ });
      await expect.poll(() => options().length).toBeGreaterThan(0);
      expect(options().length).toBeLessThan(80);
      expect(options()[0]).toHaveAttribute("aria-setsize", "2000");

      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe("1");
      const page = pageOf();
      expect(page).toBeGreaterThan(3);
      await expect.poll(() => document.activeElement === field()).toBe(true);
      for (let i = 1; i <= 12; i++) {
        await userEvent.keyboard("{PageDown}");
        await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(1 + i * page));
      }
      await userEvent.keyboard("{PageUp}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(1 + 11 * page));
      await userEvent.keyboard("{PageDown}");
      await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe(String(1 + 12 * page));
      const activeId = field().getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      expect(document.getElementById(activeId!)).toBe(highlighted());

      await userEvent.keyboard("{Enter}");
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: `c${1 + 12 * page}` }));
    });

    it("has no axe violations", async () => {
      renderUi(<CommandPalette items={commands} defaultOpen trigger={<Button>Open</Button>} />, variant);
      await expect.poll(() => options().length).toBeGreaterThan(0);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

describe("windowed lists keep each option's group for assistive tech", () => {
  /** The name of the `role="group"` that holds `option`, or null. */
  const groupOf = (option: HTMLElement) => {
    const group = option.closest<HTMLElement>('[role="group"]');
    const by = group?.getAttribute("aria-labelledby");
    return group?.getAttribute("aria-label") ?? (by ? (document.getElementById(by)?.textContent ?? null) : null);
  };
  const groupedSelect: SelectItem[] = Array.from({ length: 600 }, (_, i) => ({
    value: `v${i + 1}`,
    label: `Option ${pad(i)}`,
    group: i < 300 ? "Alpha" : "Beta",
  }));

  it("Select: every windowed option sits in a group named after its heading", async () => {
    renderUi(<Select label="Item" items={groupedSelect} />);
    screen.getByRole("combobox", { name: "Item" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => options().length).toBeGreaterThan(0);
    expect(options().every((o) => groupOf(o) === "Alpha")).toBe(true);
    // Far down, the "Beta" heading has scrolled out of the window but the options still name their group.
    await userEvent.keyboard("{End}");
    await expect.poll(() => highlighted()?.getAttribute("aria-posinset")).toBe("600");
    expect(highlighted()).toHaveTextContent("Option 0600");
    expect(groupOf(highlighted()!)).toBe("Beta");
    expect(options()[0]).toHaveAttribute("aria-setsize", "600");
  });

  it("Combobox: windowed options are grouped, including when the heading is windowed out", async () => {
    renderUi(<Combobox label="Item" options={comboOptions} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Item" }));
    await expect.poll(() => options().length).toBeGreaterThan(0);
    expect(options().every((o) => groupOf(o) === "First half")).toBe(true);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.type(screen.getByRole("combobox", { name: "Item" }), "Option 4000");
    await expect.poll(() => options().length).toBe(1);
    expect(groupOf(options()[0]!)).toBe("Second half");
    expect(options()[0]).toHaveAttribute("aria-setsize", "1");
  });

  it("CommandPalette: windowed results are grouped and keep aria-setsize / aria-posinset", async () => {
    renderUi(<CommandPalette items={commands} defaultOpen maxRecent={0} trigger={<Button>Open</Button>} />);
    await expect.poll(() => options().length).toBeGreaterThan(0);
    expect(options().every((o) => groupOf(o) === "Alpha")).toBe(true);
    expect(options()[0]).toHaveAttribute("aria-setsize", "2000");
    expect(options()[0]).toHaveAttribute("aria-posinset", "1");
    // A narrowed list is not windowed: its group is named by the heading.
    await userEvent.type(screen.getByRole("combobox", { name: /Search commands/ }), "Command 1500");
    await expect.poll(() => options().length).toBe(1);
    expect(groupOf(options()[0]!)).toBe("Beta");
  });
});
