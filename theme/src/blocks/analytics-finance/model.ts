import type { AnalyticsStatus } from "../analytics/data";

import { type HeadingLevelOption } from "../../lib/heading";
import { type Candle } from "../../components/charts/candlestick-chart";
import { type ChartColor } from "../../components/charts/chart-utils";
import {
  defaultAnalyticsLabels,
  type AnalyticsGlass,
  type AnalyticsLabels,
  type AnalyticsRange,
} from "../analytics-kit";

/* ======================================================================
 * Data
 * ====================================================================== */

/** A kind of holding the finance dashboard can filter by: crypto, stocks, ETFs or cash. */
export type AssetClass = "crypto" | "stocks" | "etf" | "cash";

/** A holding or watched asset: symbol, name, asset class, units held, the latest price, the price 24 hours ago and a 24-hour sparkline. */
export type FinanceAsset = {
  symbol: string;
  name: string;
  class: AssetClass;
  /** Units held (0 for a watch-only asset). */
  quantity: number;
  /** Latest price. */
  price: number;
  /** Price 24 hours ago. */
  open24h: number;
  /** Prices over the last 24 hours, oldest first (the last one is `price`). */
  spark: number[];
};

/** One row of the transaction history: id, ISO date, type (buy, sell, deposit, withdrawal, reward or dividend), asset symbol, quantity, value and status. */
export type FinanceTransaction = {
  id: string;
  /** ISO date-time. */
  date: string;
  type: "buy" | "sell" | "deposit" | "withdrawal" | "reward" | "dividend";
  symbol: string;
  /** Units (for cash: the amount). */
  quantity: number;
  /** Value in the dashboard's currency (always positive; `type` says which way it went). */
  value: number;
  status: "completed" | "pending" | "failed";
};

/** The data the finance dashboard shows for one query: assets, the portfolio value series with its previous period, candles per asset symbol and the transactions in range. */
export type FinanceData = {
  /** Holdings and watched assets (already filtered by the query's classes). */
  assets: FinanceAsset[];
  /** Portfolio value over the range: evenly spaced points, oldest first. */
  series: { time: number; value: number }[];
  /** The previous period's values, one per point of `series`. */
  previous: number[];
  /** Candles over the range, per asset symbol. */
  candles: Record<string, Candle[]>;
  /** Transactions inside the range, newest first. */
  transactions: FinanceTransaction[];
};

/** What the finance dashboard asks its loader for: the time range, the asset classes to include (empty = all) and the current time. */
export type FinanceQuery = {
  range: AnalyticsRange;
  /** Asset classes to include; empty = all. */
  classes: AssetClass[];
  now: Date;
};

/** The static description of one tradable asset. Internal to the analytics kit and its demo data; safe to call on the server. */
export type AssetSpec = {
  symbol: string;
  name: string;
  class: AssetClass;
  quantity: number;
  price: number;
  vol: number;
};

/** The asset classes, in display order. Internal to the analytics kit and its demo data; safe to call on the server. */
export const CLASS_ORDER: AssetClass[] = ["crypto", "stocks", "etf", "cash"];
/** The chart colour slot of each asset class. @internal */
export const CLASS_SLOT: Record<AssetClass, ChartColor> = { crypto: 1, stocks: 2, etf: 3, cash: 4 };

/* ======================================================================
 * Labels
 * ====================================================================== */

/** Every user-facing string of the finance dashboard: the shared `AnalyticsLabels` plus its eyebrow, title, headers and status names. */
export type FinanceLabels = AnalyticsLabels & {
  eyebrow: string;
  title: string;
  description: string;
  assetsFilter: string;
  classes: Record<AssetClass, string>;
  balance: string;
  /** Under the balance when nothing is selected: the range ("Past 30 days"). */
  pastRange: Record<AnalyticsRange, string>;
  /** Measuring between two points: "Oct 3 → Oct 12". */
  between: (from: string, to: string) => string;
  /** How to measure, shown under the chart. */
  measureHint: string;
  measureHintTouch: string;
  portfolio: string;
  previousPeriod: string;
  /** Chart keyboard help, appended to its accessible name. */
  chartInstructions: string;
  allocationTitle: string;
  donut: string;
  treemap: string;
  allocationView: string;
  total: string;
  /** Candlestick card: "{symbol} · {name}". */
  candleTitle: (symbol: string, name: string) => string;
  candleDescription: string;
  watchlistTitle: string;
  watchlistDescription: string;
  /** Spoken name of a watchlist row (read from hidden text, so it always contains the visible text). */
  watchRow: (name: string, symbol: string, price: string, change: string) => string;
  transactionsTitle: string;
  transactionsDescription: string;
  noTransactions: (range: string) => string;
  headers: { date: string; type: string; asset: string; amount: string; value: string; status: string };
  types: Record<FinanceTransaction["type"], string>;
  statuses: Record<FinanceTransaction["status"], string>;
  /** Empty states: nothing matches the filters / the account holds nothing yet. */
  noAssets: string;
  noHoldings: string;
  /** Title of the candles card when there is no asset to show. */
  priceHistory: string;
  exportFile: string;
};

/** The English `FinanceLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultFinanceLabels: FinanceLabels = {
  ...defaultAnalyticsLabels,
  eyebrow: "Portfolio",
  title: "Markets & holdings",
  description: "Your balance, how each holding moves and every trade, with live prices.",
  assetsFilter: "Assets",
  classes: { crypto: "Crypto", stocks: "Stocks", etf: "ETFs", cash: "Cash" },
  balance: "Total balance",
  pastRange: {
    "24h": "Past 24 hours",
    "7d": "Past 7 days",
    "30d": "Past 30 days",
    "90d": "Past 90 days",
    "12m": "Past 12 months",
  },
  between: (from, to) => `${from} → ${to}`,
  measureHint: "Hover to read a value · drag across the chart to measure a move",
  measureHintTouch: "Drag to read a value · touch and hold, then drag, to measure",
  portfolio: "Portfolio",
  previousPeriod: "Previous period",
  chartInstructions:
    "Use the left and right arrow keys to read values; hold Shift to measure between two points; Escape clears.",
  allocationTitle: "Allocation",
  donut: "Donut",
  treemap: "Treemap",
  allocationView: "Show allocation as",
  total: "Total",
  candleTitle: (symbol, name) => `${symbol} · ${name}`,
  candleDescription: "Price candles and volume. Pick another asset in the watchlist.",
  watchlistTitle: "Watchlist",
  watchlistDescription: "Live prices · 24h change",
  watchRow: (name, symbol, price, change) => `${name} (${symbol}), ${price}, ${change}`,
  transactionsTitle: "Transactions",
  transactionsDescription: "Every trade, transfer and payout in the range.",
  noTransactions: (range) => `No transactions in the ${range.toLowerCase()}.`,
  headers: { date: "Date", type: "Type", asset: "Asset", amount: "Amount", value: "Value", status: "Status" },
  types: {
    buy: "Buy",
    sell: "Sell",
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    reward: "Staking reward",
    dividend: "Dividend",
  },
  statuses: { completed: "Completed", pending: "Pending", failed: "Failed" },
  noAssets: "No assets match these filters.",
  noHoldings: "No holdings yet. Deposit or buy an asset to see it here.",
  emptyTitle: "No holdings yet",
  emptyDescription: "Deposit or buy an asset and your balance, prices and trades will show up here.",
  priceHistory: "Price history",
  exportFile: "portfolio",
};

/* ======================================================================
 * Component
 * ====================================================================== */

/** Props of `FinanceDashboard`. Each controllable value comes as a trio: `x`, `defaultX`, `onXChange`. */
export type FinanceDashboardProps = {
  /** Loads the data for a query: return it, or a promise of it. Required: there is no built-in demo data (see `@sheenui/theme/demo-data`). */
  load: (query: FinanceQuery, signal: AbortSignal) => FinanceData | Promise<FinanceData>;
  /** Force a state for demos and tests: "loading", "empty" or "error". "auto" (default) follows the data. */
  status?: AnalyticsStatus;
  /** Evolves the data while Live is on. Default: none, so Live only reflects what `load` returns. */
  liveStep?: ((data: FinanceData, tick: number) => FinanceData) | null;
  /** Milliseconds between live updates. Default 1600. */
  liveInterval?: number;
  /** Sets the active range when controlled. */
  range?: AnalyticsRange;
  /** The range at first when `range` is not controlled (`AnalyticsRange`, default `"30d"`). */
  defaultRange?: AnalyticsRange;
  /** Called when the range changes. */
  onRangeChange?: (range: AnalyticsRange) => void;
  /** The asset-class chips that are on (controlled); none selected means all classes. */
  classes?: AssetClass[];
  /** The classes on at first when `classes` is not controlled (default none, i.e. all). */
  defaultClasses?: AssetClass[];
  /** Called when the class chips change. */
  onClassesChange?: (classes: AssetClass[]) => void;
  /** The asset shown in the candlestick card (controlled / initial). */
  asset?: string;
  /** The asset shown first when `asset` is not controlled (`string`, default `"BTC"`). */
  defaultAsset?: string;
  /** Called when another asset is picked in the watchlist. */
  onAssetChange?: (symbol: string) => void;
  /** Whether live updates run (controlled). */
  live?: boolean;
  /** Whether live updates are on at first (`boolean`, default `true`). */
  defaultLive?: boolean;
  /** Called when the Live toggle changes. */
  onLiveChange?: (live: boolean) => void;
  /** Whether the previous period is shown (controlled). */
  compare?: boolean;
  /** Whether the comparison is on at first (`boolean`, default `false`). */
  defaultCompare?: boolean;
  /** Called when the Compare toggle changes. */
  onCompareChange?: (compare: boolean) => void;
  /** Called by the Export button. Default: downloads holdings and transactions as CSV. */
  onExport?: (data: FinanceData, query: FinanceQuery) => void;
  /** Sets the ISO 4217 currency of every value. Default "USD". */
  currency?: string;
  /** "Now": the end of every range. Default: the current time. On a prerendered page pass a fixed date, so the server's and the browser's first render print the same axes. */
  now?: Date;
  /** BCP 47 locale for every number and date (`string`, default the runtime's). */
  locale?: string;
  /** Heading level of the title (1 to 6, default 2), or `"none"` for a paragraph with no heading role (panel titles follow). */
  headingLevel?: HeadingLevelOption;
  /**
   * Glass on the cards: "auto" (default) keeps real glass while the device keeps up and falls back
   * to a frosted solid surface on weak devices or when frames drop; "full" / "flat" force one.
   */
  glass?: AnalyticsGlass;
  /** Overrides for the built-in English strings (`Partial<FinanceLabels>`). */
  labels?: Partial<FinanceLabels>;
  /** Adds extra classes to the root `<section>` (`string`). */
  className?: string;
};

/** A stable empty asset-class list, so a default never changes identity. @internal */
export const NO_CLASSES: AssetClass[] = [];
/** A stable empty candle list, so a default never changes identity. @internal */
export const NO_CANDLES: Candle[] = [];
/** A stable empty series list, so a default never changes identity. @internal */
export const NO_SERIES: FinanceData["series"] = [];
/** A stable empty number list, so a default never changes identity. @internal */
export const NO_NUMBERS: number[] = [];
