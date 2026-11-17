// Shared machinery for the lens-2 motion gates (motion budget):
// an animation recorder and the scenario walk both gate files run.
//
// The recorder sees every CSS transition, CSS animation and Web Animation (Motion) that starts while
// a scenario runs: it listens to transitionrun / animationstart, wraps Element.prototype.animate and
// polls document.getAnimations() on every frame. No fixed sleeps anywhere.

import type { ReactElement } from "react";
import { expect } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "../src/components/accordion/accordion";
import { Alert } from "../src/components/alert/alert";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../src/components/collapsible/collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../src/components/navigation-menu/navigation-menu";
import { Button } from "../src/components/button/button";
import { LineChart } from "../src/components/charts/line-chart";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../src/components/dialog/dialog";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../src/components/drawer/drawer";
import { GlassCard } from "../src/components/glass-card/glass-card";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../src/components/menu/menu";
import { Select } from "../src/components/select/select";
import { Checkbox } from "../src/components/checkbox/checkbox";
import { Input } from "../src/components/input/input";
import { OtpInput } from "../src/components/otp-input/otp-input";
import { Switch } from "../src/components/switch/switch";
import { Textarea } from "../src/components/textarea/textarea";
import { Spinner } from "../src/components/spinner/spinner";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../src/components/tabs/tabs";
import { ToastProvider, Toaster, useToast } from "../src/components/toast/toast";
import { Tooltip } from "../src/components/tooltip/tooltip";
import { DatePicker } from "../src/components/date-picker/date-picker";
import { VerticalNav } from "../src/components/vertical-nav/vertical-nav";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../src/components/hover-card/hover-card";
import { useState } from "react";
import { frames, holdFor, parkPointer, settle } from "./helpers";
import exceptions from "../motion-exceptions.json";

/** Properties a motion may animate without an exception: compositor-only. */
export const COMPOSITOR = new Set(["transform", "translate", "scale", "rotate", "opacity"]);
const TRANSFORMS = new Set(["transform", "translate", "scale", "rotate"]);
/** Paint-only properties allowed to fade (<= 150 ms) under reduced motion, next to opacity. */
const FADE = new Set(["opacity", "box-shadow", "filter"]);
const META = new Set(["offset", "computedOffset", "easing", "composite"]);

/** One entry of theme/motion-exceptions.json. */
export type MotionException = {
  component: string;
  property: string;
  reason: string;
  file?: string;
  cap?: string;
  usedBy?: string[];
};
export const motionExceptions = exceptions as MotionException[];

export type Seen = {
  /** Short description of the animated element, for failure messages. */
  target: string;
  /** Kebab-case CSS properties in the animation's keyframes (or the transitioned property). */
  properties: string[];
  kind: "css-transition" | "css-animation" | "web-animation";
  /** Duration in ms (delay excluded); Infinity never appears here, `loop` says so. */
  duration: number;
  loop: boolean;
};

const kebab = (name: string) => (name === "cssFloat" ? "float" : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));

/** `border-top-color` and friends are one change of "border-color". */
const normalise = (property: string) => property.replace(/^border-(top|right|bottom|left)-color$/, "border-color");

function describeTarget(node: Element | null | undefined, pseudo?: string | null) {
  if (!node) return "?";
  const cls =
    typeof node.className === "string" ? node.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".") : "";
  return `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}${cls ? `.${cls}` : ""}${pseudo ?? ""}`;
}

function read(animation: Animation): Seen | null {
  const effect = animation.effect as KeyframeEffect | null;
  if (!effect || typeof effect.getKeyframes !== "function") return null;
  const props = new Set<string>();
  for (const frame of effect.getKeyframes())
    for (const key of Object.keys(frame)) if (!META.has(key)) props.add(normalise(kebab(key)));
  if (animation instanceof CSSTransition) props.add(normalise(animation.transitionProperty));
  const timing = effect.getComputedTiming();
  return {
    target: describeTarget(effect.target, effect.pseudoElement),
    properties: [...props],
    kind:
      animation instanceof CSSTransition
        ? "css-transition"
        : animation instanceof CSSAnimation
          ? "css-animation"
          : "web-animation",
    duration: Number(timing.duration),
    loop: timing.iterations === Infinity,
  };
}

/**
 * Record every animation that starts until `stop()` is called. Animations already running when
 * recording starts are ignored (they belong to the previous step).
 */
export function recordAnimations() {
  const known = new WeakSet<Animation>(document.getAnimations());
  const seen: Seen[] = [];
  const sweep = () => {
    for (const animation of document.getAnimations()) {
      if (known.has(animation)) continue;
      known.add(animation);
      const entry = read(animation);
      if (entry) seen.push(entry);
    }
  };
  // eslint-disable-next-line @typescript-eslint/unbound-method -- restored below, always called with its element
  const original = Element.prototype.animate;
  Element.prototype.animate = function (this: Element, ...args: Parameters<Element["animate"]>) {
    const animation = original.apply(this, args);
    known.add(animation);
    const entry = read(animation);
    if (entry) seen.push(entry);
    return animation;
  };
  document.addEventListener("transitionrun", sweep, true);
  document.addEventListener("animationstart", sweep, true);
  let raf = 0;
  const tick = () => {
    sweep();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    stop() {
      cancelAnimationFrame(raf);
      sweep();
      Element.prototype.animate = original;
      document.removeEventListener("transitionrun", sweep, true);
      document.removeEventListener("animationstart", sweep, true);
      return seen;
    },
  };
}

/** Every "component/property" exception an animation actually relied on during this run (see the staleness test). */
export const usedExceptions = new Set<string>();

/** Properties of `seen` that are neither compositor-only nor allow-listed for `component`. */
export function offenders(component: string, seen: Seen[]) {
  const matching = motionExceptions.filter(
    (e) => e.component === component || e.component === "*" || e.usedBy?.includes(component),
  );
  const allowed = new Set(matching.map((e) => e.property));
  const bad: string[] = [];
  for (const entry of seen)
    for (const property of entry.properties) {
      if (COMPOSITOR.has(property)) continue;
      if (allowed.has(property)) {
        for (const e of matching) if (e.property === property) usedExceptions.add(`${e.component}/${e.property}`);
      } else bad.push(`${property} on ${entry.target} (${entry.kind})`);
    }
  return [...new Set(bad)];
}

/** Reduced-motion violations: any transform animation, or a slow one that is not a short opacity fade. */
export function reducedViolations(seen: Seen[]) {
  const bad: string[] = [];
  for (const entry of seen) {
    if (entry.properties.some((p) => TRANSFORMS.has(p))) {
      // A zero-length (≤ 1 ms) pass is a jump to the end state, which is what reduced motion asks for.
      if (entry.duration > 10)
        bad.push(`transform animation on ${entry.target} (${entry.kind}, ${Math.round(entry.duration)} ms)`);
      continue;
    }
    // A short fade of opacity or colour (state feedback) may stay; anything else must jump.
    const fade = entry.properties.every((p) => FADE.has(p) || p.endsWith("color"));
    if (entry.duration > 10 && !(fade && entry.duration <= 150))
      bad.push(`${entry.properties.join(",")} on ${entry.target} (${entry.kind}, ${Math.round(entry.duration)} ms)`);
    if (entry.loop) bad.push(`looping animation on ${entry.target}`);
  }
  return [...new Set(bad)];
}

/**
 * JS-driven motion under reduced motion: after a scenario settled, sample the box of up to 400 elements three
 * times over 600 ms. Anything that still moved or resized by more than 1 px is motion the CSS rules cannot see
 * (Motion transforms, JS-written positions). Returns what moved.
 */
export async function stillMoving(): Promise<string[]> {
  const nodes = [...document.body.querySelectorAll<HTMLElement>("*")]
    .filter((n) => n.getClientRects().length > 0)
    .slice(0, 400);
  const box = (n: HTMLElement) => {
    const r = n.getBoundingClientRect();
    return [r.left, r.top, r.width, r.height];
  };
  const first = nodes.map(box);
  await holdFor(600);
  const moved: string[] = [];
  nodes.forEach((n, i) => {
    const now = box(n);
    if (!n.isConnected) return;
    if (now.some((v, k) => Math.abs(v - first[i]![k]!) > 1)) moved.push(describeTarget(n));
  });
  return [...new Set(moved)];
}

/** A step of a scenario walk. */
type Run = () => Promise<void>;
export type Scenario = {
  /** Name of the component, as written in motion-exceptions.json. */
  component: string;
  /** What the walk does, in a few words. */
  title: string;
  ui: ReactElement;
  run: Run;
  /** Lens-2 issue number from the independent review when this scenario fails today; flips to a normal test once fixed. */
  knownIssue?: string;
  /** Same, for the reduced-motion gate. */
  knownReducedIssue?: string;
};

const chartRows = [
  { month: "Jan", visits: 4200 },
  { month: "Feb", visits: 5100 },
  { month: "Mar", visits: 4800 },
  { month: "Apr", visits: 6100 },
];

function ToastButtons() {
  const toast = useToast();
  return <Button onClick={() => toast.info("Heads up", "Something happened")}>raise toast</Button>;
}

const byRole = (role: string, name?: string | RegExp) => () => screen.queryByRole(role, name ? { name } : undefined);

export const scenarios: Scenario[] = [
  {
    component: "dialog",
    title: "open and close",
    ui: (
      <Dialog>
        <DialogTrigger render={<Button variant="glass" />}>Edit profile</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes here.</DialogDescription>
          </DialogHeader>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogContent>
      </Dialog>
    ),
    async run() {
      await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
      await expect.poll(byRole("dialog")).not.toBeNull();
      await settle();
      await userEvent.keyboard("{Escape}");
      await expect.poll(byRole("dialog")).toBeNull();
    },
  },
  {
    component: "menu",
    title: "open and close",
    ui: (
      <Menu>
        <MenuTrigger render={<Button variant="glass" />}>Actions</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
    ),
    async run() {
      await userEvent.click(screen.getByRole("button", { name: "Actions" }));
      await expect.poll(byRole("menu", "Actions")).not.toBeNull();
      await settle();
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Escape}");
      await expect.poll(byRole("menu", "Actions")).toBeNull();
    },
  },
  {
    component: "select",
    title: "open, pick and close",
    ui: (
      <Select
        label="Fruit"
        items={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
        placeholder="Pick a fruit"
      />
    ),
    async run() {
      await userEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
      await expect.poll(byRole("listbox")).not.toBeNull();
      await settle();
      await userEvent.click(screen.getByRole("option", { name: /Banana/ }));
      await expect.poll(byRole("listbox")).toBeNull();
    },
  },
  {
    component: "tooltip",
    title: "show on hover, hide on leave",
    ui: (
      <Tooltip content="Save changes" delay={50}>
        <Button>Save</Button>
      </Tooltip>
    ),
    async run() {
      // Hover (not focus): a tooltip opened by focus or closed by Escape is instant by design (data-instant).
      await userEvent.hover(screen.getByRole("button", { name: "Save" }));
      await expect.poll(() => screen.queryByText("Save changes")).not.toBeNull();
      await settle();
      await parkPointer();
      await expect.poll(() => screen.queryByText("Save changes")).toBeNull();
    },
  },
  {
    component: "toast",
    title: "raise a toast",
    ui: (
      <ToastProvider timeout={0}>
        <ToastButtons />
        <Toaster />
      </ToastProvider>
    ),
    async run() {
      await userEvent.click(screen.getByRole("button", { name: "raise toast" }));
      await expect.poll(() => screen.queryByText("Heads up")).not.toBeNull();
      await settle();
    },
  },
  {
    component: "tabs",
    title: "switch tabs, interrupting the first switch",
    ui: (
      <Tabs defaultValue="overview">
        <TabsList aria-label="Sections">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="activity">Activity</TabsTab>
          <TabsTab value="settings">Settings</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview panel</TabsPanel>
        <TabsPanel value="activity">Activity panel</TabsPanel>
        <TabsPanel value="settings">Settings panel</TabsPanel>
      </Tabs>
    ),
    async run() {
      await userEvent.click(screen.getByRole("tab", { name: "Activity" }));
      await userEvent.click(screen.getByRole("tab", { name: "Settings" }));
      await expect.poll(() => screen.getByRole("tab", { name: "Settings" }).getAttribute("aria-selected")).toBe("true");
      await settle();
    },
  },
  {
    component: "accordion",
    title: "expand and collapse",
    ui: (
      <Accordion>
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionPanel>We ship worldwide.</AccordionPanel>
        </AccordionItem>
      </Accordion>
    ),
    async run() {
      const trigger = screen.getByRole("button", { name: "Shipping" });
      await userEvent.click(trigger);
      await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
      await settle();
      await userEvent.click(trigger);
      await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
      await settle();
    },
  },
  {
    component: "collapsible",
    title: "expand and collapse",
    ui: (
      <Collapsible>
        <CollapsibleTrigger>Advanced</CollapsibleTrigger>
        <CollapsiblePanel>Retry limit and timeouts.</CollapsiblePanel>
      </Collapsible>
    ),
    async run() {
      const trigger = screen.getByRole("button", { name: "Advanced" });
      await userEvent.click(trigger);
      await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
      await settle();
      await userEvent.click(trigger);
      await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
      await settle();
    },
  },
  {
    component: "navigation-menu",
    title: "open and close a panel",
    ui: (
      <NavigationMenu aria-label="Main" delay={0} closeDelay={0}>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink plain href="#charts">
                Charts
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
    async run() {
      const trigger = screen.getByRole("button", { name: "Products" });
      // A pointer resting on the trigger may already have opened it on hover; press only while it is closed.
      await expect
        .poll(
          async () => {
            if (trigger.getAttribute("aria-expanded") !== "true") await userEvent.click(trigger);
            return trigger.getAttribute("aria-expanded");
          },
          { timeout: 10_000 },
        )
        .toBe("true");
      await settle();
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
      await settle();
    },
  },
  {
    component: "alert",
    title: "dismiss",
    ui: (
      <Alert dismissible title="Heads up">
        Body
      </Alert>
    ),
    async run() {
      await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      await expect.poll(() => screen.queryByText("Heads up")).toBeNull();
      await settle();
    },
  },
  {
    component: "drawer",
    title: "open and close",
    ui: (
      <Drawer>
        <DrawerTrigger render={<Button variant="glass" />}>Open filters</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the results.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
          <DrawerClose render={<Button />}>Apply</DrawerClose>
        </DrawerContent>
      </Drawer>
    ),
    async run() {
      await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
      await expect.poll(byRole("dialog")).not.toBeNull();
      await settle();
      await userEvent.keyboard("{Escape}");
      await expect.poll(byRole("dialog")).toBeNull();
    },
  },
  {
    component: "button",
    title: "hover and press",
    ui: <Button>Press me</Button>,
    async run() {
      const button = screen.getByRole("button", { name: "Press me" });
      await userEvent.hover(button);
      await settle();
      await userEvent.click(button);
      await settle();
      await parkPointer();
      await settle();
    },
  },
  {
    // Under reduced motion a spinner holds still (a static arc): no loop of any kind.
    component: "spinner",
    title: "mount",
    ui: <Spinner />,
    async run() {
      await frames(3);
      await settle();
    },
  },
  {
    component: "button",
    title: "loading",
    ui: <Button loading>Saving</Button>,
    async run() {
      await frames(3);
      await settle();
    },
  },
  {
    component: "vertical-nav",
    title: "collapse to the icon rail",
    ui: <RailDemo />,
    async run() {
      await userEvent.click(screen.getByRole("button", { name: "Collapse" }));
      await settle();
      await userEvent.click(screen.getByRole("button", { name: "Collapse" }));
      await settle();
    },
  },
  {
    component: "date-picker",
    title: "open the calendar",
    ui: <DatePicker label="Departure" locale="en-US" today={new Date(2026, 9, 10)} />,
    async run() {
      await userEvent.click(screen.getByRole("button", { name: /Departure|calendar/i }));
      await expect.poll(() => document.querySelector("[role=dialog], [role=grid]")).not.toBeNull();
      await settle();
      await userEvent.keyboard("{Escape}");
      await settle();
    },
  },
  {
    component: "hover-card",
    title: "hover the trigger and move across the card",
    ui: (
      <HoverCard>
        <HoverCardTrigger href="/x" delay={0} closeDelay={0}>
          Open card
        </HoverCardTrigger>
        <HoverCardContent data-testid="hc">Card body</HoverCardContent>
      </HoverCard>
    ),
    async run() {
      await userEvent.hover(screen.getByRole("link", { name: "Open card" }));
      const card = await screen.findByTestId("hc");
      await userEvent.hover(card);
      await settle();
      await parkPointer();
      await settle();
    },
  },
  {
    component: "glass-card",
    title: "hover",
    ui: (
      <GlassCard interactive tabIndex={0} aria-label="Card">
        Card body
      </GlassCard>
    ),
    async run() {
      await userEvent.hover(screen.getByLabelText("Card"));
      await settle();
      await parkPointer();
      await settle();
    },
  },
  {
    component: "input",
    title: "hover, focus, type",
    ui: <Input label="Email" />,
    async run() {
      const field = screen.getByRole("textbox", { name: /Email/ });
      await userEvent.hover(field);
      await settle();
      await userEvent.click(field);
      await userEvent.keyboard("ada");
      await settle();
      await parkPointer();
      await settle();
    },
  },
  {
    component: "textarea",
    title: "hover and focus",
    ui: <Textarea label="Notes" />,
    async run() {
      const field = screen.getByRole("textbox", { name: /Notes/ });
      await userEvent.hover(field);
      await userEvent.click(field);
      await settle();
      await parkPointer();
      await settle();
    },
  },
  {
    component: "checkbox",
    title: "check and uncheck",
    ui: <Checkbox label="Agree" />,
    async run() {
      const box = screen.getByRole("checkbox", { name: /Agree/ });
      await userEvent.click(box);
      await settle();
      await userEvent.click(box);
      await settle();
    },
  },
  {
    component: "switch",
    title: "toggle",
    ui: <Switch label="Notifications" />,
    async run() {
      const toggle = screen.getByRole("switch", { name: /Notifications/ });
      await userEvent.click(toggle);
      await settle();
      await userEvent.click(toggle);
      await settle();
    },
  },
  {
    component: "otp-input",
    title: "type a code",
    ui: <OtpInput length={4} />,
    async run() {
      await userEvent.click(screen.getAllByRole("textbox")[0]!);
      await userEvent.keyboard("1234");
      await settle();
    },
  },
  {
    component: "chart",
    title: "mount (draw-in)",
    ui: (
      <div style={{ width: 640 }}>
        <LineChart data={chartRows} index="month" series={[{ key: "visits", label: "Visits" }]} aria-label="Visits" />
      </div>
    ),
    async run() {
      await expect.poll(() => document.querySelector("svg path")).not.toBeNull();
      await frames(2);
      await settle();
    },
  },
];

function RailDemo() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <VerticalNav
        sections={[
          {
            items: [
              { value: "a", label: "Overview" },
              { value: "b", label: "Inbox" },
            ],
          },
        ]}
        value="a"
        collapsed={collapsed}
      />
      <Button onClick={() => setCollapsed((c) => !c)}>Collapse</Button>
    </div>
  );
}
