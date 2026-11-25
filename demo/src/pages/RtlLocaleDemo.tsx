import { BarChart, DatePicker, GlassCard, type ChartSeries } from "@sheenui/theme";

import { DEMO_TODAY } from "../demo-clock";

/* A live example of /docs/rtl in its own chunk, so the page loads only the code a visible example needs (see RtlDocsPage.tsx). */

const sales = [
  { month: "Jan", umsatz: 12400 },
  { month: "Feb", umsatz: 18250 },
  { month: "Mär", umsatz: 15980 },
];
const salesSeries: ChartSeries[] = [{ key: "umsatz", label: "Umsatz", color: 1 }];

/** A date picker in Arabic digits and a chart with German numbers. */
export function LocaleDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div dir="rtl" lang="ar-EG">
        <DatePicker label="التاريخ" locale="ar-EG" today={DEMO_TODAY} />
      </div>
      <GlassCard className="p-4">
        <BarChart data={sales} index="month" series={salesSeries} locale="de" aria-label="Umsatz pro Monat" />
      </GlassCard>
    </div>
  );
}
