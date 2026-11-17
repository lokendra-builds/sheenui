import { Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { SidebarScene } from "./ShowcaseStage.sidebar";

const Dot = () => (
  <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5.5" />
  </svg>
);

const NAMES = { alpha: "Alpha", beta: "Beta", gamma: "Gamma" } as const;

/** The live Sidebar on its stage: the active item moves, and the sidebar morphs to a rail and back. */
export function SidebarScene({ scene }: { scene: SidebarScene; ctx: StageContext }) {
  const [active, setActive] = useFollow<string>(scene.active);
  const [collapsed, setCollapsed] = useFollow(scene.collapsed);
  return (
    <div className="h-60 w-full">
      <Sidebar morph collapsed={collapsed} aria-label="Workspace preview">
        <SidebarGroup label="Projects">
          {(Object.keys(NAMES) as (keyof typeof NAMES)[]).map((id) => (
            <SidebarItem
              key={id}
              href={`#${id}`}
              active={active === id}
              icon={<Dot />}
              badge={id === "beta" ? "3" : undefined}
              onClick={(event) => {
                event.preventDefault();
                setActive(id);
              }}
            >
              {NAMES[id]}
            </SidebarItem>
          ))}
        </SidebarGroup>
        <SidebarItem onClick={() => setCollapsed((c) => !c)} icon={<Dot />}>
          {collapsed ? "Expand" : "Collapse"}
        </SidebarItem>
      </Sidebar>
    </div>
  );
}
