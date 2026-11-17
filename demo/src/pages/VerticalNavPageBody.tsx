import { useState } from "react";
import { Avatar, GlassCard, SheenLogo, Switch, VerticalNav, type VerticalNavSection } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { VerticalScene as VerticalSceneData } from "../layout/ShowcaseStage.vertical";
import { VerticalScene } from "../layout/ShowcaseStage.vertical.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

const i = (d: string) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-[1.1rem]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const sections: VerticalNavSection[] = [
  {
    title: "Workspace",
    items: [
      { value: "home", label: "Home", icon: i("M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z") },
      { value: "inbox", label: "Inbox", icon: i("M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z"), badge: 12 },
      { value: "projects", label: "Projects", icon: i("M3 7h7l2 2h9v10H3z") },
      { value: "analytics", label: "Analytics", icon: i("M4 20V10M10 20V4M16 20v-7M22 20H2") },
    ],
  },
  {
    title: "Account",
    items: [
      {
        value: "team",
        label: "Team",
        icon: i(
          "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-3-3M17 5.5a3 3 0 0 1 0 5",
        ),
      },
      { value: "billing", label: "Billing", icon: i("M3 6h18v12H3zM3 10h18") },
      {
        value: "settings",
        label: "Settings",
        icon: i(
          "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12l2-1-2-4-2 .5-1.5-1.5.5-2-4-2-1 2h-2l-1-2-4 2 .5 2L5 6.5 3 7l-2 4 2 1v2l-2 1 2 4 2-.5 1.5 1.5-.5 2 4 2 1-2h2l1 2 4-2-.5-2 1.5-1.5 2 .5 2-4-2-1z",
        ),
      },
    ],
  },
];

const labels = Object.fromEntries(sections.flatMap((s) => s.items.map((item) => [item.value, item.label])));

/** The page beside the sidebar: its name, so a click on an item visibly goes somewhere (decorative, not part of the component). */
function PageBeside({ title }: { title: string | undefined }) {
  return (
    <GlassCard level={2} sheen={false} className="min-w-0 flex-1 self-start px-5 py-4">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    </GlassCard>
  );
}

/** The "Vertical nav" docs page (/navigation/vertical-nav): live examples, props and notes. */
export function VerticalNavPage() {
  const [value, setValue] = useState("inbox");
  const [collapsed, setCollapsed] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");

  return (
    <Page
      eyebrow="Navigation"
      title="Vertical nav"
      description="A glass sidebar with grouped items, icons and counts. The active highlight slides between items, and collapsed mode turns it into an icon rail with tooltips."
      source="theme/src/components/vertical-nav/vertical-nav.tsx"
    >
      <ShowcaseStage<VerticalSceneData>
        label="Vertical nav demo"
        story={() => import("../layout/ShowcaseStage.vertical")}
        initial={{ page: "home", unread: 12 }}
        minHeight="22rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <VerticalScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Sidebar and icon rail"
        description="Click items to watch the highlight slide; toggle the rail. On a phone, collapse it to see the page beside it."
        frame={`example.com/${value}`}
        stageClassName="h-[34rem] gap-3 sm:gap-4"
        controls={
          <Switch
            checked={collapsed}
            onCheckedChange={setCollapsed}
            label="Icon rail"
            description="Collapse to icons; labels become tooltips."
          />
        }
        code={`
import { useState } from "react";
import { Avatar, GlassCard, SheenLogo, VerticalNav, type VerticalNavSection } from "@sheenui/theme";

// Inline 24px line icons: use any icon set (for example lucide-react) instead.
const icon = (d: string) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const sections: VerticalNavSection[] = [
  {
    title: "Workspace",
    items: [
      { value: "home", label: "Home", icon: icon("M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z") },
      { value: "inbox", label: "Inbox", icon: icon("M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z"), badge: 12 },
      { value: "projects", label: "Projects", icon: icon("M3 7h7l2 2h9v10H3z") },
      { value: "analytics", label: "Analytics", icon: icon("M4 20V10M10 20V4M16 20v-7M22 20H2") },
    ],
  },
  {
    title: "Account",
    items: [
      { value: "team", label: "Team", icon: icon("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-3-3M17 5.5a3 3 0 0 1 0 5") },
      { value: "billing", label: "Billing", icon: icon("M3 6h18v12H3zM3 10h18") },
      { value: "settings", label: "Settings", icon: icon("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12l2-1-2-4-2 .5-1.5-1.5.5-2-4-2-1 2h-2l-1-2-4 2 .5 2L5 6.5 3 7l-2 4 2 1v2l-2 1 2 4 2-.5 1.5 1.5-.5 2 4 2 1-2h2l1 2 4-2-.5-2 1.5-1.5 2 .5 2-4-2-1z") },
    ],
  },
];

const labels = Object.fromEntries(sections.flatMap((s) => s.items.map((item) => [item.value, item.label])));

export function Example() {
  const [value, setValue] = useState("inbox");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex gap-4">
      <VerticalNav
        aria-label="Workspace"
        collapsed={collapsed}
        header={<SheenLogo px={28} variant={collapsed ? "mark" : "full"} glow={false} />}
        sections={sections}
        value={value}
        onValueChange={setValue}
        footer={
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name="Ada Lovelace" size="sm" status="online" />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">Ada</span>
                <span className="block truncate text-xs text-sheen-fg-muted">Pro plan</span>
              </span>
            )}
          </div>
        }
      />
      <GlassCard level={2} sheen={false} className="min-w-0 flex-1 self-start px-5 py-4">
        <h3 className="text-lg font-semibold tracking-tight">{labels[value]}</h3>
        <button onClick={() => setCollapsed((c) => !c)}>Toggle icon rail</button>
      </GlassCard>
    </div>
  );
}`}
      >
        <VerticalNav
          aria-label="Example sidebar"
          collapsed={collapsed}
          className="shrink-0"
          header={<SheenLogo px={28} variant={collapsed ? "mark" : "full"} glow={false} />}
          sections={sections}
          value={value}
          onValueChange={setValue}
          footer={
            <div className="flex items-center gap-2.5 px-1">
              <Avatar name="Ada Lovelace" size="sm" status="online" />
              {!collapsed && (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">Ada</span>
                  <span className="block truncate text-xs text-sheen-fg-muted">Pro plan</span>
                </span>
              )}
            </div>
          }
        />

        <PageBeside title={labels[value]} />
      </Example>

      <Example
        title="Text only, for settings"
        description="Icons, titles and the header are all optional. A badge still counts things to look at."
        stageClassName="min-h-72"
        code={`
import { useState } from "react";
import { VerticalNav } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState("profile");

  return (
    <VerticalNav
      aria-label="Settings"
      value={value}
      onValueChange={setValue}
      sections={[
        {
          items: [
            { value: "profile", label: "Profile" },
            { value: "security", label: "Security" },
            { value: "notifications", label: "Notifications", badge: 3 },
            { value: "billing", label: "Billing" },
          ],
        },
      ]}
    />
  );
}`}
      >
        <VerticalNav
          aria-label="Settings"
          value={settingsTab}
          onValueChange={setSettingsTab}
          sections={[
            {
              items: [
                { value: "profile", label: "Profile" },
                { value: "security", label: "Security" },
                { value: "notifications", label: "Notifications", badge: 3 },
                { value: "billing", label: "Billing" },
              ],
            },
          ]}
        />
      </Example>

      <PropsTable of={PROPS.VerticalNav} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move between items; a normal list of links and buttons."],
          ["Enter / Space", "Follow a link or select an item."],
        ]}
      />
      <A11yNotes
        items={[
          'A <nav> with a list; the current item has aria-current="page". Name the nav with aria-label.',
          "In the icon rail every item keeps its text as an accessible name and shows it in a tooltip on hover and focus.",
          "Under reduced motion the rail snaps open and shut in one frame.",
        ]}
      />
    </Page>
  );
}
