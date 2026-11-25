import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{a as i,c as a,i as o,n as s,o as c,r as l,s as u,t as d}from"./dialog-C7vwdrRf.js";import{t as f}from"./input-DALTA051.js";import{r as p}from"./toast-PePh6sao.js";import{i as m,n as h,o as g,r as _}from"./Page-vzU90LKc.js";import{t as v}from"./ShowcaseStage-qzIATPiV.js";import{t as y}from"./ShowcaseStage.follow-C3IvOXPy.js";import{n as b}from"./ShowcaseStage.layer-C8jxHvTP.js";import{t as x}from"./Example-CmMsgUlK.js";import{t as S}from"./preload-helper-BrmCrVM7.js";var C=[[`mobile`,`MobilePresentation`,`"popup"`,'How the window opens on a phone-width screen (`max-width: 640px`): `"popup"` is the usual centred window; `"sheet"` is a bottom sheet with a drag handle, swipe-down to dismiss, a scrollable body capped at 85 dvh and home-indicator padding. Focus is trapped and returned and Escape closes in both.',!1]],w=[[`children`,`ReactNode`,``,"The dialog body: usually `DialogHeader`, your content and `DialogFooter`.",!1],[`showClose`,`boolean`,`true`,`Show the × button in the top-right corner.`,!1],[`labels`,`Partial<DialogLabels>`,`defaultDialogLabels`,'Translate the × button: `{ close: "Schließen" }`. Every other string, for translation: `labels={{ close: "…" }}`; omitted keys keep the English of `defaultDialogLabels`. Its only key is listed in the key table under the props table.',!1,{type:`DialogLabels`,const:`defaultDialogLabels`,keys:[[`close`,`Close`]]}],[`stateLight`,`boolean`,`false`,'Lights the open window with a soft accent glow: a lit edge and a light pool on the glass\'s own layer (`data-state="on"`; set `data-state` to `"working"`, `"success"`, `"warning"` or `"error"` to change it). Off with reduced transparency and forced colours. The window scrolls, so its outer aura is clipped: the glow reads inside the edge.',!1],[`container`,`HTMLElement | ShadowRoot | RefObject<HTMLElement | ShadowRoot | null> | null`,`the end of document.body`,`Where the window is portalled. Pass an element to keep it inside a region (a stage, a preview) instead of the end of the body.`,!1],[`backdrop`,`boolean`,`true`,"Render the dimmed scrim behind the window. Turn it off for a non-modal dialog (`modal={false}` on `Dialog`), where the page stays usable.",!1]],T=e(t()),E=n();function D({scene:e,ctx:t}){let[n,f]=y(e.open),[p,m]=y(e.step),{setState:h}=t,{layer:g,node:_}=b(t.host),v=p===2;return(0,E.jsxs)(`div`,{className:`sheen-stage-col`,children:[_,(0,E.jsx)(`p`,{className:`sheen-stage-title`,children:`Project members`}),(0,E.jsx)(`p`,{className:`sheen-stage-sub sheen-stage-slot`,children:v?(0,E.jsx)(`span`,{className:`sheen-stage-chip`,children:`2 invites sent`}):`Maya and Jonas are not on the team yet.`}),(0,E.jsxs)(d,{open:n,modal:!1,onOpenChange:e=>{f(e),h(e?`dim`:v?`lit`:`idle`)},children:[(0,E.jsx)(a,{render:(0,E.jsx)(r,{}),children:`Invite teammates`}),(0,E.jsxs)(l,{container:g,initialFocus:!1,backdrop:!1,className:`sheen-stage-dialog pointer-events-auto`,children:[(0,E.jsxs)(c,{children:[(0,E.jsx)(u,{children:v?`Invites sent`:`Invite your team`}),(0,E.jsx)(o,{className:`sheen-stage-desc`,children:v?`Maya and Jonas can open every project now.`:`They get access to every project as soon as they accept.`})]}),(0,E.jsx)(`p`,{className:`sheen-stage-sub`,children:`maya@example.com, jonas@example.com`}),(0,E.jsx)(i,{children:v?(0,E.jsx)(s,{render:(0,E.jsx)(r,{}),children:`Done`},`done`):(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(s,{render:(0,E.jsx)(r,{variant:`glass`}),children:`Cancel`}),(0,E.jsx)(r,{loading:p===1,onClick:()=>{m(2),h(`success`)},children:`Send invites`})]})})]})]})]})}function O(){let e=p(),[t,n]=(0,T.useState)(!1),[y,b]=(0,T.useState)(!1),[O,k]=(0,T.useState)(!1);return(0,E.jsxs)(h,{eyebrow:`Component`,title:`Dialog`,description:`A strong-glass modal that springs in. Focus is trapped inside, Escape closes it, and focus returns to the trigger, all from Base UI.`,source:`theme/src/components/dialog/dialog.tsx`,children:[(0,E.jsx)(v,{label:`Dialog demo`,story:()=>S(()=>import(`./ShowcaseStage.dialog-Xjk4yf2b.js`),[]),initial:{open:!1,step:0},minHeight:`21rem`,onInterrupt:`keep`,children:(e,t)=>(0,E.jsx)(D,{scene:e,ctx:t})}),(0,E.jsx)(x,{title:`Edit profile`,autoplayMode:`manual`,autoplay:()=>{k(!0),b(!0);let e=0,t=window.setTimeout(()=>{b(!1),e=window.setTimeout(()=>k(!1),600)},2400);return()=>{window.clearTimeout(t),window.clearTimeout(e),b(!1),e=window.setTimeout(()=>k(!1),600)}},code:`
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@sheenui/theme";

export function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes are saved to your account.</DialogDescription>
        </DialogHeader>
        <Input label="Name" defaultValue="Ada Lovelace" />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`,children:(0,E.jsxs)(d,{open:y,modal:!O,onOpenChange:e=>{k(!1),b(e)},children:[(0,E.jsx)(a,{render:(0,E.jsx)(r,{}),children:`Edit profile`}),(0,E.jsxs)(l,{initialFocus:!O,finalFocus:!O,children:[(0,E.jsxs)(c,{children:[(0,E.jsx)(u,{children:`Edit profile`}),(0,E.jsx)(o,{children:`Changes are saved to your account.`})]}),(0,E.jsx)(f,{label:`Name`,defaultValue:`Ada Lovelace`}),(0,E.jsx)(f,{label:`Username`,defaultValue:`ada-lovelace`,leading:(0,E.jsx)(`span`,{className:`text-xs`,children:`@`})}),(0,E.jsxs)(i,{children:[(0,E.jsx)(s,{render:(0,E.jsx)(r,{variant:`ghost`}),children:`Cancel`}),(0,E.jsx)(s,{render:(0,E.jsx)(r,{onClick:()=>e.success(`Profile saved`)}),children:`Save`})]})]})]})}),(0,E.jsxs)(x,{title:`Controlled, with a form`,description:`Open state lives in your component, so any button (or code) can open it and a successful submit can close it.`,code:`
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  useToast,
} from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite a teammate</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join the workspace.</DialogDescription>
          </DialogHeader>
          <form
            id="invite-form"
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
              toast.success("Invitation sent");
            }}
          >
            <Input label="Email" type="email" required placeholder="name@example.com" />
          </form>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" form="invite-form">Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}`,children:[(0,E.jsx)(r,{onClick:()=>n(!0),children:`Invite a teammate`}),(0,E.jsx)(d,{open:t,onOpenChange:n,children:(0,E.jsxs)(l,{children:[(0,E.jsxs)(c,{children:[(0,E.jsx)(u,{children:`Invite a teammate`}),(0,E.jsx)(o,{children:`They get an email with a link to join the workspace.`})]}),(0,E.jsx)(`form`,{id:`invite-form`,onSubmit:t=>{t.preventDefault(),n(!1),e.success(`Invitation sent`)},children:(0,E.jsx)(f,{label:`Email`,type:`email`,required:!0,placeholder:`name@example.com`})}),(0,E.jsxs)(i,{children:[(0,E.jsx)(s,{render:(0,E.jsx)(r,{variant:`ghost`}),children:`Cancel`}),(0,E.jsx)(r,{type:`submit`,form:`invite-form`,children:`Send invite`})]})]})})]}),(0,E.jsx)(x,{title:`Bottom sheet on phones`,phonePreview:!0,description:`mobile='sheet' presents the dialog as a bottom sheet under 640px wide: full width, a drag handle you can swipe down, content scrolling inside a 85dvh cap, safe-area padding. Escape, the close button and focus return work as before. The default, 'popup', keeps the centred window. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).`,code:`
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Dialog mobile="sheet">
      <DialogTrigger render={<Button>Share</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this file</DialogTitle>
          <DialogDescription>Anyone with the link can view it.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`,children:(0,E.jsxs)(d,{mobile:`sheet`,children:[(0,E.jsx)(a,{render:(0,E.jsx)(r,{children:`Share`})}),(0,E.jsxs)(l,{children:[(0,E.jsxs)(c,{children:[(0,E.jsx)(u,{children:`Share this file`}),(0,E.jsx)(o,{children:`Anyone with the link can view it.`})]}),(0,E.jsx)(i,{children:(0,E.jsx)(s,{render:(0,E.jsx)(r,{variant:`ghost`}),children:`Done`})})]})]})}),(0,E.jsx)(_,{of:C,rows:[[`Dialog open / defaultOpen`,`boolean`,`false`,`Controlled or uncontrolled open state.`],[`Dialog onOpenChange`,`(open) => void`,``,`Called when the dialog opens or closes.`],[`DialogTrigger / DialogClose render`,`ReactElement`,``,`Render as your own element, e.g. render={<Button />}.`],[`DialogContent initialFocus / finalFocus`,`ref | function | boolean`,`first control / trigger`,`Where focus goes when the dialog opens and closes (Base UI).`]]}),(0,E.jsx)(_,{of:w,title:`DialogContent props`,as:`h3`}),(0,E.jsx)(g,{rows:[[`Enter / Space`,`Open it from the trigger; focus moves inside.`],[`Tab / Shift + Tab`,`Cycle through the controls inside; focus cannot leave while it is open.`],[`Escape`,`Close it and return focus to the trigger.`]]}),(0,E.jsx)(m,{items:[`Built on Base UI's Dialog: role="dialog", named by DialogTitle and described by DialogDescription; the page behind is inert while it is open.`,`Focus is trapped, starts on the first control (or initialFocus) and returns to the trigger on close.`,`Always render a DialogTitle; showClose adds a labeled close button. Under reduced motion the dialog only fades.`]})]})}export{O as DialogPage};