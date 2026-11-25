import { useState } from "react";
import { Input } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { InputScene as InputSceneData } from "../layout/ShowcaseStage.input";
import { InputScene } from "../layout/ShowcaseStage.input.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

const Search = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** The "Input" docs page (/components/input): live examples, props and notes. */
export function InputPage() {
  const [email, setEmail] = useState("hello@");

  return (
    <Page
      eyebrow="Component"
      title="Input"
      description="A glass text field with label, description and error message wired up for screen readers by Base UI's Field. Focus brings a soft accent glow."
      source="theme/src/components/input/input.tsx"
    >
      <ShowcaseStage<InputSceneData>
        label="Input demo"
        story={() => import("../layout/ShowcaseStage.input")}
        initial={{ value: "", touched: false }}
      >
        {(scene, ctx) => <InputScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Label, description and icon"
        code={`
import { Input } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  return (
    <Input
      label="Search"
      placeholder="Find components…"
      description="Press / to focus from anywhere."
      leading={<SearchIcon />}
    />
  );
}`}
      >
        <div className="w-full max-w-sm">
          <Input
            label="Search"
            placeholder="Find components…"
            description="Press / to focus from anywhere."
            leading={<Search />}
          />
        </div>
      </Example>

      <Example
        title="Validation"
        description="Pass error to mark the field invalid; the message is linked to the input and announced."
        code={`
import { useState } from "react";
import { Input } from "@sheenui/theme";

export function Example() {
  const [email, setEmail] = useState("hello@");
  const error = /^\\S+@\\S+\\.\\S+$/.test(email) ? undefined : "Enter a valid email address.";

  return (
    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
  );
}`}
      >
        <div className="w-full max-w-sm">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={/^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter a valid email address."}
          />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="sm (32px), md (40px, default) and lg (48px): the same scale as Button, so a button beside an input lines up. On touch screens sm and md are 44px."
        code={`
import { Input } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input size="md" placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
    </div>
  );
}`}
      >
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Input size="sm" placeholder="Small" aria-label="Small" />
          <Input size="md" placeholder="Medium" aria-label="Medium" />
          <Input size="lg" placeholder="Large" aria-label="Large" />
        </div>
      </Example>

      <PropsTable of={PROPS.Input} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move focus to or from the input."],
          ["Type, select, paste", "Everything the native input does works, including autofill and undo."],
        ]}
      />
      <A11yNotes
        items={[
          "label, description and error are linked with aria-labelledby and aria-describedby; an error is announced politely.",
          "Icons and affixes are decorative (aria-hidden); the input keeps its own name.",
          "Text is 16 px on touch screens so iOS does not zoom on focus; the border keeps 3:1 contrast.",
        ]}
      />
    </Page>
  );
}
