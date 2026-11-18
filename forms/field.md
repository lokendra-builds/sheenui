Canonical: https://lokendra-builds.github.io/sheenui/forms/field

# React Form Field with Label, Hint & Error

URL: https://lokendra-builds.github.io/sheenui/forms/field
Sidebar name: Field and Label

A React form field component: label, description and error wired to any control with aria-describedby and aria-invalid. Works with react-hook-form.

What it is: A composable React form field that wires a label, a description and an error message to any control, ready for react-hook-form.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/field.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Field and Label

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/field/`
- `hooks/use-latest.ts`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: field. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { type DateRange } from "@/components/sheenui/calendar/date-utils";
import { Checkbox } from "@/components/sheenui/checkbox/checkbox";
import { ColorField } from "@/components/sheenui/color-picker/color-picker";
import { Combobox } from "@/components/sheenui/combobox/combobox";
import { DatePicker, DateRangePicker } from "@/components/sheenui/date-picker/date-picker";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/sheenui/field/field";
import { FileUpload } from "@/components/sheenui/file-upload/file-upload";
import { type FileUploadItem } from "@/components/sheenui/file-upload/parts/model";
import { Input } from "@/components/sheenui/input/input";
import { NumberField } from "@/components/sheenui/number-field/number-field";
import { OtpInput } from "@/components/sheenui/otp-input/otp-input";
import { RadioGroup } from "@/components/sheenui/radio-group/radio-group";
import { Rating } from "@/components/sheenui/rating/rating";
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
import { Select } from "@/components/sheenui/select/select";
import { Slider } from "@/components/sheenui/slider/slider";
import { Switch } from "@/components/sheenui/switch/switch";
import { TagsInput } from "@/components/sheenui/tags-input/tags-input";
```

These examples also use button, calendar, checkbox, color-picker, combobox, date-picker, file-upload, input, number-field, otp-input, radio-group, rating, segmented, select, slider, switch, tags-input: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/calendar.json https://lokendra-builds.github.io/sheenui/r/checkbox.json https://lokendra-builds.github.io/sheenui/r/color-picker.json https://lokendra-builds.github.io/sheenui/r/combobox.json https://lokendra-builds.github.io/sheenui/r/date-picker.json https://lokendra-builds.github.io/sheenui/r/file-upload.json https://lokendra-builds.github.io/sheenui/r/input.json https://lokendra-builds.github.io/sheenui/r/number-field.json https://lokendra-builds.github.io/sheenui/r/otp-input.json https://lokendra-builds.github.io/sheenui/r/radio-group.json https://lokendra-builds.github.io/sheenui/r/rating.json https://lokendra-builds.github.io/sheenui/r/segmented.json https://lokendra-builds.github.io/sheenui/r/select.json https://lokendra-builds.github.io/sheenui/r/slider.json https://lokendra-builds.github.io/sheenui/r/switch.json https://lokendra-builds.github.io/sheenui/r/tags-input.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Checkbox, ColorField, Combobox, DatePicker, type DateRange, DateRangePicker, Field, FieldControl, FieldDescription, FieldError, FieldLabel, FileUpload, type FileUploadItem, Input, NumberField, OtpInput, RadioGroup, Rating, SegmentedControl, Select, Slider, Switch, TagsInput } from "@sheenui/theme";
```

## Field props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| invalid | boolean | false | Marks the field invalid: the control gets aria-invalid and FieldError is shown. |
| disabled | boolean | false | Disables the control inside the field. |
| required | boolean | false | Marks the control required and adds an asterisk to the label. |
| controlId | string | generated | Id of the control; a generated one is used when omitted. |

## Other parts

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| FieldDescription | p props | optional, no default | Helper text under the control; listed in aria-describedby. |
| useField() | FieldContextValue \| null | optional, no default | The ids and state of the surrounding Field, for building your own parts. |

## FieldControl props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactElement<Partial<FieldControlRenderProps>, string \| JSXElementConstructor<any>> \| ((props: FieldControlRenderProps) => ReactNode) | required | One control element, or a function that gets the wiring props and returns the control. |

## FieldError props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| forceMatch | boolean | false | Show it even when the field is not marked invalid (for example a server error you render yourself). |

## FieldLabel props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| hint | ReactNode | optional, no default | Text shown after the label, such as "(optional)", muted. |

## Label props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| required | boolean | false | Adds an asterisk after the text. It is decorative: mark the control required for assistive tech. |
| hint | ReactNode | optional, no default | Text shown after the label, such as "(optional)", muted. |

## Example 1 of 5: Label, description and error

The error shows after the field has been visited and is invalid. Type a bad address and tab away.

```tsx
import { useState } from "react";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/sheenui/field/field";
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Field, FieldControl, FieldDescription, FieldError, FieldLabel, Input } from "@sheenui/theme";

export function Example() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const invalid = touched && !/^\S+@\S+\.\S+$/.test(email);

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
}
```

## Example 2 of 5: Any control

Base UI controls such as Switch join the field on their own. FieldControl wires a native element or your own component and merges with its props (its own disabled, required, aria-invalid and id win). Pass a function to place the props yourself.

```tsx
import { Field, FieldControl, FieldDescription, FieldLabel } from "@/components/sheenui/field/field";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Field, FieldControl, FieldDescription, FieldLabel, Switch } from "@sheenui/theme";

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
}
```

## Example 3 of 5: With react-hook-form

Field takes the error from the form library: Controller hands the control its ref, name, value and onBlur, and the message becomes FieldError's children. The preview below runs the same markup on plain state.

```tsx
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/sheenui/button/button";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/sheenui/field/field";
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Button, Field, FieldControl, FieldError, FieldLabel, Input } from "@sheenui/theme";

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
}
```

## Example 4 of 5: One size scale for buttons and fields

Input, Select, Combobox, NumberField, DatePicker, TagsInput, Textarea, OtpInput and the color field take size sm (32px), md (40px, default) or lg (48px), and so does Button: one height scale, so a button beside a field lines up at every size. On touch screens (any coarse pointer) sm and md grow to 44px.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Combobox } from "@/components/sheenui/combobox/combobox";
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
import { Input } from "@/components/sheenui/input/input";
import { NumberField } from "@/components/sheenui/number-field/number-field";
import { Select } from "@/components/sheenui/select/select";
// Package build (after the first npm release, or a packed tarball): import { Button, Combobox, DatePicker, Input, NumberField, Select } from "@sheenui/theme";

const fruit = [{ value: "apple", label: "Apple" }, { value: "pear", label: "Pear" }];

export function Example() {
  return (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <Button size={size}>{size}</Button>
          <Input size={size} aria-label={`Input ${size}`} placeholder="Input" className="w-36" />
          <Select size={size} aria-label={`Select ${size}`} items={fruit} placeholder="Select" className="w-44" />
          <Combobox size={size} aria-label={`Combobox ${size}`} options={fruit} placeholder="Combobox" className="w-44" />
          <NumberField size={size} aria-label={`Number ${size}`} defaultValue={3} className="w-36" />
          <DatePicker size={size} aria-label={`Date ${size}`} className="w-44" />
        </div>
      ))}
    </div>
  );
}
```

## Example 5 of 5: Every control with react-hook-form

One Row helper, one line per control. Each control takes ref, name, onBlur and aria-invalid from the Controller field, so a failed validation focuses the right control; the value prop and the change handler are the only things that differ (checked and onCheckedChange for Checkbox and Switch, a Date or a DateRange for the pickers, an array for TagsInput and FileUpload).

```tsx
import type { ReactNode } from "react";
import { Controller, useForm, type Control, type ControllerFieldState, type ControllerRenderProps } from "react-hook-form";
import { Button } from "@/components/sheenui/button/button";
import { type DateRange } from "@/components/sheenui/calendar/date-utils";
import { Checkbox } from "@/components/sheenui/checkbox/checkbox";
import { ColorField } from "@/components/sheenui/color-picker/color-picker";
import { Combobox } from "@/components/sheenui/combobox/combobox";
import { DatePicker, DateRangePicker } from "@/components/sheenui/date-picker/date-picker";
import { FileUpload } from "@/components/sheenui/file-upload/file-upload";
import { type FileUploadItem } from "@/components/sheenui/file-upload/parts/model";
import { NumberField } from "@/components/sheenui/number-field/number-field";
import { OtpInput } from "@/components/sheenui/otp-input/otp-input";
import { RadioGroup } from "@/components/sheenui/radio-group/radio-group";
import { Rating } from "@/components/sheenui/rating/rating";
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
import { Select } from "@/components/sheenui/select/select";
import { Slider } from "@/components/sheenui/slider/slider";
import { Switch } from "@/components/sheenui/switch/switch";
import { TagsInput } from "@/components/sheenui/tags-input/tags-input";
// Package build (after the first npm release, or a packed tarball): import { Button, Checkbox, ColorField, Combobox, DatePicker, DateRangePicker, FileUpload, NumberField, OtpInput, RadioGroup, Rating, SegmentedControl, Select, Slider, Switch, TagsInput, type DateRange, type FileUploadItem } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Click the label | Focuses (or toggles) the control it names. |
| Tab | Field adds no tab stops; focus order is the control's own. |

## Accessibility

- FieldLabel is a real <label for> pointing at the control, so the control has an accessible name and a larger click target.
- FieldDescription and FieldError ids are added to the control's aria-describedby only while they are rendered, merged with any aria-describedby the control already has.
- FieldError is role="alert", so an error that appears after a submit or a blur is announced; it renders only while the field is invalid.
- The required asterisk is aria-hidden; the control itself gets required, so assistive tech says it once.
- Form libraries: every SheenUI input forwards ref, onBlur, name, required, disabled, aria-invalid and aria-describedby, so Field works with react-hook-form's Controller (pass invalid={fieldState.invalid} and the message as FieldError's children).

## All exports on this page

- Field — A form field wrapper that wires a label, a description and an error message to any control.
- FieldControl — Wires the one control inside it to its Field: the element gets id, aria-describedby, aria-invalid, required and disabled.
- FieldDescription — Muted helper text under the control; its id is added to the control's aria-describedby while it is rendered.
- FieldError — The error message of a Field.
- FieldLabel — The label of a Field: Label already pointing at the field's control, with the required asterisk.
- Label — A text label for a control.
- groupBlur — Wraps onBlur for a control made of several focusable parts: it fires only when focus leaves the whole group.
- mergeRefs — Combine refs (callback or object) into one callback ref; undefined entries are skipped.
- useField — The state of the surrounding Field (invalid, required, disabled, controlId).
- useFocusProxyRef — A ref for a control made of several focusable parts (a radio group, a rating, an OTP field).
- useMergedRef — mergeRefs as a hook: returns one stable callback ref that forwards the node to every ref passed in, always the latest ones.


## When to use the Field and Label

- Use it as a react-hook-form field wrapper around a native input, a Slider or a Switch that does not draw its own label, so the label names the control and the description and error are read together with it.
- Use it with react-hook-form: pass invalid={fieldState.invalid} to Field and put the validation message inside FieldError, and the control gets aria-invalid automatically.
- Use it to build a settings row such as a webhook URL with helper text, where a FieldDescription explains the format and a FieldError appears only after a failed save.
- Skip it when the control already takes label, description and error props; Input, Select and the other SheenUI form components wire those themselves, so wrapping them adds nothing.
- Pair it with FieldControl around a native input or your own component, with Slider or Switch, which join the field on their own, and with the useField hook when writing your own field parts.


## Frequently asked questions

### How do I build an accessible React form field with a label and error?

Nest FieldLabel, one control inside FieldControl, and optional FieldDescription and FieldError in a Field. It generates the ids, so the label's for points at the control and aria-describedby lists the description and the error, but only while they are rendered.

### What does the invalid prop actually change?

Setting invalid shows FieldError and puts aria-invalid on the control. FieldError has role="alert", so the message is announced when it appears, and it rises into place by 6px unless reduced motion is on. The required and disabled props reach the control too.

### Does Field add extra tab stops or change focus?

No. Field adds no tab stops; it only wires ids and state. Clicking the label focuses the control. The required asterisk is hidden from screen readers because the control itself carries the required attribute, so it is not announced twice.

### How can I read the field state inside my own component?

Call useField inside a Field. It returns controlId, invalid, required and disabled, or null outside a Field. The ids and aria wiring themselves are handled by Base UI Field, or by FieldControl for a native element. That lets you build a custom hint or counter that reacts to the invalid state.


## Related pages

- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [Select](https://lokendra-builds.github.io/sheenui/components/select)
- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [File upload](https://lokendra-builds.github.io/sheenui/forms/file-upload)
- [Input group](https://lokendra-builds.github.io/sheenui/forms/input-group)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
