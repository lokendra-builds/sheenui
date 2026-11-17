// Shared helpers for the chart test files: figure queries, keyboard and pointer drivers, and the table-driven chart suite.
// `chartSuite(case)` registers the checks every chart must pass: a named focusable group, a keyboard reading path that
// announces values and clears on Escape, an empty state, `labels` overrides, reduced motion, a table view that matches
// the data, a hover readout, and axe in the light/dark x Liquid/Aurora matrix.

import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { parkPointer, reduceMotion, settle } from "./helpers";
import { describeVariants, renderUi, runAxe } from "./render";

/** The text of every polite live region (what a screen reader hears while arrow-keying through a chart). */
const stripBidi = (s: string) => s.replace(/[\u2066-\u2069]/g, "");
export const polite = () =>
  stripBidi([...document.querySelectorAll("[aria-live=polite]")].map((e) => e.textContent).join("|"));

/** Visible tooltip / readout text of the chart. */
export const tipText = () =>
  stripBidi(
    [...document.querySelectorAll("[data-slot=chart-tooltip], [data-slot=chart-readout]")]
      .map((e) =>
        [...e.querySelectorAll("*")]
          .filter((n) => n.children.length === 0)
          .map((n) => n.textContent.trim())
          .filter(Boolean)
          .join(" "),
      )
      .join("|"),
  );

/** Constrain a chart to a realistic width (charts size themselves to their container). */
export const box = (ui: ReactElement, width = 640) => <div style={{ width }}>{ui}</div>;

export const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The text a screen reader gets for a chart figure: its name, then its description (`aria-describedby`, the keyboard
 * instructions). Tests match against this, so they read the way the old combined label did.
 */
export const figureText = (el: Element) => {
  const described = (el.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .trim();
  return `${el.getAttribute("aria-label") ?? ""}. ${described}`.trim();
};

/** Every live chart figure whose "name. description" matches `name` (a regex, or a string that must be contained). */
const figuresMatching = (name: RegExp | string) =>
  screen
    .queryAllByRole("figure")
    .filter((el) => (typeof name === "string" ? figureText(el).includes(name) : name.test(figureText(el))));

/** The one chart figure that matches `name` right now (throws unless exactly one does). */
export function getFigure(name: RegExp | string): HTMLElement {
  const found = figuresMatching(name);
  if (found.length !== 1) throw new Error(`Expected one chart figure matching ${String(name)}, found ${found.length}`);
  return found[0]!;
}

/** Find a chart figure by name (waits up to 5 s). Throws when none, or more than one, matches. */
export function findFigure(name: RegExp | string, timeout = 5000): Promise<HTMLElement> {
  return waitFor(
    () => {
      const found = figuresMatching(name);
      if (found.length === 0) throw new Error(`No chart figure matches ${String(name)}`);
      if (found.length > 1)
        throw new Error(
          `Several chart figures match ${String(name)}: ${found.map((f) => f.getAttribute("aria-label")).join(", ")}`,
        );
      return found[0]!;
    },
    { timeout },
  );
}

/** The chart's focusable figure, found by its aria-label (and, with `nameRe`, its description). */
const groupName = (label: string, nameRe?: RegExp) => nameRe ?? new RegExp(`^${escapeRe(label)}\\.\\s\\S`);
export const chartGroup = (label: string, nameRe?: RegExp) => findFigure(groupName(label, nameRe));
/** The chart's live figure, if any (the empty state is a plain group, not a figure). */
export const queryChartGroup = (label: string, nameRe?: RegExp) => figuresMatching(groupName(label, nameRe))[0] ?? null;

/** Focus the chart's group with the pointer parked away, so only the keyboard drives it. */
export async function focusChart(label: string, nameRe?: RegExp) {
  const g = await chartGroup(label, nameRe);
  await parkPointer();
  g.focus();
  return g;
}

/** Press keys on the focused chart. */
export const press = (keys: string) => userEvent.keyboard(keys);

/** Hover a point inside an element, given as fractions of its box. */
export async function hoverAt(el: Element, fx: number, fy: number) {
  const r = el.getBoundingClientRect();
  await userEvent.hover(el, { position: { x: Math.round(r.width * fx), y: Math.round(r.height * fy) } });
}

export type Read = {
  /** user-event keyboard syntax, e.g. "{Home}" or "{ArrowRight}". */
  keys: string;
  /** What the polite live region must contain afterwards. */
  says: RegExp | string;
};

export type Variation = {
  name: string;
  /** Props merged over the defaults. */
  extra: Record<string, unknown>;
  /** Container width (default: the case's width). */
  width?: number;
  /** The chart is expected to show its empty state instead of a group. */
  empty?: boolean;
  /** Keyboard checks for this variation, run after focusing the chart. */
  reads?: Read[];
  /** Extra assertions on the rendered group. */
  check?: (group: HTMLElement) => void | Promise<void>;
};

/** True when the markup carries no NaN / Infinity coordinates (the classic sign of a broken scale). */
export function cleanMarkup(root: ParentNode = document.body) {
  const html = [...root.querySelectorAll("svg")].map((s) => s.outerHTML).join("\n");
  return !/NaN|Infinity|undefined/.test(html);
}

export type ChartCase = {
  name: string;
  /** Renders the chart (named `label`), with extra props merged over the defaults. */
  make: (extra?: Record<string, unknown>) => ReactElement;
  label: string;
  /** Matches the group's accessible name when it is not simply "<label>. <hint>". */
  nameRe?: RegExp;
  /** The keyboard tour, run in order on the focused chart. */
  reads: Read[];
  /** Props that must produce the empty state (default `{ data: [] }`); `null` skips the check. */
  emptyProps?: Record<string, unknown> | null;
  /** Text of the default empty state when it is not "No data". */
  emptyText?: RegExp | string;
  /** `false` skips the `labels.instructions` checks (string form and function form). */
  hintLabel?: boolean;
  /** Table view: rendered element plus strings that must appear in its cells. */
  table?: { el: ReactElement; caption: string; headers?: string[]; cells?: string[] };
  /** Option sweeps: edge-case data and props. Each must render a clean (no NaN) chart, and may carry its own checks. */
  variations?: Variation[];
  /** How many Escape presses fully clear the readout (default 1; two-level charts need 2). */
  escapes?: number;
  /** Hover a spot (fractions of the chart's box) and expect this text in the visible tooltip/readout. */
  hover?: { x: number; y: number; shows: RegExp | string };
  width?: number;
};

export function chartSuite(c: ChartCase) {
  const width = c.width ?? 640;
  const wrap = (extra?: Record<string, unknown>) => box(c.make(extra), width);

  describeVariants((variant) => {
    describe(c.name, () => {
      it("is a focusable chart figure named by its label and described by the keyboard hint", async () => {
        renderUi(wrap(), variant);
        const g = await chartGroup(c.label, c.nameRe);
        expect(g).toHaveAttribute("aria-roledescription");
        expect(g).toHaveAttribute("tabindex", "0");
        expect(g).toHaveAttribute("role", "figure");
        expect(g.getAttribute("aria-label")).toMatch(new RegExp(`^${escapeRe(c.label)}`));
        expect(figureText(g)).toMatch(/\.\s+\S/);
      });

      it("arrow keys / Home / End read values aloud; Escape clears the readout", async () => {
        renderUi(wrap(), variant);
        await focusChart(c.label, c.nameRe);
        for (const r of c.reads) {
          await press(r.keys);
          await expect
            .poll(polite, { message: `after ${r.keys}` })
            .toMatch(typeof r.says === "string" ? new RegExp(escapeRe(r.says)) : r.says);
        }
        for (let i = 0; i < (c.escapes ?? 1); i++) await press("{Escape}");
        await expect.poll(() => document.querySelector("[data-slot=chart-tooltip]")).toBeNull();
      });

      it("has no axe violations", async () => {
        renderUi(
          <div className="grid gap-6" style={{ width }}>
            {c.make()}
            {c.table?.el}
          </div>,
          variant,
        );
        await settle();
        expect(await runAxe()).toHaveNoViolations();
      });
    });
  });

  describe(`${c.name} (any look)`, () => {
    if (c.emptyProps !== null) {
      it("no data shows the empty state instead of a chart", async () => {
        renderUi(wrap(c.emptyProps ?? { data: [] }));
        expect(queryChartGroup(c.label, c.nameRe)).toBeNull();
        expect(await screen.findByText(c.emptyText ?? /no data|nothing|empty/i)).toBeInTheDocument();
      });
      it("a custom `emptyState` node replaces the default message", () => {
        renderUi(wrap({ ...(c.emptyProps ?? { data: [] }), emptyState: "Nothing to show yet" }));
        expect(screen.getByText("Nothing to show yet")).toBeInTheDocument();
      });
    }

    if (c.hintLabel !== false) {
      // One canonical key on every chart: `labels.instructions` takes a string or a function.
      it("labels.instructions overrides the keyboard instructions (string)", async () => {
        renderUi(wrap({ labels: { instructions: "Pfeiltasten benutzen." } }));
        const g = await chartGroup(c.label, c.nameRe);
        expect(figureText(g)).toContain("Pfeiltasten benutzen.");
      });

      it("labels.instructions overrides the keyboard instructions (function)", async () => {
        renderUi(wrap({ labels: { instructions: () => "Mit Pfeiltasten lesen." } }));
        const g = await chartGroup(c.label, c.nameRe);
        expect(figureText(g)).toContain("Mit Pfeiltasten lesen.");
      });
    }

    it("reduced motion: renders and reads out the same", async () => {
      reduceMotion();
      renderUi(wrap());
      await focusChart(c.label, c.nameRe);
      const first = c.reads[0]!;
      await press(first.keys);
      await expect.poll(polite).toMatch(typeof first.says === "string" ? new RegExp(escapeRe(first.says)) : first.says);
    });

    if (c.table) {
      const t = c.table;
      it("table view: a real table whose cells match the data", () => {
        renderUi(t.el);
        const table = screen.getByRole("table", { name: t.caption });
        if (t.headers)
          expect(
            within(table)
              .getAllByRole("columnheader")
              .map((h) => h.textContent.trim()),
          ).toEqual(expect.arrayContaining(t.headers));
        const text = table.textContent.replace(/\s+/g, " ");
        for (const cell of t.cells ?? []) expect(text).toContain(cell);
      });
    }

    for (const v of c.variations ?? []) {
      it(`variation: ${v.name}`, async () => {
        renderUi(box(c.make(v.extra), v.width ?? width));
        if (v.empty) {
          expect(queryChartGroup(c.label, c.nameRe)).toBeNull();
          return;
        }
        const g = await chartGroup(c.label, c.nameRe);
        await settle();
        expect(cleanMarkup(g)).toBe(true);
        await v.check?.(g);
        if (v.reads) {
          await focusChart(c.label, c.nameRe);
          for (const r of v.reads) {
            await press(r.keys);
            await expect
              .poll(polite, { message: `${v.name}: after ${r.keys}` })
              .toMatch(typeof r.says === "string" ? new RegExp(escapeRe(r.says)) : r.says);
          }
        }
      });
    }

    if (c.hover) {
      const h = c.hover;
      it("pointer hover shows a tooltip with the point's values; leaving removes it", async () => {
        renderUi(wrap());
        const g = await chartGroup(c.label, c.nameRe);
        // Re-hover on every attempt: a chart still drawing in (slow machine) ignores the first pointer move.
        await expect
          .poll(
            async () => {
              await hoverAt(g, h.x, h.y);
              return tipText();
            },
            { timeout: 8000, interval: 250 },
          )
          .toMatch(typeof h.shows === "string" ? new RegExp(escapeRe(h.shows)) : h.shows);
        await parkPointer();
        await expect.poll(tipText).toBe("");
      });
    }
  });
}

/* ------------------------------------------------------------------ synthetic gestures */

/** Synthetic pointers are not "active" pointers, so setPointerCapture would throw: make it a no-op. Call in a test; vi.restoreAllMocks() undoes it. */
export function mockPointerCapture() {
  vi.spyOn(Element.prototype, "setPointerCapture").mockImplementation(() => undefined);
  vi.spyOn(Element.prototype, "releasePointerCapture").mockImplementation(() => undefined);
  vi.spyOn(Element.prototype, "hasPointerCapture").mockReturnValue(true);
}

export type Pt = { x: number; y: number };

/** Viewport point at fractions of an element's box. */
export function pointIn(el: Element, fx: number, fy: number): Pt {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width * fx, y: r.top + r.height * fy };
}

/** Viewport centre of an element. */
export const centerOf = (el: Element): Pt => pointIn(el, 0.5, 0.5);

export function firePointer(
  el: Element,
  type: string,
  at: Pt,
  {
    id = 1,
    pointerType = "mouse",
    button = 0,
    buttons,
  }: { id?: number; pointerType?: "mouse" | "touch" | "pen"; button?: number; buttons?: number } = {},
) {
  act(() => {
    el.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: at.x,
        clientY: at.y,
        pointerId: id,
        pointerType,
        button,
        buttons: buttons ?? (type === "pointerup" || type === "pointermove" ? (type === "pointermove" ? 1 : 0) : 1),
        isPrimary: id === 1,
      }),
    );
  });
}

/** Press, move in steps, release. Returns when the gesture is over. */
export async function dragPointer(
  el: Element,
  from: Pt,
  to: Pt,
  opts: { id?: number; pointerType?: "mouse" | "touch" | "pen"; steps?: number } = {},
) {
  const steps = opts.steps ?? 6;
  const o = { id: opts.id, pointerType: opts.pointerType };
  firePointer(el, "pointerdown", from, o);
  for (let i = 1; i <= steps; i++) {
    firePointer(
      el,
      "pointermove",
      { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps },
      o,
    );
    await new Promise((r) => setTimeout(r, 0));
  }
  firePointer(el, "pointerup", to, o);
}

/** Two fingers moving apart (or together): distance d0 -> d1 around a centre. */
export async function pinchPointers(el: Element, centre: Pt, d0: number, d1: number, steps = 5) {
  const a = (d: number): Pt => ({ x: centre.x - d / 2, y: centre.y });
  const b = (d: number): Pt => ({ x: centre.x + d / 2, y: centre.y });
  firePointer(el, "pointerdown", a(d0), { id: 11, pointerType: "touch" });
  firePointer(el, "pointerdown", b(d0), { id: 12, pointerType: "touch" });
  for (let i = 1; i <= steps; i++) {
    const d = d0 + ((d1 - d0) * i) / steps;
    firePointer(el, "pointermove", a(d), { id: 11, pointerType: "touch" });
    firePointer(el, "pointermove", b(d), { id: 12, pointerType: "touch" });
    await new Promise((r) => setTimeout(r, 0));
  }
  firePointer(el, "pointerup", a(d1), { id: 11, pointerType: "touch" });
  firePointer(el, "pointerup", b(d1), { id: 12, pointerType: "touch" });
}

export function fireWheel(
  el: Element,
  at: Pt,
  deltaY: number,
  { ctrlKey = false, deltaX = 0, shiftKey = false }: { ctrlKey?: boolean; deltaX?: number; shiftKey?: boolean } = {},
) {
  act(() => {
    el.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        clientX: at.x,
        clientY: at.y,
        deltaY,
        deltaX,
        ctrlKey,
        shiftKey,
        deltaMode: 0,
      }),
    );
  });
}
