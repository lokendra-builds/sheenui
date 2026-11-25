import { lazyBlock } from "../layout/lazy-block";
import { BlockStage } from "../layout/ShowcaseStage.block.scene";
import type { DashboardKind } from "./DashboardStageHero";

// The hero parts are a chunk of their own, fetched while the page hydrates, together with the dashboard's own chunk that
// already holds the same KPI strip and trend chart: nothing here is in the page's initial JS.
const Hero = lazyBlock(() => import("./DashboardStageHero").then((m) => m.DashboardHero), {
  minHeight: "0",
  eager: true,
});

const LABELS: Record<DashboardKind, string> = {
  web: "Web analytics dashboard demo",
  saas: "SaaS revenue dashboard demo",
  ecommerce: "E-commerce dashboard demo",
  product: "Product dashboard demo",
  finance: "Portfolio dashboard demo",
};

/**
 * The stage at the top of a dashboard page: its hero KPI strip and trend chart (the dashboard's own parts) switch to the last
 * 30 days, the chart follows the second KPI, and Compare draws the previous period.
 */
function DashboardStage({ kind, label }: { kind: DashboardKind; label?: string }) {
  return (
    <BlockStage
      label={label ?? LABELS[kind]}
      story="work"
      width={860}
      height={476}
      fit={476}
      align="start"
      frameClassName="sheen-blk-dash"
      actions={[]}
    >
      {(step) => <Hero kind={kind} step={step} />}
    </BlockStage>
  );
}

export const WebAnalyticsStage = () => <DashboardStage kind="web" />;
WebAnalyticsStage.isShowcaseStage = true;
export const SaasStage = () => <DashboardStage kind="saas" />;
SaasStage.isShowcaseStage = true;
export const EcommerceStage = () => <DashboardStage kind="ecommerce" />;
EcommerceStage.isShowcaseStage = true;
export const ProductStage = () => <DashboardStage kind="product" />;
ProductStage.isShowcaseStage = true;
export const FinanceStage = () => <DashboardStage kind="finance" />;
FinanceStage.isShowcaseStage = true;
export const AllDashboardsStage = () => <DashboardStage kind="web" label="Dashboards demo" />;
AllDashboardsStage.isShowcaseStage = true;
