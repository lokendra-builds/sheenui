import{t as e}from"./Example-CmMsgUlK.js";import{s as t}from"./Page-vzU90LKc.js";import{a as n,o as r,t as i}from"./index.esm-BARzzplc.js";import{t as a}from"./combobox-BWlP5KLV.js";import{t as o}from"./color-picker-CuSean0f.js";import{t as s}from"./date-picker-Bssj_s1w.js";import{t as c}from"./otp-input-DmZK-cFt.js";import{n as l}from"./radio-group-CuuzovOZ.js";import{t as u}from"./rating-D4JvxTO_.js";import{t as d}from"./segmented-U7hR4LXs.js";import{t as f}from"./slider-BYC-ZBPR.js";import{t as p}from"./switch-BETATXZg.js";import{t as m}from"./tags-input-El2jCIHL.js";import{t as h}from"./vendor-react-D30i__oY.js";var g=h(),_=[{value:`in`,label:`India`},{value:`de`,label:`Germany`},{value:`us`,label:`United States`}];function v(){let{control:e}=n({defaultValues:{volume:40,notify:!0,stars:4,birthday:null,country:null,tags:[`react`],view:`week`,code:``,billing:`monthly`,brand:`#7c5cff`}}),h=r({control:e});return(0,g.jsxs)(`div`,{className:`grid w-full gap-5 lg:grid-cols-2`,children:[(0,g.jsxs)(`form`,{noValidate:!0,onSubmit:e=>e.preventDefault(),className:`flex flex-col gap-4`,children:[(0,g.jsx)(i,{control:e,name:`volume`,render:({field:e})=>(0,g.jsx)(f,{label:`Volume`,value:e.value,onValueChange:t=>e.onChange(t),onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`notify`,render:({field:e})=>(0,g.jsx)(p,{label:`Email me about updates`,checked:e.value,onCheckedChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`stars`,render:({field:e})=>(0,g.jsx)(u,{label:`Rate it`,value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`birthday`,render:({field:e})=>(0,g.jsx)(s,{label:`Birthday`,value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`country`,render:({field:e})=>(0,g.jsx)(a,{label:`Country`,options:_,value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`tags`,render:({field:e})=>(0,g.jsx)(m,{label:`Topics`,value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`view`,render:({field:e})=>(0,g.jsx)(d,{"aria-label":`View`,items:[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`}],value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`code`,render:({field:e})=>(0,g.jsx)(c,{length:4,label:`Code`,value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`billing`,render:({field:e})=>(0,g.jsx)(l,{label:`Billing`,items:[{value:`monthly`,label:`Monthly`},{value:`yearly`,label:`Yearly`}],value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})}),(0,g.jsx)(i,{control:e,name:`brand`,render:({field:e})=>(0,g.jsx)(o,{label:`Brand colour`,value:e.value,onValueChange:e.onChange,onBlur:e.onBlur,ref:e.ref,name:e.name})})]}),(0,g.jsxs)(`div`,{className:`glass-2 h-fit rounded-sheen-xl p-4`,children:[(0,g.jsx)(`p`,{className:`m-0 mb-2 text-xs font-semibold text-sheen-fg-muted`,children:`Form values (watch)`}),(0,g.jsx)(t,{label:`Form values`,className:`m-0 overflow-x-auto font-sheen-mono text-xs leading-5 text-sheen-fg`,children:JSON.stringify(h,null,2)})]})]})}var y=`
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
}`;function b(){return(0,g.jsx)(e,{title:`Every control with Controller`,description:`The pattern never changes: value (or checked), the change handler, onBlur, ref and name. The values update live on the right.`,code:y,stageClassName:`items-start`,children:(0,g.jsx)(v,{})})}export{b as EveryControlExample};