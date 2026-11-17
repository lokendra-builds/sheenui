import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Calendar } from "../../src/components/calendar/calendar";
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  daysInMonth,
  differenceInDays,
  endOfMonth,
  endOfWeek,
  formatDate,
  formatDateRange,
  getMonthGrid,
  getMonthNames,
  getWeekdayNames,
  getWeekStart,
  isRtlLocale,
  isSameDay,
  isSameMonth,
  isWithinRange,
  parseISODate,
  startOfMonth,
  startOfWeek,
  toISODate,
} from "../../src/components/calendar/date-utils";
import type { DateRange } from "../../src/components/calendar/date-utils";
import { lastArg, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const today = new Date(2026, 9, 15); // Thu 15 Oct 2026
const day = (iso: string) => document.querySelector<HTMLButtonElement>(`[data-day="${iso}"]`)!;
const cell = (iso: string) => day(iso).closest("td") as HTMLElement;
const grid = () => screen.getByRole("grid", { name: /October 2026/ });

describeVariants((variant) => {
  it("is a date grid named by its month, with weekday headers and today marked", () => {
    renderUi(<Calendar locale="en-US" today={today} weekStartsOn={0} aria-label="Departure date" />, variant);
    expect(screen.getByRole("group", { name: "Departure date" })).toBeInTheDocument();
    expect(grid()).toBeInTheDocument();
    expect(within(grid()).getAllByRole("columnheader")).toHaveLength(7);
    expect(day("2026-10-15")).toHaveAttribute("aria-current", "date");
    expect(day("2026-10-15").getAttribute("aria-label")).toMatch(/Thursday, October 15, 2026/);
    // Only the roving day is a tab stop.
    expect(document.querySelectorAll('[data-day][tabindex="0"]')).toHaveLength(1);
  });

  it("clicking a day selects it (uncontrolled) and reports a Date", async () => {
    const onValueChange = vi.fn();
    renderUi(<Calendar locale="en-US" today={today} onValueChange={onValueChange} />, variant);
    await userEvent.click(day("2026-10-20"));
    expect(day("2026-10-20")).toHaveAttribute("data-selected");
    expect(cell("2026-10-20")).toHaveAttribute("aria-selected", "true");
    expect(isSameDay(lastArg(onValueChange) as Date | null, new Date(2026, 9, 20))).toBe(true);
  });

  it("keyboard: arrows move by day and week, Home/End by week edges, PageUp/PageDown by month, Enter/Space select", async () => {
    const onValueChange = vi.fn();
    renderUi(<Calendar locale="en-US" today={today} weekStartsOn={0} onValueChange={onValueChange} />, variant);
    day("2026-10-15").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement).toBe(day("2026-10-16"));
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement).toBe(day("2026-10-23"));
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    await expect.poll(() => document.activeElement).toBe(day("2026-10-15"));
    await userEvent.keyboard("{Home}");
    await expect.poll(() => document.activeElement).toBe(day("2026-10-11"));
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement).toBe(day("2026-10-17"));
    await userEvent.keyboard("{Enter}");
    expect(isSameDay(lastArg(onValueChange) as Date | null, new Date(2026, 9, 17))).toBe(true);
    await userEvent.keyboard("{ArrowRight} ");
    expect(isSameDay(lastArg(onValueChange) as Date | null, new Date(2026, 9, 18))).toBe(true);
    await userEvent.keyboard("{PageDown}");
    await expect.poll(() => screen.queryByRole("grid", { name: /November 2026/ })).not.toBeNull();
    await userEvent.keyboard("{PageUp}{PageUp}");
    await expect.poll(() => screen.queryByRole("grid", { name: /September 2026/ })).not.toBeNull();
  });

  it("arrowing past the end of the month flips to the next one and keeps focus on the day", async () => {
    renderUi(<Calendar locale="en-US" today={new Date(2026, 9, 31)} />, variant);
    day("2026-10-31").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => screen.queryByRole("grid", { name: /November 2026/ })).not.toBeNull();
    await expect.poll(() => document.activeElement).toBe(day("2026-11-01"));
  });

  it("next/previous month buttons navigate and announce the new month", async () => {
    const onMonthChange = vi.fn();
    renderUi(<Calendar locale="en-US" today={today} onMonthChange={onMonthChange} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    await expect.poll(() => screen.queryByRole("grid", { name: /November 2026/ })).not.toBeNull();
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("November 2026").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    await expect.poll(() => screen.queryByRole("grid", { name: /September 2026/ })).not.toBeNull();
  });

  it("the caption opens month and year pickers", async () => {
    renderUi(<Calendar locale="en-US" today={today} />, variant);
    await userEvent.click(screen.getByRole("button", { name: /October 2026, choose month and year/ }));
    const march = await screen.findByRole("button", { name: /March/ });
    await userEvent.click(march);
    await expect.poll(() => screen.queryByRole("grid", { name: /March 2026/ })).not.toBeNull();
  });

  it("min / max / isDateDisabled make days unavailable: focusable but not selectable", async () => {
    const onValueChange = vi.fn();
    renderUi(
      <Calendar
        locale="en-US"
        today={today}
        min={new Date(2026, 9, 10)}
        max={new Date(2026, 9, 25)}
        isDateDisabled={(d) => d.getDay() === 0}
        onValueChange={onValueChange}
      />,
      variant,
    );
    expect(day("2026-10-05")).toHaveAttribute("aria-disabled", "true");
    expect(day("2026-10-18")).toHaveAttribute("aria-disabled", "true"); // Sunday
    expect(day("2026-10-28")).toHaveAttribute("aria-disabled", "true");
    day("2026-10-18").click();
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(day("2026-10-20"));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("range mode: first click starts, second completes (in order), and ends are named", async () => {
    const onValueChange = vi.fn();
    renderUi(<Calendar mode="range" locale="en-US" today={today} onValueChange={onValueChange} />, variant);
    await userEvent.click(day("2026-10-22"));
    expect((onValueChange.mock.lastCall![0] as DateRange).end).toBeNull();
    await userEvent.click(day("2026-10-12"));
    const range = onValueChange.mock.lastCall![0] as DateRange;
    expect(isSameDay(range.start, new Date(2026, 9, 12))).toBe(true);
    expect(isSameDay(range.end, new Date(2026, 9, 22))).toBe(true);
    expect(day("2026-10-12").getAttribute("aria-label")).toMatch(/start of range/);
    expect(day("2026-10-22").getAttribute("aria-label")).toMatch(/end of range/);
    expect(cell("2026-10-17")).toHaveAttribute("aria-selected", "true");
    expect(cell("2026-10-25")).not.toHaveAttribute("aria-selected");
    expect(grid()).toHaveAttribute("aria-multiselectable", "true");
  });

  it("controlled value and month follow the parent", async () => {
    function Controlled() {
      const [v, setV] = useState<Date | null>(new Date(2026, 9, 3));
      return (
        <>
          <Calendar locale="en-US" today={today} value={v} onValueChange={setV} />
          <button onClick={() => setV(new Date(2026, 9, 28))}>pick 28</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    expect(cell("2026-10-03")).toHaveAttribute("aria-selected", "true");
    await userEvent.click(screen.getByRole("button", { name: "pick 28" }));
    expect(cell("2026-10-28")).toHaveAttribute("aria-selected", "true");
    expect(cell("2026-10-03")).not.toHaveAttribute("aria-selected");
  });

  it("numberOfMonths shows several grids; weekStartsOn changes the first column", () => {
    renderUi(<Calendar locale="en-US" today={today} numberOfMonths={2} weekStartsOn={1} />, variant);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(within(grid()).getAllByRole("columnheader")[0]!.textContent).toMatch(/Mo/);
  });

  it("labels translate the navigation (i18n)", () => {
    renderUi(
      <Calendar
        locale="de-DE"
        today={today}
        labels={{ nextMonth: "Nächster Monat", previousMonth: "Vorheriger Monat" }}
      />,
      variant,
    );
    expect(screen.getByRole("button", { name: "Nächster Monat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vorheriger Monat" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: /Oktober 2026/ })).toBeInTheDocument();
  });

  it("has no axe violations (single, range with a selection, two months)", async () => {
    renderUi(
      <div className="grid gap-6">
        <Calendar locale="en-US" today={today} defaultValue={new Date(2026, 9, 20)} aria-label="Single" />
        <Calendar
          mode="range"
          locale="en-US"
          today={today}
          defaultValue={{ start: new Date(2026, 9, 5), end: new Date(2026, 9, 9) }}
          aria-label="Range"
        />
        <Calendar locale="en-US" today={today} numberOfMonths={2} aria-label="Two months" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: changing the month still works", async () => {
  reduceMotion();
  renderUi(<Calendar locale="en-US" today={today} />);
  await userEvent.click(screen.getByRole("button", { name: "Next month" }));
  await expect.poll(() => screen.queryByRole("grid", { name: /November 2026/ })).not.toBeNull();
});

it("date-utils: grids, week starts, ISO round-trips and month maths", () => {
  const grid = getMonthGrid(new Date(2026, 9, 1), 0);
  expect(grid).toHaveLength(6);
  expect(grid[0]).toHaveLength(7);
  expect(isSameDay(grid[0]![0], new Date(2026, 8, 27))).toBe(true);
  expect(getMonthGrid(new Date(2026, 1, 1), 1, false).length).toBeLessThanOrEqual(5);
  expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  expect(parseISODate("2026-02-30")).toBeNull();
  expect(isSameDay(parseISODate("2026-02-28"), new Date(2026, 1, 28))).toBe(true);
  expect(isSameDay(addMonths(new Date(2026, 0, 31), 1), new Date(2026, 1, 28))).toBe(true);
  expect(isSameDay(addDays(new Date(2026, 11, 31), 1), new Date(2027, 0, 1))).toBe(true);
  expect(startOfWeek(new Date(2026, 9, 15), 1).getDay()).toBe(1);
  expect(formatDate(new Date(2026, 9, 15), "en-US", { dateStyle: "medium" })).toBe("Oct 15, 2026");
});

it("date-utils: comparisons, clamping, ranges and locale helpers", () => {
  const a = new Date(2026, 1, 28);
  const b = new Date(2026, 2, 1);
  expect(daysInMonth(2028, 1)).toBe(29);
  expect(daysInMonth(2026, 1)).toBe(28);
  expect(differenceInDays(a, b)).toBe(1);
  expect(differenceInDays(new Date(2026, 2, 28), new Date(2026, 3, 2))).toBe(5); // across the DST change
  expect(compareDays(a, b)).toBeLessThan(0);
  expect(compareDays(b, b)).toBe(0);
  expect(isSameMonth(a, new Date(2026, 1, 1))).toBe(true);
  expect(isSameMonth(a, b)).toBe(false);
  expect(isWithinRange(new Date(2026, 1, 20), new Date(2026, 1, 10), a)).toBe(true);
  expect(isWithinRange(b, new Date(2026, 1, 10), a)).toBe(false);
  expect(isSameDay(clampDate(new Date(2026, 0, 1), a, b), a)).toBe(true);
  expect(isSameDay(clampDate(new Date(2026, 5, 1), a, b), b)).toBe(true);
  expect(isSameDay(clampDate(new Date(2026, 1, 30), null, null), new Date(2026, 2, 2))).toBe(true);
  expect(isSameDay(startOfMonth(new Date(2026, 4, 17)), new Date(2026, 4, 1))).toBe(true);
  expect(isSameDay(endOfMonth(new Date(2026, 4, 17)), new Date(2026, 4, 31))).toBe(true);
  expect(isSameDay(addYears(new Date(2024, 1, 29), 1), new Date(2025, 1, 28))).toBe(true);
  expect(isSameDay(endOfWeek(new Date(2026, 9, 15), 1), new Date(2026, 9, 18))).toBe(true);
  expect(getWeekdayNames("en-US", 1, "short")).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  expect(getMonthNames("en-US", "short")[0]).toBe("Jan");
  expect(getMonthNames("de-DE", "long")[2]).toBe("März");
  expect(getWeekStart("en-US")).toBe(0);
  expect(getWeekStart("en-GB")).toBe(1);
  expect(getWeekStart("ar-EG")).toBe(6);
  expect(isRtlLocale("ar-EG")).toBe(true);
  expect(isRtlLocale("en-US")).toBe(false);
  expect(formatDateRange(new Date(2026, 9, 13), new Date(2026, 9, 17), "en-US", { dateStyle: "medium" })).toBe(
    "Oct 13 – 17, 2026",
  );
});
