import { Kbd, KbdShortcut } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { KbdScene as KbdSceneData } from "../layout/ShowcaseStage.kbd";
import { KbdScene } from "../layout/ShowcaseStage.kbd.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { PlatformTable } from "./MenuPages/kbd";
import { lazyBlock } from "../layout/lazy-block";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const island = { eager: true, minHeight: "80vh" };

/** The DropdownMenu page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const DropdownMenuPage = lazyBlock(
  () => import("./DropdownMenuPageBody").then((m) => m.DropdownMenuPage),
  island,
);

/** The "Kbd" docs page (/overlays/kbd): live examples, props and notes. */
export function KbdPage() {
  return (
    <Page
      eyebrow="Overlay"
      title="Kbd"
      description="Key caps for shortcuts and hints. Write a shortcut once (mod+k) and it reads ⌘K on a Mac and Ctrl+K on Windows and Linux. Screen readers hear key names (“Command K”), not symbols."
      source={["theme/src/components/kbd/kbd.tsx", "theme/src/components/kbd/shortcut.ts"]}
    >
      <ShowcaseStage<KbdSceneData>
        label="Kbd demo"
        story={() => import("../layout/ShowcaseStage.kbd")}
        initial={{ held: 0, opened: false }}
        minHeight="18rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <KbdScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Keys and shortcuts"
        code={`
import { Kbd, KbdShortcut } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Kbd>Esc</Kbd>
      <Kbd>↵</Kbd>
      <KbdShortcut keys="mod+k" />
      <KbdShortcut keys="shift+mod+p" />
      <KbdShortcut keys="mod+k" size="md" />

      <p>Press <KbdShortcut keys="mod+k" /> to search.</p>
    </>
  );
}`}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Kbd>Esc</Kbd>
            <Kbd>↵</Kbd>
            <Kbd>Tab</Kbd>
            <KbdShortcut keys="mod+k" />
            <KbdShortcut keys="shift+mod+p" />
            <KbdShortcut keys="mod+k" size="md" />
          </div>
          <p className="text-sm text-sheen-fg-muted">
            Press <KbdShortcut keys="mod+k" /> to search, <Kbd>?</Kbd> for every shortcut.
          </p>
        </div>
      </Example>

      <Example
        title="Every platform"
        description="Chips for hints in text; inline for menus (⇧⌘P on a Mac, Ctrl+Shift+P elsewhere), in each platform's own modifier order. Pin a platform to document both."
        code={`
import { useEffect } from "react";
import { KbdShortcut, formatShortcut, matchesShortcut } from "@sheenui/theme";

export function Example() {
  // Helpers
  const parts = formatShortcut("shift+mod+p", "other"); // { keys: ["Ctrl", "Shift", "P"], spoken: "Control Shift P", aria: "Control+Shift+P" }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (matchesShortcut(event, "mod+k")) console.log("palette"); // in a keydown handler
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <p>{parts.spoken}</p>
      <KbdShortcut keys="shift+mod+p" /> {/* chips */}
      <KbdShortcut keys="shift+mod+p" variant="inline" /> {/* menu text */}
      <KbdShortcut keys="shift+mod+p" platform="mac" /> {/* always ⇧ ⌘ P */}
    </>
  );
}`}
      >
        <PlatformTable />
      </Example>

      <section className="flex flex-col gap-8">
        <h2 id="api" className="text-xl font-semibold tracking-tight">
          API
        </h2>
        <PropsTable as="h3" title="KbdShortcut" of={PROPS.KbdShortcut} />
        <PropsTable
          as="h3"
          title="Kbd and helpers"
          of={PROPS.Kbd}
          rows={[
            ["<Kbd size>", '"sm" | "md"', '"sm"', "One key cap; any text or symbol inside."],
            [
              "formatShortcut(keys, platform, labels?)",
              "{ keys, spoken, aria }",
              "",
              "Visible keys, words for screen readers and an aria-keyshortcuts value.",
            ],
            [
              "matchesShortcut(event, keys, platform?)",
              "boolean",
              "",
              "Does a keydown event match? Modifiers must match exactly.",
            ],
            [
              "useShortcutPlatform(platform?)",
              '"mac" | "other"',
              "",
              'Returns the visitor\'s platform ("other" during server rendering).',
            ],
          ]}
        />
      </section>
      <KeyboardTable rows={[["Tab", "Not focusable: Kbd and KbdShortcut only display keys."]]} />
      <A11yNotes
        items={[
          'Keys render in <kbd> elements. KbdShortcut adds a visually hidden spoken form ("Control Shift P") unless announce is false.',
          'Pass platform to force Mac or other symbols; by default the visitor\'s platform decides, so "mod" shows Cmd on a Mac and Ctrl elsewhere.',
          "A shortcut shown in a menu item is only a hint: wire the handler yourself (see useCommandShortcut and matchesShortcut).",
        ]}
      />
    </Page>
  );
}
