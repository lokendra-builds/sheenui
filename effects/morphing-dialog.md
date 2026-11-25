Canonical: https://lokendra-builds.github.io/sheenui/effects/morphing-dialog

# Morphing Dialog for React: Card-to-Modal Motion

URL: https://lokendra-builds.github.io/sheenui/effects/morphing-dialog
Sidebar name: Morphing dialog

A morphing dialog for React: a card grows into a modal with Motion shared layout animation, on top of Base UI's accessible Dialog. Tailwind CSS v4, MIT.

What it is: A morphing dialog for React where a card grows into a modal: its image, title and surface fly into place with Motion's shared layout animation.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/morphing-dialog.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Morphing dialog

Files to copy from `theme/src/`:

- `components/morphing-dialog/`
- `hooks/{use-controllable.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{presets.ts, tokens.ts}`
- `lib/{cn.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: morphing-dialog. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Button } from "@/components/sheenui/button/button";
import { MorphingDialog, MorphingDialogActions, MorphingDialogContent, MorphingDialogDescription, MorphingDialogMedia, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger } from "@/components/sheenui/morphing-dialog/morphing-dialog";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use avatar, button, toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, Button, MorphingDialog, MorphingDialogActions, MorphingDialogContent, MorphingDialogDescription, MorphingDialogMedia, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger, useToast } from "@sheenui/theme";
```

## MorphingDialog props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | required | The trigger card and the dialog content. |
| open | boolean | optional, no default | Whether the dialog is open (controlled); pair it with onOpenChange. |
| defaultOpen | boolean | false | Open on first render (uncontrolled). |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called when the dialog opens or closes. |

## MorphingDialogTrigger props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The card's content: usually MorphingDialogMedia, MorphingDialogTitle and MorphingDialogSubtitle. |
| level | 2 \| 1 \| 3 | 2 | Glass level of the card: 1 = subtle, 2 = cards (default), 3 = most opaque. |
| tint | boolean | false | Tints the card with the accent colour. |
| radius | number | the theme's --sheen-radius-lg | Sets the corner radius in px. |
| style | CSSProperties | optional, no default | Inline styles for the card (the corner radius is added). |

## MorphingDialogContent props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The dialog's content: media, title, subtitle, description and actions. |
| level | 2 \| 1 \| 3 | 3 | Sets the glass level of the dialog: 1 to 3. |
| radius | number | the theme's --sheen-radius-xl | Sets the corner radius in px. |
| showClose | boolean | true | Show the × button in the top-right corner. |
| labels | Partial<MorphingDialogLabels> | defaultMorphingDialogLabels | Every string, for translation: { close: "Close" } (accessible name of the × button). Every other string, for translation: labels={{ close: "…" }}; omitted keys keep the English of defaultMorphingDialogLabels. Its only key is listed in the key table under the props table. |
| initialFocus | boolean \| RefObject<HTMLElement \| null> \| ((openType: InteractionType) => boolean \| HTMLElement \| null \| void) | the first control (the popup itself on touch) | Where focus goes when it opens (Base UI): a ref, false, or a function of the interaction type. |
| finalFocus | boolean \| RefObject<HTMLElement \| null> \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void) | back to the card | Where focus goes when it closes (Base UI). |
| style | CSSProperties | optional, no default | Inline styles for the dialog (the corner radius is added). |

## Parts

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| MorphingDialogMedia | radius?: number | --sheen-radius-md | The picture that flies between card and dialog. Same aspect ratio in both. |
| MorphingDialogTitle | children | optional, no default | Moves between card and dialog; in the dialog it is the h2 that names it. |
| MorphingDialogSubtitle | children | optional, no default | A line under the title that moves too. |
| MorphingDialogDescription | children | optional, no default | Dialog-only text that rises in after the flight; describes the dialog. Keep controls out of it. |
| MorphingDialogActions | children, className | optional, no default | The dialog's buttons: the row rises in and each control fades itself, so glass buttons keep their blur. |
| MorphingDialogClose | labels?: Partial<MorphingDialogLabels> | { close: "Close" } | The × button, if you place it yourself (showClose={false}); labels.close is its accessible name. |

## MorphingDialogActions props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The dialog's buttons and other controls. |
| className | string | optional, no default | Adds extra classes to the row. |

## MorphingDialogClose props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<MorphingDialogLabels> | defaultMorphingDialogLabels | Every string, for translation: close is the button's accessible name (default "Close"). Every other string, for translation: labels={{ close: "…" }}; omitted keys keep the English of defaultMorphingDialogLabels. Its only key is listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the button. |

## MorphingDialogDescription props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | Holds the description text (and non-glass figures). |
| className | string | optional, no default | Adds extra classes to the description. |

## MorphingDialogMedia props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The picture: an <img>, a video poster or artwork. |
| radius | number | the theme's --sheen-radius-md | Sets the corner radius in px. |
| className | string | optional, no default | Extra classes (set the aspect ratio here, the same in the card and the dialog). |
| style | CSSProperties | optional, no default | Inline styles for the media box (the corner radius is added). |

## MorphingDialogSubtitle props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The text to show; it moves with the card while the dialog opens and closes. |
| className | string | optional, no default | Adds extra classes to the text element. |

## MorphingDialogTitle props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The text to show; it moves with the card while the dialog opens and closes. |
| className | string | optional, no default | Adds extra classes to the text element. |

## Example 1 of 2: Gallery

Open a card, then close it with Escape, the × button or a click outside: everything flies back. Keep the media's aspect ratio the same in card and dialog.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { MorphingDialog, MorphingDialogActions, MorphingDialogContent, MorphingDialogDescription, MorphingDialogMedia, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger } from "@/components/sheenui/morphing-dialog/morphing-dialog";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Button, MorphingDialog, MorphingDialogActions, MorphingDialogContent, MorphingDialogDescription, MorphingDialogMedia, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger, useToast } from "@sheenui/theme";

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
          <div aria-hidden className={`size-full bg-gradient-to-br ${place.gradient}`} />
        </MorphingDialogMedia>
        <MorphingDialogTitle className="px-2 pt-2">{place.name}</MorphingDialogTitle>
        <MorphingDialogSubtitle className="px-2">{place.region}</MorphingDialogSubtitle>
      </MorphingDialogTrigger>

      <MorphingDialogContent className="p-3 pb-6">
        <MorphingDialogMedia className="aspect-[4/3]">
          <div aria-hidden className={`size-full bg-gradient-to-br ${place.gradient}`} />
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
          <Button onClick={() => toast.success(`${place.name} saved to your trips`)}>Plan a trip</Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}
```

## Example 2 of 2: Compact card

No picture: just the surface and the text morph. The dialog takes any content, and its glass level and radius are props. Buttons go in MorphingDialogActions, where each one (glass included) fades itself in.

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Button } from "@/components/sheenui/button/button";
import { MorphingDialog, MorphingDialogActions, MorphingDialogContent, MorphingDialogDescription, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger } from "@/components/sheenui/morphing-dialog/morphing-dialog";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Avatar, Button, MorphingDialog, MorphingDialogActions, MorphingDialogContent, MorphingDialogDescription, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger, useToast } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space | Open the dialog from the card. |
| Tab / Shift + Tab | Cycle inside; focus is trapped. |
| Escape | Close it; focus returns to the card. |

## Accessibility

- The card is a native button with aria-haspopup="dialog"; the dialog is role="dialog", labeled by MorphingDialogTitle and described by MorphingDialogDescription. Always render a title.
- Controls go in MorphingDialogActions, which fades each one in after the flight.
- Under reduced motion the flight is removed and the dialog only fades; describe informative media with alt.

## All exports on this page

- MorphingDialog — Morphing dialog: a card that grows into a dialog.
- MorphingDialogActions — The dialog's buttons and other controls (a row by default).
- MorphingDialogClose — The × button (added automatically by MorphingDialogContent unless showClose={false}).
- MorphingDialogContent — The dialog.
- MorphingDialogDescription — Text that only exists in the dialog.
- MorphingDialogMedia — The picture (an <img>, a video poster, artwork) that flies from the card into the dialog.
- MorphingDialogSubtitle — A line under the title (place, author, price) that also moves from the card into the dialog.
- MorphingDialogTitle — The title.
- MorphingDialogTrigger — The card.
- defaultMorphingDialogLabels — The English MorphingDialogLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the morphing dialog effect

- Use it as a card to modal animation for gallery and product cards that open into detail, where the picture, title and subtitle fly from the card into the dialog instead of a modal appearing from nowhere.
- Use it for a portfolio grid, a travel destination list or a recipe index, composing MorphingDialogTrigger with MorphingDialogContent and the shared Media, Title, Subtitle, Description and Actions pieces.
- Keep the media's aspect ratio the same in the card and in the dialog, otherwise the shared image stretches during the flight and the morph looks unclean.
- Skip it when the dialog is a form or a confirmation with no card to grow from; use Dialog for those, since a morph only makes sense when the trigger visibly becomes the content.
- Pair it with Button inside MorphingDialogActions so each control fades itself, Badge for a category label on the card, and GlassCard grids to lay the triggers out.


## Frequently asked questions

### How do I build a morphing dialog in React?

Wrap MorphingDialogTrigger and MorphingDialogContent in MorphingDialog. Put the same MorphingDialogMedia, Title and Subtitle in both so they share layout ids and fly into place, then add Description and Actions in the content. Use open and onOpenChange for control, or defaultOpen.

### How do focus and the keyboard work?

Enter or Space on the card opens it; focus moves in and is trapped, Escape closes, and focus returns to the card. Tab and Shift+Tab are handled by the dialog through every control, which keeps the trap exact in Safari. It is built on the Base UI Dialog.

### What does the trigger render, and how do I style it?

The trigger is a native button with aria-haspopup="dialog", named by its text. It accepts level (1 to 3, default 2) for the glass, tint for an accent surface and radius in px, which defaults to the theme's --sheen-radius-lg. Radii are scale-corrected so corners stay round mid-flight.

### What happens with reduced motion, and why use MorphingDialogActions?

With reduced motion nothing flies: the dialog simply fades in over the card and out again. Controls belong in MorphingDialogActions because each one fades itself; wrapping a glass button in a faded wrapper would switch its backdrop blur off while it appears.


## Related pages

- [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker)
- [Shimmer text](https://lokendra-builds.github.io/sheenui/effects/shimmer-text)
- [Spotlight card](https://lokendra-builds.github.io/sheenui/effects/spotlight-card)
- [3D tilt card](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card)
- [Typewriter](https://lokendra-builds.github.io/sheenui/effects/typewriter)
- [Word rotate](https://lokendra-builds.github.io/sheenui/effects/word-rotate)

### Guides that cover it

- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)
- [Framer Motion Is Now Motion](https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
