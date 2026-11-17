import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarGroup, Badge, Button, Progress, useLoopPlayback, useToast } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import type { ProgressScene as ProgressSceneData } from "../layout/ShowcaseStage.progress";
import { ProgressScene } from "../layout/ShowcaseStage.progress.scene";
import type { BadgeScene as BadgeSceneData } from "../layout/ShowcaseStage.badge";
import { BadgeScene } from "../layout/ShowcaseStage.badge.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { AvatarScene as AvatarSceneData } from "../layout/ShowcaseStage.avatar";
import { AvatarScene } from "../layout/ShowcaseStage.avatar.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { DEMO_LOCALE } from "../demo-clock";
import * as PROPS from "../generated/component-props";

/** The "Avatar" docs page (/components/avatar): live examples, props and notes. */
export function AvatarPage() {
  const toast = useToast();

  return (
    <Page
      eyebrow="Component"
      title="Avatar"
      description="A round glass avatar with an image, or gradient initials when there is no image. Optional online status."
      source="theme/src/components/avatar/avatar.tsx"
    >
      <ShowcaseStage<AvatarSceneData>
        label="Avatar demo"
        story={() => import("../layout/ShowcaseStage.avatar")}
        initial={{ online: 0 }}
      >
        {(scene) => <AvatarScene scene={scene} />}
      </ShowcaseStage>

      <Example
        title="Sizes, status and groups"
        code={`
import { Avatar, AvatarGroup } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Avatar name="Ada Lovelace" size="lg" status="online" />
      <Avatar name="Asha Verma" status="away" />
      <AvatarGroup>
        <Avatar name="Ravi Kumar" size="sm" />
        <Avatar name="Meera Iyer" size="sm" />
        <Avatar name="John Doe" size="sm" />
      </AvatarGroup>
    </>
  );
}`}
      >
        <Avatar name="Ada Lovelace" size="lg" status="online" />
        <Avatar name="Asha Verma" status="away" />
        <Avatar name="Kabir Shah" size="sm" status="offline" />
        <AvatarGroup>
          <Avatar name="Ravi Kumar" />
          <Avatar name="Meera Iyer" />
          <Avatar name="John Doe" />
          <Avatar name="Sara Khan" />
        </AvatarGroup>
      </Example>

      <Example
        title="Clickable and labeled"
        description="An avatar is not interactive: wrap it in a button with a name, and label a group so people know who it shows."
        code={`
import { Avatar, AvatarGroup, useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <>
      <button
        type="button"
        aria-label="AL, open Ada Lovelace's profile"
        onClick={() => toast.success("Opening profile")}
        className="sheen-hit rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
      >
        <Avatar name="Ada Lovelace" status="online" />
      </button>

      <Avatar name="Grace Hopper" size="lg" status="away" />

      <AvatarGroup aria-label="Design team: Ravi, Meera and John">
        <Avatar name="Ravi Kumar" size="sm" />
        <Avatar name="Meera Iyer" size="sm" />
        <Avatar name="John Doe" size="sm" />
      </AvatarGroup>
    </>
  );
}`}
      >
        <button
          type="button"
          aria-label="AL, open Ada Lovelace's profile"
          onClick={() => toast.success("Opening profile")}
          className="sheen-hit rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
        >
          <Avatar name="Ada Lovelace" status="online" />
        </button>
        <Avatar name="Grace Hopper" size="lg" status="away" />
        <AvatarGroup aria-label="Design team: Ravi, Meera and John">
          <Avatar name="Ravi Kumar" size="sm" />
          <Avatar name="Meera Iyer" size="sm" />
          <Avatar name="John Doe" size="sm" />
        </AvatarGroup>
      </Example>
      <PropsTable of={PROPS.Avatar} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Not focusable: an Avatar is not interactive. Wrap it in a button or link when it should be clickable.",
          ],
        ]}
      />
      <A11yNotes
        items={[
          'An image avatar uses the person\'s name as its alt text. The initials fallback is role="img" with the full name as its label.',
          "The presence dot is its own labeled image (online, away, offline). Offline is a hollow ring, so states differ by shape, not only by color.",
          "In AvatarGroup, pass an aria-label that says who the people are; each avatar keeps its own name.",
          "Forced colors use system colors with an edge, so the status dot stays visible.",
        ]}
      />
    </Page>
  );
}

/** The "Badge" docs page (/components/badge): live examples, props and notes. */
export function BadgePage() {
  return (
    <Page
      eyebrow="Component"
      title="Badge"
      description="Small labels for status and counts. Status badges carry words, never color alone."
      source="theme/src/components/badge/badge.tsx"
    >
      <ShowcaseStage<BadgeSceneData>
        label="Badge demo"
        story={() => import("../layout/ShowcaseStage.badge")}
        initial={{ status: "pending" }}
      >
        {(scene) => <BadgeScene scene={scene} />}
      </ShowcaseStage>

      <Example
        title="Tones"
        code={`
import { Badge } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success" dot>Active</Badge>
      <Badge tone="warning" dot>Pending</Badge>
      <Badge tone="danger" dot>Failed</Badge>
      <Badge tone="solid">Pro</Badge>
      <Badge tone="success" pulse>Live</Badge>
    </>
  );
}`}
      >
        <Badge>Draft</Badge>
        <Badge tone="accent">New</Badge>
        <Badge tone="success" dot>
          Active
        </Badge>
        <Badge tone="warning" dot>
          Pending
        </Badge>
        <Badge tone="danger" dot>
          Failed
        </Badge>
        <Badge tone="solid">Pro</Badge>
        <Badge tone="success" pulse>
          Live
        </Badge>
      </Example>

      <Example
        title="Counts and inline status"
        description="Badges sit beside the thing they describe: a count on a button, a status next to a name."
        code={`
import { Badge, Button } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Button variant="glass">
        Inbox <Badge tone="accent">12</Badge>
      </Button>
      <p className="flex items-center gap-2 text-sm">
        Production deploy <Badge tone="success" dot>Passing</Badge>
      </p>
      <p className="flex items-center gap-2 text-sm">
        Billing <Badge tone="warning" dot>Past due</Badge>
      </p>
      <Badge tone="danger">3 failed</Badge>
    </>
  );
}`}
      >
        <Button variant="glass">
          Inbox <Badge tone="accent">12</Badge>
        </Button>
        <p className="flex items-center gap-2 text-sm">
          Production deploy{" "}
          <Badge tone="success" dot>
            Passing
          </Badge>
        </p>
        <p className="flex items-center gap-2 text-sm">
          Billing{" "}
          <Badge tone="warning" dot>
            Past due
          </Badge>
        </p>
        <Badge tone="danger">3 failed</Badge>
      </Example>
      <PropsTable of={PROPS.Badge} />
      <KeyboardTable
        rows={[["Tab", "Not focusable: a Badge is not interactive. Put it inside a button or link if it should be."]]}
      />
      <A11yNotes
        items={[
          "A badge always carries words, so color is never the only signal; the dot is aria-hidden.",
          "The tint sits on a near-opaque surface, so text keeps 4.5:1 contrast over glass or photos.",
          "The pulse stops after four pings (WCAG 2.2.2) and is off under reduced motion.",
        ]}
      />
    </Page>
  );
}

/** The "Progress" docs page (/components/progress): live examples, props and notes. */
export function ProgressPage() {
  const [value, setValue] = useState(18);
  const liveRef = useRef<HTMLDivElement>(null);
  // The demo's progress only advances while it is on screen and the tab is visible.
  const live = useLoopPlayback(liveRef, { respectReducedMotion: false });
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setValue((v) => (v >= 100 ? 8 : Math.min(100, v + 9))), 900);
    return () => clearInterval(timer);
  }, [live]);

  return (
    <Page
      eyebrow="Component"
      title="Progress"
      description="A glass track with an accent fill and a slow sweep of light. Pass null for an indeterminate loading bar."
      source="theme/src/components/progress/progress.tsx"
    >
      <ShowcaseStage<ProgressSceneData>
        label="Progress demo"
        story={() => import("../layout/ShowcaseStage.progress")}
        initial={{ value: 0 }}
      >
        {(scene) => <ProgressScene scene={scene} />}
      </ShowcaseStage>

      <Example
        title="Determinate and indeterminate"
        code={`
import { Progress } from "@sheenui/theme";

export function Example() {
  const value = 64; // 0 to 100

  return (
    <>
      <Progress label="Uploading design.fig" value={value} />
      <Progress label="Preparing export" value={null} />
    </>
  );
}`}
      >
        <div ref={liveRef} className="flex w-full max-w-md flex-col gap-6">
          <Progress locale={DEMO_LOCALE} label="Uploading design.fig" value={value} />
          <Progress locale={DEMO_LOCALE} label="Preparing export" value={null} />
          <Button variant="glass" size="sm" className="self-start" onClick={() => setValue(8)}>
            Restart
          </Button>
        </div>
      </Example>

      <Example
        title="Several tasks with labels"
        description="Each bar has its own name. The value is read to screen readers; showValue also prints it."
        code={`
import { Progress } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Progress label="Photos" value={100} />
      <Progress label="Videos" value={42} />
      <Progress label="Documents" value={7} showValue={false} />
      <Progress label="Waiting for the server" value={null} />
    </div>
  );
}`}
      >
        <div className="flex w-full max-w-sm flex-col gap-5">
          <Progress label="Photos" value={100} />
          <Progress label="Videos" value={42} />
          <Progress label="Documents" value={7} showValue={false} />
          <Progress label="Waiting for the server" value={null} />
        </div>
      </Example>
      <PropsTable of={PROPS.Progress} />
      <KeyboardTable rows={[["Tab", "Not focusable: Progress is a read-out, not a control."]]} />
      <A11yNotes
        items={[
          'Base UI renders role="progressbar" with aria-valuenow, aria-valuemin and aria-valuemax; label names it.',
          "value={null} is indeterminate: no aria-valuenow, so it is announced as busy rather than as a percentage.",
          "The track and fill keep 3:1 contrast against the surface. Under reduced motion the fill jumps to each new value and the indeterminate bar becomes a still, half-tone bar.",
        ]}
      />
    </Page>
  );
}
