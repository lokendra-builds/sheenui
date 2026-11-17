import { useState } from "react";
import { CandlestickChart, CandlestickTable, NumberTicker, type Candle } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import * as PROPS from "../generated/component-props";
import { CHARTS, gaussian, seeded } from "./ChartsProgressPages/shared";

/* ====================================================================== */
/* Candlestick                                                            */
/* ====================================================================== */

/** Trading days (Mon–Fri) ending on a fixed date, oldest first. */
function tradingDays(count: number, end = Date.UTC(2026, 9, 30)) {
  const out: Date[] = [];
  for (let t = end; out.length < count; t -= 86_400_000) {
    const d = new Date(t);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) out.unshift(d);
  }
  return out;
}

/** A random walk with drift and volatility clustering: plausible daily candles. */
function priceSeries(
  seed: number,
  start: number,
  dates: Date[],
  drift = 0.0006,
  vol = 0.016,
  baseVolume = 18e6,
): Candle[] {
  const rand = seeded(seed);
  const z = gaussian(rand);
  let close = start;
  let sigma = vol;
  return dates.map((date) => {
    sigma = Math.max(vol * 0.5, Math.min(vol * 2.4, sigma * (0.9 + rand() * 0.2) + (rand() > 0.94 ? vol * 0.8 : 0)));
    const open = close * (1 + z() * sigma * 0.25);
    const next = open * (1 + drift + z() * sigma);
    const high = Math.max(open, next) * (1 + Math.abs(z()) * sigma * 0.45);
    const low = Math.min(open, next) * (1 - Math.abs(z()) * sigma * 0.45);
    const move = Math.abs(next - open) / open;
    const volume = Math.round(baseVolume * (0.6 + rand() * 0.6 + move * 28));
    close = next;
    const r = (n: number) => Math.round(n * 100) / 100;
    return { date, open: r(open), high: r(high), low: r(low), close: r(next), volume };
  });
}

const stockDays = tradingDays(160);

const stocks = {
  acme: priceSeries(31, 182, stockDays, 0.0003),
  globex: priceSeries(77, 64, stockDays, -0.0002, 0.022, 41e6),
};

const intradayBars: Candle[] = (() => {
  const open = Date.UTC(2026, 9, 30, 13, 30);
  const dates = Array.from({ length: 78 }, (_, i) => new Date(open + i * 5 * 60_000));
  return priceSeries(5, 412, dates, 0.0001, 0.0026, 420_000);
})();

/*
 * Browsers join a date and a time differently ("Oct 30, 03:55 PM" or "Oct 30 at 03:55 PM"), so the
 * intraday readout joins them itself and the prerendered text matches in every browser.
 */
const intradayDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

const intradayClock = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/New_York",
});

const intradayDate = (d: Date) => `${intradayDay.format(d)}, ${intradayClock.format(d)}`;

/** The "Candlestick chart" docs page (/charts/candlestick): live examples, props and notes. */
export function CandlestickChartPage() {
  const [symbol, setSymbol] = useState<"acme" | "globex">("acme");
  const data = stocks[symbol];
  const lastClose = data[data.length - 1]?.close ?? 0;
  return (
    <Page
      eyebrow="Chart"
      title="Candlestick chart"
      description="Prices over time as candles or OHLC bars, with a volume strip and a moving average. The readout always shows a candle (the latest, or the one under the crosshair), rising candles are hollow and falling ones filled, and you can zoom with a pinch or Ctrl/⌘ + scroll and pan by dragging (two fingers on a touch screen, where one finger reads the candles)."
      source={`${CHARTS}candlestick-chart.tsx`}
    >
      <ChartStage label="Candlestick chart demo" title="ACME Corp." hue={1} height="29.75rem" narrowHeight="33.75rem">
        <CandlestickChart
          data={stocks.acme}
          average={20}
          defaultRange={[stockDays.length - 60, stockDays.length]}
          format={(n) => usd2.format(n)}
          locale="en-US"
          timeZone="UTC"
          aria-label="ACME daily prices, last 160 trading days"
        />
      </ChartStage>
      <Example
        title="Daily candles, volume and a 20-day average"
        description="Opens on the last 60 trading days of 160. Zoom out with the buttons or a pinch; drag to pan (two fingers on touch); hover, tap or arrow through the candles. Switch the symbol: the price axis eases to the new range."
        variant="bare"
        controls={
          <Segmented
            label="Symbol"
            size="sm"
            options={[
              { value: "acme", label: "ACME" },
              { value: "globex", label: "GLBX" },
            ]}
            value={symbol}
            onValueChange={setSymbol}
          />
        }
        code={`
import { ChartCard, NumberTicker, CandlestickTable, CandlestickChart, type Candle } from "@sheenui/theme";

const data: Candle[] = [
  { date: "2026-06-08", open: 182.4, high: 185.1, low: 181.9, close: 184.7, volume: 18_400_000 },
  { date: "2026-06-09", open: 184.7, high: 187.3, low: 183.2, close: 186.9, volume: 21_100_000 },
  { date: "2026-06-10", open: 186.9, high: 188.0, low: 184.1, close: 185.2, volume: 17_900_000 },
  { date: "2026-06-11", open: 185.2, high: 186.4, low: 182.8, close: 183.5, volume: 22_300_000 },
  { date: "2026-06-12", open: 183.5, high: 187.6, low: 183.1, close: 187.2, volume: 25_800_000 },
]; // one candle per trading day, oldest first
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function Example() {
  const last = data[data.length - 1];
  if (!last) return null;
  return (
    <ChartCard
      title="ACME Corp."
      aside={<NumberTicker value={last.close} locales="en-US" format={{ style: "currency", currency: "USD" }} />}
      table={<CandlestickTable data={data} format={(n) => usd.format(n)} caption="Daily prices" />}
    >
      <CandlestickChart
        data={data}
        average={20}
        format={(n) => usd.format(n)}
        aria-label="ACME daily prices, last 5 trading days"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title={symbol === "acme" ? "ACME Corp." : "Globex Inc."}
          description={`NASDAQ: ${symbol === "acme" ? "ACME" : "GLBX"} · daily`}
          aside={
            <span className="text-lg font-semibold tabular-nums">
              <NumberTicker
                value={lastClose}
                from={lastClose * 0.9}
                locales="en-US"
                format={{ style: "currency", currency: "USD" }}
                live="off"
              />
            </span>
          }
          table={
            <CandlestickTable
              data={data}
              format={(n) => usd2.format(n)}
              locale="en-US"
              timeZone="UTC"
              caption={`${symbol.toUpperCase()} daily prices`}
            />
          }
        >
          <CandlestickChart
            data={data}
            average={20}
            defaultRange={[data.length - 60, data.length]}
            format={(n) => usd2.format(n)}
            locale="en-US"
            timeZone="UTC"
            aria-label={`${symbol.toUpperCase()} daily prices, last 160 trading days`}
          />
        </ChartCard>
      </Example>

      <Example
        title="OHLC bars, intraday"
        description="Five-minute bars for one session. OHLC bars put the open tick on the left and the close tick on the right; times replace dates on the axis automatically."
        variant="bare"
        code={`
import { CandlestickChart, type Candle } from "@sheenui/theme";

// Five-minute bars for one session (shortened); timestamps in UTC
const fiveMinuteBars: Candle[] = [
  { date: "2026-10-30T13:30:00Z", open: 118.2, high: 118.9, low: 117.8, close: 118.6, volume: 412_000 },
  { date: "2026-10-30T13:35:00Z", open: 118.6, high: 119.3, low: 118.4, close: 119.1, volume: 358_000 },
  { date: "2026-10-30T13:40:00Z", open: 119.1, high: 119.4, low: 118.2, close: 118.5, volume: 297_000 },
  { date: "2026-10-30T13:45:00Z", open: 118.5, high: 118.8, low: 117.9, close: 118.0, volume: 336_000 },
  { date: "2026-10-30T13:50:00Z", open: 118.0, high: 118.7, low: 117.7, close: 118.4, volume: 281_000 },
  { date: "2026-10-30T13:55:00Z", open: 118.4, high: 119.2, low: 118.3, close: 119.0, volume: 305_000 },
];

export function Example() {
  return (
    <CandlestickChart
      data={fiveMinuteBars}
      mode="ohlc"
      height={240}
      volumeHeight={52}
      timeZone="America/New_York"
      aria-label="NVLX, five-minute bars, Oct 30"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="NVLX · Oct 30"
          description="5-minute bars, regular session"
          table={
            <CandlestickTable
              data={intradayBars}
              locale="en-US"
              timeZone="America/New_York"
              formatDate={intradayDate}
              caption="Five-minute bars"
            />
          }
        >
          <CandlestickChart
            data={intradayBars}
            mode="ohlc"
            height={240}
            volumeHeight={52}
            locale="en-US"
            timeZone="America/New_York"
            formatDate={intradayDate}
            aria-label="NVLX, five-minute bars, Oct 30"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.CandlestickChart} />
      <PropsTable as="h2" title="CandlestickTable props" of={PROPS.CandlestickTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart, then the zoom buttons."],
          ["← / →", "Previous / next candle; the window follows the active candle."],
          ["Home / End", "First / last candle."],
          ["Shift + ← / Shift + →", "Pan the window."],
          ["+ / −", "Zoom in / out around the active candle."],
          ["0", "Show every candle."],
          ["Escape", "Clear the crosshair (the readout returns to the latest candle)."],
        ]}
      />
      <A11yNotes>
        <li>
          The chart is one focusable figure; its description is the keyboard hint. Each candle read by keyboard is
          announced once: date, open, high, low, close, the move in words (“down 1.68%”), volume and the average.
        </li>
        <li>
          Rising candles are hollow and falling ones filled, and the readout carries an arrow and a sign: color is never
          the only cue. The default green and red keep 3:1 against the chart in both themes.
        </li>
        <li>
          Volume has its own strip under the prices, on the same time axis: there is never a second y-axis on the price
          plot.
        </li>
        <li>
          A plain scroll never hijacks the page; Ctrl/⌘ + scroll (or a pinch) zooms, and a hint says so. Zoom buttons
          are real buttons, 44px on touch.
        </li>
        <li>
          The table view lists every candle with its change, newest first. Reduced motion draws everything in place.
        </li>
      </A11yNotes>
    </Page>
  );
}

const usd2 = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
