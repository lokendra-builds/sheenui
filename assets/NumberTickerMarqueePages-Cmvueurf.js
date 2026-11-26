import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./glass-card-OGQy5mxG.js";import{t as a}from"./number-ticker-CM_hhE6n.js";import{i as o,n as s,o as c,r as l}from"./Page-ClekXXh-.js";import{t as u}from"./Example-jva669kg.js";import{t as d}from"./ShowcaseStage-qzIATPiV.js";import{t as f}from"./ShowcaseStage.number-ticker.scene-DAkz6hlg.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`value`,`number`,``,`The number to show.`,!0],[`from`,`number`,`0`,"Where the first roll starts from. Set it to `value` to skip the intro roll.",!1],[`locales`,`Intl.LocalesArgument`,`the browser's`,`Sets the BCP 47 locale(s) for Intl.NumberFormat.`,!1],[`format`,`Intl.NumberFormatOptions`,`{}`,`Intl.NumberFormat options, e.g. { style: "currency", currency: "EUR" }.`,!1],[`prefix`,`string`,``,`Text before the number (read by screen readers too).`,!1],[`suffix`,`string`,``,`Text after the number (read by screen readers too).`,!1],[`animateOnView`,`boolean`,`true`,`Wait until the ticker is on screen before the first roll.`,!1],[`delay`,`number`,`0`,`Sets the number of seconds before the first roll.`,!1],[`duration`,`number`,`0.6`,`Seconds a roll takes, capped at 0.9 (longer values are clamped so digits are never unreadable for long).`,!1],[`trend`,`"auto" | "up" | "down"`,`"auto"`,`Which way digits roll: with the change ("auto", default), or always up / down.`,!1],[`live`,`"off" | "assertive" | "polite"`,`"polite"`,`How screen readers hear later changes: "polite" (default), "assertive", or "off" for numbers that change constantly.`,!1]],h=e(t()),g=n(),_=(e,t)=>Math.round(e+Math.random()*(t-e));function v(){let[e,t]=(0,h.useState)(48250),[n,v]=(0,h.useState)(1284093),[b,x]=(0,h.useState)(.048),[S,C]=(0,h.useState)(98);function w(){t(_(9e3,99e3)),v(_(4e5,26e5)),x(_(10,99)/1e3)}return(0,g.jsxs)(s,{eyebrow:`Effect`,title:`Number ticker`,description:`Every digit is a little wheel that rolls to its new value. Formatting is Intl.NumberFormat, so currencies, percentages, compact numbers and any locale just work. Screen readers hear the final value once, not every digit.`,source:`theme/src/components/number-ticker/number-ticker.tsx`,children:[(0,g.jsx)(d,{label:`Number ticker demo`,story:()=>p(()=>import(`./ShowcaseStage.number-ticker-CICbvmzB.js`),[]),initial:{revenue:12480,users:402118},minHeight:`16rem`,children:(e,t)=>(0,g.jsx)(f,{scene:e,ctx:t})}),(0,g.jsx)(u,{title:`Live stats`,description:`Digits roll up when a value rises and down when it falls; new places slide in. Places that went through a full cycle spin an extra turn, like an odometer.`,controls:(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{size:`sm`,variant:`glass`,onClick:w,children:`Shuffle values`}),(0,g.jsx)(r,{size:`sm`,variant:`glass`,onClick:()=>C(e=>e+1),children:`Add one`}),(0,g.jsx)(r,{size:`sm`,variant:`ghost`,onClick:()=>C(e=>Math.max(0,e-1)),children:`Remove one`})]}),stageClassName:`min-h-72`,code:`
import { NumberTicker } from "@sheenui/theme";

export function Example() {
  const revenue = 128400;
  const users = 18250;
  const rate = 0.043;
  const count = 42;

  return (
    <>
      <NumberTicker value={revenue} locales="en-US" format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
      <NumberTicker value={users} locales="en-US" format={{ notation: "compact", maximumFractionDigits: 1 }} />
      <NumberTicker value={rate} locales="en-US" format={{ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
      <NumberTicker value={count} from={count} locales="en-US" />
    </>
  );
}`,children:(0,g.jsxs)(`div`,{className:`grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-4`,children:[(0,g.jsx)(y,{label:`Revenue`,children:(0,g.jsx)(a,{value:e,locales:`en-US`,format:{style:`currency`,currency:`USD`,maximumFractionDigits:0}})}),(0,g.jsx)(y,{label:`Active users`,children:(0,g.jsx)(a,{value:n,locales:`en-US`,format:{notation:`compact`,maximumFractionDigits:1}})}),(0,g.jsx)(y,{label:`Conversion`,children:(0,g.jsx)(a,{value:b,locales:`en-US`,format:{style:`percent`,minimumFractionDigits:1,maximumFractionDigits:1}})}),(0,g.jsx)(y,{label:`Seats taken`,children:(0,g.jsx)(a,{value:S,from:S,locales:`en-US`})})]})}),(0,g.jsx)(u,{title:`Any locale, any numbering system`,description:`The same value through Intl.NumberFormat: separators, symbols and even the digits themselves follow the locale. In right-to-left locales the digits still read left to right, and the currency sits where the browser puts it.`,stageClassName:`min-h-64`,code:`
import { GlassCard, NumberTicker } from "@sheenui/theme";

const rows = [
  ["German, euro", "de-DE", { style: "currency", currency: "EUR" }, 1234567.89],
  ["Indian grouping, rupee", "en-IN", { style: "currency", currency: "INR" }, 1234567.89],
  ["Japanese, yen", "ja-JP", { style: "currency", currency: "JPY", currencyDisplay: "narrowSymbol" }, 1234567],
  ["Arabic-Indic digits", "ar-EG", {}, 1234567],
  ["Devanagari digits", "hi-IN-u-nu-deva", {}, 1234567],
  ["Compact, French", "fr-FR", { notation: "compact", compactDisplay: "long" }, 1234567],
  ["Egyptian pound, right to left", "ar-EG", { style: "currency", currency: "EGP" }, 1234567.89],
  ["Shekel, right to left", "he-IL", { style: "currency", currency: "ILS" }, 1234.5],
] as const;

export function Example() {
  return (
    <dl className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      {rows.map(([label, locale, format, value]) => (
        <GlassCard key={label} level={1} sheen={false} className="flex flex-col gap-1 px-4 py-3">
          <dt className="text-xs text-sheen-fg-muted">{label}</dt>
          <dd className="text-xl font-semibold">
            <NumberTicker value={value} locales={locale} format={format} />
          </dd>
        </GlassCard>
      ))}
    </dl>
  );
}`,children:(0,g.jsx)(`dl`,{className:`grid w-full max-w-2xl gap-3 sm:grid-cols-2`,children:[[`German, euro`,`de-DE`,{style:`currency`,currency:`EUR`},1234567.89],[`Indian grouping, rupee`,`en-IN`,{style:`currency`,currency:`INR`},1234567.89],[`Japanese, yen`,`ja-JP`,{style:`currency`,currency:`JPY`,currencyDisplay:`narrowSymbol`},1234567],[`Arabic-Indic digits`,`ar-EG`,{},1234567],[`Devanagari digits`,`hi-IN-u-nu-deva`,{},1234567],[`Compact, French`,`fr-FR`,{notation:`compact`,compactDisplay:`long`},1234567],[`Egyptian pound, right to left`,`ar-EG`,{style:`currency`,currency:`EGP`},1234567.89],[`Shekel, right to left`,`he-IL`,{style:`currency`,currency:`ILS`},1234.5]].map(([e,t,n,r])=>(0,g.jsxs)(i,{level:1,sheen:!1,className:`flex flex-col gap-1 px-4 py-3`,children:[(0,g.jsx)(`dt`,{className:`text-xs text-sheen-fg-muted`,children:e}),(0,g.jsx)(`dd`,{className:`text-xl font-semibold`,children:(0,g.jsx)(a,{value:r,locales:t,format:n})})]},e))})}),(0,g.jsx)(u,{title:`Counts up when it comes into view`,description:"It starts from `from` (0 by default) and rolls the first time it is on screen. Pass from={value} to skip that.",stageClassName:`min-h-56`,code:`
import { NumberTicker } from "@sheenui/theme";

export function Example() {
  return (
    <p className="text-6xl font-semibold tracking-tight sm:text-7xl">
      <NumberTicker value={2400000} locales="en-US" format={{ notation: "compact" }} suffix="+" delay={0.2} />
    </p>
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex flex-col items-center gap-1 text-center`,children:[(0,g.jsx)(`p`,{className:`text-6xl font-semibold tracking-tight sm:text-7xl`,children:(0,g.jsx)(a,{value:24e5,locales:`en-US`,format:{notation:`compact`},suffix:`+`,delay:.2})}),(0,g.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:`developers ship with glass every month`})]})}),(0,g.jsx)(l,{of:m}),(0,g.jsx)(c,{rows:[[`Tab`,`Not focusable: this is text.`]]}),(0,g.jsx)(o,{items:[`The digit wheels are aria-hidden; the final value is in a visually hidden live region (live="polite" by default), so it is read once, correctly formatted, not digit by digit.`,`Under reduced motion the value appears at once.`]})]})}function y({label:e,children:t}){return(0,g.jsxs)(i,{className:`flex flex-col gap-1 p-5`,children:[(0,g.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:e}),(0,g.jsx)(`p`,{className:`text-3xl font-semibold tracking-tight`,children:t})]})}export{v as default};