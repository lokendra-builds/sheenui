import { Calendar, GlassCard } from "@sheenui/theme";

import { DEMO_LOCALE, DEMO_TODAY } from "../demo-clock";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { CalendarScene } from "./ShowcaseStage.calendar";

const dayAfter = (offset: number) =>
  new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), DEMO_TODAY.getDate() + offset);
const diff = (d: Date) => Math.round((d.getTime() - DEMO_TODAY.getTime()) / 86_400_000);

/** The live Calendar on its stage: the story picks days; the person's own pick wins. */
export function CalendarScene({ scene, ctx }: { scene: CalendarScene; ctx: StageContext }) {
  const [offset, setOffset] = useFollow(scene.offset);
  const date = offset === null ? null : dayAfter(offset);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Pick a check-in day</p>
      <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-3">
        <Calendar
          value={date}
          onValueChange={(next) => {
            setOffset(next ? diff(next) : null);
            ctx.setState(next ? "success" : "idle");
          }}
          locale={DEMO_LOCALE}
          today={DEMO_TODAY}
          aria-label="Pick a date"
        />
      </GlassCard>
      <p className="sheen-stage-sub">
        {date ? new Intl.DateTimeFormat(DEMO_LOCALE, { dateStyle: "full" }).format(date) : "No day picked yet"}
      </p>
    </div>
  );
}
