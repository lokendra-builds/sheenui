import { useState } from "react";
import { Badge, Button, GlassCard, useToast } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import type { DatePickerScene as DatePickerSceneData } from "../layout/ShowcaseStage.date-picker";
import { DatePickerScene } from "../layout/ShowcaseStage.date-picker.scene";
import type { ColorPickerScene as ColorPickerSceneData } from "../layout/ShowcaseStage.color-picker";
import { ColorPickerScene } from "../layout/ShowcaseStage.color-picker.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { CalendarScene as CalendarSceneData } from "../layout/ShowcaseStage.calendar";
import { CalendarScene } from "../layout/ShowcaseStage.calendar.scene";
import { lazyBlock } from "../layout/lazy-block";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { DEMO_LOCALE, DEMO_TODAY } from "../demo-clock";
import { Calendar } from "@sheenui/theme";
// Deep import on purpose: addDays, formatDate and formatDateRange are internal helpers (not in the public
// barrel); the docs page only uses them to build its demo dates, so they are not worth widening the API for.
import {
  addDays,
  formatDate,
  formatDateRange,
  type DateRange,
} from "../../../theme/src/components/calendar/date-utils";
import { DatePicker, DateRangePicker, type DateRangePreset } from "@sheenui/theme";
import { ColorField, ColorPicker } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";

/* =====================================================================
 * Calendar
 * ===================================================================== */

const CalendarLocales = lazyBlock(() => import("./CalendarLocalesDemo").then((m) => m.CalendarLocalesDemo), {
  minHeight: "26rem",
});

/** The "Calendar" docs page (/forms/calendar): live examples, props and notes. */
export function CalendarPage() {
  // A fixed "today" and locale: the page is prerendered, and the browser's clock and language must not change the HTML.
  const [date, setDate] = useState<Date | null>(DEMO_TODAY);
  const today = DEMO_TODAY;
  const [range, setRange] = useState<DateRange>(() => ({ start: addDays(today, 3), end: addDays(today, 8) }));
  // Booked nights: every 9th and 10th day of a month.
  const booked = (d: Date) => d.getDate() % 9 === 0 || d.getDate() % 10 === 0;

  return (
    <Page
      eyebrow="Form"
      title="Calendar"
      description="A month grid built on Intl: the week starts where your locale starts it, month and day names (and digits) are translated. Arrow keys, Page Up / Down and Home / End move through it; the caption jumps to any month or year."
      source={["theme/src/components/calendar/calendar.tsx", "theme/src/components/calendar/date-utils.ts"]}
    >
      <ShowcaseStage<CalendarSceneData>
        label="Calendar demo"
        story={() => import("../layout/ShowcaseStage.calendar")}
        initial={{ offset: null }}
        minHeight="28rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <CalendarScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Single date"
        stageClassName="px-3 sm:px-10"
        description="The selected-day pill glides to the new day; months slide in the direction you travel. Click the caption for the month and year grids."
        code={`
import { useState } from "react";
import { Calendar, GlassCard } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function Example() {
  const [date, setDate] = useState<Date | null>(startOfDay(new Date()));

  return (
    <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-3">
      <Calendar value={date} onValueChange={setDate} aria-label="Pick a date" />
    </GlassCard>
  );
}`}
      >
        <div className="flex max-w-full flex-col items-center gap-3">
          <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-3">
            <Calendar
              value={date}
              onValueChange={setDate}
              locale={DEMO_LOCALE}
              today={DEMO_TODAY}
              aria-label="Pick a date"
            />
          </GlassCard>
          <p className="text-sm text-sheen-fg-muted" aria-live="polite">
            {date ? formatDate(date, DEMO_LOCALE, { dateStyle: "full" }) : "No date"}
          </p>
        </div>
      </Example>

      <Example
        title="Range, two months, unavailable days"
        stageClassName="px-3 sm:px-10"
        description="Pick a start, then hover (or arrow) to preview the range; a range can't cross a booked day (every 9th and 10th here). Past days are off limits. Each caption opens the month grid for its own panel."
        code={`
import { useState } from "react";
import { Calendar, GlassCard, type DateRange } from "@sheenui/theme";

export function Example() {
  const today = new Date();
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  const booked = (d: Date) => d.getDate() % 9 === 0 || d.getDate() % 10 === 0;

  return (
    <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-4">
      <Calendar
        mode="range"
        numberOfMonths={2}
        min={today}
        isDateDisabled={booked}
        value={range}
        onValueChange={setRange}
        aria-label="Stay dates"
      />
    </GlassCard>
  );
}`}
      >
        <div className="flex max-w-full flex-col items-center gap-3">
          <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-4">
            <Calendar
              mode="range"
              numberOfMonths={2}
              locale={DEMO_LOCALE}
              today={DEMO_TODAY}
              min={today}
              isDateDisabled={booked}
              value={range}
              onValueChange={setRange}
              aria-label="Stay dates"
            />
          </GlassCard>
          <p className="text-sm text-sheen-fg-muted tabular-nums" aria-live="polite">
            {range.start && range.end
              ? formatDateRange(range.start, range.end, DEMO_LOCALE, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : range.start
                ? "Now pick the last night"
                : "Pick the first night"}
          </p>
        </div>
      </Example>

      <Example
        title="Locales"
        stageClassName="px-3 sm:px-10"
        description="Same component, different locale: week start, names and digits all change. Arabic also runs right to left (arrow keys follow)."
        code={`
import { useState } from "react";
import { Calendar } from "@sheenui/theme";

export function Example() {
  const today = new Date();
  const [locale, setLocale] = useState("ar-EG");
  const rtl = ["ar", "he", "fa"].includes(locale.split("-")[0] ?? locale);

  return (
    <div dir={rtl ? "rtl" : undefined} lang={locale}>
      <button onClick={() => setLocale(locale === "ar-EG" ? "de-DE" : "ar-EG")}>Switch language</button>
      <Calendar key={locale} locale={locale} defaultValue={today} aria-label="Localised calendar" />
    </div>
  );
}`}
      >
        <CalendarLocales />
      </Example>

      <PropsTable of={PROPS.Calendar} />
      <KeyboardTable
        rows={[
          ["Arrow keys", "Move by one day (left, right) or one week (up, down); right-to-left flips left and right."],
          ["Home / End", "Jump to the start or end of the week."],
          ["Page Up / Page Down", "Previous or next month."],
          ["Shift + Page Up / Page Down", "Previous or next year."],
          [
            "Enter / Space",
            "Select the focused day (in range mode, the first press sets the start and the second the end).",
          ],
        ]}
      />
      <A11yNotes
        items={[
          'A WAI-ARIA date grid: role="grid" per month, one day in the tab order (roving tabindex), each day named with its full date.',
          "Today, selected, range start and end, and unavailable days are all in the name. Unavailable days stay focusable but cannot be selected.",
          "A polite live region announces month changes. Selection never relies on color alone.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Date picker
 * ===================================================================== */

/** Functions, so a page left open past midnight still means "the last 7 days". */
const PRESETS: DateRangePreset[] = [
  { label: "Today", range: () => ({ start: DEMO_TODAY, end: DEMO_TODAY }) },
  { label: "Last 7 days", range: () => ({ start: addDays(DEMO_TODAY, -6), end: DEMO_TODAY }) },
  { label: "Last 30 days", range: () => ({ start: addDays(DEMO_TODAY, -29), end: DEMO_TODAY }) },
  {
    label: "This month so far",
    range: () => ({ start: new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1), end: DEMO_TODAY }),
  },
];

/** The "Date picker" docs page (/forms/date-picker): live examples, props and notes. */
export function DatePickerPage() {
  const toast = useToast();
  const today = DEMO_TODAY;
  const [due, setDue] = useState<Date | null>(null);
  const [period, setPeriod] = useState<DateRange | null>(() => ({ start: addDays(today, -6), end: today }));
  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  return (
    <Page
      eyebrow="Form"
      title="Date picker"
      description="A glass field that opens the Calendar in a popover, or as a swipe-to-close bottom sheet on phones. Focus lands on the selected day and returns to the field; a range commits only once both ends are picked."
      source={["theme/src/components/date-picker/date-picker.tsx", "theme/src/components/calendar/calendar.tsx"]}
    >
      <ShowcaseStage<DatePickerSceneData>
        label="Date picker demo"
        story={() => import("../layout/ShowcaseStage.date-picker")}
        initial={{ offset: null }}
        minHeight="18rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <DatePickerScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Single date"
        description="Today / Clear in the footer, × in the field. Resize below 640px to get the bottom sheet."
        stageClassName="items-start"
        code={`
import { useState } from "react";
import { DatePicker } from "@sheenui/theme";

export function Example() {
  const [due, setDue] = useState<Date | null>(null);

  return (
    <DatePicker label="Due date" value={due} onValueChange={setDue} description="We'll remind you the day before." />
  );
}`}
      >
        <DatePicker
          label="Due date"
          value={due}
          onValueChange={setDue}
          locale={DEMO_LOCALE}
          today={DEMO_TODAY}
          description="We'll remind you the day before."
          className="max-w-xs"
        />
      </Example>

      <Example
        title="Bounds and unavailable days"
        description="Weekdays in the next 60 days only. The month arrows stop at the bounds."
        stageClassName="items-start"
        code={`
import { DatePicker } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function Example() {
  const today = startOfDay(new Date());

  return (
    <DatePicker
      label="Delivery date"
      min={today}
      max={addDays(today, 60)}
      isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
      formatOptions={{ weekday: "short", day: "numeric", month: "long" }}
    />
  );
}`}
      >
        <DatePicker
          label="Delivery date"
          locale={DEMO_LOCALE}
          today={DEMO_TODAY}
          min={today}
          max={addDays(today, 60)}
          isDateDisabled={weekend}
          formatOptions={{ weekday: "short", day: "numeric", month: "long" }}
          className="max-w-xs"
        />
      </Example>

      <Example
        title="Date range with presets"
        description="Two months side by side where they fit beside the presets, one on tablets and phones (there the presets become a swipeable row). Hover previews the range; nothing after today."
        stageClassName="items-start"
        code={`
import { useState } from "react";
import { DateRangePicker, type DateRange, type DateRangePreset } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => startOfDay(new Date());

const PRESETS: DateRangePreset[] = [
  { label: "Today", range: () => ({ start: today(), end: today() }) },
  { label: "Last 7 days", range: () => ({ start: addDays(today(), -6), end: today() }) },
  { label: "Last 30 days", range: () => ({ start: addDays(today(), -29), end: today() }) },
  { label: "This month so far", range: () => ({ start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: today() }) },
];

export function Example() {
  const [period, setPeriod] = useState<DateRange | null>(null);

  return (
    <DateRangePicker label="Reporting period" value={period} onValueChange={setPeriod} max={today()} presets={PRESETS} />
  );
}`}
      >
        <DateRangePicker
          label="Reporting period"
          value={period}
          onValueChange={setPeriod}
          locale={DEMO_LOCALE}
          today={DEMO_TODAY}
          max={today}
          presets={PRESETS}
          className="max-w-sm"
        />
      </Example>

      <Example
        title="In a form"
        description="name submits YYYY-MM-DD; a range submits startName / endName. Errors show under the field."
        stageClassName="items-start"
        code={`
import { Button, DatePicker } from "@sheenui/theme";

export function Example() {
  const missing = false; // set from your validation

  return (
      <form onSubmit={(event) => { event.preventDefault(); /* validate, then submit */ }}>
        <DatePicker name="checkIn" label="Check-in" required error={missing && "Pick a check-in date."} />
        <Button type="submit">Book</Button>
      </form>
  );
}`}
      >
        <BookingForm onSubmit={(v) => toast.success("Booked", v)} />
      </Example>

      <PropsTable title="DatePicker props" of={PROPS.DatePicker} />
      <PropsTable title="DateRangePicker props" of={PROPS.DateRangePicker} />
      <KeyboardTable
        rows={[
          ["Enter / Space / Arrow Down", "Open the calendar from the field; focus moves to the selected day."],
          ["Arrow keys, Page Up / Page Down", "Move inside the calendar (see the Calendar page)."],
          ["Enter / Space", "Select the focused day. A range commits only after both ends are picked."],
          ["Escape", "Close the calendar and return focus to the field."],
        ]}
      />
      <A11yNotes
        items={[
          "The trigger is a labeled button showing the chosen date; the calendar opens in a popover, or as a swipe-to-close bottom sheet on phones.",
          "Focus lands on the selected day (or today) and returns to the field on close; the sheet keeps the field above the software keyboard.",
          "name submits an ISO date with a form; error is announced politely. Pass locale and today on prerendered pages so server and browser text match.",
        ]}
      />
    </Page>
  );
}

function BookingForm({ onSubmit }: { onSubmit: (summary: string) => void }) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [tried, setTried] = useState(false);
  const missing = tried && !checkIn;
  return (
    <form
      noValidate
      className="flex w-full max-w-xs flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        const data = new FormData(e.currentTarget);
        const value = data.get("checkIn");
        if (typeof value === "string" && value) onSubmit(`checkIn=${value}`);
      }}
    >
      <DatePicker
        name="checkIn"
        label="Check-in"
        required
        value={checkIn}
        onValueChange={setCheckIn}
        locale={DEMO_LOCALE}
        today={DEMO_TODAY}
        min={DEMO_TODAY}
        error={missing ? "Pick a check-in date." : undefined}
      />
      <Button type="submit" className="self-start">
        Book
      </Button>
    </form>
  );
}

/* =====================================================================
 * Color picker
 * ===================================================================== */

const SWATCHES = [
  { value: "#6d4aff", label: "Violet" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#22c55e", label: "Green" },
  { value: "#eab308", label: "Yellow" },
  { value: "#f97316", label: "Orange" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
  { value: "#0f172a", label: "Ink" },
  { value: "#ffffff", label: "White" },
  { value: "#6d4aff80", label: "Violet, 50% opacity" },
];

/** The "Color picker" docs page (/forms/color-picker): live examples, props and notes. */
export function ColorPickerPage() {
  const [color, setColor] = useState("#6d4aff");
  const [brand, setBrand] = useState("#14b8a6");

  return (
    <Page
      eyebrow="Form"
      title="Color picker"
      description="A saturation and brightness area, hue and opacity sliders, typed hex / RGB / HSL values, swatches, copy, and the screen eyedropper where the browser supports it. Every part works from the keyboard."
      source={[
        "theme/src/components/color-picker/color-picker.tsx",
        "theme/src/components/color-picker/color-utils.ts",
      ]}
    >
      <ShowcaseStage<ColorPickerSceneData>
        label="Color picker demo"
        story={() => import("../layout/ShowcaseStage.color-picker")}
        initial={{ color: "#6d4aff" }}
        // The picker, its swatches and the preview chip (wrapped under it) come to about 46rem: reserved up front, so the
        // stage (and its aura, sized from its height) does not grow while the page is still being parsed.
        minHeight="46.5rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <ColorPickerScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Picker"
        description="Drag the area or use the arrow keys on it (Shift for bigger steps). The value is always emitted as hex."
        code={`
import { useState } from "react";
import { ColorPicker } from "@sheenui/theme";

export function Example() {
  const [color, setColor] = useState("#6d4aff");

  return (
      <ColorPicker
        value={color}
        onValueChange={setColor}
        swatches={[{ value: "#6d4aff", label: "Violet" }, "#3b82f6", "#10b981", "#f59e0b"]}
        aria-label="Accent color"
      />
  );
}`}
      >
        <div className="flex flex-wrap items-center justify-center gap-6">
          <ColorPicker value={color} onValueChange={setColor} swatches={SWATCHES} aria-label="Accent color" />
          <div className="flex flex-col items-center gap-3">
            <span
              aria-hidden
              className="size-24 rounded-sheen-xl shadow-[inset_0_0_0_1px_var(--sheen-border)] forced-color-adjust-none"
              style={{ backgroundColor: color }}
            />
            <Badge tone="neutral" className="font-sheen-mono">
              {color}
            </Badge>
          </div>
        </div>
      </Example>

      <Example
        title="Color field"
        description="A hex field with a swatch that opens the picker in a glass popover (a bottom sheet on phones). Type a hex straight into the field, or submit it with name."
        stageClassName="items-start"
        code={`
import { useState } from "react";
import { ColorField } from "@sheenui/theme";

const SWATCHES = ["#6d4aff", "#3b82f6", "#06b6d4", "#10b981", "#84cc16", "#f59e0b", "#ef4444", "#ec4899"];

export function Example() {
  const [brand, setBrand] = useState("#6d4aff");

  return (
    <ColorField
      label="Brand color"
      value={brand}
      onValueChange={setBrand}
      swatches={SWATCHES.slice(0, 8)}
      alpha={false}
      name="brand"
      description="Used for buttons and links."
    />
  );
}`}
      >
        <ColorField
          label="Brand color"
          value={brand}
          onValueChange={setBrand}
          swatches={SWATCHES.slice(0, 8)}
          alpha={false}
          name="brand"
          description="Used for buttons and links."
          className="max-w-xs"
        />
      </Example>

      <Example
        title="Hex only, no opacity"
        description="Trim it down: one format, no opacity, no swatches."
        code={`
import { ColorPicker } from "@sheenui/theme";

export function Example() {
  return (
    <ColorPicker defaultValue="#22c55e" formats={["hex"]} alpha={false} />
  );
}`}
      >
        <ColorPicker defaultValue="#22c55e" formats={["hex"]} alpha={false} aria-label="Status color" />
      </Example>

      <PropsTable title="ColorPicker props" of={PROPS.ColorPicker} />
      <PropsTable title="ColorField props" of={PROPS.ColorField} />
      <KeyboardTable
        rows={[
          ["Arrow Left / Arrow Right", "Color area: change saturation. Hue and opacity sliders: change the value."],
          ["Arrow Up / Arrow Down", "Color area: change brightness (Shift for steps of 10)."],
          ["Page Up / Page Down", "Change brightness (or slider value) by 10."],
          ["Home / End", "Saturation 0 / 100 in the area; the ends of a slider."],
          ["Enter / Space / Arrow Down", "ColorField: open the picker from the swatch button. Escape closes it."],
        ]}
      />
      <A11yNotes
        items={[
          'The color area is a 2-D slider; the area, hue and opacity sliders and each channel input have a name and a spoken value ("Saturation 64%, brightness 100%").',
          "In ColorField, type a hex value and press Enter or leave the field to apply it (Escape discards); description and error are linked with aria-describedby.",
          "Copying announces the copied value politely. The color graphics opt out of forced colors (they are content, like an image); the controls around them keep system colors.",
        ]}
      />
    </Page>
  );
}
