import type { ReactNode } from "react";

import { Example } from "../layout/Example";
import { Faq, type FaqItem } from "../layout/LazyAbout";
import { lazyBlock } from "../layout/lazy-block";
import { Page } from "../layout/Page";
import { ScrollPre } from "../layout/ScrollPre";
import { href } from "../router";
import { whenNear } from "./when-near";

// The live examples are separate chunks (tabs, pagination, date picker and chart stay out of the initial JS). The prerendered
// HTML already holds them at full size; each island reserves that size while its code arrives.
const WrapperDemo = lazyBlock(() => import("./RtlWrapperDemo").then((m) => m.WrapperDemo), { minHeight: "9.5rem" });
const GermanDemo = lazyBlock(() => import("./RtlGermanDemo").then((m) => m.GermanDemo), { minHeight: "2.5rem" });
// The date picker and chart are far down the page: their code is fetched when the example is about to scroll into view.
const LocaleDemo = lazyBlock(
  () =>
    whenNear("rtl-locale-demo")
      .then(() => import("./RtlLocaleDemo"))
      .then((m) => m.LocaleDemo),
  { minHeight: "24rem" },
);

/* /docs/rtl: how SheenUI handles right-to-left layouts and translated, localised text. Written from the theme source. */

const a = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";
function A({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={href(to)} className={a}>
      {children}
    </a>
  );
}
const code = "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";
const C = ({ children }: { children: ReactNode }) => <code className={code}>{children}</code>;
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">{children}</div>
    </section>
  );
}
const pre = "glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm";

/** /docs/rtl */
export function RtlDocsPage() {
  const faq: FaqItem[] = [
    {
      q: "How do I turn on right-to-left?",
      a: 'Set dir="rtl" on the html element or on any wrapper. There is no provider to mount: components read the nearest dir ancestor, and a runtime change of dir re-renders them.',
    },
    {
      q: "Do I have to translate every string myself?",
      a: "Only the ones you ship. Each component with built-in text has a labels prop that takes a partial object over its English defaults, so you pass just the keys you change.",
    },
    {
      q: "Do charts flip in right-to-left?",
      a: "Their keyboard and text do, and several mirror the plot itself. Numbers and axes keep their own digits and order: pass locale (or format) for the number style you want.",
    },
    {
      q: "Where do portalled surfaces get their direction?",
      a: "From Base UI's DirectionProvider or from html dir, since a portal sits under body and has no wrapper above it. Put dir on html for an app that is right-to-left throughout.",
    },
  ];
  return (
    <Page
      title="Right-to-left and localisation"
      description="How components follow dir, which props take logical sides, and where text and numbers come from."
      files={false}
      exportChips={false}
    >
      <Example
        title="A right-to-left wrapper"
        description="Everything inside follows dir: the tab pill, the page arrows and the keyboard (Left and Right swap)."
        code={`
import { useState } from "react";
import { Pagination, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

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
}`}
      >
        <WrapperDemo />
      </Example>

      <Section id="rtl-direction" title="How a component learns the direction">
        <p>
          Every component that mirrors itself asks one internal hook, <C>useResolvedDirection</C> in{" "}
          <C>hooks/use-direction.ts</C>. It checks, in order, a <C>direction</C> prop, Base UI&rsquo;s{" "}
          <C>DirectionProvider</C>, the nearest ancestor with a <C>dir</C> attribute and finally <C>&lt;html dir&gt;</C>
          . On the server it answers <C>ltr</C>. One shared <C>MutationObserver</C> watches <C>dir</C>, so flipping it
          at runtime re-renders only the components that care. The hook is not exported from <C>@sheenui/theme</C>; you
          set <C>dir</C> and the components do the rest.
        </p>
        <p>
          Key handlers do not subscribe. They call <C>isRtlAt(element)</C>, one computed-style read at the moment of the
          key press, which is why the arrow keys of Tabs and Calendar swap their meaning in right-to-left text. The
          repo&rsquo;s own lint rule, <C>sheen/no-direction-detection</C>, rejects any other way of reading the
          direction, so a new component cannot quietly bypass it.
        </p>
        <p>
          Portalled surfaces (a Drawer, the Toaster) sit under <C>&lt;body&gt;</C>, so no wrapper above them can set the
          direction. They follow Base UI&rsquo;s provider or <C>&lt;html dir&gt;</C>. For an app that is right-to-left
          throughout, put <C>dir=&quot;rtl&quot;</C> on <C>html</C> and nothing else is needed.
        </p>
      </Section>

      <Section id="rtl-sides" title="Logical sides">
        <p>
          Props name sides by reading order, not by screen edge, wherever a screen edge is not what you mean.{" "}
          <C>align</C> on Popover, Tooltip, HoverCard and Menu is <C>start</C>, <C>center</C> or <C>end</C>.
          Menu&rsquo;s <C>side</C> also takes <C>inline-start</C> and <C>inline-end</C>. Drawer takes{" "}
          <C>side=&quot;start&quot;</C> or <C>&quot;end&quot;</C>, and the Toaster accepts{" "}
          <C>position=&quot;top-end&quot;</C>, where <C>start</C> is the left corner in <C>ltr</C> and the right corner
          in <C>rtl</C>. The physical values (<C>left</C>, <C>right</C>) remain for the cases that really are about the
          screen, such as a toast pinned to the bottom-right.
        </p>
        <p>
          Inside the components the CSS follows the same rule: logical utilities such as <C>ps-*</C>, <C>me-*</C> and{" "}
          <C>text-end</C>, never <C>pl-*</C> or <C>text-right</C>. Write your own code that way and it mirrors for free.
        </p>
      </Section>

      <Example
        title="Translate the strings"
        description="labels takes a partial object over defaultPaginationLabels. Functions get the numbers, so word order stays yours."
        code={`
import { useState } from "react";
import { Pagination, defaultPaginationLabels } from "@sheenui/theme";

const german = {
  ...defaultPaginationLabels,
  nav: "Seitennavigation",
  first: "Erste Seite",
  previous: "Vorherige Seite",
  next: "Nächste Seite",
  last: "Letzte Seite",
  page: (page: number) => \`Seite \${page}\`,
  morePages: "Weitere Seiten",
  pageOf: (page: number, pageCount: number) => \`Seite \${page} von \${pageCount}\`,
};

export function Example() {
  const [page, setPage] = useState(5);
  return <Pagination page={page} onPageChange={setPage} pageCount={20} labels={german} />;
}`}
      >
        <GermanDemo />
      </Example>

      <Section id="rtl-labels" title="Strings live in labels">
        <p>
          A component never hard-codes a string that is rendered or announced. Each one exports a type, such as{" "}
          <C>PaginationLabels</C>, and its English defaults, <C>defaultPaginationLabels</C>. The <C>labels</C> prop is{" "}
          <C>Partial</C> of that type, merged over the defaults, so you translate only what you use. Plain strings stay
          strings; anything with a number in it is a function, which keeps plurals and word order in your hands. The
          defaults are plain data with no DOM access, so they are safe to read while prerendering.
        </p>
        <ScrollPre className={pre}>
          <code>{`<Pagination labels={{ ...defaultPaginationLabels, next: "Weiter" }} pageCount={20} />`}</code>
        </ScrollPre>
        <p>
          Charts follow the same pattern (<C>defaultBarChartLabels</C> holds the keyboard hint and the tooltip&rsquo;s
          total and previous-period names), as do the date pickers, the carousel and the side drawer. There is no global
          i18n provider by design: the strings belong to the component that shows them, so you can load only the
          languages a screen needs.
        </p>
      </Section>

      <Example
        title="Dates and numbers"
        description="locale picks the month names, the first weekday and the digits; the chart's default number format follows its own locale."
        stageClassName="items-start"
        code={`
import { BarChart, DatePicker, GlassCard, type ChartSeries } from "@sheenui/theme";

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
}`}
      >
        <div id="rtl-locale-demo" className="w-full max-w-md">
          <LocaleDemo />
        </div>
      </Example>

      <Section id="rtl-locale" title="Locale-aware components">
        <p>
          Text that comes from the language rather than from you is formatted with <C>Intl</C> in the locale you pass.
          Calendar and the date pickers take a BCP 47 <C>locale</C>: month and weekday names, the first day of the week
          (override it with <C>weekStartsOn</C>) and even the digits follow it, so <C>ar-EG</C> starts on Saturday in
          Arabic digits. Without one they use the browser&rsquo;s, so on a prerendered page pass <C>locale</C> and a
          fixed <C>today</C> to keep the server and client markup equal.
        </p>
        <p>
          Charts take <C>locale</C> for the default number format: compact values and axis ticks keep the decimals a
          step needs, so 0.25 stays 0,25 in German. For anything else pass <C>format</C>, a function from number to
          text. WorldMap reads country names from <C>Intl.DisplayNames</C> in its <C>locale</C>, and its keyboard
          type-to-find matches in that locale too. See <A to="/forms/date-picker">date picker</A>,{" "}
          <A to="/forms/calendar">calendar</A> and <A to="/charts/world-map">world map</A>.
        </p>
      </Section>

      <Section id="rtl-charts" title="Charts and direction">
        <p>
          Charts read the direction through <C>useChartDirection</C>, which wraps the same hook. Their keyboard swaps
          Left and Right, and plots with a time or bin axis, such as the histogram, mirror themselves. Some charts, the
          Marimekko among them, deliberately draw left to right in every language so a share axis never flips under its
          numbers. Numerals and Latin text inside a right-to-left page keep their own direction: wrap an inline value in{" "}
          <C>&lt;bdi&gt;</C> when you mix them in your own markup.
        </p>
      </Section>
      <Faq items={faq} />
    </Page>
  );
}
