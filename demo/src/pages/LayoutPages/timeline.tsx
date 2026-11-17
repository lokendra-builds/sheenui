import { useState, type ReactNode } from "react";
import { Avatar, Button, GlassCard } from "@sheenui/theme";
import { Timeline, TimelineHeading, TimelineItem } from "@sheenui/theme";
import { DEMO_LOCALE } from "../../demo-clock";
import { DemoLink, I, icon } from "./shared";

/* =====================================================================
 * Timeline
 * ===================================================================== */

type FeedEvent = {
  id: string;
  who: string;
  what: ReactNode;
  icon: string;
  tone: "neutral" | "accent" | "success" | "warning" | "danger";
  time: string;
  at: string;
  avatar?: boolean;
  dot?: boolean;
  description?: ReactNode;
  comment?: string;
};

const feedSeed: FeedEvent[] = [
  {
    id: "e1",
    who: "Ada Lovelace",
    what: (
      <>
        merged <DemoLink to="/pr/482">#482</DemoLink> into main
      </>
    ),
    icon: I.merge,
    tone: "accent",
    time: "12 min ago",
    at: "2026-10-30T10:48:00",
    avatar: true,
  },
  {
    id: "e2",
    who: "Grace Hopper",
    what: (
      <>
        commented on <DemoLink to="/pr/482">#482</DemoLink>
      </>
    ),
    icon: I.comment,
    tone: "neutral",
    time: "40 min ago",
    at: "2026-10-30T10:20:00",
    avatar: true,
    comment: "Lovely. The glass fallback for reduced transparency reads much better now. Ship it!",
  },
  {
    id: "e3",
    who: "Deploy bot",
    what: (
      <>
        <b>Production</b> deploy finished
      </>
    ),
    icon: I.rocket,
    tone: "success",
    time: "1 h ago",
    at: "2026-10-30T10:00:00",
    description: "v2.14.0 · 48 s · 0 errors",
  },
  {
    id: "e4",
    who: "Linus Torvalds",
    what: (
      <>
        <b>Linus</b> viewed the release notes
      </>
    ),
    icon: "",
    tone: "neutral",
    time: "2 h ago",
    at: "2026-10-30T09:00:00",
    dot: true,
  },
];

const feedYesterday: FeedEvent[] = [
  {
    id: "y1",
    who: "CI",
    what: (
      <>
        Build <b>#1288</b> failed
      </>
    ),
    icon: I.x,
    tone: "danger",
    time: "Yesterday, 18:04",
    at: "2026-10-29T18:04:00",
    description: "2 tests failed in breadcrumb.test.tsx",
  },
  {
    id: "y2",
    who: "Ada Lovelace",
    what: (
      <>
        opened <DemoLink to="/pr/482">#482</DemoLink> Collapse breadcrumbs
      </>
    ),
    icon: I.pull,
    tone: "accent",
    time: "Yesterday, 16:30",
    at: "2026-10-29T16:30:00",
    avatar: true,
  },
];

const incoming: Omit<FeedEvent, "id" | "time" | "at">[] = [
  {
    who: "Linus Torvalds",
    what: (
      <>
        starred <b>sheenui</b>
      </>
    ),
    icon: I.star,
    tone: "warning",
    avatar: true,
  },
  {
    who: "Grace Hopper",
    what: (
      <>
        approved <DemoLink to="/pr/490">#490</DemoLink>
      </>
    ),
    icon: I.check,
    tone: "success",
    avatar: true,
  },
  {
    who: "Margaret Hamilton",
    what: (
      <>
        opened <DemoLink to="/pr/491">#491</DemoLink> Timeline docs
      </>
    ),
    icon: I.pull,
    tone: "accent",
    avatar: true,
  },
  {
    who: "Deploy bot",
    what: (
      <>
        <b>Preview</b> deploy is ready
      </>
    ),
    icon: I.rocket,
    tone: "success",
    description: "pe-491.example.com",
  },
];

function FeedItem({ event }: { event: FeedEvent }) {
  const name = event.who.split(" ")[0];
  return (
    <TimelineItem
      avatar={event.avatar ? <Avatar name={event.who} size="sm" /> : undefined}
      icon={event.icon ? icon(event.icon) : undefined}
      tone={event.tone}
      title={
        event.avatar ? (
          <>
            <b>{name}</b> {event.what}
          </>
        ) : (
          event.what
        )
      }
      time={event.time}
      dateTime={event.at}
      locale={DEMO_LOCALE}
      description={event.description}
    >
      {event.comment && (
        <div className="glass-1 rounded-sheen-md rounded-ss-sm px-3.5 py-2.5 text-sm text-sheen-fg">
          {event.comment}
        </div>
      )}
    </TimelineItem>
  );
}

export const timelineFeedCode = `
import { Avatar, Timeline, TimelineHeading, TimelineItem } from "@sheenui/theme";
import { GitMerge as MergeIcon, MessageSquare as CommentIcon, Rocket as RocketIcon } from "lucide-react";

export function Example() {
  return (
    <Timeline aria-label="Activity">
      <TimelineHeading>Today</TimelineHeading>
      <TimelineItem
        avatar={<Avatar name="Ada Lovelace" size="sm" />}
        icon={<MergeIcon />} // a badge on the avatar
        tone="accent"
        title={<><b>Ada</b> merged <a href={"/pr/482"}>#482</a> into main</>}
        time="12 min ago"
        dateTime="2026-10-30T10:48"
      />
      <TimelineItem
        avatar={<Avatar name="Grace Hopper" size="sm" />}
        icon={<CommentIcon />}
        title={<><b>Grace</b> commented on #482</>}
        time="40 min ago"
      >
        <div className="glass-1 rounded-sheen-md px-3.5 py-2.5 text-sm">Lovely. Ship it!</div>
      </TimelineItem>
      <TimelineItem icon={<RocketIcon />} tone="success" title="Production deploy finished" description="v2.14.0 · 48 s" time="1 h ago" />
      {/* No icon: a dot */}
      <TimelineItem title="Linus viewed the release notes" time="2 h ago" />
      <TimelineHeading>Yesterday</TimelineHeading>
      <TimelineItem title="Release 2.13.0 published" time="Yesterday" />
    </Timeline>
  );
}`;

export function TimelineFeedDemo() {
  const [events, setEvents] = useState(feedSeed);
  const [count, setCount] = useState(0);
  const add = () => {
    const next = incoming[count % incoming.length];
    if (!next) return;
    setEvents((list) => [{ ...next, id: `n${count}`, time: "Just now", at: new Date().toISOString() }, ...list]);
    setCount((c) => c + 1);
  };
  return (
    <GlassCard className="flex w-full max-w-xl flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="activity" className="text-base font-semibold">
          Activity
        </h3>
        <Button size="sm" variant="glass" leading={icon(I.plus, "size-4")} onClick={add}>
          Simulate activity
        </Button>
      </div>
      <Timeline aria-label="Activity">
        <TimelineHeading>Today</TimelineHeading>
        {events.map((event) => (
          <FeedItem key={event.id} event={event} />
        ))}
        <TimelineHeading>Yesterday</TimelineHeading>
        {feedYesterday.map((event) => (
          <FeedItem key={event.id} event={event} />
        ))}
      </Timeline>
    </GlassCard>
  );
}

export const timelineOrderCode = `
import { Timeline, TimelineItem } from "@sheenui/theme";
import { Package as BoxIcon, Check as CheckIcon, House as HomeIcon, Map as MapIcon, Truck as TruckIcon } from "lucide-react";

export function Example() {
  return (
    <Timeline aria-label="Order status" size="sm">
      <TimelineItem icon={<CheckIcon />} tone="success" connector="accent" title="Order placed" time="Oct 27, 09:12" />
      <TimelineItem icon={<BoxIcon />} tone="success" connector="accent" title="Packed" time="Oct 27, 15:40" />
      <TimelineItem icon={<TruckIcon />} tone="success" connector="accent" title="Shipped" description="Parcel SH-48213" time="Oct 28, 08:05" />
      <TimelineItem icon={<MapIcon />} tone="accent" current connector="dashed" title="Out for delivery" description="Arriving by 6 pm" time="Today, 07:30" />
      <TimelineItem icon={<HomeIcon />} title="Delivered" description="Expected today" />
    </Timeline>
  );
}`;

export const timelineAltCode = `
import { Badge, Timeline, TimelineItem } from "@sheenui/theme";
import { Sparkles as SparkleIcon, Tag as TagIcon } from "lucide-react";

export function Example() {
  // Zig-zag around a centered rail when the timeline is at least 42rem wide;
  // a normal list below that (a container query, so it adapts to its own width).

  return (
    <Timeline layout="alternate" aria-label="Changelog">
      <TimelineItem icon={<SparkleIcon />} tone="accent" title={<>v2.14 <Badge tone="accent">Latest</Badge></>} time="Oct 2026" description="…" />
      <TimelineItem icon={<TagIcon />} title="v2.13" time="Sep 2026" description="…" />
      <TimelineItem icon={<TagIcon />} title="v2.12" time="Aug 2026" description="…" />
    </Timeline>
  );
}`;
