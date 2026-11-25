// Every block can be rendered more than once on a page (a stage copy plus a docs example, two panels of a dashboard):
// no landmark name may repeat, and no content may fall outside a landmark. Axe `landmark-unique` + `region`.

import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { AiChat } from "../../src/blocks/ai-chat";
import { AnnouncementBanner } from "../../src/blocks/announcement-banner";
import { EcommerceDashboard } from "../../src/blocks/analytics-ecommerce";
import { FinanceDashboard } from "../../src/blocks/analytics-finance";
import { ProductDashboard } from "../../src/blocks/analytics-product";
import { SaasRevenueDashboard } from "../../src/blocks/analytics-saas";
import { WebAnalyticsDashboard } from "../../src/blocks/analytics-web";
import { AuthSplit } from "../../src/blocks/auth-split";
import { BentoCell, BentoGrid, FeatureBento } from "../../src/blocks/bento-grid";
import { ChatApp } from "../../src/blocks/chat-app";
import { ContactForm } from "../../src/blocks/contact-form";
import { DashboardStats } from "../../src/blocks/dashboard-stats";
import { FaqSection } from "../../src/blocks/faq-section";
import { FeatureGrid } from "../../src/blocks/feature-grid";
import { GlassLogin } from "../../src/blocks/glass-login";
import { HeroSection } from "../../src/blocks/hero-section";
import { LampLogin } from "../../src/blocks/lamp-login";
import { NotFound } from "../../src/blocks/not-found-page";
import { NotificationPanel } from "../../src/blocks/notification-center";
import { OtpVerification } from "../../src/blocks/otp-verification";
import { PaymentCheckout } from "../../src/blocks/payment-checkout";
import { Pricing, type PricingTier } from "../../src/blocks/pricing";
import { SettingsPage } from "../../src/blocks/settings-page";
import { SiteFooter } from "../../src/blocks/site-footer";
import { Testimonials } from "../../src/blocks/testimonials";
import {
  ecommerceDemoData,
  financeDemoData,
  productDemoData,
  saasRevenueDemoData,
  webAnalyticsDemoData,
} from "../../src/demo-data";
import { renderUi, runAxe } from "../render";

const tiers: PricingTier[] = [
  { id: "free", name: "Free", price: { monthly: 0, yearly: 0 }, cta: "Start free" },
  { id: "pro", name: "Pro", price: { monthly: 20, yearly: 16 }, cta: "Go Pro", popular: true },
];
const NOW = new Date(2026, 10, 18, 14, 30);
const stamp = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();

const blocks: [string, () => ReactElement][] = [
  ["AiChat", () => <AiChat />],
  ["AnnouncementBanner", () => <AnnouncementBanner>Heads up.</AnnouncementBanner>],
  ["EcommerceDashboard", () => <EcommerceDashboard load={(q) => ecommerceDemoData(q.range, q.filters)} />],
  ["FinanceDashboard", () => <FinanceDashboard load={(q) => financeDemoData(q)} />],
  ["ProductDashboard", () => <ProductDashboard load={(q) => productDemoData(q)} />],
  ["SaasRevenueDashboard", () => <SaasRevenueDashboard load={(q) => saasRevenueDemoData(q.range, q.filters)} />],
  ["WebAnalyticsDashboard", () => <WebAnalyticsDashboard load={(q) => webAnalyticsDemoData(q.range, q.filters)} />],
  ["AuthSplit", () => <AuthSplit rotateEvery={0} />],
  [
    "BentoGrid",
    () => (
      <BentoGrid>
        <BentoCell title="Fast" description="Very fast" />
        <BentoCell title="Calm" description="Very calm" />
      </BentoGrid>
    ),
  ],
  ["FeatureBento", () => <FeatureBento title="Why Sheen" />],
  [
    "ChatApp",
    () => (
      <ChatApp
        conversations={[
          {
            id: "c1",
            participantIds: ["me", "riya"],
            lastMessage: { id: "m1", senderId: "riya", text: "Hi", createdAt: stamp(5) },
          },
        ]}
        participants={[
          { id: "me", name: "Ava Chen" },
          { id: "riya", name: "Riya Sharma" },
        ]}
        currentUserId="me"
        messages={{ c1: [{ id: "m1", senderId: "riya", text: "Hi", createdAt: stamp(5) }] }}
        selectedId="c1"
        now={NOW}
        locale="en-US"
      />
    ),
  ],
  ["ContactForm", () => <ContactForm title="Talk to us" />],
  ["DashboardStats", () => <DashboardStats />],
  ["FaqSection", () => <FaqSection title="FAQ" items={[{ id: "a", question: "Why?", answer: "Because." }]} />],
  [
    "FeatureGrid",
    () => <FeatureGrid title="Features" features={[{ id: "f", title: "Fast", description: "Very fast" }]} />,
  ],
  ["GlassLogin", () => <GlassLogin />],
  ["HeroSection", () => <HeroSection title="Hello" description="Lede" />],
  ["LampLogin", () => <LampLogin />],
  ["NotFound", () => <NotFound action={{ label: "Home", href: "#" }} links={[{ label: "Docs", href: "#d" }]} />],
  ["NotificationPanel", () => <NotificationPanel />],
  ["OtpVerification", () => <OtpVerification onVerify={() => true} />],
  ["PaymentCheckout", () => <PaymentCheckout />],
  ["Pricing", () => <Pricing tiers={tiers} title="Plans" />],
  ["SettingsPage", () => <SettingsPage />],
  [
    "SiteFooter",
    () => (
      <SiteFooter
        brand="Sheen"
        columns={[{ id: "p", title: "Product", links: [{ label: "Docs", href: "#d" }] }]}
        onSubscribe={() => undefined}
      />
    ),
  ],
  [
    "Testimonials",
    () => <Testimonials title="Kind words" testimonials={[{ id: "t", quote: "Lovely.", name: "Ava" }]} />,
  ],
];

const rules = [
  "landmark-unique",
  "landmark-no-duplicate-main",
  "landmark-main-is-top-level",
  "landmark-no-duplicate-banner",
  "landmark-no-duplicate-contentinfo",
  "aria-allowed-role",
];

describe("blocks rendered twice in one document", () => {
  it.each(blocks)("%s keeps landmark names unique and content inside landmarks", async (_name, make) => {
    renderUi(
      <main>
        <div>{make()}</div>
        <div>{make()}</div>
      </main>,
    );
    const results = await runAxe(document.body, {
      runOnly: [...rules, "region"],
      rules: { region: { enabled: true } },
    });
    expect(results.violations).toEqual([]);
  });

  it.each(blocks.filter(([name]) => name !== "SiteFooter"))(
    "%s outside a <main> adds no banner and no repeated landmark",
    async (_name, make) => {
      renderUi(
        <div>
          <div>{make()}</div>
          <div>{make()}</div>
        </div>,
      );
      // (SiteFooter is the page's contentinfo by design, so it is only checked inside <main>, above.)
      const results = await runAxe(document.body, { runOnly: rules });
      expect(results.violations).toEqual([]);
    },
  );
});
