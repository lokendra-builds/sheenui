import { useState } from "react";
import { Button, Navbar, cn } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { HorizontalScene as HorizontalSceneData } from "../layout/ShowcaseStage.horizontal";
import { HorizontalScene } from "../layout/ShowcaseStage.horizontal.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { Segmented } from "../layout/Segmented";
import * as PROPS from "../generated/component-props";

const items = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
];

const moreItems = [...items, { value: "docs", label: "Docs" }, { value: "changelog", label: "Changelog" }];

const widths = [
  { value: "sm", label: "Phone" },
  { value: "md", label: "Tablet" },
  { value: "full", label: "Full" },
] as const;
type Width = (typeof widths)[number]["value"];

const widthClass: Record<Width, string> = { sm: "max-w-80", md: "max-w-2xl", full: "max-w-full" };

const brand = (
  <span className="bg-clip-text text-transparent [background-image:var(--sheen-accent-gradient)]">Sheen</span>
);

/** The "Horizontal nav" docs page (/navigation/navbar): live examples, props and notes. */
export function NavbarPage() {
  const [active, setActive] = useState("home");
  const [narrowActive, setNarrowActive] = useState("home");
  const [width, setWidth] = useState<Width>("sm");

  return (
    <Page
      eyebrow="Navigation"
      title="Horizontal nav"
      description="Two styles: a floating Apple-style pill whose highlight morphs between items, and a full-width top bar with a sliding underline. Both tighten as the page scrolls, and fold their items into a menu when they run out of room."
      source="theme/src/components/navbar/navbar.tsx"
    >
      <ShowcaseStage<HorizontalSceneData>
        label="Horizontal nav demo"
        story={() => import("../layout/ShowcaseStage.horizontal")}
        initial={{ page: "home" }}
        minHeight="19rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <HorizontalScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Floating pill"
        description="Click the items to watch the highlight morph."
        stageClassName="min-h-48"
        code={`
import { useState } from "react";
import { Button, Navbar } from "@sheenui/theme";

export function Example() {
  const [active, setActive] = useState("home");

  return (
    <Navbar
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={[
        { value: "home", label: "Home" },
        { value: "work", label: "Work" },
        { value: "pricing", label: "Pricing" },
        { value: "blog", label: "Blog" },
      ]}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm">Sign in</Button>}
    />
  );
}`}
      >
        <Navbar
          aria-label="Example navigation (floating)"
          brand={brand}
          items={items}
          value={active}
          onValueChange={setActive}
          shrinkOnScroll={false}
          actions={
            <Button size="sm" className="hidden sm:inline-flex">
              Sign in
            </Button>
          }
        />
      </Example>

      <Example
        title="Full-width bar"
        description='variant="bar": for app headers. The underline slides to the active item.'
        stageClassName="min-h-40"
        code={`
import { useState } from "react";
import { Button, Navbar } from "@sheenui/theme";

const items = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
];

export function Example() {
  const [active, setActive] = useState("home");

  return (
    <Navbar
      variant="bar"
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={items}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm" variant="glass">Sign in</Button>}
    />
  );
}`}
      >
        <Navbar
          variant="bar"
          aria-label="Example navigation (bar)"
          brand={brand}
          items={items}
          value={active}
          onValueChange={setActive}
          shrinkOnScroll={false}
          actions={
            <Button size="sm" variant="glass" className="hidden sm:inline-flex">
              Sign in
            </Button>
          }
        />
      </Example>

      <Example
        title="Folds into a menu"
        description="When the items don't fit next to the brand and actions, they fold into a menu button. It opens a glass popover listing every item, with the current one checked; choosing one closes it and returns focus to the button. Pick a width to watch it fold and unfold."
        stageClassName="min-h-72 items-start"
        controls={<Segmented label="Container width" options={widths} value={width} onValueChange={setWidth} />}
        code={`
import { useState } from "react";
import { Button, Navbar } from "@sheenui/theme";

const items = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
  { value: "docs", label: "Docs" },
  { value: "changelog", label: "Changelog" },
];

export function Example() {
  const [active, setActive] = useState("home");

  // Nothing to set up: the nav measures itself and folds when it must.

  return (
    <Navbar
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={items}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm">Sign in</Button>}
      labels={{ menu: "Menu" }} // the menu button's name; collapsible={false} scrolls instead
    />
  );
}`}
      >
        <div className={cn("flex w-full justify-center", widthClass[width])}>
          <Navbar
            aria-label="Example navigation (folding)"
            brand={brand}
            items={moreItems}
            value={narrowActive}
            onValueChange={setNarrowActive}
            shrinkOnScroll={false}
            actions={<Button size="sm">Sign in</Button>}
          />
        </div>
      </Example>

      <PropsTable of={PROPS.Navbar} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move through the brand, items and actions."],
          ["Enter", "Follow a link or select an item."],
          ["Arrow Down / Arrow Up / Home / End", "In the folded menu: move between items."],
          ["Escape", "Close the folded menu and return focus to the menu button."],
        ]}
      />
      <A11yNotes
        items={[
          'A <nav> landmark: pass aria-label ("Main") and give a second bar a different name. The current item has aria-current="page".',
          "A bar hidden by hideOnScroll comes back when focus enters it, so keyboard users never tab into an off-screen bar.",
          "The folded menu button reports aria-expanded and is named by labels.menu. Targets are 44 px on touch screens.",
        ]}
      />
    </Page>
  );
}
