// `headingLevel="none"`: the same styled text as a paragraph, with no heading role, so an embedded example's
// titles stay out of the page's document outline.

import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { AiChat } from "../../src/blocks/ai-chat";
import { WebAnalyticsDashboard } from "../../src/blocks/analytics-web";
import { SaasRevenueDashboard } from "../../src/blocks/analytics-saas";
import { EcommerceDashboard } from "../../src/blocks/analytics-ecommerce";
import { ProductDashboard } from "../../src/blocks/analytics-product";
import { FinanceDashboard } from "../../src/blocks/analytics-finance";
import { DashboardStats } from "../../src/blocks/dashboard-stats";
import { NotificationPanel } from "../../src/blocks/notification-center";
import { OtpVerification } from "../../src/blocks/otp-verification";
import { PaymentCheckout } from "../../src/blocks/payment-checkout";
import { SettingsPage } from "../../src/blocks/settings-page";
import { ChartCard } from "../../src/components/charts/chart-parts";
import { ChatThread } from "../../src/components/chat/chat-thread";
import { ConversationList } from "../../src/components/chat/conversation-list";
import {
  financeDemoData,
  productDemoData,
  ecommerceDemoData,
  saasRevenueDemoData,
  webAnalyticsDemoData,
} from "../../src/demo-data";
import { settle } from "../helpers";
import { AuthSplit } from "../../src/blocks/auth-split";
import { BentoCell, FeatureBento } from "../../src/blocks/bento-grid";
import { GlassLogin } from "../../src/blocks/glass-login";
import { Pricing } from "../../src/blocks/pricing";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "../../src/components/accordion/accordion";
import { EmptyState } from "../../src/components/empty-state/empty-state";
import { headingBelow, headingTag } from "../../src/lib/heading";
import { renderUi } from "../render";

describe("headingTag / headingBelow", () => {
  it("maps a level to its element and clamps at h6", () => {
    expect(headingTag(2)).toBe("h2");
    expect(headingTag(5, 3)).toBe("h6");
    expect(headingBelow(2)).toBe(3);
    expect(headingBelow(6)).toBe(6);
  });
  it("turns none (and the older false) into a paragraph for the whole subtree", () => {
    expect(headingTag("none")).toBe("p");
    expect(headingTag(false, 2)).toBe("p");
    expect(headingBelow("none")).toBe("none");
  });
});

describe("headingLevel none", () => {
  it("Pricing: title and tier names render but are not headings", () => {
    renderUi(<Pricing title="Plans for every team" headingLevel="none" />);
    expect(screen.getByText("Plans for every team")).toBeVisible();
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });
  it("Pricing: still renders headings by default", () => {
    renderUi(<Pricing title="Plans for every team" />);
    expect(screen.getByRole("heading", { name: "Plans for every team", level: 2 })).toBeVisible();
  });
  it("GlassLogin and AuthSplit: no heading role", () => {
    renderUi(
      <>
        <GlassLogin headingLevel="none" />
        <AuthSplit headingLevel="none" />
      </>,
    );
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });
  it("BentoCell and FeatureBento: no heading role", () => {
    renderUi(
      <>
        <BentoCell title="Cell title" headingLevel="none" />
        <FeatureBento title="Everything" headingLevel="none" />
      </>,
    );
    expect(screen.getByText("Cell title")).toBeInTheDocument();
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });
  it("EmptyState accepts none and the older false", () => {
    renderUi(
      <>
        <EmptyState title="Nothing here" headingLevel="none" />
        <EmptyState title="Still nothing" headingLevel={false} />
      </>,
    );
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });
  it("AccordionTrigger: the header is a paragraph", () => {
    renderUi(
      <Accordion defaultValue={[]}>
        <AccordionItem value="a">
          <AccordionTrigger headingLevel="none">Question</AccordionTrigger>
          <AccordionPanel>Answer</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole("button", { name: "Question" })).toBeVisible();
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });
});

// Every component that accepts `headingLevel`, rendered once with "none" and once with its default level: the
// first must leave no heading element (or role) anywhere in its subtree, the second proves the table's fixture
// does render headings (so "none" is what removed them, not an empty render).
const NOW = "2026-01-15T12:00:00Z";
const people = [
  { id: "me", name: "Ava Chen" },
  { id: "riya", name: "Riya Sharma" },
];
const direct = { id: "c1", participantIds: ["me", "riya"] };
const notice = { id: "n1", title: "Ada mentioned you", time: NOW };

type Level = { headingLevel?: "none" };
const matrix: [string, (p: Level) => ReactElement][] = [
  ["AiChat", (p) => <AiChat {...p} />],
  ["AuthSplit", (p) => <AuthSplit rotateEvery={0} {...p} />],
  ["BentoCell", (p) => <BentoCell title="Cell title" {...p} />],
  [
    "ChartCard",
    (p) => (
      <ChartCard title="Visits" {...p}>
        <div />
      </ChartCard>
    ),
  ],
  [
    "ChatThread",
    (p) => <ChatThread conversation={direct} messages={[]} participants={people} currentUserId="me" {...p} />,
  ],
  [
    "ConversationList",
    (p) => <ConversationList conversations={[direct]} participants={people} currentUserId="me" {...p} />,
  ],
  ["DashboardStats", (p) => <DashboardStats {...p} />],
  ["EmptyState", (p) => <EmptyState title="Nothing here" {...p} />],
  ["EcommerceDashboard", (p) => <EcommerceDashboard load={(q) => ecommerceDemoData(q.range, q.filters)} {...p} />],
  ["FeatureBento", (p) => <FeatureBento title="Everything" {...p} />],
  ["FinanceDashboard", (p) => <FinanceDashboard load={(q) => financeDemoData(q)} {...p} />],
  ["GlassLogin", (p) => <GlassLogin {...p} />],
  ["NotificationPanel", (p) => <NotificationPanel defaultNotifications={[notice]} now={new Date(NOW)} {...p} />],
  ["OtpVerification", (p) => <OtpVerification onVerify={() => true} autoFocus={false} {...p} />],
  ["PaymentCheckout", (p) => <PaymentCheckout {...p} />],
  ["Pricing", (p) => <Pricing title="Plans for every team" {...p} />],
  ["ProductDashboard", (p) => <ProductDashboard load={(q) => productDemoData(q)} {...p} />],
  [
    "SaasRevenueDashboard",
    (p) => <SaasRevenueDashboard load={(q) => saasRevenueDemoData(q.range, q.filters)} {...p} />,
  ],
  ["SettingsPage", (p) => <SettingsPage defaultValues={{ name: "Ada Lovelace", email: "ada@example.com" }} {...p} />],
  [
    "WebAnalyticsDashboard",
    (p) => <WebAnalyticsDashboard load={(q) => webAnalyticsDemoData(q.range, q.filters)} {...p} />,
  ],
  [
    "AccordionTrigger",
    (p) => (
      <Accordion defaultValue={[]}>
        <AccordionItem value="a">
          <AccordionTrigger {...p}>Question</AccordionTrigger>
          <AccordionPanel>Answer</AccordionPanel>
        </AccordionItem>
      </Accordion>
    ),
  ],
];

const HEADINGS = "h1, h2, h3, h4, h5, h6, [role='heading']";
const wide = (ui: ReactElement) => <div style={{ width: 1200 }}>{ui}</div>;

describe("headingLevel none, every component that accepts it", () => {
  it.each(matrix)("%s: no heading element with none, one with the default level", async (_name, ui) => {
    const none = renderUi(wide(ui({ headingLevel: "none" })));
    await settle();
    expect(document.querySelectorAll(HEADINGS)).toHaveLength(0);
    none.unmount();
    renderUi(wide(ui({})));
    await settle();
    expect(document.querySelectorAll(HEADINGS).length).toBeGreaterThan(0);
  });
});
