import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Toggle, ToggleGroup, ToggleGroupSeparator } from "../../src/components/toggle/toggle";
import { describeVariants, renderUi, runAxe } from "../render";

const pressed = (name: string) => screen.getByRole("button", { name }).getAttribute("aria-pressed");

describeVariants((variant) => {
  it("is a toggle button that flips aria-pressed on click, Space and Enter", async () => {
    const onPressedChange = vi.fn();
    renderUi(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>, variant);
    const t = screen.getByRole("button", { name: "Bold" });
    expect(t).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(t);
    expect(t).toHaveAttribute("aria-pressed", "true");
    expect(t).toHaveAttribute("data-pressed");
    t.focus();
    await userEvent.keyboard(" ");
    expect(t).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard("{Enter}");
    expect(t).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledTimes(3);
    expect((onPressedChange.mock.calls as unknown[][]).map((c) => c[0])).toEqual([true, false, true]);
  });

  it("defaultPressed and controlled pressed", async () => {
    function Controlled() {
      const [p, setP] = useState(false);
      return (
        <>
          <Toggle pressed={p} onPressedChange={setP}>
            Controlled
          </Toggle>
          <output>{String(p)}</output>
        </>
      );
    }
    renderUi(
      <>
        <Toggle defaultPressed>Starts on</Toggle>
        <Controlled />
      </>,
      variant,
    );
    expect(pressed("Starts on")).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Controlled" }));
    expect(screen.getByRole("status")).toHaveTextContent("true");
  });

  it("children can be a function of the state (swap icons)", async () => {
    renderUi(
      <Toggle aria-label="Favourite" iconOnly>
        {({ pressed }) => <span data-testid="icon">{pressed ? "filled" : "outline"}</span>}
      </Toggle>,
      variant,
    );
    expect(screen.getByTestId("icon")).toHaveTextContent("outline");
    await userEvent.click(screen.getByRole("button", { name: "Favourite" }));
    expect(screen.getByTestId("icon")).toHaveTextContent("filled");
  });

  it("disabled toggles are not pressable or focusable", async () => {
    renderUi(<Toggle disabled>Locked</Toggle>, variant);
    const t = screen.getByRole("button", { name: "Locked" });
    expect(t).toBeDisabled();
    await userEvent.tab();
    expect(t).not.toHaveFocus();
  });

  it("ToggleGroup: a named group with roving arrow-key focus", async () => {
    renderUi(
      <>
        <button>before</button>
        <ToggleGroup aria-label="Text formatting" multiple>
          <Toggle value="bold">Bold</Toggle>
          <ToggleGroupSeparator />
          <Toggle value="italic">Italic</Toggle>
          <Toggle value="underline">Underline</Toggle>
        </ToggleGroup>
        <button>after</button>
      </>,
      variant,
    );
    expect(screen.getByRole("group", { name: "Text formatting" })).toBeInTheDocument();
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(pressed("Italic")).toBe("true");
    // multiple: a second one can be pressed as well.
    await userEvent.keyboard("{ArrowRight} ");
    expect(pressed("Underline")).toBe("true");
    expect(pressed("Italic")).toBe("true");
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Underline" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("a single-choice ToggleGroup replaces the pressed item and can be cleared", async () => {
    const onValueChange = vi.fn();
    renderUi(
      <ToggleGroup aria-label="Align" defaultValue={["left"]} onValueChange={onValueChange}>
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
      </ToggleGroup>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Center" }));
    expect(pressed("Center")).toBe("true");
    expect(pressed("Left")).toBe("false");
    await userEvent.click(screen.getByRole("button", { name: "Center" }));
    expect(pressed("Center")).toBe("false");
    expect(onValueChange.mock.lastCall![0]).toEqual([]);
  });

  it("inside a group, toggles are always ghost and take the group's size", () => {
    renderUi(
      <ToggleGroup aria-label="G" size="lg">
        <Toggle value="a" variant="glass">
          A
        </Toggle>
      </ToggleGroup>,
      variant,
    );
    expect(screen.getByRole("button", { name: "A" }).className).not.toContain("glass-1");
  });

  it("has no axe violations", async () => {
    renderUi(
      <div className="grid gap-3">
        <Toggle>Plain</Toggle>
        <Toggle defaultPressed variant="ghost">
          Pressed
        </Toggle>
        <Toggle iconOnly aria-label="Mute">
          <svg width="16" height="16" aria-hidden="true" />
        </Toggle>
        <ToggleGroup aria-label="Group" defaultValue={["a"]}>
          <Toggle value="a">A</Toggle>
          <Toggle value="b">B</Toggle>
        </ToggleGroup>
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
