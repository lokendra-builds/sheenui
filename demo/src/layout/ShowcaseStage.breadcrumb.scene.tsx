import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";

import { DemoLink, I, demoHref, icon } from "../pages/LayoutPages/shared";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { BreadcrumbScene } from "./ShowcaseStage.breadcrumb";

const TRAIL: BreadcrumbItem[] = [
  { id: "home", label: "Home", href: demoHref("/layout/breadcrumb"), icon: icon(I.home), iconOnly: true },
  { id: "library", label: "Library", href: demoHref("/layout/breadcrumb") },
  { id: "design-systems", label: "Design systems", href: demoHref("/layout/breadcrumb") },
  { id: "sheenui", label: "SheenUI", href: demoHref("/layout/breadcrumb") },
  { id: "tokens", label: "Tokens", href: demoHref("/layout/breadcrumb") },
  { id: "colors", label: "Colors" },
];

/** The live Breadcrumb on its stage: a long trail keeps the first and the last items and folds the middle. */
export function BreadcrumbScene({ scene }: { scene: BreadcrumbScene; ctx: StageContext }) {
  const [depth] = useFollow(scene.depth);
  // The last item of the visible trail is the current page.
  const items = TRAIL.slice(0, depth).map((item, i, all) =>
    i === all.length - 1 ? { ...item, href: undefined } : item,
  );
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Breadcrumb
        items={items}
        maxItems={4}
        variant="glass"
        renderLink={(item) => <DemoLink to={item.href ?? "#"} />}
        labels={{ nav: "Breadcrumb demo" }}
      />
      <p className="sheen-stage-sub">{depth > 4 ? "The middle folds into a menu." : "Four items fit."}</p>
    </div>
  );
}
