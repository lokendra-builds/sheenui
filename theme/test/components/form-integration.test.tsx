// Every form control works with react-hook-form's `Controller` and with a native <form>:
// `ref` focuses the control after a failed validation, `onBlur` marks it touched, the value
// reaches `handleSubmit`, `aria-invalid` shows the validation state and `name` submits natively.

import { expect, it, vi } from "vitest";
import { useRef, type ReactNode } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import {
  Controller,
  useForm,
  type ControllerFieldState,
  type ControllerRenderProps,
  type RegisterOptions,
} from "react-hook-form";

import { Calendar } from "../../src/components/calendar/calendar";
import { Checkbox } from "../../src/components/checkbox/checkbox";
import { ColorField, ColorPicker } from "../../src/components/color-picker/color-picker";
import { Combobox } from "../../src/components/combobox/combobox";
import { DatePicker, DateRangePicker } from "../../src/components/date-picker/date-picker";
import { FileUpload } from "../../src/components/file-upload/file-upload";
import { NumberField } from "../../src/components/number-field/number-field";
import { OtpInput } from "../../src/components/otp-input/otp-input";
import { RadioGroup } from "../../src/components/radio-group/radio-group";
import { Rating } from "../../src/components/rating/rating";
import { SegmentedControl } from "../../src/components/segmented/segmented";
import { Select } from "../../src/components/select/select";
import { Slider } from "../../src/components/slider/slider";
import { Switch } from "../../src/components/switch/switch";
import { TagsInput } from "../../src/components/tags-input/tags-input";
import { renderUi } from "../render";

type Field = ControllerRenderProps<{ field: unknown }, "field">;
type Case = {
  name: string;
  initial: unknown;
  rules?: RegisterOptions<{ field: unknown }, "field">;
  control: (field: Field, state: ControllerFieldState) => ReactNode;
  /** Change the value the way a person would. */
  act: () => Promise<void>;
  /** The value `handleSubmit` receives afterwards. */
  expected: (value: unknown) => void;
  /** What a native `<form>` submits. */
  native?: (data: FormData) => void;
};

const fruit = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];
const TODAY = new Date(2026, 10, 8);
const required = { required: "Required" };
const day = (iso: string) => document.querySelector<HTMLElement>(`[data-day="${iso}"]`)!;
const dayPicked = (iso: string) => async () => {
  await expect.poll(() => document.querySelector(`[data-day="${iso}"]`)).not.toBeNull();
  await userEvent.click(day(iso));
};

function Harness({ c, onValid }: { c: Case; onValid: (value: unknown) => void }) {
  const form = useForm<{ field: unknown }>({ defaultValues: { field: c.initial } });
  const formRef = useRef<HTMLFormElement>(null);
  const { touchedFields, errors } = form.formState;
  return (
    <form
      ref={formRef}
      data-testid="form"
      noValidate
      onSubmit={(e) => void form.handleSubmit((v) => onValid(v.field))(e)}
    >
      <div data-testid="field">
        <Controller
          control={form.control}
          name="field"
          rules={c.rules}
          render={({ field, fieldState }) => <>{c.control(field, fieldState)}</>}
        />
      </div>
      <output data-testid="state">
        {JSON.stringify({ touched: Boolean(touchedFields.field), error: errors.field?.message ?? null })}
      </output>
      <button type="submit">Save</button>
    </form>
  );
}

const state = () => JSON.parse(screen.getByTestId("state").textContent) as { touched: boolean; error: string | null };
const save = () => userEvent.click(screen.getByRole("button", { name: "Save" }));

const cases: Case[] = [
  {
    name: "Select",
    initial: null,
    rules: required,
    control: (f, s) => (
      <Select
        label="Fruit"
        items={fruit}
        name={f.name}
        value={f.value as string | null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
      await userEvent.click(await screen.findByRole("option", { name: /Banana/ }));
    },
    expected: (v) => expect(v).toBe("banana"),
    native: (d) => expect(d.get("field")).toBe("banana"),
  },
  {
    name: "Combobox",
    initial: null,
    rules: required,
    control: (f, s) => (
      <Combobox
        label="Fruit"
        options={fruit}
        name={f.name}
        value={f.value as string | null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
      await userEvent.click(await screen.findByRole("option", { name: /Banana/ }));
    },
    expected: (v) => expect(v).toBe("banana"),
    native: (d) => expect(d.get("field")).toBe("banana"),
  },
  {
    name: "Slider",
    initial: 0,
    rules: { validate: (v) => Number(v) > 0 || "Required" },
    control: (f, s) => (
      <Slider
        label="Volume"
        name={f.name}
        value={f.value as number}
        onValueChange={(v) => f.onChange(v)}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      screen.getByRole("slider", { name: "Volume" }).focus();
      await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    },
    expected: (v) => expect(v).toBe(3),
    native: (d) => expect(d.get("field")).toBe("3"),
  },
  {
    name: "RadioGroup",
    initial: null,
    rules: required,
    control: (f, s) => (
      <RadioGroup
        label="Fruit"
        items={fruit}
        name={f.name}
        value={f.value as string | null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("radio", { name: /Banana/ }));
    },
    expected: (v) => expect(v).toBe("banana"),
    native: (d) => expect(d.get("field")).toBe("banana"),
  },
  {
    name: "OtpInput",
    initial: "",
    rules: required,
    control: (f, s) => (
      <OtpInput
        length={4}
        name={f.name}
        value={f.value as string}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getAllByRole("textbox")[0]!);
      await userEvent.keyboard("1234");
    },
    expected: (v) => expect(v).toBe("1234"),
    native: (d) => expect(d.get("field")).toBe("1234"),
  },
  {
    name: "TagsInput",
    initial: [],
    rules: required,
    control: (f, s) => (
      <TagsInput
        label="Tags"
        name={f.name}
        value={f.value as string[]}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("textbox", { name: "Tags" }));
      await userEvent.keyboard("red{Enter}green{Enter}");
    },
    expected: (v) => expect(v).toEqual(["red", "green"]),
    native: (d) => expect(d.getAll("field")).toEqual(["red", "green"]),
  },
  {
    name: "DatePicker",
    initial: null,
    rules: required,
    control: (f, s) => (
      <DatePicker
        label="Day"
        today={TODAY}
        name={f.name}
        value={f.value as Date | null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("button", { name: /Day/ }));
      await dayPicked("2026-11-10")();
    },
    expected: (v) => expect((v as Date).getDate()).toBe(10),
    native: (d) => expect(d.get("field")).toBe("2026-11-10"),
  },
  {
    name: "DateRangePicker",
    initial: null,
    rules: required,
    control: (f, s) => (
      <DateRangePicker
        label="Stay"
        today={TODAY}
        name={f.name}
        value={f.value as null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("button", { name: /Stay/ }));
      await dayPicked("2026-11-10")();
      await dayPicked("2026-11-12")();
    },
    expected: (v) => expect((v as { start: Date; end: Date }).end.getDate()).toBe(12),
    native: (d) => {
      expect(d.get("field-start")).toBe("2026-11-10");
      expect(d.get("field-end")).toBe("2026-11-12");
    },
  },
  {
    name: "ColorPicker",
    initial: "#ff0000",
    rules: { validate: (v) => v !== "#ff0000" || "Required" },
    control: (f, s) => (
      <ColorPicker
        aria-label="Colour"
        alpha={false}
        name={f.name}
        value={f.value as string}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      screen.getAllByRole("slider")[0]!.focus();
      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    },
    expected: (v) => expect(v).toMatch(/^#[0-9a-f]{6}$/i),
    native: (d) => expect(d.get("field")).toMatch(/^#[0-9a-f]{6}/i),
  },
  {
    name: "ColorField",
    initial: "#ff0000",
    rules: { validate: (v) => v !== "#ff0000" || "Required" },
    control: (f, s) => (
      <ColorField
        label="Brand"
        alpha={false}
        name={f.name}
        value={f.value as string}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      const input = screen.getByRole("textbox", { name: "Brand" });
      await userEvent.click(input);
      await userEvent.fill(input, "#00ff00");
    },
    expected: (v) => expect(v).toMatch(/^#00ff00/i),
    native: (d) => expect(d.get("field")).toMatch(/^#00ff00/i),
  },
  {
    name: "Rating",
    initial: null,
    rules: required,
    control: (f, s) => (
      <Rating
        label="Stars"
        name={f.name}
        value={f.value as number | null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getAllByRole("radio")[2]!);
    },
    expected: (v) => expect(v).toBe(3),
    native: (d) => expect(d.get("field")).toBe("3"),
  },
  {
    name: "FileUpload",
    initial: [],
    rules: required,
    control: (f, s) => (
      <FileUpload
        label="Files"
        name={f.name}
        value={f.value as never[]}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
      const data = new DataTransfer();
      data.items.add(new File(["hello"], "note.txt", { type: "text/plain" }));
      input.files = data.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await expect.poll(() => screen.queryByText("note.txt")).not.toBeNull();
      screen.getByRole("button", { name: /Files/ }).focus();
    },
    expected: (v) => expect((v as { file: File }[]).map((i) => i.file.name)).toEqual(["note.txt"]),
  },
  {
    name: "SegmentedControl",
    initial: "",
    rules: required,
    control: (f, s) => (
      <SegmentedControl
        aria-label="Range"
        items={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
        ]}
        name={f.name}
        value={f.value as string}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("button", { name: "Week" }));
    },
    expected: (v) => expect(v).toBe("week"),
    native: (d) => expect(d.get("field")).toBe("week"),
  },
  {
    name: "Calendar",
    initial: null,
    rules: required,
    control: (f, s) => (
      <Calendar
        aria-label="Date"
        today={TODAY}
        name={f.name}
        value={f.value as Date | null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: dayPicked("2026-11-10"),
    expected: (v) => expect((v as Date).getDate()).toBe(10),
    native: (d) => expect(d.get("field")).toBe("2026-11-10"),
  },
  {
    name: "NumberField",
    initial: null,
    rules: required,
    control: (f, s) => (
      <NumberField
        label="Qty"
        name={f.name}
        value={f.value as number | null}
        onValueChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        aria-invalid={s.invalid}
      />
    ),
    act: async () => {
      const input = screen.getByRole("textbox", { name: "Qty" });
      await userEvent.click(input);
      await userEvent.keyboard("7");
    },
    expected: (v) => expect(v).toBe(7),
    native: (d) => expect(d.get("field")).toBe("7"),
  },
  {
    name: "Checkbox",
    initial: false,
    rules: { validate: (v) => v === true || "Required" },
    control: (f, s) => (
      <Checkbox
        label="Accept"
        name={f.name}
        checked={f.value === true}
        onCheckedChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        error={s.error?.message}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("checkbox", { name: "Accept" }));
    },
    expected: (v) => expect(v).toBe(true),
  },
  {
    name: "Switch",
    initial: false,
    rules: { validate: (v) => v === true || "Required" },
    control: (f, s) => (
      <Switch
        label="Enable"
        name={f.name}
        checked={f.value === true}
        onCheckedChange={f.onChange}
        onBlur={f.onBlur}
        ref={f.ref}
        error={s.error?.message}
      />
    ),
    act: async () => {
      await userEvent.click(screen.getByRole("switch", { name: "Enable" }));
    },
    expected: (v) => expect(v).toBe(true),
  },
];

for (const c of cases) {
  it(`${c.name}: ref focuses the control after a failed validation and aria-invalid shows the state`, async () => {
    const { container } = renderUi(<Harness c={c} onValid={vi.fn()} />);
    await save();
    await expect.poll(() => state().error).toBe("Required");
    const field = screen.getByTestId("field");
    await expect.poll(() => field.contains(document.activeElement) && document.activeElement !== field).toBe(true);
    if (c.name !== "Calendar") {
      expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
    } else {
      expect(container.querySelector("[data-invalid]")).not.toBeNull();
    }
  });

  it(`${c.name}: onBlur marks it touched and the value reaches handleSubmit`, async () => {
    const onValid = vi.fn();
    renderUi(<Harness c={c} onValid={onValid} />);
    expect(state().touched).toBe(false);
    await c.act();
    if (c.native) c.native(new FormData(screen.getByTestId<HTMLFormElement>("form")));
    // Leave the control: focus lands on the Save button, outside the field.
    screen.getByRole("button", { name: "Save" }).focus();
    await expect.poll(() => state().touched).toBe(true);
    await save();
    await expect.poll(() => onValid.mock.calls.length).toBe(1);
    c.expected(onValid.mock.calls[0]![0]);
    expect(state().error).toBeNull();
  });
}
