import { useState } from "react";
import { Select } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { SelectScene as SelectSceneData } from "../layout/ShowcaseStage.select";
import { SelectScene } from "../layout/ShowcaseStage.select.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

const dot = (color: string) => <span aria-hidden className="size-2.5 rounded-full" style={{ background: color }} />;

const frameworks = [
  { value: "react", label: "React", description: "UI library by Meta", icon: dot("#58c4dc") },
  { value: "vue", label: "Vue", description: "Progressive framework", icon: dot("#42b883") },
  { value: "svelte", label: "Svelte", description: "Compiles away", icon: dot("#ff3e00") },
  { value: "solid", label: "Solid", description: "Fine-grained reactivity", icon: dot("#4f88c6") },
  {
    value: "angular",
    label: "Angular",
    description: "Not available on your plan",
    icon: dot("#dd0031"),
    disabled: true,
  },
];

const regions = [
  { value: "bom", label: "Mumbai", description: "ap-south-1", group: "Asia Pacific" },
  { value: "sin", label: "Singapore", description: "ap-southeast-1", group: "Asia Pacific" },
  { value: "tyo", label: "Tokyo", description: "ap-northeast-1", group: "Asia Pacific" },
  { value: "fra", label: "Frankfurt", description: "eu-central-1", group: "Europe" },
  { value: "lon", label: "London", description: "eu-west-2", group: "Europe" },
  { value: "iad", label: "Virginia", description: "us-east-1", group: "Americas" },
  { value: "sfo", label: "San Francisco", description: "us-west-1", group: "Americas" },
];

const manyItems = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: `Item ${String(i + 1).padStart(4, "0")}`,
}));

/** The "Select" docs page (/components/select): live examples, props and notes. */
export function SelectPage() {
  const [value, setValue] = useState<string | null>("react");
  return (
    <Page
      eyebrow="Component"
      title="Select"
      description="A glass dropdown for picking one option. The chevron flips as it opens, items drift in one after another, and you can type to jump to an option. For search or multi-select, use Combobox."
      source="theme/src/components/select/select.tsx"
    >
      <ShowcaseStage<SelectSceneData>
        label="Select demo"
        story={() => import("../layout/ShowcaseStage.select")}
        initial={{ open: false, value: null }}
        minHeight="19rem"
      >
        {(scene, ctx) => <SelectScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Icons and descriptions"
        stageClassName="min-h-80"
        code={`
import { useState } from "react";
import { Select } from "@sheenui/theme";

const Dot = ({ color }: { color: string }) => <span aria-hidden className="size-2.5 rounded-full" style={{ background: color }} />;

export function Example() {
  const [value, setValue] = useState<string | null>("react");

  return (
    <Select
      label="Framework"
      items={[
        { value: "react", label: "React", description: "UI library by Meta", icon: <Dot color="#58c4dc" /> },
        { value: "vue", label: "Vue", description: "Progressive framework", icon: <Dot color="#42b883" /> },
        { value: "angular", label: "Angular", description: "Not available on your plan", disabled: true },
      ]}
      value={value}
      onValueChange={setValue}
    />
  );
}`}
      >
        <div className="w-72">
          <Select label="Framework" items={frameworks} value={value} onValueChange={setValue} />
        </div>
      </Example>

      <Example
        title="Grouped"
        stageClassName="min-h-96"
        code={`
import { Select } from "@sheenui/theme";

export function Example() {
  return (
    <Select
      label="Region"
      placeholder="Choose a region"
      items={[
        { value: "bom", label: "Mumbai", description: "ap-south-1", group: "Asia Pacific" },
        { value: "fra", label: "Frankfurt", description: "eu-central-1", group: "Europe" },
        { value: "iad", label: "Virginia", description: "us-east-1", group: "Americas" },
      ]}
    />
  );
}`}
      >
        <div className="w-72">
          <Select
            label="Region"
            placeholder="Choose a region"
            description="Where your data is stored."
            items={regions}
          />
        </div>
      </Example>

      <Example
        title="Thousands of options"
        description="Above 200 options the list is windowed on its own (virtualized defaults to auto); pass virtualized to force it. Only the rows near the viewport are in the DOM, yet Home, End, PageUp, PageDown and type-ahead reach every option and screen readers still hear 'item 3,000 of 5,000'. Press End, or type 'Item 4321'."
        stageClassName="min-h-80"
        code={`
import { Select } from "@sheenui/theme";

const items = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: \`Item \${String(i + 1).padStart(4, "0")}\`,
}));

export function Example() {
  return <Select label="Item" items={items} virtualized />;
}`}
      >
        <div className="w-72">
          <Select label="Item" items={manyItems} virtualized />
        </div>
      </Example>

      <Example
        title="Bottom sheet on phones"
        phonePreview
        description="mobile='sheet' opens the list as a bottom sheet under 640px wide: a drag handle you can swipe down, a scrolling body capped at 85dvh, safe-area padding and a dimmed scrim. The default, 'popup', keeps the floating list. Press “Preview on a phone” to try it on a desktop screen (or narrow the window)."
        stageClassName="min-h-80"
        code={`
import { Select } from "@sheenui/theme";

export function Example() {
  return (
    <Select
      label="Region"
      mobile="sheet"
      items={[
        { value: "bom", label: "Mumbai", description: "ap-south-1" },
        { value: "fra", label: "Frankfurt", description: "eu-central-1" },
        { value: "iad", label: "Virginia", description: "us-east-1" },
      ]}
    />
  );
}`}
      >
        <div className="w-72">
          <Select label="Region" mobile="sheet" items={regions} />
        </div>
      </Example>

      <PropsTable of={PROPS.Select} />
      <KeyboardTable
        rows={[
          ["Enter / Space / Arrow Down", "Open the list from the trigger."],
          ["Arrow Down / Arrow Up", "Move through the options."],
          ["Home / End", "Jump to the first or last option."],
          ["Type a letter", "Jump to the next option that starts with it."],
          ["Enter / Space", "Pick the highlighted option."],
          ["Escape", "Close the list and return focus to the trigger."],
        ]}
      />
      <A11yNotes
        items={[
          "A Base UI Select: the trigger is a combobox-style button with aria-expanded, the popup a listbox of options.",
          "label, description and error are linked to the trigger; the error is announced politely.",
          "name submits the value with a form. Pass aria-label when there is no visible label.",
        ]}
      />
    </Page>
  );
}
