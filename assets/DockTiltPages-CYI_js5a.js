import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{i as n,n as r,o as i,r as a}from"./Page-BRuP8nt1.js";import{t as o}from"./Example-DaSezASZ.js";import{t as s}from"./lazy-block-BfzH_8EP.js";import{t as c}from"./ShowcaseStage-6bIrHuoy.js";import{t as l}from"./preload-helper-BrmCrVM7.js";var u=[[`children`,`ReactNode`,``,`The trigger card and the dialog content.`,!0],[`open`,`boolean`,``,"Whether the dialog is open (controlled); pair it with `onOpenChange`.",!1],[`defaultOpen`,`boolean`,`false`,`Open on first render (uncontrolled).`,!1],[`onOpenChange`,`((open: boolean) => void)`,``,`Called when the dialog opens or closes.`,!1]],d=[[`children`,`ReactNode`,``,`The dialog's buttons and other controls.`,!1],[`className`,`string`,``,`Adds extra classes to the row.`,!1]],f=[[`labels`,`Partial<MorphingDialogLabels>`,`defaultMorphingDialogLabels`,'Every string, for translation: `close` is the button\'s accessible name (default "Close"). Every other string, for translation: `labels={{ close: "…" }}`; omitted keys keep the English of `defaultMorphingDialogLabels`. Its only key is listed in the key table under the props table.',!1,{type:`MorphingDialogLabels`,const:`defaultMorphingDialogLabels`,keys:[[`close`,`Close`]]}],[`className`,`string`,``,`Adds extra classes to the button.`,!1]],p=[[`children`,`ReactNode`,``,`The dialog's content: media, title, subtitle, description and actions.`,!1],[`level`,`2 | 1 | 3`,`3`,`Sets the glass level of the dialog: 1 to 3.`,!1],[`radius`,`number`,`the theme's --sheen-radius-xl`,`Sets the corner radius in px.`,!1],[`showClose`,`boolean`,`true`,`Show the × button in the top-right corner.`,!1],[`labels`,`Partial<MorphingDialogLabels>`,`defaultMorphingDialogLabels`,'Every string, for translation: `{ close: "Close" }` (accessible name of the × button). Every other string, for translation: `labels={{ close: "…" }}`; omitted keys keep the English of `defaultMorphingDialogLabels`. Its only key is listed in the key table under the props table.',!1,{type:`MorphingDialogLabels`,const:`defaultMorphingDialogLabels`,keys:[[`close`,`Close`]]}],[`initialFocus`,`boolean | RefObject<HTMLElement | null> | ((openType: InteractionType) => boolean | HTMLElement | null | void)`,`the first control (the popup itself on touch)`,`Where focus goes when it opens (Base UI): a ref, false, or a function of the interaction type.`,!1],[`finalFocus`,`boolean | RefObject<HTMLElement | null> | ((closeType: InteractionType) => boolean | HTMLElement | null | void)`,`back to the card`,`Where focus goes when it closes (Base UI).`,!1],[`style`,`CSSProperties`,``,`Inline styles for the dialog (the corner radius is added).`,!1]],m=[[`children`,`ReactNode`,``,`Holds the description text (and non-glass figures).`,!1],[`className`,`string`,``,`Adds extra classes to the description.`,!1]],h=[[`children`,`ReactNode`,``,"The picture: an `<img>`, a video poster or artwork.",!1],[`radius`,`number`,`the theme's --sheen-radius-md`,`Sets the corner radius in px.`,!1],[`className`,`string`,``,`Extra classes (set the aspect ratio here, the same in the card and the dialog).`,!1],[`style`,`CSSProperties`,``,`Inline styles for the media box (the corner radius is added).`,!1]],g=[[`children`,`ReactNode`,``,`The text to show; it moves with the card while the dialog opens and closes.`,!1],[`className`,`string`,``,`Adds extra classes to the text element.`,!1]],_=[[`children`,`ReactNode`,``,`The text to show; it moves with the card while the dialog opens and closes.`,!1],[`className`,`string`,``,`Adds extra classes to the text element.`,!1]],v=[[`children`,`ReactNode`,``,"The card's content: usually `MorphingDialogMedia`, `MorphingDialogTitle` and `MorphingDialogSubtitle`.",!1],[`level`,`2 | 1 | 3`,`2`,`Glass level of the card: 1 = subtle, 2 = cards (default), 3 = most opaque.`,!1],[`tint`,`boolean`,`false`,`Tints the card with the accent colour.`,!1],[`radius`,`number`,`the theme's --sheen-radius-lg`,`Sets the corner radius in px.`,!1],[`style`,`CSSProperties`,``,`Inline styles for the card (the corner radius is added).`,!1]];e();var y=t(),b=`
import {
  Button,
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogMedia,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  useToast,
} from "@sheenui/theme";

const place = {
  name: "Lisbon",
  region: "Portugal",
  gradient: "from-amber-300 to-rose-500",
  body: "Seven hills, trams and pastel de nata.",
  facts: [
    ["Best month", "May"],
    ["Flight from Delhi", "12 h"],
  ],
};

export function Example() {
  const toast = useToast();
  // One card per place, in a <ul className="grid gap-4 sm:grid-cols-3">.

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="w-full p-2 pb-4">
        <MorphingDialogMedia className="aspect-[4/3]">
          <div aria-hidden className={\`size-full bg-gradient-to-br \${place.gradient}\`} />
        </MorphingDialogMedia>
        <MorphingDialogTitle className="px-2 pt-2">{place.name}</MorphingDialogTitle>
        <MorphingDialogSubtitle className="px-2">{place.region}</MorphingDialogSubtitle>
      </MorphingDialogTrigger>

      <MorphingDialogContent className="p-3 pb-6">
        <MorphingDialogMedia className="aspect-[4/3]">
          <div aria-hidden className={\`size-full bg-gradient-to-br \${place.gradient}\`} />
        </MorphingDialogMedia>
        <div className="px-3 pt-4">
          <MorphingDialogTitle>{place.name}</MorphingDialogTitle>
          <MorphingDialogSubtitle>{place.region}</MorphingDialogSubtitle>
        </div>
        <MorphingDialogDescription className="flex flex-col gap-4 px-3 pt-3">
          <p>{place.body}</p>
          <dl className="grid grid-cols-2 gap-3">
            {place.facts.map(([term, value]) => (
              <div key={term} className="rounded-sheen-md bg-sheen-hover px-3 py-2">
                <dt className="text-xs text-sheen-fg-muted">{term}</dt>
                <dd className="font-medium text-sheen-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </MorphingDialogDescription>
        {/* Controls go here, not in the description: each one fades itself in. */}
        <MorphingDialogActions className="px-3 pt-4">
          <Button onClick={() => toast.success(\`\${place.name} saved to your trips\`)}>Plan a trip</Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}`;function x(){return(0,y.jsxs)(r,{eyebrow:`Effect`,title:`Morphing dialog`,description:`A card that grows into a dialog: its surface, picture, title and subtitle fly to their places (shared layout), then the rest rises in. It is Base UI's Dialog underneath, so focus is trapped, Escape and outside clicks close it, and focus returns to the card. Reduced motion swaps the flight for a fade.`,source:`theme/src/components/morphing-dialog/morphing-dialog.tsx`,children:[(0,y.jsx)(c,{label:`Morphing dialog demo`,story:()=>l(()=>import(`./ShowcaseStage.morphing-dialog-CAJs5cLg.js`),[]),initial:{open:!1,nudge:!1},minHeight:`21rem`,onInterrupt:`keep`,children:(e,t)=>(0,y.jsx)(S,{scene:e,ctx:t})}),(0,y.jsx)(o,{title:`Gallery`,description:`Open a card, then close it with Escape, the × button or a click outside: everything flies back. Keep the media's aspect ratio the same in card and dialog.`,variant:`bare`,code:b,children:(0,y.jsx)(C,{})}),(0,y.jsx)(o,{title:`Compact card`,description:`No picture: just the surface and the text morph. The dialog takes any content, and its glass level and radius are props. Buttons go in MorphingDialogActions, where each one (glass included) fades itself in.`,code:`
import {
  Avatar,
  Button,
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  useToast,
} from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex-row items-center gap-3 p-3 pe-5">
        <Avatar name="Grace Hopper" />
        <span className="flex flex-col">
          <MorphingDialogTitle>Grace Hopper</MorphingDialogTitle>
          <MorphingDialogSubtitle>Rear admiral · Compilers</MorphingDialogSubtitle>
        </span>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="max-w-md gap-1 p-6 pe-14">
        <MorphingDialogTitle>Grace Hopper</MorphingDialogTitle>
        <MorphingDialogSubtitle>Rear admiral · Compilers</MorphingDialogSubtitle>
        <MorphingDialogDescription className="mt-3">
          Wrote the first compiler and helped design COBOL, so programs could be written in words
          instead of machine code. She kept a moth taped in her logbook: the first actual bug.
        </MorphingDialogDescription>
        <MorphingDialogActions className="mt-4">
          <Button size="sm" onClick={() => toast.success("Following Grace Hopper")}>Follow</Button>
          <Button size="sm" variant="glass" onClick={() => toast.info("Message drafted")}>Message</Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}`,children:(0,y.jsx)(w,{})}),(0,y.jsx)(a,{title:`MorphingDialog props`,of:u}),(0,y.jsx)(a,{title:`MorphingDialogTrigger props`,of:v}),(0,y.jsx)(a,{title:`MorphingDialogContent props`,of:p}),(0,y.jsx)(a,{title:`Parts`,rows:[[`MorphingDialogMedia`,`radius?: number`,`--sheen-radius-md`,`The picture that flies between card and dialog. Same aspect ratio in both.`],[`MorphingDialogTitle`,`children`,``,`Moves between card and dialog; in the dialog it is the h2 that names it.`],[`MorphingDialogSubtitle`,`children`,``,`A line under the title that moves too.`],[`MorphingDialogDescription`,`children`,``,`Dialog-only text that rises in after the flight; describes the dialog. Keep controls out of it.`],[`MorphingDialogActions`,`children, className`,``,`The dialog's buttons: the row rises in and each control fades itself, so glass buttons keep their blur.`],[`MorphingDialogClose`,`labels?: Partial<MorphingDialogLabels>`,`{ close: "Close" }`,`The × button, if you place it yourself (showClose={false}); labels.close is its accessible name.`]]}),(0,y.jsx)(a,{of:d,title:`MorphingDialogActions props`,as:`h3`}),(0,y.jsx)(a,{of:f,title:`MorphingDialogClose props`,as:`h3`}),(0,y.jsx)(a,{of:m,title:`MorphingDialogDescription props`,as:`h3`}),(0,y.jsx)(a,{of:h,title:`MorphingDialogMedia props`,as:`h3`}),(0,y.jsx)(a,{of:g,title:`MorphingDialogSubtitle props`,as:`h3`}),(0,y.jsx)(a,{of:_,title:`MorphingDialogTitle props`,as:`h3`}),(0,y.jsx)(i,{rows:[[`Enter / Space`,`Open the dialog from the card.`],[`Tab / Shift + Tab`,`Cycle inside; focus is trapped.`],[`Escape`,`Close it; focus returns to the card.`]]}),(0,y.jsx)(n,{items:[`The card is a native button with aria-haspopup="dialog"; the dialog is role="dialog", labeled by MorphingDialogTitle and described by MorphingDialogDescription. Always render a title.`,`Controls go in MorphingDialogActions, which fades each one in after the flight.`,`Under reduced motion the flight is removed and the dialog only fades; describe informative media with alt.`]})]})}var S=s(()=>l(()=>import(`./ShowcaseStage.morphing-dialog.scene-0-GufVaU.js`).then(e=>e.MorphingDialogScene),[]),{eager:!0,minHeight:`9rem`}),C=s(()=>l(()=>import(`./MorphingGalleryDemo-CBYK4V9L.js`).then(e=>e.MorphingGalleryDemo),[]),{eager:!0,minHeight:`22rem`}),w=s(()=>l(()=>import(`./MorphingCompactDemo-C_U9-Fd_.js`).then(e=>e.MorphingCompactDemo),[]),{minHeight:`4.25rem`});export{x as default};