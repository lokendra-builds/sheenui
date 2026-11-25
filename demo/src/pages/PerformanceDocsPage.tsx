import type { ReactNode } from "react";

import { Faq, type FaqItem } from "../layout/LazyAbout";
import { Page } from "../layout/Page";
import { href } from "../router";
import {
  BUDGET_CLASSES,
  INTERACTION_ROWS,
  LIGHTHOUSE_ROWS,
  MEASURED_ON,
  MEASURED_ON_MACHINE,
  OTHER_METRICS,
  ROUTE_ROWS,
  THROTTLING,
} from "./performance-data";

/* /docs/performance: the performance budgets the project enforces and the lab numbers behind them. Numbers: ./performance-data.ts. */

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

const th = "pb-2 pe-4 text-start font-medium align-bottom";
const rowTh = "py-2 pe-4 text-start font-medium align-top";
const td = "py-2 pe-4 align-top";

/** A small accessible data table: a hidden caption, column headers and a row header per line. */
function DataGrid({
  caption,
  head,
  rows,
  lastUnit,
}: {
  caption: string;
  head: string[];
  rows: string[][];
  /** Unit written after every value of the last column, so a row ends on "345 KB", not on a bare number that the next row's name would follow in the page text. */
  lastUnit?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table data-llms="include" className="w-full min-w-[34rem] text-start text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-sheen-glass-border">
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={cell} scope="row" className={rowTh}>
                    {cell}
                  </th>
                ) : (
                  <td key={`${row[0]}-${head[i]}`} className={td}>
                    {cell}
                    {lastUnit && i === row.length - 1 ? ` ${lastUnit}` : ""}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** /docs/performance */
export function PerformanceDocsPage() {
  const faq: FaqItem[] = [
    {
      q: "Is backdrop-filter slow?",
      a: "Each blurred surface is an extra full-size render pass, so the cost grows with how many are in view at once, not with how many exist. SheenUI holds a page to at most 8 blurred surfaces in view and at most 3 refracting ones, and nested glass draws no blur of its own.",
    },
    {
      q: "How do I make glass cheaper on a slow phone?",
      a: 'Turn on Lite glass: set data-glass="lite" on the html element, or call useGlassMode. It cuts the blur radius and calms the backdrop, with the same contrast and layout. SheenUI also turns it on by itself for low memory, few cores, Save-Data or measured dropped frames, unless the visitor chose.',
    },
    {
      q: "Does SheenUI work with reduced motion?",
      a: "Yes. The OS setting and the html data-motion=reduced switch both turn loops into a single quick pass and drop pointer effects, and exits stay shorter than entrances.",
    },
    {
      q: "Are these numbers from real visitors?",
      a: "No. They are lab runs on a simulated slow phone profile, so they show regressions and trade-offs but not what your visitors see. They were measured on one machine on 25 Nov 2026. There is no field data for the demo site yet.",
    },
  ];
  return (
    <Page
      title="Performance"
      description="The budgets SheenUI enforces, how glass is kept cheap, and the lab numbers measured against them."
      files={false}
      exportChips={false}
    >
      <Section id="perf-budgets" title="What is enforced">
        <p>
          These are rules the docs site is built against, and a failing check stops a release. A budget that cannot be
          met says so in the tables below instead of being quietly loosened.
        </p>
        <ul className="flex list-disc flex-col gap-2 ps-6">
          <li>
            <strong>Blurred surfaces.</strong> At most 8 elements with a <C>backdrop-filter</C> are in view at once,
            checked at every scroll position of key pages in a real browser. Glass nested inside glass draws no blur of
            its own, and while a dialog is open the page behind it stops blurring.
          </li>
          <li>
            <strong>Refraction.</strong> The <A to="/effects/liquid-glass">Liquid Glass</A> lens refracts on at most 3
            surfaces page-wide; the rest fall back to frosted blur until a slot frees up.
          </li>
          <li>
            <strong>Motion.</strong> Only <C>transform</C> and <C>opacity</C> animate, apart from a short listed set of
            exceptions. An ancestor of glass never gets an opacity below 1, a filter, a mask or a clip-path, because
            that flattens the glass inside it.
          </li>
          <li>
            <strong>Loops sleep.</strong> Marquees, beams, ambient backdrops, looping CSS animations and live charts
            pause when they scroll off-screen and when the tab is hidden, then resume.
          </li>
          <li>
            <strong>Reduced motion.</strong> The OS setting and the in-app switch both calm every loop and pointer
            effect. Exits are shorter than entrances and never overshoot.
          </li>
          <li>
            <strong>Interaction.</strong> A browser test drives real interactions on a fixed set of routes in both looks
            and fails on a long task over 50 ms or any layout shift. Scrolling a page from top to bottom may add at most
            0.01 of layout shift.
          </li>
          <li>
            <strong>JavaScript per route.</strong> <C>pnpm budget</C> measures the gzip size of the scripts a route
            needs before it can hydrate, and of everything it fetches in the first seconds after load. A route over its
            class budget fails the check.
          </li>
        </ul>
        <DataGrid
          caption="JavaScript budgets per page class, in KB gzip, with the last pnpm budget run (measured on the 25 Nov 2026 build) as minimum, median and maximum"
          head={[
            "Page class",
            "Routes",
            "Initial JS budget",
            "Initial JS measured (min / median / max)",
            "Fetched by load + idle budget",
            "Fetched measured (min / median / max)",
          ]}
          rows={BUDGET_CLASSES.map((r) => [
            r.name,
            r.routes,
            `${r.initialBudget}`,
            r.initial,
            r.fetchedBudget,
            r.fetched,
          ])}
        />
        <p className="text-sm text-sheen-muted">
          Initial JS is what the browser downloads before the page can hydrate. Lazy parts such as charts and demos load
          afterwards, so the second pair of columns counts every script requested in the first 5 seconds after load. The
          floor is the shared docs shell, about 132 KB, plus roughly 100 KB it fetches when idle.
        </p>
      </Section>

      <Section id="perf-lab" title="Lab measurements">
        <p>
          <strong>Method.</strong> Measured {MEASURED_ON} on the deployed site, the production build users get, not a
          local build. Machine: {MEASURED_ON_MACHINE}. Page loads: {THROTTLING}. Each figure is the median of 5 cold
          loads. LCP is the last largest-contentful-paint entry. CLS counts layout shifts without recent input up to 5
          seconds after the load event. Total Blocking Time is the time over 50 ms of each long task that ends after
          First Contentful Paint, up to 5 seconds after load. JavaScript bytes are the encoded response sizes of every
          script, before the load event and by 5 seconds after it. The Lighthouse table is a separate run of Lighthouse
          13.6.0, mobile preset with simulated throttling (4x CPU, 150 ms round trip, 1638.4 kbit/s), median of 3, on
          the site&rsquo;s default look. This is a laboratory profile run on a desktop machine, not a phone.
        </p>
        <DataGrid
          caption="Per-route load metrics on the deployed site: LCP in seconds, CLS, Total Blocking Time and longest task in milliseconds, and JavaScript transferred in KB"
          head={[
            "Route",
            "LCP s",
            "CLS",
            "TBT ms",
            "Longest task ms, median (worst run)",
            "JS before load KB",
            "JS by load + 5 s KB",
          ]}
          rows={ROUTE_ROWS.map((r) => [r.route, r.lcp, r.cls, r.tbt, r.longest, r.jsInitial, r.jsTotal])}
          lastUnit="KB"
        />
        <DataGrid
          caption="Lighthouse mobile Performance score and Total Blocking Time per route, median of 3 runs"
          head={["Route", "Performance score", "Total Blocking Time ms"]}
          rows={LIGHTHOUSE_ROWS.map((r) => [r.route, r.score, r.tbt])}
          lastUnit="ms"
        />
        <DataGrid
          caption="Interaction latency at 4x CPU: time from the pointer event to the first frame that shows the opened popup, median of 5"
          head={["Interaction", "Route", "Median ms", "Range ms"]}
          rows={INTERACTION_ROWS.map((r) => [r.interaction, r.route, r.median, r.runs])}
        />
        <p className="text-sm text-sheen-muted">
          Interactions were measured on a 1440 by 900 px viewport with the 4x CPU slowdown and no network throttling,
          after the page had loaded and the demo had hydrated. The JavaScript columns are transferred (compressed) sizes
          including headers, so they differ a little from the gzip figures in the budget table.
        </p>
        <DataGrid
          caption="Other lab metrics, the target each is held to and whether it was met"
          head={["Metric", "Target", "Measured", "Met"]}
          rows={OTHER_METRICS.map((r) => [r.metric, r.target, r.result, r.met])}
        />
      </Section>

      <Section id="perf-limits" title="Honest limits">
        <ul className="flex list-disc flex-col gap-2 ps-6">
          <li>
            Long tasks over 50 ms remain on the throttled phone profile: all 9 measured routes still show one, with the
            median longest task between 59 and 132 ms and the worst single load at 180 ms. The chat thread and the two
            dashboards are over 100 ms. They were reduced, not removed.
          </li>
          <li>
            Real refraction runs in Chromium only. Safari and Firefox accept the filter but draw nothing, so they get
            the frosted blur instead.
          </li>
          <li>
            There is no field data yet: every number above is a lab run, with one machine and one network profile.
          </li>
          <li>
            The guide page scores 94 in Lighthouse, because its simulated Largest Contentful Paint is about 2.9 s, over
            the 2.5 s target. Lighthouse is a simulation and the machine was not otherwise idle (load average up to
            3.7), so treat differences of a few points as noise. The budget table was measured on the 25 Nov 2026 build
            with <C>pnpm budget</C>, not on the deployed site. Run your own build with <C>pnpm budget</C> and the
            browser&rsquo;s own tools before relying on any of this.
          </li>
        </ul>
      </Section>

      <Section id="perf-yours" title="Keep your own page fast with glass">
        <ul className="flex list-disc flex-col gap-2 ps-6">
          <li>
            <strong>Count the blur.</strong> Keep at most 8 blurred surfaces in view, and 3 of them refracting. Use{" "}
            <C>glass-1</C> for small controls, since it never blurs, and do not stack glass in glass. The{" "}
            <A to="/guides/backdrop-filter-performance">backdrop-filter performance guide</A> explains why each surface
            costs a render pass.
          </li>
          <li>
            <strong>Offer Lite glass.</strong> It lowers the blur radius for slow devices. SheenUI applies it
            automatically on weak hardware and the visitor can switch it from the preferences bar (see{" "}
            <A to="/foundations">Foundations</A>).
          </li>
          <li>
            <strong>Animate transform and opacity only.</strong> Do not fade, filter, mask or clip a wrapper that holds
            glass: animate the glass element itself.
          </li>
          <li>
            <strong>Let loops sleep.</strong> The <A to="/effects/marquee">Marquee</A>,{" "}
            <A to="/effects/particles">Particles</A> and <A to="/effects/liquid-glass">Liquid Glass</A> effects already
            pause off-screen and in hidden tabs; do the same for any loop of your own.
          </li>
          <li>
            <strong>Import only what you use.</strong> Components are copied as source, so a page pays only for the
            files it imports (see <A to="/docs/installation">Installation</A>).
          </li>
        </ul>
      </Section>
      <Faq items={faq} />
    </Page>
  );
}
