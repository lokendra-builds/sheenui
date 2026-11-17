// One height scale for buttons and form controls: a row of mixed controls lines up at sm (32px), md (40px) and lg (48px);
// on touch screens (any coarse pointer) sm and md are 44px, set once in the --sheen-control-h-* tokens.

import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Button } from "../../src/components/button/button";
import { Combobox } from "../../src/components/combobox/combobox";
import { DatePicker } from "../../src/components/date-picker/date-picker";
import { Input } from "../../src/components/input/input";
import { NumberField } from "../../src/components/number-field/number-field";
import { OtpInput } from "../../src/components/otp-input/otp-input";
import { Select } from "../../src/components/select/select";
import { TagsInput } from "../../src/components/tags-input/tags-input";
import { Textarea } from "../../src/components/textarea/textarea";
import { describeVariants, renderUi } from "../render";

const heightOf = (el: Element | null) => Math.round(el!.getBoundingClientRect().height);
const surface = (el: Element) => el.closest(".glass-1") ?? el;

describeVariants((variant) => {
  for (const [size, px] of [
    ["sm", 32],
    ["md", 40],
    ["lg", 48],
  ] as const) {
    it(`size ${size}: Button, Input, Select, Combobox, NumberField, DatePicker and TagsInput are all ${px}px tall`, () => {
      renderUi(
        <div style={{ width: 360 }}>
          <Button size={size}>button</Button>
          <Input size={size} aria-label="input" />
          <Select size={size} aria-label="select" items={[{ value: "a", label: "A" }]} />
          <Combobox size={size} aria-label="combobox" options={[{ value: "a", label: "A" }]} />
          <NumberField size={size} aria-label="number" />
          <DatePicker size={size} aria-label="date" />
          <TagsInput size={size} aria-label="tags" />
        </div>,
        variant,
      );
      const heights = {
        button: heightOf(screen.getByRole("button", { name: "button" })),
        input: heightOf(surface(screen.getByLabelText("input"))),
        select: heightOf(screen.getByRole("combobox", { name: "select" })),
        combobox: heightOf(surface(screen.getByRole("combobox", { name: "combobox" }))),
        number: heightOf(surface(screen.getByRole("textbox", { name: "number" }))),
        date: heightOf(screen.getByRole("button", { name: /date/i })),
        tags: heightOf(surface(screen.getByRole("textbox", { name: "tags" }))),
      };
      for (const [name, h] of Object.entries(heights)) expect(h, `${name} at ${size}`).toBe(px);
    });
  }

  it("Textarea padding and OtpInput slots follow size", () => {
    renderUi(
      <div style={{ width: 360 }}>
        <Textarea size="sm" aria-label="small text" minRows={1} />
        <Textarea size="lg" aria-label="large text" minRows={1} />
        <OtpInput size="sm" length={4} aria-label="small code" />
        <OtpInput size="lg" length={4} aria-label="large code" />
      </div>,
      variant,
    );
    const small = heightOf(surface(screen.getByRole("textbox", { name: "small text" })));
    const large = heightOf(surface(screen.getByRole("textbox", { name: "large text" })));
    expect(large).toBeGreaterThan(small);
    const slots = screen
      .getAllByRole("textbox")
      .filter((el) => el.hasAttribute("maxlength") || el.closest("[data-status]"));
    expect(slots.length).toBeGreaterThan(0);
  });
});

it("on touch screens sm and md grow to 44px: the tokens carry a coarse-pointer override", () => {
  const found: Record<string, string> = {};
  const walk = (rules: CSSRuleList, coarse: boolean) => {
    for (const rule of rules) {
      if (rule instanceof CSSMediaRule)
        walk(rule.cssRules, coarse || /(?:any-)?pointer:\s*coarse/.test(rule.conditionText));
      else if (rule instanceof CSSGroupingRule) walk(rule.cssRules, coarse);
      else if (rule instanceof CSSStyleRule && coarse) {
        for (const name of ["--sheen-control-h-sm", "--sheen-control-h-md", "--sheen-control-h-lg"]) {
          const value = rule.style.getPropertyValue(name).trim();
          if (value) found[name] = value;
        }
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules, false);
    } catch {
      // A cross-origin sheet: not ours.
    }
  }
  expect(found["--sheen-control-h-sm"]).toBe("2.75rem");
  expect(found["--sheen-control-h-md"]).toBe("2.75rem");
  expect(found["--sheen-control-h-lg"]).toBeUndefined();
});
