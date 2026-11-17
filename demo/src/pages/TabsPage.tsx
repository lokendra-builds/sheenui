import { useState } from "react";
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { TabsScene as TabsSceneData } from "../layout/ShowcaseStage.tabs";
import { TabsScene } from "../layout/ShowcaseStage.tabs.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { Icon } from "./TextEffectsPages/shared";

const panels = [
  ["overview", "Overview", "Workspace stats and recent activity."],
  ["projects", "Projects", "Milestones, owners and deadlines."],
  ["settings", "Settings", "Profile, billing and preferences."],
] as const;

const manyTabs = ["Overview", "Projects", "Members", "Billing", "Integrations", "Security", "Settings"];

const HomeIcon = () => (
  <Icon>
    <path d="m3 11 9-7 9 7" />
    <path d="M5 10v10h14V10" />
  </Icon>
);
const FolderIcon = () => (
  <Icon>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </Icon>
);
const GearIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </Icon>
);

/** The "Tabs" docs page (/components/tabs): live examples, props and notes. */
export function TabsPage() {
  const [tab, setTab] = useState("overview");
  return (
    <Page
      eyebrow="Component"
      title="Tabs"
      description="A glass track with a pill that slides to the active tab. The slide is pure CSS, driven by Base UI's indicator variables. Arrow keys move between tabs, and a track that runs out of room scrolls instead of clipping."
      source="theme/src/components/tabs/tabs.tsx"
    >
      <ShowcaseStage<TabsSceneData>
        label="Tabs demo"
        story={() => import("../layout/ShowcaseStage.tabs")}
        initial={{ tab: "overview", count: 2 }}
        minHeight="23rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <TabsScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Basic"
        stageClassName="min-h-64 items-start"
        // Signature motion, once in view: the pill slides tab to tab and comes home (no focus moves).
        autoplay={() => {
          const timers = ["projects", "settings", "overview"].map((value, i) =>
            window.setTimeout(() => setTab(value), 700 + i * 850),
          );
          return () => {
            timers.forEach((t) => window.clearTimeout(t));
            setTab("overview");
          };
        }}
        code={`
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const panels = [
  ["overview", "Overview", "Workspace stats and recent activity."],
  ["projects", "Projects", "Milestones, owners and deadlines."],
  ["settings", "Settings", "Profile, billing and preferences."],
] as const;

export function Example() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        {panels.map(([value, label]) => (
          <TabsTab key={value} value={value}>
            {label}
          </TabsTab>
        ))}
      </TabsList>
      {panels.map(([value, label, body]) => (
        <TabsPanel key={value} value={value}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}`}
      >
        <Tabs value={tab} onValueChange={(value) => setTab(String(value))} className="w-full max-w-md">
          <TabsList>
            {panels.map(([value, label]) => (
              <TabsTab key={value} value={value}>
                {label}
              </TabsTab>
            ))}
          </TabsList>
          {panels.map(([value, label, body]) => (
            <TabsPanel key={value} value={value}>
              <GlassCard level={2} className="p-5">
                <h3 className="font-semibold">{label}</h3>
                <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
              </GlassCard>
            </TabsPanel>
          ))}
        </Tabs>
      </Example>

      <Example
        title="More tabs than room"
        description="When the tabs don't fit, the track scrolls sideways instead of clipping: swipe or shift-scroll it, and tabs snap into place. The edges fade only where more tabs are hiding, and choosing a tab (or arrowing to it) scrolls it fully into view. The pill stays on its tab while the track scrolls."
        stageClassName="min-h-56 items-start"
        code={`
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const manyTabs = ["Overview", "Projects", "Members", "Billing", "Integrations", "Security", "Settings"];

export function Example() {
  // Nothing to configure: TabsList scrolls on its own when it overflows.

  return (
    <Tabs defaultValue="billing" className="w-full max-w-xs">
      <TabsList aria-label="Workspace">
        {manyTabs.map((label) => (
          <TabsTab key={label} value={label.toLowerCase()}>
            {label}
          </TabsTab>
        ))}
      </TabsList>
      {manyTabs.map((label) => (
        <TabsPanel key={label} value={label.toLowerCase()}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">The {label.toLowerCase()} panel.</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}`}
      >
        <Tabs defaultValue="billing" className="w-full max-w-xs">
          <TabsList aria-label="Workspace">
            {manyTabs.map((label) => (
              <TabsTab key={label} value={label.toLowerCase()}>
                {label}
              </TabsTab>
            ))}
          </TabsList>
          {manyTabs.map((label) => (
            <TabsPanel key={label} value={label.toLowerCase()}>
              <GlassCard level={2} className="p-5">
                <h3 className="font-semibold">{label}</h3>
                <p className="mt-1 text-sm text-sheen-fg-muted">The {label.toLowerCase()} panel.</p>
              </GlassCard>
            </TabsPanel>
          ))}
        </Tabs>
      </Example>

      <Example
        title="Morphing tabs"
        description="With morph on TabsList, tabs that carry an icon collapse to just the icon, and the active tab grows to reveal its label as the pill glides over. Tabs without an icon keep their label."
        stageClassName="min-h-48 items-start"
        code={`
import { Folder as FolderIcon, House as HomeIcon, Settings as GearIcon } from "lucide-react";
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const panels = [
  ["overview", "Overview", "Workspace stats and recent activity."],
  ["projects", "Projects", "Milestones, owners and deadlines."],
  ["settings", "Settings", "Profile, billing and preferences."],
] as const;

export function Example() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList morph aria-label="Workspace">
        <TabsTab value="overview" icon={<HomeIcon />}>
          Overview
        </TabsTab>
        <TabsTab value="projects" icon={<FolderIcon />}>
          Projects
        </TabsTab>
        <TabsTab value="settings" icon={<GearIcon />}>
          Settings
        </TabsTab>
      </TabsList>
      {panels.map(([value, label, body]) => (
        <TabsPanel key={value} value={value}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}`}
      >
        <Tabs defaultValue="overview" className="w-full max-w-md">
          <TabsList morph aria-label="Workspace">
            <TabsTab value="overview" icon={<HomeIcon />}>
              Overview
            </TabsTab>
            <TabsTab value="projects" icon={<FolderIcon />}>
              Projects
            </TabsTab>
            <TabsTab value="settings" icon={<GearIcon />}>
              Settings
            </TabsTab>
          </TabsList>
          {panels.map(([value, label, body]) => (
            <TabsPanel key={value} value={value}>
              <GlassCard level={2} className="p-5">
                <h3 className="font-semibold">{label}</h3>
                <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
              </GlassCard>
            </TabsPanel>
          ))}
        </Tabs>
      </Example>

      <PropsTable
        rows={[
          ["Tabs value / defaultValue", "string", "", "Sets the active tab (controlled or uncontrolled)."],
          ["Tabs onValueChange", "(value) => void", "", "Called when the active tab changes."],
          [
            "TabsList className",
            "string",
            "",
            "Styles the glass track. Other props (aria-label, activateOnFocus, ...) go to the tablist itself.",
          ],
          [
            "TabsList activateOnFocus",
            "boolean",
            "false",
            "Activate tabs as arrow keys move focus (otherwise Enter / Space).",
          ],
          [
            "TabsList morph",
            "boolean",
            "false",
            "Tabs with an icon collapse to just the icon; the active tab grows to show its label.",
          ],
          ["TabsTab value", "string", "", "Matches a TabsPanel value."],
          [
            "TabsTab icon",
            "ReactNode",
            "",
            "A decorative glyph before the label (aria-hidden). With morph on the list, the label shows only while the tab is active.",
          ],
          ["TabsTab disabled", "boolean", "false", "Disables this tab so it cannot be selected."],
          ["TabsPanel value", "string", "", "Shown when its tab is active."],
          [
            "Tabs ...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example orientation, style, className, render).",
          ],
          [
            "TabsList ...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example style, render, loopFocus).",
          ],
          [
            "TabsTab ...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example style, className, render, nativeButton).",
          ],
          [
            "TabsPanel ...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example style, className, render, keepMounted).",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab", "Enter the tab list once (on the active tab); the next Tab moves to the panel."],
          ["Arrow Left / Arrow Right", "Move focus between tabs (Arrow Up / Down when vertical)."],
          ["Home / End", "Jump to the first or last tab."],
          ["Enter / Space", "Activate the focused tab (set activateOnFocus on TabsList to activate as focus moves)."],
        ]}
      />
      <A11yNotes
        items={[
          'role="tablist", tab and tabpanel with aria-selected and aria-controls from Base UI; name the list with aria-label.',
          "When the tabs do not fit, the list scrolls sideways and a focused tab is scrolled into view.",
          "The gliding pill is decorative: the active tab is announced through aria-selected. Under reduced motion the pill jumps instead of sliding.",
        ]}
      />
    </Page>
  );
}
