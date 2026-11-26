import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./badge-AQ2Afjwl.js";import{r as a}from"./toast-PePh6sao.js";import{n as o,t as s}from"./radio-group-CuuzovOZ.js";import{i as c,n as l,o as u,r as d}from"./Page-BAL5Idhy.js";import{t as f}from"./Example-BPfHvEYD.js";import{t as p}from"./ShowcaseStage-qzIATPiV.js";import{t as m}from"./ShowcaseStage.follow-C3IvOXPy.js";import{n as h,r as g}from"./shared-BIVNUCsv.js";import{t as _}from"./preload-helper-BrmCrVM7.js";var v=[[`value`,`string`,``,`Sets the value this option stands for.`,!0],[`label`,`ReactNode`,``,`Sets the option's visible text and accessible name.`,!0],[`description`,`ReactNode`,``,`Second line under the label (linked to the radio as its description).`,!1],[`disabled`,`boolean`,``,`Makes this radio unselectable: it is dimmed and skipped by arrow-key navigation and the tab order.`,!1],[`className`,`string`,``,`Adds extra classes to the option row (a <label>).`,!1]],y=[[`value`,`string`,``,`Sets the value this option stands for.`,!0],[`label`,`ReactNode`,``,`Sets the option's visible text and accessible name.`,!0],[`description`,`ReactNode`,``,`Second line under the label (linked to the radio as its description).`,!1],[`disabled`,`boolean`,``,`Makes this radio unselectable: it is dimmed and skipped by arrow-key navigation and the tab order.`,!1],[`className`,`string`,``,`Adds extra classes to the option row (a <label>).`,!1],[`icon`,`ReactNode`,``,`Icon or illustration at the start of the card.`,!1],[`meta`,`ReactNode`,``,`Trailing content such as a price or a badge. Read with the label ("Pro, $12/mo").`,!1],[`children`,`ReactNode`,``,`Extra content under the description (feature list, preview). Read as part of the description.`,!1],[`layout`,`RadioCardLayout`,`"row"`,`"row": icon, label and meta side by side, description underneath. "stack": icon and dot on top, text below, meta pinned to the bottom (pricing-card style). "auto" (the group's default): stack once a 3- or 4-column group shows several columns, row otherwise.`,!1]],b=[[`onBlur`,`FocusEventHandler<HTMLElement>`,``,`Called when focus leaves the control (not when it moves between the control's own parts).`,!1],[`name`,`string`,``,`Submits the value with a form.`,!1],[`required`,`boolean`,``,`Marks the group as required for form validation.`,!1],[`disabled`,`boolean`,`false`,`Disables every option of the group.`,!1],[`aria-invalid`,`boolean | "true" | "false"`,``,"Marks the field as invalid (also set automatically when `error` is shown).",!1],[`aria-describedby`,`string`,``,`Ids of elements that describe the field, merged with the control's own description and error ids.`,!1],[`items`,`RadioItem[]`,``,`The options. Leave out to compose <Radio> or <RadioCard> children instead.`,!1],[`children`,`ReactNode`,``,"`Radio` or `RadioCard` options, when you do not pass `items`.",!1],[`variant`,`"card" | "classic"`,`"classic"`,'"classic" dots or rich "card" options (used for `items`; also sets the layout for children).',!1],[`value`,`string | null`,``,"Sets the chosen value when controlled. `null` means nothing chosen.",!1],[`defaultValue`,`string | null`,``,`Sets the starting value when uncontrolled.`,!1],[`onValueChange`,`((value: string) => void)`,``,`Called with the chosen option's value.`,!1],[`label`,`ReactNode`,``,"Visible group label (a legend). Use `aria-label` when there is none.",!1],[`description`,`ReactNode`,``,`Shows helper text under the label.`,!1],[`error`,`ReactNode`,``,`Error message; marks every radio invalid and is announced politely when it appears.`,!1],[`orientation`,`"horizontal" | "vertical"`,`"vertical"`,`Classic variant: stack the options or lay them out in a row (wraps on small screens).`,!1],[`columns`,`2 | 1 | 3 | 4`,`2`,`Card variant: columns once the group is wide enough (always one column when narrow).`,!1],[`cardLayout`,`RadioCardLayout`,``,`Card variant: "row" (side by side), "stack" (pricing-card style), or "auto": stacked once a 3- or 4-column group shows several columns, rows otherwise (e.g. one column on phones).`,!1],[`form`,`string`,``,`Id of a form outside of which the group is rendered.`,!1],[`readOnly`,`boolean`,``,`Show the choice but do not allow changes.`,!1],[`aria-label`,`string`,``,"Accessible name of the group when there is no visible `label`.",!1],[`aria-labelledby`,`string`,``,`Id of an element that names the group.`,!1],[`className`,`string`,``,`Class for the outer wrapper (label + options + messages).`,!1],[`listClassName`,`string`,``,`Class for the element that lays out the options (list or grid).`,!1]],x=e(t()),S=n(),C=[{value:`starter`,label:`Starter`,description:`For one person, free.`},{value:`pro`,label:`Pro`,description:`Unlimited projects, $12 a month.`},{value:`team`,label:`Team`,description:`Shared workspace, $29 a month.`}];function w({scene:e,ctx:t}){let[n,r]=m(e.plan);return(0,S.jsx)(`div`,{className:`sheen-stage-col`,children:(0,S.jsx)(o,{label:`Choose a plan`,value:n,onValueChange:e=>{r(e),t.setState(`success`)},items:C,className:`sheen-stage-wide text-start`})})}var T=[{value:`starter`,label:`Starter`,description:`For side projects. 3 seats, community support.`,icon:g.sparkle,meta:`Free`},{value:`pro`,label:`Pro`,description:`For growing teams. Unlimited seats and priority support.`,icon:g.rocket,meta:`$12/mo`},{value:`enterprise`,label:`Enterprise`,description:`SSO, audit logs and a dedicated success manager.`,icon:g.building,meta:`Custom`}];function E(){let[e,t]=(0,x.useState)(`pro`),[n,m]=(0,x.useState)(null),[C,E]=(0,x.useState)(),D=a();function O(e){e.preventDefault(),n?(E(void 0),D.success(`Added to bag`,`Size ${n.toUpperCase()}`)):(E(`Choose a size to continue.`),e.currentTarget.querySelector(`[role=radio]`)?.focus())}return(0,S.jsxs)(l,{eyebrow:`Form`,title:`Radio group`,description:`Pick exactly one option. Classic glass dots whose pip springs out, or rich option cards where the selection glides from card to card. Tab enters the group once and the arrow keys move the choice.`,source:`theme/src/components/radio-group/radio-group.tsx`,children:[(0,S.jsx)(p,{label:`Radio group demo`,story:()=>_(()=>import(`./ShowcaseStage.radio-group-B3kU_dMa.js`),[]),initial:{plan:`starter`},minHeight:`20rem`,onInterrupt:`keep`,children:(e,t)=>(0,S.jsx)(w,{scene:e,ctx:t})}),(0,S.jsx)(f,{title:`Classic`,description:`Each option can carry a description; the legend names the group for screen readers.`,code:`
import { RadioGroup } from "@sheenui/theme";

export function Example() {
  return (
    <RadioGroup
      label="Email digest"
      description="How often we send a summary of activity."
      defaultValue="weekly"
      items={[
        { value: "daily", label: "Daily", description: "Every morning at 8:00." },
        { value: "weekly", label: "Weekly", description: "Mondays, with the week's highlights." },
        { value: "never", label: "Never", description: "You can still find everything in the app." },
        { value: "hourly", label: "Hourly", description: "Available on Pro.", disabled: true },
      ]}
    />
  );
}`,children:(0,S.jsx)(`div`,{className:`w-full max-w-sm`,children:(0,S.jsx)(o,{label:`Email digest`,description:`How often we send a summary of activity.`,defaultValue:`weekly`,items:[{value:`daily`,label:`Daily`,description:`Every morning at 8:00.`},{value:`weekly`,label:`Weekly`,description:`Mondays, with the week's highlights.`},{value:`never`,label:`Never`,description:`You can still find everything in the app.`},{value:`hourly`,label:`Hourly`,description:`Available on Pro.`,disabled:!0}]})})}),(0,S.jsx)(f,{title:`Option cards`,description:`Cards take an icon, a description and meta such as a price. The selection tint slides to the chosen card (it jumps with reduced motion). Columns follow the group's own width: pricing-style cards side by side when there's room, compact rows on phones.`,code:`
import { useState } from "react";
import { RadioGroup } from "@sheenui/theme";
import { Building2 as BuildingIcon, Rocket as RocketIcon, Sparkles as SparkleIcon } from "lucide-react";

export function Example() {
  const [plan, setPlan] = useState("pro");

  return (
    <RadioGroup
      variant="card"
      columns={3}
      label="Plan"
      value={plan}
      onValueChange={setPlan}
      items={[
        { value: "starter", label: "Starter", description: "For side projects…", icon: <SparkleIcon />, meta: "Free" },
        { value: "pro", label: "Pro", description: "For growing teams…", icon: <RocketIcon />, meta: "$12/mo" },
        { value: "enterprise", label: "Enterprise", description: "SSO, audit logs…", icon: <BuildingIcon />, meta: "Custom" },
      ]}
    />
  );
}`,children:(0,S.jsxs)(`div`,{className:`flex w-full max-w-4xl flex-col gap-3`,children:[(0,S.jsx)(o,{variant:`card`,columns:3,label:`Plan`,value:e,onValueChange:t,items:T}),(0,S.jsxs)(h,{children:[`Selected: `,(0,S.jsx)(`strong`,{children:T.find(t=>t.value===e)?.label})]})]})}),(0,S.jsx)(f,{title:`Composed cards`,description:`Compose RadioCard children for custom content, such as a badge or a delivery estimate.`,code:`
import { Badge, RadioCard, RadioGroup } from "@sheenui/theme";
import { Zap as BoltIcon, Store as StoreIcon, Truck as TruckIcon } from "lucide-react";

export function Example() {
  return (
    <RadioGroup variant="card" columns={1} label="Delivery" defaultValue="standard">
      <RadioCard value="standard" label="Standard" description="3–5 working days" icon={<TruckIcon />} meta="Free" />
      <RadioCard value="express" label="Express" description="Next working day" icon={<BoltIcon />} meta="$9">
        <Badge tone="accent">Order within 4 h 12 min</Badge>
      </RadioCard>
      <RadioCard value="pickup" label="Pick up in store" description="Out of stock nearby" icon={<StoreIcon />} disabled />
    </RadioGroup>
  );
}`,children:(0,S.jsx)(`div`,{className:`w-full max-w-md`,children:(0,S.jsxs)(o,{variant:`card`,columns:1,label:`Delivery`,defaultValue:`standard`,children:[(0,S.jsx)(s,{value:`standard`,label:`Standard`,description:`3–5 working days`,icon:g.truck,meta:`Free`}),(0,S.jsx)(s,{value:`express`,label:`Express`,description:`Next working day`,icon:g.bolt,meta:`$9`,children:(0,S.jsx)(i,{tone:`accent`,children:`Order within 4 h 12 min`})}),(0,S.jsx)(s,{value:`pickup`,label:`Pick up in store`,description:`Out of stock nearby`,icon:g.store,disabled:!0})]})})}),(0,S.jsx)(f,{title:`Horizontal, with validation`,description:`A required choice in a row (it wraps on small screens). The error is linked to every radio and announced politely when it appears; focus moves to the group so the fix is one key press away.`,code:`
import { useState, type FormEvent } from "react";
import { Button, RadioGroup, useToast } from "@sheenui/theme";

export function Example() {
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const toast = useToast();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!size) {
      setError("Choose a size to continue.");
      // Take keyboard and screen-reader users straight to the choice.
      event.currentTarget.querySelector<HTMLElement>("[role=radio]")?.focus();
      return;
    }
    setError(undefined);
    toast.success("Added to bag", \`Size \${size.toUpperCase()}\`);
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col items-start gap-4">
      <RadioGroup
        label="Size"
        orientation="horizontal"
        name="size"
        required
        value={size}
        onValueChange={(v) => {
          setSize(v);
          setError(undefined);
        }}
        error={error}
        items={["xs", "s", "m", "l", "xl"].map((v) => ({ value: v, label: v.toUpperCase() }))}
      />
      <Button type="submit">Add to bag</Button>
    </form>
  );
}`,children:(0,S.jsxs)(`form`,{onSubmit:O,noValidate:!0,className:`flex w-full max-w-sm flex-col items-start gap-4`,children:[(0,S.jsx)(o,{label:`Size`,orientation:`horizontal`,name:`size`,required:!0,value:n,onValueChange:e=>{m(e),E(void 0)},error:C,items:[`xs`,`s`,`m`,`l`,`xl`].map(e=>({value:e,label:e.toUpperCase()}))}),(0,S.jsx)(r,{type:`submit`,children:`Add to bag`})]})}),(0,S.jsx)(d,{title:`RadioGroup`,of:b}),(0,S.jsx)(d,{title:`Radio / RadioCard`,as:`h3`,of:[v,y]}),(0,S.jsx)(u,{rows:[[`Tab / Shift + Tab`,`Enter or leave the group once, landing on the chosen option (or the first).`],[`Arrow keys`,`Move the choice and select it.`],[`Space`,`Select the focused option.`]]}),(0,S.jsx)(c,{items:[`role="radiogroup" named by label; each radio is linked to its label and description. error is announced politely and linked to the group.`,`RadioCard shows the focus ring on the whole card although the dot holds focus.`,`The unchecked ring keeps 3:1 contrast; the touch hit area is 44 px.`]})]})}g.list,g.board,g.calendar;export{E as default};