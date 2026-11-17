import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { OtpInput } from "../../src/components/otp-input/otp-input";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const slots = () => screen.getAllByRole<HTMLInputElement>("textbox");
const group = () => slots()[0]!.closest<HTMLElement>("[data-status]")!;
const code = () =>
  slots()
    .map((s) => s.value)
    .join("");

describeVariants((variant) => {
  it("renders one named slot per digit; the first is named by the label, the rest 'Digit n of N'", () => {
    renderUi(<OtpInput label="Verification code" length={6} />, variant);
    expect(slots()).toHaveLength(6);
    expect(slots()[0]).toHaveAccessibleName("Verification code");
    expect(slots()[1]).toHaveAccessibleName("Digit 2 of 6");
    expect(slots()[5]).toHaveAccessibleName("Digit 6 of 6");
  });

  it("aria-label names the field when there is no visible label; digitLabel is translatable", () => {
    renderUi(<OtpInput aria-label="Code" length={4} digitLabel={(p, n) => `Ziffer ${p} von ${n}`} />, variant);
    expect(slots()[0]).toHaveAccessibleName("Code");
    expect(slots()[3]).toHaveAccessibleName("Ziffer 4 von 4");
  });

  it("typing fills the slots and moves focus forward; onComplete fires once all are filled", async () => {
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    renderUi(<OtpInput aria-label="Code" length={4} onValueChange={onValueChange} onComplete={onComplete} />, variant);
    slots()[0]!.focus();
    await userEvent.keyboard("123");
    expect(code()).toBe("123");
    expect(slots()[3]).toHaveFocus();
    expect(onComplete).not.toHaveBeenCalled();
    await userEvent.keyboard("4");
    expect(code()).toBe("1234");
    expect(onComplete).toHaveBeenCalledWith("1234");
    expect(onValueChange).toHaveBeenLastCalledWith("1234");
  });

  it("Backspace removes the last digit and goes back; arrows move between slots", async () => {
    renderUi(<OtpInput aria-label="Code" length={4} defaultValue="12" />, variant);
    slots()[1]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(slots()[2]).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(slots()[0]).toHaveFocus();
    slots()[1]!.focus();
    await userEvent.keyboard("{Backspace}");
    expect(code()).toBe("1");
  });

  it("pasting a full code fills every slot", async () => {
    const onComplete = vi.fn();
    renderUi(<OtpInput aria-label="Code" length={6} onComplete={onComplete} />, variant);
    slots()[0]!.focus();
    // Simulate the paste event (clipboard permissions are not granted in headless runs).
    const data = new DataTransfer();
    data.setData("text/plain", "987654");
    slots()[0]!.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await expect.poll(code).toBe("987654");
    expect(onComplete).toHaveBeenCalledWith("987654");
  });

  it("non-digit characters are rejected", async () => {
    renderUi(<OtpInput aria-label="Code" length={4} />, variant);
    slots()[0]!.focus();
    await userEvent.keyboard("ab12");
    expect(code()).toBe("12");
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState("12");
      return (
        <>
          <OtpInput aria-label="Code" length={4} value={v} onValueChange={setV} />
          <button onClick={() => setV("")}>clear</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    expect(code()).toBe("12");
    await userEvent.click(screen.getByRole("button", { name: "clear" }));
    expect(code()).toBe("");
  });

  it("mask hides the digits; disabled blocks input; name submits with a form", () => {
    renderUi(
      <form data-testid="f">
        <OtpInput aria-label="PIN" length={4} mask name="pin" defaultValue="1234" />
        <OtpInput aria-label="Locked" length={4} disabled />
      </form>,
      variant,
    );
    // Masked slots are password inputs (so they are not "textbox" role).
    expect(document.querySelectorAll("input[type=password]")).toHaveLength(4);
    expect(slots().length).toBe(4);
    expect(slots().every((s) => s.disabled)).toBe(true);
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("pin")).toBe("1234");
  });

  it("error and success statuses show and announce their message; slots are invalid in error", () => {
    const { rerender } = renderUi(
      <OtpInput aria-label="Code" length={4} status="error" errorMessage="Wrong code" successMessage="Verified" />,
      variant,
    );
    expect(screen.getByText("Wrong code")).toBeInTheDocument();
    expect(screen.queryByText("Verified")).toBeNull();
    expect(slots()[0]).toHaveAttribute("aria-invalid", "true");
    // The message is a polite live region and is also the group's description.
    expect(group()).toHaveAccessibleDescription(/Wrong code/);
    expect(screen.getByText("Wrong code").closest("[aria-live=polite]")).not.toBeNull();
    rerender(
      <OtpInput aria-label="Code" length={4} status="success" errorMessage="Wrong code" successMessage="Verified" />,
    );
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.queryByText("Wrong code")).toBeNull();
  });

  it("description is linked to the field; grouped splits the slots", () => {
    renderUi(<OtpInput aria-label="Code" length={6} grouped description="We emailed you a code" />, variant);
    expect(group()).toHaveAccessibleDescription(/We emailed you a code/);
  });

  it("autoFocus focuses the first slot", () => {
    renderUi(<OtpInput aria-label="Code" length={4} autoFocus />, variant);
    expect(slots()[0]).toHaveFocus();
  });

  it("has no axe violations (idle, error, success, grouped)", async () => {
    renderUi(
      <div className="grid gap-6">
        <OtpInput label="Code" length={6} grouped description="Six digits" />
        <OtpInput aria-label="Wrong" length={4} status="error" errorMessage="Try again" defaultValue="1111" />
        <OtpInput aria-label="Right" length={4} status="success" successMessage="Verified" defaultValue="2222" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the error shake is not animated", () => {
  reduceMotion();
  renderUi(<OtpInput aria-label="Code" length={4} status="error" errorMessage="Nope" />);
  const root = slots()[0]!.closest("[data-status]")!;
  expect(getComputedStyle(root).animationName).toBe("none");
});

it("with motion the error status shakes the group", () => {
  renderUi(<OtpInput aria-label="Code" length={4} status="error" errorMessage="Nope" />);
  const root = slots()[0]!.closest("[data-status]")!;
  expect(getComputedStyle(root).animationName).not.toBe("none");
});

it("the accessible name comes from labels.name when no label or aria-label is given", () => {
  renderUi(<OtpInput length={4} labels={{ name: "Bestätigungscode" }} />);
  expect(screen.getByText("Bestätigungscode")).toBeTruthy();
});

const seal = () => document.querySelector("[data-slot=otp-seal]");

it("success shows the seal by default and the slots keep their values", async () => {
  renderUi(<OtpInput aria-label="Code" length={4} defaultValue="1234" status="success" successMessage="Verified" />);
  await expect.poll(seal).not.toBeNull();
  expect(seal()).toHaveAttribute("aria-hidden", "true");
  expect(group()).toHaveAttribute("data-success-effect", "seal");
  expect(code()).toBe("1234");
  expect(screen.getByText("Verified")).toBeInTheDocument();
});

it("the seal stays inside the row: same size with and without success", async () => {
  const { rerender } = renderUi(<OtpInput aria-label="Code" length={6} defaultValue="123456" />);
  const before = group().getBoundingClientRect();
  rerender(<OtpInput aria-label="Code" length={6} defaultValue="123456" status="success" />);
  await expect.poll(seal).not.toBeNull();
  const after = group().getBoundingClientRect();
  expect(after.width).toBe(before.width);
  expect(after.height).toBe(before.height);
  const s = seal()!.getBoundingClientRect();
  expect(s.height).toBeLessThanOrEqual(after.height + 0.5);
});

it("reduced motion: the seal fades in with no scan, rays or sparks", async () => {
  reduceMotion();
  renderUi(<OtpInput aria-label="Code" length={4} defaultValue="1234" status="success" />);
  await expect.poll(seal).not.toBeNull();
  expect(seal()!.children).toHaveLength(1);
});

it('successEffect="ring" ripples the slots and shows no seal', () => {
  renderUi(<OtpInput aria-label="Code" length={4} defaultValue="1234" status="success" successEffect="ring" />);
  expect(seal()).toBeNull();
  expect(group().querySelectorAll("span.border-sheen-success")).toHaveLength(4);
});

it('successEffect="none" only recolours the slots', () => {
  renderUi(<OtpInput aria-label="Code" length={4} defaultValue="1234" status="success" successEffect="none" />);
  expect(seal()).toBeNull();
  expect(group().querySelectorAll("span.border-sheen-success")).toHaveLength(0);
});

it("the seal leaves again when status goes back to idle", async () => {
  const { rerender } = renderUi(<OtpInput aria-label="Code" length={4} defaultValue="1234" status="success" />);
  await expect.poll(seal).not.toBeNull();
  rerender(<OtpInput aria-label="Code" length={4} defaultValue="1234" status="idle" />);
  await expect.poll(seal, { timeout: 3000 }).toBeNull();
});

it("a wrong code flashes a red glow (not under reduced motion)", () => {
  renderUi(<OtpInput aria-label="Code" length={4} status="error" errorMessage="Nope" />);
  expect(document.querySelector("[data-slot=otp-error-glow]")).not.toBeNull();
});
