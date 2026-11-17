import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Radio, RadioCard, RadioGroup, type RadioItem } from "../../src/components/radio-group/radio-group";
import { describeVariants, renderUi, runAxe } from "../render";

const plans: RadioItem[] = [
  { value: "free", label: "Free", description: "For hobby projects" },
  { value: "pro", label: "Pro", description: "For teams", meta: "$12/mo" },
  { value: "ent", label: "Enterprise", disabled: true },
];

describeVariants((variant) => {
  it("is a named radiogroup of labelled radios with descriptions", () => {
    renderUi(<RadioGroup label="Plan" description="Pick one" items={plans} defaultValue="free" />, variant);
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    expect(group).toBeInTheDocument();
    const free = screen.getByRole("radio", { name: "Free" });
    expect(free).toHaveAttribute("aria-checked", "true");
    // The group's helper text is read with every option.
    expect(free).toHaveAccessibleDescription(/For hobby projects/);
    expect(free).toHaveAccessibleDescription(/Pick one/);
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Enterprise" })).toHaveAttribute("aria-disabled", "true");
  });

  it("click selects and reports the value", async () => {
    const onValueChange = vi.fn();
    renderUi(<RadioGroup label="Plan" items={plans} onValueChange={onValueChange} />, variant);
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith("pro");
    // Clicking the label text selects too.
    await userEvent.click(screen.getByText("Free"));
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "true");
  });

  it("is a single tab stop; arrows move and select, skipping disabled options, and wrap", async () => {
    renderUi(
      <>
        <button>before</button>
        <RadioGroup label="Plan" items={plans} defaultValue="free" />
        <button>after</button>
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    const free = screen.getByRole("radio", { name: "Free" });
    const pro = screen.getByRole("radio", { name: "Pro" });
    expect(free).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(pro).toHaveFocus();
    expect(pro).toHaveAttribute("aria-checked", "true");
    // Enterprise is disabled: the next arrow wraps back to Free.
    await userEvent.keyboard("{ArrowRight}");
    expect(free).toHaveFocus();
    expect(free).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowUp}");
    expect(pro).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState("free");
      return (
        <>
          <RadioGroup label="Plan" items={plans} value={v} onValueChange={setV} />
          <button onClick={() => setV("pro")}>go pro</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("button", { name: "go pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "false");
  });

  it("composes <Radio> children, with horizontal orientation", () => {
    renderUi(
      <RadioGroup aria-label="Size" orientation="horizontal" defaultValue="m">
        <Radio value="s" label="Small" />
        <Radio value="m" label="Medium" />
        <Radio value="l" label="Large" description="Roomy" />
      </RadioGroup>,
      variant,
    );
    expect(screen.getByRole("radiogroup", { name: "Size" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Medium" })).toHaveAttribute("aria-checked", "true");
    const list = document.querySelector("[data-slot=radio-group-list]")!;
    expect(list.className).toContain("flex-wrap");
  });

  it("card variant: cards are radios named by label + meta, selecting one marks it", async () => {
    renderUi(<RadioGroup label="Plan" variant="card" items={plans} columns={2} />, variant);
    const pro = screen.getByRole("radio", { name: /Pro/ });
    expect(pro).toHaveAccessibleName(/\$12\/mo/);
    await userEvent.click(screen.getByText("For teams"));
    expect(pro).toHaveAttribute("aria-checked", "true");
    pro.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: /Free/ })).toHaveAttribute("aria-checked", "true");
  });

  it("composed <RadioCard> accepts icon, meta and children", () => {
    renderUi(
      <RadioGroup aria-label="Shipping" variant="card" defaultValue="std">
        <RadioCard value="std" label="Standard" meta="Free" icon={<svg width="16" height="16" />}>
          <ul>
            <li>3-5 days</li>
          </ul>
        </RadioCard>
        <RadioCard value="exp" label="Express" description="Next day" />
      </RadioGroup>,
      variant,
    );
    expect(screen.getByRole("radio", { name: /Standard/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Express" })).toHaveAccessibleDescription("Next day");
  });

  it("error text is shown, marks radios invalid and sits in a polite region", () => {
    renderUi(<RadioGroup label="Plan" items={plans} error="Choose a plan" />, variant);
    expect(screen.getByText("Choose a plan")).toBeInTheDocument();
    expect(screen.getByText("Choose a plan").closest("[aria-live=polite]")).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-invalid", "true");
  });

  it("disabled and readOnly groups cannot change", async () => {
    const { rerender } = renderUi(<RadioGroup label="Plan" items={plans} defaultValue="free" disabled />, variant);
    screen.getByRole("radio", { name: "Pro" }).click();
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "false");
    rerender(<RadioGroup label="Plan" items={plans} defaultValue="free" readOnly />);
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "true");
  });

  it("submits its value with a form", async () => {
    renderUi(
      <form data-testid="f">
        <RadioGroup label="Plan" items={plans} name="plan" defaultValue="free" />
      </form>,
      variant,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("plan")).toBe("pro");
  });

  it("has no axe violations (classic and card, with an error)", async () => {
    renderUi(
      <div className="grid gap-6">
        <RadioGroup label="Classic" items={plans} defaultValue="free" />
        <RadioGroup label="Cards" variant="card" items={plans} defaultValue="pro" columns={3} />
        <RadioGroup label="Errored" items={plans} error="Required" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

describeVariants((variant) => {
  it("gives every element a unique id, within a group and across groups", () => {
    const { container } = renderUi(
      <>
        <RadioGroup label="Plan" description="Pick one" name="plan" required items={plans} defaultValue="free" />
        <RadioGroup label="Billing" name="billing" items={plans} variant={"card"} />
      </>,
      variant,
    );
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const el of container.querySelectorAll("[aria-labelledby],[aria-describedby]")) {
      for (const ref of `${el.getAttribute("aria-labelledby") ?? ""} ${el.getAttribute("aria-describedby") ?? ""}`
        .split(/\s+/)
        .filter(Boolean)) {
        expect(container.querySelector(`[id="${ref}"]`), ref).not.toBeNull();
      }
    }
  });
});
