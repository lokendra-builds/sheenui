import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{t}from"./ExampleChartCard-DOQs1ydL.js";import{i as n,n as r,o as i,r as a}from"./Page-y_OVkLtr.js";import{t as o}from"./Example-B3x8pgFu.js";import{t as s}from"./geo-map-D6wWdCPD.js";import{t as c}from"./table-POLq3UFu.js";import{t as l}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{t as u}from"./shared-Dc9MDEpx.js";import{i as d,t as f}from"./vendor-react-D30i__oY.js";import{t as p}from"./number-ticker-CM_hhE6n.js";import{r as m}from"./toast-PePh6sao.js";import{t as h}from"./Segmented-kx7yHseo.js";var g=[[`data`,`readonly WorldMapDatum[]`,`[]`,'Values by country (choropleth), or bubble sizes at each country\'s centre (`mode="bubble"`).',!1],[`points`,`readonly WorldMapPoint[]`,``,`Bubbles at coordinates (cities, offices). Drawn in bubble mode.`,!1],[`mode`,`"choropleth" | "bubble"`,`"choropleth"`,`Colour each country by its value, or size a bubble by it.`,!1],[`scale`,`"sequential" | "diverging"`,`"sequential"`,'Choropleth scale: "sequential" (one hue, light → dark: counts, rates) or "diverging" (two hues around a neutral `midpoint`: growth, change, sentiment).',!1],[`midpoint`,`number`,`0`,`Value at the neutral centre of a diverging scale.`,!1],[`scaleType`,`"log" | "linear" | "quantile"`,`"linear"`,`How values spread over a sequential scale: "linear" (default); "log" for skewed data where one market dwarfs the rest (revenue, population); "quantile" ranks the values, so each colour holds about the same number of countries.`,!1],[`color`,`ChartColor`,`1`,`Hue of the sequential scale and of bubbles: a palette slot 1–8.`,!1],[`divergingColors`,`[ChartColor, ChartColor]`,`[2, 7]`,`Hues below and above the midpoint of a diverging scale.`,!1],[`domain`,`[number, number]`,`the data's range (from 0 when every value is positive)`,`The [min, max] the color scale spans; values outside it take the end colors.`,!1],[`steps`,`number`,`0`,`Classes on the scale (e.g. 5); 0 = continuous.`,!1],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a region's value for the tooltips, legend and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the number format and of country names (Intl).`,!1],[`valueLabel`,`string`,``,`Name of the measure (legend caption, tooltip), e.g. "Revenue".`,!1],[`legend`,`boolean`,`true`,`Show the colour (or size) key under the map.`,!1],[`zoomable`,`boolean`,`true`,`Allow zooming and panning (buttons, ⌘/Ctrl + scroll, pinch, drag, + / −).`,!1],[`maxZoom`,`number`,`8`,`Deepest zoom level: the map magnifies up to this many times its fitted size.`,!1],[`shapes`,`readonly WorldCountryShape[]`,``,`Your own outlines in the same frame (skips loading the bundled world).`,!1],[`onSelect`,`((selection: WorldMapSelection) => void)`,``,`Called with a country (or bubble) on click, Enter or Space.`,!1],[`emptyState`,`ReactNode`,"`labels.noData`, applied from the labels object",`Shown over the map when there is no data. Default "No data".`,!1],[`labels`,`Partial<WorldMapLabels>`,`defaultWorldMapLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultWorldMapLabels`. All 20 keys of `WorldMapLabels` are listed in the key table under the props table.',!1,{type:`WorldMapLabels`,const:`defaultWorldMapLabels`,keys:[[`instructions`,`Arrow keys move to the neighbouring country, Page Up and Page Down step through them by value, Home and End jump to the highest and lowest. Type a name to jump to it. Plus and minus zoom, 0 resets.`],[`instructionsBubble`,`Arrow keys move to the nearest place in that direction, Page Up and Page Down step through them by value, Home and End jump to the highest and lowest. Type a name to jump to it. Plus and minus zoom, 0 resets.`],[`roleDescription`,`map`],[`noData`,`No data`],[`noDataKey`,`No data`],[`hint`,`Tap a country for its value`],[`hintBubble`,`Tap a bubble for its value`],[`zoomIn`,`Zoom in`],[`zoomOut`,`Zoom out`],[`resetZoom`,`Reset zoom`],[`zoomControls`,"(name) => `${name}: zoom`"],[`zoomHint`,`(mac) => (mac ? "Use ⌘ + scroll to zoom the map" : "Use Ctrl + scroll to zoom the map")`],[`logScale`,"(caption) => `${caption} (log)`"],[`rank`,"(rank, total) => `Rank ${rank} of ${total}`"],[`loadError`,`The map could not be loaded.`],[`rankHeader`,`Rank`],[`country`,`Country`],[`place`,`Place`],[`value`,`Value`],[`share`,`Share`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],_=[[`data`,`readonly WorldMapDatum[]`,`[]`,'Values by country (choropleth), or bubble sizes at each country\'s centre (`mode="bubble"`).',!1],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a region's value for the tooltips, legend and data table: takes the number, returns the text shown.`,!1],[`mode`,`"choropleth" | "bubble"`,`"choropleth"`,`Colour each country by its value, or size a bubble by it.`,!1],[`points`,`readonly WorldMapPoint[]`,``,`Bubbles at coordinates (cities, offices). Drawn in bubble mode.`,!1],[`labels`,`Partial<WorldMapLabels>`,`defaultWorldMapLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultWorldMapLabels`. All 20 keys of `WorldMapLabels` are listed in the key table under the props table.',!1,{type:`WorldMapLabels`,const:`defaultWorldMapLabels`,keys:[[`instructions`,`Arrow keys move to the neighbouring country, Page Up and Page Down step through them by value, Home and End jump to the highest and lowest. Type a name to jump to it. Plus and minus zoom, 0 resets.`],[`instructionsBubble`,`Arrow keys move to the nearest place in that direction, Page Up and Page Down step through them by value, Home and End jump to the highest and lowest. Type a name to jump to it. Plus and minus zoom, 0 resets.`],[`roleDescription`,`map`],[`noData`,`No data`],[`noDataKey`,`No data`],[`hint`,`Tap a country for its value`],[`hintBubble`,`Tap a bubble for its value`],[`zoomIn`,`Zoom in`],[`zoomOut`,`Zoom out`],[`resetZoom`,`Reset zoom`],[`zoomControls`,"(name) => `${name}: zoom`"],[`zoomHint`,`(mac) => (mac ? "Use ⌘ + scroll to zoom the map" : "Use Ctrl + scroll to zoom the map")`],[`logScale`,"(caption) => `${caption} (log)`"],[`rank`,"(rank, total) => `Rank ${rank} of ${total}`"],[`loadError`,`The map could not be loaded.`],[`rankHeader`,`Rank`],[`country`,`Country`],[`place`,`Place`],[`value`,`Value`],[`share`,`Share`]]}],[`locale`,`string`,`"en"`,`Locale of the number format and of country names (Intl).`,!1],[`valueLabel`,`string`,``,`Name of the measure (legend caption, tooltip), e.g. "Revenue".`,!1],[`shapes`,`readonly WorldCountryShape[]`,``,`Your own outlines in the same frame (skips loading the bundled world).`,!1],[`share`,`boolean`,`false`,`Add a share-of-total column (for additive measures: revenue, users).`,!1],[`caption`,`string`,``,`Sets a visually hidden caption that names the table.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there are no rows.`,!1]],v=e(d(),1),y=f(),b=[[`US`,482e4,124e4],[`CA`,612e3,188e3],[`MX`,248e3,142e3],[`BR`,386e3,296e3],[`AR`,92e3,71e3],[`CL`,74e3,39e3],[`CO`,66e3,58e3],[`PE`,31e3,27e3],[`GB`,124e4,352e3],[`IE`,188e3,41e3],[`FR`,702e3,214e3],[`DE`,948e3,268e3],[`NL`,356e3,92e3],[`BE`,142e3,38e3],[`ES`,318e3,131e3],[`PT`,96e3,44e3],[`IT`,402e3,156e3],[`CH`,264e3,48e3],[`AT`,118e3,31e3],[`SE`,236e3,64e3],[`NO`,158e3,33e3],[`DK`,131e3,29e3],[`FI`,87e3,22e3],[`PL`,172e3,97e3],[`CZ`,64e3,3e4],[`IN`,538e3,912e3],[`CN`,296e3,204e3],[`JP`,684e3,233e3],[`KR`,322e3,118e3],[`ID`,118e3,176e3],[`PH`,72e3,109e3],[`VN`,58e3,94e3],[`TH`,81e3,73e3],[`MY`,69e3,51e3],[`AU`,476e3,121e3],[`NZ`,84e3,22e3],[`ZA`,108e3,79e3],[`NG`,46e3,88e3],[`KE`,28e3,41e3],[`EG`,39e3,62e3],[`MA`,22e3,26e3],[`AE`,162e3,37e3],[`SA`,121e3,46e3],[`IL`,143e3,34e3],[`TR`,97e3,83e3]],x=b.map(([e,t])=>({id:e,value:t})),S=[[`RU`,118e3],[`KZ`,21e3],[`UA`,61e3],[`BY`,14e3],[`RO`,52e3],[`HU`,44e3],[`GR`,49e3],[`BG`,23e3],[`RS`,17e3],[`HR`,26e3],[`SK`,29e3],[`IS`,12e3],[`LT`,16e3],[`LV`,11e3],[`EE`,18e3],[`IR`,24e3],[`IQ`,13e3],[`PK`,57e3],[`BD`,34e3],[`LK`,15e3],[`NP`,9e3],[`UZ`,8e3],[`SG`,204e3],[`VE`,19e3],[`EC`,27e3],[`BO`,1e4],[`PY`,12e3],[`UY`,33e3],[`CU`,6e3],[`PA`,21e3],[`CR`,24e3],[`GT`,13e3],[`DZ`,19e3],[`TN`,17e3],[`LY`,7e3],[`SD`,6e3],[`ET`,14e3],[`GH`,25e3],[`CI`,18e3],[`SN`,11e3],[`TZ`,16e3],[`UG`,12e3],[`AO`,9e3],[`MZ`,8e3],[`ZM`,7e3],[`ZW`,6e3],[`CD`,1e4],[`CM`,13e3],[`MG`,5e3],[`NA`,8e3],[`BW`,9e3],[`JO`,2e4],[`LB`,12e3],[`QA`,56e3],[`KW`,37e3],[`OM`,15e3],[`AF`,4e3],[`MN`,7e3],[`MM`,11e3],[`KH`,1e4],[`LA`,5e3]],C=[...x,...S.map(([e,t])=>({id:e,value:t}))],w=b.map(([e,,t])=>({id:e,value:t})),T=b.reduce((e,[,t])=>e+t,0),E=b.reduce((e,[,,t])=>e+t,0),D=[[`US`,.08],[`CA`,.11],[`MX`,.27],[`BR`,.34],[`AR`,-.12],[`CL`,.05],[`CO`,.22],[`PE`,.18],[`GB`,-.04],[`IE`,.09],[`FR`,.02],[`DE`,-.07],[`NL`,.06],[`ES`,.14],[`PT`,.21],[`IT`,-.02],[`SE`,.03],[`NO`,-.09],[`PL`,.31],[`UA`,-.24],[`RU`,-.31],[`TR`,.12],[`IN`,.58],[`CN`,-.15],[`JP`,.01],[`KR`,.07],[`ID`,.44],[`PH`,.39],[`VN`,.52],[`TH`,.17],[`AU`,.04],[`NZ`,-.03],[`ZA`,.16],[`NG`,.61],[`KE`,.47],[`EG`,.23],[`SA`,.19],[`AE`,.26]].map(([e,t])=>({id:e,value:t})),O=[{label:`San Francisco`,lon:-122.42,lat:37.77,value:182e3},{label:`New York`,lon:-74,lat:40.71,value:241e3},{label:`Toronto`,lon:-79.38,lat:43.65,value:64e3},{label:`Mexico City`,lon:-99.13,lat:19.43,value:52e3},{label:`São Paulo`,lon:-46.63,lat:-23.55,value:97e3},{label:`Buenos Aires`,lon:-58.38,lat:-34.6,value:31e3},{label:`London`,lon:-.13,lat:51.51,value:168e3},{label:`Paris`,lon:2.35,lat:48.86,value:92e3},{label:`Berlin`,lon:13.4,lat:52.52,value:104e3},{label:`Stockholm`,lon:18.07,lat:59.33,value:38e3},{label:`Madrid`,lon:-3.7,lat:40.42,value:47e3},{label:`Lagos`,lon:3.38,lat:6.52,value:29e3},{label:`Nairobi`,lon:36.82,lat:-1.29,value:17e3},{label:`Cairo`,lon:31.24,lat:30.04,value:21e3},{label:`Dubai`,lon:55.27,lat:25.2,value:44e3},{label:`Bengaluru`,lon:77.59,lat:12.97,value:156e3},{label:`Mumbai`,lon:72.88,lat:19.08,value:88e3},{label:`Singapore`,lon:103.82,lat:1.35,value:73e3},{label:`Jakarta`,lon:106.85,lat:-6.21,value:41e3},{label:`Tokyo`,lon:139.69,lat:35.69,value:131e3},{label:`Seoul`,lon:126.98,lat:37.57,value:69e3},{label:`Shanghai`,lon:121.47,lat:31.23,value:58e3},{label:`Sydney`,lon:151.21,lat:-33.87,value:76e3},{label:`Auckland`,lon:174.76,lat:-36.85,value:14e3},{label:`Johannesburg`,lon:28.05,lat:-26.2,value:23e3}],k=new Intl.NumberFormat(`en`,{style:`currency`,currency:`USD`,notation:`compact`,maximumFractionDigits:1}),A=e=>k.format(e),j=new Intl.NumberFormat(`en`,{style:`percent`,maximumFractionDigits:0,signDisplay:`exceptZero`}),M=e=>j.format(e).replace(`-`,`−`),N=[[`DE`,92],[`FR`,86],[`ES`,94],[`IT`,85],[`PL`,87],[`SE`,96],[`NO`,99],[`FI`,93],[`GB`,96],[`IE`,95],[`PT`,84],[`GR`,83],[`RO`,86],[`HU`,89],[`CZ`,85],[`AT`,93],[`CH`,96],[`NL`,97],[`BE`,94],[`DK`,98],[`UA`,79],[`TR`,83],[`EG`,72],[`MA`,88],[`DZ`,71],[`NG`,55],[`KE`,40],[`ET`,19],[`ZA`,72],[`CD`,27],[`US`,92],[`CA`,94],[`MX`,76],[`BR`,81],[`AR`,88],[`IN`,46],[`CN`,77],[`JP`,84],[`ID`,66],[`AU`,96],[`RU`,90],[`KZ`,91],[`IR`,79],[`PK`,33],[`BD`,39],[`SA`,100],[`VN`,79],[`TH`,88],[`PH`,73],[`CO`,73]].map(([e,t])=>({id:e,value:t})),P={instructions:`Pfeiltasten wechseln zum Nachbarland, Bild auf und Bild ab gehen nach Wert, Pos1 und Ende springen zum höchsten und niedrigsten Wert. Tippen Sie einen Namen, um dorthin zu springen. Plus und Minus zoomen, 0 setzt zurück.`,roleDescription:`Karte`,noData:`Keine Daten`,noDataKey:`Keine Daten`,hint:`Tippen Sie auf ein Land`,zoomIn:`Vergrößern`,zoomOut:`Verkleinern`,resetZoom:`Zurücksetzen`,zoomControls:e=>`${e}: Zoom`,zoomHint:e=>e?`⌘ + Scrollen zoomt die Karte`:`Strg + Scrollen zoomt die Karte`,logScale:e=>`${e} (log.)`,rank:(e,t)=>`Rang ${e} von ${t}`,loadError:`Die Karte konnte nicht geladen werden.`};function F(){let[e,n]=(0,v.useState)(`revenue`),r=e===`revenue`?x:w,i=e===`revenue`?A:void 0,a=e===`revenue`?`Revenue`:`Active users`,l=m();return(0,y.jsx)(o,{title:`Choropleth map in React`,description:`Revenue by country on a single-hue scale, light to dark. One market dwarfs the rest, so scaleType="log" spreads the others across the ramp. Switch the measure: the map cross-fades to the new colors and the headline rolls to the new total. Hover a country, or focus the map and use the arrow keys; ⌘/Ctrl + scroll, pinch or the buttons zoom.`,variant:`bare`,controls:(0,y.jsx)(h,{label:`Measure`,size:`sm`,options:[{value:`revenue`,label:`Revenue`},{value:`users`,label:`Active users`}],value:e,onValueChange:n}),code:`
import { useToast, ChartCard, NumberTicker, WorldMapTable, WorldMap } from "@sheenui/theme";

const revenue = [
  { id: "US", value: 4_820_000 },
  { id: "GB", value: 1_240_000 },
  { id: "DE", value: 948_000 },
  { id: "IN", value: 538_000 },
  // … any ISO 3166-1 code: "IN", "IND" or "356"
];
const total = revenue.reduce((sum, d) => sum + (d.value ?? 0), 0);
const usd = new Intl.NumberFormat("en", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const toast = useToast(); // inside your component

<ChartCard
  title="Revenue by country"
  description="Last 12 months"
  aside={<NumberTicker value={total} format={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }} />}
  table={<WorldMapTable data={revenue} valueLabel="Revenue" format={usd.format} share />}
>
  <WorldMap
    data={revenue}
    scaleType="log" // one market dwarfs the rest: spread them on a log scale
    valueLabel="Revenue"
    format={usd.format}
    onSelect={(country) => toast.info(country.name, country.value === null ? "No data" : usd.format(country.value))}
    aria-label="Revenue by country, last 12 months"
  />
</ChartCard>`,children:(0,y.jsx)(t,{className:`w-full`,title:`${a} by country`,description:`Last 12 months, 45 markets`,aside:(0,y.jsx)(`span`,{className:`text-2xl font-semibold tracking-tight tabular-nums`,children:(0,y.jsx)(p,{value:e===`revenue`?T:E,format:e===`revenue`?{style:`currency`,currency:`USD`,notation:`compact`,maximumFractionDigits:1}:{notation:`compact`,maximumFractionDigits:1},locales:`en`})}),table:(0,y.jsx)(c,{data:r,valueLabel:a,format:i,share:!0,caption:`${a} by country`}),children:(0,y.jsx)(s,{data:r,scaleType:`log`,valueLabel:a,format:i,onSelect:e=>l.info(e.name,e.value===null?`No data`:`${a}: ${(i??(e=>e.toLocaleString(`en`)))(e.value)}`),"aria-label":`${a} by country, last 12 months`})})})}function I(){return(0,y.jsxs)(r,{eyebrow:`Chart`,title:`World map`,description:`Where your numbers are, at a glance: a choropleth on a sequential or diverging scale, or a bubble map at any longitude and latitude. Equal Earth keeps every country's area true to scale, names come from Intl in your locale, and the outlines (Natural Earth, public domain) load on demand in their own 19 KB chunk.`,source:[`${u}geo-map.tsx`,`${u}geo/world-110m.ts`],children:[(0,y.jsx)(l,{label:`World map demo`,title:`Revenue by country`,hue:1,height:`22rem`,children:(0,y.jsx)(s,{data:C,scaleType:`log`,valueLabel:`Revenue`,format:A,"aria-label":`Revenue by country, last 12 months`})}),(0,y.jsx)(F,{}),(0,y.jsx)(o,{title:`Diverging scale`,description:`Growth sits around a meaningful middle, so scale="diverging" uses two hues that meet at a neutral midpoint (0% here): orange for shrinking markets, blue for growing ones. The scale is symmetric, so equal changes get equally strong colors.`,variant:`bare`,code:`
import { WorldMap, type WorldMapDatum } from "@sheenui/theme";

const signedPercent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });
const formatGrowth = (n: number) => signedPercent.format(n).replace("-", "\\u2212"); // a true minus sign

// Year-over-year change in active users, as a ratio
const growth: WorldMapDatum[] = [
  { id: "US", value: 0.08 },
  { id: "BR", value: 0.34 },
  { id: "AR", value: -0.12 },
  { id: "DE", value: -0.07 },
  { id: "NG", value: 0.61 },
  { id: "IN", value: 0.58 },
  { id: "VN", value: 0.52 },
  { id: "RU", value: -0.31 },
];

export function Example() {
  return (
    <WorldMap
      data={growth}
      scale="diverging"
      midpoint={0}
      divergingColors={[2, 7]}
      valueLabel="Change"
      format={formatGrowth}
      aria-label="Year-over-year change in active users by country"
    />
  );
}`,children:(0,y.jsx)(t,{className:`w-full`,title:`Year-over-year change in active users`,description:`2026 against 2025, by country`,table:(0,y.jsx)(c,{data:D,valueLabel:`Change`,format:M,caption:`Year-over-year change by country`}),children:(0,y.jsx)(s,{data:D,scale:`diverging`,valueLabel:`Change`,format:M,"aria-label":`Year-over-year change in active users by country`})})}),(0,y.jsxs)(`div`,{className:`grid grid-cols-1 gap-6 *:min-w-0 xl:grid-cols-2`,children:[(0,y.jsx)(o,{title:`Bubble map`,description:`Bubbles at coordinates: their area follows the value, they keep their size on screen when you zoom, and a surface ring keeps neighbors apart. The size key reads in the same units.`,variant:`bare`,code:`
import { WorldMap } from "@sheenui/theme";

const offices = [
  { label: "New York", lon: -74.0, lat: 40.71, value: 241_000 },
  { label: "San Francisco", lon: -122.42, lat: 37.77, value: 182_000 },
  { label: "London", lon: -0.13, lat: 51.51, value: 168_000 },
  // …
];

<WorldMap
  mode="bubble"
  points={offices}
  color={7}
  valueLabel="Active users"
  aria-label="Active users by city"
/>`,children:(0,y.jsx)(t,{title:`Active users by city`,description:`Top 25 metro areas`,table:(0,y.jsx)(c,{mode:`bubble`,points:O,valueLabel:`Active users`,share:!0,caption:`Active users by city`}),children:(0,y.jsx)(s,{mode:`bubble`,points:O,color:7,valueLabel:`Active users`,"aria-label":`Active users by city`})})}),(0,y.jsx)(o,{title:`Classed scale, any locale`,description:`steps={5} snaps colors to five classes, easier to match against the key. locale="de-DE" formats the numbers and names every country in German (Intl.DisplayNames).`,variant:`bare`,code:`
import { WorldMap, type WorldMapDatum } from "@sheenui/theme";

// Internet users per 100 people
const internetUsers: WorldMapDatum[] = [
  { id: "DE", value: 92 },
  { id: "FR", value: 86 },
  { id: "NO", value: 99 },
  { id: "BR", value: 81 },
  { id: "IN", value: 46 },
  { id: "NG", value: 55 },
  { id: "ET", value: 19 },
];

export function Example() {
  return (
    <WorldMap
      data={internetUsers}
      steps={5}
      color={3}
      domain={[0, 100]}
      locale="de-DE"
      valueLabel="Je 100"
      labels={{
        instructions: "Pfeiltasten wechseln zum Nachbarland, Bild auf und Bild ab nach Wert …",
        noData: "Keine Daten",
        zoomIn: "Vergrößern",
        zoomControls: (name) => \`\${name}: Zoom\`,
        // … every string is in WorldMapLabels
      }}
      aria-label="Internetnutzer je 100 Einwohner"
    />
  );
}`,children:(0,y.jsx)(`div`,{lang:`de`,className:`contents`,children:(0,y.jsx)(t,{title:`Internetnutzer je 100 Einwohner`,description:`Gerundet, illustrativ`,table:(0,y.jsx)(c,{data:N,locale:`de-DE`,valueLabel:`Je 100`,labels:{country:`Land`,rankHeader:`Rang`},caption:`Internetnutzer nach Land`}),children:(0,y.jsx)(s,{data:N,steps:5,color:3,domain:[0,100],locale:`de-DE`,valueLabel:`Je 100`,labels:P,"aria-label":`Internetnutzer je 100 Einwohner`})})})})]}),(0,y.jsx)(a,{of:g}),(0,y.jsx)(a,{as:`h2`,title:`WorldMapTable props`,of:_}),(0,y.jsx)(i,{rows:[[`Tab`,`Focus the map (one stop), then the zoom buttons.`],[`← / → / ↑ / ↓`,`Move to the neighboring country (or bubble) in that direction; it pans into view when zoomed.`],[`Page Down / Page Up`,`Next / previous place by value (rank order).`],[`Home / End`,`Highest / lowest value.`],[`Letters`,`Type a name to jump to it (type-ahead).`],[`+ / −`,`Zoom in / out around the active place.`],[`0`,`Reset the zoom.`],[`Enter / Space`,`Call onSelect for the active place.`],[`Escape`,`Clear the active place; again to reset the zoom.`]]}),(0,y.jsxs)(n,{children:[(0,y.jsx)(`li`,{children:`The map is one focusable figure with a role description of “map”; its accessible name ends with the keyboard instructions.`}),(0,y.jsx)(`li`,{children:`Keyboard moves are announced once through a polite live region (“India: 912K, Rank 2 of 45”); pointer hovers stay silent.`}),(0,y.jsx)(`li`,{children:`Missing values are hatched, never painted as the lowest color; the key includes a “No data” swatch.`}),(0,y.jsx)(`li`,{children:`The Table view lists every value ranked, with an optional share column: the color-free way to read the map.`}),(0,y.jsx)(`li`,{children:`Zoom buttons are real buttons (44px on touch), disabled at the limits; a plain scroll never hijacks the page.`}),(0,y.jsx)(`li`,{children:`Forced colors: borders become CanvasText and the active country gets a Highlight outline.`})]})]})}export{I as default};