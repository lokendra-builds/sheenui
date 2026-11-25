import { useState } from "react";
import { Button, NumberField } from "@sheenui/theme";

import { Example } from "../layout/Example";
import { DEMO_LOCALE } from "../demo-clock";
import { Readout } from "./FormKitPages/shared";

/** The live examples of the Number field page (/forms/number-field), loaded as one island by TextareaNumberFieldPages. */
export function NumberFieldExamples() {
  const [quantity, setQuantity] = useState<number | null>(2);
  const [guests, setGuests] = useState<number | null>(12);
  const guestsError = guests !== null && guests > 10 ? "The room seats 10 people at most." : undefined;

  return (
    <>
      <Example
        title="Steppers"
        description="Hold a button to repeat. Arrow keys step by 1, Shift by 10; Home and End jump to the limits. The buttons switch off at min and max. Reset sets the value from outside, and the digits still roll the right way."
        code={`
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
}`}
      >
        <div className="flex w-full max-w-xs flex-col gap-3">
          <NumberField
            locale={DEMO_LOCALE}
            label="Quantity"
            value={quantity}
            onValueChange={setQuantity}
            min={1}
            max={20}
            description="Up to 20 per order."
          />
          <div className="flex items-center justify-between gap-3">
            <Readout>
              Value: <strong>{quantity ?? "empty"}</strong>
            </Readout>
            <Button variant="ghost" size="sm" onClick={() => setQuantity(1)}>
              Reset
            </Button>
          </div>
        </div>
      </Example>

      <Example
        title="Formatting"
        description="Pass any Intl.NumberFormat options. Typing is parsed back in the same format and locale."
        code={`
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
}`}
      >
        <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-3">
          <NumberField
            locale={DEMO_LOCALE}
            label="Price"
            defaultValue={49}
            step={0.5}
            min={0}
            format={{ style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }}
          />
          <NumberField
            locale={DEMO_LOCALE}
            label="Discount"
            defaultValue={0.15}
            step={0.05}
            min={0}
            max={1}
            steppers="stacked"
            format={{ style: "percent" }}
          />
          <NumberField
            locale={DEMO_LOCALE}
            label="Weight"
            defaultValue={2.5}
            step={0.1}
            min={0}
            steppers="stacked"
            format={{ style: "unit", unit: "kilogram", maximumFractionDigits: 1 }}
          />
        </div>
      </Example>

      <Example
        title="Scrub and validation"
        description="With scrub, drag the label sideways to change the value (the pointer is captured, so you can keep dragging). Errors are linked to the input and announced politely when they appear."
        code={`
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
}`}
      >
        <div className="grid w-full max-w-lg gap-5 sm:grid-cols-2">
          <NumberField
            locale={DEMO_LOCALE}
            label="Opacity"
            scrub
            defaultValue={0.8}
            step={0.01}
            min={0}
            max={1}
            format={{ style: "percent" }}
          />
          <NumberField
            locale={DEMO_LOCALE}
            label="Guests"
            value={guests}
            onValueChange={setGuests}
            min={1}
            error={guestsError}
          />
        </div>
      </Example>
    </>
  );
}
