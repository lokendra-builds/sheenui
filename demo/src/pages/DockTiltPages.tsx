import { type ReactNode, useState } from "react";
import { Badge, useToast } from "@sheenui/theme";
import { Dock, DockItem, DockSeparator } from "@sheenui/theme";
import { TiltCard, TiltCardLayer } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { lazyBlock } from "../layout/lazy-block";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { Icon } from "./TextEffectsPages/shared";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { DockScene as DockSceneData } from "../layout/ShowcaseStage.dock";
import { DockScene } from "../layout/ShowcaseStage.dock.scene";
import type { TiltCardScene as TiltCardSceneData } from "../layout/ShowcaseStage.tilt-card";
import { TiltCardScene } from "../layout/ShowcaseStage.tilt-card.scene";
import type { MorphingDialogScene as MorphingDialogSceneData } from "../layout/ShowcaseStage.morphing-dialog";

/* =====================================================================
 * Dock
 * ===================================================================== */

type App = { label: string; icon: ReactNode; tile: string; active?: boolean; badge?: number; badgeLabel?: string };

const apps: App[] = [
  {
    label: "Finder",
    icon: <FaceIcon />,
    tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-1))]",
    active: true,
  },
  {
    label: "Mail",
    icon: <MailIcon />,
    tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-3))]",
    badge: 3,
    badgeLabel: "3 unread",
  },
  {
    label: "Calendar",
    icon: <CalendarIcon />,
    tile: "[background:linear-gradient(160deg,var(--sheen-chart-8),var(--sheen-chart-2))]",
  },
  {
    label: "Music",
    icon: <MusicIcon />,
    tile: "[background:linear-gradient(160deg,var(--sheen-chart-5),var(--sheen-chart-8))]",
    active: true,
  },
  {
    label: "Photos",
    icon: <FlowerIcon />,
    tile: "[background:linear-gradient(160deg,var(--sheen-chart-4),var(--sheen-chart-2))]",
  },
  {
    label: "Messages",
    icon: <ChatIcon />,
    tile: "[background:linear-gradient(160deg,var(--sheen-chart-3),var(--sheen-chart-6))]",
  },
  {
    label: "Settings",
    icon: <GearIcon />,
    tile: "[background:linear-gradient(160deg,var(--sheen-ink-500),var(--sheen-ink-700))]",
  },
];

const dockCode = `
import type { ReactNode } from "react";
import { Dock, DockItem, DockSeparator, useToast } from "@sheenui/theme";
import {
  Calendar as CalendarIcon,
  MessageCircle as ChatIcon,
  Download as DownloadIcon,
  Smile as FaceIcon,
  Flower as FlowerIcon,
  Mail as MailIcon,
  Music as MusicIcon,
  Settings as GearIcon,
  Trash2 as TrashIcon,
} from "lucide-react";

type App = { label: string; icon: ReactNode; tile: string; active?: boolean; badge?: number; badgeLabel?: string };

const apps: App[] = [
  { label: "Finder", icon: <FaceIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-1))]", active: true },
  { label: "Mail", icon: <MailIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-3))]", badge: 3, badgeLabel: "3 unread" },
  { label: "Calendar", icon: <CalendarIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-8),var(--sheen-chart-2))]" },
  { label: "Music", icon: <MusicIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-5),var(--sheen-chart-8))]", active: true },
  { label: "Photos", icon: <FlowerIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-4),var(--sheen-chart-2))]" },
  { label: "Messages", icon: <ChatIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-3),var(--sheen-chart-6))]" },
  { label: "Settings", icon: <GearIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-ink-500),var(--sheen-ink-700))]" },
];

export function Example() {
  const toast = useToast();

  return (
    <Dock label="Apps" labels={{ active: "open" }}>
      {apps.map((app) => (
        <DockItem
          key={app.label}
          label={app.label}
          icon={app.icon}
          active={app.active}
          badge={app.badge}
          badgeLabel={app.badgeLabel}
          bounce
          onClick={() => toast.info(\`Opening \${app.label}\`)}
          tileClassName={\`\${app.tile} text-sheen-accent-fg\`}
        />
      ))}
      <DockSeparator />
      <DockItem label="Downloads" icon={<DownloadIcon />} onClick={() => toast.info("Opening Downloads")} />
      <DockItem label="Trash" icon={<TrashIcon />} onClick={() => toast.info("Trash is empty")} />
    </Dock>
  );
}`;

const notchItems = [
  { label: "Home", icon: <HomeIcon /> },
  { label: "Search", icon: <SearchIcon /> },
  { label: "Library", icon: <FolderIcon /> },
  { label: "Profile", icon: <UserIcon /> },
];

/** The live dock for the "Notch" example: the active item follows clicks. */
function NotchDockDemo() {
  const [active, setActive] = useState("Home");
  return (
    <Dock label="Sections" notch>
      {notchItems.map((item) => (
        <DockItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          active={active === item.label}
          onClick={() => setActive(item.label)}
        />
      ))}
    </Dock>
  );
}

/** The "Dock" docs page (/effects/macos-dock): live examples, props and notes. */
export function DockPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Effect"
      title="Dock"
      description="A macOS-style launcher: icons near the pointer swell and push their neighbors apart, with labels riding on top. Transform-only, one frame callback, no React renders while the pointer moves. On touch screens and with reduced motion it is a plain bar."
      source="theme/src/components/dock/dock.tsx"
    >
      <ShowcaseStage<DockSceneData>
        label="Dock demo"
        story={() => import("../layout/ShowcaseStage.dock")}
        initial={{ at: null, opened: false }}
        minHeight="17rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,26rem)]!"
      >
        {(scene, ctx) => <DockScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="App dock"
        description="Move the pointer along it. Click an app to see it bounce. Keyboard: Tab into it, then arrow keys, Home and End; the focused app swells too, and Escape hides its label. Open apps (the dot) say so to screen readers: “Finder, open”. In a narrow window it turns into a plain bar that scrolls inside itself, with the label drawn above the bar."
        frame="Desktop"
        stageClassName="min-h-80 items-end justify-center pt-28 pb-5 [background:radial-gradient(120%_90%_at_20%_0%,var(--sheen-blob-1),transparent_60%),radial-gradient(90%_80%_at_90%_100%,var(--sheen-blob-2),transparent_60%)]"
        code={dockCode}
      >
        <Dock label="Apps" labels={{ active: "open" }}>
          {apps.map((app) => (
            <DockItem
              key={app.label}
              label={app.label}
              icon={app.icon}
              active={app.active}
              badge={app.badge}
              badgeLabel={app.badgeLabel}
              bounce
              onClick={() => toast.info(`Opening ${app.label}`)}
              tileClassName={`${app.tile} text-sheen-accent-fg`}
            />
          ))}
          <DockSeparator />
          <DockItem label="Downloads" icon={<DownloadIcon />} onClick={() => toast.info("Opening Downloads")} />
          <DockItem label="Trash" icon={<TrashIcon />} onClick={() => toast.info("Trash is empty")} />
        </Dock>
      </Example>

      <Example
        title="Navigation links, at the top"
        description={
          'Items with href are links (aria-current marks the active one). side="top" grows the icons downward with labels underneath. Smaller icons, a gentler swell.'
        }
        stageClassName="items-start pt-8 pb-28"
        code={`
import { Dock, DockItem } from "@sheenui/theme";
import { Folder as FolderIcon, House as HomeIcon, Search as SearchIcon, User as UserIcon } from "lucide-react";

export function Example() {
  return (
    <Dock label="Sections" side="top" size="sm" magnification={1.45}>
      <DockItem label="Home" icon={<HomeIcon />} href="#home" active />
      <DockItem label="Search" icon={<SearchIcon />} href="#search" />
      <DockItem label="Library" icon={<FolderIcon />} href="#library" />
      <DockItem label="Profile" icon={<UserIcon />} href="#profile" />
    </Dock>
  );
}`}
      >
        <Dock label="Sections" side="top" size="sm" magnification={1.45}>
          <DockItem label="Home" icon={<HomeIcon />} href="#home" active />
          <DockItem label="Search" icon={<SearchIcon />} href="#search" />
          <DockItem label="Library" icon={<FolderIcon />} href="#library" />
          <DockItem label="Profile" icon={<UserIcon />} href="#profile" />
        </Dock>
      </Example>

      <Example
        title="Notch"
        description={
          "With notch, the active item lifts out of a round notch cut into the glass bar and glides to the next active item. Click an icon to move it. Needs an active item."
        }
        stageClassName="items-start pt-12 pb-16"
        code={`
import { useState } from "react";
import { Dock, DockItem } from "@sheenui/theme";
import { Folder as FolderIcon, House as HomeIcon, Search as SearchIcon, User as UserIcon } from "lucide-react";

export function Example() {
  const [active, setActive] = useState("Home");
  const items = [
    { label: "Home", icon: <HomeIcon /> },
    { label: "Search", icon: <SearchIcon /> },
    { label: "Library", icon: <FolderIcon /> },
    { label: "Profile", icon: <UserIcon /> },
  ];

  return (
    <Dock label="Sections" notch>
      {items.map((item) => (
        <DockItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          active={active === item.label}
          onClick={() => setActive(item.label)}
        />
      ))}
    </Dock>
  );
}`}
      >
        <NotchDockDemo />
      </Example>

      <PropsTable title="Dock props" of={PROPS.Dock} />
      <PropsTable title="DockItem props" of={PROPS.DockItem} />
      <PropsTable title="DockSeparator props" of={PROPS.DockSeparator} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Enter or leave the dock once (one tab stop)."],
          ["Arrow Left / Arrow Right", "Move between items; the focused item is magnified with its label above."],
          ["Home / End", "Jump to the first or last item."],
          ["Enter / Space", "Press the focused item."],
          ["Escape", "Hide the labels (WCAG 1.4.13); moving the pointer brings them back."],
        ]}
      />
      <A11yNotes
        items={[
          "A Base UI toolbar: roving focus, with aria-label on the dock and a name on each item (the label is also its accessible name).",
          "Magnification is decorative.",
          "Under reduced motion items do not scale; the label still shows on focus.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Tilt card
 * ===================================================================== */

const plans = [
  { name: "Starter", price: "$0", note: "For side projects", href: "#starter" },
  { name: "Pro", price: "$24", note: "For growing teams", href: "#pro", tint: true },
  { name: "Scale", price: "$79", note: "For serious traffic", href: "#scale" },
];

/** The "Tilt card" docs page (/effects/3d-tilt-card): live examples, props and notes. */
export function TiltCardPage() {
  return (
    <Page
      eyebrow="Effect"
      title="Tilt card"
      description="A glass card that leans toward the pointer in 3D, at most 8°, with a glare sliding across its surface, all on springs. The glass element itself tilts, so its blur keeps working. Touch and reduced motion get a still card."
      source="theme/src/components/tilt-card/tilt-card.tsx"
    >
      <ShowcaseStage<TiltCardSceneData>
        label="Tilt card demo"
        story={() => import("../layout/ShowcaseStage.tilt-card")}
        initial={{ at: null }}
        minHeight="20rem"
      >
        {(scene, ctx) => <TiltCardScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Membership card"
        description="TiltCardLayer adds parallax: layers drift toward the pointer by their depth, so the card reads as layered without preserve-3d (which glass cannot use). A glare and a diagonal streak of light slide across the glass, and its edge catches the light nearest the pointer. Rest the pointer near a corner: the card holds still."
        stageClassName="min-h-96"
        code={`
import { Badge, TiltCard, TiltCardLayer } from "@sheenui/theme";
import { Sparkles as SparkIcon } from "lucide-react";

export function Example() {
  return (
    <TiltCard tint className="flex aspect-[1.586] w-full max-w-sm flex-col p-5 sm:p-6">
      {/* Lights behind the content that drift the other way (negative depth). */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
        <TiltCardLayer
          depth={-14}
          className="absolute -top-1/3 -end-1/4 aspect-square w-3/4 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-accent)_30%,transparent),transparent)]"
        />
        <TiltCardLayer
          depth={-8}
          className="absolute -end-[15%] -bottom-1/2 aspect-square w-1/2 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-teal-500)_22%,transparent),transparent)]"
        />
      </span>
      <TiltCardLayer depth={6} className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="sheen-fill grid size-8 place-items-center rounded-sheen-sm text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]">
            <SparkIcon /> {/* any 16px svg icon */}
          </span>
          Sheen Pay
        </span>
        <Badge tone="accent">Pro</Badge>
      </TiltCardLayer>
      {/* The chip */}
      <TiltCardLayer depth={10} className="mt-3 sm:mt-5">
        <span aria-hidden className="block h-8 w-11 rounded-md border border-sheen-border [background:linear-gradient(135deg,var(--sheen-chart-4),var(--sheen-chart-2))] opacity-80" />
      </TiltCardLayer>
      <TiltCardLayer depth={16} className="mt-auto flex flex-col gap-1">
        <p className="font-sheen-mono text-base tracking-wider sm:text-lg">
          <span className="sr-only">Card ending in 0815</span>
          <span aria-hidden>4921 ···· ···· 0815</span>
        </p>
        <p className="text-sm text-sheen-fg-muted">Ada Lovelace · 09/29</p>
      </TiltCardLayer>
    </TiltCard>
  );
}`}
      >
        <TiltCard tint className="flex aspect-[1.586] w-full max-w-sm flex-col p-5 sm:p-6">
          {/* Lights behind the content that drift the other way (negative depth). */}
          <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
            <TiltCardLayer
              depth={-14}
              className="absolute -top-1/3 -end-1/4 aspect-square w-3/4 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-accent)_30%,transparent),transparent)]"
            />
            <TiltCardLayer
              depth={-8}
              className="absolute -end-[15%] -bottom-1/2 aspect-square w-1/2 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-teal-500)_22%,transparent),transparent)]"
            />
          </span>
          <TiltCardLayer depth={6} className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-2 font-semibold">
              <span
                aria-hidden
                className="sheen-fill grid size-8 place-items-center rounded-sheen-sm text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]"
              >
                <SparkIcon />
              </span>
              Sheen Pay
            </span>
            <Badge tone="accent">Pro</Badge>
          </TiltCardLayer>
          <TiltCardLayer depth={10} className="mt-3 sm:mt-5">
            <span
              aria-hidden
              className="block h-8 w-11 rounded-md border border-sheen-border [background:linear-gradient(135deg,var(--sheen-chart-4),var(--sheen-chart-2))] opacity-80"
            />
          </TiltCardLayer>
          <TiltCardLayer depth={16} className="mt-auto flex flex-col gap-1">
            <p className="font-sheen-mono text-base tracking-wider sm:text-lg">
              <span className="sr-only">Card ending in 0815</span>
              <span aria-hidden>4921 ···· ···· 0815</span>
            </p>
            <p className="text-sm text-sheen-fg-muted">Ada Lovelace · 09/29</p>
          </TiltCardLayer>
        </TiltCard>
      </Example>

      <Example
        title="Pricing cards"
        description="A gentler tilt (maxTilt={5}) on cards that are links. The whole card is clickable through a stretched link, and keyboard focus shows a solid ring."
        code={`
import { Badge, TiltCard } from "@sheenui/theme";

export function Example() {
  const plans = [
    { name: "Starter", price: "$0", note: "For side projects", href: "#starter" },
    { name: "Pro", price: "$24", note: "For growing teams", href: "#pro", tint: true },
    { name: "Scale", price: "$79", note: "For serious traffic", href: "#scale" },
  ];

  return (
    <ul className="grid w-full gap-4 sm:grid-cols-3">
      {plans.map((plan) => (
        <li key={plan.name}>
          <TiltCard
            maxTilt={5}
            tint={plan.tint}
            className="relative flex flex-col gap-2 p-6 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sheen-focus"
          >
            <h3 className="flex items-center justify-between gap-2 font-semibold">
              {/* A stretched link: the whole card is clickable. */}
              <a href={plan.href} className="outline-none after:absolute after:inset-0 after:rounded-[inherit]">
                {plan.name}
              </a>
              {plan.tint && <Badge tone="accent">Popular</Badge>}
            </h3>
            <p className="text-3xl font-semibold tracking-tight">
              {plan.price}
              <span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
            </p>
            <p className="text-sm text-sheen-fg-muted">{plan.note}</p>
          </TiltCard>
        </li>
      ))}
    </ul>
  );
}`}
      >
        <ul className="grid w-full gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <li key={plan.name}>
              <TiltCard
                maxTilt={5}
                tint={plan.tint}
                className="relative flex flex-col gap-2 p-6 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sheen-focus"
              >
                <h3 className="flex items-center justify-between gap-2 font-semibold">
                  <a href={plan.href} className="outline-none after:absolute after:inset-0 after:rounded-[inherit]">
                    {plan.name}
                  </a>
                  {plan.tint && <Badge tone="accent">Popular</Badge>}
                </h3>
                <p className="text-3xl font-semibold tracking-tight">
                  {plan.price}
                  <span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
                </p>
                <p className="text-sm text-sheen-fg-muted">{plan.note}</p>
              </TiltCard>
            </li>
          ))}
        </ul>
      </Example>

      <PropsTable title="TiltCard props" of={PROPS.TiltCard} />
      <PropsTable title="TiltCardLayer props" of={PROPS.TiltCardLayer} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Not focusable: a plain card is not focusable. Interactive children keep their own tab stops, and the tilt never moves them out of reach.",
          ],
        ]}
      />
      <A11yNotes
        items={[
          "A plain div that does not change reading order. The tilt is transform-only and reads the pointer, not focus.",
          "It is off for touch (a finger on a card is scrolling) and under reduced motion; TiltCardLayer adds decorative depth.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Morphing dialog
 * ===================================================================== */

const morphCode = `
import {
  Button,
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogMedia,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  useToast,
} from "@sheenui/theme";

const place = {
  name: "Lisbon",
  region: "Portugal",
  gradient: "from-amber-300 to-rose-500",
  body: "Seven hills, trams and pastel de nata.",
  facts: [
    ["Best month", "May"],
    ["Flight from Delhi", "12 h"],
  ],
};

export function Example() {
  const toast = useToast();
  // One card per place, in a <ul className="grid gap-4 sm:grid-cols-3">.

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="w-full p-2 pb-4">
        <MorphingDialogMedia className="aspect-[4/3]">
          <div aria-hidden className={\`size-full bg-gradient-to-br \${place.gradient}\`} />
        </MorphingDialogMedia>
        <MorphingDialogTitle className="px-2 pt-2">{place.name}</MorphingDialogTitle>
        <MorphingDialogSubtitle className="px-2">{place.region}</MorphingDialogSubtitle>
      </MorphingDialogTrigger>

      <MorphingDialogContent className="p-3 pb-6">
        <MorphingDialogMedia className="aspect-[4/3]">
          <div aria-hidden className={\`size-full bg-gradient-to-br \${place.gradient}\`} />
        </MorphingDialogMedia>
        <div className="px-3 pt-4">
          <MorphingDialogTitle>{place.name}</MorphingDialogTitle>
          <MorphingDialogSubtitle>{place.region}</MorphingDialogSubtitle>
        </div>
        <MorphingDialogDescription className="flex flex-col gap-4 px-3 pt-3">
          <p>{place.body}</p>
          <dl className="grid grid-cols-2 gap-3">
            {place.facts.map(([term, value]) => (
              <div key={term} className="rounded-sheen-md bg-sheen-hover px-3 py-2">
                <dt className="text-xs text-sheen-fg-muted">{term}</dt>
                <dd className="font-medium text-sheen-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </MorphingDialogDescription>
        {/* Controls go here, not in the description: each one fades itself in. */}
        <MorphingDialogActions className="px-3 pt-4">
          <Button onClick={() => toast.success(\`\${place.name} saved to your trips\`)}>Plan a trip</Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}`;

/** The "Morphing dialog" docs page (/effects/morphing-dialog): live examples, props and notes. */
export function MorphingDialogPage() {
  return (
    <Page
      eyebrow="Effect"
      title="Morphing dialog"
      description="A card that grows into a dialog: its surface, picture, title and subtitle fly to their places (shared layout), then the rest rises in. It is Base UI's Dialog underneath, so focus is trapped, Escape and outside clicks close it, and focus returns to the card. Reduced motion swaps the flight for a fade."
      source="theme/src/components/morphing-dialog/morphing-dialog.tsx"
    >
      <ShowcaseStage<MorphingDialogSceneData>
        label="Morphing dialog demo"
        story={() => import("../layout/ShowcaseStage.morphing-dialog")}
        initial={{ open: false, nudge: false }}
        minHeight="21rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <MorphingDialogSceneLazy scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Gallery"
        description="Open a card, then close it with Escape, the × button or a click outside: everything flies back. Keep the media's aspect ratio the same in card and dialog."
        variant="bare"
        code={morphCode}
      >
        <MorphingGallery />
      </Example>

      <Example
        title="Compact card"
        description="No picture: just the surface and the text morph. The dialog takes any content, and its glass level and radius are props. Buttons go in MorphingDialogActions, where each one (glass included) fades itself in."
        code={`
import {
  Avatar,
  Button,
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  useToast,
} from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex-row items-center gap-3 p-3 pe-5">
        <Avatar name="Grace Hopper" />
        <span className="flex flex-col">
          <MorphingDialogTitle>Grace Hopper</MorphingDialogTitle>
          <MorphingDialogSubtitle>Rear admiral · Compilers</MorphingDialogSubtitle>
        </span>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="max-w-md gap-1 p-6 pe-14">
        <MorphingDialogTitle>Grace Hopper</MorphingDialogTitle>
        <MorphingDialogSubtitle>Rear admiral · Compilers</MorphingDialogSubtitle>
        <MorphingDialogDescription className="mt-3">
          Wrote the first compiler and helped design COBOL, so programs could be written in words
          instead of machine code. She kept a moth taped in her logbook: the first actual bug.
        </MorphingDialogDescription>
        <MorphingDialogActions className="mt-4">
          <Button size="sm" onClick={() => toast.success("Following Grace Hopper")}>Follow</Button>
          <Button size="sm" variant="glass" onClick={() => toast.info("Message drafted")}>Message</Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}`}
      >
        <MorphingCompact />
      </Example>

      <PropsTable title="MorphingDialog props" of={PROPS.MorphingDialog} />
      <PropsTable title="MorphingDialogTrigger props" of={PROPS.MorphingDialogTrigger} />
      <PropsTable title="MorphingDialogContent props" of={PROPS.MorphingDialogContent} />
      <PropsTable
        title="Parts"
        rows={[
          [
            "MorphingDialogMedia",
            "radius?: number",
            "--sheen-radius-md",
            "The picture that flies between card and dialog. Same aspect ratio in both.",
          ],
          [
            "MorphingDialogTitle",
            "children",
            "",
            "Moves between card and dialog; in the dialog it is the h2 that names it.",
          ],
          ["MorphingDialogSubtitle", "children", "", "A line under the title that moves too."],
          [
            "MorphingDialogDescription",
            "children",
            "",
            "Dialog-only text that rises in after the flight; describes the dialog. Keep controls out of it.",
          ],
          [
            "MorphingDialogActions",
            "children, className",
            "",
            "The dialog's buttons: the row rises in and each control fades itself, so glass buttons keep their blur.",
          ],
          [
            "MorphingDialogClose",
            "labels?: Partial<MorphingDialogLabels>",
            '{ close: "Close" }',
            "The × button, if you place it yourself (showClose={false}); labels.close is its accessible name.",
          ],
        ]}
      />
      <PropsTable of={PROPS.MorphingDialogActions} title="MorphingDialogActions props" as="h3" />
      <PropsTable of={PROPS.MorphingDialogClose} title="MorphingDialogClose props" as="h3" />
      <PropsTable of={PROPS.MorphingDialogDescription} title="MorphingDialogDescription props" as="h3" />
      <PropsTable of={PROPS.MorphingDialogMedia} title="MorphingDialogMedia props" as="h3" />
      <PropsTable of={PROPS.MorphingDialogSubtitle} title="MorphingDialogSubtitle props" as="h3" />
      <PropsTable of={PROPS.MorphingDialogTitle} title="MorphingDialogTitle props" as="h3" />
      <KeyboardTable
        rows={[
          ["Enter / Space", "Open the dialog from the card."],
          ["Tab / Shift + Tab", "Cycle inside; focus is trapped."],
          ["Escape", "Close it; focus returns to the card."],
        ]}
      />
      <A11yNotes
        items={[
          'The card is a native button with aria-haspopup="dialog"; the dialog is role="dialog", labeled by MorphingDialogTitle and described by MorphingDialogDescription. Always render a title.',
          "Controls go in MorphingDialogActions, which fades each one in after the flight.",
          "Under reduced motion the flight is removed and the dialog only fades; describe informative media with alt.",
        ]}
      />
    </Page>
  );
}

const MorphingDialogSceneLazy = lazyBlock(
  () => import("../layout/ShowcaseStage.morphing-dialog.scene").then((m) => m.MorphingDialogScene),
  { eager: true, minHeight: "9rem" },
);

const MorphingGallery = lazyBlock(() => import("./MorphingGalleryDemo").then((m) => m.MorphingGalleryDemo), {
  eager: true,
  minHeight: "22rem",
});

const MorphingCompact = lazyBlock(() => import("./MorphingCompactDemo").then((m) => m.MorphingCompactDemo), {
  minHeight: "4.25rem",
});

function SparkIcon() {
  return (
    <Icon className="size-4">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </Icon>
  );
}

function FaceIcon() {
  return (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 3c-1.5 3-2 6-1 9h2c0 3 0 6-1 9" />
      <path d="M7 8v1.5M17 8v1.5M8 15.5c2.5 1.5 5.5 1.5 8 0" />
    </Icon>
  );
}

function MailIcon() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  );
}

function CalendarIcon() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Icon>
  );
}

function MusicIcon() {
  return (
    <Icon>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </Icon>
  );
}

function FlowerIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 9.5V4M12 20v-5.5M9.5 12H4M20 12h-5.5M10.2 10.2 6.3 6.3M17.7 17.7l-3.9-3.9M13.8 10.2l3.9-3.9M6.3 17.7l3.9-3.9" />
    </Icon>
  );
}

function ChatIcon() {
  return (
    <Icon>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </Icon>
  );
}

function GearIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Icon>
  );
}

function DownloadIcon() {
  return (
    <Icon>
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </Icon>
  );
}

function TrashIcon() {
  return (
    <Icon>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </Icon>
  );
}

function HomeIcon() {
  return (
    <Icon>
      <path d="m3 11 9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </Icon>
  );
}

function SearchIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

function FolderIcon() {
  return (
    <Icon>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </Icon>
  );
}

function UserIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  );
}
