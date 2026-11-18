import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{i as r,n as i,o as a,r as o}from"./Page-BRuP8nt1.js";import{t as s}from"./Example-DaSezASZ.js";import{t as c}from"./ShowcaseStage-6bIrHuoy.js";import{n as l,t as u}from"./ShowcaseStage.tags-input.scene-M84xCUnH.js";import{t as d}from"./tags-input-D9X3XIhA.js";import{t as f}from"./preload-helper-BrmCrVM7.js";var p=e(t()),m=n(),h=[{value:`React`,description:`UI library`},{value:`TypeScript`,description:`Typed JavaScript`},{value:`Tailwind CSS`,description:`Utility-first CSS`},{value:`Motion`,description:`Animation library`},{value:`Base UI`,description:`Unstyled primitives`},{value:`Node.js`,description:`JavaScript runtime`},{value:`GraphQL`},{value:`PostgreSQL`},{value:`Design`},{value:`Accessibility`},{value:`Testing Library`},{value:`Vite`}],g=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;function _(){let[e,t]=(0,p.useState)([`React`,`TypeScript`]);return(0,m.jsxs)(i,{eyebrow:`Form`,title:`Tags input`,description:`Type and press Enter or a comma to turn text into a chip. Paste a list to add many at once, walk the chips with the arrow keys and remove them with Backspace. Duplicates make the existing chip pulse.`,source:`theme/src/components/tags-input/tags-input.tsx`,children:[(0,m.jsx)(c,{label:`Tags input demo`,story:()=>f(()=>import(`./ShowcaseStage.tags-input-kZrraaMk.js`),[]),initial:{tags:[`design`]},minHeight:`16rem`,onInterrupt:`keep`,children:(e,t)=>(0,m.jsx)(u,{scene:e,ctx:t})}),(0,m.jsx)(s,{title:`Basic`,description:`Enter or comma adds; Backspace at the start selects the last tag, a second Backspace removes it. Try pasting “glass, motion; a11y”.`,stageClassName:`items-start`,code:`
import { TagsInput } from "@sheenui/theme";

export function Example() {
  return (
    <TagsInput
      label="Topics"
      defaultValue={["design", "motion"]}
      placeholder="Add a topic…"
      description="Press Enter or comma to add."
    />
  );
}`,children:(0,m.jsx)(d,{label:`Topics`,defaultValue:[`design`,`motion`],placeholder:`Add a topic…`,description:`Press Enter or comma to add.`,className:`max-w-md`})}),(0,m.jsx)(s,{title:`Suggestions and a limit`,description:`Suggestions open under the field while you type (or on click). Matching text is highlighted; the counter turns accent at the limit.`,stageClassName:`items-start`,code:`
import { useState } from "react";
import { TagsInput } from "@sheenui/theme";

export function Example() {
  const [skills, setSkills] = useState(["React", "TypeScript"]);

  return (
      <TagsInput
        label="Skills"
        value={skills}
        onValueChange={setSkills}
        suggestions={[{ value: "React", description: "UI library" }, "GraphQL", "Node.js", "PostgreSQL"]}
        max={6}
        placeholder="Search or add a skill…"
      />
  );
}`,children:(0,m.jsxs)(`div`,{className:`flex w-full max-w-md flex-col gap-3`,children:[(0,m.jsx)(d,{label:`Skills`,value:e,onValueChange:t,suggestions:h,max:6,placeholder:`Search or add a skill…`}),(0,m.jsxs)(`p`,{className:`text-xs text-sheen-fg-muted`,children:[`Value: `,(0,m.jsx)(`code`,{className:`font-sheen-mono`,children:JSON.stringify(e)})]})]})}),(0,m.jsx)(s,{title:`Validation`,description:`Your own rule plus built-ins: each address must be valid and unique, lower-cased on the way in. Paste a whole list: the bad ones are reported, the rest are added.`,stageClassName:`items-start`,code:`
import { TagsInput } from "@sheenui/theme";

const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export function Example() {
  return (
    <TagsInput
      label="Invite by email"
      placeholder="name@example.com"
      delimiters={[",", " ", ";"]}
      transform={(t) => t.trim().toLowerCase()}
      validate={(t) => (EMAIL.test(t) ? null : \`“\${t}” isn’t an email address.\`)}
      max={10}
      name="invites"
    />
  );
}`,children:(0,m.jsx)(d,{label:`Invite by email`,placeholder:`name@example.com`,delimiters:[`,`,` `,`;`],transform:e=>e.trim().toLowerCase(),validate:e=>g.test(e)?null:`“${e}” isn’t an email address.`,max:10,name:`invites`,description:`Separate addresses with commas, spaces or new lines.`,className:`max-w-md`})}),(0,m.jsx)(o,{of:l}),(0,m.jsx)(a,{rows:[[`Enter / ,`,`Add what you typed (or the highlighted suggestion).`],[`Backspace`,`At the start of the field, select the last tag; press again to remove it.`],[`Arrow Left / Arrow Right`,`From the start of the field, walk the tags (flipped in right-to-left pages).`],[`Backspace / Delete on a tag`,`Remove it; focus moves to the neighboring tag.`],[`Any letter on a tag`,`Jump back to the field and type.`],[`Paste`,`"a, b; c" (or one per line) adds several tags.`]]}),(0,m.jsx)(r,{items:[`The field is a labeled input with a hidden keyboard hint; each tag has a name and a remove button ("Remove React").`,`Added, removed and rejected tags (duplicate, too long, over max) are announced politely, and the error is linked to the field.`,`During IME composition Enter confirms the text and never adds a tag.`]})]})}export{_ as TagsInputPage};