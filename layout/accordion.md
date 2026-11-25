Canonical: https://lokendra-builds.github.io/sheenui/layout/accordion

# Animated Accordion for React with Spring Motion

URL: https://lokendra-builds.github.io/sheenui/layout/accordion
Sidebar name: Accordion

An animated React accordion: height follows a spring on open and a quick ease on close, the chevron turns and content drifts in. Base UI, Tailwind v4.

What it is: An animated React accordion whose sections open on a spring, with every trigger a real button in the tab order. Use it as a React accordion for an FAQ section on a pricing or landing page, where the default glass variant puts all questions in one card and the open item rises as a lighter pane.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/accordion.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Accordion

Files to copy from `theme/src/`:

- `components/accordion/`
- `lib/{cn.ts, heading.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: accordion. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/sheenui/accordion/accordion";
import { Button } from "@/components/sheenui/button/button";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
```

These examples also use button, glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger, Button, GlassCard } from "@sheenui/theme";
```

## Accordion

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| variant | AccordionVariant | "glass" | Surface style: "glass" is one glass card, "separated" gives every item its own card, "plain" has no surface. |
| className | string | optional, no default | Adds extra classes to the outer element. |
| multiple | boolean | false | Let several items stay open at once. |
| defaultValue | any[] | optional, no default | Values of the items open at first (uncontrolled). |
| value / onValueChange | any[] / (value) => void | optional, no default | Control which items are open. |
| hiddenUntilFound | boolean | false | Closed panels stay in the page so the browser's find-in-page can open them. |
| disabled | boolean | false | Disables every item of the group. |

## AccordionItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Adds extra classes to the item element. |
| value | any | auto id | Names the item for defaultValue / value. |
| disabled | boolean | false | The trigger stays visible but cannot be toggled. |
| onOpenChange | (open) => void | optional, no default | Called when this item opens or closes. |

## AccordionTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| icon | ReactNode | optional, no default | Leading icon in a small tile; it picks up the accent while the item is open. Hidden from screen readers. |
| description | ReactNode | optional, no default | Shows a secondary line under the title. |
| indicator | "chevron" \| "plus" | "chevron" | "chevron" turns over; "plus" becomes a minus. |
| headingLevel | HeadingLevelOption | 3 | Heading level of the wrapping header (2 to 6), to fit the page outline, or "none" for a paragraph with no heading role (for an example). |
| className | string | optional, no default | Extra classes for the trigger button. |

## AccordionPanel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Extra classes for the panel (height-animated, clips while it moves). |
| contentClassName | string | optional, no default | Extra classes for the padded content box inside the panel. |
| keepMounted | boolean | false | Keep closed content in the DOM. |

## Example 1 of 3: FAQ

The default glass variant: one card, and the open item rises as a lighter pane. Leading icons pick up the accent while open.

```tsx
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/sheenui/accordion/accordion";
// Package build (after the first npm release, or a packed tarball): import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
import { MessageCircle as MessageIcon, Shield as ShieldIcon, Truck as TruckIcon, Undo2 as UndoIcon } from "lucide-react";

const faqs = [
  {
    value: "shipping",
    icon: <TruckIcon />,
    title: "How long does shipping take?",
    description: "Orders and delivery",
    body: "Orders placed before 2 pm ship the same day. Standard delivery takes three to five business days; express arrives the next business day in most cities.",
  },
  {
    value: "returns",
    icon: <UndoIcon />,
    title: "Can I return an item?",
    description: "Free within 30 days",
    body: "Yes. Start a return from your order page within 30 days and drop the parcel at any pickup point. Refunds land on your original payment method within five days.",
  },
  {
    value: "warranty",
    icon: <ShieldIcon />,
    title: "What does the warranty cover?",
    description: "Two years, parts and labour",
    body: "Every device carries a two-year warranty against manufacturing defects. Accidental damage is covered only with SheenCare.",
  },
  {
    value: "support",
    icon: <MessageIcon />,
    title: "How do I reach support?",
    description: "Chat, email or phone",
    body: "Chat with us from any page, or email help@sheen.example. Phone support runs 8 am to 8 pm on weekdays.",
  },
];

export function Example() {
  return (
    <Accordion defaultValue={["shipping"]}>
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionTrigger icon={faq.icon} description={faq.description}>
            {faq.title}
          </AccordionTrigger>
          <AccordionPanel>{faq.body}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

## Example 2 of 3: Separated, several open

Each item is its own glass card. multiple lets any number stay open; the plus folds into a minus.

```tsx
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/sheenui/accordion/accordion";
// Package build (after the first npm release, or a packed tarball): import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Accordion variant="separated" multiple defaultValue={["plans", "billing"]}>
      <AccordionItem value="plans">
        <AccordionTrigger indicator="plus">Can I switch plans later?</AccordionTrigger>
        <AccordionPanel>Any time. Upgrades apply at once…</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger indicator="plus">When am I billed?</AccordionTrigger>
        <AccordionPanel>On the same day each month…</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="team">
        <AccordionTrigger indicator="plus">Do you offer team discounts?</AccordionTrigger>
        <AccordionPanel>Teams of ten or more get 20% off…</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
```

## Example 3 of 3: Plain, controlled, inside a card

variant="plain" has no surface of its own, for settings inside an existing card. value / onValueChange control which sections are open; a disabled item stays visible.

```tsx
import { useState } from "react";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/sheenui/accordion/accordion";
import { Button } from "@/components/sheenui/button/button";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger, Button, GlassCard } from "@sheenui/theme";
import { CreditCard as CardIcon, User as UserIcon } from "lucide-react";

export function Example() {
  const [open, setOpen] = useState<string[]>(["profile"]);
  // Every item that can open: the disabled one stays closed.
  const all = ["profile", "notifications", "security"];

  return (
    <>
      <Button size="sm" variant="glass" onClick={() => setOpen(all)}>Expand all</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen([])}>Collapse all</Button>

      <GlassCard className="p-2">
        <Accordion variant="plain" multiple value={open} onValueChange={(value) => setOpen(value as string[])}>
          <AccordionItem value="profile">
            <AccordionTrigger icon={<UserIcon />}>Profile</AccordionTrigger>
            <AccordionPanel>Name, photo and email.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="notifications">
            <AccordionTrigger>Notifications</AccordionTrigger>
            <AccordionPanel>Choose what we email you about.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger>Security</AccordionTrigger>
            <AccordionPanel>Password and two-step sign-in.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="billing" disabled>
            <AccordionTrigger icon={<CardIcon />} description="Ask an owner to unlock">Billing</AccordionTrigger>
            <AccordionPanel>Plans and invoices.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </GlassCard>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move between triggers (disabled items are skipped). |
| Enter / Space | Open or close the focused item. |

## Accessibility

- Each trigger is a native button inside a heading (headingLevel sets the level) with aria-expanded and aria-controls.
- Closed panels are hidden from the accessibility tree, so their links are not tabbable; hiddenUntilFound lets find-in-page open matching panels.
- A disabled item is announced as dimmed; the chevron and icon tile are aria-hidden.

## When to use Accordion

- Use it for an FAQ below a pricing table, or a settings screen with long sections, where only the answer you open takes space and every trigger stays a real button in the tab order.
- Use the separated variant with multiple for a settings or filter panel, where each group is its own glass card and several can stay open while someone compares them.
- Use the plain variant inside an existing card, such as a checkout summary or a sidebar, when the accordion should not add a surface of its own.
- Skip it when a section is independent and should not close its neighbors; Collapsible is a single show and hide region, and Tabs is better when users compare parallel views.
- Pair it with Badge in a trigger description, Field and Input for settings groups inside panels, and the Kbd component to show shortcuts in help content.


## Frequently asked questions

### How do I build an accordion?

Wrap AccordionItem elements in Accordion, each with an AccordionTrigger and an AccordionPanel. The panel height eases open in 220 ms and closes in a quicker 150 ms, and the chevron turns with it. The component is built on Base UI and the file starts with "use client".

### How do I let several sections stay open?

Set multiple on Accordion. Control which items are open with value and onValueChange, which take arrays of item values, or seed them with defaultValue. Give items stable value props instead of the auto id, so the state survives reordering. A disabled item stays visible but cannot be toggled.

### Does it work with the keyboard and Ctrl+F?

Each trigger is a native button inside a heading, with aria-expanded, and closed panels are removed from the page. Set hiddenUntilFound so the browser's find-in-page can open a matching panel, and use headingLevel, 3 by default, to fit your page outline.

### Can I add icons, descriptions or a plus indicator?

AccordionTrigger takes icon for a leading tile that picks up the accent while open, description for a muted second line, and indicator set to chevron or plus, where the plus folds into a minus. Use contentClassName on AccordionPanel to adjust padding of the content box.


## Related pages

- [Aspect ratio](https://lokendra-builds.github.io/sheenui/layout/aspect-ratio)
- [Breadcrumb](https://lokendra-builds.github.io/sheenui/layout/breadcrumb)
- [Collapsible](https://lokendra-builds.github.io/sheenui/layout/collapsible)
- [Pagination](https://lokendra-builds.github.io/sheenui/layout/pagination)
- [Resizable panels](https://lokendra-builds.github.io/sheenui/layout/resizable)
- [Scroll area](https://lokendra-builds.github.io/sheenui/layout/scroll-area)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
