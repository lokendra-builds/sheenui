Canonical: https://lokendra-builds.github.io/sheenui/docs/forms

# React Hook Form + Zod with Glass Inputs

URL: https://lokendra-builds.github.io/sheenui/docs/forms
Sidebar name: Forms recipe

A React form recipe: react-hook-form and zod with SheenUI Field, validation messages, focus on error, an async submit and every control via Controller.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Forms recipe

A form recipe for React with react-hook-form and zod: SheenUI's Field wires labels and errors, every control forwards ref and onBlur, and the submit button shows the async state.

Files to copy from `theme/src/`:

- `components/alert/`
- `components/button/`
- `components/checkbox/`
- `components/field/`
- `components/input/`
- `components/number-field/`
- `components/select/`
- `components/drawer/parts/sheet.tsx`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts, use-virtual-window.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, field-control-shell.tsx, field-size.ts, form.ts, glide-highlight.tsx, group-segments.ts, motion-props.ts, page-size.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

shadcn CLI:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/alert.json
```

Registry items: alert, button, checkbox, field, input, number-field, select. The command installs the first; swap the name in the URL for any other. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Alert } from "@/components/sheenui/alert/alert";
import { Button } from "@/components/sheenui/button/button";
import { Checkbox } from "@/components/sheenui/checkbox/checkbox";
import { ColorField } from "@/components/sheenui/color-picker/color-picker";
import { Combobox } from "@/components/sheenui/combobox/combobox";
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/sheenui/field/field";
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

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Alert, Button, Checkbox, ColorField, Combobox, DatePicker, Field, FieldControl, FieldDescription, FieldError, FieldLabel, Input, NumberField, OtpInput, RadioGroup, Rating, SegmentedControl, Select, Slider, Switch, TagsInput } from "@sheenui/theme";
```

## Example 1 of 2: Sign-up form: zod, Field and an async submit

Text inputs use register() (they forward ref, onChange, onBlur and name); everything else goes through Controller. Submit with errors to see focus move to the first invalid field; use an @example.com email for a server error.

```tsx
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/sheenui/alert/alert";
import { Button } from "@/components/sheenui/button/button";
import { Checkbox } from "@/components/sheenui/checkbox/checkbox";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/sheenui/field/field";
import { Input } from "@/components/sheenui/input/input";
import { NumberField } from "@/components/sheenui/number-field/number-field";
import { Select } from "@/components/sheenui/select/select";
// Package build (after the first npm release, or a packed tarball): import { Alert, Button, Checkbox, Field, FieldControl, FieldDescription, FieldError, FieldLabel, Input, NumberField, Select } from "@sheenui/theme";

const plans = [
  { value: "free", label: "Free", description: "1 seat" },
  { value: "team", label: "Team", description: "Up to 10 seats" },
  { value: "business", label: "Business", description: "Up to 50 seats" },
];

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  plan: z.enum(["free", "team", "business"], { error: "Pick a plan" }),
  seats: z.number({ error: "Enter the number of seats" }).int().min(1, "At least 1 seat").max(50, "At most 50 seats"),
  terms: z.boolean().refine((accepted) => accepted, "Accept the terms to continue"),
});
type SignUp = z.infer<typeof schema>;

export function Example() {
  const [created, setCreated] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUp>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", plan: undefined, seats: 5, terms: false },
  });

  const onSubmit = async (values: SignUp) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (values.email.endsWith("@example.com")) {
      setError("email", { message: "That email is already registered" });
      return;
    }
    setCreated(values.name);
  };

  if (created) return <Alert tone="success" title={`Welcome, ${created}`}>Your account is ready.</Alert>;

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex w-full max-w-md flex-col gap-4">
      <Field required invalid={Boolean(errors.name)}>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <Input {...register("name")} autoComplete="name" />
        </FieldControl>
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <Field required invalid={Boolean(errors.email)}>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input {...register("email")} type="email" autoComplete="email" />
        </FieldControl>
        <FieldDescription>Try anything@example.com to see a server error.</FieldDescription>
        <FieldError>{errors.email?.message}</FieldError>
      </Field>

      <Controller
        control={control}
        name="plan"
        render={({ field, fieldState }) => (
          <Field required invalid={fieldState.invalid}>
            <FieldLabel>Plan</FieldLabel>
            <FieldControl>
              <Select items={plans} placeholder="Choose a plan" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />
            </FieldControl>
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="seats"
        render={({ field, fieldState }) => (
          <Field required invalid={fieldState.invalid}>
            <FieldLabel>Seats</FieldLabel>
            <FieldControl>
              <NumberField value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} min={1} max={50} />
            </FieldControl>
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="terms"
        render={({ field, fieldState }) => (
          <Checkbox label="I accept the terms of service" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} error={fieldState.error?.message} />
        )}
      />

      <Button type="submit" loading={isSubmitting} className="self-start">
        Create account
      </Button>
    </form>
  );
}
```

## Example 2 of 2: Every control with Controller

The pattern never changes: value (or checked), the change handler, onBlur, ref and name. The values update live on the right.

```tsx
import { Controller, useForm, useWatch } from "react-hook-form";
import { ColorField } from "@/components/sheenui/color-picker/color-picker";
import { Combobox } from "@/components/sheenui/combobox/combobox";
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
import { OtpInput } from "@/components/sheenui/otp-input/otp-input";
import { RadioGroup } from "@/components/sheenui/radio-group/radio-group";
import { Rating } from "@/components/sheenui/rating/rating";
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
import { Slider } from "@/components/sheenui/slider/slider";
import { Switch } from "@/components/sheenui/switch/switch";
import { TagsInput } from "@/components/sheenui/tags-input/tags-input";
// Package build (after the first npm release, or a packed tarball): import { ColorField, Combobox, DatePicker, OtpInput, RadioGroup, Rating, SegmentedControl, Slider, Switch, TagsInput } from "@sheenui/theme";

type Everything = {
  volume: number;
  notify: boolean;
  stars: number | null;
  birthday: Date | null;
  country: string | null;
  tags: string[];
  view: string;
  code: string;
  billing: string | null;
  brand: string;
};

const countries = [
  { value: "in", label: "India" },
  { value: "de", label: "Germany" },
  { value: "us", label: "United States" },
];

export function Example() {
  const { control } = useForm<Everything>({
    defaultValues: { volume: 40, notify: true, stars: 4, birthday: null, country: null, tags: ["react"], view: "week", code: "", billing: "monthly", brand: "#7c5cff" },
  });
  const values = useWatch({ control });

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex max-w-md flex-col gap-4">
      <Controller control={control} name="volume" render={({ field }) => <Slider label="Volume" value={field.value} onValueChange={(v) => field.onChange(v)} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <Controller control={control} name="notify" render={({ field }) => <Switch label="Email me about updates" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <Controller control={control} name="stars" render={({ field }) => <Rating label="Rate it" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <Controller control={control} name="birthday" render={({ field }) => <DatePicker label="Birthday" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <Controller control={control} name="country" render={({ field }) => <Combobox label="Country" options={countries} value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <Controller control={control} name="tags" render={({ field }) => <TagsInput label="Topics" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <Controller
        control={control}
        name="view"
        render={({ field }) => (
          <SegmentedControl
            aria-label="View"
            items={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            name={field.name}
          />
        )}
      />
      <Controller control={control} name="code" render={({ field }) => <OtpInput length={4} label="Code" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <Controller
        control={control}
        name="billing"
        render={({ field }) => (
          <RadioGroup
            label="Billing"
            items={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            name={field.name}
          />
        )}
      />
      <Controller control={control} name="brand" render={({ field }) => <ColorField label="Brand colour" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />} />
      <pre className="m-0 text-xs">{JSON.stringify(values, null, 2)}</pre>
    </form>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Moves through the fields; after a failed submit focus goes to the first invalid control (react-hook-form calls its ref.focus()). |
| Enter | Submits from any text field. |

## Accessibility

- Field links each label, description and error to its control (for, aria-describedby, aria-invalid), and the error is announced as an alert when it appears.
- Every SheenUI form control forwards ref, onBlur, name and the aria props: ref lets react-hook-form focus the control after a failed validation, onBlur marks it touched.
- The submit button shows loading through aria-busy and ignores clicks while it runs, so a second submit cannot start; focus stays on it.
- Server errors are put on the field they belong to with setError, so they are announced and linked like client-side errors.

## Install

The form libraries are your app's dependencies, not SheenUI's. The examples were tested with react-hook-form 7.91, zod 4.6 and @hookform/resolvers 7.0:

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

The controls come from the registry; every item below installs with npx shadcn@latest add and its docs page lists the exact files: [Field](https://lokendra-builds.github.io/sheenui/forms/field), [Input](https://lokendra-builds.github.io/sheenui/components/input), [Select](https://lokendra-builds.github.io/sheenui/components/select), [Checkbox](https://lokendra-builds.github.io/sheenui/components/checkbox), [NumberField](https://lokendra-builds.github.io/sheenui/forms/number-field), [Button](https://lokendra-builds.github.io/sheenui/components/button), [Alert](https://lokendra-builds.github.io/sheenui/components/alert). Each control page has the single-field version of this pattern; the [Field page](https://lokendra-builds.github.io/sheenui/forms/field) shows it with every control.


## Frequently asked questions

### When do I use register() and when Controller with SheenUI controls?

Text inputs use register(): Input forwards ref, onChange, onBlur and name, which is all register() hands out. Select and NumberField (value and onValueChange) and Checkbox (checked and onCheckedChange) are controlled, so they go through Controller and receive field.value, field.onChange, field.onBlur and field.ref. The sign-up example on this page uses both.

### How do I show a server error on one field?

Call setError with the field name and a message from the submit handler, for example setError("email", { message: "That email is already registered" }). FieldError renders it under the control, linked through aria-describedby and announced as an alert, the same as a zod error. Try an @example.com address in the first form above.

### Does SheenUI need react-hook-form or zod?

No. They are your app's dependencies, not SheenUI's, and the controls also work with plain React state through their value props. The examples were tested with react-hook-form 7.91, zod 4.6 and @hookform/resolvers 7.0.

### How do I stop a double submit?

Pass isSubmitting from react-hook-form to the Button as loading. The button sets aria-busy, ignores clicks while the async submit runs and keeps focus, so a second submit cannot start.


## Related pages

- [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)
- [Dark mode](https://lokendra-builds.github.io/sheenui/docs/dark-mode)
- [Built on Base UI](https://lokendra-builds.github.io/sheenui/docs/base-ui)
- [Right-to-left and localisation](https://lokendra-builds.github.io/sheenui/docs/rtl)
- [About SheenUI](https://lokendra-builds.github.io/sheenui/about)
- [Introduction](https://lokendra-builds.github.io/sheenui/)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
