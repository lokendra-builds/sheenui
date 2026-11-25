// Switch and Checkbox share one label / description / error layout (lib/field-control-shell). Where
// `className` lands depends on which optional props are set; this pins that contract for both.

import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Checkbox } from "../../src/components/checkbox/checkbox";
import { Switch } from "../../src/components/switch/switch";
import { renderUi } from "../render";

const controls = [
  ["switch", Switch, "switch"],
  ["checkbox", Checkbox, "checkbox"],
] as const;

it.each(controls)("%s: className lands on the control when there is no label or error", (_n, Control, role) => {
  renderUi(<Control aria-label="Solo" className="mine" />);
  expect(screen.getByRole(role, { name: "Solo" })).toHaveClass("mine");
});

it.each(controls)("%s: className lands on the <label> when there is a label", (_n, Control, role) => {
  renderUi(<Control label="Notify" description="By email" className="mine" />);
  const control = screen.getByRole(role, { name: /Notify/ });
  expect(control).not.toHaveClass("mine");
  const label = control.closest("label");
  expect(label).toHaveClass("mine");
  expect(label).toHaveTextContent("By email");
});

it.each(controls)("%s: className lands on the wrapper when there is an error", (_n, Control, role) => {
  renderUi(<Control label="Notify" error="Required" className="mine" />);
  const control = screen.getByRole(role, { name: /Notify/ });
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent("Required");
  expect(control).toHaveAttribute("aria-describedby", alert.id);
  expect(control.closest("label")).not.toHaveClass("mine");
  expect(alert.parentElement).toHaveClass("mine");
});

it.each(controls)("%s: an error without a label wraps the control and the message", (_n, Control, role) => {
  renderUi(<Control aria-label="Solo" error="Nope" className="mine" />);
  expect(screen.getByRole(role, { name: "Solo" }).parentElement).toHaveClass("mine");
  expect(screen.getByRole("alert")).toHaveTextContent("Nope");
});
