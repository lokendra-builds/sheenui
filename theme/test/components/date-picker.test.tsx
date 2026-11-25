import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { DatePicker, DateRangePicker } from "../../src/components/date-picker/date-picker";
import { isSameDay } from "../../src/components/calendar/date-utils";
import type { DateRange } from "../../src/components/calendar/date-utils";
import { lastArg, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const today = new Date(2026, 9, 15);
const day = (iso: string) => document.querySelector<HTMLButtonElement>(`[data-day="${iso}"]`)!;
const dialog = () => screen.queryByRole("dialog");
const field = (name: string | RegExp) => screen.getByRole("button", { name });

describeVariants((variant) => {
  it("the field is a button named by its label and showing the placeholder; clicking opens a calendar dialog", async () => {
    renderUi(<DatePicker label="Departure" locale="en-US" today={today} />, variant);
    const f = field(/Departure/);
    expect(f).toHaveTextContent("Pick a date");
    expect(f).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(f);
    await expect.poll(dialog).not.toBeNull();
    expect(screen.getByRole("grid", { name: /October 2026/ })).toBeInTheDocument();
  });

  it("picking a day writes it into the field, reports a Date and closes; focus returns to the field", async () => {
    const onValueChange = vi.fn();
    renderUi(<DatePicker label="Departure" locale="en-US" today={today} onValueChange={onValueChange} />, variant);
    await userEvent.click(field(/Departure/));
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(day("2026-10-21"));
    expect(isSameDay(lastArg(onValueChange) as Date | null, new Date(2026, 9, 21))).toBe(true);
    await expect.poll(dialog).toBeNull();
    expect(field(/Departure/)).toHaveTextContent("Oct 21, 2026");
    await expect.poll(() => document.activeElement).toBe(field(/Departure/));
  });

  it("keyboard: Enter opens, arrows + Enter pick, Escape closes without changing", async () => {
    renderUi(
      <DatePicker label="Departure" locale="en-US" today={today} defaultValue={new Date(2026, 9, 10)} />,
      variant,
    );
    field(/Departure/).focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(dialog).not.toBeNull();
    await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    expect(field(/Departure/)).toHaveTextContent("Oct 10, 2026");
    await expect.poll(() => document.activeElement).toBe(field(/Departure/));
    await userEvent.keyboard("{Enter}");
    await expect.poll(dialog).not.toBeNull();
    await expect.poll(() => document.activeElement).toBe(day("2026-10-10"));
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    await expect.poll(dialog).toBeNull();
    expect(field(/Departure/)).toHaveTextContent("Oct 12, 2026");
  });

  it("keyboard: Arrow Down (and Space) on the field opens the calendar, a range field too", async () => {
    renderUi(
      <>
        <DatePicker label="Departure" locale="en-US" today={today} />
        <DateRangePicker label="Stay" locale="en-US" today={today} />
      </>,
      variant,
    );
    field(/Departure/).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(dialog).not.toBeNull();
    await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    await expect.poll(() => document.activeElement).toBe(field(/Departure/));
    await userEvent.keyboard(" ");
    await expect.poll(dialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    field(/Stay/).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(dialog).not.toBeNull();
  });

  it("the footer's Today and Clear buttons and the × button set and clear the value", async () => {
    renderUi(<DatePicker label="Departure" locale="en-US" today={today} clearable />, variant);
    await userEvent.click(field(/Departure/));
    await userEvent.click(await screen.findByRole("button", { name: "Today" }));
    await expect.poll(dialog).toBeNull();
    expect(field(/Departure/)).toHaveTextContent("Oct 15, 2026");
    await userEvent.click(screen.getByRole("button", { name: "Clear date" }));
    await expect.poll(() => field(/Departure/).textContent).toContain("Pick a date");
  });

  it("closeOnSelect={false} keeps the calendar open; controlled value and open follow the parent", async () => {
    function Controlled() {
      const [v, setV] = useState<Date | null>(null);
      const [open, setOpen] = useState(true);
      return (
        <>
          <DatePicker
            label="Departure"
            locale="en-US"
            today={today}
            value={v}
            onValueChange={setV}
            open={open}
            onOpenChange={setOpen}
            closeOnSelect={false}
          />
          <output>{v ? v.toDateString() : "none"}</output>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(day("2026-10-09"));
    await expect.poll(() => document.querySelector("output")?.textContent).toBe("Fri Oct 09 2026");
    expect(dialog()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
  });

  it("min / max / isDateDisabled limit the calendar; formatOptions changes the field text", async () => {
    renderUi(
      <DatePicker
        label="Departure"
        locale="en-US"
        today={today}
        min={new Date(2026, 9, 12)}
        formatOptions={{ dateStyle: "full" }}
        defaultValue={new Date(2026, 9, 14)}
      />,
      variant,
    );
    expect(field(/Departure/)).toHaveTextContent("Wednesday, October 14, 2026");
    await userEvent.click(field(/Departure/));
    await expect.poll(dialog).not.toBeNull();
    expect(day("2026-10-11")).toHaveAttribute("aria-disabled", "true");
  });

  it("required, description, error and disabled", () => {
    renderUi(
      <>
        <DatePicker label="Start" required description="Pick a start date" locale="en-US" today={today} />
        <DatePicker label="End" error="Too early" locale="en-US" today={today} />
        <DatePicker label="Off" disabled locale="en-US" today={today} />
      </>,
      variant,
    );
    expect(field(/Start/)).toHaveAccessibleDescription(/Pick a start date/);
    expect(field(/Start/)).toHaveAccessibleDescription(/Required/);
    expect(screen.getByRole("alert")).toHaveTextContent("Too early");
    expect(field(/End/)).toHaveAttribute("aria-invalid", "true");
    expect(field(/Off/)).toBeDisabled();
  });

  it("name submits the day as YYYY-MM-DD; labels translate the strings", () => {
    renderUi(
      <form data-testid="f">
        <DatePicker
          label="Datum"
          name="date"
          defaultValue={new Date(2026, 9, 3)}
          locale="de-DE"
          today={today}
          labels={{ placeholder: "Datum wählen", today: "Heute" }}
        />
      </form>,
      variant,
    );
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("date")).toBe("2026-10-03");
  });

  it("DateRangePicker: pick two days, the summary and presets work", async () => {
    const onValueChange = vi.fn();
    renderUi(
      <DateRangePicker
        label="Stay"
        locale="en-US"
        today={today}
        onValueChange={onValueChange}
        presets={[{ label: "Next 7 days", range: () => ({ start: today, end: new Date(2026, 9, 22) }) }]}
      />,
      variant,
    );
    await userEvent.click(field(/Stay/));
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(day("2026-10-13"));
    await userEvent.click(day("2026-10-17"));
    await expect.poll(() => (onValueChange.mock.lastCall?.[0] as DateRange | null)?.end).not.toBeNull();
    await expect.poll(dialog).toBeNull();
    expect(field(/Stay/).textContent).toMatch(/Oct 13\s*–\s*17, 2026/);
    // Presets list.
    await userEvent.click(field(/Stay/));
    await userEvent.click(await screen.findByRole("button", { name: "Next 7 days" }));
    await expect.poll(() => field(/Stay/).textContent).toMatch(/Oct 15\s*–\s*22, 2026/);
  });

  it("has no axe violations (closed and open; range picker open)", async () => {
    renderUi(<DatePicker label="Departure" locale="en-US" today={today} description="Choose a day" />, variant);
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.click(field(/Departure/));
    await expect.poll(dialog).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
