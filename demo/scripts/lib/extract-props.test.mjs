// Fixture for the description cleaner: `node --test demo/scripts/lib/` (run by `pnpm docs:check`).
import assert from "node:assert/strict";
import { test } from "node:test";

import { cleanDescription, flattenDoc, statedDefault, stripProseDefault } from "./extract-props.mjs";

test("a closing 'Default x.' sentence that repeats the Default column is dropped", () => {
  assert.equal(cleanDescription("Delay before showing, in ms. Default 300.", "300"), "Delay before showing, in ms.");
  assert.equal(cleanDescription("Starting state. Defaults to true.", "true"), "Starting state.");
});

test("prose that merely mentions a default is never cut (R1-19 regression)", () => {
  const text =
    "The heading (`ReactNode`, default `Welcome back`) shown above the form; it also names the section for screen readers.";
  assert.equal(cleanDescription(text, "Welcome back"), text);
  const mid = 'Colours the icon and the default button. Default "info".';
  assert.equal(cleanDescription(mid, '"info"'), "Colours the icon and the default button.");
  assert.equal(
    cleanDescription("Use the default tone, or pass your own.", "x"),
    "Use the default tone, or pass your own.",
  );
});

test("a Default sentence that differs from the cell stays", () => {
  const text = "Sets the delay. Default 5. Larger values are clamped.";
  assert.equal(cleanDescription(text, "10"), text);
});

test("without a default in the column nothing is removed", () => {
  assert.equal(cleanDescription("Delay. Default 300.", undefined), "Delay. Default 300.");
});

test("statedDefault reads both phrasings", () => {
  assert.equal(statedDefault("Delay. Default 300."), "300");
  assert.equal(statedDefault('The heading (`ReactNode`, default `"Welcome"`).'), '"Welcome"');
  assert.equal(statedDefault("Nothing here."), undefined);
});

// ---- R6-N5: delegated, fallback and constant defaults ----
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after } from "node:test";

import { extractProps } from "./extract-props.mjs";

const fixtureRoot = mkdtempSync(join(tmpdir(), "extract-props-"));
mkdirSync(join(fixtureRoot, "src"), { recursive: true });
writeFileSync(
  join(fixtureRoot, "src/index.ts"),
  `export * from "./fixture";
`,
);
writeFileSync(
  join(fixtureRoot, "src/fixture.tsx"),
  `declare const group: { size?: string } | undefined;
const PAGE_SIZES = [10, 20, 50, 100];
const EMPTY: string[] = [];
const MAX = 6;
/** Formats a ratio as text with one decimal and a percent sign. */
const fmtPercent = (n: number) => n + "%";
const fmtPlain = (n: number) => n + "!";

type InnerProps = {
  /** Poll rate in ms. Default 1000. */
  rate?: number;
  /** Chart height. Default 240. */
  height?: number;
  /** Set by the wrapper. */
  area?: boolean;
};
function InnerBody({ rate = 1000, height = 240, area = false }: InnerProps) {
  return null as unknown as object;
}
/** Wrapper that spreads props into an inner component. */
export function SpreadWrap(props: InnerProps) {
  return <InnerBody {...props} area />;
}
/** Wrapper that calls the inner function with its props. */
export function CallWrap(props: InnerProps) {
  return InnerBody(props);
}

/** Fallback sizing. */
export function Sized({ size }: { /** Size of the thing. */ size?: "sm" | "md" }) {
  const resolved = size ?? group?.size ?? "md";
  return resolved;
}

function fmtLocale(locale = "en") {
  return locale;
}
function compactIn(locale: string | undefined) {
  return fmtLocale(locale);
}
/** Forwards a prop to a helper chain whose last parameter has a default. */
export function Localized({ locale }: { /** Locale. */ locale?: string }) {
  return compactIn(locale);
}

/** Constants. */
export function Consts({
  pageSizes = PAGE_SIZES,
  bulk = EMPTY,
  max = MAX,
  format = fmtPercent,
  plain = fmtPlain,
}: {
  /** Page sizes. */
  pageSizes?: number[];
  /** Bulk actions. */
  bulk?: string[];
  /** Max slices. */
  max?: number;
  /** Formatter. */
  format?: (n: number) => string;
  /** Plain formatter. */
  plain?: (n: number) => string;
}) {
  return null as unknown as object;
}
`,
);
after(() => rmSync(fixtureRoot, { recursive: true, force: true }));
const rowsOf = (name) => Object.fromEntries(extractProps(fixtureRoot)[name].props.map((p) => [p.name, p.default]));

test("a wrapper that spreads props into an inner component shows the inner defaults (explicit attributes excluded)", () => {
  const rows = rowsOf("SpreadWrap");
  assert.equal(rows.rate, "1000");
  assert.equal(rows.height, "240");
  assert.equal(rows.area, undefined); // the wrapper sets `area` itself
});

test("a `return Inner(props)` wrapper shows the inner defaults", () => {
  const rows = rowsOf("CallWrap");
  assert.equal(rows.rate, "1000");
  assert.equal(rows.area, "false");
});

test('an `x ?? group?.size ?? "md"` fallback is the default', () => {
  assert.equal(rowsOf("Sized").size, '"md"');
});

test("a constant with a literal initializer shows the literal, never 'built-in'", () => {
  const rows = rowsOf("Consts");
  assert.equal(rows.pageSizes, "[10, 20, 50, 100]");
  assert.equal(rows.bulk, "[]");
  assert.equal(rows.max, "6");
});

test("a function constant shows its name, with a note from its own JSDoc when it has one", () => {
  const rows = rowsOf("Consts");
  assert.equal(rows.format, "fmtPercent (Formats a ratio as text with one decimal and a percent sign)");
  assert.equal(rows.plain, "fmtPlain");
});

test("statesLiteralDefault reads every phrasing of a stated literal default", async () => {
  const { statesLiteralDefault } = await import("./extract-props.mjs");
  assert.equal(statesLiteralDefault("Rate. Default 1000."), "1000");
  assert.equal(statesLiteralDefault("Rate. Default: `true`."), "true");
  assert.equal(statesLiteralDefault('Side; defaults to `"top"`.'), '"top"');
  assert.equal(statesLiteralDefault('Size (`string`, default `"md"`).'), '"md"');
  assert.equal(statesLiteralDefault("Shows a (default) tooltip."), undefined);
  assert.equal(statesLiteralDefault("Default is the built-in formatter."), undefined);
});

test("a prop forwarded through helpers to a parameter default gets that default", () => {
  assert.equal(rowsOf("Localized").locale, '"en"');
});

test("statesLiteralDefault ignores computed rules", async () => {
  const { statesLiteralDefault } = await import("./extract-props.mjs");
  assert.equal(statesLiteralDefault("Height. Default 260 for columns; bars grow."), undefined);
  assert.equal(statesLiteralDefault("Loops. Defaults to true when there are several phrases."), undefined);
});

test("a labels prop shows its exported defaultXLabels and the key -> English table (R7)", async () => {
  const { extractProps } = await import("./extract-props.mjs");
  const row = extractProps().CalendarHeatmap.props.find((p) => p.name === "labels");
  assert.equal(row.default, "defaultCalendarHeatmapLabels");
  assert.deepEqual(row.labels.keys[0], ["less", "Less"]);
  assert.ok(row.labels.keys.some(([k, v]) => k === "future" && v === "No data yet"));
});

test("each labels prop gets the key table of its OWN type: DatePicker's `labels` is not CalendarLabels (R8)", async () => {
  const { extractProps } = await import("./extract-props.mjs");
  const picker = extractProps().DatePicker.props;
  const own = picker.find((p) => p.name === "labels");
  assert.equal(own.labels.type, "DatePickerLabels");
  assert.equal(own.default, "defaultDatePickerLabels");
  assert.deepEqual(
    own.labels.keys.map(([k]) => k),
    ["placeholder", "clear", "today", "clearDate", "title", "close", "required"],
  );
  const calendar = picker.find((p) => p.name === "calendarLabels");
  assert.equal(calendar.labels.type, "CalendarLabels");
  assert.equal(calendar.default, "defaultCalendarLabels");
});

test("a labels type outside the default<Type> convention is mapped by its @defaultLabels tag, never by nearest name (R8)", async () => {
  const { extractProps, parseLabelsType } = await import("./extract-props.mjs");
  const drawer = extractProps().Drawer.props.find((p) => p.name === "labels");
  assert.equal(drawer.labels.type, "DrawerLabelsInput");
  assert.equal(drawer.default, "defaultDrawerLabels");
  const settings = extractProps().SettingsPage.props.find((p) => p.name === "labels");
  assert.equal(settings.default, "defaultSettingsPageLabels");
  const pick = parseLabelsType('Pick<ChatLabels, "status">');
  assert.equal(pick.type, "ChatLabels");
  assert.equal(pick.partial, false);
  assert.deepEqual([...pick.only], ["status"]);
  assert.equal(parseLabelsType("string"), undefined);
});

test("statedDefaultClause reads a stated default in words, and only a stated one (R8)", async () => {
  const { statedDefaultClause } = await import("./extract-props.mjs");
  assert.equal(statedDefaultClause("Formats values. Default: formatCompact in `locale`."), "formatCompact in locale");
  assert.equal(statedDefaultClause("BCP 47 locale (`string`, default the runtime's)."), "the runtime's");
  assert.equal(statedDefaultClause('Surface: "glass" (default) or "opaque".'), '"glass"');
  assert.equal(statedDefaultClause("Sort: `auto` (default) or `none`."), "auto");
  assert.equal(statedDefaultClause("Calendar. Defaults to the current date; pass one."), "the current date");
  assert.equal(statedDefaultClause('Locale for the default number format (e.g. "de").'), undefined);
  assert.equal(statedDefaultClause("Shows the default tooltip."), undefined);
});

test("flattenDoc keeps a markdown bullet list as one line per item and joins the prose", () => {
  assert.equal(
    flattenDoc("Is it\n  modal.\n- `true`: yes,\n  really.\n- `false`: no."),
    "Is it modal.\n- `true`: yes, really.\n- `false`: no.",
  );
  assert.equal(flattenDoc("One   line\nonly."), "One line only.");
});

test("stripProseDefault drops the sentence the Default cell was filled from", () => {
  assert.equal(stripProseDefault("Formats a value. Default: formatCompact in `locale`."), "Formats a value.");
  assert.equal(
    stripProseDefault("Sets the gap. Defaults to the row height. Pairs with `x`."),
    "Sets the gap. Pairs with `x`.",
  );
  assert.equal(stripProseDefault("No default stated here."), "No default stated here.");
});
test("a middle 'Default x.' sentence equal to the cell is dropped", () => {
  assert.equal(
    cleanDescription("Where stems start. Default 0. Values below reach the other way.", "0"),
    "Where stems start. Values below reach the other way.",
  );
});

test("a long summary is cut at a clause boundary and never ends on an ellipsis or a hanging word", async () => {
  const { shortenSentence } = await import("./extract-props.mjs");
  const long =
    "A dismissible announcement bar for the top of a page: one sentence, an optional link and a close button, on glass with a lit edge in the tone's colour.";
  const cut = shortenSentence(long);
  assert.equal(
    cut,
    "A dismissible announcement bar for the top of a page: one sentence, an optional link and a close button.",
  );
  assert.equal(cut.includes("..."), false);
  assert.equal(shortenSentence("A short sentence."), "A short sentence.");
  // No usable boundary: kept whole rather than cut mid-clause.
  const none = `${"word ".repeat(40)}end.`;
  assert.equal(shortenSentence(none), none);
});
