import { ScrollPre } from "../layout/ScrollPre";
import { useState, type ReactNode } from "react";
import {
  AspectRatio,
  Avatar,
  Badge,
  Button,
  Input,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Progress,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  Spinner,
  useMediaQuery,
} from "@sheenui/theme";

import { BASE_PATH } from "../seo/site";

/** A 16px stroke icon from one path, for the demos' nav items and tiles. */
function Ico({ d, className = "size-4" }: { d: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  home: "M4 11l8-7 8 7v9H4z",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  users: "M16 11a4 4 0 1 0-8 0M4 20c0-4 4-6 8-6s8 2 8 6",
  card: "M3 7h18v10H3zM3 11h18",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  chev: "M15 6l-6 6 6 6",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6z",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14",
  book: "M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4zM5 16V4",
  play: "M8 5v14l11-7z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
} as const;

/* ============================================================ Resizable */

const kw = "text-sheen-accent";
const str = "text-sheen-success-text";
const dim = "text-sheen-fg-subtle";

/** A code editor, a live preview and a console in nested resizable panels. */
export function ResizableWorkbench() {
  const lines: ReactNode[] = [
    <>
      <span className={kw}>import</span> {"{ Button, Progress }"} <span className={kw}>from</span>{" "}
      <span className={str}>"@sheenui/theme"</span>;
    </>,
    "",
    <>
      <span className={kw}>export function</span> Deploy() {"{"}
    </>,
    <>
      {"  "}
      <span className={kw}>return</span> (
    </>,
    <>
      {"    "}&lt;Button variant=<span className={str}>"glass"</span>&gt;Deploy&lt;/Button&gt;
    </>,
    <>
      {"    "}&lt;Progress value={"{"}72{"}"} label=<span className={str}>"Build"</span> /&gt;
    </>,
    "  );",
    "}",
  ];
  const files = [
    { name: "App.tsx", active: true },
    { name: "Deploy.tsx", active: false },
    { name: "theme.css", active: false },
    { name: "package.json", active: false },
  ];
  return (
    <ResizablePanelGroup className="glass-1 h-[22rem] w-full rounded-sheen-xl font-sheen-mono text-xs">
      <ResizablePanel defaultSize={22} minSize={14} className="font-sans">
        <p className="px-3 pt-3 pb-2 text-2xs font-semibold tracking-wide text-sheen-fg-muted uppercase">Explorer</p>
        <ul className="m-0 flex list-none flex-col gap-0.5 p-1.5">
          {files.map((f) => (
            <li
              key={f.name}
              className={
                f.active
                  ? "flex items-center gap-2 rounded-sheen-sm bg-sheen-hover px-2 py-1.5 text-sheen-fg"
                  : "flex items-center gap-2 rounded-sheen-sm px-2 py-1.5 text-sheen-fg-muted"
              }
            >
              <Ico d={ICONS.code} className="size-3.5 shrink-0" />
              <span className="truncate">{f.name}</span>
            </li>
          ))}
        </ul>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={62} minSize={25}>
            <div className="flex items-center gap-2 border-b border-sheen-border px-3 py-1.5 font-sans text-sheen-fg-muted">
              <Ico d={ICONS.code} className="size-3.5" /> App.tsx
            </div>
            <ScrollPre label="App.tsx source" className="m-0 w-full min-w-0 overflow-auto p-3 leading-5 text-sheen-fg">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className={`w-4 shrink-0 text-end select-none ${dim}`}>{i + 1}</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </ScrollPre>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={15}>
            <div className="flex items-center gap-2 border-b border-sheen-border px-3 py-1.5 font-sans text-sheen-fg-muted">
              <Ico d={ICONS.bolt} className="size-3.5" /> Console
            </div>
            <ul className="m-0 flex list-none flex-col gap-1 p-3 leading-5">
              <li className="text-sheen-success-text">✓ compiled in 142 ms</li>
              <li className="text-sheen-fg-muted">ready on http://localhost:5173</li>
              <li className="text-sheen-warning-text">⚠ Deploy.tsx: unused import Progress</li>
            </ul>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel minSize={18} className="font-sans">
        <p className="px-3 pt-3 pb-2 text-2xs font-semibold tracking-wide text-sheen-fg-muted uppercase">Preview</p>
        <div className="m-3 flex flex-col gap-4 rounded-sheen-lg bg-sheen-hover p-4">
          <Progress value={72} label="Build" />
          <Button variant="glass" size="sm" className="self-start">
            Deploy
          </Button>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export const resizableWorkbenchCode = `
import { Button, Progress, ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";

export function Example() {
  return (
    <ResizablePanelGroup className="glass-1 h-[22rem] w-full rounded-sheen-xl text-xs">
      <ResizablePanel defaultSize={22} minSize={14}>
        <p className="p-3 font-semibold">Explorer</p>
        <ul className="m-0 list-none p-1.5">
          <li className="rounded-sheen-sm bg-sheen-hover px-2 py-1.5">App.tsx</li>
          <li className="px-2 py-1.5">Deploy.tsx</li>
          <li className="px-2 py-1.5">theme.css</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={62} minSize={25}>
            <pre className="m-0 p-3 leading-5">{"export function Deploy() {\\n  return <Button>Deploy</Button>;\\n}"}</pre>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={15}>
            <ul className="m-0 list-none p-3 leading-5">
              <li>✓ compiled in 142 ms</li>
              <li>ready on http://localhost:5173</li>
            </ul>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel minSize={18}>
        <div className="m-3 flex flex-col gap-4 rounded-sheen-lg bg-sheen-hover p-4">
          <Progress value={72} label="Build" />
          <Button variant="glass" size="sm" className="self-start">Deploy</Button>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}`;

/* ============================================================== Sidebar */

const activity = [
  {
    who: "Maya Chen",
    what: "deployed sheen-web to production",
    when: "4 min ago",
    tone: "success" as const,
    tag: "Deploy",
  },
  {
    who: "Leo Park",
    what: "opened a pull request: Glass tokens",
    when: "22 min ago",
    tone: "accent" as const,
    tag: "PR",
  },
  {
    who: "Asha Verma",
    what: "reported a failing build on main",
    when: "1 h ago",
    tone: "danger" as const,
    tag: "Build",
  },
];

/** A full app shell: sidebar with groups, a header with search and actions, stat cards and an activity list. */
export function SidebarShell() {
  // On phones the rail starts collapsed, so the content keeps its room; the Collapse item overrides it either way.
  const narrow = useMediaQuery("(max-width: 639.98px)");
  const [manual, setManual] = useState<boolean | null>(null);
  const collapsed = manual ?? narrow;
  const setCollapsed = (update: (c: boolean) => boolean) => setManual(update(collapsed));
  return (
    <div className="flex h-[30rem] w-full gap-3">
      <Sidebar aria-label="Acme workspace" collapsed={collapsed} className="shrink-0">
        <SidebarHeader>
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-sheen-md [background-image:var(--sheen-accent-fill)] text-sheen-accent-fg"
          >
            <Ico d={ICONS.bolt} />
          </span>
          <strong className={collapsed ? "sr-only" : "text-sm"}>Acme Cloud</strong>
        </SidebarHeader>
        <SidebarItem href="#overview" active icon={<Ico d={ICONS.home} />}>
          Overview
        </SidebarItem>
        <SidebarGroup label="Workspace">
          <SidebarItem href="#projects" icon={<Ico d={ICONS.folder} />} badge="12">
            Projects
          </SidebarItem>
          <SidebarItem href="#reports" icon={<Ico d={ICONS.chart} />}>
            Reports
          </SidebarItem>
          <SidebarItem href="#deploys" icon={<Ico d={ICONS.layers} />} badge="3">
            Deployments
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup label="Team">
          <SidebarItem href="#members" icon={<Ico d={ICONS.users} />}>
            Members
          </SidebarItem>
          <SidebarItem href="#billing" icon={<Ico d={ICONS.card} />}>
            Billing
          </SidebarItem>
          <SidebarItem href="#settings" icon={<Ico d={ICONS.gear} />}>
            Settings
          </SidebarItem>
        </SidebarGroup>
        <SidebarFooter>
          <SidebarItem
            onClick={() => setCollapsed((c) => !c)}
            icon={<Ico d={ICONS.chev} className={collapsed ? "size-4 rotate-180" : "size-4"} />}
          >
            Collapse
          </SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        <header className="glass-2 flex items-center gap-3 rounded-sheen-xl px-3 py-2">
          <h3 className="m-0 min-w-0 flex-1 truncate text-sm font-semibold">Overview</h3>
          <Input
            size="sm"
            aria-label="Search"
            placeholder="Search…"
            leading={<Ico d={ICONS.search} />}
            className="hidden w-44 sm:flex"
          />
          <Button size="sm">New project</Button>
          <Avatar name="Maya Chen" size="sm" />
        </header>
        <div className="grid min-h-0 gap-3 sm:grid-cols-3">
          {[
            ["Active users", "12,480", "+8.2%", "success"],
            ["Revenue", "$48.2k", "+3.1%", "success"],
            ["Error rate", "0.42%", "+0.1%", "danger"],
          ].map(([label, value, delta, tone]) => (
            <div key={label} className="glass-2 flex flex-col gap-1 rounded-sheen-xl p-3">
              <span className="text-xs text-sheen-fg-muted">{label}</span>
              <span className="text-xl font-semibold tabular-nums">{value}</span>
              <Badge tone={tone as "success" | "danger"} className="w-fit">
                {delta}
              </Badge>
            </div>
          ))}
        </div>
        <section
          aria-label="Recent activity"
          className="glass-2 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-sheen-xl p-3"
        >
          <h4 className="m-0 text-sm font-semibold">Recent activity</h4>
          <ul className="m-0 flex list-none flex-col gap-2 overflow-hidden p-0">
            {activity.map((a) => (
              <li key={a.who} className="flex items-center gap-3 rounded-sheen-md bg-sheen-hover px-3 py-2 text-sm">
                <Avatar name={a.who} size="sm" />
                <span className="min-w-0 flex-1 truncate">
                  <strong className="font-medium">{a.who}</strong> <span className="text-sheen-fg-muted">{a.what}</span>
                </span>
                <Badge tone={a.tone} className="hidden sm:inline-flex">
                  {a.tag}
                </Badge>
                <span className="hidden text-xs text-sheen-fg-subtle md:inline">{a.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export const sidebarShellCode = `
import { useState } from "react";
import { Avatar, Badge, Button, Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "@sheenui/theme";

export function Example() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[30rem] w-full gap-3">
      <Sidebar aria-label="Acme workspace" collapsed={collapsed} className="shrink-0">
        <SidebarHeader>
          <strong className={collapsed ? "sr-only" : "text-sm"}>Acme Cloud</strong>
        </SidebarHeader>
        <SidebarItem href="#overview" active>Overview</SidebarItem>
        <SidebarGroup label="Workspace">
          <SidebarItem href="#projects" badge="12">Projects</SidebarItem>
          <SidebarItem href="#reports">Reports</SidebarItem>
          <SidebarItem href="#deploys" badge="3">Deployments</SidebarItem>
        </SidebarGroup>
        <SidebarGroup label="Team">
          <SidebarItem href="#members">Members</SidebarItem>
          <SidebarItem href="#billing">Billing</SidebarItem>
        </SidebarGroup>
        <SidebarFooter>
          <SidebarItem onClick={() => setCollapsed((c) => !c)}>Collapse</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="glass-2 flex items-center gap-3 rounded-sheen-xl px-3 py-2">
          <h3 className="m-0 flex-1 text-sm font-semibold">Overview</h3>
          <Button size="sm">New project</Button>
          <Avatar name="Maya Chen" size="sm" />
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Active users 12,480", "Revenue $48.2k", "Error rate 0.42%"].map((stat) => (
            <div key={stat} className="glass-2 flex flex-col gap-1 rounded-sheen-xl p-3 text-sm">
              {stat}
              <Badge tone="success" className="w-fit">+8.2%</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;

/* ============================================================ AspectRatio */

const img = (name: string) => `${BASE_PATH}img/${name}`;

const tiles = [
  {
    ratio: 16 / 9,
    src: "glassmorphism-dashboard-react-aurora-dark-768.webp",
    height: 567,
    alt: "A dark analytics dashboard in glass",
    title: "Analytics dashboard",
    note: "16 : 9",
  },
  {
    ratio: 4 / 3,
    src: "glassmorphism-login-form-react-liquid-light-768.webp",
    height: 469,
    alt: "A light glass login form",
    title: "Login form",
    note: "4 : 3",
  },
  {
    ratio: 1,
    src: "liquid-glass-react-refraction-lens-768.webp",
    height: 266,
    alt: "A refraction lens over a gradient",
    title: "Refraction lens",
    note: "1 : 1",
  },
] as const;

/** Real screenshots, a video poster with a play button and a gradient art tile, all held at their ratios. */
export function AspectGallery() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {tiles.map((t) => (
        <figure key={t.title} className="m-0 flex flex-col gap-2">
          <AspectRatio ratio={t.ratio} className="rounded-sheen-xl border border-sheen-border shadow-lg">
            <img
              src={img(t.src)}
              alt={t.alt}
              width={768}
              height={t.height}
              loading="lazy"
              className="size-full object-cover"
            />
            {/* A solid tint, no blur: a raw backdrop-blur would stay on under reduced transparency and count against the glass budget. */}
            <span className="absolute start-2 top-2 rounded-sheen-full bg-sheen-surface/92 px-2 py-0.5 text-2xs font-semibold tabular-nums">
              {t.note}
            </span>
          </AspectRatio>
          <figcaption className="text-sm font-medium">{t.title}</figcaption>
        </figure>
      ))}
      <figure className="m-0 flex flex-col gap-2 sm:col-span-2">
        <AspectRatio
          ratio={21 / 9}
          className="rounded-sheen-xl border border-sheen-border [background-image:linear-gradient(135deg,var(--sheen-accent),oklch(60%_0.2_330)_55%,oklch(70%_0.17_200))]"
        >
          <div className="absolute inset-0 grid place-items-center">
            <Button size="icon" variant="glass" aria-label="Play the product tour">
              <Ico d={ICONS.play} className="size-5" />
            </Button>
          </div>
          <span className="absolute end-3 bottom-3 rounded-sheen-full bg-black/55 px-2 py-0.5 text-2xs font-semibold text-white tabular-nums">
            2:14
          </span>
        </AspectRatio>
        <figcaption className="text-sm font-medium">
          Product tour <span className="font-normal text-sheen-fg-muted">· 21 : 9 video poster</span>
        </figcaption>
      </figure>
      <figure className="m-0 flex flex-col gap-2">
        <AspectRatio ratio={1} className="rounded-sheen-xl border border-sheen-border bg-sheen-accent-soft">
          <div className="absolute inset-0 grid place-items-center gap-1 p-4 text-center">
            <Avatar name="Maya Chen" size="lg" />
            <span className="text-sm font-semibold">Maya Chen</span>
            <span className="text-xs text-sheen-fg-muted">Design lead</span>
          </div>
        </AspectRatio>
        <figcaption className="text-sm font-medium">
          Profile card <span className="font-normal text-sheen-fg-muted">· 1 : 1</span>
        </figcaption>
      </figure>
    </div>
  );
}

export const aspectGalleryCode = `
import { AspectRatio, Button } from "@sheenui/theme";

export function Example() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <figure className="m-0 flex flex-col gap-2">
        <AspectRatio ratio={16 / 9} className="rounded-sheen-xl border border-sheen-border">
          <img src="/img/glassmorphism-dashboard-react-aurora-dark-768.webp" alt="A dark analytics dashboard in glass" className="size-full object-cover" />
        </AspectRatio>
        <figcaption className="text-sm font-medium">Analytics dashboard</figcaption>
      </figure>
      <figure className="m-0 flex flex-col gap-2">
        <AspectRatio ratio={4 / 3} className="rounded-sheen-xl border border-sheen-border">
          <img src="/img/glassmorphism-login-form-react-liquid-light-768.webp" alt="A light glass login form" className="size-full object-cover" />
        </AspectRatio>
        <figcaption className="text-sm font-medium">Login form</figcaption>
      </figure>
      <figure className="m-0 flex flex-col gap-2">
        <AspectRatio ratio={21 / 9} className="rounded-sheen-xl border border-sheen-border bg-sheen-accent-soft">
          <div className="absolute inset-0 grid place-items-center">
            <Button size="icon" variant="glass" aria-label="Play the product tour">▶</Button>
          </div>
        </AspectRatio>
        <figcaption className="text-sm font-medium">Product tour</figcaption>
      </figure>
    </div>
  );
}`;

/* ================================================================ Spinner */

/** Spinners on glass: sizes with labels, tones, a loading panel and a row of loading buttons. */
export function SpinnerStage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="glass-2 grid grid-cols-5 gap-3 rounded-sheen-xl p-5">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-3">
            <div className="grid h-14 place-items-center">
              <Spinner size={size} />
            </div>
            <span className="text-xs font-medium text-sheen-fg-muted">{size}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-2 flex flex-col items-center gap-3 rounded-sheen-xl p-6">
          <Spinner size="xl" showLabel labels={{ loading: "Loading your projects" }} className="flex-col" />
          <p className="m-0 max-w-[16rem] text-center text-xs text-sheen-fg-muted">
            The label is read aloud as "Loading your projects" and shown under the ring.
          </p>
        </div>
        <div className="glass-2 flex flex-col gap-3 rounded-sheen-xl p-6">
          <div className="flex items-center gap-3">
            <Spinner size="lg" tone="muted" />
            <span className="text-sm text-sheen-fg-muted">Muted, for quiet panels</span>
          </div>
          <div className="flex items-center gap-3 rounded-sheen-lg px-3 py-3 text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]">
            <Spinner size="lg" tone="current" />
            <span className="text-sm font-medium">Current colour, on a filled surface</span>
          </div>
        </div>
      </div>
      <div className="glass-2 flex flex-wrap items-center gap-3 rounded-sheen-xl p-5">
        <Button aria-busy disabled>
          <Spinner size="sm" tone="current" labels={{ loading: "Saving" }} />
          Saving
        </Button>
        <Button variant="glass" aria-busy disabled>
          <Spinner size="sm" tone="current" labels={{ loading: "Syncing" }} />
          Syncing files
        </Button>
        <Button variant="outline" aria-busy disabled>
          <Spinner size="sm" tone="current" labels={{ loading: "Loading" }} />
          Loading
        </Button>
        <Button loading>Button prop</Button>
      </div>
    </div>
  );
}

export const spinnerStageCode = `
import { Button, Spinner } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="glass-2 grid grid-cols-5 gap-3 rounded-sheen-xl p-5">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-3">
            <Spinner size={size} />
            <span className="text-xs font-medium text-sheen-fg-muted">{size}</span>
          </div>
        ))}
      </div>
      <div className="glass-2 flex flex-col items-center gap-3 rounded-sheen-xl p-6">
        <Spinner size="xl" showLabel labels={{ loading: "Loading your projects" }} className="flex-col" />
      </div>
      <div className="glass-2 flex flex-wrap items-center gap-3 rounded-sheen-xl p-5">
        <Button aria-busy disabled>
          <Spinner size="sm" tone="current" labels={{ loading: "Saving" }} />
          Saving
        </Button>
        <Button variant="glass" aria-busy disabled>
          <Spinner size="sm" tone="current" labels={{ loading: "Syncing" }} />
          Syncing files
        </Button>
        <Button loading>Button prop</Button>
      </div>
    </div>
  );
}`;

/* ========================================================= NavigationMenu */

const products = [
  { icon: ICONS.chart, title: "Charts", text: "Accessible chart components, each with a data table." },
  { icon: ICONS.layers, title: "Blocks", text: "Login, checkout, settings and notification centre." },
  { icon: ICONS.bolt, title: "Dashboards", text: "Five analytics templates with live data." },
  { icon: ICONS.users, title: "Chat", text: "Thread, composer, inbox and an AI assistant." },
] as const;

const developers = [
  { icon: ICONS.book, title: "Documentation", text: "Install, theme and use every component." },
  { icon: ICONS.code, title: "Registry", text: "Add any component with the shadcn CLI." },
  { icon: ICONS.gear, title: "Changelog", text: "What shipped, release by release." },
] as const;

function MenuItemLink({ href, icon, title, text }: { href: string; icon: string; title: string; text: string }) {
  return (
    <li>
      <NavigationMenuLink plain href={href} className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-sheen-md bg-sheen-accent-soft text-sheen-accent"
        >
          <Ico d={icon} className="size-[1.125rem]" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-sheen-fg">{title}</span>
          <span className="block text-xs leading-snug text-sheen-fg-muted">{text}</span>
        </span>
      </NavigationMenuLink>
    </li>
  );
}

/** A site header: brand, a navigation menu with a featured card and icon links, and a sign-in button. */
export function NavMenuShowcase() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="glass-2 flex flex-wrap items-center gap-3 rounded-sheen-full py-2 ps-5 pe-2 max-sm:ps-4">
        <span className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-sheen-md [background-image:var(--sheen-accent-fill)] text-sheen-accent-fg"
          >
            <Ico d={ICONS.bolt} className="size-4" />
          </span>
          Acme
        </span>
        <NavigationMenu aria-label="Main" className="ms-auto max-sm:order-last max-sm:ms-0 max-sm:basis-full sm:ms-4">
          {/* One row on a phone (tighter padding): a wrapped second row sits under the open panel and gets covered. */}
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger className="max-sm:px-2">Products</NavigationMenuTrigger>
              <NavigationMenuContent className="w-[min(40rem,calc(100vw-2rem))]">
                <div className="grid gap-2 sm:grid-cols-[13rem_1fr]">
                  <NavigationMenuLink
                    plain
                    href="#featured"
                    className="flex flex-col justify-end gap-1 rounded-sheen-lg p-4 text-white [background-image:linear-gradient(160deg,var(--sheen-accent),oklch(55%_0.2_320))] sm:min-h-40"
                  >
                    <span className="text-2xs font-semibold tracking-wide uppercase opacity-80">New</span>
                    <span className="text-base font-semibold">Liquid Glass</span>
                    <span className="text-xs leading-snug opacity-90">
                      Real refraction for hero surfaces, at a fraction of the cost.
                    </span>
                  </NavigationMenuLink>
                  <ul className="m-0 grid list-none gap-1 p-0">
                    {products.map((p) => (
                      <MenuItemLink key={p.title} href={`#${p.title.toLowerCase()}`} {...p} />
                    ))}
                  </ul>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="developers">
              <NavigationMenuTrigger className="max-sm:px-2">Developers</NavigationMenuTrigger>
              <NavigationMenuContent className="w-[min(26rem,calc(100vw-2rem))]">
                <ul className="m-0 grid list-none gap-1 p-0">
                  {developers.map((d) => (
                    <MenuItemLink key={d.title} href={`#${d.title.toLowerCase()}`} {...d} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing" active className="max-sm:px-2">
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button size="sm" className="ms-auto hidden sm:inline-flex">
          Sign in
        </Button>
      </div>
      <p className="m-0 text-xs text-sheen-fg-muted">
        Hover or focus a menu item: the panel resizes between Products and Developers and the content slides from the
        side you came from.
      </p>
    </div>
  );
}

export const navMenuShowcaseCode = `
import {
  Button,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@sheenui/theme";

const products = [
  { title: "Charts", text: "Accessible chart components, each with a data table." },
  { title: "Blocks", text: "Login, checkout, settings and notification centre." },
  { title: "Dashboards", text: "Five analytics templates with live data." },
];

export function Example() {
  return (
    <div className="glass-2 flex items-center gap-3 rounded-sheen-full py-2 ps-5 pe-2">
      <strong>Acme</strong>
      <NavigationMenu aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent className="w-[min(40rem,calc(100vw-2rem))]">
              <div className="grid gap-2 sm:grid-cols-[13rem_1fr]">
                <NavigationMenuLink plain href="#featured" className="flex flex-col justify-end gap-1 rounded-sheen-lg p-4 text-white [background-image:linear-gradient(160deg,var(--sheen-accent),oklch(55%_0.2_320))]">
                  <span className="text-base font-semibold">Liquid Glass</span>
                  <span className="text-xs">Real refraction for hero surfaces.</span>
                </NavigationMenuLink>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {products.map((p) => (
                    <li key={p.title}>
                      <NavigationMenuLink plain href={\`#\${p.title.toLowerCase()}\`}>
                        <span className="block text-sm font-medium text-sheen-fg">{p.title}</span>
                        <span className="block text-xs text-sheen-fg-muted">{p.text}</span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" active>Pricing</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Button size="sm" className="ms-auto">Sign in</Button>
    </div>
  );
}`;
