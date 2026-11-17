import { useState } from "react";
import { Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";

import { SidebarPhone, sidebarPhoneCode } from "./PrimitiveExamples";
import { SidebarShell, sidebarShellCode } from "./PrimitiveShowcases";
import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { SidebarScene as SidebarSceneData } from "../layout/ShowcaseStage.sidebar";
import { SidebarScene } from "../layout/ShowcaseStage.sidebar.scene";
import { Example } from "../layout/Example";
import * as PROPS from "../generated/component-props";

const curvedCode = `import { useState } from "react";
import { Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";

function Dot() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}

export function CurvedSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-96">
      <Sidebar shape="curved" morph collapsed={collapsed} aria-label="Workspace">
        <SidebarGroup label="Projects">
          <SidebarItem href="#alpha" active icon={<Dot />}>
            Alpha
          </SidebarItem>
          <SidebarItem href="#beta" icon={<Dot />} badge="3">
            Beta
          </SidebarItem>
          <SidebarItem href="#gamma" icon={<Dot />}>
            Gamma
          </SidebarItem>
        </SidebarGroup>
        <SidebarItem onClick={() => setCollapsed((c) => !c)} icon={<Dot />}>
          {collapsed ? "Expand" : "Collapse"}
        </SidebarItem>
      </Sidebar>
    </div>
  );
}`;

function Dot() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}

function CurvedSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-96">
      <Sidebar shape="curved" morph collapsed={collapsed} aria-label="Workspace">
        <SidebarGroup label="Projects">
          <SidebarItem href="#alpha" active icon={<Dot />}>
            Alpha
          </SidebarItem>
          <SidebarItem href="#beta" icon={<Dot />} badge="3">
            Beta
          </SidebarItem>
          <SidebarItem href="#gamma" icon={<Dot />}>
            Gamma
          </SidebarItem>
        </SidebarGroup>
        <SidebarItem onClick={() => setCollapsed((c) => !c)} icon={<Dot />}>
          {collapsed ? "Expand" : "Collapse"}
        </SidebarItem>
      </Sidebar>
    </div>
  );
}

/** The "Sidebar" docs page (/navigation/sidebar). */
export function SidebarPage() {
  return (
    <Page
      eyebrow="Navigation"
      title="Sidebar"
      description="The app-shell sidebar: a glass column with a header, groups of links that fold open and shut, a footer, and an icon-rail mode."
      source="theme/src/components/sidebar/sidebar.tsx"
      keyboard={[
        ["Tab", "Moves through group headings and items in order."],
        ["Enter / Space", "Opens or closes a focused group heading; follows a link or presses a button item."],
      ]}
      a11y={[
        'A <nav> landmark (aria-label defaults to "Sidebar"; change it when a page has more than one).',
        'Group headings are buttons with aria-expanded; closed items leave the tab order. The current page uses aria-current="page".',
        "In the collapsed rail the labels stay as accessible names and as title tooltips; the icons are decorative.",
        "Targets are 44px on touch screens. Under reduced motion the groups jump open and shut.",
      ]}
    >
      <ShowcaseStage<SidebarSceneData>
        label="Sidebar demo"
        story={() => import("../layout/ShowcaseStage.sidebar")}
        initial={{ active: "alpha", collapsed: false }}
        minHeight="26rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <SidebarScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="A full app shell"
        description="Sidebar with groups and badges, a header with search and actions, stat cards and an activity list. Use Collapse to turn the sidebar into an icon rail; VerticalNav is the shorter choice for a flat list of sections."
        code={sidebarShellCode}
        stageClassName="items-start"
      >
        <SidebarShell />
      </Example>
      <Example
        title="A curved glass sheet"
        description='shape="curved" bows the trailing edge outward (the inline-end edge, so it flips in right-to-left layouts). The curve is the glass element&apos;s own corner radii, so the blur, the lit rim and the shadow follow it, and a soft light sits on the apex. With morph and the collapse item the rail bows more gently. Reduced transparency, more contrast and forced colours fall back to a plain rectangle.'
        code={curvedCode}
      >
        <CurvedSidebar />
      </Example>
      <PropsTable title="Sidebar props" of={PROPS.Sidebar} />
      <Example
        title="On phones"
        description='The sidebar is a column, so on a narrow screen put the same Sidebar inside a Drawer that opens from the left (side="start" follows the reading direction) and give the page a Menu button. Keep the in-layout Sidebar for lg and up.'
        code={sidebarPhoneCode}
      >
        <SidebarPhone />
      </Example>
      <PropsTable of={PROPS.SidebarGroup} title="SidebarGroup props" as="h3" />
      <PropsTable of={PROPS.SidebarItem} title="SidebarItem props" as="h3" />
      <PropsTable
        title="Other parts"
        as="h3"
        rows={[
          ["SidebarHeader / SidebarFooter", "div props", "", "Top and bottom areas; the footer is pushed down."],
          [
            "useSidebar()",
            "{ collapsed: boolean }",
            "",
            "Read the collapsed state from custom header or footer content.",
          ],
        ]}
      />
    </Page>
  );
}
