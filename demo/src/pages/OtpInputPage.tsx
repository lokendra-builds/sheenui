import { useState } from "react";
import { Button, OtpInput, SegmentedControl, type OtpStatus, type OtpSuccessEffect } from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { OtpScene as OtpSceneData } from "../layout/ShowcaseStage.otp";
import { OtpScene } from "../layout/ShowcaseStage.otp.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

// Less side padding on phones so six 44px slots fit the stage at 360px.
const stage = "px-3 sm:px-10";

/** The "OTP input" docs page (/components/otp-input): live examples, props and notes. */
export function OtpInputPage() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [code, setCode] = useState("");
  const [effect, setEffect] = useState<OtpSuccessEffect>("seal");
  const [effectValue, setEffectValue] = useState("");

  return (
    <Page
      eyebrow="Component"
      title="OTP input"
      description="One slot per digit, with paste, keyboard navigation and SMS autofill handled by Base UI's OTP field. Digits pop in, errors shake and glow red, and a correct code folds the slots into a glass seal."
      source="theme/src/components/otp-input/otp-input.tsx"
    >
      <ShowcaseStage<OtpSceneData>
        label="OTP input demo"
        story={() => import("../layout/ShowcaseStage.otp")}
        initial={{ value: "", status: "idle" }}
        minHeight="21rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <OtpScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Basic"
        stageClassName={stage}
        // Signature motion, once in view: six digits pop in as if typed, then the field clears (no focus moves).
        autoplay={() => {
          const digits = "482913";
          const timers = digits
            .split("")
            .map((_, i) => window.setTimeout(() => setCode(digits.slice(0, i + 1)), 500 + i * 150));
          timers.push(window.setTimeout(() => setCode(""), 3200));
          return () => {
            timers.forEach((t) => window.clearTimeout(t));
            setCode("");
          };
        }}
        code={`
import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput length={6} label="Verification code" description="Enter the code we sent you." />
  );
}`}
      >
        <OtpInput
          length={6}
          label="Verification code"
          description="Enter the code we sent you."
          value={code}
          onValueChange={setCode}
        />
      </Example>

      <Example
        title="Status feedback"
        stageClassName={stage}
        description="The correct code is 123456. Anything else shakes the field."
        code={`
import { useState } from "react";
import { OtpInput, type OtpStatus } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");

  return (
    <OtpInput
      grouped
      value={value}
      status={status}
      errorMessage="That code didn't match. Try 123456."
      successMessage="Code verified."
      // Only clear the status once the code is incomplete again: onValueChange also fires for the
      // last digit, and an unconditional reset there would undo onComplete's result.
      onValueChange={(v) => { setValue(v); if (v.length < 6) setStatus("idle"); }}
      onComplete={(v) => setStatus(v === "123456" ? "success" : "error")}
    />
  );
}`}
      >
        <div className="flex max-w-full flex-col items-center gap-4">
          <OtpInput
            grouped
            value={value}
            status={status}
            errorMessage="That code didn't match. Try 123456."
            successMessage="Code verified."
            onValueChange={(v) => {
              setValue(v);
              // Clear only while incomplete: this also fires for the last digit, before onComplete.
              if (v.length < 6) setStatus("idle");
            }}
            onComplete={(v) => setStatus(v === "123456" ? "success" : "error")}
          />
          <Button
            variant="glass"
            size="sm"
            onClick={() => {
              setValue("");
              setStatus("idle");
            }}
          >
            Reset
          </Button>
        </div>
      </Example>

      <Example
        title="Success effect"
        stageClassName={stage}
        description='Type any 6 digits. "seal" (the default) scans the slots with light, folds them into one glass seal and draws a check; "ring" ripples a ring round each slot; "none" only recolours them. Reduced motion fades the seal in and skips the rest.'
        code={`
import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput
      successEffect="seal" // "seal" (default) | "ring" | "none"
      status="success"
      defaultValue="123456"
      successMessage="Code verified."
    />
  );
}`}
      >
        <div className="flex max-w-full flex-col items-center gap-4">
          <SegmentedControl
            aria-label="Success effect"
            size="sm"
            value={effect}
            onValueChange={(next) => {
              setEffect(next as OtpSuccessEffect);
              setEffectValue("");
            }}
            items={[
              { value: "seal", label: "Seal" },
              { value: "ring", label: "Ring" },
              { value: "none", label: "None" },
            ]}
          />
          <OtpInput
            key={effect}
            aria-label="Verification code"
            value={effectValue}
            onValueChange={setEffectValue}
            status={effectValue.length === 6 ? "success" : "idle"}
            successEffect={effect}
            successMessage="Code verified."
          />
          <Button variant="glass" size="sm" onClick={() => setEffectValue("")}>
            Replay
          </Button>
        </div>
      </Example>

      <Example
        title="Masked, 4 digits"
        stageClassName={stage}
        code={`
import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput length={4} mask label="PIN" />
  );
}`}
      >
        <OtpInput length={4} mask label="PIN" />
      </Example>

      <PropsTable of={PROPS.OtpInput} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the first empty slot."],
          ["0-9 (or letters, for alphanumeric)", "Fill the slot and advance."],
          ["Backspace", "Clear the slot and move back."],
          ["Arrow Left / Arrow Right", "Move between slots."],
          ["Paste", "Fill every slot at once."],
        ]}
      />
      <A11yNotes
        items={[
          'The first slot is named by the label and the others "Digit n of N"; autoComplete="one-time-code" lets phones suggest the code.',
          "The error and success messages sit in a polite live region; the seal and its sparks are decorative (aria-hidden), so the announcement is the same for every successEffect.",
          "Slots are at least 44 px wide and 48 px tall with a 3:1 border (WCAG 1.4.11).",
        ]}
      />
    </Page>
  );
}
