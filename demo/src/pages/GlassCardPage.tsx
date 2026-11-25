import {
  Button,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { GlassCardScene as GlassCardSceneData } from "../layout/ShowcaseStage.glass-card";
import { GlassCardScene } from "../layout/ShowcaseStage.glass-card.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

/** The "Glass card" docs page (/components/glass-card): live examples, props and notes. */
export function GlassCardPage() {
  return (
    <Page
      eyebrow="Component"
      title="Glass card"
      description="The basic glass surface. A soft highlight follows your pointer, and every level falls back to a solid surface when transparency is reduced."
      source="theme/src/components/glass-card/glass-card.tsx"
    >
      <ShowcaseStage<GlassCardSceneData>
        label="Glass card demo"
        story={() => import("../layout/ShowcaseStage.glass-card")}
        initial={{ level: 1, tint: false }}
      >
        {(scene) => <GlassCardScene scene={scene} />}
      </ShowcaseStage>

      <Example
        title="Card with header, content and footer"
        stageClassName="min-h-80"
        code={`
import {
  Button,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard className="w-full max-w-sm">
      <GlassCardHeader>
        <GlassCardTitle>Team plan</GlassCardTitle>
        <GlassCardDescription>Everything your team needs to ship.</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <p className="text-4xl font-semibold">$29<span className="text-sm">/mo</span></p>
      </GlassCardContent>
      <GlassCardFooter>
        <Button fullWidth>Upgrade</Button>
      </GlassCardFooter>
    </GlassCard>
  );
}`}
      >
        <GlassCard className="w-full max-w-sm">
          <GlassCardHeader>
            <GlassCardTitle>Team plan</GlassCardTitle>
            <GlassCardDescription>Everything your team needs to ship.</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-4xl font-semibold tracking-tight">
              $29<span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
            </p>
          </GlassCardContent>
          <GlassCardFooter>
            <Button fullWidth>Upgrade</Button>
          </GlassCardFooter>
        </GlassCard>
      </Example>

      <Example
        title="Levels, tint and interactive"
        description="Interactive cards lift on hover; tinted cards carry a hint of the accent color."
        stageClassName="min-h-64"
        code={`
import { GlassCard } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <GlassCard level={1} className="p-5">Level 1</GlassCard>
      <GlassCard level={2} interactive className="p-5">Level 2 · interactive</GlassCard>
      <GlassCard level={3} tint className="p-5">Level 3 · tint</GlassCard>
    </>
  );
}`}
      >
        <GlassCard level={1} className="w-44 p-5 text-sm font-medium">
          Level 1
        </GlassCard>
        <GlassCard level={2} interactive className="w-44 p-5 text-sm font-medium">
          Level 2 · interactive
        </GlassCard>
        <GlassCard level={3} tint className="w-44 p-5 text-sm font-medium">
          Level 3 · tint
        </GlassCard>
      </Example>

      <PropsTable of={PROPS.GlassCard} />
      <PropsTable of={PROPS.GlassCardTitle} title="GlassCardTitle props" as="h3" />
      <KeyboardTable
        rows={[
          [
            "Tab",
            'Not focusable: a plain card is not interactive. Buttons and links inside it keep their own tab stops. For a clickable card give it role="link" or role="button" and a tabIndex.',
          ],
        ]}
      />
      <A11yNotes
        items={[
          "Plain markup with no role, so reading order is the DOM order.",
          "Glass levels keep text at 4.5:1 over any backdrop; reduced transparency makes the card opaque, and forced colors give it a real border.",
          "The sheen is a soft highlight that follows a mouse or pen (never on touch). The hover lift is off with reduced motion.",
        ]}
      />
    </Page>
  );
}
