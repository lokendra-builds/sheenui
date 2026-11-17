import { lazy, type ComponentType } from "react";
import { Button } from "@sheenui/theme";

import type { ButtonScene } from "../../layout/ShowcaseStage.button";
import type { StageContext } from "../../layout/ShowcaseStage";
import { makeView, type ViewProps } from "./StoryView";

/** One card of the Stories page: the page it links to, a line about the story, and the lazy view that plays it. */
export type StoryCard = {
  /** Unique id of the card. */
  id: string;
  /** The docs route the card links to. */
  path: string;
  /** The visible name (the link text). */
  name: string;
  kind: "Component" | "Effect" | "Block";
  /** One line about what the story shows. */
  blurb: string;
  /** Height reserved for the stage, a CSS length. */
  minHeight: string;
  /** The card's stage; its chunk (story + live component) is fetched when the card scrolls near. */
  View: ComponentType<ViewProps>;
};

/** The view of a card, loaded only when the card is first rendered (React.lazy), never with the page. */
const view = (load: () => Promise<ComponentType<ViewProps>>) => lazy(async () => ({ default: await load() }));

const check = (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

function ButtonStageScene({ scene }: { scene: ButtonScene; ctx: StageContext }) {
  return (
    <Button
      loading={scene.loading}
      data-stage-pressed={scene.pressed ? "" : undefined}
      className="min-w-44"
      trailing={scene.saved ? check : undefined}
    >
      {scene.loading ? "Saving" : scene.saved ? "Saved" : "Save changes"}
    </Button>
  );
}

/** The curated cards, in reading order: the six pilots, the three payoff blocks, then the strongest effects and overlays. */
export const STORY_CARDS: StoryCard[] = [
  {
    id: "button",
    path: "/components/button",
    name: "Button",
    kind: "Component",
    blurb: "A press, a loading spinner, then a green check and a sweep of light.",
    minHeight: "17rem",
    View: view(async () => {
      const [story] = await Promise.all([import("../../layout/ShowcaseStage.button")]);
      return makeView({
        story: story.default,
        initial: { loading: false, pressed: false, saved: false },
        Scene: ButtonStageScene,
      });
    }),
  },
  {
    id: "lamp-login",
    path: "/blocks/lamp-login",
    name: "Lamp login",
    kind: "Block",
    blurb: "Pull the cord and a warm light cone reveals the sign-in card.",
    minHeight: "24rem",
    View: view(async () => {
      const m = await import("./block-scenes");
      return makeView({
        story: m.lampStory,
        initial: { lit: false, email: 0, password: 0 },
        Scene: m.LampScene,
        initialState: "off",
        fit: 420,
      });
    }),
  },
  {
    id: "otp-input",
    path: "/components/otp-input",
    name: "OTP input",
    kind: "Component",
    blurb: "Six digits are typed, a light scans, then the cells fold into a glass seal.",
    minHeight: "21rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.otp"),
        import("../../layout/ShowcaseStage.otp.scene"),
      ]);
      return makeView({ story: story.default, initial: { value: "", status: "idle" }, Scene: scene.OtpScene });
    }),
  },
  {
    id: "payment-checkout",
    path: "/blocks/payment-checkout",
    name: "Payment checkout",
    kind: "Block",
    blurb: "The card preview flips for the security code, then glows amber and green.",
    minHeight: "21rem",
    View: view(async () => {
      const m = await import("./block-scenes");
      // Natural width the block is drawn at, then scaled to the tile: the two-column layout (viewport >= 48rem) needs about 424px,
      // the single column fits 372px, so the 12px captions stay about 11px after the scale instead of shrinking under 10px.
      const wide = typeof matchMedia === "function" && matchMedia("(min-width: 48rem)").matches;
      return makeView({
        story: m.paymentStory,
        initial: { typed: 0, pay: false },
        Scene: m.PaymentScene,
        fit: wide ? 424 : 372,
      });
    }),
  },
  {
    id: "switch",
    path: "/components/switch",
    name: "Switch",
    kind: "Component",
    blurb: "The thumb springs across and the stage light switches on with it.",
    minHeight: "17rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.switch"),
        import("../../layout/ShowcaseStage.switch.scene"),
      ]);
      return makeView({ story: story.default, initial: { on: false }, initialState: "off", Scene: scene.SwitchScene });
    }),
  },
  {
    id: "otp-verification",
    path: "/blocks/otp-verification",
    name: "OTP verification",
    kind: "Block",
    blurb: "A ring fills with every digit, then the padlock opens in a flood of light.",
    minHeight: "21rem",
    View: view(async () => {
      const m = await import("./block-scenes");
      return makeView({ story: m.otpUnlockStory, initial: { digits: 0 }, Scene: m.OtpUnlockScene, fit: 440 });
    }),
  },
  {
    id: "toast",
    path: "/components/toast",
    name: "Toast",
    kind: "Component",
    blurb: "A deploy pipeline raises, stacks and swaps glass notifications.",
    minHeight: "22rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.toast"),
        import("../../layout/ShowcaseStage.toast.scene"),
      ]);
      return makeView({ story: story.default, initial: { step: 0 }, Scene: scene.ToastScene });
    }),
  },
  {
    id: "tabs",
    path: "/components/tabs",
    name: "Tabs",
    kind: "Component",
    blurb: "The pill slides between tabs and a count badge ticks up.",
    minHeight: "21rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.tabs"),
        import("../../layout/ShowcaseStage.tabs.scene"),
      ]);
      return makeView({ story: story.default, initial: { tab: "overview", count: 2 }, Scene: scene.TabsScene });
    }),
  },
  {
    id: "dialog",
    path: "/components/dialog",
    name: "Dialog",
    kind: "Component",
    blurb: "A strong-glass modal springs in over a dimmed stage, then confirms.",
    minHeight: "21rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([import("../../layout/ShowcaseStage.dialog"), import("./dialog-scene")]);
      return makeView({ story: story.default, initial: { open: false, step: 0 }, Scene: scene.DialogCardScene });
    }),
  },
  {
    id: "morphing-dialog",
    path: "/effects/morphing-dialog",
    name: "Morphing dialog",
    kind: "Effect",
    blurb: "A card grows into a dialog and flies back to where it came from.",
    minHeight: "21rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.morphing-dialog"),
        import("../../layout/ShowcaseStage.morphing-dialog.scene"),
      ]);
      return makeView({ story: story.default, initial: { open: false }, Scene: scene.MorphingDialogScene });
    }),
  },
  {
    id: "dock",
    path: "/effects/macos-dock",
    name: "Dock",
    kind: "Effect",
    blurb: "A pointer sweeps along the dock and the icons swell around it.",
    minHeight: "17rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.dock"),
        import("../../layout/ShowcaseStage.dock.scene"),
      ]);
      return makeView({ story: story.default, initial: { at: null, opened: false }, Scene: scene.DockScene });
    }),
  },
  {
    id: "tilt-card",
    path: "/effects/3d-tilt-card",
    name: "Tilt card",
    kind: "Effect",
    blurb: "The card leans toward the pointer while a glare slides across the glass.",
    minHeight: "20rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.tilt-card"),
        import("../../layout/ShowcaseStage.tilt-card.scene"),
      ]);
      return makeView({ story: story.default, initial: { at: null }, Scene: scene.TiltCardScene });
    }),
  },
  {
    id: "spotlight-card",
    path: "/effects/spotlight-card",
    name: "Spotlight card",
    kind: "Effect",
    blurb: "A soft light follows the pointer and lights the card's rim.",
    minHeight: "16rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.spotlight-card"),
        import("../../layout/ShowcaseStage.spotlight-card.scene"),
      ]);
      return makeView({ story: story.default, initial: { at: null }, Scene: scene.SpotlightCardScene });
    }),
  },
  {
    id: "liquid-glass",
    path: "/effects/liquid-glass",
    name: "Liquid glass",
    kind: "Effect",
    blurb: "A lens of refracting glass slides over the content behind it.",
    minHeight: "18rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.liquid-glass"),
        import("../../layout/ShowcaseStage.liquid-glass.scene"),
      ]);
      return makeView({ story: story.default, initial: { x: 0.1, lens: false }, Scene: scene.LiquidGlassScene });
    }),
  },
  {
    id: "border-beam",
    path: "/effects/border-beam",
    name: "Border beam",
    kind: "Effect",
    blurb: "A comet of light runs around the rounded edge, then rests.",
    minHeight: "16rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.border-beam"),
        import("../../layout/ShowcaseStage.border-beam.scene"),
      ]);
      return makeView({ story: story.default, initial: { beam: "idle" }, Scene: scene.BorderBeamScene });
    }),
  },
  {
    id: "blur-in",
    path: "/effects/blur-in",
    name: "Blur in",
    kind: "Effect",
    blurb: "A headline sharpens out of a blur, word by word.",
    minHeight: "16rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.blur-in"),
        import("../../layout/ShowcaseStage.blur-in.scene"),
      ]);
      return makeView({ story: story.default, initial: { headline: false, sub: false }, Scene: scene.BlurInScene });
    }),
  },
  {
    id: "typewriter",
    path: "/effects/typewriter",
    name: "Typewriter",
    kind: "Effect",
    blurb: "A phrase is typed with a human rhythm, deleted and replaced.",
    minHeight: "17rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.typewriter"),
        import("../../layout/ShowcaseStage.typewriter.scene"),
      ]);
      return makeView({ story: story.default, initial: { prompt: -1 }, Scene: scene.TypewriterScene });
    }),
  },
  {
    id: "number-ticker",
    path: "/effects/number-ticker",
    name: "Number ticker",
    kind: "Effect",
    blurb: "Odometer digits roll up to new revenue and user counts.",
    minHeight: "16rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.number-ticker"),
        import("../../layout/ShowcaseStage.number-ticker.scene"),
      ]);
      return makeView({
        story: story.default,
        initial: { revenue: 12480, users: 402118 },
        Scene: scene.NumberTickerScene,
      });
    }),
  },
  {
    id: "command-palette",
    path: "/overlays/command-palette",
    name: "Command palette",
    kind: "Component",
    blurb: "A shortcut opens the palette, a query filters it and Enter runs a command.",
    minHeight: "22rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.command-palette"),
        import("../../layout/ShowcaseStage.command-palette.scene"),
      ]);
      return makeView({
        story: story.default,
        initial: { open: false, query: "", went: "" },
        Scene: scene.CommandPaletteScene,
      });
    }),
  },
  {
    id: "color-picker",
    path: "/forms/color-picker",
    name: "Color picker",
    kind: "Component",
    blurb: "The handle glides across the color area and the stage takes the color.",
    // Wider than most: the picker is a tall control. The variable is set per width in stories.css.
    minHeight: "var(--story-picker-h, 24rem)",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.color-picker"),
        import("../../layout/ShowcaseStage.color-picker.scene"),
      ]);
      return makeView({ story: story.default, initial: { color: "#6d4aff" }, Scene: scene.ColorPickerScene });
    }),
  },
  {
    id: "carousel",
    path: "/components/carousel",
    name: "Carousel",
    kind: "Component",
    blurb: "Slides advance one by one while the active dot fills.",
    minHeight: "20rem",
    View: view(async () => {
      const [story, scene] = await Promise.all([
        import("../../layout/ShowcaseStage.carousel"),
        import("../../layout/ShowcaseStage.carousel.scene"),
      ]);
      return makeView({ story: story.default, initial: { index: 0 }, Scene: scene.CarouselScene });
    }),
  },
];
