import { useState } from "react";
import { Button, Checkbox, Slider, Switch } from "@sheenui/theme";

const channels = [
  { key: "email", label: "Email", description: "Receipts and weekly summaries." },
  { key: "push", label: "Push notifications", description: "Mentions and replies." },
  { key: "sms", label: "Text messages", description: "Security alerts only." },
] as const;

import { Page, PropsTable } from "../layout/Page";
import type { SliderScene as SliderSceneData } from "../layout/ShowcaseStage.slider";
import { SliderScene } from "../layout/ShowcaseStage.slider.scene";
import type { CheckboxScene as CheckboxSceneData } from "../layout/ShowcaseStage.checkbox";
import { CheckboxScene } from "../layout/ShowcaseStage.checkbox.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { SwitchScene as SwitchSceneData } from "../layout/ShowcaseStage.switch";
import { SwitchScene } from "../layout/ShowcaseStage.switch.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { lazyBlock } from "../layout/lazy-block";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const island = { eager: true, minHeight: "80vh" };

/** The "Switch" docs page (/components/switch): live examples, props and notes. */
export function SwitchPage() {
  const [on, setOn] = useState(true);
  const [channelState, setChannelState] = useState({ email: true, push: true, sms: false });
  return (
    <Page
      eyebrow="Component"
      title="Switch"
      description="An on/off toggle whose thumb springs across a glass track that fills with the accent when on."
      source="theme/src/components/switch/switch.tsx"
    >
      <ShowcaseStage<SwitchSceneData>
        label="Switch demo"
        story={() => import("../layout/ShowcaseStage.switch")}
        initial={{ on: false }}
        initialState="off"
        onInterrupt="keep"
      >
        {(scene, ctx) => <SwitchScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="With label and description"
        // Signature motion, once in view: the thumb springs across and back (pixels only, nothing announces).
        autoplay={() => {
          setOn(false);
          const timer = window.setTimeout(() => setOn(true), 700);
          return () => {
            window.clearTimeout(timer);
            setOn(true);
          };
        }}
        code={`
import { useState } from "react";
import { Switch } from "@sheenui/theme";

export function Example() {
  const [on, setOn] = useState(true);

  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      label="Email notifications"
      description="Get a summary every Monday."
    />
  );
}`}
      >
        <div className="flex flex-col gap-5">
          <Switch
            checked={on}
            onCheckedChange={setOn}
            label="Email notifications"
            description="Get a summary every Monday."
          />
          <Switch defaultChecked={false} label="Product updates" />
          <Switch disabled label="Beta features" description="Not available on your plan." />
        </div>
      </Example>

      <Example
        title="A settings list"
        description="One piece of state for a group of switches, each with its own name."
        code={`
import { useState } from "react";
import { Switch } from "@sheenui/theme";

const channels = [
  { key: "email", label: "Email", description: "Receipts and weekly summaries." },
  { key: "push", label: "Push notifications", description: "Mentions and replies." },
  { key: "sms", label: "Text messages", description: "Security alerts only." },
] as const;

export function Example() {
  const [enabled, setEnabled] = useState({ email: true, push: true, sms: false });

  return (
    <div className="flex flex-col gap-5">
      {channels.map(({ key, label, description }) => (
        <Switch
          key={key}
          label={label}
          description={description}
          checked={enabled[key]}
          onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [key]: checked }))}
        />
      ))}
    </div>
  );
}`}
      >
        <div className="flex flex-col gap-5">
          {channels.map(({ key, label, description }) => (
            <Switch
              key={key}
              label={label}
              description={description}
              checked={channelState[key]}
              onCheckedChange={(checked) => setChannelState((prev) => ({ ...prev, [key]: checked }))}
            />
          ))}
        </div>
      </Example>
      <PropsTable
        of={PROPS.Switch}
        rows={[
          ["checked / defaultChecked", "boolean", "false", "Controlled or uncontrolled state."],
          [
            "onCheckedChange",
            "(checked) => void",
            "",
            "Called with the new checked state when the control is toggled.",
          ],
          ["disabled", "boolean", "false", "Makes the control non-interactive."],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move focus to or from the switch."],
          ["Space / Enter", "Toggle it."],
        ]}
      />
      <A11yNotes
        items={[
          'role="switch" with aria-checked; the label and description share one <label>.',
          "On and off differ by thumb position as well as color; forced colors outline the track.",
          "The touch hit area is 44 px; under reduced motion the thumb jumps instead of sliding.",
        ]}
      />
    </Page>
  );
}

/** The "Checkbox" docs page (/components/checkbox): live examples, props and notes. */
export function CheckboxPage() {
  const [terms, setTerms] = useState(false);
  const [items, setItems] = useState({ design: true, code: false, ship: false });
  const all = Object.values(items).every(Boolean);
  const some = Object.values(items).some(Boolean);

  return (
    <Page
      eyebrow="Component"
      title="Checkbox"
      description="A glass checkbox; the check pops in. Supports an indeterminate state for “select all”."
      source="theme/src/components/checkbox/checkbox.tsx"
    >
      <ShowcaseStage<CheckboxSceneData>
        label="Checkbox demo"
        story={() => import("../layout/ShowcaseStage.checkbox")}
        initial={{ done: [false, false, false] }}
      >
        {(scene, ctx) => <CheckboxScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Select all (indeterminate)"
        // Signature motion, once in view: the checks pop in one after another and "All tasks" settles.
        autoplay={() => {
          setItems({ design: false, code: false, ship: false });
          const timers = (["design", "code", "ship"] as const).map((key, i) =>
            window.setTimeout(() => setItems((prev) => ({ ...prev, [key]: true })), 500 + i * 380),
          );
          timers.push(window.setTimeout(() => setItems({ design: true, code: false, ship: false }), 2800));
          return () => timers.forEach((t) => window.clearTimeout(t));
        }}
        code={`
import { useState } from "react";
import { Checkbox } from "@sheenui/theme";

export function Example() {
  const [items, setItems] = useState({ design: true, code: false, ship: false });
  const all = Object.values(items).every(Boolean);
  const some = Object.values(items).some(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="All tasks"
        checked={all}
        indeterminate={some && !all}
        onCheckedChange={(v) => setItems({ design: v, code: v, ship: v })}
      />
      <div className="ms-8 flex flex-col gap-3">
        {(["design", "code", "ship"] as const).map((key) => (
          <Checkbox
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            checked={items[key]}
            onCheckedChange={(v) => setItems({ ...items, [key]: v })}
          />
        ))}
      </div>
    </div>
  );
}`}
      >
        <div className="flex flex-col gap-3">
          <Checkbox
            label="All tasks"
            checked={all}
            indeterminate={some && !all}
            onCheckedChange={(v) => setItems({ design: v, code: v, ship: v })}
          />
          <div className="ms-8 flex flex-col gap-3">
            {(["design", "code", "ship"] as const).map((key) => (
              <Checkbox
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                checked={items[key]}
                onCheckedChange={(v) => setItems({ ...items, [key]: v })}
              />
            ))}
          </div>
        </div>
      </Example>

      <Example
        title="In a form"
        description="Checkboxes submit with the form through name. Here the button stays disabled until the terms are accepted."
        code={`
import { useState } from "react";
import { Button, Checkbox } from "@sheenui/theme";

export function Example() {
  const [terms, setTerms] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(Object.fromEntries(new FormData(event.currentTarget)));
      }}
      className="flex flex-col items-start gap-4"
    >
      <Checkbox name="updates" label="Send me product updates" description="One email a month. Unsubscribe any time." defaultChecked />
      <Checkbox name="terms" label="I accept the terms" checked={terms} onCheckedChange={setTerms} />
      <Checkbox disabled label="Single sign-on" description="Managed by your administrator." />
      <Button type="submit" disabled={!terms}>Create account</Button>
    </form>
  );
}`}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            console.log(Object.fromEntries(new FormData(event.currentTarget)));
          }}
          className="flex flex-col items-start gap-4"
        >
          <Checkbox
            name="updates"
            label="Send me product updates"
            description="One email a month. Unsubscribe any time."
            defaultChecked
          />
          <Checkbox name="terms" label="I accept the terms" checked={terms} onCheckedChange={setTerms} />
          <Checkbox disabled label="Single sign-on" description="Managed by your administrator." />
          <Button type="submit" disabled={!terms}>
            Create account
          </Button>
        </form>
      </Example>
      <PropsTable
        of={PROPS.Checkbox}
        rows={[
          ["checked / defaultChecked", "boolean", "false", "Controlled or uncontrolled state."],
          ["indeterminate", "boolean", "false", "Shows a dash: some, but not all, children are checked."],
          [
            "onCheckedChange",
            "(checked) => void",
            "",
            "Called with the new checked state when the control is toggled.",
          ],
          ["disabled", "boolean", "false", "Makes the control non-interactive."],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move focus to or from the checkbox."],
          ["Space", "Toggle it (Enter does not, as with a native checkbox)."],
        ]}
      />
      <A11yNotes
        items={[
          'A real checkbox role; indeterminate sets aria-checked="mixed".',
          "The label and description share one <label>, so clicking either toggles it.",
          "The unchecked border keeps 3:1 contrast; forced colors fill the box with Highlight. The touch hit area is 44 x 44 px.",
        ]}
      />
    </Page>
  );
}

/** The Select page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const SelectPage = lazyBlock(() => import("./SelectPageBody").then((m) => m.SelectPage), island);

/** The "Slider" docs page (/components/slider): live examples, props and notes. */
export function SliderPage() {
  const [volume, setVolume] = useState<number | number[]>(60);
  return (
    <Page
      eyebrow="Component"
      title="Slider"
      description="Pick a value or a range by dragging, clicking the track, or using the arrow keys."
      source="theme/src/components/slider/slider.tsx"
    >
      <ShowcaseStage<SliderSceneData>
        label="Slider demo"
        story={() => import("../layout/ShowcaseStage.slider")}
        initial={{ value: 10 }}
        initialState="off"
        onInterrupt="keep"
      >
        {(scene, ctx) => <SliderScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Single value and range"
        // Signature motion, once in view: the volume thumb glides down, up and back to 60 (a few steps, not per frame).
        autoplay={() => {
          const steps = [52, 44, 36, 28, 22, 20, 20, 30, 42, 54, 66, 76, 84, 84, 78, 70, 64, 60];
          const timers = steps.map((v, i) => window.setTimeout(() => setVolume(v), 400 + i * 80));
          return () => {
            timers.forEach((t) => window.clearTimeout(t));
            setVolume(60);
          };
        }}
        code={`
import { useState } from "react";
import { Slider } from "@sheenui/theme";

export function Example() {
  const [volume, setVolume] = useState(40);

  return (
    <>
      <Slider label="Volume" value={volume} onValueChange={(v) => setVolume(Array.isArray(v) ? (v[0] ?? 0) : v)} />
      <Slider label="Price range" defaultValue={[200, 800]} min={0} max={1000} step={10} />
    </>
  );
}`}
      >
        <div className="flex w-full max-w-sm flex-col gap-8">
          <Slider label="Volume" value={volume} onValueChange={setVolume} />
          <Slider label="Price range" defaultValue={[200, 800]} min={0} max={1000} step={10} />
        </div>
      </Example>

      <Example
        title="Step, bounds and states"
        code={`
import { Slider } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider label="Temperature" min={16} max={30} step={0.5} defaultValue={21.5} />
      <Slider aria-label="Brightness" defaultValue={70} showValue={false} />
      <Slider label="Locked" defaultValue={40} disabled />
    </div>
  );
}`}
      >
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Slider label="Temperature" min={16} max={30} step={0.5} defaultValue={21.5} />
          <Slider aria-label="Brightness" defaultValue={70} showValue={false} />
          <Slider label="Locked" defaultValue={40} disabled />
        </div>
      </Example>
      <PropsTable of={PROPS.Slider} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Focus each thumb in turn."],
          ["Arrow keys", "Change the value by one step."],
          ["Page Up / Page Down", "Change the value by 10 by default (set with largeStep)."],
          ["Home / End", "Jump to the minimum or maximum."],
        ]}
      />
      <A11yNotes
        items={[
          'Each thumb is role="slider" with aria-valuenow, aria-valuemin and aria-valuemax; a range slider has one thumb per value.',
          "The label names the group; the value text is announced as it changes.",
          "The track is 44 px tall on touch screens and its edge has a 3:1 border; a value bubble shows above the thumb while dragging.",
        ]}
      />
    </Page>
  );
}
