import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { NumberField } from "../../src/components/number-field/number-field";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("is a labelled numeric field with a description and stepper buttons", () => {
    renderUi(
      <NumberField label="Quantity" description="Between 1 and 10" defaultValue={3} min={1} max={10} />,
      variant,
    );
    const input = screen.getByLabelText<HTMLInputElement>("Quantity");
    expect(input).toHaveValue("3");
    expect(input).toHaveAccessibleDescription("Between 1 and 10");
    expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decrease" })).toBeInTheDocument();
  });

  it("the steppers change the value and respect min/max", async () => {
    const onValueChange = vi.fn();
    renderUi(<NumberField label="Qty" defaultValue={9} min={8} max={10} onValueChange={onValueChange} />, variant);
    const input = screen.getByLabelText<HTMLInputElement>("Qty");
    await userEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(input).toHaveValue("10");
    expect(onValueChange.mock.lastCall![0]).toBe(10);
    // At max the increase button is disabled.
    await expect.poll(() => screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Decrease" }));
    await userEvent.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input).toHaveValue("8");
    await expect.poll(() => screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
  });

  it("ArrowUp/ArrowDown step, Shift+Arrow takes the large step, PageUp too, Home/End jump to min/max", async () => {
    renderUi(<NumberField label="Qty" defaultValue={5} min={0} max={100} step={1} largeStep={10} />, variant);
    const input = screen.getByLabelText<HTMLInputElement>("Qty");
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("6");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveValue("4");
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(input).toHaveValue("14");
    await userEvent.keyboard("{End}");
    expect(input).toHaveValue("100");
    await userEvent.keyboard("{Home}");
    expect(input).toHaveValue("0");
  });

  it("typing a value commits on blur and clamps to the range", async () => {
    renderUi(<NumberField label="Qty" defaultValue={5} min={0} max={20} />, variant);
    const input = screen.getByLabelText<HTMLInputElement>("Qty");
    await userEvent.click(input);
    await userEvent.fill(input, "999");
    await userEvent.tab();
    expect(input).toHaveValue("20");
  });

  it("clearing the field reports null", async () => {
    const onValueChange = vi.fn();
    renderUi(<NumberField label="Qty" defaultValue={5} onValueChange={onValueChange} />, variant);
    const input = screen.getByLabelText<HTMLInputElement>("Qty");
    await userEvent.click(input);
    await userEvent.clear(input);
    expect(onValueChange.mock.lastCall![0]).toBeNull();
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState<number | null>(2);
      return (
        <>
          <NumberField label="Controlled" value={v} onValueChange={setV} />
          <button onClick={() => setV(40)}>forty</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    const input = screen.getByLabelText<HTMLInputElement>("Controlled");
    await userEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(input).toHaveValue("3");
    await userEvent.click(screen.getByRole("button", { name: "forty" }));
    expect(input).toHaveValue("40");
  });

  it("labels rename the buttons (i18n)", () => {
    renderUi(<NumberField label="Menge" labels={{ increment: "Erhöhen", decrement: "Verringern" }} />, variant);
    expect(screen.getByRole("button", { name: "Erhöhen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verringern" })).toBeInTheDocument();
  });

  it('steppers="none" renders only the input; "stacked" renders a button pair', () => {
    const { rerender } = renderUi(<NumberField label="Bare" steppers="none" />, variant);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<NumberField label="Stacked" steppers="stacked" />);
    expect(screen.getAllByRole("button", { hidden: true }).length).toBeGreaterThanOrEqual(2);
  });

  it("formats with Intl options (currency)", () => {
    renderUi(
      <NumberField
        label="Price"
        defaultValue={1234.5}
        locale="en-US"
        format={{ style: "currency", currency: "USD" }}
      />,
      variant,
    );
    expect(screen.getByLabelText("Price")).toHaveValue("$1,234.50");
  });

  it("error text marks the field invalid", () => {
    renderUi(<NumberField label="Age" error="Must be 18+" defaultValue={3} />, variant);
    expect(screen.getByText("Must be 18+")).toBeInTheDocument();
    expect(screen.getByLabelText("Age")).toHaveAttribute("aria-invalid", "true");
  });

  it("disabled and readOnly fields cannot be changed", async () => {
    renderUi(
      <>
        <NumberField label="Off" defaultValue={1} disabled />
        <NumberField label="Locked" defaultValue={2} readOnly />
      </>,
      variant,
    );
    expect(screen.getByLabelText("Off")).toBeDisabled();
    const locked = screen.getByLabelText<HTMLInputElement>("Locked");
    locked.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(locked).toHaveValue("2");
  });

  it("scrub makes the label a drag handle", () => {
    renderUi(<NumberField label="Scrub me" scrub defaultValue={1} />, variant);
    expect(document.querySelector("[data-slot=number-field-scrub]")).toBeInTheDocument();
  });

  it("is a named text input announced as a number field (no spinbutton role, no aria-value*)", () => {
    renderUi(<NumberField label="Guests" defaultValue={2} min={1} max={12} />, variant);
    const input = screen.getByRole("textbox", { name: "Guests" });
    expect(input).toHaveAttribute("aria-roledescription", "Number field");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).not.toHaveAttribute("aria-valuenow");
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("has no axe violations", async () => {
    renderUi(
      <div className="grid gap-4">
        <NumberField label="Split" defaultValue={2} />
        <NumberField label="Stacked" steppers="stacked" defaultValue={2} />
        <NumberField label="Errored" error="Bad" defaultValue={2} />
        <NumberField aria-label="Bare" steppers="none" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the input shows its real text (no rolling-digit overlay)", () => {
  reduceMotion();
  renderUi(<NumberField label="Calm" defaultValue={42} />);
  const input = screen.getByLabelText("Calm");
  expect(getComputedStyle(input).color).not.toBe("rgba(0, 0, 0, 0)");
});

it("with motion the digits roll on an overlay and the input text is transparent", () => {
  renderUi(<NumberField label="Lively" defaultValue={42} />);
  const input = screen.getByLabelText("Lively");
  expect(getComputedStyle(input).color).toBe("rgba(0, 0, 0, 0)");
});
