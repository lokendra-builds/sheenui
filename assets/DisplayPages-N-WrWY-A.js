import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{n,t as r}from"./avatar-CpgGSsX5.js";import{r as i}from"./toast-PePh6sao.js";import{i as a,n as o,o as s,r as c}from"./Page-vzU90LKc.js";import{t as l}from"./ShowcaseStage-qzIATPiV.js";import{t as u}from"./Example-CmMsgUlK.js";import"./demo-clock-CoEY-AlH.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`name`,`string`,``,`Full name: used for alt text and the initials fallback.`,!0],[`src`,`string`,``,`Image URL. While it loads (or if it fails) the initials show instead.`,!1],[`size`,`"sm" | "md" | "lg"`,`"md"`,`Sets the diameter: "sm" 32px, "md" 40px, "lg" 56px.`,!1],[`status`,`"online" | "away" | "offline"`,``,`Presence dot at the bottom-right corner: online, away or offline (a hollow ring). Hidden when omitted.`,!1],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]];e();var p=t(),m=[`Maya Chen`,`Jonas Berg`,`Priya Nair`,`Leo Alvarez`];function h({scene:e}){return(0,p.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,p.jsx)(`p`,{className:`sheen-stage-title`,children:`Design team`}),(0,p.jsx)(`div`,{className:`flex items-center gap-3`,children:m.map((t,n)=>(0,p.jsx)(r,{name:t,size:`lg`,status:n<e.online?`online`:`offline`},t))}),(0,p.jsx)(`p`,{className:`sheen-stage-sub sheen-stage-slot`,children:e.online===0?`Everyone is offline.`:`${e.online} of ${m.length} online`})]})}function g(){let e=i();return(0,p.jsxs)(o,{eyebrow:`Component`,title:`Avatar`,description:`A round glass avatar with an image, or gradient initials when there is no image. Optional online status.`,source:`theme/src/components/avatar/avatar.tsx`,children:[(0,p.jsx)(l,{label:`Avatar demo`,story:()=>d(()=>import(`./ShowcaseStage.avatar-BRGx5puJ.js`),[]),initial:{online:0},children:e=>(0,p.jsx)(h,{scene:e})}),(0,p.jsxs)(u,{title:`Sizes, status and groups`,code:`
import { Avatar, AvatarGroup } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Avatar name="Ada Lovelace" size="lg" status="online" />
      <Avatar name="Asha Verma" status="away" />
      <AvatarGroup>
        <Avatar name="Ravi Kumar" size="sm" />
        <Avatar name="Meera Iyer" size="sm" />
        <Avatar name="John Doe" size="sm" />
      </AvatarGroup>
    </>
  );
}`,children:[(0,p.jsx)(r,{name:`Ada Lovelace`,size:`lg`,status:`online`}),(0,p.jsx)(r,{name:`Asha Verma`,status:`away`}),(0,p.jsx)(r,{name:`Kabir Shah`,size:`sm`,status:`offline`}),(0,p.jsxs)(n,{children:[(0,p.jsx)(r,{name:`Ravi Kumar`}),(0,p.jsx)(r,{name:`Meera Iyer`}),(0,p.jsx)(r,{name:`John Doe`}),(0,p.jsx)(r,{name:`Sara Khan`})]})]}),(0,p.jsxs)(u,{title:`Clickable and labeled`,description:`An avatar is not interactive: wrap it in a button with a name, and label a group so people know who it shows.`,code:`
import { Avatar, AvatarGroup, useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <>
      <button
        type="button"
        aria-label="AL, open Ada Lovelace's profile"
        onClick={() => toast.success("Opening profile")}
        className="sheen-hit rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
      >
        <Avatar name="Ada Lovelace" status="online" />
      </button>

      <Avatar name="Grace Hopper" size="lg" status="away" />

      <AvatarGroup aria-label="Design team: Ravi, Meera and John">
        <Avatar name="Ravi Kumar" size="sm" />
        <Avatar name="Meera Iyer" size="sm" />
        <Avatar name="John Doe" size="sm" />
      </AvatarGroup>
    </>
  );
}`,children:[(0,p.jsx)(`button`,{type:`button`,"aria-label":`AL, open Ada Lovelace's profile`,onClick:()=>e.success(`Opening profile`),className:`sheen-hit rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus`,children:(0,p.jsx)(r,{name:`Ada Lovelace`,status:`online`})}),(0,p.jsx)(r,{name:`Grace Hopper`,size:`lg`,status:`away`}),(0,p.jsxs)(n,{"aria-label":`Design team: Ravi, Meera and John`,children:[(0,p.jsx)(r,{name:`Ravi Kumar`,size:`sm`}),(0,p.jsx)(r,{name:`Meera Iyer`,size:`sm`}),(0,p.jsx)(r,{name:`John Doe`,size:`sm`})]})]}),(0,p.jsx)(c,{of:f}),(0,p.jsx)(s,{rows:[[`Tab`,`Not focusable: an Avatar is not interactive. Wrap it in a button or link when it should be clickable.`]]}),(0,p.jsx)(a,{items:[`An image avatar uses the person's name as its alt text. The initials fallback is role="img" with the full name as its label.`,`The presence dot is its own labeled image (online, away, offline). Offline is a hollow ring, so states differ by shape, not only by color.`,`In AvatarGroup, pass an aria-label that says who the people are; each avatar keeps its own name.`,`Forced colors use system colors with an edge, so the status dot stays visible.`]})]})}export{g as default};