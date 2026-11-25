import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{a as r,i,n as a,r as o,t as s}from"./field-V-2GzbMO.js";import{t as c}from"./input-DALTA051.js";import{t as l}from"./switch-BETATXZg.js";import{n as u,r as d}from"./Page-y_OVkLtr.js";import{t as f}from"./ShowcaseStage-qzIATPiV.js";import{t as p}from"./Example-B3x8pgFu.js";import{t as m}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as h}from"./lazy-block-BfzH_8EP.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=[[`invalid`,`boolean`,`false`,"Marks the field invalid: the control gets `aria-invalid` and `FieldError` is shown.",!1],[`disabled`,`boolean`,`false`,`Disables the control inside the field.`,!1],[`required`,`boolean`,`false`,`Marks the control required and adds an asterisk to the label.`,!1],[`controlId`,`string`,`generated`,`Id of the control; a generated one is used when omitted.`,!1]],v=[[`children`,`ReactElement<Partial<FieldControlRenderProps>, string | JSXElementConstructor<any>> | ((props: FieldControlRenderProps) => ReactNode)`,``,`One control element, or a function that gets the wiring props and returns the control.`,!0]],y=[[`forceMatch`,`boolean`,`false`,"Show it even when the field is not marked `invalid` (for example a server error you render yourself).",!1]],b=[[`hint`,`ReactNode`,``,`Text shown after the label, such as "(optional)", muted.`,!1]],x=[[`required`,`boolean`,`false`,"Adds an asterisk after the text. It is decorative: mark the control `required` for assistive tech.",!1],[`hint`,`ReactNode`,``,`Text shown after the label, such as "(optional)", muted.`,!1]],S=e(t()),C=n();function w({scene:e,ctx:t}){let[n,l]=m(e.email),[u,d]=m(e.touched),f=u&&!/^\S+@\S+\.\S+$/.test(n);return(0,C.jsx)(`div`,{className:`sheen-stage-col`,children:(0,C.jsxs)(s,{required:!0,invalid:f,className:`sheen-stage-wide text-start`,children:[(0,C.jsx)(r,{children:`Email`}),(0,C.jsx)(a,{children:(0,C.jsx)(c,{type:`email`,value:n,onChange:e=>{l(e.target.value),u&&t.setState(/^\S+@\S+\.\S+$/.test(e.target.value)?`success`:`error`)},onBlur:()=>d(!0)})}),(0,C.jsx)(o,{children:`We only use it to send receipts.`}),(0,C.jsx)(i,{children:`Enter a valid email address.`})]})})}var T={eager:!0,minHeight:`80vh`},E=h(()=>g(()=>import(`./FieldControlsDemo-BOYdNTTU.js`).then(e=>e.FieldControlsDemo),[]),{minHeight:`6rem`}),D=h(()=>g(()=>import(`./FieldSizesDemo-DPWuZSC4.js`).then(e=>e.FieldSizesDemo),[]),{minHeight:`9rem`}),O=`
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
}`,k=`
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
}`,A=`
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
}`,j=`
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
}`,M=`
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
}`;function N(){let[e,t]=(0,S.useState)(``),[n,m]=(0,S.useState)(!1),[h,T]=(0,S.useState)(``),N=n&&!/^\S+@\S+\.\S+$/.test(e);return(0,C.jsxs)(u,{eyebrow:`Form`,title:`Field and Label`,description:`A composable wrapper that wires a label, a description and an error message to any control: ids, aria-describedby, aria-invalid, required and disabled, all generated for you.`,source:`theme/src/components/field/field.tsx`,keyboard:[[`Click the label`,`Focuses (or toggles) the control it names.`],[`Tab`,`Field adds no tab stops; focus order is the control's own.`]],a11y:[`FieldLabel is a real <label for> pointing at the control, so the control has an accessible name and a larger click target.`,`FieldDescription and FieldError ids are added to the control's aria-describedby only while they are rendered, merged with any aria-describedby the control already has.`,`FieldError is role="alert", so an error that appears after a submit or a blur is announced; it renders only while the field is invalid.`,`The required asterisk is aria-hidden; the control itself gets required, so assistive tech says it once.`,`Form libraries: every SheenUI input forwards ref, onBlur, name, required, disabled, aria-invalid and aria-describedby, so Field works with react-hook-form's Controller (pass invalid={fieldState.invalid} and the message as FieldError's children).`],children:[(0,C.jsx)(f,{label:`Field demo`,story:()=>g(()=>import(`./ShowcaseStage.field-BuRXnGxn.js`),[]),initial:{email:``,touched:!1},minHeight:`18rem`,onInterrupt:`keep`,children:(e,t)=>(0,C.jsx)(w,{scene:e,ctx:t})}),(0,C.jsx)(p,{title:`Label, description and error`,description:`The error shows after the field has been visited and is invalid. Type a bad address and tab away.`,code:O,children:(0,C.jsxs)(s,{required:!0,invalid:N,className:`max-w-sm`,children:[(0,C.jsx)(r,{children:`Email`}),(0,C.jsx)(a,{children:(0,C.jsx)(c,{type:`email`,value:e,onChange:e=>t(e.target.value),onBlur:()=>m(!0)})}),(0,C.jsx)(o,{children:`We only use it to send receipts.`}),(0,C.jsx)(i,{children:`Enter a valid email address.`})]})}),(0,C.jsx)(p,{title:`Any control`,description:`Base UI controls such as Switch join the field on their own. FieldControl wires a native element or your own component and merges with its props (its own disabled, required, aria-invalid and id win). Pass a function to place the props yourself.`,code:k,children:(0,C.jsxs)(`div`,{className:`flex w-full max-w-sm flex-col gap-5`,children:[(0,C.jsxs)(s,{children:[(0,C.jsx)(r,{hint:`(optional)`,children:`Notifications`}),(0,C.jsx)(l,{}),(0,C.jsx)(o,{children:`Email me about new features.`})]}),(0,C.jsxs)(s,{disabled:!0,children:[(0,C.jsx)(r,{children:`Sound volume`}),(0,C.jsx)(a,{children:e=>(0,C.jsx)(`input`,{type:`range`,...e})})]})]})}),(0,C.jsx)(p,{title:`With react-hook-form`,description:`Field takes the error from the form library: Controller hands the control its ref, name, value and onBlur, and the message becomes FieldError's children. The preview below runs the same markup on plain state.`,code:j,children:(0,C.jsxs)(s,{required:!0,invalid:n&&h===``,className:`max-w-sm`,children:[(0,C.jsx)(r,{children:`Full name`}),(0,C.jsx)(a,{children:(0,C.jsx)(c,{name:`name`,value:h,onChange:e=>T(e.target.value),onBlur:()=>m(!0)})}),(0,C.jsx)(i,{children:`Name is required.`})]})}),(0,C.jsx)(p,{title:`One size scale for buttons and fields`,description:`Input, Select, Combobox, NumberField, DatePicker, TagsInput, Textarea, OtpInput and the color field take size sm (32px), md (40px, default) or lg (48px), and so does Button: one height scale, so a button beside a field lines up at every size. On touch screens (any coarse pointer) sm and md grow to 44px.`,code:M,children:(0,C.jsx)(D,{})}),(0,C.jsx)(p,{title:`Every control with react-hook-form`,description:`One Row helper, one line per control. Each control takes ref, name, onBlur and aria-invalid from the Controller field, so a failed validation focuses the right control; the value prop and the change handler are the only things that differ (checked and onCheckedChange for Checkbox and Switch, a Date or a DateRange for the pickers, an array for TagsInput and FileUpload).`,code:A,children:(0,C.jsx)(E,{})}),(0,C.jsx)(d,{title:`Field props`,of:_}),(0,C.jsx)(d,{title:`Other parts`,as:`h3`,rows:[[`FieldDescription`,`p props`,``,`Helper text under the control; listed in aria-describedby.`],[`useField()`,`FieldContextValue | null`,``,`The ids and state of the surrounding Field, for building your own parts.`]]}),(0,C.jsx)(d,{of:v,title:`FieldControl props`,as:`h3`}),(0,C.jsx)(d,{of:y,title:`FieldError props`,as:`h3`}),(0,C.jsx)(d,{of:b,title:`FieldLabel props`,as:`h3`}),(0,C.jsx)(d,{of:x,title:`Label props`,as:`h3`})]})}h(()=>g(()=>import(`./NavigationMenuPageBody-DsAyxeJZ.js`).then(e=>e.NavigationMenuPage),[]),T);export{N as default};