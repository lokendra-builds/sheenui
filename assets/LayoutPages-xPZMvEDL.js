import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{i as r,n as i,r as a,t as o}from"./accordion-Dbzzc6Yn.js";import{i as s,n as c,o as l,r as u}from"./Page-DQ8sr8qt.js";import{t as d}from"./Example-DMEbQwm9.js";import{t as f}from"./ShowcaseStage-qzIATPiV.js";import{t as p}from"./ShowcaseStage.follow-C3IvOXPy.js";import{i as m,n as h}from"./shared-k321aoEE.js";import{t as g}from"./lazy-block-BfzH_8EP.js";import{t as _}from"./preload-helper-BrmCrVM7.js";var v=[[`variant`,`AccordionVariant`,`"glass"`,`Surface style: "glass" is one glass card, "separated" gives every item its own card, "plain" has no surface.`,!1],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=[[`className`,`string`,``,`Adds extra classes to the item element.`,!1]],b=[[`className`,`string`,``,`Extra classes for the panel (height-animated, clips while it moves).`,!1],[`contentClassName`,`string`,``,`Extra classes for the padded content box inside the panel.`,!1]],x=[[`icon`,`ReactNode`,``,`Leading icon in a small tile; it picks up the accent while the item is open. Hidden from screen readers.`,!1],[`description`,`ReactNode`,``,`Shows a secondary line under the title.`,!1],[`indicator`,`"chevron" | "plus"`,`"chevron"`,`"chevron" turns over; "plus" becomes a minus.`,!1],[`headingLevel`,`HeadingLevelOption`,`3`,'Heading level of the wrapping header (`2` to `6`), to fit the page outline, or `"none"` for a paragraph with no heading role (for an example).',!1],[`className`,`string`,``,`Extra classes for the trigger button.`,!1]],S=e(t()),C=n(),w=[{value:`shipping`,title:`How long does shipping take?`,body:`Orders leave within a day and arrive in two to four.`},{value:`returns`,title:`Can I return an order?`,body:`Within 30 days, free, no questions asked.`},{value:`warranty`,title:`Is there a warranty?`,body:`Two years on every product, covered from the day it ships.`}];function T({scene:e}){let[t,n]=p(e.open);return(0,C.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:(0,C.jsx)(o,{value:t?[t]:[],onValueChange:e=>n(e.map(String)[0]??``),className:`w-full text-start`,children:w.map(e=>(0,C.jsxs)(i,{value:e.value,className:`min-h-[7.5rem] max-sm:min-h-[8.25rem]`,children:[(0,C.jsx)(r,{headingLevel:`none`,children:e.title}),(0,C.jsx)(a,{children:e.body})]},e.value))})})}var E=[{value:`shipping`,icon:h.truck,title:`How long does shipping take?`,description:`Orders and delivery`,body:`Orders placed before 2 pm ship the same day. Standard delivery takes three to five business days; express arrives the next business day in most cities.`},{value:`returns`,icon:h.undo,title:`Can I return an item?`,description:`Free within 30 days`,body:`Yes. Start a return from your order page within 30 days and drop the parcel at any pickup point. Refunds land on your original payment method within five days.`},{value:`warranty`,icon:h.shield,title:`What does the warranty cover?`,description:`Two years, parts and labour`,body:`Every device carries a two-year warranty against manufacturing defects. Accidental damage is covered only with SheenCare.`},{value:`support`,icon:h.message,title:`How do I reach support?`,description:`Chat, email or phone`,body:`Chat with us from any page, or email help@sheen.example. Phone support runs 8 am to 8 pm on weekdays.`}],D=`
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
import { MessageCircle as MessageIcon, Shield as ShieldIcon, Truck as TruckIcon, Undo2 as UndoIcon } from "lucide-react";

const faqs = [
  {
    value: "shipping",
    icon: <TruckIcon />,
    title: "How long does shipping take?",
    description: "Orders and delivery",
    body: "Orders placed before 2 pm ship the same day. Standard delivery takes three to five business days; express arrives the next business day in most cities.",
  },
  {
    value: "returns",
    icon: <UndoIcon />,
    title: "Can I return an item?",
    description: "Free within 30 days",
    body: "Yes. Start a return from your order page within 30 days and drop the parcel at any pickup point. Refunds land on your original payment method within five days.",
  },
  {
    value: "warranty",
    icon: <ShieldIcon />,
    title: "What does the warranty cover?",
    description: "Two years, parts and labour",
    body: "Every device carries a two-year warranty against manufacturing defects. Accidental damage is covered only with SheenCare.",
  },
  {
    value: "support",
    icon: <MessageIcon />,
    title: "How do I reach support?",
    description: "Chat, email or phone",
    body: "Chat with us from any page, or email help@sheen.example. Phone support runs 8 am to 8 pm on weekdays.",
  },
];

export function Example() {
  return (
    <Accordion defaultValue={["shipping"]}>
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionTrigger icon={faq.icon} description={faq.description}>
            {faq.title}
          </AccordionTrigger>
          <AccordionPanel>{faq.body}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}`,O=`
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Accordion variant="separated" multiple defaultValue={["plans", "billing"]}>
      <AccordionItem value="plans">
        <AccordionTrigger indicator="plus">Can I switch plans later?</AccordionTrigger>
        <AccordionPanel>Any time. Upgrades apply at once…</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger indicator="plus">When am I billed?</AccordionTrigger>
        <AccordionPanel>On the same day each month…</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="team">
        <AccordionTrigger indicator="plus">Do you offer team discounts?</AccordionTrigger>
        <AccordionPanel>Teams of ten or more get 20% off…</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}`,k=`
import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  GlassCard,
} from "@sheenui/theme";
import { CreditCard as CardIcon, User as UserIcon } from "lucide-react";

export function Example() {
  const [open, setOpen] = useState<string[]>(["profile"]);
  // Every item that can open: the disabled one stays closed.
  const all = ["profile", "notifications", "security"];

  return (
    <>
      <Button size="sm" variant="glass" onClick={() => setOpen(all)}>Expand all</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen([])}>Collapse all</Button>

      <GlassCard className="p-2">
        <Accordion variant="plain" multiple value={open} onValueChange={(value) => setOpen(value as string[])}>
          <AccordionItem value="profile">
            <AccordionTrigger icon={<UserIcon />}>Profile</AccordionTrigger>
            <AccordionPanel>Name, photo and email.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="notifications">
            <AccordionTrigger>Notifications</AccordionTrigger>
            <AccordionPanel>Choose what we email you about.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger>Security</AccordionTrigger>
            <AccordionPanel>Password and two-step sign-in.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="billing" disabled>
            <AccordionTrigger icon={<CardIcon />} description="Ask an owner to unlock">Billing</AccordionTrigger>
            <AccordionPanel>Plans and invoices.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </GlassCard>
    </>
  );
}`,A=g(()=>_(()=>import(`./accordion-demo-LwtGpMtC.js`).then(e=>e.AccordionControlledDemo),[]),{minHeight:`22rem`}),j={eager:!0,minHeight:`80vh`};function M(){let[e,t]=(0,S.useState)([`shipping`]);return(0,C.jsxs)(c,{eyebrow:`Layout`,title:`Accordion`,description:`Stacked sections that expand in place. The height follows a spring on the way open and a quicker ease on the way closed, the chevron turns with it, and the content drifts into place. Every trigger is a real button in the tab order.`,source:`theme/src/components/accordion/accordion.tsx`,children:[(0,C.jsx)(f,{label:`Accordion demo`,story:()=>_(()=>import(`./ShowcaseStage.accordion-Bjh1_PeV.js`),[]),initial:{open:`shipping`},minHeight:`32rem`,children:(e,t)=>(0,C.jsx)(T,{scene:e,ctx:t})}),(0,C.jsx)(d,{title:`FAQ`,description:`The default glass variant: one card, and the open item rises as a lighter pane. Leading icons pick up the accent while open.`,autoplay:()=>{let e=E.find(e=>e.value!==`shipping`)?.value,n=[window.setTimeout(()=>t(e?[e]:[]),600),window.setTimeout(()=>t([`shipping`]),2600)];return()=>{n.forEach(e=>window.clearTimeout(e)),t([`shipping`])}},code:D,children:(0,C.jsx)(o,{value:e,onValueChange:e=>t(e.map(String)),className:`min-h-[704px] max-w-xl min-[360px]:min-h-[597px] min-[390px]:min-h-[525px] min-[500px]:min-h-[449px] min-[640px]:min-h-[413px]`,children:E.map(e=>(0,C.jsxs)(i,{value:e.value,children:[(0,C.jsx)(r,{icon:m(e.icon),description:e.description,children:e.title}),(0,C.jsx)(a,{children:e.body})]},e.value))})}),(0,C.jsx)(d,{title:`Separated, several open`,description:`Each item is its own glass card. multiple lets any number stay open; the plus folds into a minus.`,code:O,children:(0,C.jsxs)(o,{variant:`separated`,multiple:!0,defaultValue:[`plans`,`billing`],className:`max-w-xl`,children:[(0,C.jsxs)(i,{value:`plans`,children:[(0,C.jsx)(r,{indicator:`plus`,children:`Can I switch plans later?`}),(0,C.jsx)(a,{children:`Any time. Upgrades apply at once and are prorated; downgrades take effect at the end of the billing period.`})]}),(0,C.jsxs)(i,{value:`billing`,children:[(0,C.jsx)(r,{indicator:`plus`,children:`When am I billed?`}),(0,C.jsx)(a,{children:`On the same day each month as your first payment. Annual plans are billed once a year and save two months.`})]}),(0,C.jsxs)(i,{value:`team`,children:[(0,C.jsx)(r,{indicator:`plus`,children:`Do you offer team discounts?`}),(0,C.jsx)(a,{children:`Teams of ten or more get 20% off every seat. Nonprofits and schools get 50% off.`})]})]})}),(0,C.jsx)(d,{title:`Plain, controlled, inside a card`,description:`variant="plain" has no surface of its own, for settings inside an existing card. value / onValueChange control which sections are open; a disabled item stays visible.`,code:k,children:(0,C.jsx)(A,{})}),(0,C.jsx)(u,{title:`Accordion`,of:v,rows:[[`multiple`,`boolean`,`false`,`Let several items stay open at once.`],[`defaultValue`,`any[]`,``,`Values of the items open at first (uncontrolled).`],[`value / onValueChange`,`any[] / (value) => void`,``,`Control which items are open.`],[`hiddenUntilFound`,`boolean`,`false`,`Closed panels stay in the page so the browser's find-in-page can open them.`],[`disabled`,`boolean`,`false`,`Disables every item of the group.`]]}),(0,C.jsx)(u,{title:`AccordionItem`,as:`h3`,of:y,rows:[[`value`,`any`,`auto id`,`Names the item for defaultValue / value.`],[`disabled`,`boolean`,`false`,`The trigger stays visible but cannot be toggled.`],[`onOpenChange`,`(open) => void`,``,`Called when this item opens or closes.`]]}),(0,C.jsx)(u,{title:`AccordionTrigger`,as:`h3`,of:x}),(0,C.jsx)(u,{title:`AccordionPanel`,as:`h3`,of:b,rows:[[`keepMounted`,`boolean`,`false`,`Keep closed content in the DOM.`]]}),(0,C.jsx)(l,{rows:[[`Tab / Shift + Tab`,`Move between triggers (disabled items are skipped).`],[`Enter / Space`,`Open or close the focused item.`]]}),(0,C.jsx)(s,{items:[`Each trigger is a native button inside a heading (headingLevel sets the level) with aria-expanded and aria-controls.`,`Closed panels are hidden from the accessibility tree, so their links are not tabbable; hiddenUntilFound lets find-in-page open matching panels.`,`A disabled item is announced as dimmed; the chevron and icon tile are aria-hidden.`]})]})}g(()=>_(()=>import(`./BreadcrumbPageBody-DILyB2ct.js`).then(e=>e.BreadcrumbPage),[]),j);export{M as default};