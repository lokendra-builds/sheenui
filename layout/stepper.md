Canonical: https://lokendra-builds.github.io/sheenui/layout/stepper

# React Stepper for Multi-Step Forms

URL: https://lokendra-builds.github.io/sheenui/layout/stepper
Sidebar name: Stepper

An animated React stepper for multi-step flows: lines fill as you advance, steps can be revisited or flag errors, and phones get a compact bar.

What it is: An animated React stepper for multi-step forms and checkouts that collapses to “Step 2 of 4” on phones.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/stepper.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Stepper

Files to copy from `theme/src/`:

- `components/stepper/`
- `components/status-icons/`
- `hooks/use-latest.ts`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx tailwind-merge
```

Registry item: stepper. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Stepper, type StepperStep } from "@/components/sheenui/stepper/stepper";
import { Switch } from "@/components/sheenui/switch/switch";
```

These examples also use button, switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Stepper, type StepperStep, Switch } from "@sheenui/theme";
```

## Stepper

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| steps | StepperStep[] | required | The steps to show, in order. |
| current | number | required | Index of the current step (0-based). steps.length = all complete. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Direction the steps are laid out in. |
| labelPlacement | "end" \| "bottom" | "bottom" | Horizontal only: labels under the dots ("bottom", default) or beside them ("end"). |
| onStepClick | ((index: number) => void) | optional, no default | Makes steps clickable buttons. |
| clickable | "all" \| "completed" | "completed" | Which steps onStepClick applies to: "completed" (default) or "all". |
| collapse | "auto" \| "never" \| "always" | "auto" | Horizontal only: "auto" (default) collapses to "Step x of y" when there is not enough room. |
| minStepWidth | number | 136 | Room (px) each step needs before "auto" collapses. |
| size | "sm" \| "md" | "md" | Sets the dot and text size. |
| labels | Partial<StepperLabels> | defaultStepperLabels | Override the strings (i18n). Give each stepper on a page its own nav. Every other string, for translation: labels={{ nav: "…" }}; omitted keys keep the English of defaultStepperLabels. All 10 keys of StepperLabels are listed in the key table under the props table. |
| className | string | optional, no default | Extra classes for the <nav> that wraps the steps (set its width or spacing here). |

## Example 1 of 3: Checkout

Click a completed step to go back to it. Toggle the error to see a step flag itself; screen readers hear each step's state.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Stepper } from "@/components/sheenui/stepper/stepper";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Button, Stepper, Switch } from "@sheenui/theme";

export function Example() {
  const [current, setCurrent] = useState(1);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <Switch label="Payment fails" checked={failed} onCheckedChange={setFailed} />
      <Stepper
        current={current}
        onStepClick={setCurrent}            // completed steps become buttons
        labels={{ nav: "Checkout progress" }}
        steps={[
          { title: "Cart", description: "3 items" },
          { title: "Shipping", description: "Address and speed" },
          { title: "Payment", description: "Card or wallet", status: failed ? "error" : undefined },
          { title: "Review", description: "Confirm and pay" },
        ]}
      />
      <Button variant="ghost" onClick={() => setCurrent((c) => c - 1)}>Back</Button>
      <Button onClick={() => setCurrent((c) => c + 1)}>Continue</Button>
    </>
  );
}
```

## Example 2 of 3: Vertical, with content

The current step reveals its own content. Optional steps say so.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Stepper } from "@/components/sheenui/stepper/stepper";
// Package build (after the first npm release, or a packed tarball): import { Button, Stepper } from "@sheenui/theme";

export function Example() {
  const [current, setCurrent] = useState(0);

  // "Continue" inside a step's content unmounts with it: focus moves to the next step for you.

  return (
    <Stepper
      orientation="vertical"
      current={current}
      onStepClick={setCurrent}
      labels={{ nav: "Workspace setup" }}
      steps={[
        { title: "Create a workspace", description: "Name it and pick a region", content: <p>Workspace name and region go here.</p> },
        { title: "Invite your team", optional: true, content: <p>Email addresses go here.</p> },
        { title: "Connect a repository", description: "Import repositories", content: <Button variant="glass">Connect a repository</Button> },
        { title: "Ship it", description: "Your first deploy" },
      ]}
    />
  );
}
```

## Example 3 of 3: Labels beside, compact, translated

labelPlacement="end" puts titles next to the dots. The compact view is what phones get automatically. Every string, punctuation included, comes from labels.

```tsx
import { Stepper, type StepperStep } from "@/components/sheenui/stepper/stepper";
// Package build (after the first npm release, or a packed tarball): import { Stepper, type StepperStep } from "@sheenui/theme";

const steps: StepperStep[] = [
  { title: "Cart", description: "3 items" },
  { title: "Shipping" },
  { title: "Payment" },
  { title: "Review" },
];

export function Example() {
  return (
    <>
      {/* Labels beside the dots, small size */}
      <Stepper labelPlacement="end" size="sm" current={1} steps={steps.map(({ title }) => ({ title }))} />

      {/* Phones: "auto" (the default) collapses to "Step 2 of 4" when steps get narrower than minStepWidth; "always" forces the compact view. */}
      <Stepper collapse="always" current={1} steps={steps} />

      {/* Every string is a label, punctuation included (French shown): */}
      <div lang="fr">
        <Stepper
          collapse="always"
          current={1}
          steps={[{ title: "Panier", description: "3 articles" }, { title: "Livraison" }, { title: "Paiement" }]}
          labels={{
            nav: "Progression",
            stepOf: (step, total) => `Étape ${step} sur ${total}`,
            complete: "terminée",
            current: "étape en cours",
            upcoming: "à venir",
            error: "à corriger",
            status: (words) => ` : ${words.join(", ")}`,
            next: (title) => <>Suivante : <strong>{title}</strong></>,
          }}
        />
      </div>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Clickable steps are normal tab stops; non-clickable steps are not focusable. |
| Enter / Space | Go to the focused step. |

## Accessibility

- An ordered list (<ol>) in a <nav>; the current step has aria-current="step" and every state (complete, current, upcoming, error) is also spoken.
- When current changes, keyboard focus stays in the stepper (it moves to the next step if its button disappeared).
- The compact "Step 2 of 4" view keeps the same information; every string is translatable through labels.

## All exports on this page

- Stepper — Stepper: progress through a multi-step flow (checkout, onboarding, setup wizards).
- defaultStepperLabels — Default English strings of StepperLabels; spread it and override single keys to reword.


## When to use Stepper

- Use it as the progress steps of a multi-step form, such as a checkout with Cart, Shipping, Payment and Review, where completed steps can be revisited and a failed payment step can flag itself with an error state.
- Use orientation="vertical" with per-step content for an onboarding or setup wizard, where the current step reveals its own form and optional steps are labeled as such.
- Use it for a long application form on phones, where the automatic compact view shows Step 2 of 4 with a segmented bar instead of cramped titles.
- Skip it when the user can move between views freely with no order; Tabs is the right pattern for parallel views, and Breadcrumb shows where a page sits in the site hierarchy.
- Pair it with Button for Back and Next, Field and Input for each step's form, and Progress when you also want a continuous completion value.


## Frequently asked questions

### How do I build a react stepper for a multi-step form?

Pass steps, an array of objects with title and optional description, status, optional, icon, disabled and content, plus current, the zero-based index of the current step. Setting current to steps.length marks everything complete. Keep current in your own state and advance it from your Next button.

### How do I let users go back to earlier steps?

Pass onStepClick, which turns steps into buttons. By default clickable is completed, so only finished steps respond; set it to all to allow jumping anywhere. Clickable steps are real buttons and normal tab stops, and Enter or Space goes to the focused step. The current step is a button too but does nothing when pressed, and non-clickable steps are not focusable.

### How is the stepper announced to screen readers?

It renders an ordered list inside a nav, the current step has aria-current="step", and each state, complete, current, upcoming or error, is also spoken. Give several steppers on one page their own nav label through the labels prop, which also translates every string.

### When does it switch to the compact view?

With collapse set to auto, the horizontal stepper collapses to Step 2 of 4 with a segmented bar when each step has less than minStepWidth, 136px by default. Use always or never to force it. The vertical orientation does not collapse; it lists steps in a column.


## Related pages

- [Timeline](https://lokendra-builds.github.io/sheenui/layout/timeline)
- [Toolbar](https://lokendra-builds.github.io/sheenui/layout/toolbar)
- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Aspect ratio](https://lokendra-builds.github.io/sheenui/layout/aspect-ratio)
- [Breadcrumb](https://lokendra-builds.github.io/sheenui/layout/breadcrumb)
- [Collapsible](https://lokendra-builds.github.io/sheenui/layout/collapsible)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
