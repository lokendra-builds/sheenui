import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Checkbox } from "../../src/components/checkbox/checkbox";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("is a labelled checkbox that toggles on click, Space and label click", async () => {
    const onCheckedChange = vi.fn();
    renderUi(
      <Checkbox label="Accept terms" description="Read the terms first" onCheckedChange={onCheckedChange} />,
      variant,
    );
    const box = screen.getByRole("checkbox", { name: /Accept terms/ });
    expect(box).toHaveAttribute("aria-checked", "false");
    expect(box).toHaveAccessibleName(/Accept terms/);

    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());

    box.focus();
    await userEvent.keyboard(" ");
    expect(box).toHaveAttribute("aria-checked", "false");

    // Clicking the label text toggles it too.
    await userEvent.click(screen.getByText("Accept terms"));
    expect(box).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledTimes(3);
  });

  it("Tab reaches it and Tab leaves it", async () => {
    renderUi(
      <>
        <button>before</button>
        <Checkbox label="Option" />
        <button>after</button>
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("checkbox", { name: "Option" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("uncontrolled: defaultChecked sets the start state", () => {
    renderUi(<Checkbox label="On" defaultChecked />, variant);
    expect(screen.getByRole("checkbox", { name: "On" })).toHaveAttribute("aria-checked", "true");
  });

  it("controlled: the parent decides", async () => {
    function Controlled() {
      const [v, setV] = useState(false);
      return (
        <>
          <Checkbox label="Controlled" checked={v} onCheckedChange={setV} />
          <output>{String(v)}</output>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("checkbox", { name: "Controlled" }));
    expect(screen.getByRole("status")).toHaveTextContent("true");
    expect(screen.getByRole("checkbox", { name: "Controlled" })).toHaveAttribute("aria-checked", "true");
  });

  it("a locked controlled checkbox ignores clicks", async () => {
    renderUi(<Checkbox label="Locked" checked={false} onCheckedChange={() => undefined} />, variant);
    const box = screen.getByRole("checkbox", { name: "Locked" });
    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("indeterminate shows mixed state and a dash mark", () => {
    renderUi(<Checkbox label="Select all" indeterminate />, variant);
    const box = screen.getByRole("checkbox", { name: "Select all" });
    expect(box).toHaveAttribute("aria-checked", "mixed");
    const dash = box.querySelector("path[d='M6 12h12']")!;
    expect(getComputedStyle(dash).opacity).toBe("1");
  });

  it("disabled and readOnly checkboxes do not change and disabled leaves the tab order", async () => {
    renderUi(
      <>
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Read only" readOnly defaultChecked />
      </>,
      variant,
    );
    const disabled = screen.getByRole("checkbox", { name: "Disabled" });
    const ro = screen.getByRole("checkbox", { name: "Read only" });
    expect(disabled).toHaveAttribute("data-disabled");
    // The disabled one is skipped: the first Tab lands on the read-only checkbox.
    await userEvent.tab();
    expect(disabled).not.toHaveFocus();
    expect(ro).toHaveFocus();
    await userEvent.keyboard(" ");
    await userEvent.click(ro);
    expect(ro).toHaveAttribute("aria-checked", "true");
    disabled.click();
    expect(disabled).toHaveAttribute("aria-checked", "false");
  });

  it("without a label it is a bare control that needs aria-label", () => {
    renderUi(<Checkbox aria-label="Select row 3" />, variant);
    expect(screen.getByRole("checkbox", { name: "Select row 3" })).toBeInTheDocument();
  });

  it("participates in forms through name/value", async () => {
    renderUi(
      <form data-testid="f">
        <Checkbox label="News" name="news" value="yes" />
      </form>,
      variant,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "News" }));
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("news")).toBe("yes");
  });

  it("has no axe violations (unchecked, checked, mixed, disabled)", async () => {
    renderUi(
      <div className="grid gap-3">
        <Checkbox label="Unchecked" description="With a description" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Mixed" indeterminate />
        <Checkbox label="Disabled" disabled />
        <Checkbox aria-label="Bare" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: a checked mark is visible straight away and not scaled down", async () => {
  reduceMotion();
  renderUi(<Checkbox label="Calm" />);
  const box = screen.getByRole("checkbox", { name: "Calm" });
  await userEvent.click(box);
  const mark = box.querySelector("span")!;
  await expect.poll(() => Number(getComputedStyle(mark).opacity)).toBe(1);
  // No scale transform on the unchecked mark under reduced motion either.
  expect(getComputedStyle(mark).scale === "none" || getComputedStyle(mark).scale === "1").toBe(true);
});

it("className lands on the outer element, controlClassName on the box", () => {
  const { container, unmount } = renderUi(<Checkbox label="Outer" className="my-outer" controlClassName="my-box" />);
  const box = screen.getByRole("checkbox", { name: "Outer" });
  expect(box).toHaveClass("my-box");
  expect(box).not.toHaveClass("my-outer");
  expect(container.querySelector("label")).toHaveClass("my-outer");
  unmount();
  renderUi(<Checkbox aria-label="Bare" className="my-outer" />);
  expect(screen.getByRole("checkbox", { name: "Bare" })).toHaveClass("my-outer");
});

it("draws the check and the dash as two pathLength marks and swaps which one is shown", () => {
  const { container } = renderUi(<Checkbox aria-label="Draw" indeterminate />);
  const marks = () => Array.from(container.querySelectorAll<SVGPathElement>("svg path"));
  expect(marks()).toHaveLength(2);
  for (const mark of marks()) expect(mark.getAttribute("pathLength")).toBe("1");
  const [check, dash] = marks() as [SVGPathElement, SVGPathElement];
  expect(getComputedStyle(dash).opacity).toBe("1");
  expect(getComputedStyle(check).opacity).toBe("0");
  // Draws over the fast token (150 ms), not the old base duration.
  expect(parseFloat(getComputedStyle(dash).transitionDuration)).toBeCloseTo(0.15, 2);
});

it("reduced motion: the marks are not drawn, only the wrapper fades, and the hidden mark stays hidden", () => {
  reduceMotion();
  const { container } = renderUi(<Checkbox aria-label="Calm" defaultChecked />);
  const [check, dash] = Array.from(container.querySelectorAll<SVGPathElement>("svg path")) as [
    SVGPathElement,
    SVGPathElement,
  ];
  expect(getComputedStyle(check).opacity).toBe("1");
  expect(getComputedStyle(dash).opacity).toBe("0");
  expect(parseFloat(getComputedStyle(check).transitionDuration)).toBeLessThanOrEqual(0.12);
});
