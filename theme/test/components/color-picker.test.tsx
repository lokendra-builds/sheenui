import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ColorField, ColorPicker } from "../../src/components/color-picker/color-picker";
import {
  formatColor,
  hslToRgb,
  luminance,
  normalizeColor,
  parseColor,
  prefersDarkForeground,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  hsvToRgb,
} from "../../src/components/color-picker/color-utils";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

// Base UI keeps a slider thumb `visibility: hidden` until it has measured it, so wait for the sliders.
const ready = () => screen.findByRole("slider", { name: "Hue" });
const area = () => screen.getByRole("slider", { name: "Saturation and brightness" });
const hue = () => screen.getByRole("slider", { name: "Hue" });
const hexInput = () => screen.getByRole<HTMLInputElement>("textbox", { name: "Hex colour" });

describeVariants((variant) => {
  it("exposes the 2D area, hue and (optionally) opacity as named sliders with readable values", async () => {
    renderUi(<ColorPicker aria-label="Brand colour" defaultValue="#ff0000" alpha />, variant);
    await ready();
    expect(screen.getByRole("group", { name: "Brand colour" })).toBeInTheDocument();
    expect(area()).toHaveAttribute("aria-valuetext", "Saturation 100%, brightness 100%");
    expect(hue()).toHaveAttribute("aria-valuetext", "0 degrees");
    expect(screen.getByRole("slider", { name: "Opacity" })).toHaveAttribute("aria-valuetext", "100%");
    // The hex field shows the digits without "#" (it is drawn as a prefix).
    expect(hexInput()).toHaveValue("FF0000");
  });

  it("the area responds to arrow keys (and Shift for bigger steps) and reports hex", async () => {
    const onValueChange = vi.fn();
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff0000" onValueChange={onValueChange} />, variant);
    area().focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(area()).toHaveAttribute("aria-valuetext", "Saturation 99%, brightness 100%");
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(area().getAttribute("aria-valuetext")).toMatch(/brightness 9\d%|brightness 8\d%/);
    expect(onValueChange.mock.lastCall![0]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("the hue slider moves with arrows, Home and End", async () => {
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff0000" />, variant);
    await ready();
    hue().focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(hue()).toHaveAttribute("aria-valuetext", "2 degrees");
    await userEvent.keyboard("{End}");
    expect(hue()).toHaveAttribute("aria-valuetext", "360 degrees");
    await userEvent.keyboard("{Home}");
    expect(hue()).toHaveAttribute("aria-valuetext", "0 degrees");
  });

  it("typing a hex value updates the colour on blur / Enter and rejects garbage", async () => {
    const onValueCommit = vi.fn();
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff0000" onValueCommit={onValueCommit} />, variant);
    await ready();
    await userEvent.fill(hexInput(), "00ff00");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => hue().getAttribute("aria-valuetext")).toBe("120 degrees");
    expect(onValueCommit.mock.lastCall![0]).toBe("#00ff00");
    await userEvent.fill(hexInput(), "nonsense");
    await expect.poll(() => hexInput().getAttribute("aria-invalid")).toBe("true");
    await userEvent.tab();
    await expect.poll(() => hexInput().value).toBe("00FF00");
  });

  it("the format switch changes the channel inputs (RGB / HSL) and their arrow-key steps", async () => {
    const onFormatChange = vi.fn();
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff8000" onFormatChange={onFormatChange} />, variant);
    await userEvent.click(screen.getByRole("radio", { name: "RGB" }));
    expect(onFormatChange).toHaveBeenLastCalledWith("rgb");
    const red = await screen.findByRole("textbox", { name: "Red" });
    expect(red).toHaveValue("255");
    expect(screen.getByRole("textbox", { name: "Green" })).toHaveValue("128");
    red.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(red).toHaveValue("254");
    await userEvent.click(screen.getByRole("radio", { name: "HSL" }));
    expect(await screen.findByRole("textbox", { name: "Lightness" })).toHaveValue("50");
  });

  it("swatches are a radiogroup of named radios that pick a colour", async () => {
    const onValueChange = vi.fn();
    renderUi(
      <ColorPicker
        aria-label="C"
        defaultValue="#000000"
        onValueChange={onValueChange}
        swatches={["#ff0000", { value: "#0000ff", label: "Ocean blue" }]}
      />,
      variant,
    );
    expect(screen.getByRole("radiogroup", { name: "Swatches" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Ocean blue" }));
    expect(onValueChange.mock.lastCall![0]).toBe("#0000ff");
    expect(hexInput()).toHaveValue("0000FF");
    screen.getByRole("radio", { name: "Ocean blue" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(hexInput()).toHaveValue("FF0000");
  });

  it("alpha adds an opacity channel and 8-digit hex", async () => {
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff000080" alpha />, variant);
    await ready();
    expect(hexInput()).toHaveValue("FF0000");
    expect(screen.getByRole("slider", { name: "Opacity" })).toHaveAttribute("aria-valuetext", "50%");
    expect(screen.getAllByRole("textbox", { name: "Opacity" })[0]).toHaveValue("50");
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState("#ff0000");
      return (
        <>
          <ColorPicker aria-label="C" value={v} onValueChange={setV} />
          <button onClick={() => setV("#0000ff")}>blue</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "blue" }));
    expect(hexInput()).toHaveValue("0000FF");
    await expect.poll(() => hue().getAttribute("aria-valuetext")).toBe("240 degrees");
  });

  it("the copy button writes the colour and announces it; labels translate everything (i18n)", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderUi(
      <ColorPicker
        aria-label="C"
        defaultValue="#ff0000"
        copyButton
        labels={{ copy: "Farbe kopieren", copied: (v) => `${v} kopiert`, hue: "Farbton", area: "Fläche" }}
      />,
      variant,
    );
    await screen.findByRole("slider", { name: "Farbton" });
    expect(screen.getByRole("slider", { name: "Fläche" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Farbe kopieren" }));
    expect(writeText).toHaveBeenCalledWith("#ff0000");
    await expect.poll(() => document.querySelector("[aria-live=polite]")?.textContent).toContain("#ff0000 kopiert");
  });

  it("disabled disables every control", () => {
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff0000" disabled swatches={["#00ff00"]} />, variant);
    expect(area()).toHaveAttribute("aria-disabled", "true");
    expect(hexInput()).toBeDisabled();
  });

  it("ColorField opens the picker from its swatch button, shares the value with the text field, and closes with Escape", async () => {
    renderUi(
      <ColorField
        label="Accent"
        defaultValue="#7c5cff"
        labels={{ open: "Open colour picker" }}
        description="Used for links"
      />,
      variant,
    );
    const text = screen.getByRole("textbox", { name: /Accent/ });
    expect(text).toHaveValue("#7C5CFF");
    expect(text).toHaveAccessibleDescription(/Used for links/);
    const open = screen.getByRole("button", { name: "Open colour picker" });
    await userEvent.click(open);
    const h = await screen.findByRole("slider", { name: "Hue" });
    await settle();
    h.focus();
    await userEvent.keyboard("{End}");
    await expect.poll(() => (text as HTMLInputElement).value).not.toBe("#7C5CFF");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("slider", { name: "Hue" })).toBeNull();
    await expect.poll(() => document.activeElement).toBe(open);
  });

  it("ColorField: typing a colour, an error message and the form name", async () => {
    renderUi(
      <form data-testid="f">
        <ColorField label="Accent" defaultValue="#7c5cff" name="accent" error="Pick a brand colour" />
      </form>,
      variant,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a brand colour");
    const text = screen.getByRole("textbox", { name: /Accent/ });
    await userEvent.fill(text, "#112233");
    await userEvent.tab();
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("accent")).toBe("#112233");
  });

  it("has no axe violations (card, alpha + swatches, field with picker open)", async () => {
    renderUi(
      <div className="grid gap-6">
        <ColorPicker aria-label="Card" defaultValue="#7c5cff" />
        <ColorPicker
          aria-label="Alpha"
          defaultValue="#7c5cff80"
          alpha
          swatches={["#ff0000", "#00ff00"]}
          copyButton
          variant="plain"
        />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("color-utils: parsing, conversion and formatting round-trip", () => {
  expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  expect(parseColor("ff000080")).toEqual({ r: 255, g: 0, b: 0, a: 0.502 });
  expect(parseColor("rgb(10 20 30 / 50%)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  expect(parseColor("hsl(120 100% 50%)")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  expect(parseColor("bogus")).toBeNull();
  expect(parseColor("")).toBeNull();
  expect(parseColor("rgb(1 2)")).toBeNull();
  expect(normalizeColor("#ABC")).toBe("#aabbcc");
  expect(rgbToHex({ r: 1, g: 2, b: 3, a: 1 })).toBe("#010203");
  const rgb = { r: 124, g: 92, b: 255, a: 1 };
  expect(hsvToRgb({ ...rgbToHsv(rgb) })).toEqual(rgb);
  expect(hslToRgb(rgbToHsl(rgb))).toEqual(rgb);
  expect(formatColor(rgb, "hex")).toBe("#7c5cff");
  expect(formatColor(rgb, "rgb")).toBe("rgb(124 92 255)");
  expect(formatColor({ ...rgb, a: 0.5 }, "rgb")).toBe("rgb(124 92 255 / 50%)");
  expect(formatColor(rgb, "hsl")).toMatch(/^hsl\(\d+ \d+% \d+%\)$/);
  expect(luminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 3);
  expect(prefersDarkForeground({ r: 255, g: 255, b: 255, a: 1 })).toBe(true);
  expect(prefersDarkForeground({ r: 0, g: 0, b: 0, a: 1 })).toBe(false);
});
