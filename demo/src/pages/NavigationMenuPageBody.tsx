import { NavMenuShowcase, navMenuShowcaseCode } from "./PrimitiveShowcases";
import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { NavigationMenuScene as NavigationMenuSceneData } from "../layout/ShowcaseStage.navigation-menu";
import { NavigationMenuScene } from "../layout/ShowcaseStage.navigation-menu.scene";
import { Example } from "../layout/Example";
import * as PROPS from "../generated/component-props";

/** The "Navigation menu" docs page (/navigation/navigation-menu). */
export function NavigationMenuPage() {
  return (
    <Page
      eyebrow="Navigation"
      title="Navigation menu"
      description="A site navigation bar whose items open rich dropdown panels. One glass panel is shared by all items: it resizes to each item's content and slides between them, with hover intent so passing the pointer across the bar does not flicker it."
      source="theme/src/components/navigation-menu/navigation-menu.tsx"
      keyboard={[
        ["Tab", "Enters the bar; Tab again moves into an open panel's links and then out."],
        ["← / →", "Move between the items of the bar."],
        ["Enter / Space / ↓", "Open the focused item's panel and move into it."],
        ["Escape", "Close the panel and return focus to its trigger."],
      ]}
      a11y={[
        'Renders a <nav> landmark: give it an aria-label ("Main", "Docs") so it is told apart from other navigation.',
        'Triggers are buttons with aria-expanded and aria-controls; links use aria-current="page" when active.',
        "The dropdown is not a menu role: it is a region of ordinary links, which is what site navigation should be.",
        "Hover opens after delay (120 ms) and closes after closeDelay (150 ms); clicking and the keyboard open it at once, so touch and keyboard users never depend on hover.",
        "On touch screens targets are 44px. Under reduced motion the panel fades and does not resize or slide.",
      ]}
    >
      <ShowcaseStage<NavigationMenuSceneData>
        label="Navigation menu demo"
        story={() => import("../layout/ShowcaseStage.navigation-menu")}
        initial={{ menu: "" }}
        minHeight="24rem"
        onInterrupt="keep"
        replayAt="top"
      >
        {(scene, ctx) => <NavigationMenuScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="A site header with rich panels"
        description="Hover or focus Products: a featured card beside icon links. Move to Developers and the panel resizes while the content slides in from the side you came from."
        code={navMenuShowcaseCode}
        stageClassName="min-h-[26rem] items-start"
      >
        <NavMenuShowcase />
      </Example>

      <PropsTable
        title="NavigationMenu props"
        of={PROPS.NavigationMenu}
        rows={[
          [
            "value / defaultValue",
            "string | null",
            "",
            "Which item's panel is open (controlled / uncontrolled). Each item has a value.",
          ],
          ["onValueChange", "(value: string | null) => void", "", "Called when the open item changes."],
          ["orientation", '"horizontal" | "vertical"', '"horizontal"', "Sets the direction of arrow-key navigation."],
          ["aria-label", "string", "", "Names the nav landmark."],
        ]}
      />
      <PropsTable
        title="Parts"
        rows={[
          ["NavigationMenuList", "ul props", "", "The glass pill that holds the items; wraps on narrow screens."],
          ["NavigationMenuItem", "li props + value?", "", "One entry: a trigger with its content, or a link."],
          ["NavigationMenuTrigger", "button props", "", "Opens an item's panel; the chevron turns while it is open."],
          ["NavigationMenuContent", "div props", "", "What the panel shows for this item. Up to 36rem wide."],
          [
            "NavigationMenuLink",
            "a props + active?, plain?, closeOnClick?, render?",
            "",
            "A link; plain skips the pill styling for use inside a panel; render swaps in a router link.",
          ],
        ]}
      />
      <PropsTable of={PROPS.NavigationMenuLink} title="NavigationMenuLink props" as="h3" />
    </Page>
  );
}
