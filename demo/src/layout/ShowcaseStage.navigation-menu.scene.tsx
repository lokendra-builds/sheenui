import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { NavigationMenuScene } from "./ShowcaseStage.navigation-menu";

const Row = ({ title, text }: { title: string; text: string }) => (
  <li>
    <NavigationMenuLink href={`#${title.toLowerCase()}`} className="flex flex-col items-start gap-0.5">
      <span className="font-medium">{title}</span>
      <span className="text-xs text-sheen-fg-muted">{text}</span>
    </NavigationMenuLink>
  </li>
);

/** The live NavigationMenu on its stage: one panel that resizes and slides between Products and Developers. */
export function NavigationMenuScene({ scene, ctx }: { scene: NavigationMenuScene; ctx: StageContext }) {
  const [menu, setMenu] = useFollow<string>(scene.menu);
  return (
    <div className="sheen-stage-col items-stretch">
      {/* A site header across the plate with a page under it, so the open panel drops over real content. */}
      <div className="glass-1 flex items-center justify-between gap-2 rounded-sheen-xl px-3 py-1.5 max-sm:contents">
        <span className="ps-1 font-semibold max-sm:hidden">Acme</span>
        <NavigationMenu
          aria-label="Stage preview"
          value={menu || null}
          onValueChange={(next) => {
            setMenu((next as string | null) ?? "");
            ctx.setState(next ? "lit" : "idle");
          }}
        >
          {/* One row on a phone (tighter padding, 44 px tall): a wrapped second row sits under the open panel and gets covered. */}
          <NavigationMenuList className="max-sm:justify-center">
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger className="max-sm:px-2">Products</NavigationMenuTrigger>
              <NavigationMenuContent data-stage-popup="" className="w-[min(20rem,calc(100vw-2rem))]">
                <ul className="m-0 grid list-none gap-1 p-0">
                  <Row title="Analytics" text="Dashboards that load before you blink." />
                  <Row title="Automations" text="Run a workflow when anything changes." />
                  <Row title="Billing" text="Invoices, taxes and dunning." />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="developers">
              <NavigationMenuTrigger className="max-sm:px-2">Developers</NavigationMenuTrigger>
              <NavigationMenuContent data-stage-popup="" className="w-[min(16rem,calc(100vw-2rem))]">
                <ul className="m-0 grid list-none gap-1 p-0">
                  <Row title="API reference" text="Every endpoint." />
                  <Row title="Changelog" text="What shipped this week." />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing" className="max-sm:px-2">
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <span aria-hidden className="w-12 max-sm:hidden" />
      </div>
      <div className="text-start">
        <p className="sheen-stage-title text-xl">Everything your team ships with</p>
        <p className="sheen-stage-sub mt-1">Analytics, automations and billing in one place.</p>
      </div>
      <div aria-hidden className="grid w-full grid-cols-3 gap-2">
        <div className="glass-1 h-12 rounded-sheen-lg sm:h-16" />
        <div className="glass-1 h-12 rounded-sheen-lg sm:h-16" />
        <div className="glass-1 h-12 rounded-sheen-lg sm:h-16" />
      </div>
    </div>
  );
}
