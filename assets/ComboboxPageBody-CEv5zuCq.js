import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./avatar-CZCKBYW_.js";import{t as i}from"./button-BFXhYCnI.js";import{t as a}from"./combobox-BzjH-Vn7.js";import{t as o}from"./glass-card-h1PKw39E.js";import{t as s}from"./input-Cq43qqb2.js";import{r as c}from"./toast-CiFfCngf.js";import{i as l,n as u,o as d,r as f}from"./Page-BRuP8nt1.js";import{t as p}from"./ShowcaseStage-6bIrHuoy.js";import{t as m}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as h}from"./Example-DaSezASZ.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=[[`options`,`ComboboxOption[]`,`[]`,"All options. With `loadOptions`, these are shown before the user types.",!1],[`label`,`ReactNode`,``,"Visible label above the field. Without one, pass `aria-label` or `aria-labelledby`.",!1],[`description`,`ReactNode`,``,"Helper text under the field; replaced by `error` when there is one.",!1],[`error`,`ReactNode`,``,`Shows an error message under the field. Marks the field invalid and is announced.`,!1],[`placeholder`,`string`,`"Search…"`,`Sets the placeholder of the text input.`,!1],[`onCreate`,`((label: string) => ComboboxOption | Promise<ComboboxOption>)`,``,`Let users add an option that isn't in the list. Return the new option (or a promise of it).`,!1],[`loadOptions`,`((query: string) => Promise<ComboboxOption[]>)`,``,`Fetch options from a server as the user types (debounced). Errors are caught and shown in the popup.`,!1],[`debounceMs`,`number`,`250`,"Sets the debounce for `loadOptions`, in ms.",!1],[`onError`,`((error: unknown) => void)`,``,"Called when `loadOptions` or `onCreate` throws, for logging. The UI already shows the error.",!1],[`onOpenChange`,`((open: boolean) => void)`,``,`Called with the new state when the popup opens or closes.`,!1],[`clearOnEscape`,`boolean`,`on for single, off for multiple`,`Escape on a closed popup clears the selection (ARIA combobox pattern). In a multiple Combobox it is off unless you set it, so one key press can't wipe every chip.`,!1],[`onFocus`,`FocusEventHandler<HTMLInputElement>`,``,`Runs when the text input gains focus.`,!1],[`onBlur`,`FocusEventHandler<HTMLInputElement>`,``,`Blur handler of the text input.`,!1],[`id`,`string`,`generated`,`Id of the text input; a generated one is used when omitted.`,!1],[`name`,`string`,``,`Submits the selected value(s) with a form.`,!1],[`required`,`boolean`,``,`Mark the field as required.`,!1],[`disabled`,`boolean`,``,`Disable the whole field.`,!1],[`readOnly`,`boolean`,``,`Show the value but do not let it change.`,!1],[`autoFocus`,`boolean`,``,`Focus the input on mount.`,!1],[`aria-label`,`string`,``,"Accessible name when there is no visible `label`.",!1],[`aria-labelledby`,`string`,``,`Id of an element that names the field.`,!1],[`aria-describedby`,`string`,``,`Id of extra descriptive text (the helper text is linked automatically).`,!1],[`aria-invalid`,`boolean | "true" | "false"`,``,"Force the invalid state (also set by `error`).",!1],[`size`,`FieldSize`,`"md"`,`Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button.`,!1],[`className`,`string`,``,`Class for the outer wrapper (label + field + helper text), same as Input and Select.`,!1],[`inputClassName`,`string`,``,`Class for the text <input> inside the field.`,!1],[`virtualized`,`boolean | "auto"`,`"auto"`,'Windows the option list so only the options near the viewport are in the DOM: `true` always, `false` never, `"auto"` only above 200 options (`VIRTUALIZE_THRESHOLD`). Keyboard navigation, `aria-activedescendant`, filtering and `aria-setsize` / `aria-posinset` work across every option, and the scroll height does not change. Windowed rows are a fixed height (one line; a `description` is cut to fit); options are listed group by group and group headings are visual only.',!1],[`emptyState`,`ReactNode`,`"No results found."`,`What shows when nothing matches (a string or any node).`,!1],[`labels`,`Partial<ComboboxLabels>`,`defaultComboboxLabels`,'Every other string, for translation: `labels={{ clear: "Effacer" }}`. A partial object is merged over `defaultComboboxLabels`. Every other string, for translation: `labels={{ otherGroup: "…" }}`; omitted keys keep the English of `defaultComboboxLabels`. All 15 keys of `ComboboxLabels` are listed in the key table under the props table.',!1,{type:`ComboboxLabels`,const:`defaultComboboxLabels`,keys:[[`otherGroup`,`Other`],[`placeholderMore`,`Add more…`],[`startTyping`,`Start typing to search.`],[`searching`,`Searching…`],[`error`,`Couldn’t load results.`],[`retry`,`Try again`],[`create`,"(q) => `Create “${q}”`"],[`createError`,"(q) => `Couldn’t create “${q}”. Try again.`"],[`clear`,`Clear selection`],[`trigger`,`Show options`],[`chips`,`Selected`],[`remove`,"(l) => `Remove ${l}`"],[`chipHint`,`Press Backspace or Delete to remove`],[`selectedHint`,"(n) => `${n} selected. From the start of the input, press Left Arrow to reach the selected items.`"],[`results`,'(n) => (n === 1 ? "1 result" : `${n} results`)']]}],[`multiple (= false)`,`false`,`false`,`Lets the person pick only one option.`,!1],[`multiple (= true)`,`true`,``,`Select2-style tags: pick many, shown as removable chips.`,!0],[`value (multiple = false)`,`string | null`,``,"The selected option's `value` (controlled). `null` is no selection.",!1],[`value (multiple = true)`,`string[]`,``,"Sets the selected `value`s when controlled.",!1],[`defaultValue (multiple = false)`,`string | null`,``,"The selected option's `value` on mount (uncontrolled).",!1],[`defaultValue (multiple = true)`,`string[]`,``,"The selected `value`s on mount (uncontrolled).",!1],[`onValueChange (multiple = false)`,`(value: string | null) => void`,``,"Called with the new value, or `null` when cleared.",!1],[`onValueChange (multiple = true)`,`(value: string[]) => void`,``,`Called with the new list of values.`,!1],[`maxSelected (multiple = true)`,`number`,``,`Stop adding chips after this many.`,!1]],v=e(t()),y=n(),b=[{value:`py`,label:`Python`,group:`Languages`},{value:`django`,label:`Django`,group:`Frameworks`},{value:`react`,label:`React`,group:`Frameworks`},{value:`temporal`,label:`Temporal`,group:`Infrastructure`},{value:`postgres`,label:`PostgreSQL`,group:`Infrastructure`}];function x({scene:e,ctx:t}){let[n,r]=m(e.picked);return(0,y.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:(0,y.jsx)(a,{multiple:!0,label:`Skills`,placeholder:`Search skills…`,options:b,value:n,onValueChange:e=>{r(e),t.setState(`idle`)},className:`w-full text-start`})})}var S=Array.from({length:5e3},(e,t)=>({value:String(t+1),label:`Item ${String(t+1).padStart(4,`0`)}`,group:t<2500?`First half`:`Second half`})),C=e=>(0,y.jsx)(`span`,{"aria-hidden":!0,className:`text-base leading-none`,children:e}),w=[{value:`in`,label:`India`,icon:C(`🇮🇳`),description:`+91`},{value:`us`,label:`United States`,icon:C(`🇺🇸`),description:`+1`},{value:`gb`,label:`United Kingdom`,icon:C(`🇬🇧`),description:`+44`},{value:`de`,label:`Germany`,icon:C(`🇩🇪`),description:`+49`},{value:`jp`,label:`Japan`,icon:C(`🇯🇵`),description:`+81`},{value:`br`,label:`Brazil`,icon:C(`🇧🇷`),description:`+55`},{value:`ae`,label:`United Arab Emirates`,icon:C(`🇦🇪`),description:`+971`},{value:`sg`,label:`Singapore`,icon:C(`🇸🇬`),description:`+65`}],T=[{value:`py`,label:`Python`,group:`Languages`},{value:`ts`,label:`TypeScript`,group:`Languages`},{value:`go`,label:`Go`,group:`Languages`},{value:`rs`,label:`Rust`,group:`Languages`},{value:`django`,label:`Django`,group:`Frameworks`},{value:`react`,label:`React`,group:`Frameworks`},{value:`fastapi`,label:`FastAPI`,group:`Frameworks`},{value:`temporal`,label:`Temporal`,group:`Infrastructure`},{value:`postgres`,label:`PostgreSQL`,group:`Infrastructure`},{value:`docker`,label:`Docker`,group:`Infrastructure`}],E=[{value:`design`,label:`design`},{value:`frontend`,label:`frontend`},{value:`bug`,label:`bug`},{value:`urgent`,label:`urgent`}],D=[`Ada Lovelace`,`Asha Verma`,`Ravi Kumar`,`Meera Iyer`,`Kabir Shah`,`Sara Khan`,`John Doe`,`Priya Nair`,`Arjun Mehta`,`Neha Gupta`,`Vikram Rao`,`Ananya Das`];async function O(e){return await new Promise(e=>setTimeout(e,600)),D.filter(t=>t.toLowerCase().includes(e.toLowerCase())).map(e=>({value:e.toLowerCase().replace(/\s+/g,`-`),label:e,description:`${(e.split(` `)[0]??e).toLowerCase()}@example.com`,icon:(0,y.jsx)(r,{name:e,size:`sm`,className:`[&>span]:size-6 [&>span]:text-[0.6rem]`})}))}function k({title:e,description:t,children:n,action:r}){return(0,y.jsxs)(o,{level:2,className:`flex w-full max-w-md flex-col gap-5 p-5 sm:p-6`,children:[(0,y.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,y.jsx)(`h3`,{className:`text-lg font-semibold tracking-tight`,children:e}),(0,y.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:t})]}),n,(0,y.jsx)(`div`,{className:`flex justify-end`,children:r})]})}var A=`min-h-[30rem] items-start justify-center sm:p-8`;function j(){let e=c(),[t,n]=(0,v.useState)(`in`),[r,o]=(0,v.useState)([`py`,`django`,`react`]);return(0,y.jsxs)(u,{eyebrow:`Component`,title:`Combobox (Select2)`,description:`A searchable select, like the classic Select2: type to filter, pick one or many as animated chips, group options, create new ones, or search a server as you type. Built on Base UI's accessible Combobox.`,source:`theme/src/components/combobox/combobox.tsx`,children:[(0,y.jsx)(p,{label:`Combobox demo`,story:()=>g(()=>import(`./ShowcaseStage.combobox-D-8ZloCi.js`),[]),initial:{picked:[]},minHeight:`19rem`,children:(e,t)=>(0,y.jsx)(x,{scene:e,ctx:t})}),(0,y.jsx)(h,{title:`Searchable, single`,description:`Type to filter. Arrow keys move, Enter picks, Escape closes.`,frame:`example.com/checkout/shipping`,stageClassName:A,code:`
import { useState } from "react";
import { Combobox } from "@sheenui/theme";

export function Example() {
  const [country, setCountry] = useState<string | null>("in");

  return (
    <Combobox
      label="Country"
      placeholder="Search countries…"
      options={[
        { value: "in", label: "India", icon: "🇮🇳", description: "+91" },
        { value: "us", label: "United States", icon: "🇺🇸", description: "+1" },
        { value: "gb", label: "United Kingdom", icon: "🇬🇧", description: "+44" },
        { value: "de", label: "Germany", icon: "🇩🇪", description: "+49" },
      ]}
      value={country}
      onValueChange={setCountry}
    />
  );
}`,children:(0,y.jsx)(k,{title:`Shipping`,description:`Where should we send your order?`,action:(0,y.jsx)(i,{onClick:()=>e.success(`Saved`,`Shipping country updated.`),children:`Continue`}),children:(0,y.jsx)(a,{label:`Country`,placeholder:`Search countries…`,options:w,value:t,onValueChange:n})})}),(0,y.jsx)(h,{title:`Multiple with chips, groups and a limit`,description:`Chips pop in and out. Backspace removes the last one; Left Arrow moves into the chips.`,frame:`example.com/profile`,stageClassName:A,code:`
import { useState } from "react";
import { Combobox } from "@sheenui/theme";

export function Example() {
  const [picked, setPicked] = useState<string[]>(["py", "django", "react"]);

  return (
    <Combobox
      multiple
      maxSelected={5}
      label="Skills"
      options={[
        { value: "py", label: "Python", group: "Languages" },
        { value: "django", label: "Django", group: "Frameworks" },
        { value: "temporal", label: "Temporal", group: "Infrastructure" },
        { value: "react", label: "React", group: "Frameworks" },
        { value: "postgres", label: "PostgreSQL", group: "Infrastructure" },
      ]}
      value={picked}
      onValueChange={setPicked}
    />
  );
}`,children:(0,y.jsx)(k,{title:`Your profile`,description:`Skills show on your public profile.`,action:(0,y.jsx)(i,{onClick:()=>e.success(`Profile saved`),children:`Save`}),children:(0,y.jsx)(a,{multiple:!0,maxSelected:5,label:`Skills`,description:`Pick up to 5.`,placeholder:`Search skills…`,options:T,value:r,onValueChange:o})})}),(0,y.jsx)(h,{title:`Creatable tags`,description:`Type something new and choose “Create …” to add it.`,frame:`example.com/issues/new`,stageClassName:A,code:`
import { Combobox, type ComboboxOption } from "@sheenui/theme";

const tags: ComboboxOption[] = [
  { value: "design", label: "design" },
  { value: "frontend", label: "frontend" },
  { value: "bug", label: "bug" },
  { value: "urgent", label: "urgent" },
];

export function Example() {
  return (
    <Combobox
      multiple
      label="Labels"
      options={tags}
      defaultValue={["design"]}
      onCreate={(label) => ({ value: label.toLowerCase(), label })}
    />
  );
}`,children:(0,y.jsxs)(k,{title:`New issue`,description:`Label it so the right people see it.`,action:(0,y.jsx)(i,{onClick:()=>e.success(`Issue created`),children:`Create issue`}),children:[(0,y.jsx)(s,{label:`Title`,defaultValue:`Glass looks gray on a flat background`}),(0,y.jsx)(a,{multiple:!0,label:`Labels`,placeholder:`Add labels…`,options:E,defaultValue:[`design`],onCreate:t=>(e.success(`Label created`,`“${t}” was added.`),{value:t.toLowerCase(),label:t})})]})}),(0,y.jsx)(h,{title:`Async search`,description:`Results come from a (pretend) server as you type, with a loading state. Try “ra” or “sh”.`,frame:`example.com/settings/members`,stageClassName:A,code:`
import { Combobox } from "@sheenui/theme";

export function Example() {
  return (
    <Combobox
      multiple
      label="Invite people"
      placeholder="Search by name…"
      loadOptions={async (query) => {
        const res = await fetch(\`/api/people?q=\${encodeURIComponent(query)}\`);
        return res.json(); // [{ value, label, description?, icon? }]
      }}
    />
  );
}`,children:(0,y.jsx)(k,{title:`Invite to workspace`,description:`They get an email with a link to join.`,action:(0,y.jsx)(i,{onClick:()=>e.success(`Invites sent`),children:`Send invites`}),children:(0,y.jsx)(a,{multiple:!0,label:`Invite people`,placeholder:`Search by name…`,loadOptions:O})})}),(0,y.jsx)(h,{title:`Thousands of options`,description:`Windowed above 200 options (virtualized defaults to auto): filtering runs over all 5,000, only the visible rows are in the DOM, the arrow keys and aria-activedescendant follow the active option, and group headings stay in order. Type 'Item 4999' or arrow down.`,stageClassName:`min-h-96`,code:`
import { Combobox } from "@sheenui/theme";

const options = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: \`Item \${String(i + 1).padStart(4, "0")}\`,
  group: i < 2500 ? "First half" : "Second half",
}));

export function Example() {
  return <Combobox label="Item" options={options} virtualized />;
}`,children:(0,y.jsx)(`div`,{className:`w-72`,children:(0,y.jsx)(a,{label:`Item`,options:S,virtualized:!0})})}),(0,y.jsx)(f,{of:_}),(0,y.jsx)(d,{rows:[[`Type`,`Filter the options.`],[`Arrow Down / Arrow Up`,`Move through the options; Arrow Down opens the list.`],[`Enter`,`Pick the highlighted option (or create one, with onCreate).`],[`Escape`,`Close the list; on a closed list it clears a single selection.`],[`Backspace`,`Multiple: remove the last chip when the input is empty.`],[`Arrow Left / Arrow Right`,`Multiple: move between the chips from the start of the input.`]]}),(0,y.jsx)(l,{items:[`The ARIA combobox pattern: an input with aria-expanded and aria-controls plus a listbox of options.`,`Result counts, loading, errors and the "create" option are announced politely; focus never leaves the input.`,`error marks the field invalid and is linked to it; chips have remove buttons with names.`,`Without a visible label, pass aria-label or aria-labelledby. Every string is translatable through the label props.`]})]})}export{j as ComboboxPage};