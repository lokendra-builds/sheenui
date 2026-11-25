import { DatePicker } from "@sheenui/theme";

import { DEMO_LOCALE, DEMO_TODAY } from "../demo-clock";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { DatePickerScene } from "./ShowcaseStage.date-picker";

const dayAfter = (offset: number) =>
  new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), DEMO_TODAY.getDate() + offset);
const diff = (d: Date) => Math.round((d.getTime() - DEMO_TODAY.getTime()) / 86_400_000);
const longDate = new Intl.DateTimeFormat(DEMO_LOCALE, { weekday: "long", day: "numeric", month: "long" });

/** The live DatePicker on its stage. */
export function DatePickerScene({ scene, ctx }: { scene: DatePickerScene; ctx: StageContext }) {
  const [offset, setOffset] = useFollow(scene.offset);
  const date = offset === null ? null : dayAfter(offset);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Schedule your delivery</p>
      <DatePicker
        label="Delivery date"
        value={date}
        onValueChange={(next) => {
          setOffset(next ? diff(next) : null);
          ctx.setState(next ? "success" : "idle");
        }}
        locale={DEMO_LOCALE}
        today={DEMO_TODAY}
        min={DEMO_TODAY}
        formatOptions={{ weekday: "short", day: "numeric", month: "long" }}
        className="sheen-stage-wide text-start"
      />
      <p className="sheen-stage-sub sheen-stage-slot">
        {date ? `Your parcel arrives on ${longDate.format(date)}.` : "Pick a day for the courier."}
      </p>
    </div>
  );
}
