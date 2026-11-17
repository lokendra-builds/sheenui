import { Badge, Button, GlassCard, Input, cn } from "@sheenui/theme";
import { Timeline, TimelineItem } from "@sheenui/theme";
import { Separator } from "@sheenui/theme";
import { ScrollArea } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import type { TimelineScene as TimelineSceneData } from "../layout/ShowcaseStage.timeline";
import { TimelineScene } from "../layout/ShowcaseStage.timeline.scene";
import type { SeparatorScene as SeparatorSceneData } from "../layout/ShowcaseStage.separator";
import { SeparatorScene } from "../layout/ShowcaseStage.separator.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { ScrollAreaScene as ScrollAreaSceneData } from "../layout/ShowcaseStage.scroll-area";
import { ScrollAreaScene } from "../layout/ShowcaseStage.scroll-area.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { DEMO_LOCALE } from "../demo-clock";
import * as PROPS from "../generated/component-props";
import { DemoLink, I, icon } from "./LayoutPages/shared";
import { TimelineFeedDemo, timelineAltCode, timelineFeedCode, timelineOrderCode } from "./LayoutPages/timeline";
import { releases, scrollBothCode, scrollHorizontalCode, scrollVerticalCode, viewed } from "./LayoutPages/scroll-area";
import { lazyBlock } from "../layout/lazy-block";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const island = { eager: true, minHeight: "80vh" };

/** The "Timeline" docs page (/layout/timeline): live examples, props and notes. */
export function TimelinePage() {
  return (
    <Page
      eyebrow="Layout"
      title="Timeline"
      description="A vertical activity feed for audit logs, order tracking and changelogs. As items scroll into view their markers pop in, the lines draw down to the next event and the text rises into place; new events push the feed down smoothly."
      source="theme/src/components/timeline/timeline.tsx"
    >
      <ShowcaseStage<TimelineSceneData>
        label="Timeline demo"
        story={() => import("../layout/ShowcaseStage.timeline")}
        initial={{ count: 1 }}
        minHeight="33rem"
      >
        {(scene, ctx) => <TimelineScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Activity feed"
        description="Avatars with action badges, rich titles, a comment, group headings and a plain dot for minor events. Press “Simulate activity”: the new event slides in at the top and the rest make room."
        code={timelineFeedCode}
      >
        <TimelineFeedDemo />
      </Example>

      <Example
        title="Order tracking"
        description='connector="accent" for the path already travelled, current for the live step (a soft pulse and aria-current), dashed for what has not happened yet.'
        code={timelineOrderCode}
      >
        <GlassCard className="w-full max-w-sm p-5">
          <Timeline aria-label="Order status" size="sm">
            <TimelineItem
              icon={icon(I.check)}
              tone="success"
              connector="accent"
              title="Order placed"
              time="Oct 27, 09:12"
              dateTime="2026-10-27T09:12"
              locale={DEMO_LOCALE}
            />
            <TimelineItem
              icon={icon(I.box)}
              tone="success"
              connector="accent"
              title="Packed"
              time="Oct 27, 15:40"
              dateTime="2026-10-27T15:40"
              locale={DEMO_LOCALE}
            />
            <TimelineItem
              icon={icon(I.truck)}
              tone="success"
              connector="accent"
              title="Shipped"
              description="Parcel SH-48213"
              time="Oct 28, 08:05"
              dateTime="2026-10-28T08:05"
              locale={DEMO_LOCALE}
            />
            <TimelineItem
              icon={icon(I.map)}
              tone="accent"
              current
              connector="dashed"
              title="Out for delivery"
              description="Arriving by 6 pm"
              time="Today, 07:30"
              dateTime="2026-10-30T07:30"
              locale={DEMO_LOCALE}
            />
            <TimelineItem icon={icon(I.home)} title="Delivered" description="Expected today" />
          </Timeline>
        </GlassCard>
      </Example>

      <Example
        title="Alternate (changelog)"
        description="Wide containers zig-zag around a centered rail with dates on the opposite side; narrow ones fall back to a list."
        code={timelineAltCode}
      >
        <Timeline layout="alternate" aria-label="Changelog" className="max-w-3xl">
          <TimelineItem
            icon={icon(I.sparkle)}
            tone="accent"
            title={
              <span className="inline-flex flex-wrap items-center gap-2">
                <b>v2.14</b>
                <Badge tone="accent">Latest</Badge>
              </span>
            }
            time="Oct 2026"
            dateTime="2026-10-20"
            locale={DEMO_LOCALE}
            description="Liquid glass, layout components and a reduced-transparency mode that keeps every surface readable."
          />
          <TimelineItem
            icon={icon(I.tag)}
            title={<b>v2.13</b>}
            time="Sep 2026"
            dateTime="2026-09-14"
            locale={DEMO_LOCALE}
            description="Twenty new charts with table views, keyboard tooltips and color-blind-safe slots."
          />
          <TimelineItem
            icon={icon(I.tag)}
            title={<b>v2.12</b>}
            time="Aug 2026"
            dateTime="2026-08-02"
            locale={DEMO_LOCALE}
            description="Command palette, menus and a menubar with full keyboard support."
          />
          <TimelineItem
            icon={icon(I.tag)}
            title={<b>v2.11</b>}
            time="Jul 2026"
            dateTime="2026-07-09"
            locale={DEMO_LOCALE}
            description="Data table: sorting, filters, selection, CSV export."
          />
        </Timeline>
      </Example>

      <PropsTable
        title="Timeline"
        of={PROPS.Timeline}
        rows={[["aria-label", "string", "", "Sets the name of the list, e.g. “Activity”."]]}
      />
      <PropsTable title="TimelineItem" as="h3" of={PROPS.TimelineItem} />
      <PropsTable title="TimelineHeading" as="h3" of={PROPS.TimelineHeading} />
      <KeyboardTable
        rows={[
          ["Tab", "Not focusable: the list is not focusable. Links and buttons inside items are normal tab stops."],
        ]}
      />
      <A11yNotes
        items={[
          "An ordered list (<ol>): pass aria-label. Timestamps are <time dateTime> when you give dateTime.",
          'The live step has aria-current="step"; markers and connector lines are decorative, so state is also written in words.',
          "Marker pop and line draw do not run under reduced motion.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Separator
 * ===================================================================== */

const separatorVariantsCode = `
import { Separator } from "@sheenui/theme";

export function Example() {
  return (
    <>
      {/* "line" is a hairline, "fade" fades out at both ends */}
      {(["line", "fade", "dashed"] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-xs">variant="{variant}"</span>
          <Separator variant={variant} />
        </div>
      ))}

      <div className="flex h-5 items-center gap-3">
        <a href={"/docs"}>Docs</a>
        <Separator orientation="vertical" />
        <a href={"/blog"}>Blog</a>
        <Separator orientation="vertical" variant="fade" />
        <a href={"/changelog"}>Changelog</a>
      </div>
    </>
  );
}`;

const separatorLabelCode = `
import { Button, Input, Separator } from "@sheenui/theme";
import { Code as GithubIcon, Globe as GoogleIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <Button variant="glass" fullWidth leading={<GoogleIcon />}>Continue with Google</Button>
      <Button variant="glass" fullWidth leading={<GithubIcon />}>Continue with GitHub</Button>
      <Separator label="or" variant="fade" />
      <Input label="Email" type="email" />

      <Separator label="Today" labelVariant="pill" />
      <Separator label="Advanced" labelAlign="start" />
    </>
  );
}`;

/** The "Separator" docs page (/layout/separator): live examples, props and notes. */
export function SeparatorPage() {
  const link = cn(
    "relative rounded-sheen-sm text-sm font-medium text-sheen-fg-muted hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
    // 44px hit area on touch screens, without changing the 20px row.
    "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-full any-pointer-coarse:after:min-h-11 any-pointer-coarse:after:min-w-11 any-pointer-coarse:after:-translate-1/2",
  );
  return (
    <Page
      eyebrow="Layout"
      title="Separator"
      description="A hairline between groups of content: horizontal or vertical, solid, fading or dashed, with an optional label. Lines are borders, so they survive Windows High Contrast."
      source="theme/src/components/separator/separator.tsx"
    >
      <ShowcaseStage<SeparatorSceneData>
        label="Separator demo"
        story={() => import("../layout/ShowcaseStage.separator")}
        initial={{ phase: 0 }}
        minHeight="21rem"
      >
        {(scene, ctx) => <SeparatorScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Variants and orientation"
        description="Vertical separators stretch to the height of their row."
        code={separatorVariantsCode}
      >
        <GlassCard className="flex w-full max-w-lg flex-col gap-6 p-6">
          {(["line", "fade", "dashed"] as const).map((variant) => (
            <div key={variant} className="flex flex-col gap-2">
              <span className="font-sheen-mono text-xs text-sheen-fg-muted">variant="{variant}"</span>
              <Separator variant={variant} />
            </div>
          ))}
          <div className="flex h-5 flex-wrap items-center gap-3">
            <DemoLink to="/docs" className={link}>
              Docs
            </DemoLink>
            <Separator orientation="vertical" />
            <DemoLink to="/blog" className={link}>
              Blog
            </DemoLink>
            <Separator orientation="vertical" variant="fade" />
            <DemoLink to="/changelog" className={link}>
              Changelog
            </DemoLink>
          </div>
        </GlassCard>
      </Example>

      <Example
        title="Labeled"
        description="A label in the middle (“or”), in a glass pill, or at the start of the line. Screen readers hear the label as the separator's name."
        code={separatorLabelCode}
      >
        <div className="flex w-full flex-wrap items-start justify-center gap-6">
          <GlassCard className="flex w-full max-w-sm flex-col gap-4 p-6">
            <Button variant="glass" fullWidth leading={icon(I.google, "size-4")}>
              Continue with Google
            </Button>
            <Button variant="glass" fullWidth leading={icon(I.github, "size-4")}>
              Continue with GitHub
            </Button>
            <Separator label="or" variant="fade" />
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Button fullWidth>Continue with email</Button>
          </GlassCard>
          <GlassCard className="flex w-full max-w-sm flex-col gap-6 p-6">
            <Separator label="Today" labelVariant="pill" />
            <p className="text-sm text-sheen-fg-muted">Three new messages from the design team.</p>
            <Separator label="Advanced" labelAlign="start" />
            <p className="text-sm text-sheen-fg-muted">Experimental options live below this line.</p>
            <Separator label="End of results" labelAlign="end" variant="dashed" />
          </GlassCard>
        </div>
      </Example>

      <PropsTable title="Separator" of={PROPS.Separator} />
      <KeyboardTable rows={[["Tab", "Not focusable: a separator is not interactive."]]} />
      <A11yNotes
        items={[
          'role="separator" with the matching orientation; a separator with a label keeps its text readable and its children are presentational to assistive tech.',
          "Use a decorative separator only to group visually; it does not replace headings or landmarks.",
        ]}
      />
    </Page>
  );
}

/** The "Scroll area" docs page (/layout/scroll-area): live examples, props and notes. */
export function ScrollAreaPage() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const regions = [
    "Amsterdam",
    "Bengaluru",
    "Cape Town",
    "Dublin",
    "Frankfurt",
    "Jakarta",
    "London",
    "Montréal",
    "Mumbai",
    "Oregon",
    "Osaka",
    "Paris",
    "São Paulo",
    "Seoul",
    "Singapore",
    "Stockholm",
    "Sydney",
    "Tokyo",
    "Virginia",
    "Zürich",
  ];
  return (
    <Page
      eyebrow="Layout"
      title="Scroll area"
      description="Native scrolling (wheel, touch, keyboard, find-in-page) with slim glass scrollbars that appear when you need them, and edges that fade only where there is more to see."
      source="theme/src/components/scroll-area/scroll-area.tsx"
    >
      <ShowcaseStage<ScrollAreaSceneData>
        label="Scroll area demo"
        story={() => import("../layout/ShowcaseStage.scroll-area")}
        initial={{ at: 0 }}
        minHeight="19rem"
      >
        {(scene, ctx) => <ScrollAreaScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Vertical"
        description="The top edge stays crisp until you scroll; the bottom fades while there is more. Tab to the list and use the arrow keys."
        code={scrollVerticalCode}
      >
        <GlassCard className="w-full max-w-sm overflow-hidden p-0">
          <h3 id="release-notes" className="border-b border-sheen-border px-5 py-3.5 text-sm font-semibold">
            Release notes
          </h3>
          <ScrollArea className="h-72 rounded-b-sheen-lg" label="Release notes">
            <ul className="flex flex-col px-5 py-2">
              {releases.map((r) => (
                <li
                  key={r.version}
                  className="flex items-baseline justify-between gap-4 border-b border-sheen-border py-2.5 text-sm last:border-0"
                >
                  <span className="text-sheen-fg">{r.note}</span>
                  <span className="shrink-0 font-sheen-mono text-xs text-sheen-fg-muted">{r.version}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </GlassCard>
      </Example>

      <Example
        title="Horizontal, with glass inside"
        description="Scroll shadows instead of a mask, so the cards keep their blur."
        code={scrollHorizontalCode}
      >
        <ScrollArea orientation="horizontal" fade="shadow" label="Recently viewed" className="w-full rounded-sheen-lg">
          <ul className="flex w-max gap-3 p-1">
            {viewed.map((name, i) => (
              <li key={name}>
                <GlassCard level={1} className="flex w-44 flex-col gap-3 p-4">
                  <span
                    aria-hidden
                    className="h-20 rounded-sheen-md opacity-80"
                    style={{ background: `var(--sheen-chart-${(i % 8) + 1})` }}
                  />
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-sheen-fg-muted">Theme · {12 + i * 3} components</span>
                </GlassCard>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </Example>

      <Example
        title="Both directions"
        description='A wide table in a fixed box. scrollbars="always" keeps the bars visible.'
        code={scrollBothCode}
      >
        <GlassCard className="w-full max-w-2xl overflow-hidden p-0">
          <ScrollArea orientation="both" className="h-80 rounded-sheen-lg" scrollbars="always" label="Usage by region">
            <table className="w-max text-start [:where(&)_th]:text-start text-sm">
              <thead className="text-xs text-sheen-fg-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Region
                  </th>
                  {months.map((m) => (
                    <th key={m} scope="col" className="px-4 py-3 text-end font-medium">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regions.map((region, r) => (
                  <tr key={region} className="border-t border-sheen-border">
                    <th scope="row" className="px-4 py-2.5 font-medium whitespace-nowrap">
                      {region}
                    </th>
                    {months.map((m, c) => (
                      <td key={m} className="px-4 py-2.5 text-end text-sheen-fg-muted tabular-nums">
                        {(((r + 3) * (c + 7) * 37) % 900) + 100}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </GlassCard>
      </Example>

      <PropsTable title="ScrollArea" of={PROPS.ScrollArea} />
      <KeyboardTable
        rows={[
          ["Arrow keys, Page Up / Page Down, Home / End, Space", "Scroll the focused area natively."],
          ["Tab", "The viewport is focusable only while it can scroll, so keyboard users can reach it."],
        ]}
      />
      <A11yNotes
        items={[
          'Scrolling stays native (wheel, touch, keys, find-in-page); the viewport gets a name from label and role="region".',
          "Scrollbars appear on hover, while scrolling and while the viewport has keyboard focus; the focus ring is drawn inside the edge.",
          'The edge fades are decorative. Use fade="shadow" when glass cards sit inside, so their blur is not masked.',
        ]}
      />
    </Page>
  );
}

/** The Toolbar page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const ToolbarPage = lazyBlock(() => import("./ToolbarPageBody").then((m) => m.ToolbarPage), island);
