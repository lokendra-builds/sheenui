import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./slider-BfRG-_iF.js";import{t as i}from"./switch-BETATXZg.js";import{n as a,t as o}from"./histogram-kjh_yc-3.js";import{S as s}from"./kit-B2GyabAB.js";import{t as c}from"./ExampleChartCard-DOQs1ydL.js";import{t as l}from"./Example-jva669kg.js";import{t as u}from"./Segmented-kx7yHseo.js";import{o as d,s as f,t as p}from"./shared-Dbp0f8HM.js";var m=e(t(),1),h=n();function g(){let e=(0,m.useMemo)(()=>d(),[]),[t,n]=(0,m.useState)(!0),[g,_]=(0,m.useState)(24),[v,y]=(0,m.useState)(!0),[b,x]=(0,m.useState)(`this`),S=(0,m.useMemo)(()=>b===`this`?e:d(11,1100).map(e=>Math.round(e*1.18)),[b,e]),C=t?`auto`:g;return(0,h.jsx)(l,{title:`Latency with percentiles`,description:`1,200 API response times. Drag the slider to re-bin: bars morph to the new edges. The dashed lines mark the median, p95 and an SLO of 300 ms; hover, tap or arrow through the bins.`,variant:`bare`,controls:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(u,{label:`Week`,size:`sm`,options:[{value:`this`,label:`This week`},{value:`last`,label:`Last week`}],value:b,onValueChange:x}),(0,h.jsx)(i,{label:`Automatic bins`,checked:t,onCheckedChange:n}),!t&&(0,h.jsx)(r,{label:`Bins`,min:4,max:60,value:g,onValueChange:e=>_(e),className:`w-48`}),(0,h.jsx)(i,{label:`Density curve`,checked:v,onCheckedChange:y})]}),code:`
import { ChartCard, histogramLegend, HistogramTable, Histogram } from "@sheenui/theme";

// Response times in ms (a sample; yours is the full list)
const latencies: number[] = [
  84, 92, 97, 101, 104, 108, 111, 113, 116, 118, 121, 124, 127, 131, 135, 140,
  146, 153, 161, 172, 188, 206, 233, 271, 342, 96, 109, 119, 129, 150,
];
const ms = (n: number) => Math.round(n) + " ms";

export function Example() {
  return (
    <ChartCard
      title="API latency"
      description="Response times, this week"
      legend={histogramLegend({ density: true, labels: { bins: "Requests" } })}
      table={<HistogramTable values={latencies} bins="auto" format={ms} caption="API latency by range" />}
    >
      <Histogram
        values={latencies}
        bins="auto"
        density
        markers={["median", "p95", { value: 300, label: "SLO" }]}
        format={ms}
        xLabel="Response time"
        aria-label="Distribution of API response times"
      />
    </ChartCard>
  );
}`,children:(0,h.jsx)(c,{className:`w-full ${p}`,title:`API latency`,description:`Response times, ${b===`this`?`this`:`last`} week`,legend:s({density:v,labels:{bins:`Requests`}}),table:(0,h.jsx)(a,{values:S,bins:C,format:f,caption:`API latency by range`}),children:(0,h.jsx)(o,{values:S,bins:C,density:v,markers:[`median`,`p95`,{value:300,label:`SLO`}],format:f,xLabel:`Response time`,"aria-label":`Distribution of API response times`})})})}export{g as LatencyExample};