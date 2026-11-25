import { useState, type ReactNode } from "react";
import { Avatar, Button, Combobox, GlassCard, Input, useToast, type ComboboxOption } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { ComboboxScene as ComboboxSceneData } from "../layout/ShowcaseStage.combobox";
import { ComboboxScene } from "../layout/ShowcaseStage.combobox.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

const manyOptions: ComboboxOption[] = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: `Item ${String(i + 1).padStart(4, "0")}`,
  group: i < 2500 ? "First half" : "Second half",
}));

const flag = (emoji: string) => (
  <span aria-hidden className="text-base leading-none">
    {emoji}
  </span>
);

const countries: ComboboxOption[] = [
  { value: "in", label: "India", icon: flag("🇮🇳"), description: "+91" },
  { value: "us", label: "United States", icon: flag("🇺🇸"), description: "+1" },
  { value: "gb", label: "United Kingdom", icon: flag("🇬🇧"), description: "+44" },
  { value: "de", label: "Germany", icon: flag("🇩🇪"), description: "+49" },
  { value: "jp", label: "Japan", icon: flag("🇯🇵"), description: "+81" },
  { value: "br", label: "Brazil", icon: flag("🇧🇷"), description: "+55" },
  { value: "ae", label: "United Arab Emirates", icon: flag("🇦🇪"), description: "+971" },
  { value: "sg", label: "Singapore", icon: flag("🇸🇬"), description: "+65" },
];

const skills: ComboboxOption[] = [
  { value: "py", label: "Python", group: "Languages" },
  { value: "ts", label: "TypeScript", group: "Languages" },
  { value: "go", label: "Go", group: "Languages" },
  { value: "rs", label: "Rust", group: "Languages" },
  { value: "django", label: "Django", group: "Frameworks" },
  { value: "react", label: "React", group: "Frameworks" },
  { value: "fastapi", label: "FastAPI", group: "Frameworks" },
  { value: "temporal", label: "Temporal", group: "Infrastructure" },
  { value: "postgres", label: "PostgreSQL", group: "Infrastructure" },
  { value: "docker", label: "Docker", group: "Infrastructure" },
];

const tags: ComboboxOption[] = [
  { value: "design", label: "design" },
  { value: "frontend", label: "frontend" },
  { value: "bug", label: "bug" },
  { value: "urgent", label: "urgent" },
];

const people = [
  "Ada Lovelace",
  "Asha Verma",
  "Ravi Kumar",
  "Meera Iyer",
  "Kabir Shah",
  "Sara Khan",
  "John Doe",
  "Priya Nair",
  "Arjun Mehta",
  "Neha Gupta",
  "Vikram Rao",
  "Ananya Das",
];

/** Pretend API: filters on the "server" after a short delay. */
async function searchPeople(query: string): Promise<ComboboxOption[]> {
  await new Promise((r) => setTimeout(r, 600));
  return people
    .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
    .map((name) => ({
      value: name.toLowerCase().replace(/\s+/g, "-"),
      label: name,
      description: `${(name.split(" ")[0] ?? name).toLowerCase()}@example.com`,
      icon: <Avatar name={name} size="sm" className="[&>span]:size-6 [&>span]:text-[0.6rem]" />,
    }));
}

/** A small form card, so each example sits in the kind of screen it would really live in. */
function FormCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <GlassCard level={2} className="flex w-full max-w-md flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-sheen-fg-muted">{description}</p>
      </div>
      {children}
      <div className="flex justify-end">{action}</div>
    </GlassCard>
  );
}

const frameStage = "min-h-[30rem] items-start justify-center sm:p-8";

/** The "Combobox (Select2)" docs page (/components/combobox): live examples, props and notes. */
export function ComboboxPage() {
  const toast = useToast();
  const [country, setCountry] = useState<string | null>("in");
  const [picked, setPicked] = useState<string[]>(["py", "django", "react"]);
  const loadPeople = searchPeople;

  return (
    <Page
      eyebrow="Component"
      title="Combobox (Select2)"
      description="A searchable select, like the classic Select2: type to filter, pick one or many as animated chips, group options, create new ones, or search a server as you type. Built on Base UI's accessible Combobox."
      source="theme/src/components/combobox/combobox.tsx"
    >
      <ShowcaseStage<ComboboxSceneData>
        label="Combobox demo"
        story={() => import("../layout/ShowcaseStage.combobox")}
        initial={{ picked: [] }}
        minHeight="19rem"
      >
        {(scene, ctx) => <ComboboxScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Searchable, single"
        description="Type to filter. Arrow keys move, Enter picks, Escape closes."
        frame="example.com/checkout/shipping"
        stageClassName={frameStage}
        code={`
import { useState } from "react";
import { Combobox } from "@sheenui/theme";

export function Example() {
  const [country, setCountry] = useState<string | null>("in");

  return (
    <Combobox
      label="Country"
      placeholder="Search countries…"
      options={[
        { value: "in", label: "India", icon: "🇮🇳", description: "+91" },
        { value: "us", label: "United States", icon: "🇺🇸", description: "+1" },
        { value: "gb", label: "United Kingdom", icon: "🇬🇧", description: "+44" },
        { value: "de", label: "Germany", icon: "🇩🇪", description: "+49" },
      ]}
      value={country}
      onValueChange={setCountry}
    />
  );
}`}
      >
        <FormCard
          title="Shipping"
          description="Where should we send your order?"
          action={<Button onClick={() => toast.success("Saved", "Shipping country updated.")}>Continue</Button>}
        >
          <Combobox
            label="Country"
            placeholder="Search countries…"
            options={countries}
            value={country}
            onValueChange={setCountry}
          />
        </FormCard>
      </Example>

      <Example
        title="Multiple with chips, groups and a limit"
        description="Chips pop in and out. Backspace removes the last one; Left Arrow moves into the chips."
        frame="example.com/profile"
        stageClassName={frameStage}
        code={`
import { useState } from "react";
import { Combobox } from "@sheenui/theme";

export function Example() {
  const [picked, setPicked] = useState<string[]>(["py", "django", "react"]);

  return (
    <Combobox
      multiple
      maxSelected={5}
      label="Skills"
      options={[
        { value: "py", label: "Python", group: "Languages" },
        { value: "django", label: "Django", group: "Frameworks" },
        { value: "temporal", label: "Temporal", group: "Infrastructure" },
        { value: "react", label: "React", group: "Frameworks" },
        { value: "postgres", label: "PostgreSQL", group: "Infrastructure" },
      ]}
      value={picked}
      onValueChange={setPicked}
    />
  );
}`}
      >
        <FormCard
          title="Your profile"
          description="Skills show on your public profile."
          action={<Button onClick={() => toast.success("Profile saved")}>Save</Button>}
        >
          <Combobox
            multiple
            maxSelected={5}
            label="Skills"
            description="Pick up to 5."
            placeholder="Search skills…"
            options={skills}
            value={picked}
            onValueChange={setPicked}
          />
        </FormCard>
      </Example>

      <Example
        title="Creatable tags"
        description="Type something new and choose “Create …” to add it."
        frame="example.com/issues/new"
        stageClassName={frameStage}
        code={`
import { Combobox, type ComboboxOption } from "@sheenui/theme";

const tags: ComboboxOption[] = [
  { value: "design", label: "design" },
  { value: "frontend", label: "frontend" },
  { value: "bug", label: "bug" },
  { value: "urgent", label: "urgent" },
];

export function Example() {
  return (
    <Combobox
      multiple
      label="Labels"
      options={tags}
      defaultValue={["design"]}
      onCreate={(label) => ({ value: label.toLowerCase(), label })}
    />
  );
}`}
      >
        <FormCard
          title="New issue"
          description="Label it so the right people see it."
          action={<Button onClick={() => toast.success("Issue created")}>Create issue</Button>}
        >
          <Input label="Title" defaultValue="Glass looks gray on a flat background" />
          <Combobox
            multiple
            label="Labels"
            placeholder="Add labels…"
            options={tags}
            defaultValue={["design"]}
            onCreate={(label) => {
              toast.success("Label created", `“${label}” was added.`);
              return { value: label.toLowerCase(), label };
            }}
          />
        </FormCard>
      </Example>

      <Example
        title="Async search"
        description="Results come from a (pretend) server as you type, with a loading state. Try “ra” or “sh”."
        frame="example.com/settings/members"
        stageClassName={frameStage}
        code={`
import { Combobox } from "@sheenui/theme";

export function Example() {
  return (
    <Combobox
      multiple
      label="Invite people"
      placeholder="Search by name…"
      loadOptions={async (query) => {
        const res = await fetch(\`/api/people?q=\${encodeURIComponent(query)}\`);
        return res.json(); // [{ value, label, description?, icon? }]
      }}
    />
  );
}`}
      >
        <FormCard
          title="Invite to workspace"
          description="They get an email with a link to join."
          action={<Button onClick={() => toast.success("Invites sent")}>Send invites</Button>}
        >
          <Combobox multiple label="Invite people" placeholder="Search by name…" loadOptions={loadPeople} />
        </FormCard>
      </Example>

      <Example
        title="Thousands of options"
        description="Windowed above 200 options (virtualized defaults to auto): filtering runs over all 5,000, only the visible rows are in the DOM, the arrow keys and aria-activedescendant follow the active option, and group headings stay in order. Type 'Item 4999' or arrow down."
        stageClassName="min-h-96"
        code={`
import { Combobox } from "@sheenui/theme";

const options = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: \`Item \${String(i + 1).padStart(4, "0")}\`,
  group: i < 2500 ? "First half" : "Second half",
}));

export function Example() {
  return <Combobox label="Item" options={options} virtualized />;
}`}
      >
        <div className="w-72">
          <Combobox label="Item" options={manyOptions} virtualized />
        </div>
      </Example>

      <PropsTable of={PROPS.Combobox} />
      <KeyboardTable
        rows={[
          ["Type", "Filter the options."],
          ["Arrow Down / Arrow Up", "Move through the options; Arrow Down opens the list."],
          ["Enter", "Pick the highlighted option (or create one, with onCreate)."],
          ["Escape", "Close the list; on a closed list it clears a single selection."],
          ["Backspace", "Multiple: remove the last chip when the input is empty."],
          ["Arrow Left / Arrow Right", "Multiple: move between the chips from the start of the input."],
        ]}
      />
      <A11yNotes
        items={[
          "The ARIA combobox pattern: an input with aria-expanded and aria-controls plus a listbox of options.",
          'Result counts, loading, errors and the "create" option are announced politely; focus never leaves the input.',
          "error marks the field invalid and is linked to it; chips have remove buttons with names.",
          "Without a visible label, pass aria-label or aria-labelledby. Every string is translatable through the label props.",
        ]}
      />
    </Page>
  );
}
