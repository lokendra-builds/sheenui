import { useState } from "react";
import { Calendar, GlassCard, Select } from "@sheenui/theme";
import { DEMO_TODAY } from "../demo-clock";

const LOCALES = [
  { value: "en-US", label: "English (US) · Sunday" },
  { value: "en-GB", label: "English (UK) · Monday" },
  { value: "de-DE", label: "Deutsch · Montag" },
  { value: "ja-JP", label: "日本語 · 日曜日" },
  { value: "ar-EG", label: "العربية · السبت" },
];

/**
 * The "Locales" demo of /forms/calendar. The page loads it as an island (lazyBlock): the Select and its positioner stay out
 * of the picker pages' shared chunk, which the date and color picker pages fetch too. The prerendered HTML shows the finished demo.
 */
export function CalendarLocalesDemo() {
  // A fixed "today" and locale: the page is prerendered, and the browser's clock and language must not change the HTML.
  const [locale, setLocale] = useState("en-GB");
  const rtl = locale.startsWith("ar");
  return (
    <div className="flex max-w-full flex-col items-center gap-4">
      <Select
        label="Locale"
        items={LOCALES}
        value={locale}
        onValueChange={(v) => v && setLocale(v)}
        className="w-64 max-w-full"
      />
      <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-3">
        <div dir={rtl ? "rtl" : undefined} lang={locale}>
          <Calendar
            key={locale}
            locale={locale}
            today={DEMO_TODAY}
            defaultValue={DEMO_TODAY}
            aria-label="Localised calendar"
          />
        </div>
      </GlassCard>
    </div>
  );
}
