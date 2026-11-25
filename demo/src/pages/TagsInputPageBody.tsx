import { useState } from "react";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { TagsInputScene as TagsInputSceneData } from "../layout/ShowcaseStage.tags-input";
import { TagsInputScene } from "../layout/ShowcaseStage.tags-input.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { TagsInput } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";

/* =====================================================================
 * Tags input
 * ===================================================================== */

const SKILLS = [
  { value: "React", description: "UI library" },
  { value: "TypeScript", description: "Typed JavaScript" },
  { value: "Tailwind CSS", description: "Utility-first CSS" },
  { value: "Motion", description: "Animation library" },
  { value: "Base UI", description: "Unstyled primitives" },
  { value: "Node.js", description: "JavaScript runtime" },
  { value: "GraphQL" },
  { value: "PostgreSQL" },
  { value: "Design" },
  { value: "Accessibility" },
  { value: "Testing Library" },
  { value: "Vite" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The "Tags input" docs page (/forms/tags-input): live examples, props and notes. */
export function TagsInputPage() {
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);

  return (
    <Page
      eyebrow="Form"
      title="Tags input"
      description="Type and press Enter or a comma to turn text into a chip. Paste a list to add many at once, walk the chips with the arrow keys and remove them with Backspace. Duplicates make the existing chip pulse."
      source="theme/src/components/tags-input/tags-input.tsx"
    >
      <ShowcaseStage<TagsInputSceneData>
        label="Tags input demo"
        story={() => import("../layout/ShowcaseStage.tags-input")}
        initial={{ tags: ["design"] }}
        minHeight="16rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <TagsInputScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Basic"
        description="Enter or comma adds; Backspace at the start selects the last tag, a second Backspace removes it. Try pasting “glass, motion; a11y”."
        stageClassName="items-start"
        code={`
import { TagsInput } from "@sheenui/theme";

export function Example() {
  return (
    <TagsInput
      label="Topics"
      defaultValue={["design", "motion"]}
      placeholder="Add a topic…"
      description="Press Enter or comma to add."
    />
  );
}`}
      >
        <TagsInput
          label="Topics"
          defaultValue={["design", "motion"]}
          placeholder="Add a topic…"
          description="Press Enter or comma to add."
          className="max-w-md"
        />
      </Example>

      <Example
        title="Suggestions and a limit"
        description="Suggestions open under the field while you type (or on click). Matching text is highlighted; the counter turns accent at the limit."
        stageClassName="items-start"
        code={`
import { useState } from "react";
import { TagsInput } from "@sheenui/theme";

export function Example() {
  const [skills, setSkills] = useState(["React", "TypeScript"]);

  return (
      <TagsInput
        label="Skills"
        value={skills}
        onValueChange={setSkills}
        suggestions={[{ value: "React", description: "UI library" }, "GraphQL", "Node.js", "PostgreSQL"]}
        max={6}
        placeholder="Search or add a skill…"
      />
  );
}`}
      >
        <div className="flex w-full max-w-md flex-col gap-3">
          <TagsInput
            label="Skills"
            value={skills}
            onValueChange={setSkills}
            suggestions={SKILLS}
            max={6}
            placeholder="Search or add a skill…"
          />
          <p className="text-xs text-sheen-fg-muted">
            Value: <code className="font-sheen-mono">{JSON.stringify(skills)}</code>
          </p>
        </div>
      </Example>

      <Example
        title="Validation"
        description="Your own rule plus built-ins: each address must be valid and unique, lower-cased on the way in. Paste a whole list: the bad ones are reported, the rest are added."
        stageClassName="items-start"
        code={`
import { TagsInput } from "@sheenui/theme";

const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export function Example() {
  return (
    <TagsInput
      label="Invite by email"
      placeholder="name@example.com"
      delimiters={[",", " ", ";"]}
      transform={(t) => t.trim().toLowerCase()}
      validate={(t) => (EMAIL.test(t) ? null : \`“\${t}” isn’t an email address.\`)}
      max={10}
      name="invites"
    />
  );
}`}
      >
        <TagsInput
          label="Invite by email"
          placeholder="name@example.com"
          delimiters={[",", " ", ";"]}
          transform={(t) => t.trim().toLowerCase()}
          validate={(t) => (EMAIL.test(t) ? null : `“${t}” isn’t an email address.`)}
          max={10}
          name="invites"
          description="Separate addresses with commas, spaces or new lines."
          className="max-w-md"
        />
      </Example>

      <PropsTable of={PROPS.TagsInput} />
      <KeyboardTable
        rows={[
          ["Enter / ,", "Add what you typed (or the highlighted suggestion)."],
          ["Backspace", "At the start of the field, select the last tag; press again to remove it."],
          ["Arrow Left / Arrow Right", "From the start of the field, walk the tags (flipped in right-to-left pages)."],
          ["Backspace / Delete on a tag", "Remove it; focus moves to the neighboring tag."],
          ["Any letter on a tag", "Jump back to the field and type."],
          ["Paste", '"a, b; c" (or one per line) adds several tags.'],
        ]}
      />
      <A11yNotes
        items={[
          'The field is a labeled input with a hidden keyboard hint; each tag has a name and a remove button ("Remove React").',
          "Added, removed and rejected tags (duplicate, too long, over max) are announced politely, and the error is linked to the field.",
          "During IME composition Enter confirms the text and never adds a tag.",
        ]}
      />
    </Page>
  );
}
