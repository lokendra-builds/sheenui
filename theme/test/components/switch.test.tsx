import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Switch } from "../../src/components/switch/switch";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("is a labelled switch that toggles on click, Space, Enter and label click", async () => {
    const onCheckedChange = vi.fn();
    renderUi(<Switch label="Wi-Fi" description="Join known networks" onCheckedChange={onCheckedChange} />, variant);
    const sw = screen.getByRole("switch", { name: /Wi-Fi/ });
    expect(sw).toHaveAttribute("aria-checked", "false");

    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(sw).toHaveAttribute("data-checked");

    sw.focus();
    await userEvent.keyboard(" ");
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard("{Enter}");
    // Base UI's switch is a button, so Enter toggles it too.
    expect(sw).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{Enter}");
    expect(sw).toHaveAttribute("aria-checked", "false");

    await userEvent.click(screen.getByText("Wi-Fi"));
    expect(onCheckedChange).toHaveBeenCalled();
  });

  it("uncontrolled defaultChecked", () => {
    renderUi(<Switch label="Dark" defaultChecked />, variant);
    expect(screen.getByRole("switch", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
  });

  it("controlled: the parent owns the state", async () => {
    function Controlled() {
      const [on, setOn] = useState(true);
      return (
        <>
          <Switch label="Sync" checked={on} onCheckedChange={setOn} />
          <output>{on ? "on" : "off"}</output>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("switch", { name: "Sync" }));
    expect(screen.getByRole("status")).toHaveTextContent("off");
    expect(screen.getByRole("switch", { name: "Sync" })).toHaveAttribute("aria-checked", "false");
  });

  it("disabled cannot be toggled or focused; readOnly keeps its value", async () => {
    const onChange = vi.fn();
    renderUi(
      <>
        <Switch label="Disabled" disabled onCheckedChange={onChange} />
        <Switch label="Read only" readOnly defaultChecked onCheckedChange={onChange} />
      </>,
      variant,
    );
    await userEvent.tab();
    expect(screen.getByRole("switch", { name: "Read only" })).toHaveFocus();
    // A disabled switch is not actionable for a pointer, so click it natively.
    screen.getByRole("switch", { name: "Disabled" }).click();
    await userEvent.click(screen.getByRole("switch", { name: "Read only" }));
    await userEvent.keyboard(" ");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("switch", { name: "Read only" })).toHaveAttribute("aria-checked", "true");
  });

  it("unlabelled switch takes aria-label", () => {
    renderUi(<Switch aria-label="Notifications" />, variant);
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeInTheDocument();
  });

  it("submits with a form via name", async () => {
    renderUi(
      <form data-testid="f">
        <Switch label="Beta" name="beta" />
      </form>,
      variant,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Beta" }));
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("beta")).toBe("on");
  });

  it("has no axe violations", async () => {
    renderUi(
      <div className="grid gap-3">
        <Switch label="Off" description="Nothing here" />
        <Switch label="On" defaultChecked />
        <Switch label="Disabled" disabled />
        <Switch aria-label="Bare" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the thumb has no transition (snaps)", async () => {
  reduceMotion();
  renderUi(<Switch label="Calm" />);
  const sw = screen.getByRole("switch", { name: "Calm" });
  const thumb = sw.querySelector("span")!;
  // Reduced motion caps any leftover transition at 120 ms (a fade); the movement itself is gone.
  expect(parseFloat(getComputedStyle(thumb).transitionDuration)).toBeLessThanOrEqual(0.12);
  await userEvent.click(sw);
  expect(sw).toHaveAttribute("aria-checked", "true");
});

it("with motion, the thumb has a spring transition", () => {
  renderUi(<Switch label="Lively" />);
  const thumb = screen.getByRole("switch", { name: "Lively" }).querySelector("span")!;
  expect(parseFloat(getComputedStyle(thumb).transitionDuration)).toBeGreaterThan(0);
});

it("className lands on the outer element, controlClassName on the track", () => {
  const { container, unmount } = renderUi(<Switch label="Outer" className="my-outer" controlClassName="my-track" />);
  const sw = screen.getByRole("switch", { name: "Outer" });
  expect(sw).toHaveClass("my-track");
  expect(sw).not.toHaveClass("my-outer");
  expect(container.querySelector("label")).toHaveClass("my-outer");
  unmount();
  renderUi(<Switch aria-label="Bare" className="my-outer" />);
  expect(screen.getByRole("switch", { name: "Bare" })).toHaveClass("my-outer");
});

it("pressing stretches the thumb with scale (transform), never width", () => {
  renderUi(<Switch label="Stretch" />);
  const sw = screen.getByRole("switch", { name: "Stretch" });
  const thumb = sw.querySelector<HTMLElement>("span")!;
  const width = getComputedStyle(thumb).width;
  expect(getComputedStyle(thumb).transitionProperty).toContain("scale");
  expect(getComputedStyle(thumb).transitionProperty).not.toContain("width");
  expect(getComputedStyle(thumb).width).toBe(width);
});
