import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./number-field-Cdbz5zPI.js";import{t as a}from"./Example-B3x8pgFu.js";import{t as o}from"./demo-clock-CoEY-AlH.js";import{n as s}from"./shared-BIVNUCsv.js";var c=e(t()),l=n();function u(){let[e,t]=(0,c.useState)(2),[n,u]=(0,c.useState)(12);return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(a,{title:`Steppers`,description:`Hold a button to repeat. Arrow keys step by 1, Shift by 10; Home and End jump to the limits. The buttons switch off at min and max. Reset sets the value from outside, and the digits still roll the right way.`,code:`
import { useState } from "react";
import { Button, NumberField } from "@sheenui/theme";

export function Example() {
  const [quantity, setQuantity] = useState<number | null>(2);

  return (
    <>
      <NumberField
        label="Quantity"
        value={quantity}
        onValueChange={setQuantity}
        min={1}
        max={20}
        description="Up to 20 per order."
      />
      {/* A change from outside rolls the digits the right way too. */}
      <Button variant="ghost" size="sm" onClick={() => setQuantity(1)}>
        Reset
      </Button>
    </>
  );
}`,children:(0,l.jsxs)(`div`,{className:`flex w-full max-w-xs flex-col gap-3`,children:[(0,l.jsx)(i,{locale:o,label:`Quantity`,value:e,onValueChange:t,min:1,max:20,description:`Up to 20 per order.`}),(0,l.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,l.jsxs)(s,{children:[`Value: `,(0,l.jsx)(`strong`,{children:e??`empty`})]}),(0,l.jsx)(r,{variant:`ghost`,size:`sm`,onClick:()=>t(1),children:`Reset`})]})]})}),(0,l.jsx)(a,{title:`Formatting`,description:`Pass any Intl.NumberFormat options. Typing is parsed back in the same format and locale.`,code:`
import { NumberField } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <NumberField
        label="Price"
        defaultValue={49}
        step={0.5}
        min={0}
        format={{ style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }}
      />
      <NumberField
        label="Discount"
        defaultValue={0.15}
        step={0.05}
        min={0}
        max={1}
        steppers="stacked"
        format={{ style: "percent" }}
      />
      <NumberField
        label="Weight"
        defaultValue={2.5}
        step={0.1}
        min={0}
        steppers="stacked"
        format={{ style: "unit", unit: "kilogram", maximumFractionDigits: 1 }}
      />
    </>
  );
}`,children:(0,l.jsxs)(`div`,{className:`grid w-full max-w-2xl gap-5 sm:grid-cols-3`,children:[(0,l.jsx)(i,{locale:o,label:`Price`,defaultValue:49,step:.5,min:0,format:{style:`currency`,currency:`USD`,currencyDisplay:`narrowSymbol`}}),(0,l.jsx)(i,{locale:o,label:`Discount`,defaultValue:.15,step:.05,min:0,max:1,steppers:`stacked`,format:{style:`percent`}}),(0,l.jsx)(i,{locale:o,label:`Weight`,defaultValue:2.5,step:.1,min:0,steppers:`stacked`,format:{style:`unit`,unit:`kilogram`,maximumFractionDigits:1}})]})}),(0,l.jsx)(a,{title:`Scrub and validation`,description:`With scrub, drag the label sideways to change the value (the pointer is captured, so you can keep dragging). Errors are linked to the input and announced politely when they appear.`,code:`
import { useState } from "react";
import { NumberField } from "@sheenui/theme";

export function Example() {
  const [guests, setGuests] = useState<number | null>(2);

  return (
    <>
      <NumberField
        label="Opacity"
        scrub
        defaultValue={0.8}
        step={0.01}
        min={0}
        max={1}
        format={{ style: "percent" }}
      />
      <NumberField
        label="Guests"
        value={guests}
        onValueChange={setGuests}
        min={1}
        error={guests !== null && guests > 10 ? "The room seats 10 people at most." : undefined}
      />
    </>
  );
}`,children:(0,l.jsxs)(`div`,{className:`grid w-full max-w-lg gap-5 sm:grid-cols-2`,children:[(0,l.jsx)(i,{locale:o,label:`Opacity`,scrub:!0,defaultValue:.8,step:.01,min:0,max:1,format:{style:`percent`}}),(0,l.jsx)(i,{locale:o,label:`Guests`,value:n,onValueChange:u,min:1,error:n!==null&&n>10?`The room seats 10 people at most.`:void 0})]})})]})}export{u as NumberFieldExamples};