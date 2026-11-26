import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./candlestick-chart-jfBZOiI0.js";import{t as i}from"./table-BBqReFfk.js";import{t as a}from"./number-ticker-CM_hhE6n.js";import{t as o}from"./ExampleChartCard-DOQs1ydL.js";import{t as s}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{i as c,n as l,o as u,r as d}from"./Page-BAL5Idhy.js";import{n as f,t as p}from"./CandlestickTable-CMzY8fB5.js";import{t as m}from"./demo-utils-DKtmFFFD.js";import{t as h}from"./Example-BPfHvEYD.js";import{t as g}from"./Segmented-kx7yHseo.js";import{r as _,t as v}from"./shared-DRPI2QvD.js";var y=e(t()),b=n();function x(e,t=Date.UTC(2026,9,30)){let n=[];for(let r=t;n.length<e;r-=864e5){let e=new Date(r);e.getUTCDay()!==0&&e.getUTCDay()!==6&&n.unshift(e)}return n}function S(e,t,n,r=6e-4,i=.016,a=18e6){let o=m(e),s=_(o),c=t,l=i;return n.map(e=>{l=Math.max(i*.5,Math.min(i*2.4,l*(.9+o()*.2)+(o()>.94?i*.8:0)));let t=c*(1+s()*l*.25),n=t*(1+r+s()*l),u=Math.max(t,n)*(1+Math.abs(s())*l*.45),d=Math.min(t,n)*(1-Math.abs(s())*l*.45),f=Math.abs(n-t)/t,p=Math.round(a*(.6+o()*.6+f*28));c=n;let m=e=>Math.round(e*100)/100;return{date:e,open:m(t),high:m(u),low:m(d),close:m(n),volume:p}})}var C=x(160),w={acme:S(31,182,C,3e-4),globex:S(77,64,C,-2e-4,.022,41e6)},T=(()=>{let e=Date.UTC(2026,9,30,13,30);return S(5,412,Array.from({length:78},(t,n)=>new Date(e+n*5*6e4)),1e-4,.0026,42e4)})(),E=new Intl.DateTimeFormat(`en-US`,{month:`short`,day:`numeric`,timeZone:`America/New_York`}),D=new Intl.DateTimeFormat(`en-US`,{hour:`2-digit`,minute:`2-digit`,timeZone:`America/New_York`}),O=e=>`${E.format(e)}, ${D.format(e)}`;function k(){let[e,t]=(0,y.useState)(`acme`),n=w[e],m=n[n.length-1]?.close??0;return(0,b.jsxs)(l,{eyebrow:`Chart`,title:`Candlestick chart`,description:`Prices over time as candles or OHLC bars, with a volume strip and a moving average. The readout always shows a candle (the latest, or the one under the crosshair), rising candles are hollow and falling ones filled, and you can zoom with a pinch or Ctrl/⌘ + scroll and pan by dragging (two fingers on a touch screen, where one finger reads the candles).`,source:`${v}candlestick-chart.tsx`,children:[(0,b.jsx)(s,{label:`Candlestick chart demo`,title:`ACME Corp.`,hue:1,height:`29.75rem`,narrowHeight:`33.75rem`,children:(0,b.jsx)(r,{data:w.acme,average:20,defaultRange:[C.length-60,C.length],format:e=>A.format(e),locale:`en-US`,timeZone:`UTC`,"aria-label":`ACME daily prices, last 160 trading days`})}),(0,b.jsx)(h,{title:`Daily candles, volume and a 20-day average`,description:`Opens on the last 60 trading days of 160. Zoom out with the buttons or a pinch; drag to pan (two fingers on touch); hover, tap or arrow through the candles. Switch the symbol: the price axis eases to the new range.`,variant:`bare`,controls:(0,b.jsx)(g,{label:`Symbol`,size:`sm`,options:[{value:`acme`,label:`ACME`},{value:`globex`,label:`GLBX`}],value:e,onValueChange:t}),code:`
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
}`,children:(0,b.jsx)(o,{className:`w-full`,title:e===`acme`?`ACME Corp.`:`Globex Inc.`,description:`NASDAQ: ${e===`acme`?`ACME`:`GLBX`} · daily`,aside:(0,b.jsx)(`span`,{className:`text-lg font-semibold tabular-nums`,children:(0,b.jsx)(a,{value:m,from:m*.9,locales:`en-US`,format:{style:`currency`,currency:`USD`},live:`off`})}),table:(0,b.jsx)(i,{data:n,format:e=>A.format(e),locale:`en-US`,timeZone:`UTC`,caption:`${e.toUpperCase()} daily prices`}),children:(0,b.jsx)(r,{data:n,average:20,defaultRange:[n.length-60,n.length],format:e=>A.format(e),locale:`en-US`,timeZone:`UTC`,"aria-label":`${e.toUpperCase()} daily prices, last 160 trading days`})})}),(0,b.jsx)(h,{title:`OHLC bars, intraday`,description:`Five-minute bars for one session. OHLC bars put the open tick on the left and the close tick on the right; times replace dates on the axis automatically.`,variant:`bare`,code:`
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
}`,children:(0,b.jsx)(o,{className:`w-full`,title:`NVLX · Oct 30`,description:`5-minute bars, regular session`,table:(0,b.jsx)(i,{data:T,locale:`en-US`,timeZone:`America/New_York`,formatDate:O,caption:`Five-minute bars`}),children:(0,b.jsx)(r,{data:T,mode:`ohlc`,height:240,volumeHeight:52,locale:`en-US`,timeZone:`America/New_York`,formatDate:O,"aria-label":`NVLX, five-minute bars, Oct 30`})})}),(0,b.jsx)(d,{of:f}),(0,b.jsx)(d,{as:`h2`,title:`CandlestickTable props`,of:p}),(0,b.jsx)(u,{rows:[[`Tab`,`Focus the chart, then the zoom buttons.`],[`← / →`,`Previous / next candle; the window follows the active candle.`],[`Home / End`,`First / last candle.`],[`Shift + ← / Shift + →`,`Pan the window.`],[`+ / −`,`Zoom in / out around the active candle.`],[`0`,`Show every candle.`],[`Escape`,`Clear the crosshair (the readout returns to the latest candle).`]]}),(0,b.jsxs)(c,{children:[(0,b.jsx)(`li`,{children:`The chart is one focusable figure; its description is the keyboard hint. Each candle read by keyboard is announced once: date, open, high, low, close, the move in words (“down 1.68%”), volume and the average.`}),(0,b.jsx)(`li`,{children:`Rising candles are hollow and falling ones filled, and the readout carries an arrow and a sign: color is never the only cue. The default green and red keep 3:1 against the chart in both themes.`}),(0,b.jsx)(`li`,{children:`Volume has its own strip under the prices, on the same time axis: there is never a second y-axis on the price plot.`}),(0,b.jsx)(`li`,{children:`A plain scroll never hijacks the page; Ctrl/⌘ + scroll (or a pinch) zooms, and a hint says so. Zoom buttons are real buttons, 44px on touch.`}),(0,b.jsx)(`li`,{children:`The table view lists every candle with its change, newest first. Reduced motion draws everything in place.`})]})]})}var A=new Intl.NumberFormat(`en`,{style:`currency`,currency:`USD`,minimumFractionDigits:2,maximumFractionDigits:2});export{k as CandlestickChartPage};