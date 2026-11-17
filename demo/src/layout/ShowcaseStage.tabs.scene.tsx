import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { TabsScene } from "./ShowcaseStage.tabs";

const ORDER = ["overview", "activity", "billing"] as const;
type Tab = TabsScene["tab"];
type Trail = { n: number; x: number; w: number; dir: "left" | "right" };

/** The live Tabs on their stage: a light follows the active tab and a comet of light travels between tabs. */
export function TabsScene({ scene }: { scene: TabsScene; ctx: StageContext }) {
  const [tab, setTab] = useFollow(scene.tab);
  const [count] = useFollow(scene.count);
  const [under, setUnder] = useState<{ x: number; w: number } | null>(null);
  const [trail, setTrail] = useState<Trail | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const prev = useRef<Tab>(scene.tab);

  // Measure the active tab (and, when it changed, the span from the old one) after layout.
  useLayoutEffect(() => {
    const node = bar.current;
    if (!node) return;
    const measure = () => {
      const tabs = [...node.querySelectorAll<HTMLElement>("[role=tab]")];
      const box = node.getBoundingClientRect();
      const at = (name: Tab) => {
        const r = tabs[ORDER.indexOf(name)]?.getBoundingClientRect();
        return r ? { x: r.left - box.left, w: r.width } : null;
      };
      const now = at(tab);
      if (now) setUnder(now);
      return { now, before: at(prev.current) };
    };
    const { now, before } = measure();
    if (prev.current !== tab && now && before) {
      const lo = Math.min(now.x, before.x);
      const hi = Math.max(now.x + now.w, before.x + before.w);
      setTrail((t) => ({ n: (t?.n ?? 0) + 1, x: lo, w: hi - lo, dir: now.x > before.x ? "right" : "left" }));
    }
    prev.current = tab;
    const ro = new ResizeObserver(() => measure());
    ro.observe(node);
    return () => ro.disconnect();
  }, [tab]);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="w-full">
      <div ref={bar} className="sheen-stage-tabsbar">
        <TabsList aria-label="Project">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="activity">
            Activity{" "}
            <span key={count} className="sheen-stage-badge" data-pop={count > 2 ? "" : undefined}>
              {count}
            </span>
          </TabsTab>
          <TabsTab value="billing">Billing</TabsTab>
        </TabsList>
        {under ? (
          <span
            aria-hidden
            className="sheen-stage-under"
            style={{ width: under.w, transform: `translateX(${under.x}px)` }}
          />
        ) : null}
        {trail ? (
          <span
            key={trail.n}
            aria-hidden
            className="sheen-stage-trail"
            data-dir={trail.dir}
            style={{ width: trail.w, "--trail-x": `${trail.x}px` } as CSSProperties}
          />
        ) : null}
      </div>
      <TabsPanel value="overview" className="sheen-stage-panel">
        <p className="sheen-stage-sub">Visits 12.4k (+8.2%), signups 684 (+3.1%), uptime 99.98%.</p>
      </TabsPanel>
      <TabsPanel value="activity" className="sheen-stage-panel">
        <ul className="sheen-stage-feed">
          {["Maya merged the redesign", "Deploy to production passed", "Usage passed 80% of the plan"].map((t, i) => (
            <li key={t} style={{ "--i": i } as CSSProperties}>
              {t}
            </li>
          ))}
        </ul>
      </TabsPanel>
      <TabsPanel value="billing" className="sheen-stage-panel">
        <p className="sheen-stage-sub">Team plan, $24 / month. Next invoice Dec 1.</p>
      </TabsPanel>
    </Tabs>
  );
}
