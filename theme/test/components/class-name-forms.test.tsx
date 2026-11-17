// Base UI's `className` is a string OR a function of the part's state. A SheenUI wrapper that merges its own classes
// must keep both forms working (a function used to be silently dropped by `cn()`).

import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Switch } from "../../src/components/switch/switch";
import { Checkbox } from "../../src/components/checkbox/checkbox";
import { classNameWith } from "../../src/lib/cn";
import { renderUi } from "../render";

describe("classNameWith", () => {
  it("builds a string for a string or nothing, and a state function for a function", () => {
    expect(classNameWith(undefined, (extra) => `base ${extra ?? ""}`.trim())).toBe("base");
    expect(classNameWith("mine", (extra) => `base ${extra ?? ""}`.trim())).toBe("base mine");
    const fn = classNameWith<{ on: boolean }>(
      (s) => (s.on ? "is-on" : "is-off"),
      (extra) => `base ${extra ?? ""}`.trim(),
    );
    expect(typeof fn).toBe("function");
    expect((fn as (s: { on: boolean }) => string)({ on: true })).toBe("base is-on");
    expect((fn as (s: { on: boolean }) => string)({ on: false })).toBe("base is-off");
  });
});

describe("Base UI wrappers accept both className forms", () => {
  it("Switch: a string className is applied", () => {
    renderUi(<Switch aria-label="Alerts" className="my-string-class" />);
    const root = screen.getByRole("switch", { name: "Alerts" });
    expect(root).toHaveClass("my-string-class");
    expect(root).toHaveClass("glass-1");
  });

  it("Switch: a state-function controlClassName is resolved with the state and merged, and follows the state", async () => {
    renderUi(<Switch aria-label="Alerts" controlClassName={(state) => (state.checked ? "state-on" : "state-off")} />);
    const root = screen.getByRole("switch", { name: "Alerts" });
    expect(root).toHaveClass("state-off");
    expect(root).toHaveClass("glass-1");
    await userEvent.click(root);
    expect(root).toHaveClass("state-on");
    expect(root).not.toHaveClass("state-off");
    expect(root).toHaveClass("glass-1");
  });

  it("Checkbox: a state-function controlClassName applies too", async () => {
    renderUi(<Checkbox aria-label="Agree" controlClassName={(state) => (state.checked ? "box-on" : "box-off")} />);
    const box = screen.getByRole("checkbox", { name: "Agree" });
    expect(box).toHaveClass("box-off");
    await userEvent.click(box);
    expect(box).toHaveClass("box-on");
  });
});
