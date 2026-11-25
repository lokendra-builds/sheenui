import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Input } from "../../src/components/input/input";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("passes email/search defaults, loading busy state and declared form props to the input", () => {
    renderUi(
      <>
        <Input label="Mail" type="email" loading name="mail" required readOnly />
        <Input label="Find" type="search" />
        <Input label="Code" autoComplete="one-time-code" enterKeyHint="done" />
      </>,
      variant,
    );
    const mail = screen.getByLabelText("Mail");
    expect(mail).toHaveAttribute("autocomplete", "email");
    expect(mail).toHaveAttribute("aria-busy", "true");
    expect(mail).toHaveAttribute("name", "mail");
    expect(mail).toBeRequired();
    expect(mail).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Find")).toHaveAttribute("enterkeyhint", "search");
    const code = screen.getByLabelText("Code");
    expect(code).toHaveAttribute("autocomplete", "one-time-code");
    expect(code).toHaveAttribute("enterkeyhint", "done");
  });

  it("links the label and description to the input and accepts typing", async () => {
    const onChange = vi.fn();
    renderUi(
      <Input label="Email" description="We never share it." placeholder="you@example.com" onChange={onChange} />,
      variant,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("We never share it.");
    expect(input).toHaveAttribute("placeholder", "you@example.com");

    await userEvent.click(input);
    expect(input).toHaveFocus();
    await userEvent.keyboard("ava@example.com");
    expect(input).toHaveValue("ava@example.com");
    expect(onChange).toHaveBeenCalled();
  });

  it("an error marks the field invalid and is announced as its description", () => {
    renderUi(<Input label="Password" error="At least 8 characters." defaultValue="abc" />, variant);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("At least 8 characters.");
    expect(screen.getByText("At least 8 characters.")).toBeVisible();
  });

  it("disabled fields cannot be focused by Tab", async () => {
    renderUi(
      <>
        <Input label="First" />
        <Input label="Second" disabled />
        <Input label="Third" />
      </>,
      variant,
    );
    screen.getByLabelText("First").focus();
    await userEvent.tab();
    expect(screen.getByLabelText("Third")).toHaveFocus();
    expect(screen.getByLabelText("Second")).toBeDisabled();
  });

  it("has no axe violations (plain, with icons, invalid, disabled)", async () => {
    renderUi(
      <div className="grid max-w-sm gap-4 p-6">
        <Input label="Name" />
        <Input label="Search" leading={<span aria-hidden>🔍</span>} trailing={<span aria-hidden>⌘K</span>} />
        <Input label="Email" error="Enter a valid email." defaultValue="nope" />
        <Input label="Locked" disabled defaultValue="read only" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
