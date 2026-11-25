import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Kbd, KbdShortcut } from "../../src/components/kbd/kbd";
import { formatShortcut, matchesShortcut, parseShortcut, toAriaKeyShortcuts } from "../../src/components/kbd/shortcut";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("Kbd is a <kbd> that forwards props", () => {
    renderUi(
      <Kbd size="md" data-testid="k">
        Esc
      </Kbd>,
      variant,
    );
    const k = screen.getByTestId("k");
    expect(k.tagName).toBe("KBD");
    expect(k).toHaveTextContent("Esc");
  });

  it("KbdShortcut shows one cap per key and speaks the full names", () => {
    renderUi(<KbdShortcut keys="mod+shift+p" platform="other" data-testid="s" />, variant);
    const s = screen.getByTestId("s");
    expect([...s.querySelectorAll("kbd[data-slot=kbd]")].map((e) => e.textContent)).toEqual(["Ctrl", "Shift", "P"]);
    // Chips are hidden from assistive tech; the spoken form is a single sr-only string.
    expect(s.querySelector("kbd[aria-hidden]")).toBeInTheDocument();
    expect(s.querySelector(".sr-only")).toHaveTextContent("Control Shift P");
  });

  it("uses Mac glyphs and Apple modifier order on mac", () => {
    renderUi(<KbdShortcut keys="shift+mod+p" platform="mac" data-testid="s" />, variant);
    const s = screen.getByTestId("s");
    expect([...s.querySelectorAll("kbd[data-slot=kbd]")].map((e) => e.textContent)).toEqual(["⇧", "⌘", "P"]);
    expect(s.querySelector(".sr-only")).toHaveTextContent("Shift Command P");
  });

  it("inline variant is plain joined text; announce={false} drops the spoken copy", () => {
    renderUi(
      <>
        <KbdShortcut keys="mod+k" variant="inline" platform="other" data-testid="a" />
        <KbdShortcut keys="mod+k" variant="inline" platform="mac" announce={false} data-testid="b" />
      </>,
      variant,
    );
    expect(screen.getByTestId("a").querySelector("kbd")).toHaveTextContent("Ctrl+K");
    expect(screen.getByTestId("b").querySelector("kbd")).toHaveTextContent("⌘K");
    expect(screen.getByTestId("b").querySelector(".sr-only")).toBeNull();
  });

  it("`labels` overrides visible and spoken names (i18n)", () => {
    renderUi(
      <KbdShortcut
        keys="mod+enter"
        platform="other"
        labels={{ other: { mod: "Strg" }, otherSpoken: { mod: "Steuerung" } }}
        data-testid="s"
      />,
      variant,
    );
    const s = screen.getByTestId("s");
    expect(s.querySelector("kbd[data-slot=kbd]")).toHaveTextContent("Strg");
    expect(s.querySelector(".sr-only")).toHaveTextContent("Steuerung Enter");
  });

  it("has no axe violations", async () => {
    renderUi(
      <p>
        Press <KbdShortcut keys={["mod", "k"]} platform="other" /> or <Kbd>?</Kbd> for help,{" "}
        <KbdShortcut keys="esc" variant="inline" />.
      </p>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("parseShortcut normalises aliases, the plus key and arrays", () => {
  expect(parseShortcut("Cmd+Option+Del")).toEqual(["meta", "alt", "delete"]);
  expect(parseShortcut("mod++")).toEqual(["mod", "+"]);
  expect(parseShortcut("+")).toEqual(["+"]);
  expect(parseShortcut(["Control", "Up", " "])).toEqual(["ctrl", "arrowup", "space"]);
});

it("formatShortcut orders modifiers per platform and builds aria-keyshortcuts", () => {
  expect(formatShortcut("k+shift+mod", "other").keys).toEqual(["Ctrl", "Shift", "K"]);
  expect(formatShortcut("alt+ctrl+f5", "mac").keys).toEqual(["⌃", "⌥", "F5"]);
  expect(toAriaKeyShortcuts("mod+shift+p", "mac")).toBe("Meta+Shift+P");
  expect(toAriaKeyShortcuts("mod+shift+p", "other")).toBe("Control+Shift+P");
  expect(formatShortcut("mod+?", "other").aria).toContain("Control");
});

it("matchesShortcut needs the exact modifiers, but ignores Shift for punctuation", () => {
  const ev = (o: Partial<KeyboardEvent>) => ({
    key: "",
    code: "",
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    ...o,
  });
  expect(matchesShortcut(ev({ key: "k", ctrlKey: true }), "mod+k", "other")).toBe(true);
  expect(matchesShortcut(ev({ key: "k", metaKey: true }), "mod+k", "mac")).toBe(true);
  expect(matchesShortcut(ev({ key: "k", metaKey: true }), "mod+k", "other")).toBe(false);
  expect(matchesShortcut(ev({ key: "k", ctrlKey: true, shiftKey: true }), "mod+k", "other")).toBe(false);
  expect(matchesShortcut(ev({ key: "?", shiftKey: true }), "?", "other")).toBe(true);
  expect(matchesShortcut(ev({ key: "Escape" }), "esc", "other")).toBe(true);
  expect(matchesShortcut(ev({ key: " " }), "space", "other")).toBe(true);
  // Option+K on a Mac types "˚": the physical key decides.
  expect(matchesShortcut(ev({ key: "˚", code: "KeyK", altKey: true }), "alt+k", "mac")).toBe(true);
  // A different Latin letter is a different shortcut even when the code matches (Dvorak).
  expect(matchesShortcut(ev({ key: "t", code: "KeyK", ctrlKey: true }), "mod+k", "other")).toBe(false);
  // Two main keys never match.
  expect(matchesShortcut(ev({ key: "a" }), "a+b", "other")).toBe(false);
});
