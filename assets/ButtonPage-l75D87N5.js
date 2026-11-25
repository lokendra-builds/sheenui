import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{i,n as a,o,r as s}from"./Page-y_OVkLtr.js";import{t as c}from"./Example-B3x8pgFu.js";import{t as l}from"./ShowcaseStage-qzIATPiV.js";import{t as u}from"./preload-helper-BrmCrVM7.js";var d=[[`variant`,`"link" | "danger" | "primary" | "glass" | "outline" | "ghost"`,`"primary"`,`Look: "primary" (accent fill), "glass" (frosted), "outline" (edge only), "ghost" (text only), "link" (inline link look) or "danger" (destructive).`,!1],[`size`,`"sm" | "md" | "lg" | "icon"`,`"md"`,`Height and padding, the same scale as every form field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), or "icon" for a square as tall as "md".`,!1],[`loading`,`boolean`,`false`,`Shows a spinner, ignores clicks and sets aria-busy. Focus stays on the button.`,!1],[`leading`,`ReactNode`,``,`Renders an icon before the children.`,!1],[`trailing`,`ReactNode`,``,`Renders an icon after the children.`,!1],[`fullWidth`,`boolean`,`false`,`Stretch to the full width of the container.`,!1],[`stateLight`,`boolean`,`false`,'Lights the button by state: `loading` glows in the accent colour (`data-state="working"`), and a `data-state` of `"success"`, `"warning"` or `"error"` flashes its own glow once (an aura, a light pool and a lit edge, drawn on the button\'s own layer). The state is never conveyed by light alone: keep the label or icon that says it. Off with reduced transparency and forced colours; instant with reduced motion.',!1],[`nativeButton`,`boolean`,"true; false when `render` is a non-button element","Whether the rendered element is a native `<button>`. Defaults to true, or to false when `render` is something else (e.g. a link): then `type`/`disabled` are not added and the disabled state is announced with `aria-disabled` instead.",!1]],f=e(t()),p=n(),m=()=>(0,p.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-4 rtl:-scale-x-100`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,children:(0,p.jsx)(`path`,{d:`M5 12h14M13 6l6 6-6 6`})});function h(){let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(a,{eyebrow:`Component`,title:`Button`,description:`Lifts on hover, presses down on tap, and filled buttons catch a sweep of light. All movement turns off with reduced motion.`,source:`theme/src/components/button/button.tsx`,children:[(0,p.jsx)(l,{label:`Button demo`,story:()=>u(()=>import(`./ShowcaseStage.button-DeAPBSYj.js`),[]),initial:{loading:!1,pressed:!1,saved:!1},children:e=>(0,p.jsx)(r,{loading:e.loading,"data-stage-pressed":e.pressed?``:void 0,className:`min-w-44`,trailing:e.saved?(0,p.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-4`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.4`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,p.jsx)(`path`,{d:`m5 12.5 4.5 4.5L19 7.5`})}):void 0,children:e.loading?`Saving`:e.saved?`Saved`:`Save changes`})}),(0,p.jsxs)(c,{title:`Variants`,code:`
import { Button } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Button>Primary</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="danger">Delete</Button>
    </>
  );
}`,children:[(0,p.jsx)(r,{children:`Primary`}),(0,p.jsx)(r,{variant:`glass`,children:`Glass`}),(0,p.jsx)(r,{variant:`outline`,children:`Outline`}),(0,p.jsx)(r,{variant:`ghost`,children:`Ghost`}),(0,p.jsx)(r,{variant:`link`,children:`Link`}),(0,p.jsx)(r,{variant:`danger`,children:`Delete`})]}),(0,p.jsxs)(c,{title:`Sizes and icons`,code:`
import { Button } from "@sheenui/theme";
import { ArrowRight as Arrow } from "lucide-react";

export function Example() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button size="md" trailing={<Arrow />}>Continue</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" variant="glass" aria-label="Next"><Arrow /></Button>
    </>
  );
}`,children:[(0,p.jsx)(r,{size:`sm`,children:`Small`}),(0,p.jsx)(r,{size:`md`,trailing:(0,p.jsx)(m,{}),children:`Continue`}),(0,p.jsx)(r,{size:`lg`,children:`Large`}),(0,p.jsx)(r,{size:`icon`,variant:`glass`,"aria-label":`Next`,children:(0,p.jsx)(m,{})})]}),(0,p.jsxs)(c,{title:`Loading and disabled`,description:`Loading shows a spinner, disables the button and sets aria-busy.`,code:`
import { useState } from "react";
import { Button } from "@sheenui/theme";

export function Example() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
        Save changes
      </Button>
      <Button disabled>Disabled</Button>
    </>
  );
}`,children:[(0,p.jsx)(r,{loading:e,onClick:()=>{t(!0),setTimeout(()=>t(!1),1500)},children:`Save changes`}),(0,p.jsx)(r,{disabled:!0,children:`Disabled`})]}),(0,p.jsx)(s,{of:d,rows:[[`render`,`ReactElement`,``,`Render as another element with the button's look, e.g. a router link: render={<Link to="/" />}.`]]}),(0,p.jsx)(o,{rows:[[`Tab / Shift + Tab`,`Move focus to or from the button (visible focus ring).`],[`Enter / Space`,`Activate it. When render is a link, Enter follows the link like any link.`]]}),(0,p.jsx)(i,{items:[`A native <button type="button"> by default; with render it becomes a link or your router's Link with the same look.`,`While loading, the button stays focusable (aria-disabled, aria-busy) and ignores clicks, so focus is never lost.`,`An icon-only button (size="icon") needs an aria-label.`,`Touch targets are at least 44 x 44 px; forced colors keep a ButtonText border.`]})]})}export{h as default};