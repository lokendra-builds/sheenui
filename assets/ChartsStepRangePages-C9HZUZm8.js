import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./glass-card-OGQy5mxG.js";import{t as a}from"./sparkbar-Df7t-qZu.js";import{i as o,n as s,o as c,r as l}from"./Page-BAL5Idhy.js";import{t as u}from"./Example-BPfHvEYD.js";import{t as d}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{t as f}from"./shared-CwZXbVMJ.js";var p=[[`values`,`readonly (number | null | undefined)[]`,``,`Values, oldest first. A missing (non-numeric) entry leaves its slot empty: a gap, never a zero.`,!0],[`variant`,`"bar" | "winloss"`,`"bar"`,`"bar": tiny columns, sized by value (negative values hang below a zero line). "winloss": only the sign counts: up for a win (> 0), down for a loss (< 0), a dash for a draw (0).`,!1],[`highlight`,`number | "none" | "last"`,`variant === "bar" ? "last" : "none"`,'Which bar to emphasise at full strength; the rest step back to a lighter step of the same hue. "last" (the latest value; default for "bar"), "none" (default for "winloss"), or an index into `values` (negative counts from the end: -1 is the last entry). An index outside `values`, or on a gap, emphasises nothing.',!1],[`color`,`ChartColor`,`1`,`Colour slot of the bars ("bar"), or of wins ("winloss").`,!1],[`negativeColor`,`ChartColor`,`2`,`Sets the colour slot of losses ("winloss").`,!1],[`height`,`number`,`32`,`Height of the chart in px; the width follows the container.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats the low / high / latest values in the spoken summary.`,!1],[`aria-label`,`string`,``,`Name the trend, e.g. "Weekly signups". A summary of the values is appended. Without it the sparkbar is decorative.`,!1],[`labels`,`Partial<SparkbarLabels>`,`defaultSparkbarLabels`,'Every other string, for translation: `labels={{ barSummary: "…" }}`; omitted keys keep the English of `defaultSparkbarLabels`. All 3 keys of `SparkbarLabels` are listed in the key table under the props table.',!1,{type:`SparkbarLabels`,const:`defaultSparkbarLabels`,keys:[[`barSummary`,"(low, high, latest) => `low ${low}, high ${high}, latest ${latest}`"],[`winLossSummary`,'(wins, losses, draws) => [ `${wins} ${wins === 1 ? "win" : "wins"}`, `${losses} ${losses === 1 ? "loss" : "...'],[`empty`,`No data`]]}],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],m=e(t()),h=n(),g=[`Nov`,`Dec`,`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`];g.map((e,t)=>({month:e,pro:t<3?42:t<7?45:48,team:t<4?50:t<9?54:57,enterprise:t<6?60:66})),g.map((e,t)=>({month:e,seats:[120,120,135,135,150,180,180,210,210,240,236,262][t]??0}));var _=[{label:`Signups`,value:`1,284`,values:[62,74,70,81,77,92,88,97,104,99,112,126],note:`Weekly, last 12 weeks`},{label:`Orders`,value:`3,912`,values:[210,244,236,251,290,302,287,276,318,331,309,358,362,371],note:`Daily, last 14 days`},{label:`Net cash flow`,value:`+$18.4K`,values:[4.2,-1.8,3.1,5.6,-.6,-2.4,1.9,6.8,3.3,-1.1,4.7,2.5],note:`Weekly, US$ thousands`,highlight:`none`}],v=[{team:`Harbour City`,results:[1,1,-1,1,1,0,1,1,-1,1,1,1]},{team:`Northfield Rovers`,results:[1,-1,1,0,1,-1,1,1,0,-1,1,1]},{team:`Ashdown Athletic`,results:[-1,1,0,-1,1,-1,-1,1,1,0,-1,1]},{team:`Kestrel Town`,results:[-1,-1,1,-1,0,-1,1,-1,-1,1,-1,0]}];function y(){let[e,t]=(0,m.useState)(_[1]?.values??[]);return(0,h.jsxs)(s,{eyebrow:`Chart`,title:`Sparkbar`,description:`The bar twin of Sparkline, for stat tiles and table cells. Bar mode shows magnitude with the current period at full strength and history a lighter step of the same hue; win/loss mode shows only the sign. Screen readers hear a summary (low, high and latest, or the record), not a list of numbers.`,source:`${f}sparkbar.tsx`,children:[(0,h.jsx)(d,{label:`Sparkbar demo`,title:`Signups, weekly`,hue:1,height:`9rem`,children:(0,h.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,h.jsxs)(`p`,{className:`flex items-baseline gap-3`,children:[(0,h.jsx)(`span`,{className:`text-3xl font-semibold text-sheen-fg tabular-nums`,children:`1,186`}),(0,h.jsx)(`span`,{className:`text-sm font-medium text-sheen-success-text`,children:`▲ 12.7% vs last week`})]}),(0,h.jsx)(a,{height:96,values:[62,74,70,81,77,92,88,97,104,99,112,126],"aria-label":`Weekly signups`})]})}),(0,h.jsx)(u,{title:`In stat tiles`,description:`The latest bar is drawn at full strength; earlier bars recede to a lighter tint. Values below zero hang from a zero line. Use highlight="none" when no period is special.`,stageClassName:`grid grid-cols-1 gap-4 sm:grid-cols-3`,controls:(0,h.jsx)(r,{variant:`glass`,size:`sm`,onClick:()=>t(e=>[...e.slice(1),Math.round(300+Math.random()*90)]),children:`Add a day of orders`}),code:`
import { GlassCard, Sparkbar } from "@sheenui/theme";

const tiles = [
  {
    label: "Signups",
    value: "1,284",
    values: [62, 74, 70, 81, 77, 92, 88, 97, 104, 99, 112, 126],
    note: "Weekly, last 12 weeks",
  },
  {
    label: "Orders",
    value: "3,912",
    values: [210, 244, 236, 251, 290, 302, 287, 276, 318, 331, 309, 358, 362, 371],
    note: "Daily, last 14 days",
  },
  {
    label: "Net cash flow",
    value: "+$18.4K",
    values: [4.2, -1.8, 3.1, 5.6, -0.6, -2.4, 1.9, 6.8, 3.3, -1.1, 4.7, 2.5],
    note: "Weekly, US$ thousands",
    highlight: "none" as const,
  },
];

export function Example() {
  return (
    <>
      {tiles.map((tile) => (
        <GlassCard key={tile.label} className="flex min-w-0 flex-col gap-2 p-5">
          <p className="text-sm text-sheen-fg-muted">{tile.label}</p>
          <p className="text-3xl font-semibold tracking-tight">{tile.value}</p>
          <Sparkbar
            values={tile.values}
            highlight={tile.highlight}
            aria-label={\`\${tile.label}, \${tile.note.toLowerCase()}\`}
          />
          <p className="text-2xs text-sheen-fg-muted">{tile.note}</p>
        </GlassCard>
      ))}
    </>
  );
}`,children:_.map(t=>(0,h.jsxs)(i,{className:`flex min-w-0 flex-col gap-2 p-5`,children:[(0,h.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:t.label}),(0,h.jsx)(`p`,{className:`text-3xl font-semibold tracking-tight`,children:t.value}),(0,h.jsx)(a,{values:t.label===`Orders`?e:t.values,highlight:t.highlight,"aria-label":`${t.label}, ${t.note.toLowerCase()}`}),(0,h.jsx)(`p`,{className:`text-2xs text-sheen-fg-muted`,children:t.note})]},t.label))}),(0,h.jsx)(u,{title:`Win / loss in a table`,description:`Only the sign counts: up for a win, down for a loss, a short dash for a draw. Wins and losses use two distinct palette hues (not success and danger: a loss isn't an error).`,variant:`bare`,code:`
import { GlassCard, Sparkbar } from "@sheenui/theme";

const standings = [
  { team: "Harbour City", results: [1, 1, -1, 1, 1, 0, 1, 1, -1, 1, 1, 1] },
  { team: "Northfield Rovers", results: [1, -1, 1, 0, 1, -1, 1, 1, 0, -1, 1, 1] },
  { team: "Ashdown Athletic", results: [-1, 1, 0, -1, 1, -1, -1, 1, 1, 0, -1, 1] },
  { team: "Kestrel Town", results: [-1, -1, 1, -1, 0, -1, 1, -1, -1, 1, -1, 0] },
];

export function Example() {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div role="region" aria-label="League form" tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-start text-sm">
          <caption className="sr-only">League form, last 12 matches</caption>
          <thead className="text-xs text-sheen-fg-muted">
            <tr className="border-b border-sheen-border">
              <th scope="col" className="px-5 py-3 font-medium">Team</th>
              <th scope="col" className="px-5 py-3 font-medium">Last 12</th>
              <th scope="col" className="px-5 py-3 text-end font-medium">W–D–L</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const w = row.results.filter((r) => r > 0).length;
              const l = row.results.filter((r) => r < 0).length;
              return (
                <tr key={row.team} className="border-b border-sheen-border last:border-0">
                  <th scope="row" className="px-5 py-3 font-medium whitespace-nowrap">{row.team}</th>
                  <td className="w-56 px-5 py-3">
                    <Sparkbar
                      variant="winloss"
                      height={24}
                      values={row.results}
                      aria-label={\`\${row.team}, last 12 matches\`}
                    />
                  </td>
                  <td className="px-5 py-3 text-end whitespace-nowrap tabular-nums">
                    {w}–{row.results.length - w - l}–{l}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}`,children:(0,h.jsx)(i,{className:`overflow-hidden p-0`,children:(0,h.jsx)(`div`,{role:`region`,"aria-label":`League form`,tabIndex:0,className:`overflow-x-auto rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus`,children:(0,h.jsxs)(`table`,{className:`w-full min-w-[30rem] text-start [:where(&)_th]:text-start text-sm`,children:[(0,h.jsx)(`caption`,{className:`sr-only`,children:`League form, last 12 matches`}),(0,h.jsx)(`thead`,{className:`text-xs text-sheen-fg-muted`,children:(0,h.jsxs)(`tr`,{className:`border-b border-sheen-border`,children:[(0,h.jsx)(`th`,{scope:`col`,className:`px-5 py-3 font-medium`,children:`Team`}),(0,h.jsx)(`th`,{scope:`col`,className:`px-5 py-3 font-medium`,children:`Last 12`}),(0,h.jsx)(`th`,{scope:`col`,className:`px-5 py-3 text-end font-medium`,children:`W–D–L`})]})}),(0,h.jsx)(`tbody`,{children:v.map(e=>{let t=e.results.filter(e=>e>0).length,n=e.results.filter(e=>e<0).length;return(0,h.jsxs)(`tr`,{className:`border-b border-sheen-border last:border-0`,children:[(0,h.jsx)(`th`,{scope:`row`,className:`px-5 py-3 font-medium whitespace-nowrap`,children:e.team}),(0,h.jsx)(`td`,{className:`w-56 px-5 py-3`,children:(0,h.jsx)(a,{variant:`winloss`,height:24,values:e.results,"aria-label":`${e.team}, last 12 matches`})}),(0,h.jsxs)(`td`,{className:`px-5 py-3 text-end whitespace-nowrap tabular-nums`,children:[t,`–`,e.results.length-t-n,`–`,n]})]},e.team)})})]})})})}),(0,h.jsx)(l,{of:p}),(0,h.jsx)(c,{rows:[[`Tab`,`Not applicable: the sparkbar is not interactive, so it is not a tab stop.`]]}),(0,h.jsx)(o,{notes:[`With an aria-label it is an image named by that label plus a short summary (or “No data”); without one it is decorative.`,`Put the number it summarizes next to it as text: the bars are a glanceable hint, not the only source of the value.`,`Under reduced motion nothing morphs: the bars render at their final values and new data replaces the old at once.`]})]})}export{y as default};