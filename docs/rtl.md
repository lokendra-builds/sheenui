Canonical: https://lokendra-builds.github.io/sheenui/docs/rtl

# React RTL and Localisation: dir, Labels, Locale

URL: https://lokendra-builds.github.io/sheenui/docs/rtl
Sidebar name: Right-to-left and localisation

Right-to-left and localised React UI with SheenUI: set dir, use logical sides, translate strings through labels and format dates and numbers by locale.

By Lokendra Singh Rathore. Published November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Right-to-left and localisation

React RTL support in SheenUI needs no provider: components follow dir on the html element or any wrapper, so tab pills, arrow keys and drawers mirror, strings come from a partial labels prop and dates and numbers follow a locale prop.

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { defaultPaginationLabels, Pagination } from "@/components/sheenui/pagination/pagination";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/sheenui/tabs/tabs";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BarChart, type ChartSeries, DatePicker, defaultPaginationLabels, GlassCard, Pagination, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";
```

## Example 1 of 3: A right-to-left wrapper

Everything inside follows dir: the tab pill, the page arrows and the keyboard (Left and Right swap).

```tsx
import { useState } from "react";
import { Pagination } from "@/components/sheenui/pagination/pagination";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/sheenui/tabs/tabs";
// Package build (after the first npm release, or a packed tarball): import { Pagination, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

export function Example() {
  const [page, setPage] = useState(3);
  return (
    <div dir="rtl" lang="ar" className="flex flex-col gap-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTab value="overview">نظرة عامة</TabsTab>
          <TabsTab value="projects">المشاريع</TabsTab>
          <TabsTab value="settings">الإعدادات</TabsTab>
        </TabsList>
        <TabsPanel value="overview">إحصاءات مساحة العمل.</TabsPanel>
        <TabsPanel value="projects">المراحل والمسؤولون.</TabsPanel>
        <TabsPanel value="settings">الملف الشخصي والفواتير.</TabsPanel>
      </Tabs>
      <Pagination page={page} onPageChange={setPage} pageCount={12} />
    </div>
  );
}
```

## Example 2 of 3: Translate the strings

labels takes a partial object over defaultPaginationLabels. Functions get the numbers, so word order stays yours.

```tsx
import { useState } from "react";
import { Pagination, defaultPaginationLabels } from "@/components/sheenui/pagination/pagination";
// Package build (after the first npm release, or a packed tarball): import { Pagination, defaultPaginationLabels } from "@sheenui/theme";

const german = {
  ...defaultPaginationLabels,
  nav: "Seitennavigation",
  first: "Erste Seite",
  previous: "Vorherige Seite",
  next: "Nächste Seite",
  last: "Letzte Seite",
  page: (page: number) => `Seite ${page}`,
  morePages: "Weitere Seiten",
  pageOf: (page: number, pageCount: number) => `Seite ${page} von ${pageCount}`,
};

export function Example() {
  const [page, setPage] = useState(5);
  return <Pagination page={page} onPageChange={setPage} pageCount={20} labels={german} />;
}
```

## Example 3 of 3: Dates and numbers

locale picks the month names, the first weekday and the digits; the chart's default number format follows its own locale.

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { BarChart, DatePicker, GlassCard, type ChartSeries } from "@sheenui/theme";

const sales = [
  { month: "Jan", umsatz: 12400 },
  { month: "Feb", umsatz: 18250 },
  { month: "Mär", umsatz: 15980 },
];
const series: ChartSeries[] = [{ key: "umsatz", label: "Umsatz", color: 1 }];

export function Example() {
  return (
    <div className="flex flex-col gap-6">
      <div dir="rtl" lang="ar-EG">
        <DatePicker label="التاريخ" locale="ar-EG" />
      </div>
      <GlassCard className="p-4">
        <BarChart data={sales} index="month" series={series} locale="de" aria-label="Umsatz pro Monat" />
      </GlassCard>
    </div>
  );
}
```

## How a component learns the direction

Every component that mirrors itself asks one internal hook, useResolvedDirection in hooks/use-direction.ts. It checks, in order, a direction prop, Base UI’s DirectionProvider, the nearest ancestor with a dir attribute and finally <html dir>. On the server it answers ltr. One shared MutationObserver watches dir, so flipping it at runtime re-renders only the components that care. The hook is not exported from @sheenui/theme; you set dir and the components do the rest.

Key handlers do not subscribe. They call isRtlAt(element), one computed-style read at the moment of the key press, which is why the arrow keys of Tabs and Calendar swap their meaning in right-to-left text. The repo’s own lint rule, sheen/no-direction-detection, rejects any other way of reading the direction, so a new component cannot quietly bypass it.

Portalled surfaces (a Drawer, the Toaster) sit under <body>, so no wrapper above them can set the direction. They follow Base UI’s provider or <html dir>. For an app that is right-to-left throughout, put dir="rtl" on html and nothing else is needed.


## Logical sides

Props name sides by reading order, not by screen edge, wherever a screen edge is not what you mean. align on Popover, Tooltip, HoverCard and Menu is start, center or end. Menu’s side also takes inline-start and inline-end. Drawer takes side="start" or "end", and the Toaster accepts position="top-end", where start is the left corner in ltr and the right corner in rtl. The physical values (left, right) remain for the cases that really are about the screen, such as a toast pinned to the bottom-right.

Inside the components the CSS follows the same rule: logical utilities such as ps-*, me-* and text-end, never pl-* or text-right. Write your own code that way and it mirrors for free.


## Strings live in labels

A component never hard-codes a string that is rendered or announced. Each one exports a type, such as PaginationLabels, and its English defaults, defaultPaginationLabels. The labels prop is Partial of that type, merged over the defaults, so you translate only what you use. Plain strings stay strings; anything with a number in it is a function, which keeps plurals and word order in your hands. The defaults are plain data with no DOM access, so they are safe to read while prerendering.

```tsx
<Pagination labels={{ ...defaultPaginationLabels, next: "Weiter" }} pageCount={20} />
```

Charts follow the same pattern (defaultBarChartLabels holds the keyboard hint and the tooltip’s total and previous-period names), as do the date pickers, the carousel and the side drawer. There is no global i18n provider by design: the strings belong to the component that shows them, so you can load only the languages a screen needs.


## Locale-aware components

Text that comes from the language rather than from you is formatted with Intl in the locale you pass. Calendar and the date pickers take a BCP 47 locale: month and weekday names, the first day of the week (override it with weekStartsOn) and even the digits follow it, so ar-EG starts on Saturday in Arabic digits. Without one they use the browser’s, so on a prerendered page pass locale and a fixed today to keep the server and client markup equal.

Charts take locale for the default number format: compact values and axis ticks keep the decimals a step needs, so 0.25 stays 0,25 in German. For anything else pass format, a function from number to text. WorldMap reads country names from Intl.DisplayNames in its locale, and its keyboard type-to-find matches in that locale too. See [date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker), [calendar](https://lokendra-builds.github.io/sheenui/forms/calendar) and [world map](https://lokendra-builds.github.io/sheenui/charts/world-map).


## Charts and direction

Charts read the direction through useChartDirection, which wraps the same hook. Their keyboard swaps Left and Right, and plots with a time or bin axis, such as the histogram, mirror themselves. Some charts, the Marimekko among them, deliberately draw left to right in every language so a share axis never flips under its numbers. Numerals and Latin text inside a right-to-left page keep their own direction: wrap an inline value in <bdi> when you mix them in your own markup.


## Frequently asked questions

### How do I turn on right-to-left?

Set dir="rtl" on the html element or on any wrapper. There is no provider to mount: components read the nearest dir ancestor, and a runtime change of dir re-renders them.

### Do I have to translate every string myself?

Only the ones you ship. Each component with built-in text has a labels prop that takes a partial object over its English defaults, so you pass just the keys you change.

### Do charts flip in right-to-left?

Their keyboard and text do, and several mirror the plot itself. Numbers and axes keep their own digits and order: pass locale (or format) for the number style you want.

### Where do portalled surfaces get their direction?

From Base UI's DirectionProvider or from html dir, since a portal sits under body and has no wrapper above it. Put dir on html for an app that is right-to-left throughout.


## Related pages

- [Date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker)
- [Calendar](https://lokendra-builds.github.io/sheenui/forms/calendar)
- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map)
- [About SheenUI](https://lokendra-builds.github.io/sheenui/about)
- [Introduction](https://lokendra-builds.github.io/sheenui/)
- [Foundations](https://lokendra-builds.github.io/sheenui/foundations)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
