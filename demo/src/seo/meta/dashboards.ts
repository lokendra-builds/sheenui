import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Dashboards" routes (and the pages that sit beside them). */
export const seoDashboards: Record<string, SeoMeta> = {
  "/dashboards/web-analytics": {
    title: "Web Analytics Dashboard Template for React",
    description:
      "A glass web analytics dashboard template for React: visitors, sources, pages and countries with a time-range picker, rolling KPIs and a live mode. MIT.",
    keyword: "web analytics dashboard template",
    h1: "React Web Analytics Dashboard Template",
    intro:
      "A web analytics dashboard template for React in the style of Plausible and Vercel Analytics, built from SheenUI charts.",
    secondary: ["plausible style dashboard react", "analytics dashboard react"],
  },
  "/dashboards/saas": {
    title: "SaaS Revenue Dashboard (MRR & Churn) for React",
    description:
      "A glass SaaS revenue dashboard for React: MRR, churn, cohort retention and plan movement with animated charts and rolling KPI tiles. Tailwind v4, MIT.",
    keyword: "saas dashboard react",
    h1: "SaaS Revenue Dashboard for React",
    intro: "A SaaS dashboard template for React that tracks MRR, churn and cohort retention in glass charts.",
    secondary: ["mrr churn dashboard", "revenue dashboard react"],
  },
  "/dashboards/ecommerce": {
    title: "Ecommerce Sales Dashboard Template for React",
    description:
      "A glass ecommerce dashboard for React: sales, orders, top products, funnel and regions with a time-range picker and animated KPIs. Free, Tailwind v4.",
    keyword: "ecommerce dashboard react",
    h1: "Ecommerce Dashboard for React",
    intro:
      "An ecommerce sales dashboard template for React with orders, top products, a conversion funnel and a regional map.",
    secondary: ["sales dashboard template", "ecommerce admin dashboard"],
  },
  "/dashboards/product": {
    title: "Product Analytics Dashboard for React",
    description:
      "A glass product analytics dashboard for React: funnels, retention cohorts and Sankey user flows with synced crosshairs and filters. Tailwind CSS v4, MIT.",
    keyword: "product analytics dashboard",
    h1: "React Product Analytics Dashboard",
    intro: "A product analytics dashboard for React with funnels, retention cohorts and Sankey user flows.",
    secondary: ["funnel retention dashboard react", "user flow dashboard"],
  },
  "/dashboards/crypto-dashboard": {
    title: "Crypto & Finance Dashboard Template for React",
    description:
      "A glass crypto and finance dashboard for React: candlesticks with volume, live streaming prices and portfolio allocation. Tailwind CSS v4 + Motion. MIT.",
    keyword: "crypto dashboard react",
    h1: "Crypto Dashboard for React",
    intro:
      "A crypto and finance dashboard template for React with candlesticks, live prices and a portfolio breakdown.",
    secondary: ["trading dashboard ui", "portfolio dashboard react"],
  },
  "/dashboards": {
    title: "React Glass Dashboard Template Pack (Free)",
    description:
      "Free glassmorphism dashboard templates for React: web analytics, SaaS revenue, e-commerce, product analytics and crypto, with animated charts. Tailwind v4.",
    keyword: "react glass dashboard template",
    h1: "React Glass Dashboard Templates",
    intro:
      "React glass dashboard templates: five full pages of glass charts and KPI tiles, each fed by a typed load prop so it shows your data, never fake numbers.",
    secondary: [
      "glassmorphism dashboard",
      "glassmorphism dashboard template",
      "react admin dashboard template free",
      "glassmorphism dashboard ui",
    ],
  },
};
