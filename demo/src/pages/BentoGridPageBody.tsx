import { Badge } from "@sheenui/theme";
import {
  BentoAvatarDemo,
  BentoCell,
  BentoChartDemo,
  BentoGrid,
  BentoOtpDemo,
  BentoSwitchDemo,
  FeatureBento,
} from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { BlockStage } from "../layout/ShowcaseStage.block.scene";
import { press } from "../layout/ShowcaseStage.block.drive";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import * as PROPS from "../generated/component-props";

export function BentoGridPage() {
  return (
    <Page
      eyebrow="Block"
      title="Bento grid"
      description="An asymmetric feature grid whose cells run live mini-demos built from real SheenUI components: a sparkline that morphs between periods, a stacking toast pile, an OTP field, glass switches and an avatar group. Each demo mounts the first time its cell scrolls into view, so its entrance plays when someone can see it."
      source="theme/src/blocks/bento-grid.tsx"
    >
      <BlockStage
        label="Bento grid demo"
        story="tour"
        width={1000}
        height={1038}
        fit={540}
        actions={[press("Last 30 days"), press("Send notification"), press("Last 90 days")]}
      >
        <FeatureBento
          title="Everything you need, already moving"
          description="Live components, not screenshots. Try them."
          headingLevel="none"
        />
      </BlockStage>
      <Example
        title="Feature bento"
        description="The ready-made block. Every cell is interactive: pick a period, hover or focus the toasts to fan them out, type 2468, flip the switches, invite a teammate."
        stageClassName="p-3 sm:p-8"
        code={`
import { FeatureBento } from "@sheenui/theme";

<FeatureBento
  title="Everything you need, already moving"
  description="Live components, not screenshots. Try them."
/>`}
      >
        <FeatureBento
          title="Everything you need, already moving"
          description="Live components, not screenshots. Try them."
          headingLevel="none"
        />
      </Example>

      <Example
        title="Compose your own"
        description="BentoGrid lays cells out by its own width (1, 2, then 3 columns); spans shrink with it, so nothing overflows. Put any visual in a cell, built-in demos included."
        stageClassName="p-3 sm:p-8"
        code={`
import { BentoGrid, BentoCell, BentoChartDemo, BentoOtpDemo, BentoSwitchDemo, BentoAvatarDemo } from "@sheenui/theme";

<BentoGrid>
  <BentoCell index={0} colSpan={2} title="Revenue at a glance" description="…" visual={<BentoChartDemo />} href="#demo-analytics" cta="Open analytics" />
  <BentoCell index={1} title="Passwordless" description="…" visual={<BentoOtpDemo code="1357" />} />
  <BentoCell index={2} title="Tune the glass" visual={<BentoSwitchDemo />} />
  <BentoCell index={3} title="Your team, live" visual={<BentoAvatarDemo />} />
  <BentoCell index={4} title="Any visual" visual={<img src="/artwork.svg" alt="" className="size-full object-cover" />} />
</BentoGrid>`}
      >
        <BentoGrid>
          <BentoCell
            headingLevel="none"
            index={0}
            colSpan={2}
            title="Revenue at a glance"
            description="A count-up total, a change badge and a trend line that redraws for each period."
            visual={<BentoChartDemo labels={{ metric: "Monthly revenue" }} />}
            href="#"
            cta="Open analytics"
          />
          <BentoCell
            headingLevel="none"
            index={1}
            title="Passwordless"
            description="Sign in with a code. This one is 1357."
            visual={<BentoOtpDemo code="1357" />}
          />
          <BentoCell
            headingLevel="none"
            index={2}
            title="Tune the glass"
            description="Frost, tint and float."
            visual={<BentoSwitchDemo />}
          />
          <BentoCell
            headingLevel="none"
            index={3}
            title="Your team, live"
            description="See who is here and bring in more people."
            visual={<BentoAvatarDemo people={["Ana Ruiz", "Kenji Sato", "Lena Vogel", "Sam Okafor"]} extra={4} />}
          />
          <BentoCell
            headingLevel="none"
            index={4}
            title="Any visual"
            description="Cells take any content: artwork, a chart, a product shot."
            visual={
              <div className="flex flex-wrap justify-center gap-2">
                <Badge tone="accent">Glass</Badge>
                <Badge tone="success" dot>
                  Motion
                </Badge>
                <Badge tone="warning">A11y</Badge>
                <Badge>Tokens</Badge>
              </div>
            }
          />
        </BentoGrid>
      </Example>

      <PropsTable title="FeatureBento" of={PROPS.FeatureBento} />
      <PropsTable title="BentoGrid" of={PROPS.BentoGrid} />
      <PropsTable title="BentoCell" of={PROPS.BentoCell} />
      <PropsTable
        title="Demos"
        rows={[
          [
            "BentoChartDemo",
            "{ data?, currency?, locale?, labels? }",
            "",
            'Sparkline with a period picker and a count-up total. data maps a period key ("7d") to { total, change, values }.',
          ],
          [
            "BentoToastDemo",
            "{ notifications?, labels? }",
            "",
            "Three toasts arrive on their own, then a button sends more. Hover, focus or tap fans the stack out.",
          ],
          [
            "BentoOtpDemo",
            "{ code?, labels? }",
            '"2468"',
            "OTP field that verifies against code and shakes on a miss.",
          ],
          ["BentoSwitchDemo", "{ labels? }", "", "Switches that frost, tint and float a glass tile over crisp shapes."],
          [
            "BentoAvatarDemo",
            "{ people?, extra?, labels? }",
            "",
            "Avatar group with presence and an invite button; extra shows a “+N” chip.",
          ],
          [
            "useBentoCellVisible",
            "() => boolean",
            "",
            "Inside a cell: false while it is off screen, so your own loops can pause.",
          ],
        ]}
      />
      <PropsTable of={PROPS.BentoAvatarDemo} title="BentoAvatarDemo props" as="h3" />
      <PropsTable of={PROPS.BentoChartDemo} title="BentoChartDemo props" as="h3" />
      <PropsTable of={PROPS.BentoOtpDemo} title="BentoOtpDemo props" as="h3" />
      <PropsTable of={PROPS.BentoSwitchDemo} title="BentoSwitchDemo props" as="h3" />
      <PropsTable of={PROPS.BentoToastDemo} title="BentoToastDemo props" as="h3" />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Visit the controls inside each demo cell in reading order; a cell's optional link is the only tab stop the cell itself adds.",
          ],
          ["Space", "Toggle a switch in the switch demo."],
          ["0–9 / Backspace", "Type or step back in the OTP demo; “Try again” is a button."],
        ]}
      />
      <A11yNotes
        notes={[
          "BentoGrid is a plain layout <div> with no semantics; each cell carries its own heading and text.",
          "The avatar group has a text name and “+N” has a long form for screen readers; changes are announced.",
          "The switch demo uses real switches with visible labels.",
        ]}
      />
    </Page>
  );
}
