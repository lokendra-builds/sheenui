import { Example } from "../../layout/Example";
import { EveryControl } from "./every-control";

const everyCode = `
import { Controller, useForm, useWatch } from "react-hook-form";
import { ColorField, Combobox, DatePicker, OtpInput, RadioGroup, Rating, SegmentedControl, Slider, Switch, TagsInput } from "@sheenui/theme";

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
}`;

export function EveryControlExample() {
  return (
    <Example
      title="Every control with Controller"
      description="The pattern never changes: value (or checked), the change handler, onBlur, ref and name. The values update live on the right."
      code={everyCode}
      stageClassName="items-start"
    >
      <EveryControl />
    </Example>
  );
}
