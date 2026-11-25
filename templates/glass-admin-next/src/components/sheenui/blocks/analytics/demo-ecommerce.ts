import { type ChartColor } from "../../charts/chart-utils";

import { type TreemapNode } from "../../charts/treemap";

import { type AnalyticsLoader, type AnalyticsRange } from "../analytics-kit";
import { CHANNELS, type EcommerceChannel, type EcommerceData, type EcommerceStage } from "../analytics-ecommerce";
import { DEMO_NOW, demoSeries, hashSeed, seededRandom, simulateLatency } from "./demo";
import { rangePoints } from "./data";

const CHANNEL_SHARE: Record<EcommerceChannel, number> = { store: 0.52, marketplace: 0.24, app: 0.18, social: 0.06 };

const BASE_REVENUE: Record<AnalyticsRange, number> = {
  "24h": 1_850,
  "7d": 44_000,
  "30d": 41_000,
  "90d": 39_500,
  "12m": 1_210_000,
};

const STAGES: readonly EcommerceStage[] = ["sessions", "productViews", "addToCart", "checkout", "purchase"];

const CATEGORIES: { label: string; color: ChartColor; weight: number; items: [string, number][] }[] = [
  {
    label: "Apparel",
    color: 1,
    weight: 0.34,
    items: [
      ["Tops", 0.38],
      ["Outerwear", 0.27],
      ["Bottoms", 0.22],
      ["Dresses", 0.13],
    ],
  },
  {
    label: "Footwear",
    color: 2,
    weight: 0.24,
    items: [
      ["Sneakers", 0.56],
      ["Boots", 0.26],
      ["Sandals", 0.18],
    ],
  },
  {
    label: "Accessories",
    color: 3,
    weight: 0.17,
    items: [
      ["Bags", 0.48],
      ["Watches", 0.3],
      ["Sunglasses", 0.22],
    ],
  },
  {
    label: "Home",
    color: 4,
    weight: 0.15,
    items: [
      ["Candles", 0.36],
      ["Ceramics", 0.34],
      ["Textiles", 0.3],
    ],
  },
  {
    label: "Beauty",
    color: 5,
    weight: 0.1,
    items: [
      ["Skincare", 0.58],
      ["Fragrance", 0.42],
    ],
  },
];

const PRODUCTS: [string, number][] = [
  ["Aurora Down Jacket", 1],
  ["Glasswing Sneaker", 0.86],
  ["Tidal Linen Shirt", 0.61],
  ["Ember Leather Tote", 0.55],
  ["Lumen Ceramic Mug Set", 0.41],
  ["Drift Wool Beanie", 0.33],
  ["Halo Skincare Kit", 0.29],
  ["Nova Smart Watch Band", 0.22],
];

/** Demo data for a range and channel filters: the same query always gives the same numbers. */
export function ecommerceDemoData(
  range: AnalyticsRange,
  filters: readonly string[] = [],
  locale?: string,
): EcommerceData {
  const active = CHANNELS.filter((c) => filters.includes(c));
  const share = active.length ? active.reduce((s, c) => s + CHANNEL_SHARE[c], 0) : 1;
  const seed = hashSeed("shop", range, active.join(","));
  const rand = seededRandom(seed);
  const points = rangePoints(range, locale, DEMO_NOW);
  const base = BASE_REVENUE[range] * share;
  const revenue = demoSeries(range, { seed, base, growth: 0.22, noise: 0.09, rhythm: 0.12 });
  const previous = demoSeries(range, { seed: seed + 11, base: base * 0.9, growth: 0.12, noise: 0.09, rhythm: 0.12 });
  const aovBase = 68 + (active.includes("app") ? 6 : 0) - (active.includes("social") ? 9 : 0);
  const convBase = 0.031 + (active.includes("app") ? 0.006 : 0) - (active.includes("social") ? 0.008 : 0);

  const pts = points.map((p, i) => {
    const r = Math.round(revenue[i] ?? 0);
    const aov = aovBase * (0.94 + rand() * 0.12);
    return {
      label: p.label,
      long: p.long,
      revenue: r,
      orders: Math.max(0, Math.round(r / aov)),
      previousRevenue: Math.round(previous[i] ?? 0),
    };
  });
  const sumRevenue = pts.reduce((s, p) => s + p.revenue, 0);
  const sumOrders = pts.reduce((s, p) => s + p.orders, 0);
  const prevRevenue = pts.reduce((s, p) => s + p.previousRevenue, 0);
  const prevOrders = Math.round(prevRevenue / (aovBase * 0.975));
  const conversionTrend = pts.map(() => convBase * (0.9 + rand() * 0.2));
  const conversion = conversionTrend.reduce((s, v) => s + v, 0) / Math.max(1, pts.length);
  const sessions = Math.round(sumOrders / Math.max(0.001, conversion));

  const funnelRatios = [1, 0.62, 0.21 + rand() * 0.02, 0.094 + rand() * 0.01, conversion];
  const funnel = STAGES.map((stage, i) => ({ stage, value: Math.round(sessions * (funnelRatios[i] ?? 0)) }));

  const categories: TreemapNode[] = CATEGORIES.map((c) => ({
    label: c.label,
    color: c.color,
    children: c.items.map(([label, w]) => ({
      label,
      value: Math.round(sumRevenue * c.weight * w * (0.9 + rand() * 0.2)),
    })),
  }));

  // Orders by weekday × hour: lunch and evening peaks, busier weekend afternoons.
  const monday = new Date(Date.UTC(2026, 9, 26));
  const dayName = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const perCell = sumOrders / (7 * 24);
  const heatmap = Array.from({ length: 7 }, (_, d) => {
    const weekend = d >= 5;
    return {
      day: dayName.format(new Date(monday.getTime() + d * 86_400_000)),
      hours: Array.from({ length: 24 }, (_, h) => {
        const night = h < 7 ? 0.12 + h * 0.02 : 1;
        const lunch = Math.exp(-((h - 12.5) ** 2) / 4) * 0.7;
        const evening = Math.exp(-((h - 20.5) ** 2) / 5) * (weekend ? 0.9 : 1.25);
        const afternoon = weekend ? Math.exp(-((h - 15) ** 2) / 8) * 0.8 : 0;
        return Math.round(perCell * night * (0.45 + lunch + evening + afternoon) * (0.9 + rand() * 0.2));
      }),
    };
  });

  const products = PRODUCTS.map(([name, w]) => ({
    name,
    value: Math.round(sumRevenue * 0.052 * w * (0.92 + rand() * 0.16)),
  }));

  const aovTrend = pts.map((p) => (p.orders ? p.revenue / p.orders : 0));
  return {
    points: pts,
    kpis: { revenue: sumRevenue, orders: sumOrders, aov: sumOrders ? sumRevenue / sumOrders : 0, conversion },
    previousKpis: {
      revenue: prevRevenue,
      orders: prevOrders,
      aov: prevOrders ? prevRevenue / prevOrders : 0,
      conversion: conversion * 0.94,
    },
    trends: {
      revenue: pts.map((p) => p.revenue),
      orders: pts.map((p) => p.orders),
      aov: aovTrend,
      conversion: conversionTrend,
    },
    funnel,
    categories,
    heatmap,
    products,
  };
}

/** A live tick: a few orders land on the latest period. */
export function ecommerceLiveStep(prev: EcommerceData, tick: number): EcommerceData {
  const rand = seededRandom(hashSeed("shop-live", tick));
  const orders = 1 + Math.floor(rand() * 4);
  const amount = Math.round(orders * (52 + rand() * 40));
  const points = prev.points.slice();
  const last = points[points.length - 1];
  if (last) points[points.length - 1] = { ...last, revenue: last.revenue + amount, orders: last.orders + orders };
  const revenue = prev.kpis.revenue + amount;
  const count = prev.kpis.orders + orders;
  const trend = (values: number[], value: number) => [...values.slice(0, -1), value];
  const product = Math.floor(rand() * 3);
  return {
    ...prev,
    points,
    kpis: { ...prev.kpis, revenue, orders: count, aov: revenue / Math.max(1, count) },
    trends: {
      ...prev.trends,
      revenue: trend(prev.trends.revenue, (last?.revenue ?? 0) + amount),
      orders: trend(prev.trends.orders, (last?.orders ?? 0) + orders),
    },
    funnel: prev.funnel.map((f, i) => ({
      ...f,
      value:
        f.value +
        (i === prev.funnel.length - 1
          ? orders
          : Math.round(orders / Math.max(0.01, [0.031, 0.05, 0.15, 0.33, 1][i] ?? 1))),
    })),
    products: prev.products.map((p, i) => (i === product ? { ...p, value: p.value + amount } : p)),
  };
}

/** A demo `AnalyticsLoader` that returns `ecommerceDemoData` for the query after a simulated delay (aborts with the signal); swap it for your own loader. */
export const ecommerceDemoLoader: AnalyticsLoader<EcommerceData> = (query, signal) =>
  simulateLatency(signal, () => ecommerceDemoData(query.range, query.filters));
