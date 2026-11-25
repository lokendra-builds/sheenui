import { Timeline, TimelineItem } from "@sheenui/theme";

import { I, icon } from "../pages/LayoutPages/shared";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { TimelineScene } from "./ShowcaseStage.timeline";

const EVENTS = [
  { title: "Order placed", description: "Oct 27, 09:12", icon: I.check },
  { title: "Packed", description: "Oct 27, 15:40", icon: I.box },
  { title: "Shipped", description: "Parcel SH-48213", icon: I.truck },
  { title: "Delivered", description: "Oct 29, 11:05", icon: I.home },
] as const;

/** The live Timeline on its stage: an order's events, the travelled path in accent. */
export function TimelineScene({ scene }: { scene: TimelineScene; ctx: StageContext }) {
  const [count] = useFollow(scene.count);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Timeline aria-label="Order status" size="sm" className="w-full text-start">
        {EVENTS.slice(0, count).map((event, i, shown) => {
          const last = i === shown.length - 1;
          const done = !last || count === EVENTS.length;
          return (
            <TimelineItem
              key={event.title}
              title={event.title}
              description={event.description}
              icon={icon(event.icon)}
              tone={done ? "success" : "accent"}
              current={!done}
              connector={done ? "accent" : "dashed"}
            />
          );
        })}
      </Timeline>
    </div>
  );
}
