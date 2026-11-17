import { useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Switch,
} from "@sheenui/theme";
import { SpinnerStage, spinnerStageCode } from "./PrimitiveShowcases";
import { Page, PropsTable } from "../layout/Page";
import type { SpinnerScene as SpinnerSceneData } from "../layout/ShowcaseStage.spinner";
import { SpinnerScene } from "../layout/ShowcaseStage.spinner.scene";
import type { ButtonGroupScene as ButtonGroupSceneData } from "../layout/ShowcaseStage.button-group";
import { ButtonGroupScene } from "../layout/ShowcaseStage.button-group.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { AlertScene as AlertSceneData } from "../layout/ShowcaseStage.alert";
import { AlertScene } from "../layout/ShowcaseStage.alert.scene";
import { Example } from "../layout/Example";
import type { CollapsibleScene as CollapsibleSceneData } from "../layout/ShowcaseStage.collapsible";
import { CollapsibleScene } from "../layout/ShowcaseStage.collapsible.scene";
import type { FieldScene as FieldSceneData } from "../layout/ShowcaseStage.field";
import { FieldScene } from "../layout/ShowcaseStage.field.scene";
import { lazyBlock } from "../layout/lazy-block";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const island = { eager: true, minHeight: "80vh" };
import * as PROPS from "../generated/component-props";

/** The size-scale row (Select, Combobox, NumberField, DatePicker) is an island: those controls are not part of the Field page's initial JavaScript. */
const FieldControlsDemo = lazyBlock(() => import("./FieldControlsDemo").then((m) => m.FieldControlsDemo), {
  minHeight: "6rem",
});
const FieldSizesDemo = lazyBlock(() => import("./FieldSizesDemo").then((m) => m.FieldSizesDemo), { minHeight: "9rem" });

/* ------------------------------------------------------------------ Alert */

const alertTonesCode = `
import { Alert } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert tone="info" title="A new version is available">Reload the page to get the latest features.</Alert>
      <Alert tone="success" title="Changes saved">Your profile is up to date.</Alert>
      <Alert tone="warning" title="Storage almost full">You have used 92% of your plan.</Alert>
      <Alert tone="danger" title="Payment failed">Your card was declined. Update it to keep your plan.</Alert>
    </div>
  );
}`;

const alertActionCode = `
import { useState } from "react";
import { Alert, Button } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert
        tone="warning"
        title="Your trial ends in 3 days"
        action={<Button size="sm" variant="glass">Upgrade</Button>}
        dismissible
        open={open}
        onOpenChange={setOpen}
      >
        Add a payment method to keep your projects.
      </Alert>
      {!open && (
        <Button size="sm" variant="ghost" className="self-start" onClick={() => setOpen(true)}>
          Show the alert again
        </Button>
      )}
    </div>
  );
}`;

/** The "Alert" docs page (/components/alert). */
export function AlertPage() {
  const [open, setOpen] = useState(true);
  return (
    <Page
      eyebrow="Component"
      title="Alert"
      description="An inline message that stays in the page flow: a form error, a saved confirmation, a plan limit. Four tones, an optional action and a dismiss button."
      source="theme/src/components/alert/alert.tsx"
      keyboard={[
        ["Tab", "Moves to the action and the dismiss button; the alert itself is not a tab stop."],
        ["Enter / Space", "Activates the focused action or the dismiss button."],
      ]}
      a11y={[
        'Warning and danger use role="alert" (announced at once); info and success use role="status" (announced politely). Pass role="none" for a message that is already on screen at page load: the live demos on this page do, so navigating here does not read out five alerts (the code samples show normal use).',
        "The tone icon is decorative. The title and message carry the meaning, color is only a hint.",
        "The dismiss button is named by labels.dismiss, is 44px on touch screens, and has a visible focus ring.",
        "Text sits on a near-opaque tinted surface, so it keeps 4.5:1 over glass, photos and blobs in light and dark. Forced colors draw a CanvasText border.",
      ]}
    >
      <ShowcaseStage<AlertSceneData>
        label="Alert demo"
        story={() => import("../layout/ShowcaseStage.alert")}
        initial={{ phase: 0 }}
      >
        {(scene, ctx) => <AlertScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Four tones"
        description="Each tone has its own icon and tint. The words always say what happened."
        code={alertTonesCode}
      >
        <div className="flex w-full max-w-xl flex-col gap-3">
          <Alert role="none" tone="info" title="A new version is available">
            Reload the page to get the latest features.
          </Alert>
          <Alert role="none" tone="success" title="Changes saved">
            Your profile is up to date.
          </Alert>
          <Alert role="none" tone="warning" title="Storage almost full">
            You have used 92% of your plan.
          </Alert>
          <Alert role="none" tone="danger" title="Payment failed">
            Your card was declined. Update it to keep your plan.
          </Alert>
        </div>
      </Example>

      <Example
        title="Action and dismiss"
        description="Put a real button or link in action. dismissible adds a close button; open and onOpenChange let you control it."
        code={alertActionCode}
      >
        <div className="flex w-full max-w-xl flex-col gap-3">
          <Alert
            role="none"
            tone="warning"
            title="Your trial ends in 3 days"
            action={
              <Button size="sm" variant="glass">
                Upgrade
              </Button>
            }
            dismissible
            open={open}
            onOpenChange={setOpen}
          >
            Add a payment method to keep your projects.
          </Alert>
          {!open && (
            <Button size="sm" variant="ghost" className="self-start" onClick={() => setOpen(true)}>
              Show the alert again
            </Button>
          )}
        </div>
      </Example>

      <PropsTable
        of={PROPS.Alert}
        rows={[
          [
            "role",
            '"alert" | "status" | "none" | …',
            "`alert` for warning and danger, otherwise `status`",
            "Sets the live-region role that announces the alert.",
          ],
        ]}
      />
    </Page>
  );
}

/* ---------------------------------------------------------------- Spinner */

/** The "Spinner" docs page (/components/spinner). */
export function SpinnerPage() {
  return (
    <Page
      eyebrow="Component"
      title="Spinner"
      description="A loading indicator for work with no known length. Five sizes, three colors, a screen-reader label, and it holds still as a static arc under reduced motion."
      source="theme/src/components/spinner/spinner.tsx"
      keyboard={[
        [
          "Tab",
          "Not focusable: a spinner is a read-out. Put it inside a control that is busy, not on a tab stop of its own.",
        ],
      ]}
      a11y={[
        'It is a role="status" live region with a visually hidden label ("Loading" by default), so mounting it announces politely. Remove it when the work is done.',
        "The ring itself is aria-hidden. Use labels.loading to say what is loading, in the page language.",
        "Reduced motion (OS setting or the in-app toggle) keeps the arc turning, slower: it is the loading signal itself. Everything else about the page stops moving.",
        "The track keeps 3:1 against the surface; forced colors draw it in CanvasText.",
      ]}
    >
      <ShowcaseStage<SpinnerSceneData>
        label="Spinner demo"
        story={() => import("../layout/ShowcaseStage.spinner")}
        initial={{ done: false }}
      >
        {(scene) => <SpinnerScene scene={scene} />}
      </ShowcaseStage>

      <Example
        title="Sizes, tones and loading buttons"
        description="Five sizes on glass with their names, a labelled panel, muted and current-colour tones, and a row of busy buttons. showLabel prints the text; the label is always read aloud."
        code={spinnerStageCode}
      >
        <SpinnerStage />
      </Example>

      <PropsTable of={PROPS.Spinner} />
    </Page>
  );
}

/* ------------------------------------------------------------------ Field */

const fieldBasicCode = `
import { useState } from "react";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel, Input } from "@sheenui/theme";

export function Example() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const invalid = touched && !/^\\S+@\\S+\\.\\S+$/.test(email);

  return (
    <Field required invalid={invalid} className="max-w-sm">
      <FieldLabel>Email</FieldLabel>
      <FieldControl>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} />
      </FieldControl>
      <FieldDescription>We only use it to send receipts.</FieldDescription>
      <FieldError>Enter a valid email address.</FieldError>
    </Field>
  );
}`;

const fieldAnyCode = `
import { Field, FieldControl, FieldDescription, FieldLabel, Switch } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Field>
        <FieldLabel hint="(optional)">Notifications</FieldLabel>
        <Switch />
        <FieldDescription>Email me about new features.</FieldDescription>
      </Field>
      <Field disabled>
        <FieldLabel>Sound volume</FieldLabel>
        <FieldControl>
          {(props) => <input type="range" {...props} />}
        </FieldControl>
      </Field>
    </div>
  );
}`;

const fieldControlsCode = `
import type { ReactNode } from "react";
import { Controller, useForm, type Control, type ControllerFieldState, type ControllerRenderProps } from "react-hook-form";
import {
Button,
Checkbox,
ColorField,
Combobox,
DatePicker,
DateRangePicker,
FileUpload,
NumberField,
OtpInput,
RadioGroup,
Rating,
SegmentedControl,
Select,
Slider,
Switch,
TagsInput,
type DateRange,
type FileUploadItem,
} from "@sheenui/theme";

// The value each control holds. Every control takes ref, name, onBlur and aria-invalid, so the Controller
// field spreads on without wrappers; only the change handler and the value prop differ.
type Values = {
  fruit: string | null;
  city: string | null;
  size: string | null;
  plan: string;
  volume: number;
  quantity: number | null;
  stars: number | null;
  code: string;
  tags: string[];
  day: Date | null;
  stay: DateRange | null;
  brand: string;
  files: FileUploadItem[];
  terms: boolean;
  news: boolean;
};

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

type RowProps<K extends keyof Values> = {
  name: K;
  control: Control<Values>;
  render: (field: ControllerRenderProps<Values, K>, state: ControllerFieldState) => ReactNode;
};

function Row<K extends keyof Values>({ name, control, render }: RowProps<K>) {
  return <Controller name={name} control={control} render={({ field, fieldState }) => <>{render(field, fieldState)}</>} />;
}

export function Example() {
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { fruit: null, city: null, size: null, plan: "month", volume: 30, quantity: null, stars: null, code: "", tags: [], day: null, stay: null, brand: "#7c5cff", files: [], terms: false, news: false },
  });

  return (
    <form onSubmit={handleSubmit((values) => console.log(values))} className="grid max-w-xl gap-4">
      <Row name="fruit" control={control} render={(f, s) => <Select label="Fruit" items={options} name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="city" control={control} render={(f, s) => <Combobox label="City" options={options} name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="size" control={control} render={(f, s) => <RadioGroup label="Size" items={options} name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="plan" control={control} render={(f, s) => <SegmentedControl aria-label="Billing" items={[{ value: "month", label: "Monthly" }, { value: "year", label: "Yearly" }]} name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="volume" control={control} render={(f, s) => <Slider label="Volume" name={f.name} value={f.value} onValueChange={(v) => f.onChange(v)} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="quantity" control={control} render={(f, s) => <NumberField label="Quantity" name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="stars" control={control} render={(f, s) => <Rating label="Rating" name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="code" control={control} render={(f, s) => <OtpInput length={4} name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="tags" control={control} render={(f, s) => <TagsInput label="Tags" name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="day" control={control} render={(f, s) => <DatePicker label="Day" name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="stay" control={control} render={(f, s) => <DateRangePicker label="Stay" name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="brand" control={control} render={(f, s) => <ColorField label="Brand color" alpha={false} name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="files" control={control} render={(f, s) => <FileUpload label="Attachments" name={f.name} value={f.value} onValueChange={f.onChange} onBlur={f.onBlur} ref={f.ref} aria-invalid={s.invalid} />} />
      <Row name="terms" control={control} render={(f, s) => <Checkbox label="I accept the terms" name={f.name} checked={f.value} onCheckedChange={f.onChange} onBlur={f.onBlur} ref={f.ref} error={s.error?.message} />} />
      <Row name="news" control={control} render={(f, s) => <Switch label="Send me news" name={f.name} checked={f.value} onCheckedChange={f.onChange} onBlur={f.onBlur} ref={f.ref} error={s.error?.message} />} />
      <Button type="submit">Save</Button>
    </form>
  );
}`;

const fieldHookFormCode = `
import { useForm, Controller } from "react-hook-form";
import { Button, Field, FieldControl, FieldError, FieldLabel, Input } from "@sheenui/theme";

type Values = { name: string };

export function Example() {
  const { control, handleSubmit } = useForm<Values>({ defaultValues: { name: "" } });

  return (
    <form onSubmit={handleSubmit((values) => console.log(values))} className="flex max-w-sm flex-col gap-4">
      <Controller
        name="name"
        control={control}
        rules={{ required: "Name is required." }}
        render={({ field, fieldState }) => (
          <Field required invalid={fieldState.invalid}>
            <FieldLabel>Full name</FieldLabel>
            <FieldControl>
              <Input {...field} />
            </FieldControl>
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}`;

const sizesCode = `
import { Button, Combobox, DatePicker, Input, NumberField, Select } from "@sheenui/theme";

const fruit = [{ value: "apple", label: "Apple" }, { value: "pear", label: "Pear" }];

export function Example() {
  return (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <Button size={size}>{size}</Button>
          <Input size={size} aria-label={\`Input \${size}\`} placeholder="Input" className="w-36" />
          <Select size={size} aria-label={\`Select \${size}\`} items={fruit} placeholder="Select" className="w-44" />
          <Combobox size={size} aria-label={\`Combobox \${size}\`} options={fruit} placeholder="Combobox" className="w-44" />
          <NumberField size={size} aria-label={\`Number \${size}\`} defaultValue={3} className="w-36" />
          <DatePicker size={size} aria-label={\`Date \${size}\`} className="w-44" />
        </div>
      ))}
    </div>
  );
}`;

/** The "Field" docs page (/forms/field). */
export function FieldPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState("");
  const invalid = touched && !/^\S+@\S+\.\S+$/.test(email);
  return (
    <Page
      eyebrow="Form"
      title="Field and Label"
      description="A composable wrapper that wires a label, a description and an error message to any control: ids, aria-describedby, aria-invalid, required and disabled, all generated for you."
      source="theme/src/components/field/field.tsx"
      keyboard={[
        ["Click the label", "Focuses (or toggles) the control it names."],
        ["Tab", "Field adds no tab stops; focus order is the control's own."],
      ]}
      a11y={[
        "FieldLabel is a real <label for> pointing at the control, so the control has an accessible name and a larger click target.",
        "FieldDescription and FieldError ids are added to the control's aria-describedby only while they are rendered, merged with any aria-describedby the control already has.",
        'FieldError is role="alert", so an error that appears after a submit or a blur is announced; it renders only while the field is invalid.',
        "The required asterisk is aria-hidden; the control itself gets required, so assistive tech says it once.",
        "Form libraries: every SheenUI input forwards ref, onBlur, name, required, disabled, aria-invalid and aria-describedby, so Field works with react-hook-form's Controller (pass invalid={fieldState.invalid} and the message as FieldError's children).",
      ]}
    >
      <ShowcaseStage<FieldSceneData>
        label="Field demo"
        story={() => import("../layout/ShowcaseStage.field")}
        initial={{ email: "", touched: false }}
        minHeight="18rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <FieldScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Label, description and error"
        description="The error shows after the field has been visited and is invalid. Type a bad address and tab away."
        code={fieldBasicCode}
      >
        <Field required invalid={invalid} className="max-w-sm">
          <FieldLabel>Email</FieldLabel>
          <FieldControl>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
            />
          </FieldControl>
          <FieldDescription>We only use it to send receipts.</FieldDescription>
          <FieldError>Enter a valid email address.</FieldError>
        </Field>
      </Example>

      <Example
        title="Any control"
        description="Base UI controls such as Switch join the field on their own. FieldControl wires a native element or your own component and merges with its props (its own disabled, required, aria-invalid and id win). Pass a function to place the props yourself."
        code={fieldAnyCode}
      >
        <div className="flex w-full max-w-sm flex-col gap-5">
          <Field>
            <FieldLabel hint="(optional)">Notifications</FieldLabel>
            <Switch />
            <FieldDescription>Email me about new features.</FieldDescription>
          </Field>
          <Field disabled>
            <FieldLabel>Sound volume</FieldLabel>
            <FieldControl>{(props) => <input type="range" {...props} />}</FieldControl>
          </Field>
        </div>
      </Example>

      <Example
        title="With react-hook-form"
        description="Field takes the error from the form library: Controller hands the control its ref, name, value and onBlur, and the message becomes FieldError's children. The preview below runs the same markup on plain state."
        code={fieldHookFormCode}
      >
        <Field required invalid={touched && name === ""} className="max-w-sm">
          <FieldLabel>Full name</FieldLabel>
          <FieldControl>
            <Input name="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched(true)} />
          </FieldControl>
          <FieldError>Name is required.</FieldError>
        </Field>
      </Example>

      <Example
        title="One size scale for buttons and fields"
        description="Input, Select, Combobox, NumberField, DatePicker, TagsInput, Textarea, OtpInput and the color field take size sm (32px), md (40px, default) or lg (48px), and so does Button: one height scale, so a button beside a field lines up at every size. On touch screens (any coarse pointer) sm and md grow to 44px."
        code={sizesCode}
      >
        <FieldSizesDemo />
      </Example>

      <Example
        title="Every control with react-hook-form"
        description="One Row helper, one line per control. Each control takes ref, name, onBlur and aria-invalid from the Controller field, so a failed validation focuses the right control; the value prop and the change handler are the only things that differ (checked and onCheckedChange for Checkbox and Switch, a Date or a DateRange for the pickers, an array for TagsInput and FileUpload)."
        code={fieldControlsCode}
      >
        <FieldControlsDemo />
      </Example>

      <PropsTable title="Field props" of={PROPS.Field} />
      <PropsTable
        title="Other parts"
        as="h3"
        rows={[
          ["FieldDescription", "p props", "", "Helper text under the control; listed in aria-describedby."],
          [
            "useField()",
            "FieldContextValue | null",
            "",
            "The ids and state of the surrounding Field, for building your own parts.",
          ],
        ]}
      />
      <PropsTable of={PROPS.FieldControl} title="FieldControl props" as="h3" />
      <PropsTable of={PROPS.FieldError} title="FieldError props" as="h3" />
      <PropsTable of={PROPS.FieldLabel} title="FieldLabel props" as="h3" />
      <PropsTable of={PROPS.Label} title="Label props" as="h3" />
    </Page>
  );
}

/* ------------------------------------------------------------ Collapsible */

const collapsibleCode = `
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Collapsible className="glass-2 max-w-md rounded-sheen-xl p-2">
      <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
      <CollapsiblePanel>
        Retry limit, request timeout and proxy settings live here. The panel animates its height and keeps
        closed content out of the page.
      </CollapsiblePanel>
    </Collapsible>
  );
}`;

const collapsibleControlledCode = `
import { useState } from "react";
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Button variant="glass" size="sm" className="self-start" onClick={() => setOpen((o) => !o)}>
        {open ? "Collapse" : "Expand"} from outside
      </Button>
      <Collapsible open={open} onOpenChange={setOpen} className="glass-2 rounded-sheen-xl p-2">
        <CollapsibleTrigger>12 more files</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>
          <ul className="list-disc ps-5">
            <li>report-q1.pdf</li>
            <li>report-q2.pdf</li>
            <li>report-q3.pdf</li>
          </ul>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}`;

/** The "Collapsible" docs page (/layout/collapsible). */
export function CollapsiblePage() {
  const [open, setOpen] = useState(false);
  return (
    <Page
      eyebrow="Layout"
      title="Collapsible"
      description="One section that shows or hides its content: advanced options, a long list behind Show more, details under a row. The height animates, the chevron turns, and closed content leaves the tab order."
      source="theme/src/components/collapsible/collapsible.tsx"
      keyboard={[
        ["Tab", "Focuses the trigger."],
        ["Enter / Space", "Opens or closes the panel."],
      ]}
      a11y={[
        "The trigger is a real <button> with aria-expanded and aria-controls (Base UI Collapsible).",
        "Closed content is removed from the page, so its links and fields are neither tabbable nor read. keepMounted keeps it in the DOM but hidden; hiddenUntilFound lets find-in-page open it.",
        "The chevron is decorative. Triggers are 44px tall on touch screens and show a focus ring.",
        "Under reduced motion the panel jumps to its open or closed height with no travel.",
      ]}
    >
      <ShowcaseStage<CollapsibleSceneData>
        label="Collapsible demo"
        story={() => import("../layout/ShowcaseStage.collapsible")}
        initial={{ open: false }}
        minHeight="15rem"
      >
        {(scene, ctx) => <CollapsibleScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Basic"
        description="Use Accordion when opening one section should close another."
        code={collapsibleCode}
      >
        <Collapsible className="glass-2 max-w-md rounded-sheen-xl p-2">
          <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
          <CollapsiblePanel>
            Retry limit, request timeout and proxy settings live here. The panel animates its height and keeps closed
            content out of the page.
          </CollapsiblePanel>
        </Collapsible>
      </Example>

      <Example
        title="Controlled"
        description="open and onOpenChange drive it from outside. keepMounted holds the content in the DOM (hidden) so form fields inside keep their values."
        code={collapsibleControlledCode}
      >
        <div className="flex w-full max-w-md flex-col gap-3">
          <Button variant="glass" size="sm" className="self-start" onClick={() => setOpen((o) => !o)}>
            {open ? "Collapse" : "Expand"} from outside
          </Button>
          <Collapsible open={open} onOpenChange={setOpen} className="glass-2 rounded-sheen-xl p-2">
            <CollapsibleTrigger>12 more files</CollapsibleTrigger>
            <CollapsiblePanel keepMounted>
              <ul className="list-disc ps-5">
                <li>report-q1.pdf</li>
                <li>report-q2.pdf</li>
                <li>report-q3.pdf</li>
              </ul>
            </CollapsiblePanel>
          </Collapsible>
        </div>
      </Example>

      <PropsTable
        title="Collapsible props"
        rows={[
          ["open / defaultOpen", "boolean", "false", "Controlled / uncontrolled open state."],
          ["onOpenChange", "(open: boolean) => void", "", "Called when it opens or closes."],
          ["disabled", "boolean", "false", "Locks the section so it cannot be toggled."],
          ["className", "string", "", "Adds extra classes to the root."],
        ]}
      />
      <PropsTable
        title="CollapsibleTrigger and CollapsiblePanel"
        of={[PROPS.CollapsibleTrigger, PROPS.CollapsiblePanel]}
        rows={[
          ["render (Trigger)", "ReactElement", "", "Replaces the button with another element."],
          ["keepMounted (Panel)", "boolean", "false", "Keep closed content in the DOM, hidden."],
          ["hiddenUntilFound (Panel)", "boolean", "false", "Use hidden=until-found so find-in-page opens it."],
        ]}
      />
    </Page>
  );
}

/* ------------------------------------------------------- NavigationMenu */

/** The NavigationMenu page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const NavigationMenuPage = lazyBlock(
  () => import("./NavigationMenuPageBody").then((m) => m.NavigationMenuPage),
  island,
);

/* ------------------------------------------------------------ ButtonGroup */

const groupCode = `
import { Button, ButtonGroup } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex flex-col items-start gap-5">
      <ButtonGroup aria-label="View">
        <Button variant="glass">Day</Button>
        <Button variant="glass">Week</Button>
        <Button variant="glass">Month</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Actions" orientation="vertical">
        <Button variant="outline" size="sm">Copy</Button>
        <Button variant="outline" size="sm">Paste</Button>
        <Button variant="outline" size="sm" disabled>Cut</Button>
      </ButtonGroup>
    </div>
  );
}`;

/** The "Button group" docs page (/components/button-group). */
export function ButtonGroupPage() {
  return (
    <Page
      eyebrow="Component"
      title="Button group"
      description="Related buttons joined into one control: squared inner corners, one shared edge, and a single tab stop that arrow keys move through."
      source="theme/src/components/button-group/button-group.tsx"
      keyboard={[
        ["Tab", "Focuses the group once, on the button that was last focused (the first at first)."],
        ["← / →", "Move to the previous or next button (↑ / ↓ when vertical). It wraps."],
        ["Home / End", "Jump to the first or last button."],
        ["Enter / Space", "Press the focused button."],
      ]}
      a11y={[
        'The group is role="group"; name it with aria-label when the buttons only make sense together ("View", "Text alignment").',
        "Each button keeps its own name and state: use aria-pressed on toggle buttons. Disabled buttons are skipped by the arrow keys.",
        "Roving focus keeps a long toolbar to one tab stop. Targets stay 44px on touch screens.",
        "In right-to-left pages the arrow keys follow the reading direction.",
      ]}
    >
      <ShowcaseStage<ButtonGroupSceneData>
        label="Button group demo"
        story={() => import("../layout/ShowcaseStage.button-group")}
        initial={{ range: "day" }}
      >
        {(scene, ctx) => <ButtonGroupScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Horizontal and vertical"
        description="Any Button variant works inside; keep one size in a group."
        code={groupCode}
      >
        <div className="flex flex-col items-start gap-5">
          <ButtonGroup aria-label="View">
            <Button variant="glass">Day</Button>
            <Button variant="glass">Week</Button>
            <Button variant="glass">Month</Button>
          </ButtonGroup>
          <ButtonGroup aria-label="Actions" orientation="vertical">
            <Button variant="outline" size="sm">
              Copy
            </Button>
            <Button variant="outline" size="sm">
              Paste
            </Button>
            <Button variant="outline" size="sm" disabled>
              Cut
            </Button>
          </ButtonGroup>
        </div>
      </Example>
      <PropsTable of={PROPS.ButtonGroup} />
    </Page>
  );
}
