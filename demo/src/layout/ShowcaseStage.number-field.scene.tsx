import { NumberField } from "@sheenui/theme";

import { DEMO_LOCALE } from "../demo-clock";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import { TICKET_PRICE, type NumberFieldScene } from "./ShowcaseStage.number-field";

const money = new Intl.NumberFormat(DEMO_LOCALE, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** The live NumberField on its stage, with a total that follows the quantity. */
export function NumberFieldScene({ scene, ctx }: { scene: NumberFieldScene; ctx: StageContext }) {
  const [quantity, setQuantity] = useFollow<number | null>(scene.quantity);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Concert tickets</p>
      <NumberField
        locale={DEMO_LOCALE}
        label="Quantity"
        value={quantity}
        onValueChange={(next) => {
          setQuantity(next);
          ctx.setState("idle");
        }}
        min={1}
        max={10}
        description={`${money.format(TICKET_PRICE)} each, up to 10 per order.`}
        className="sheen-stage-wide text-start"
      />
      <p className="sheen-stage-sub">
        Total: <strong className="text-sheen-fg">{money.format((quantity ?? 0) * TICKET_PRICE)}</strong>
      </p>
    </div>
  );
}
