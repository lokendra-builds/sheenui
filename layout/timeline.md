Canonical: https://lokendra-builds.github.io/sheenui/layout/timeline

# Animated React Timeline & Activity Feed

URL: https://lokendra-builds.github.io/sheenui/layout/timeline
Sidebar name: Timeline

An animated vertical timeline for React: markers pop in and lines draw down as events scroll into view. For audit logs, order tracking and changelogs. MIT.

What it is: An animated React timeline for activity feeds, audit logs, order tracking and changelogs that draws itself as you scroll. Use it as an activity feed or audit log with avatars, action badges and a Today group heading, where new events should slide in at the top and push the rest down smoothly.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/timeline.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Timeline

Files to copy from `theme/src/`:

- `components/timeline/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, no-script-reveal.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: timeline. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Badge } from "@/components/sheenui/badge/badge";
import { Timeline, TimelineHeading, TimelineItem } from "@/components/sheenui/timeline/timeline";
```

These examples also use avatar, badge: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json https://lokendra-builds.github.io/sheenui/r/badge.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, Badge, Timeline, TimelineHeading, TimelineItem } from "@sheenui/theme";
```

## Timeline

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| layout | "start" \| "alternate" | "start" | "start" (default): markers on the inline start. "alternate": zig-zag around a centred rail on wide containers. |
| size | "sm" \| "md" | "md" | Sets the marker and text size. |
| animate | boolean | true | Animate items as they scroll into view. Always off under reduced motion. |
| className | string | optional, no default | Extra classes for the <ol> that holds the items (set its spacing or width here). |
| aria-label | string | optional, no default | Sets the name of the list, e.g. “Activity”. |

## TimelineItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | required | What happened. Rich content is fine: "<b>Ada</b> merged <a>#42</a>". |
| time | ReactNode | optional, no default | Sets when it happened, as shown ("2h ago", "Oct 30, 09:12"). |
| dateTime | string \| Date | optional, no default | Machine-readable date for the <time> element (and its hover title). |
| locale | string | optional, no default | Locale for the full date in the hover title. |
| description | ReactNode | optional, no default | Shows supporting text under the title. |
| icon | ReactNode | optional, no default | Icon in a tinted disc. With avatar, a small badge on the avatar instead. |
| avatar | ReactNode | optional, no default | An avatar as the marker, e.g. <Avatar name="Ada Lovelace" size="sm" />. |
| tone | TimelineTone | "neutral" | Colour of the marker: "neutral" (default), "accent", "success", "warning" or "danger". |
| current | boolean | false | The live step (order tracking): a soft pulse and aria-current="step". |
| connector | "accent" \| "solid" \| "dashed" | "solid" | Line from this item to the next: "solid" (default), "dashed" for not-yet-happened, "accent" for a completed path. |
| children | ReactNode | optional, no default | Extra content under the text: a comment, attachments, a diff. Moves in, never fades (safe for glass). |
| className | string | optional, no default | Extra classes for the <li> of this entry (set its spacing or tone here). |
| contentClassName | string | optional, no default | Adds a class name to the content column. |

## TimelineHeading

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Extra classes for the <li> of this entry (set its spacing or tone here). |

## Example 1 of 3: Activity feed

Avatars with action badges, rich titles, a comment, group headings and a plain dot for minor events. Press “Simulate activity”: the new event slides in at the top and the rest make room.

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Timeline, TimelineHeading, TimelineItem } from "@/components/sheenui/timeline/timeline";
// Package build (after the first npm release, or a packed tarball): import { Avatar, Timeline, TimelineHeading, TimelineItem } from "@sheenui/theme";
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
}
```

## Example 2 of 3: Order tracking

connector="accent" for the path already travelled, current for the live step (a soft pulse and aria-current), dashed for what has not happened yet.

```tsx
import { Timeline, TimelineItem } from "@/components/sheenui/timeline/timeline";
// Package build (after the first npm release, or a packed tarball): import { Timeline, TimelineItem } from "@sheenui/theme";
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
}
```

## Example 3 of 3: Alternate (changelog)

Wide containers zig-zag around a centered rail with dates on the opposite side; narrow ones fall back to a list.

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { Timeline, TimelineItem } from "@/components/sheenui/timeline/timeline";
// Package build (after the first npm release, or a packed tarball): import { Badge, Timeline, TimelineItem } from "@sheenui/theme";
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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the list is not focusable. Links and buttons inside items are normal tab stops. |

## Accessibility

- An ordered list (<ol>): pass aria-label. Timestamps are <time dateTime> when you give dateTime.
- The live step has aria-current="step"; markers and connector lines are decorative, so state is also written in words.
- Marker pop and line draw do not run under reduced motion.

## When to use Timeline

- Use it for a project activity feed or an audit log where each entry has an avatar, a time and an action badge, grouped under headings such as Today, and a new entry slides in at the top. Use it as a vertical timeline in Tailwind for an order history or release notes.
- Use it for order tracking, with connector="accent" on completed steps, a current step that pulses softly, and a dashed line to what has not happened yet.
- Use layout="alternate" for a changelog or company history, where a wide container zig-zags around a centered rail with dates opposite, and narrow ones fall back to a plain list.
- Skip it when the user must act on each stage in sequence; Stepper handles progress through a flow, and Data table is better for dense, sortable records of the same kind.
- Pair it with Avatar for people markers, Badge for statuses in an item's content, and Skeleton while older events load.


## Frequently asked questions

### How do I make a react timeline for an activity feed?

Render Timeline with TimelineItem children, each with title, time, description, icon or avatar, and tone. Use TimelineHeading for group labels such as Today. Pass aria-label to name the list. Items reveal as they scroll into view, and new items push the feed down smoothly.

### How do I mark the current step in order tracking?

Set current on the live TimelineItem for a soft pulse and aria-current="step", and use connector to style the line to the next item: solid, dashed or accent. Because markers and lines are decorative, also describe state in words, for example in the title or description.

### How should I format dates on timeline items?

Give time as the text you want shown and dateTime as a string or Date, so the item renders a real time element with a machine-readable value and a full date on hover. The locale prop sets the language of that full date and defaults to the browser's.

### Does it animate for users who prefer reduced motion?

The marker pop and line draw do not run under reduced motion, and animate is always off in that case. You can also set animate to false yourself. The list is an ordered list, it is not focusable, and links or buttons inside items remain normal tab stops.


## Related pages

- [Toolbar](https://lokendra-builds.github.io/sheenui/layout/toolbar)
- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Aspect ratio](https://lokendra-builds.github.io/sheenui/layout/aspect-ratio)
- [Breadcrumb](https://lokendra-builds.github.io/sheenui/layout/breadcrumb)
- [Collapsible](https://lokendra-builds.github.io/sheenui/layout/collapsible)
- [Pagination](https://lokendra-builds.github.io/sheenui/layout/pagination)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
