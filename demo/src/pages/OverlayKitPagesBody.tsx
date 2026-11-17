import { useState } from "react";
import { Avatar, Switch } from "@sheenui/theme";
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview, ProfilePreview } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { AlertDialogScene as AlertDialogSceneData } from "../layout/ShowcaseStage.alert-dialog";
import { AlertDialogScene } from "../layout/ShowcaseStage.alert-dialog.scene";
import type { DrawerScene as DrawerSceneData } from "../layout/ShowcaseStage.drawer";
import { DrawerScene } from "../layout/ShowcaseStage.drawer.scene";
import type { HoverCardScene as HoverCardSceneData } from "../layout/ShowcaseStage.hover-card";
import { HoverCardScene } from "../layout/ShowcaseStage.hover-card.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { Segmented } from "../layout/Segmented";
import * as PROPS from "../generated/component-props";
import { NearbySheetDemo, NestedSheetsDemo, ShareSheetDemo, SideSheetsDemo } from "./OverlayKitPages/drawer";
import { ComposedDemo, DeleteProjectDemo, TypeToConfirmDemo, UseConfirmDemo } from "./OverlayKitPages/alert-dialog";
import {
  Mention,
  SiteLink,
  delayOptions,
  hoverCardCode,
  links,
  sideOptions,
  team,
  teamCard,
} from "./OverlayKitPages/hover-card";

/** The "Drawer / Sheet" docs page (/overlays/drawer): live examples, props and notes. */
export function DrawerPage() {
  return (
    <Page
      eyebrow="Overlay"
      title="Drawer / Sheet"
      description="A strong-glass panel that slides in from an edge. Bottom sheets have a drag handle, swipe-to-dismiss and optional snap points; side and top sheets attach to the edge or float. Focus is trapped, Escape closes it, and safe-area insets keep it clear of notches and home indicators."
      source="theme/src/components/drawer/drawer.tsx"
    >
      <ShowcaseStage<DrawerSceneData>
        label="Drawer demo"
        story={() => import("../layout/ShowcaseStage.drawer")}
        initial={{ open: false, pick: "", applied: false }}
        minHeight="22rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <DrawerScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Bottom sheet"
        description="Swipe the sheet down (or press Escape, or tap outside) to dismiss it. Releasing a quick flick keeps its momentum; a button close is shorter and never overshoots."
        code={`
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
} from "@sheenui/theme";

const targets = [{ label: "Copy link" }, { label: "Email" }, { label: "Chat app" }];
const share = (target: { label: string }) => console.log("share via", target.label);

export function Example() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button />}>Share</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share “Q3 roadmap”</DrawerTitle>
          <DrawerDescription>Anyone in Acme with the link can view and comment.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          {targets.map((t) => (
            <DrawerClose key={t.label} onClick={() => share(t)}>{t.label}</DrawerClose>
          ))}
          <Input label="Link" readOnly defaultValue="https://example.com/d/q3-roadmap" />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="glass" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}`}
      >
        <ShareSheetDemo />
      </Example>

      <Example
        title="Snap points"
        description="Peek, half and full heights. Peek is measured from the content (handle, header and the first row) and half always shows more than peek, even on a landscape phone. Drag between them, flick to skip one, or use the handle: it is a button that reads out the current height (Enter cycles, arrow keys step). Keyboard focus is never hidden: rows scroll into view inside the sheet, and a control that can't (below the screen edge) opens it fully. A click or tap never changes the height."
        code={`
import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  type DrawerSnapPoint,
  DrawerTitle,
  DrawerTrigger,
} from "@sheenui/theme";

const places = [{ name: "Café Aurora" }, { name: "Riverside Park" }, { name: "Night Market" }];

export function Example() {
  // "peek" = handle + header + first row (measured); "half" = 50% of the screen, at least a row above peek.
  // Your own heights work too: snapPoints={["148px", 0.6, 1]}
  // Translate the handle: labels={{ snapPoints: { half: "Halbe Höhe" } }}
  const [snap, setSnap] = useState<DrawerSnapPoint | null>("half");

  return (
    <Drawer snapPoints={["peek", "half", "full"]} snapPoint={snap} onSnapPointChange={setSnap}>
        <DrawerTrigger render={<Button variant="glass" />}>Nearby places</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nearby</DrawerTitle>
            <DrawerDescription>12 places within 2 km.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>{places.map((p) => (
                <p key={p.name}>{p.name}</p>
              ))}</DrawerBody>
        </DrawerContent>
      </Drawer>
  );
}`}
      >
        <NearbySheetDemo />
      </Example>

      <Example
        title="Side and top sheets"
        description="side picks the edge (and the swipe direction that closes it). inset floats the panel off the edges with rounded corners."
        code={`
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Switch,
} from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Drawer side="left">
        <DrawerTrigger render={<Button variant="glass" />}>Menu</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <DrawerClose render={<Button variant="ghost" fullWidth />}>Home</DrawerClose>
            <DrawerClose render={<Button variant="ghost" fullWidth />}>Projects</DrawerClose>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer side="right">
        <DrawerTrigger render={<Button variant="glass" />}>Settings</DrawerTrigger>
        <DrawerContent inset>
          <DrawerHeader>
            <DrawerTitle>Notification settings</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Input label="Email" type="email" defaultValue="ada@example.com" />
            <Switch label="Mentions" defaultChecked />
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
            <DrawerClose render={<Button />}>Save</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer side="top">
        <DrawerTrigger render={<Button variant="glass" />}>Announcement</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>What's new</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Got it</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}`}
      >
        <SideSheetsDemo />
      </Example>

      <Example
        title="Nested sheets"
        description="A drawer opened from inside another one stacks on top; the one behind steps back and dims. Swipe or Escape closes only the front one."
        code={`
import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@sheenui/theme";

const standard = { id: "standard", label: "Standard · free" };
const options = [standard, { id: "express", label: "Express · $5" }];

export function Example() {
  const [delivery, setDelivery] = useState("standard");
  const chosen = options.find((o) => o.id === delivery) ?? standard;

  return (
    <Drawer>
      <DrawerTrigger render={<Button />}>Cart (3)</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Your cart</DrawerTitle></DrawerHeader>
        <DrawerBody>
          <p>3 items · $126.00</p>
          <Drawer>
            <DrawerTrigger>Delivery: {chosen.label}</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Delivery</DrawerTitle></DrawerHeader>
              <DrawerBody>{options.map((o) => <DrawerClose key={o.id} onClick={() => setDelivery(o.id)}>{o.label}</DrawerClose>)}</DrawerBody>
            </DrawerContent>
          </Drawer>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button fullWidth />}>Pay $131</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}`}
      >
        <NestedSheetsDemo />
      </Example>

      <PropsTable
        title="Drawer"
        of={PROPS.Drawer}
        rows={[
          [
            "open / defaultOpen / onOpenChange",
            "boolean / boolean / (open, details) => void",
            "false",
            "Controlled or uncontrolled open state (Base UI).",
          ],
          ["disablePointerDismissal", "boolean", "false", "Keep it open on outside presses."],
        ]}
      />
      <PropsTable
        title="DrawerContent"
        of={PROPS.DrawerContent}
        rows={[
          [
            "initialFocus / finalFocus",
            "ref | function | boolean",
            "panel / trigger",
            "Where focus goes when it opens and closes (Base UI).",
          ],
        ]}
      />
      <PropsTable
        title="Parts"
        rows={[
          [
            "DrawerTrigger / DrawerClose",
            "Base UI Trigger / Close",
            "",
            "Use render={<Button />} to style them as buttons.",
          ],
          ["DrawerHeader", "div", "", "Title and description; stays put while the body scrolls."],
          [
            "DrawerBody",
            "Base UI Drawer.Content",
            "",
            "The scrolling part. A tab stop only while it overflows; mouse text selection never drags the sheet.",
          ],
          ["DrawerFooter", "div", "", "Actions: stacked on phones, a right-aligned row from sm."],
          [
            "DrawerSwipeArea",
            "Base UI SwipeArea",
            "",
            "Invisible edge strip that opens the drawer with a swipe (touch screens).",
          ],
          [
            "createDrawerHandle()",
            "() => Handle",
            "",
            "Open a drawer from triggers elsewhere: <Drawer handle={h}> + <DrawerTrigger handle={h}>.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Enter / Space", "Open it from the trigger."],
          ["Tab / Shift + Tab", "Cycle inside; focus is trapped while it is modal."],
          ["Escape", "Close it and return focus to the trigger."],
          ["Enter / Arrow Up / Arrow Down", "On the handle, with snap points: cycle or step through the heights."],
        ]}
      />
      <A11yNotes
        items={[
          "A modal dialog (Base UI): named by DrawerTitle, described by DrawerDescription; the page behind is inert.",
          "The handle is a real button with snap points and tells screen readers the current height. A swipe is a shortcut: a button always closes it.",
          "Under reduced motion the sheet fades instead of sliding.",
        ]}
      />
    </Page>
  );
}

/** The "Alert dialog" docs page (/overlays/alert-dialog): live examples, props and notes. */
export function AlertDialogPage() {
  const [fail, setFail] = useState(false);
  return (
    <Page
      eyebrow="Overlay"
      title="Alert dialog"
      description="Asks before something that matters. It never closes on an outside press (the panel nudges instead), focuses the safe choice first, shows a spinner while the action runs and keeps the dialog open with the error if it fails."
      source="theme/src/components/alert-dialog/alert-dialog.tsx"
    >
      <ShowcaseStage<AlertDialogSceneData>
        label="Alert dialog demo"
        story={() => import("../layout/ShowcaseStage.alert-dialog")}
        initial={{ open: false, step: 0, nudge: false }}
        minHeight="21rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <AlertDialogScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Destructive confirmation"
        description="onConfirm returns a promise: the action shows a spinner, Cancel and Escape wait, and the dialog closes when it resolves. Turn on the failure to see the inline error."
        controls={<Switch label="Make the request fail" checked={fail} onCheckedChange={setFail} />}
        code={`
import { Button, ConfirmDialog, useToast } from "@sheenui/theme";

// Your API client.
declare const api: { deleteProject(id: string): Promise<void> };

export function Example() {
  const toast = useToast();

  return (
    <ConfirmDialog
      trigger={<Button variant="danger">Delete project</Button>}
      title="Delete “Aurora”?"
      description="The project, its 24 deployments and every environment variable are removed for the whole team. This can’t be undone."
      confirmLabel="Delete project"
      labels={{ pending: "Deleting…" }}
      onConfirm={async () => {
        await api.deleteProject("aurora"); // throw to keep the dialog open with the message
        toast.success("Project deleted");
      }}
    />
  );
}`}
      >
        <DeleteProjectDemo fail={fail} />
      </Example>

      <Example
        title="Type to confirm"
        description="For the irreversible: the action stays disabled until the name is typed exactly. Enter submits."
        code={`
import { Button, ConfirmDialog } from "@sheenui/theme";

// Your API client.
declare const api: { deleteRepo(name: string): Promise<void> };

export function Example() {
  return (
    <ConfirmDialog
      trigger={<Button variant="glass">Delete repository</Button>}
      title="Delete sheenui/theme?"
      description="All issues, pull requests and 1,284 stars go with it. Forks are not deleted."
      confirmationText="sheenui/theme"
      confirmLabel="Delete this repository"
      onConfirm={() => api.deleteRepo("sheenui/theme")}
    />
  );
}`}
      >
        <TypeToConfirmDemo />
      </Example>

      <Example
        title="useConfirm()"
        description="Ask from any event handler and await the answer: true once the action has finished, false if dismissed. One dialog serves the whole list. After a key is revoked, focus moves to the next row's Revoke button (or to Restore once the list is empty), never to the page; pass finalFocus to choose another target."
        code={`
import { useState } from "react";
import { useConfirm } from "@sheenui/theme";

type ApiKey = { id: string; name: string; hint: string };

// Your API client.
declare const api: { revoke(id: string): Promise<void> };

export function Example() {
  const [confirm, confirmDialog] = useConfirm();
  const [keys, setKeys] = useState<ApiKey[]>([{ id: "k1", name: "CI deploy", hint: "sk_live_…a41f" }]);

  async function revoke(key: ApiKey) {
    const ok = await confirm({
      tone: "warning",
      title: \`Revoke “\${key.name}”?\`,
      description: \`Apps using \${key.hint} stop working immediately.\`,
      confirmLabel: "Revoke key",
      onConfirm: () => api.revoke(key.id),
      // Optional: focus goes to the same spot in the list by default once the row is removed.
      // finalFocus: newKeyButtonRef,
    });
    if (ok) setKeys((list) => list.filter((k) => k.id !== key.id));
  }

  return (
    <>
      {keys.map((key) => (
        <button key={key.id} type="button" onClick={() => revoke(key)}>
          Revoke {key.name}
        </button>
      ))}
      {confirmDialog}
    </>
  );
}`}
      >
        <UseConfirmDemo />
      </Example>

      <Example
        title="Composed from parts"
        description="Build your own layout from the pieces. tone sets the icon and the action's color (danger → danger button)."
        code={`
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@sheenui/theme";

const discard = () => console.log("discarded");

export function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="glass" />}>Close editor</AlertDialogTrigger>
      <AlertDialogContent tone="warning">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>You edited 3 fields in “Billing details”. Leaving now loses those edits.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction onClick={discard}>Discard changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`}
      >
        <ComposedDemo />
      </Example>

      <PropsTable title="ConfirmDialog" of={PROPS.ConfirmDialog} />
      <PropsTable
        title="Parts and hook"
        rows={[
          [
            "AlertDialog",
            "Base UI AlertDialog.Root",
            "",
            "open / defaultOpen / onOpenChange, handle for detached triggers.",
          ],
          ["AlertDialogHeader", "div", "", "Icon + title + description: centered on phones, icon on the left from sm."],
          [
            "useConfirm()",
            "[confirm(options) => Promise<boolean>, dialog]",
            "",
            "Render dialog once; await confirm() anywhere. Options are ConfirmDialog props (finalFocus / initialFocus included).",
          ],
          ["createAlertDialogHandle()", "() => Handle", "", "One dialog for many triggers (e.g. every table row)."],
        ]}
      />
      <PropsTable of={PROPS.AlertDialogAction} title="AlertDialogAction props" as="h3" />
      <PropsTable of={PROPS.AlertDialogCancel} title="AlertDialogCancel props" as="h3" />
      <PropsTable of={PROPS.AlertDialogContent} title="AlertDialogContent props" as="h3" />
      <PropsTable of={PROPS.AlertDialogIcon} title="AlertDialogIcon props" as="h3" />
      <KeyboardTable
        rows={[
          ["Enter / Space", "Open it from the trigger."],
          ["Tab / Shift + Tab", "Cycle inside; focus is trapped."],
          ["Escape", "Dismiss it (blocked while the action runs) and return focus to the trigger."],
          ["Enter", "In a type-to-confirm field, submit once the text matches."],
        ]}
      />
      <A11yNotes
        items={[
          'role="alertdialog" named by the title and described by the description; the page behind is inert.',
          "Initial focus lands on Cancel for danger and warning tones (the safe choice), on the action for info, or on the type-to-confirm field.",
          'While pending, aria-busy and a polite status announce it; errors use role="alert". The tone icon is decorative, so the title carries the meaning.',
          "If the trigger was removed (a deleted row), focus lands on the same spot in the list.",
        ]}
      />
    </Page>
  );
}

/** The "Hover card" docs page (/overlays/hover-card): live examples, props and notes. */
export function HoverCardPage() {
  const [side, setSide] = useState<(typeof sideOptions)[number]["value"]>("top");
  const [delay, setDelay] = useState<(typeof delayOptions)[number]["value"]>("500");

  return (
    <Page
      eyebrow="Overlay"
      title="Hover card"
      description="A glass preview of what is behind a link: a profile or a page. It opens on hover or keyboard focus after a short delay; on touch screens the first tap opens it and the second follows the link."
      source="theme/src/components/hover-card/hover-card.tsx"
    >
      <ShowcaseStage<HoverCardSceneData>
        label="Hover card demo"
        story={() => import("../layout/ShowcaseStage.hover-card")}
        initial={{ open: false }}
        minHeight="30rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <HoverCardScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Profile preview"
        description="Hover or Tab to a mention. ProfilePreview formats numbers and the join date for the locale."
        stageClassName="min-h-72"
        code={`
import { Badge, HoverCard, HoverCardContent, HoverCardTrigger, ProfilePreview } from "@sheenui/theme";

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="https://example.com/ada-lovelace">@ada-lovelace</HoverCardTrigger>
      <HoverCardContent>
        <ProfilePreview
          name="Ada Lovelace"
          handle="ada-lovelace"
          status="online"
          badge={<Badge tone="accent">Maintainer</Badge>}
          bio="Builds SheenUI. Likes glass, springs and contrast ratios above 4.5."
          stats={[{ label: "followers", value: 12400 }, { label: "following", value: 183 }]}
          joined="2019-03-14"
        />
      </HoverCardContent>
    </HoverCard>
  );
}`}
      >
        <p className="max-w-md text-center text-base text-pretty">
          SheenUI is built by <Mention id="jonas" />, with design reviews from <Mention id="mira" /> and accessibility
          testing by <Mention id="sam" />.
        </p>
      </Example>

      <Example
        title="Link preview"
        description="Image, site, title and description. Motion's card has an image (it fades in once loaded) and an image favicon; Base UI and Tailwind CSS have none, so a soft gradient with the site's initial keeps the card's shape. A broken image falls back to the same initial."
        stageClassName="min-h-80"
        code={`
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview } from "@sheenui/theme";

export function Example() {
  // Any image URL or data: URI works; 1.91 : 1 is the usual social-card shape.
  const springOgImage = "https://example.com/og/motion.png";
  const springIcon = "https://motion.dev/favicon.ico";

  return (
    <>
      <HoverCard>
        <HoverCardTrigger href="https://motion.dev" target="_blank" rel="noopener">Motion</HoverCardTrigger>
        <HoverCardContent padded={false}>
          <LinkPreview
            url="https://motion.dev"
            siteName="Motion"
            title="Motion – A modern animation library for JavaScript and React"
            description="Springs, gestures, layout animations and scroll effects."
            image={springOgImage}
            imageAlt="A spring curve that overshoots once, then settles on its target."
            favicon={springIcon}
          />
        </HoverCardContent>
      </HoverCard>

      {/* No image: the card shows a gradient with the site's initial. */}
      <LinkPreview url="https://tailwindcss.com" siteName="Tailwind CSS" title="Tailwind CSS" description="A utility-first CSS framework." />
    </>
  );
}`}
      >
        <p className="max-w-md text-center text-base text-pretty">
          Overlays are built on <SiteLink id="baseui">Base UI</SiteLink>, animated with{" "}
          <SiteLink id="motion">Motion</SiteLink> and styled with <SiteLink id="tailwind">Tailwind CSS</SiteLink>.
        </p>
      </Example>

      <Example
        title="One card, many triggers"
        description="A handle links one HoverCard to triggers anywhere; each passes its own payload. Moving between avatars swaps the content without closing."
        stageClassName="min-h-80"
        code={`
import {
  Avatar,
  createHoverCardHandle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ProfilePreview,
} from "@sheenui/theme";

type Person = { name: string; handle: string; href: string; bio: string };

const team: Person[] = [
  { name: "Asha Verma", handle: "@asha", href: "https://example.com/asha", bio: "Design systems." },
  { name: "Ravi Kumar", handle: "@ravi", href: "https://example.com/ravi", bio: "Frontend platform." },
  { name: "Meera Iyer", handle: "@meera", href: "https://example.com/meera", bio: "Accessibility." },
];

export function Example() {
  const teamCard = createHoverCardHandle<Person>();

  return (
    <>
      <div className="flex -space-x-2.5 any-pointer-coarse:space-x-1">
        {team.map((person) => (
          <HoverCardTrigger key={person.handle} handle={teamCard} payload={person} href={person.href} target="_blank" rel="noopener" variant="plain">
            <Avatar name={person.name} />
          </HoverCardTrigger>
        ))}
      </div>

      <HoverCard handle={teamCard}>
        {({ payload }) => payload && (
          <HoverCardContent>
            <ProfilePreview {...payload} />
          </HoverCardContent>
        )}
      </HoverCard>
    </>
  );
}`}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Overlapping with a mouse; spaced on touch screens so every avatar keeps a 44px tap target. */}
          <div className="flex -space-x-2.5 any-pointer-coarse:space-x-1">
            {team.map((person) => (
              <HoverCardTrigger
                key={person.handle}
                handle={teamCard}
                payload={person}
                href={person.href}
                target="_blank"
                rel="noopener"
                variant="plain"
                // WCAG 2.5.3: the accessible name must contain the visible text (the initials the Avatar draws).
                aria-label={`${person.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("")}, ${person.name}`}
                className="rounded-full ring-2 ring-[var(--sheen-bg)] transition-[translate] duration-(--sheen-duration-snappy) ease-sheen-snappy motion-ok:hover:-translate-y-1 motion-ok:data-popup-open:-translate-y-1"
              >
                <Avatar name={person.name} status={person.status} />
              </HoverCardTrigger>
            ))}
          </div>
          <p className="text-sm text-sheen-fg-muted">4 people on this project</p>
          <HoverCard handle={teamCard}>
            {({ payload }) =>
              payload ? (
                <HoverCardContent side="bottom">
                  <ProfilePreview {...payload} />
                </HoverCardContent>
              ) : null
            }
          </HoverCard>
        </div>
      </Example>

      <Example
        title="Placement and delay"
        description="side flips to the other side when there is no room. delay is how long the pointer must rest on the link; closeDelay gives it time to reach the card."
        stageClassName="min-h-96"
        controls={
          <>
            <Segmented size="sm" label="Side" options={sideOptions} value={side} onValueChange={setSide} />
            <Segmented size="sm" label="Open delay" options={delayOptions} value={delay} onValueChange={setDelay} />
          </>
        }
        code={hoverCardCode(delay, side)}
      >
        <HoverCard>
          <HoverCardTrigger href={links.baseui.url} target="_blank" rel="noopener" delay={Number(delay)}>
            Base UI Preview Card
          </HoverCardTrigger>
          <HoverCardContent side={side} padded={false}>
            <LinkPreview {...links.baseui} />
          </HoverCardContent>
        </HoverCard>
      </Example>

      <PropsTable
        title="HoverCard"
        rows={[
          [
            "open / defaultOpen / onOpenChange",
            "boolean / boolean / (open, details) => void",
            "false",
            "Controlled or uncontrolled (Base UI Preview Card).",
          ],
          ["handle", "Handle<Payload>", "", "From createHoverCardHandle(): share one card between detached triggers."],
          [
            "children",
            "ReactNode | ({ payload }) => ReactNode",
            "",
            "The content; a function receives the active trigger's payload.",
          ],
          [
            "...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example onOpenChangeComplete, actionsRef, triggerId, defaultTriggerId).",
          ],
        ]}
      />
      <PropsTable
        title="HoverCardTrigger / HoverCardContent"
        of={[PROPS.HoverCardTrigger, PROPS.HoverCardContent]}
        rows={[
          ["Trigger href", "string", "", "It renders an <a>: the link stays the one accessible element."],
          ["Trigger payload / handle", "Payload / Handle", "", "For triggers outside <HoverCard>."],
        ]}
      />
      <PropsTable
        title="Content presets"
        rows={[
          [
            "ProfilePreview",
            "{ name, handle?, avatarSrc?, status?, badge?, bio?, stats?, joined?, joinedLabel?, locale?, cover? }",
            "",
            'Profile layout. stats values are shortened (12 400 → 12.4K); joined is formatted with Intl (a date-only string like "2021-08-01" is read as a local date).',
          ],
          [
            "LinkPreview",
            "{ url, title, description?, image?, imageAlt?, siteName?, favicon? }",
            "",
            "Link card. Use with padded={false} on the content. The image fades in once loaded (again when image changes); without an image, or if it fails, the site's initial is shown.",
          ],
        ]}
      />
      <PropsTable of={PROPS.LinkPreview} title="LinkPreview props" as="h3" />
      <PropsTable of={PROPS.ProfilePreview} title="ProfilePreview props" as="h3" />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Focusing the link opens the card after the delay."],
          ["Enter", "Follow the link."],
          ["Escape", "Close the card."],
        ]}
      />
      <A11yNotes
        items={[
          "A hover card is an extra for links: it is not announced, so the link text must make sense alone and the card must not hold the only copy of anything.",
          "On touch screens the first tap opens the card and a second tap follows the link.",
          "Content inside is not reachable by Tab; use a Popover for interactive content.",
        ]}
      />
    </Page>
  );
}
