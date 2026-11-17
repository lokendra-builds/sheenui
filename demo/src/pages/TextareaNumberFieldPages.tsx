import { useState } from "react";
import { Button, useToast } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { lazyBlock } from "../layout/lazy-block";
import { Example } from "../layout/Example";
import type { NumberFieldScene as NumberFieldSceneData } from "../layout/ShowcaseStage.number-field";
import { NumberFieldScene } from "../layout/ShowcaseStage.number-field.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { TextareaScene as TextareaSceneData } from "../layout/ShowcaseStage.textarea";
import { TextareaScene } from "../layout/ShowcaseStage.textarea.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { Textarea } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { icons } from "./FormKitPages/shared";

/* =====================================================================
 * Textarea
 * ===================================================================== */

export function TextareaPage() {
  const [post, setPost] = useState("Shipping glass components that stay readable is mostly about contrast budgets.");
  const [bio, setBio] = useState(
    "Designer and front-end developer in Lisbon. I care about motion that helps, contrast that holds up, and calm UI.",
  );
  const toast = useToast();
  const bioOver = bio.length > 120;

  return (
    <Page
      eyebrow="Form"
      title="Textarea"
      description="A glass multi-line field that grows with its content, with an optional character counter whose ring fills as you type. Label, description and error are wired up for screen readers, like Input."
      source="theme/src/components/textarea/textarea.tsx"
    >
      <ShowcaseStage<TextareaSceneData>
        label="Textarea demo"
        story={() => import("../layout/ShowcaseStage.textarea")}
        initial={{ text: "" }}
        minHeight="18rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <TextareaScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Auto-resize"
        description="Grows between minRows and maxRows, then scrolls. Measured off-screen, so the page never jumps while you type."
        code={`
import { Textarea } from "@sheenui/theme";

export function Example() {
  return (
    <Textarea
      label="Notes"
      placeholder="Write as much as you like…"
      description="Grows from 2 up to 8 lines."
      minRows={2}
      maxRows={8}
    />
  );
}`}
      >
        <div className="w-full max-w-md">
          <Textarea
            label="Notes"
            placeholder="Write as much as you like…"
            description="Grows from 2 up to 8 lines."
            minRows={2}
            maxRows={8}
          />
        </div>
      </Example>

      <Example
        title="Character limit"
        description="The counter turns amber near the limit and red at it; typing past the limit is blocked with a little shake. Screen readers hear the count with the field and a polite note at 20 and 10 characters left."
        code={`
import { useState } from "react";
import { Button, Textarea, useToast } from "@sheenui/theme";
import { Paperclip as PaperclipIcon, Smile as SmileIcon } from "lucide-react";

export function Example() {
  const [post, setPost] = useState("Shipping glass components that stay readable is mostly about contrast budgets.");
  const toast = useToast();

  return (
    <form
      className="flex w-full max-w-md flex-col items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Posted", \`\${post.length} characters\`);
      }}
    >
      <Textarea
        label="Post"
        value={post}
        onChange={(e) => setPost(e.target.value)}
        maxLength={140}
        minRows={2}
        footer={
          <>
            <Button variant="ghost" size="icon" type="button" aria-label="Attach a file" className="size-8 any-pointer-coarse:size-11">
              <PaperclipIcon />
            </Button>
            <Button variant="ghost" size="icon" type="button" aria-label="Add an emoji" className="size-8 any-pointer-coarse:size-11">
              <SmileIcon />
            </Button>
          </>
        }
      />
      <Button type="submit" disabled={post.trim() === ""}>
        Post
      </Button>
    </form>
  );
}`}
      >
        <form
          className="flex w-full max-w-md flex-col items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Posted", `${post.length} characters`);
          }}
        >
          <Textarea
            label="Post"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            maxLength={140}
            minRows={2}
            footer={
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label="Attach a file"
                  className="size-8 any-pointer-coarse:size-11"
                >
                  {icons.paperclip}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label="Add an emoji"
                  className="size-8 any-pointer-coarse:size-11"
                >
                  {icons.smile}
                </Button>
              </>
            }
          />
          <Button type="submit" disabled={post.trim() === ""}>
            Post
          </Button>
        </form>
      </Example>

      <Example
        title="Soft limit"
        description={
          'limit="warn" lets people keep typing and trim later: the field turns invalid and the counter shows how far over it is. This bio is a few characters short of the limit; keep typing.'
        }
        code={`
import { useState } from "react";
import { Textarea } from "@sheenui/theme";

export function Example() {
  const [bio, setBio] = useState("Designer and front-end developer in Lisbon. I care about motion that helps, contrast that holds up, and calm UI.");

  return (
    <Textarea
      label="Bio"
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      maxLength={120}
      limit="warn"
      error={bio.length > 120 ? "Keep your bio to 120 characters." : undefined}
      description="Shown on your public profile."
    />
  );
}`}
      >
        <div className="w-full max-w-md">
          <Textarea
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={120}
            limit="warn"
            error={bioOver ? "Keep your bio to 120 characters." : undefined}
            description="Shown on your public profile."
          />
        </div>
      </Example>

      <PropsTable of={PROPS.Textarea} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move focus to or from the textarea."],
          ["Type, select, undo", "Everything the native control does works."],
        ]}
      />
      <A11yNotes
        items={[
          "label, description, error and the character count are linked with aria-labelledby and aria-describedby; an error is announced politely.",
          "The character count sits in a polite live region. Text is 16 px on touch screens so iOS does not zoom.",
          "autoResize grows the field with its content and keeps the caret and scroll position.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Number field
 * ===================================================================== */

// The three live examples (with their code panels) are one island: NumberField and the Example chrome load after the page has hydrated.
const NumberFieldExamples = lazyBlock(() => import("./NumberFieldExamples").then((m) => m.NumberFieldExamples), {
  minHeight: "70rem",
});

export function NumberFieldPage() {
  return (
    <Page
      eyebrow="Form"
      title="Number field"
      description="A glass numeric input with steppers you can hold to repeat, a scrub label you can drag, and Intl formatting for currency, percentages and units. When the value steps, the digits that change roll like an odometer."
      source="theme/src/components/number-field/number-field.tsx"
    >
      <ShowcaseStage<NumberFieldSceneData>
        label="Number field demo"
        story={() => import("../layout/ShowcaseStage.number-field")}
        initial={{ quantity: 1 }}
        minHeight="16rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <NumberFieldScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <NumberFieldExamples />

      <PropsTable
        of={PROPS.NumberField}
        rows={[
          [
            "...props",
            "Base UI props",
            "",
            "Every other prop of Base UI's NumberField.Root is passed through, for example `form`, `id`, `inputRef`, `allowOutOfRange`, `allowWheelScrub` and `snapOnStep`.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Focus the input; the - and + buttons are not tab stops."],
          ["Arrow Up / Arrow Down", "Step the value (Shift: large step, Alt: small step)."],
          ["Home / End", "Jump to min or max."],
          ["Type, paste, clear", "Work as in any text field; the typed value is committed when the field loses focus."],
        ]}
      />
      <A11yNotes
        items={[
          'A text input with inputmode and aria-roledescription="Number field"; the - and + buttons are named by labels.decrement and labels.increment.',
          "An error is announced politely. Buttons are 44 px targets on touch screens.",
          "The odometer motion is decorative; under reduced motion digits change in place.",
        ]}
      />
    </Page>
  );
}
