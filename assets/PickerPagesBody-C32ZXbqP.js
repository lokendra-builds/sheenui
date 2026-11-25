import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./badge-AQ2Afjwl.js";import{t as i}from"./button-8i4LQrEk.js";import{t as a}from"./glass-card-OGQy5mxG.js";import{r as o}from"./toast-PePh6sao.js";import{a as s,i as c,n as l,t as u}from"./calendar-MN1B4VFN.js";import{n as d,t as f}from"./date-picker-Bssj_s1w.js";import{n as p,t as m}from"./color-picker-CuSean0f.js";import{i as h,n as g,o as _,r as v}from"./Page-y_OVkLtr.js";import{t as y}from"./Example-B3x8pgFu.js";import{a as b,i as x,n as S,o as C,r as w,s as T,t as E}from"./ShowcaseStage.calendar.scene-D1a6StFc.js";import{t as D}from"./ShowcaseStage.color-picker.scene-BERYmc_L.js";import{t as O}from"./ShowcaseStage-qzIATPiV.js";import{t as k}from"./lazy-block-BfzH_8EP.js";import{a as A,t as j}from"./demo-clock-CoEY-AlH.js";import{t as M}from"./preload-helper-BrmCrVM7.js";var N=e(t()),P=n(),F=k(()=>M(()=>import(`./CalendarLocalesDemo-BdKRxEb2.js`).then(e=>e.CalendarLocalesDemo),[]),{minHeight:`26rem`});function I(){let[e,t]=(0,N.useState)(A),n=A,[r,i]=(0,N.useState)(()=>({start:l(n,3),end:l(n,8)}));return(0,P.jsxs)(g,{eyebrow:`Form`,title:`Calendar`,description:`A month grid built on Intl: the week starts where your locale starts it, month and day names (and digits) are translated. Arrow keys, Page Up / Down and Home / End move through it; the caption jumps to any month or year.`,source:[`theme/src/components/calendar/calendar.tsx`,`theme/src/components/calendar/date-utils.ts`],children:[(0,P.jsx)(O,{label:`Calendar demo`,story:()=>M(()=>import(`./ShowcaseStage.calendar-BgUBsdlF.js`),[]),initial:{offset:null},minHeight:`28rem`,onInterrupt:`keep`,children:(e,t)=>(0,P.jsx)(E,{scene:e,ctx:t})}),(0,P.jsx)(y,{title:`Single date`,stageClassName:`px-3 sm:px-10`,description:`The selected-day pill glides to the new day; months slide in the direction you travel. Click the caption for the month and year grids.`,code:`
import { useState } from "react";
import { Calendar, GlassCard } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function Example() {
  const [date, setDate] = useState<Date | null>(startOfDay(new Date()));

  return (
    <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-3">
      <Calendar value={date} onValueChange={setDate} aria-label="Pick a date" />
    </GlassCard>
  );
}`,children:(0,P.jsxs)(`div`,{className:`flex max-w-full flex-col items-center gap-3`,children:[(0,P.jsx)(a,{className:`max-w-full rounded-sheen-xl p-2 sm:p-3`,children:(0,P.jsx)(u,{value:e,onValueChange:t,locale:j,today:A,"aria-label":`Pick a date`})}),(0,P.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,"aria-live":`polite`,children:e?c(e,j,{dateStyle:`full`}):`No date`})]})}),(0,P.jsx)(y,{title:`Range, two months, unavailable days`,stageClassName:`px-3 sm:px-10`,description:`Pick a start, then hover (or arrow) to preview the range; a range can't cross a booked day (every 9th and 10th here). Past days are off limits. Each caption opens the month grid for its own panel.`,code:`
import { useState } from "react";
import { Calendar, GlassCard, type DateRange } from "@sheenui/theme";

export function Example() {
  const today = new Date();
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  const booked = (d: Date) => d.getDate() % 9 === 0 || d.getDate() % 10 === 0;

  return (
    <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-4">
      <Calendar
        mode="range"
        numberOfMonths={2}
        min={today}
        isDateDisabled={booked}
        value={range}
        onValueChange={setRange}
        aria-label="Stay dates"
      />
    </GlassCard>
  );
}`,children:(0,P.jsxs)(`div`,{className:`flex max-w-full flex-col items-center gap-3`,children:[(0,P.jsx)(a,{className:`max-w-full rounded-sheen-xl p-2 sm:p-4`,children:(0,P.jsx)(u,{mode:`range`,numberOfMonths:2,locale:j,today:A,min:n,isDateDisabled:e=>e.getDate()%9==0||e.getDate()%10==0,value:r,onValueChange:i,"aria-label":`Stay dates`})}),(0,P.jsx)(`p`,{className:`text-sm text-sheen-fg-muted tabular-nums`,"aria-live":`polite`,children:r.start&&r.end?s(r.start,r.end,j,{month:`short`,day:`numeric`,year:`numeric`}):r.start?`Now pick the last night`:`Pick the first night`})]})}),(0,P.jsx)(y,{title:`Locales`,stageClassName:`px-3 sm:px-10`,description:`Same component, different locale: week start, names and digits all change. Arabic also runs right to left (arrow keys follow).`,code:`
import { useState } from "react";
import { Calendar } from "@sheenui/theme";

export function Example() {
  const today = new Date();
  const [locale, setLocale] = useState("ar-EG");
  const rtl = ["ar", "he", "fa"].includes(locale.split("-")[0] ?? locale);

  return (
    <div dir={rtl ? "rtl" : undefined} lang={locale}>
      <button onClick={() => setLocale(locale === "ar-EG" ? "de-DE" : "ar-EG")}>Switch language</button>
      <Calendar key={locale} locale={locale} defaultValue={today} aria-label="Localised calendar" />
    </div>
  );
}`,children:(0,P.jsx)(F,{})}),(0,P.jsx)(v,{of:T}),(0,P.jsx)(_,{rows:[[`Arrow keys`,`Move by one day (left, right) or one week (up, down); right-to-left flips left and right.`],[`Home / End`,`Jump to the start or end of the week.`],[`Page Up / Page Down`,`Previous or next month.`],[`Shift + Page Up / Page Down`,`Previous or next year.`],[`Enter / Space`,`Select the focused day (in range mode, the first press sets the start and the second the end).`]]}),(0,P.jsx)(h,{items:[`A WAI-ARIA date grid: role="grid" per month, one day in the tab order (roving tabindex), each day named with its full date.`,`Today, selected, range start and end, and unavailable days are all in the name. Unavailable days stay focusable but cannot be selected.`,`A polite live region announces month changes. Selection never relies on color alone.`]})]})}var L=[{label:`Today`,range:()=>({start:A,end:A})},{label:`Last 7 days`,range:()=>({start:l(A,-6),end:A})},{label:`Last 30 days`,range:()=>({start:l(A,-29),end:A})},{label:`This month so far`,range:()=>({start:new Date(A.getFullYear(),A.getMonth(),1),end:A})}];function R(){let e=o(),t=A,[n,r]=(0,N.useState)(null),[i,a]=(0,N.useState)(()=>({start:l(t,-6),end:t}));return(0,P.jsxs)(g,{eyebrow:`Form`,title:`Date picker`,description:`A glass field that opens the Calendar in a popover, or as a swipe-to-close bottom sheet on phones. Focus lands on the selected day and returns to the field; a range commits only once both ends are picked.`,source:[`theme/src/components/date-picker/date-picker.tsx`,`theme/src/components/calendar/calendar.tsx`],children:[(0,P.jsx)(O,{label:`Date picker demo`,story:()=>M(()=>import(`./ShowcaseStage.date-picker-BOomkDol.js`),[]),initial:{offset:null},minHeight:`18rem`,onInterrupt:`keep`,children:(e,t)=>(0,P.jsx)(S,{scene:e,ctx:t})}),(0,P.jsx)(y,{title:`Single date`,description:`Today / Clear in the footer, × in the field. Resize below 640px to get the bottom sheet.`,stageClassName:`items-start`,code:`
import { useState } from "react";
import { DatePicker } from "@sheenui/theme";

export function Example() {
  const [due, setDue] = useState<Date | null>(null);

  return (
    <DatePicker label="Due date" value={due} onValueChange={setDue} description="We'll remind you the day before." />
  );
}`,children:(0,P.jsx)(f,{label:`Due date`,value:n,onValueChange:r,locale:j,today:A,description:`We'll remind you the day before.`,className:`max-w-xs`})}),(0,P.jsx)(y,{title:`Bounds and unavailable days`,description:`Weekdays in the next 60 days only. The month arrows stop at the bounds.`,stageClassName:`items-start`,code:`
import { DatePicker } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function Example() {
  const today = startOfDay(new Date());

  return (
    <DatePicker
      label="Delivery date"
      min={today}
      max={addDays(today, 60)}
      isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
      formatOptions={{ weekday: "short", day: "numeric", month: "long" }}
    />
  );
}`,children:(0,P.jsx)(f,{label:`Delivery date`,locale:j,today:A,min:t,max:l(t,60),isDateDisabled:e=>e.getDay()===0||e.getDay()===6,formatOptions:{weekday:`short`,day:`numeric`,month:`long`},className:`max-w-xs`})}),(0,P.jsx)(y,{title:`Date range with presets`,description:`Two months side by side where they fit beside the presets, one on tablets and phones (there the presets become a swipeable row). Hover previews the range; nothing after today.`,stageClassName:`items-start`,code:`
import { useState } from "react";
import { DateRangePicker, type DateRange, type DateRangePreset } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => startOfDay(new Date());

const PRESETS: DateRangePreset[] = [
  { label: "Today", range: () => ({ start: today(), end: today() }) },
  { label: "Last 7 days", range: () => ({ start: addDays(today(), -6), end: today() }) },
  { label: "Last 30 days", range: () => ({ start: addDays(today(), -29), end: today() }) },
  { label: "This month so far", range: () => ({ start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: today() }) },
];

export function Example() {
  const [period, setPeriod] = useState<DateRange | null>(null);

  return (
    <DateRangePicker label="Reporting period" value={period} onValueChange={setPeriod} max={today()} presets={PRESETS} />
  );
}`,children:(0,P.jsx)(d,{label:`Reporting period`,value:i,onValueChange:a,locale:j,today:A,max:t,presets:L,className:`max-w-sm`})}),(0,P.jsx)(y,{title:`In a form`,description:`name submits YYYY-MM-DD; a range submits startName / endName. Errors show under the field.`,stageClassName:`items-start`,code:`
import { Button, DatePicker } from "@sheenui/theme";

export function Example() {
  const missing = false; // set from your validation

  return (
      <form onSubmit={(event) => { event.preventDefault(); /* validate, then submit */ }}>
        <DatePicker name="checkIn" label="Check-in" required error={missing && "Pick a check-in date."} />
        <Button type="submit">Book</Button>
      </form>
  );
}`,children:(0,P.jsx)(z,{onSubmit:t=>e.success(`Booked`,t)})}),(0,P.jsx)(v,{title:`DatePicker props`,of:x}),(0,P.jsx)(v,{title:`DateRangePicker props`,of:w}),(0,P.jsx)(_,{rows:[[`Enter / Space / Arrow Down`,`Open the calendar from the field; focus moves to the selected day.`],[`Arrow keys, Page Up / Page Down`,`Move inside the calendar (see the Calendar page).`],[`Enter / Space`,`Select the focused day. A range commits only after both ends are picked.`],[`Escape`,`Close the calendar and return focus to the field.`]]}),(0,P.jsx)(h,{items:[`The trigger is a labeled button showing the chosen date; the calendar opens in a popover, or as a swipe-to-close bottom sheet on phones.`,`Focus lands on the selected day (or today) and returns to the field on close; the sheet keeps the field above the software keyboard.`,`name submits an ISO date with a form; error is announced politely. Pass locale and today on prerendered pages so server and browser text match.`]})]})}function z({onSubmit:e}){let[t,n]=(0,N.useState)(null),[r,a]=(0,N.useState)(!1);return(0,P.jsxs)(`form`,{noValidate:!0,className:`flex w-full max-w-xs flex-col gap-4`,onSubmit:t=>{t.preventDefault(),a(!0);let n=new FormData(t.currentTarget).get(`checkIn`);typeof n==`string`&&n&&e(`checkIn=${n}`)},children:[(0,P.jsx)(f,{name:`checkIn`,label:`Check-in`,required:!0,value:t,onValueChange:n,locale:j,today:A,min:A,error:r&&!t?`Pick a check-in date.`:void 0}),(0,P.jsx)(i,{type:`submit`,className:`self-start`,children:`Book`})]})}var B=[{value:`#6d4aff`,label:`Violet`},{value:`#3b82f6`,label:`Blue`},{value:`#14b8a6`,label:`Teal`},{value:`#22c55e`,label:`Green`},{value:`#eab308`,label:`Yellow`},{value:`#f97316`,label:`Orange`},{value:`#ef4444`,label:`Red`},{value:`#ec4899`,label:`Pink`},{value:`#0f172a`,label:`Ink`},{value:`#ffffff`,label:`White`},{value:`#6d4aff80`,label:`Violet, 50% opacity`}];function V(){let[e,t]=(0,N.useState)(`#6d4aff`),[n,i]=(0,N.useState)(`#14b8a6`);return(0,P.jsxs)(g,{eyebrow:`Form`,title:`Color picker`,description:`A saturation and brightness area, hue and opacity sliders, typed hex / RGB / HSL values, swatches, copy, and the screen eyedropper where the browser supports it. Every part works from the keyboard.`,source:[`theme/src/components/color-picker/color-picker.tsx`,`theme/src/components/color-picker/color-utils.ts`],children:[(0,P.jsx)(O,{label:`Color picker demo`,story:()=>M(()=>import(`./ShowcaseStage.color-picker-ChOh9i4y.js`),[]),initial:{color:`#6d4aff`},minHeight:`46.5rem`,onInterrupt:`keep`,children:(e,t)=>(0,P.jsx)(D,{scene:e,ctx:t})}),(0,P.jsx)(y,{title:`Picker`,description:`Drag the area or use the arrow keys on it (Shift for bigger steps). The value is always emitted as hex.`,code:`
import { useState } from "react";
import { ColorPicker } from "@sheenui/theme";

export function Example() {
  const [color, setColor] = useState("#6d4aff");

  return (
      <ColorPicker
        value={color}
        onValueChange={setColor}
        swatches={[{ value: "#6d4aff", label: "Violet" }, "#3b82f6", "#10b981", "#f59e0b"]}
        aria-label="Accent color"
      />
  );
}`,children:(0,P.jsxs)(`div`,{className:`flex flex-wrap items-center justify-center gap-6`,children:[(0,P.jsx)(p,{value:e,onValueChange:t,swatches:B,"aria-label":`Accent color`}),(0,P.jsxs)(`div`,{className:`flex flex-col items-center gap-3`,children:[(0,P.jsx)(`span`,{"aria-hidden":!0,className:`size-24 rounded-sheen-xl shadow-[inset_0_0_0_1px_var(--sheen-border)] forced-color-adjust-none`,style:{backgroundColor:e}}),(0,P.jsx)(r,{tone:`neutral`,className:`font-sheen-mono`,children:e})]})]})}),(0,P.jsx)(y,{title:`Color field`,description:`A hex field with a swatch that opens the picker in a glass popover (a bottom sheet on phones). Type a hex straight into the field, or submit it with name.`,stageClassName:`items-start`,code:`
import { useState } from "react";
import { ColorField } from "@sheenui/theme";

const SWATCHES = ["#6d4aff", "#3b82f6", "#06b6d4", "#10b981", "#84cc16", "#f59e0b", "#ef4444", "#ec4899"];

export function Example() {
  const [brand, setBrand] = useState("#6d4aff");

  return (
    <ColorField
      label="Brand color"
      value={brand}
      onValueChange={setBrand}
      swatches={SWATCHES.slice(0, 8)}
      alpha={false}
      name="brand"
      description="Used for buttons and links."
    />
  );
}`,children:(0,P.jsx)(m,{label:`Brand color`,value:n,onValueChange:i,swatches:B.slice(0,8),alpha:!1,name:`brand`,description:`Used for buttons and links.`,className:`max-w-xs`})}),(0,P.jsx)(y,{title:`Hex only, no opacity`,description:`Trim it down: one format, no opacity, no swatches.`,code:`
import { ColorPicker } from "@sheenui/theme";

export function Example() {
  return (
    <ColorPicker defaultValue="#22c55e" formats={["hex"]} alpha={false} />
  );
}`,children:(0,P.jsx)(p,{defaultValue:`#22c55e`,formats:[`hex`],alpha:!1,"aria-label":`Status color`})}),(0,P.jsx)(v,{title:`ColorPicker props`,of:b}),(0,P.jsx)(v,{title:`ColorField props`,of:C}),(0,P.jsx)(_,{rows:[[`Arrow Left / Arrow Right`,`Color area: change saturation. Hue and opacity sliders: change the value.`],[`Arrow Up / Arrow Down`,`Color area: change brightness (Shift for steps of 10).`],[`Page Up / Page Down`,`Change brightness (or slider value) by 10.`],[`Home / End`,`Saturation 0 / 100 in the area; the ends of a slider.`],[`Enter / Space / Arrow Down`,`ColorField: open the picker from the swatch button. Escape closes it.`]]}),(0,P.jsx)(h,{items:[`The color area is a 2-D slider; the area, hue and opacity sliders and each channel input have a name and a spoken value ("Saturation 64%, brightness 100%").`,`In ColorField, type a hex value and press Enter or leave the field to apply it (Escape discards); description and error are linked with aria-describedby.`,`Copying announces the copied value politely. The color graphics opt out of forced colors (they are content, like an image); the controls around them keep system colors.`]})]})}export{I as CalendarPage,V as ColorPickerPage,R as DatePickerPage};