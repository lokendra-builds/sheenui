import { useState } from "react";
import { Button } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { ButtonScene } from "../layout/ShowcaseStage.button";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

const Arrow = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-4 rtl:-scale-x-100"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** The "Button" docs page (/components/button): live examples, props and notes. */
export function ButtonPage() {
  const [loading, setLoading] = useState(false);

  return (
    <Page
      eyebrow="Component"
      title="Button"
      description="Lifts on hover, presses down on tap, and filled buttons catch a sweep of light. All movement turns off with reduced motion."
      source="theme/src/components/button/button.tsx"
    >
      <ShowcaseStage<ButtonScene>
        label="Button demo"
        story={() => import("../layout/ShowcaseStage.button")}
        initial={{ loading: false, pressed: false, saved: false }}
      >
        {(scene) => (
          <Button
            loading={scene.loading}
            data-stage-pressed={scene.pressed ? "" : undefined}
            className="min-w-44"
            trailing={
              scene.saved ? (
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
              ) : undefined
            }
          >
            {scene.loading ? "Saving" : scene.saved ? "Saved" : "Save changes"}
          </Button>
        )}
      </ShowcaseStage>

      <Example
        title="Variants"
        code={`
import { Button } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Button>Primary</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="danger">Delete</Button>
    </>
  );
}`}
      >
        <Button>Primary</Button>
        <Button variant="glass">Glass</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="danger">Delete</Button>
      </Example>

      <Example
        title="Sizes and icons"
        code={`
import { Button } from "@sheenui/theme";
import { ArrowRight as Arrow } from "lucide-react";

export function Example() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button size="md" trailing={<Arrow />}>Continue</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" variant="glass" aria-label="Next"><Arrow /></Button>
    </>
  );
}`}
      >
        <Button size="sm">Small</Button>
        <Button size="md" trailing={<Arrow />}>
          Continue
        </Button>
        <Button size="lg">Large</Button>
        <Button size="icon" variant="glass" aria-label="Next">
          <Arrow />
        </Button>
      </Example>

      <Example
        title="Loading and disabled"
        description="Loading shows a spinner, disables the button and sets aria-busy."
        code={`
import { useState } from "react";
import { Button } from "@sheenui/theme";

export function Example() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
        Save changes
      </Button>
      <Button disabled>Disabled</Button>
    </>
  );
}`}
      >
        <Button
          loading={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        >
          Save changes
        </Button>
        <Button disabled>Disabled</Button>
      </Example>

      <PropsTable
        of={PROPS.Button}
        rows={[
          [
            "render",
            "ReactElement",
            "",
            'Render as another element with the button\'s look, e.g. a router link: render={<Link to="/" />}.',
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move focus to or from the button (visible focus ring)."],
          ["Enter / Space", "Activate it. When render is a link, Enter follows the link like any link."],
        ]}
      />
      <A11yNotes
        items={[
          'A native <button type="button"> by default; with render it becomes a link or your router\'s Link with the same look.',
          "While loading, the button stays focusable (aria-disabled, aria-busy) and ignores clicks, so focus is never lost.",
          'An icon-only button (size="icon") needs an aria-label.',
          "Touch targets are at least 44 x 44 px; forced colors keep a ButtonText border.",
        ]}
      />
    </Page>
  );
}
