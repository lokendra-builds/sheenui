import { GlassCard, useToast } from "@sheenui/theme";
import {
  Toolbar,
  ToolbarButton,
  ToolbarInput,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { ToolbarScene as ToolbarSceneData } from "../layout/ShowcaseStage.toolbar";
import { ToolbarScene } from "../layout/ShowcaseStage.toolbar.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { I, icon } from "./LayoutPages/shared";
import {
  ToolbarEditorDemo,
  ToolbarVerticalDemo,
  toolbarEditorCode,
  toolbarFloatingCode,
  toolbarScrollCode,
  toolbarVerticalCode,
} from "./LayoutPages/toolbar";

/** The "Toolbar" docs page (/layout/toolbar): live examples, props and notes. */
export function ToolbarPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Layout"
      title="Toolbar"
      description="A row of related controls with a single tab stop: the arrow keys move between buttons, toggles, menus and links. Single-choice groups slide one accent pill between options; independent toggles bloom their own tint."
      source="theme/src/components/toolbar/toolbar.tsx"
    >
      <ShowcaseStage<ToolbarSceneData>
        label="Toolbar demo"
        story={() => import("../layout/ShowcaseStage.toolbar")}
        initial={{ styles: "" }}
        minHeight="14rem"
      >
        {(scene, ctx) => <ToolbarScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Text editor"
        description="Tab into the toolbar once, then use the arrow keys (Home and End jump). The disabled Redo stays focusable so it can be discovered. Try the formatting on the paragraph below."
        code={toolbarEditorCode}
        stageClassName="items-stretch"
      >
        <ToolbarEditorDemo />
      </Example>

      <Example
        title="Floating selection toolbar"
        description='variant="floating" is a glass pill for selection menus and canvases.'
        code={toolbarFloatingCode}
      >
        <GlassCard className="relative w-full max-w-lg p-6 pt-20">
          <div className="absolute inset-x-0 top-5 flex justify-center px-4">
            <Toolbar variant="floating" size="sm" aria-label="Selection">
              <ToolbarToggleGroup multiple aria-label="Text style">
                <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b">
                  {icon(I.bold)}
                </ToolbarToggle>
                <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i">
                  {icon(I.italic)}
                </ToolbarToggle>
              </ToolbarToggleGroup>
              <ToolbarButton tooltip="Link" shortcut="mod+k" onClick={() => toast.info("Link")}>
                {icon(I.link)}
              </ToolbarButton>
              <ToolbarButton tooltip="Comment" onClick={() => toast.info("Comment")}>
                {icon(I.comment)}
              </ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => toast.info("Ask AI")}>
                {icon(I.sparkle)}
                Ask AI
              </ToolbarButton>
            </Toolbar>
          </div>
          <p className="text-sm leading-relaxed text-sheen-fg-muted">
            Liquid glass bends the light behind it.{" "}
            <mark className="rounded-[0.2em] bg-sheen-accent-soft px-0.5 text-sheen-fg">Keep the text readable</mark> by
            layering a tinted, near-opaque surface under every label.
          </p>
        </GlassCard>
      </Example>

      <Example
        title="Vertical tool palette"
        description="Up and Down move between tools; the tooltips open to the side."
        code={toolbarVerticalCode}
      >
        <ToolbarVerticalDemo />
      </Example>

      <Example
        title="Narrow screens"
        description='overflow="scroll" keeps one row that scrolls sideways inside the toolbar; the default wraps onto more rows. Both stay inside their container at 320px.'
        code={toolbarScrollCode}
        stageClassName="items-stretch"
      >
        <div className="flex w-full flex-col items-start gap-6">
          <div className="w-full max-w-xs">
            <Toolbar overflow="scroll" aria-label="Formatting (scrolls)" className="w-full">
              <ToolbarToggleGroup multiple aria-label="Text style">
                <ToolbarToggle value="bold" tooltip="Bold">
                  {icon(I.bold)}
                </ToolbarToggle>
                <ToolbarToggle value="italic" tooltip="Italic">
                  {icon(I.italic)}
                </ToolbarToggle>
                <ToolbarToggle value="underline" tooltip="Underline">
                  {icon(I.underline)}
                </ToolbarToggle>
                <ToolbarToggle value="strike" tooltip="Strikethrough">
                  {icon(I.strike)}
                </ToolbarToggle>
              </ToolbarToggleGroup>
              <ToolbarSeparator />
              <ToolbarToggleGroup required defaultValue={["left"]} aria-label="Alignment">
                <ToolbarToggle value="left" tooltip="Align left">
                  {icon(I.alignLeft)}
                </ToolbarToggle>
                <ToolbarToggle value="center" tooltip="Align center">
                  {icon(I.alignCenter)}
                </ToolbarToggle>
                <ToolbarToggle value="right" tooltip="Align right">
                  {icon(I.alignRight)}
                </ToolbarToggle>
              </ToolbarToggleGroup>
              <ToolbarSeparator />
              <ToolbarButton tooltip="Quote">{icon(I.quote)}</ToolbarButton>
              <ToolbarButton tooltip="Insert link">{icon(I.link)}</ToolbarButton>
              <ToolbarButton tooltip="Insert image">{icon(I.image)}</ToolbarButton>
            </Toolbar>
          </div>
          <Toolbar aria-label="Find" size="sm">
            <ToolbarButton tooltip="Previous match">{icon(I.chevron, "rotate-180")}</ToolbarButton>
            <ToolbarButton tooltip="Next match">{icon(I.chevron)}</ToolbarButton>
            <ToolbarSeparator />
            <ToolbarInput aria-label="Search in document" placeholder="Search" />
          </Toolbar>
        </div>
      </Example>

      <PropsTable
        title="Toolbar"
        of={PROPS.Toolbar}
        rows={[
          ["loopFocus", "boolean", "true", "Arrow keys wrap from the last control to the first."],
          ["disabled", "boolean", "false", "Disables every control in the toolbar."],
          ["aria-label", "string", "", "Name of the toolbar (required when there is more than one)."],
        ]}
      />
      <PropsTable
        title="ToolbarButton / ToolbarToggle"
        as="h3"
        of={[PROPS.ToolbarButton, PROPS.ToolbarToggle]}
        rows={[
          ["disabled", "boolean", "false", "Dimmed but still focusable."],
          ["render", "ReactElement", "", "ToolbarButton: render as a popup trigger, e.g. <MenuTrigger />."],
          ["value", "string", "", "Names the ToolbarToggle inside a ToolbarToggleGroup."],
          [
            "pressed / defaultPressed / onPressedChange",
            "boolean / boolean / (pressed) => void",
            "",
            "ToolbarToggle on its own.",
          ],
        ]}
      />
      <PropsTable
        title="ToolbarToggleGroup"
        as="h3"
        of={PROPS.ToolbarToggleGroup}
        rows={[
          ["value / defaultValue", "string[]", "", "Values of the buttons that are pressed (controlled or initial)."],
          ["onValueChange", "(value: string[]) => void", "", "Called with the new pressed values."],
          ["aria-label", "string", "", "Name of the group, e.g. “Alignment”."],
        ]}
      />
      <PropsTable
        title="ToolbarGroup, ToolbarSeparator, ToolbarSpacer, ToolbarLink, ToolbarInput"
        as="h3"
        rows={[
          ["ToolbarGroup", "aria-label, disabled", "", "A labeled cluster of controls."],
          ["ToolbarSeparator", "className", "", "Draws a hairline between clusters, perpendicular to the toolbar."],
          ["ToolbarSpacer", "className", "", "Pushes what follows to the far end."],
          ["ToolbarLink", "href, render", "", "A link in the arrow-key order (render your router's Link)."],
          [
            "ToolbarInput",
            "input props",
            "",
            "A text field; at most one, as the last control. 16px text on touch screens.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Enter or leave the toolbar once (one tab stop)."],
          ["Arrow Left / Arrow Right (Up / Down when vertical)", "Move between controls."],
          [
            "Home / End",
            "Jump to the first / last control (also from a disabled control; in a text field the keys move the caret).",
          ],
          ["Enter / Space", "Press a button or toggle."],
        ]}
      />
      <A11yNotes
        items={[
          'role="toolbar" with roving focus (Base UI): name it with aria-label and set orientation to match.',
          'Toggles use aria-pressed; a toolbar toggle group is role="group" and needs its own aria-label.',
          "tooltip and shortcut add a tooltip and aria-keyshortcuts; an icon-only button needs a tooltip or aria-label.",
        ]}
      />
    </Page>
  );
}
