Canonical: https://lokendra-builds.github.io/sheenui/blocks/hero-section

# React Hero Section: Glass Landing Page Block

URL: https://lokendra-builds.github.io/sheenui/blocks/hero-section
Sidebar name: Hero section

A React hero section block with a display headline, calls to action, a lit glass media frame and a logo strip over your own scene. Tailwind v4, MIT.

What it is: HeroSection is a React hero section block that sets a display headline, a lede and calls to action over any backdrop, with a lit glass frame for a product shot and a logo strip. Use it as the first block of a landing page.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/hero-section.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Hero section

Files to copy from `theme/src/`:

- `blocks/hero-section.tsx`
- `components/button/`
- `components/spinner/`
- `hooks/{use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, heading.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: hero-section. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { SheenScene } from "@/components/sheenui/backdrop/scene";
import { HeroSection } from "@/components/sheenui/blocks/hero-section";
```

These examples also use backdrop: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/backdrop.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { HeroSection, SheenScene } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| eyebrow | ReactNode | optional, no default | Small pill above the headline (ReactNode), for a release note or a category. |
| title | ReactNode | required | The headline (ReactNode). Wrap a phrase in <em> to light it with the accent. |
| description | ReactNode | optional, no default | Sets the lede that sits under the headline (ReactNode). |
| primaryAction | HeroAction | optional, no default | The main call to action (HeroAction). |
| secondaryAction | HeroAction | optional, no default | The quieter call to action next to it (HeroAction). |
| media | ReactNode | optional, no default | A product shot, video or live demo shown in a glass frame (ReactNode). Below the copy when centered, beside it when align="start". |
| mediaClassName | string | optional, no default | Classes for the media frame (string), e.g. an aspect ratio. |
| background | ReactNode | optional, no default | What sits behind the copy (ReactNode): pass a SheenScene, an image or your own art. Omit it for the built-in aurora of token colours; pass null for none. It is decorative and hidden from assistive technology. |
| logos | HeroLogo[] | optional, no default | The logo strip under the hero (HeroLogo[]). It is a labelled list. |
| align | "center" \| "start" | "center" | Alignment of the copy: "center" stacks everything on the middle line, "start" aligns it to the start edge and puts media beside it. |
| headingLevel | HeadingLevelOption | 2 | Level of the headline (1 to 6); "none" renders a paragraph with no heading role (for an example). A landing page's hero is usually its h1: pass headingLevel={1}. |
| labels | Partial<HeroSectionLabels> | defaultHeroSectionLabels | Every other string, for translation: labels={{ region: "…" }}; omitted keys keep the English of defaultHeroSectionLabels. All 2 keys of HeroSectionLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the section (string). |

## Example 1 of 2: Centered, over a scene

The background slot takes a SheenScene (or any image). The product shot sits in a glass frame with a pool of light under it. Wrap a phrase of the headline in <em> to light it with the accent.

```tsx
import { SheenScene } from "@/components/sheenui/backdrop/scene";
import { HeroSection } from "@/components/sheenui/blocks/hero-section";
// Package build (after the first npm release, or a packed tarball): import { HeroSection, SheenScene } from "@sheenui/theme";

export function Example() {
  return (
    <HeroSection
      headingLevel={1}
      eyebrow="New: every block, light and dark"
      title={<>Interfaces that <em>catch the light</em></>}
      description="A glass component library for React, built on Base UI, Tailwind v4 and Motion. Copy the source and make it yours."
      primaryAction={{ label: "Get started", href: "/docs/installation" }}
      secondaryAction={{ label: "Browse components", href: "/components" }}
      background={
        <SheenScene
          src="/scenes/studio-v2.webp"
          avifSrc="/scenes/studio-v2.avif"
          dim={0.75}
          priority
        />
      }
      media={
        <div className="grid aspect-[16/9] grid-cols-[28%_1fr] gap-3 p-3">
          <div className="rounded-sheen-lg bg-sheen-hover" />
          <div className="grid grid-rows-[auto_1fr] gap-3">
            <div className="h-10 rounded-sheen-lg bg-sheen-hover" />
            <div className="rounded-sheen-lg bg-sheen-hover" />
          </div>
        </div>
      }
      logos={[{ name: "Alder" }, { name: "Brightloom" }, { name: "Cobalt" }, { name: "Driftwood" }, { name: "Evergreen" }]}
    />
  );
}
```

## Example 2 of 2: Start-aligned, with the built-in aurora

align='start' puts the copy at the start edge and the media beside it. Leave background out for the aurora; the actions can be buttons (onClick) as well as links.

```tsx
import { HeroSection } from "@/components/sheenui/blocks/hero-section";
// Package build (after the first npm release, or a packed tarball): import { HeroSection } from "@sheenui/theme";

export function Example() {
  return (
    <HeroSection
      align="start"
      title="Ship the dashboard, not the plumbing"
      description="Charts, tables and forms that already agree on spacing, focus and motion."
      primaryAction={{ label: "Start a project", onClick: () => console.log("start") }}
      secondaryAction={{ label: "Read the docs", href: "/docs/installation" }}
      media={
        <div className="grid aspect-[4/3] place-items-center p-6 text-sheen-fg-muted">Your product shot</div>
      }
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The calls to action in order, then whatever your media contains. |
| Enter | Follow a link action or press a button action. |

## Accessibility

- A <section> named by its headline (labels.region when headingLevel is 'none'). A landing page's hero is usually its h1: pass headingLevel={1}.
- The background (aurora or SheenScene) is aria-hidden; the logo strip is a list labelled by labels.logosTitle and every logo has a text name.
- Text and buttons rise by transform only; the frame fades in on itself. Reduced motion removes the movement.
- Keep the headline over a calm part of your scene and raise dim until the lede reads at 4.5:1 in both themes.

## All exports on this page

- HeroSection — A landing-page hero: a display headline, a lede, one or two calls to action, an optional product shot in a lit glass frame and a logo strip.
- defaultHeroSectionLabels — The English HeroSectionLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the hero section

- Use HeroSection above the fold of a product launch or open-source landing page, over a gradient or photo backdrop, with a headline, one sentence of lede, a primary and a secondary action, and a product shot in a lit glass frame underneath.
- Use the background slot for a SheenScene or your own image when the page has a strong photographic mood, or leave it out for the built-in aurora drawn from the theme's token colours.
- Use align="start" to put the copy at the start edge and the media beside it on a wide block, which suits a product page with a real screenshot or a live demo.
- Skip it for a compact page header inside an app; a plain heading and a Button group are enough there, and the glass frame would compete with the content.
- Pair it with FeatureGrid and Testimonials below it, SiteFooter at the end, and AnnouncementBanner above it, which together make a complete marketing page.


## Frequently asked questions

### How do I build a hero section in React with HeroSection?

Import HeroSection from @sheenui/theme and pass a title, an optional description, and primaryAction and secondaryAction as { label, href } or { label, onClick }. Add media for a product shot, background for a scene, and logos for the strip. Pass headingLevel={1} when it is the page's main heading.

### How do I put an image or a SheenScene behind the hero?

Pass it as the background prop: a SheenScene with src, avifSrc and dim, or any element. It is decorative and hidden from assistive technology. Raise dim until the lede keeps 4.5:1 contrast in both themes. Pass background={null} for no backdrop at all.

### Does the hero animate, and does it respect reduced motion?

The eyebrow, headline, lede and buttons rise a few pixels on a spring, using transform only so nothing glass is faded behind a wrapper, and the media frame fades in on itself. Under the OS setting or html[data-motion="reduced"] the movement is removed and nothing loops.

### How is the logo strip made accessible?

It is a list labelled by labels.logosTitle. Each logo is a name plus optional artwork: the artwork is aria-hidden and the name is read, so a screen reader hears "Alder, Brightloom" and not unlabelled images. Without artwork the name is shown as a text wordmark.


## Related pages

- [Feature grid](https://lokendra-builds.github.io/sheenui/blocks/feature-grid)
- [Testimonials](https://lokendra-builds.github.io/sheenui/blocks/testimonials)
- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [FAQ section](https://lokendra-builds.github.io/sheenui/blocks/faq-section)
- [Contact form](https://lokendra-builds.github.io/sheenui/blocks/contact-form)
- [Site footer](https://lokendra-builds.github.io/sheenui/blocks/site-footer)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
