import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Select, type SelectItem } from "../../src/components/select/select";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const items: SelectItem[] = [
  { value: "apple", label: "Apple", description: "Crisp and sweet" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry", disabled: true },
  { value: "mango", label: "Mango", group: "Tropical" },
];

const listbox = () => screen.queryByRole("listbox");

describeVariants((variant) => {
  it("is a labelled combobox that opens on click and selects an option", async () => {
    const onValueChange = vi.fn();
    renderUi(<Select label="Fruit" items={items} placeholder="Pick a fruit" onValueChange={onValueChange} />, variant);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    expect(trigger).toHaveTextContent("Pick a fruit");

    await userEvent.click(trigger);
    await expect.poll(listbox).not.toBeNull();
    expect(screen.getByRole("option", { name: /Banana/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Cherry/ })).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(screen.getByRole("option", { name: /Banana/ }));
    await expect.poll(listbox).toBeNull();
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(trigger).toHaveTextContent("Banana");
  });

  it("works from the keyboard: Arrow opens and moves, Enter picks, Escape closes", async () => {
    const onValueChange = vi.fn();
    renderUi(<Select label="Fruit" items={items} defaultValue="apple" onValueChange={onValueChange} />, variant);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(listbox).not.toBeNull();
    // The selected option is highlighted once the list has settled; arrows before that can be lost under load.
    await expect.poll(() => document.querySelector('[role="option"][data-highlighted]')).not.toBeNull();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .poll(() => document.querySelector('[role="option"][data-highlighted]')?.textContent)
      .toContain("Banana");
    await userEvent.keyboard("{Enter}");
    await expect.poll(listbox).toBeNull();
    expect(onValueChange).toHaveBeenCalledWith("banana");
    await expect.poll(() => trigger.textContent).toContain("Banana");

    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(listbox).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(listbox).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("error and description are announced on the trigger", () => {
    renderUi(<Select label="Fruit" items={items} description="Pick your favourite." error="Required." />, variant);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("Required. Pick your favourite.");
  });

  it("names the open listbox: visible label, aria-labelledby, or aria-label", async () => {
    renderUi(
      <div className="grid max-w-sm gap-4 p-6">
        <Select label="Fruit" items={items} defaultValue="apple" />
      </div>,
      variant,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
    await expect.poll(listbox).not.toBeNull();
    expect(screen.getByRole("listbox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("names the listbox of a select that has no visible label", async () => {
    renderUi(
      <div className="grid max-w-sm gap-4 p-6">
        <Select aria-label="Pick fruit" items={items} defaultValue="apple" />
        <span id="ext">Outside name</span>
        <Select aria-labelledby="ext" items={items} />
      </div>,
      variant,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Pick fruit" }));
    await expect.poll(listbox).not.toBeNull();
    expect(screen.getByRole("listbox", { name: "Pick fruit" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.poll(listbox).toBeNull();
    await userEvent.click(screen.getByRole("combobox", { name: "Outside name" }));
    await expect.poll(listbox).not.toBeNull();
    expect(screen.getByRole("listbox", { name: "Outside name" })).toBeInTheDocument();
  });

  it("has no axe violations closed and open", async () => {
    renderUi(
      <div className="grid max-w-sm gap-4 p-6">
        <Select label="Fruit" items={items} defaultValue="apple" />
        <Select label="Disabled" items={items} disabled />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
    await expect.poll(listbox).not.toBeNull();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("open / onOpenChange control the list from outside; defaultOpen starts it open", async () => {
  const onOpenChange = vi.fn();
  function Controlled() {
    const [open, setOpen] = useState(true);
    return (
      <Select
        label="Fruit"
        items={items}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange(next);
        }}
      />
    );
  }
  renderUi(<Controlled />);
  await expect.poll(listbox).not.toBeNull();
  await userEvent.keyboard("{Escape}");
  await expect.poll(listbox).toBeNull();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

it("defaultOpen shows the list without a click, and closing it still works", async () => {
  renderUi(<Select label="Fruit" items={items} defaultOpen />);
  await expect.poll(listbox).not.toBeNull();
  await userEvent.click(await screen.findByRole("option", { name: /Banana/ }));
  await expect.poll(listbox).toBeNull();
});

it("a controlled open={false} stays closed until the owner opens it", async () => {
  const { rerender } = renderUi(<Select label="Fruit" items={items} open={false} />);
  await userEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
  await settle();
  expect(listbox()).toBeNull();
  rerender(<Select label="Fruit" items={items} open />);
  await expect.poll(listbox).not.toBeNull();
});
