import { type Candle } from "../../components/charts/candlestick-chart";

import { extent } from "../../components/charts/chart-utils";

import { type AnalyticsRange } from "../analytics-kit";

import {
  type AssetSpec,
  CLASS_ORDER,
  type FinanceAsset,
  type FinanceData,
  type FinanceQuery,
  type FinanceTransaction,
} from "../analytics-finance";
import { createRng, hashSeed, withLatency } from "./demo";

/** Daily volatility (σ of log returns) per asset: crypto swings, cash doesn't. */
const ASSETS: [AssetSpec, ...AssetSpec[]] = [
  { symbol: "BTC", name: "Bitcoin", class: "crypto", quantity: 0.84, price: 68_420.12, vol: 0.028 },
  { symbol: "ETH", name: "Ethereum", class: "crypto", quantity: 9.2, price: 3_512.4, vol: 0.034 },
  { symbol: "SOL", name: "Solana", class: "crypto", quantity: 140, price: 172.38, vol: 0.046 },
  { symbol: "NWT", name: "Northwind Chips", class: "stocks", quantity: 45, price: 138.21, vol: 0.026 },
  { symbol: "HRZ", name: "Horizon Devices", class: "stocks", quantity: 60, price: 231.54, vol: 0.014 },
  { symbol: "CLB", name: "Cloudbase Software", class: "stocks", quantity: 25, price: 428.07, vol: 0.013 },
  { symbol: "VOO", name: "Vanguard S&P 500", class: "etf", quantity: 38, price: 532.66, vol: 0.009 },
  { symbol: "USDC", name: "USD Coin", class: "cash", quantity: 12_500, price: 1, vol: 0 },
];

const RANGE_MS: Record<AnalyticsRange, number> = {
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
  "90d": 90 * 86_400_000,
  "12m": 365 * 86_400_000,
};

const CANDLES: Record<AnalyticsRange, number> = { "24h": 48, "7d": 42, "30d": 30, "90d": 45, "12m": 52 };

/** Every range has the same number of points, so the line morphs point-for-point between ranges. */
const POINTS = 60;

/**
 * A log-price path from `start` to `end` in `steps` steps (a Brownian bridge): random on the way,
 * but it always lands exactly on the real latest price.
 */
function bridge(rng: ReturnType<typeof createRng>, start: number, end: number, steps: number, sigma: number) {
  const w: number[] = [0];
  for (let i = 1; i <= steps; i++) w.push((w[i - 1] ?? 0) + rng.normal() * sigma);
  const wn = w[steps] ?? 0;
  const a = Math.log(start);
  const b = Math.log(end);
  return w.map((wi, i) => {
    const t = i / steps;
    return Math.exp(a + (b - a) * t + (wi - t * wn));
  });
}

/** The asset's return over a range: deterministic per asset and range (24h matches its 24h change). */
function rangeReturn(spec: AssetSpec, range: AnalyticsRange) {
  if (spec.vol === 0) return 0;
  const rng = createRng(hashSeed(`ret-${spec.symbol}-${range}`));
  const days = RANGE_MS[range] / 86_400_000;
  const drift = 0.0006 * days;
  return Math.exp(drift + rng.normal() * spec.vol * Math.sqrt(days) * 0.8) - 1;
}

/**
 * Realistic, deterministic demo data: the same query always gives the same prices, so
 * screenshots and tests are stable. Replace it with your own `load` (a fetch) in an app.
 */
export function financeDemoData({ range, classes, now }: FinanceQuery): FinanceData {
  const chosen = classes.length ? classes : CLASS_ORDER;
  const specs = ASSETS.filter((a) => chosen.includes(a.class));
  const end = now.getTime();
  const span = RANGE_MS[range];
  const days = span / 86_400_000;
  const stepDays = days / (POINTS - 1);

  const paths = new Map<string, { now: number[]; before: number[] }>();
  const assets: FinanceAsset[] = specs.map((spec) => {
    const rng = createRng(hashSeed(`path-${spec.symbol}-${range}`));
    const r = rangeReturn(spec, range);
    const start = spec.price / (1 + r);
    const r2 = rangeReturn(spec, range) * 0.6 + (spec.vol ? rng.normal() * spec.vol * Math.sqrt(days) * 0.5 : 0);
    const prevStart = start / (1 + r2);
    const sigma = spec.vol * Math.sqrt(stepDays);
    paths.set(spec.symbol, {
      now: spec.vol ? bridge(rng, start, spec.price, POINTS - 1, sigma) : new Array<number>(POINTS).fill(spec.price),
      before: spec.vol ? bridge(rng, prevStart, start, POINTS - 1, sigma) : new Array<number>(POINTS).fill(spec.price),
    });
    const change = rangeReturn(spec, "24h");
    const open24h = spec.price / (1 + change);
    const sparkRng = createRng(hashSeed(`spark-${spec.symbol}`));
    const spark = spec.vol
      ? bridge(sparkRng, open24h, spec.price, 23, spec.vol * Math.sqrt(1 / 24))
      : Array(24).fill(spec.price);
    return {
      symbol: spec.symbol,
      name: spec.name,
      class: spec.class,
      quantity: spec.quantity,
      price: spec.price,
      open24h,
      spark,
    };
  });

  const sum = (key: "now" | "before", i: number) =>
    specs.reduce((s, spec) => s + spec.quantity * (paths.get(spec.symbol)?.[key][i] ?? spec.price), 0);
  const series = Array.from({ length: POINTS }, (_, i) => ({
    time: end - span + (i / (POINTS - 1)) * span,
    value: sum("now", i),
  }));
  const previous = Array.from({ length: POINTS }, (_, i) => sum("before", i));

  // Candles: 4 sub-steps each, the same bridge idea (they close on the latest price).
  const candles: Record<string, Candle[]> = {};
  const count = CANDLES[range];
  for (const spec of specs) {
    const rng = createRng(hashSeed(`candles-${spec.symbol}-${range}`));
    const start = spec.price / (1 + rangeReturn(spec, range));
    const sub = 4;
    const sigma = Math.max(0.0004, spec.vol) * Math.sqrt(days / (count * sub));
    const walk = bridge(rng, spec.vol ? start : 1, spec.vol ? spec.price : 1.0001, count * sub, sigma);
    candles[spec.symbol] = Array.from({ length: count }, (_, c) => {
      const slice = walk.slice(c * sub, c * sub + sub + 1);
      const open = slice[0] ?? spec.price;
      const close = slice[slice.length - 1] ?? spec.price;
      const [lo, hi] = extent(slice);
      const wick = sigma * 0.6;
      return {
        date: end - span + (c / count) * span,
        open,
        close,
        high: hi * (1 + Math.abs(rng.normal()) * wick),
        low: lo * (1 - Math.abs(rng.normal()) * wick),
        volume: Math.round(
          (spec.class === "crypto" ? 2_400 : 18_000) *
            (1 + (Math.abs(close - open) / open) * 40) *
            (0.7 + rng.next() * 0.6),
        ),
      };
    });
  }

  // Transactions over the last year; the range keeps only the recent ones.
  const txRng = createRng(hashSeed("transactions"));
  const types: FinanceTransaction["type"][] = [
    "buy",
    "buy",
    "reward",
    "sell",
    "deposit",
    "dividend",
    "buy",
    "withdrawal",
  ];
  const all: FinanceTransaction[] = Array.from({ length: 28 }, (_, i) => {
    const ago = Math.round(i ** 2.2 * 2.6 * 3_600_000 + txRng.next() * 3_000_000 + 1_800_000);
    let type = types[i % types.length] ?? "buy";
    let spec = ASSETS[Math.floor(txRng.next() * ASSETS.length)] ?? ASSETS[0];
    if (type === "deposit" || type === "withdrawal") spec = ASSETS.at(-1) ?? spec;
    if (type === "dividend") spec = ASSETS.find((a) => a.class === "etf" || a.class === "stocks") ?? spec;
    if (type === "reward" && spec.class !== "crypto") spec = ASSETS[2] ?? spec;
    if (spec.class === "cash" && (type === "buy" || type === "sell")) type = "deposit";
    const value =
      Math.round(
        (type === "reward" || type === "dividend" ? 40 + txRng.next() * 220 : 250 + txRng.next() * 6_000) * 100,
      ) / 100;
    return {
      id: `tx-${i + 1}`,
      date: new Date(end - ago).toISOString(),
      type,
      symbol: spec.symbol,
      quantity: Math.round((value / spec.price) * 1e6) / 1e6,
      value,
      status: i === 1 ? "pending" : i === 6 ? "failed" : i === 3 ? "pending" : "completed",
    };
  });
  const from = end - span;
  const classOf = new Map(ASSETS.map((a) => [a.symbol, a.class]));
  const transactions = all.filter(
    (t) => Date.parse(t.date) >= from && chosen.includes(classOf.get(t.symbol) ?? "cash"),
  );

  return { assets, series, previous, candles, transactions };
}

/** The demo loader: demo data after a short, realistic network delay (so you see the loading states). */
export function financeDemoLoader(query: FinanceQuery) {
  return withLatency(financeDemoData(query), 380);
}

/**
 * One live step: two assets tick (a small random move), their sparkline end, their last candle
 * and the portfolio's latest value follow. Everything else keeps its identity (no re-render).
 */
export function financeLiveStep(data: FinanceData, tick: number): FinanceData {
  const rng = createRng(hashSeed(`tick-${tick}`));
  const movable = data.assets.filter((a) => a.class !== "cash");
  if (movable.length === 0) return data;
  const picks = new Set([
    movable[Math.floor(rng.next() * movable.length)]?.symbol,
    movable[Math.floor(rng.next() * movable.length)]?.symbol,
  ]);
  const spec = new Map(ASSETS.map((a) => [a.symbol, a]));
  const candles = { ...data.candles };
  const assets = data.assets.map((a) => {
    if (!picks.has(a.symbol)) return a;
    const vol = spec.get(a.symbol)?.vol ?? 0.01;
    const price = Math.round(a.price * Math.exp(rng.normal() * vol * 0.035) * 100) / 100;
    const list = candles[a.symbol];
    const last = list?.[list.length - 1];
    if (list && last)
      candles[a.symbol] = [
        ...list.slice(0, -1),
        { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price) },
      ];
    return { ...a, price, spark: [...a.spark.slice(0, -1), price] };
  });
  const total = assets.reduce((s, a) => s + a.quantity * a.price, 0);
  const lastPoint = data.series[data.series.length - 1];
  const series = lastPoint ? [...data.series.slice(0, -1), { ...lastPoint, value: total }] : data.series;
  return { ...data, assets, candles, series };
}
