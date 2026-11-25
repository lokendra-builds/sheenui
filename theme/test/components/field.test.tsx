import { expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Label,
  useField,
} from "../../src/components/field/field";
import { Input } from "../../src/components/input/input";
import { Select } from "../../src/components/select/select";
import { Switch } from "../../src/components/switch/switch";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("names the control with the label and links the description", async () => {
    renderUi(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <input type="email" />
        </FieldControl>
        <FieldDescription>Used for receipts.</FieldDescription>
      </Field>,
      variant,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    await expect.poll(() => input.getAttribute("aria-describedby")).not.toBeNull();
    expect(document.getElementById(input.getAttribute("aria-describedby")!)).toHaveTextContent("Used for receipts.");
    await userEvent.click(screen.getByText("Email"));
    expect(input).toHaveFocus();
  });

  it("invalid sets aria-invalid and shows the error as an alert linked to the control", async () => {
    renderUi(
      <Field invalid>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <input />
        </FieldControl>
        <FieldDescription>Your full name.</FieldDescription>
        <FieldError>Name is required.</FieldError>
      </Field>,
      variant,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Name is required.");
    await expect.poll(() => input.getAttribute("aria-describedby")?.split(" ").length).toBe(2);
  });

  it("the error is hidden while the field is valid and appears when it turns invalid", () => {
    const { rerender } = renderUi(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <input />
        </FieldControl>
        <FieldError>Nope</FieldError>
      </Field>,
      variant,
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    rerender(
      <Field invalid>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <input />
        </FieldControl>
        <FieldError>Nope</FieldError>
      </Field>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Nope");
  });

  it("required adds the asterisk (hidden from screen readers) and required on the control; disabled disables it", () => {
    renderUi(
      <Field required disabled>
        <FieldLabel>Code</FieldLabel>
        <FieldControl>
          <input />
        </FieldControl>
      </Field>,
      variant,
    );
    const input = screen.getByRole("textbox", { name: /Code/ });
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("merges the control's own aria-describedby and accepts a render function", async () => {
    renderUi(
      <Field>
        <FieldLabel>Plan</FieldLabel>
        <FieldControl>
          {(props) => (
            <select {...props} aria-describedby={`${props["aria-describedby"] ?? ""} extra`.trim()}>
              <option>Free</option>
            </select>
          )}
        </FieldControl>
        <FieldDescription>Pick one.</FieldDescription>
      </Field>,
      variant,
    );
    const select = screen.getByRole("combobox", { name: "Plan" });
    await expect.poll(() => select.getAttribute("aria-describedby")).toContain("extra");
    expect(select.id).not.toBe("");
  });

  it("works with SheenUI controls (Input, Select) that take id and aria props", () => {
    renderUi(
      <>
        <Field invalid>
          <FieldLabel>Handle</FieldLabel>
          <FieldControl>
            <Input />
          </FieldControl>
          <FieldError>Taken</FieldError>
        </Field>
        <Field>
          <FieldLabel>Fruit</FieldLabel>
          <FieldControl>
            <Select items={[{ value: "a", label: "Apple" }]} />
          </FieldControl>
        </Field>
      </>,
      variant,
    );
    expect(screen.getByRole("textbox", { name: "Handle" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("Label works on its own, and useField is null outside a Field", () => {
    function Probe() {
      return <output>{useField() === null ? "null" : "field"}</output>;
    }
    renderUi(
      <>
        <Label htmlFor="x" hint="(optional)">
          Nick
        </Label>
        <input id="x" />
        <Probe />
      </>,
      variant,
    );
    expect(screen.getByRole("textbox", { name: /Nick/ })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("null");
  });

  it("has no axe violations", async () => {
    renderUi(
      <Field invalid required>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <input type="email" />
        </FieldControl>
        <FieldDescription>Receipts only.</FieldDescription>
        <FieldError>Enter an email.</FieldError>
      </Field>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

describeVariants((variant) => {
  it("keeps the control's own disabled, required, aria-invalid and id, and merges the field's wiring", async () => {
    renderUi(
      <Field>
        <FieldLabel>Own</FieldLabel>
        <FieldControl>
          <input id="own-id" disabled required aria-invalid aria-describedby="mine" />
        </FieldControl>
        <FieldDescription>Hint.</FieldDescription>
      </Field>,
      variant,
    );
    const input = screen.getByRole("textbox", { name: "Own" });
    expect(input).toHaveAttribute("id", "own-id");
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    // The label points at the control's own id, and the description id is joined to the control's own one.
    expect(screen.getByText("Own")).toHaveAttribute("for", "own-id");
    await expect
      .poll(() => input.getAttribute("aria-describedby")?.split(" "))
      .toEqual(expect.arrayContaining(["mine", expect.any(String)]));
    expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
  });

  it("the field's invalid is OR-ed with the control's own state, and its disabled and required reach a plain control", () => {
    renderUi(
      <>
        <Field invalid required>
          <FieldLabel>Plain</FieldLabel>
          <FieldControl>
            <input />
          </FieldControl>
        </Field>
        <Field disabled>
          <FieldLabel>Off</FieldLabel>
          <FieldControl>
            <input />
          </FieldControl>
        </Field>
        <Field disabled>
          <FieldLabel>Enabled itself</FieldLabel>
          <FieldControl>
            <input disabled={false} />
          </FieldControl>
        </Field>
      </>,
      variant,
    );
    const plain = screen.getByRole("textbox", { name: /Plain/ });
    expect(plain).toHaveAttribute("aria-invalid", "true");
    expect(plain).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Off" })).toBeDisabled();
    // The control's own explicit value wins over the field's.
    expect(screen.getByRole("textbox", { name: "Enabled itself" })).toBeEnabled();
  });

  it("composes the control's own handlers and ref with the field's", async () => {
    const onBlur = vi.fn();
    const ref = { current: null as HTMLInputElement | null };
    renderUi(
      <Field>
        <FieldLabel>Ref</FieldLabel>
        <FieldControl>
          <input ref={ref} onBlur={onBlur} />
        </FieldControl>
      </Field>,
      variant,
    );
    const input = screen.getByRole("textbox", { name: "Ref" });
    expect(ref.current).toBe(input);
    await userEvent.click(input);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("renders on the server with the control's own props intact", () => {
    const html = renderToString(
      <Field required>
        <FieldLabel>Server</FieldLabel>
        <FieldControl>
          <input id="f-control" disabled required aria-invalid />
        </FieldControl>
      </Field>,
    );
    expect(html).toMatch(/<input[^>]*id="f-control"/);
    expect(html).toMatch(/<input[^>]*disabled=""/);
    expect(html).toMatch(/<input[^>]*required=""/);
    expect(html).toMatch(/<input[^>]*aria-invalid="true"/);
  });
});

describeVariants((variant) => {
  it("a Base UI control (Switch) joins the field without FieldControl and is named by the label", () => {
    renderUi(
      <Field disabled>
        <FieldLabel>Alerts</FieldLabel>
        <Switch />
        <FieldDescription>Email me.</FieldDescription>
      </Field>,
      variant,
    );
    const toggle = screen.getByRole("switch", { name: "Alerts" });
    expect(toggle).toHaveAttribute("aria-disabled", "true");
  });
});
