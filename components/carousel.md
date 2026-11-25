Canonical: https://lokendra-builds.github.io/sheenui/components/carousel

# React Carousel with Swipe, Loop & Autoplay

URL: https://lokendra-builds.github.io/sheenui/components/carousel
Sidebar name: Carousel

A glass React carousel: swipe, drag or flick with momentum, endless loop, responsive slides per view and autoplay that pauses on hover. Accessible, MIT.

What it is: A glass React carousel you can swipe, drag or flick, with an endless loop, responsive slides per view and autoplay that pauses on hover and focus.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/carousel.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Carousel

Files to copy from `theme/src/`:

- `components/carousel/carousel.tsx`
- `components/button/`
- `components/carousel/parts/`
- `components/spinner/`
- `hooks/{use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, math.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: carousel. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Carousel } from "@/components/sheenui/carousel/carousel";
import { CarouselCaption } from "@/components/sheenui/carousel/carousel-caption";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Carousel, CarouselCaption } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | Each child becomes one slide of the carousel. |
| aria-label | string | required | Accessible name of the carousel, e.g. "Featured products". Required. |
| slidesPerView | number \| Record<number, number> | 1 | Slides visible at once. A number, or breakpoints keyed by the carousel's own width in px (container width, not the window): { 0: 1.15, 640: 2, 1024: 3 }. Fractions show a peek of the next slide. |
| gap | number | 16 | Sets the space left between slides, in px. |
| align | "center" \| "start" | "start" | Where the current slide sits: at the start, or centred (great with a fractional view + loop). |
| loop | boolean | false | Endless in both directions. Needs enough slides to fill the view plus one; otherwise it rewinds. |
| slidesToScroll | number \| "page" | 1 | How far the arrows move: a number of slides, or "page" (the slides in view). |
| autoplay | number \| boolean | false | Advance on its own: true (every 5 s) or an interval in ms. Never starts by itself under reduced motion. |
| arrows | false \| "bottom" \| "overlay" | "bottom" | "bottom": in the control row. "overlay": floating on the slides' edges. false: none. |
| dots | boolean | true | Show the dots (a "3 / 12" counter replaces them when they don't fit). |
| index | number | optional, no default | Controlled position (snap index; with loop, the slide index). Update it from onIndexChange. |
| defaultIndex | number | 0 | Sets the starting position when uncontrolled. |
| onIndexChange | ((index: number) => void) | optional, no default | A user or autoplay move asks for a new position (never fired on mount or when following index). |
| effect | "none" \| "scale" | "none" | "scale": slides away from the current one shrink a little (transform only). |
| labels | Partial<CarouselLabels> | defaultCarouselLabels | Every other string, for translation: labels={{ carousel: "…" }}; omitted keys keep the English of defaultCarouselLabels. All 14 keys of CarouselLabels are listed in the key table under the props table. |
| slideClassName | string | optional, no default | Adds extra classes to each slide wrapper. |
| viewportClassName | string | optional, no default | Adds extra classes to the clipping viewport. |

## CarouselCaption props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| position | "top" \| "bottom" | "bottom" | Where the bar sits on the slide: "bottom" or "top". |

## Example 1 of 4: Gallery with autoplay

One slide per view, loop, overlay arrows, autoplay every 5 s. The active dot fills as the next slide nears; hover, drag or Tab into it to pause, and use the pause button to stop it. Under reduced motion autoplay waits for Play. The overlay arrows sit on a page-colored veil with a two-tone focus ring, so they stay legible on any image; ←/→ work on them too.

```tsx
import { Carousel } from "@/components/sheenui/carousel/carousel";
import { CarouselCaption } from "@/components/sheenui/carousel/carousel-caption";
// Package build (after the first npm release, or a packed tarball): import { Carousel, CarouselCaption } from "@sheenui/theme";

const scenes = [
  { title: "Dunes", from: "from-amber-300", to: "to-rose-500" },
  { title: "Glacier", from: "from-sky-200", to: "to-indigo-500" },
  { title: "Forest", from: "from-lime-300", to: "to-emerald-700" },
];

function Scene({ title, from, to }: (typeof scenes)[number]) {
  return (
    <div className={`relative aspect-video overflow-hidden rounded-sheen-lg bg-gradient-to-br ${from} ${to}`}>
      {/* The caption bar carries its own dark scrim, so the words stay readable over any image. */}
      <CarouselCaption>{title}</CarouselCaption>
    </div>
  );
}

export function Example() {
  return (
    <Carousel aria-label="Landscapes" loop autoplay={5000} arrows="overlay">
      {scenes.map((scene) => (
        <Scene key={scene.title} {...scene} />
      ))}
    </Carousel>
  );
}
```

## Example 2 of 4: Responsive cards

Slides per view follow the carousel's own width: 1.15 on phones (a peek of the next card), 2 from 560px, 3 from 900px. Arrows move a page at a time; the ends rubber-band. With several cards in view, the dots and announcements name the range (“Slides 4 to 6 of 6”).

```tsx
import { Carousel } from "@/components/sheenui/carousel/carousel";
// Package build (after the first npm release, or a packed tarball): import { Carousel } from "@sheenui/theme";

const products = [
  { name: "Dashboard", price: "$49" },
  { name: "Landing page", price: "$29" },
  { name: "Docs site", price: "$39" },
  { name: "Admin panel", price: "$59" },
];

function ProductCard({ name, price }: (typeof products)[number]) {
  return (
    <div className="glass-1 flex flex-col gap-1 rounded-sheen-lg p-5">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-sheen-fg-muted">{price}</p>
    </div>
  );
}

export function Example() {
  return (
    <Carousel
      aria-label="Templates"
      slidesPerView={{ 0: 1.15, 560: 2, 900: 3 }}
      slidesToScroll="page"
      gap={16}
    >
      {products.map((p) => (
        <ProductCard key={p.name} {...p} />
      ))}
    </Carousel>
  );
}
```

## Example 3 of 4: Centered, with depth

align="center" with a fractional view and loop: neighbors peek on both sides. effect="scale" shrinks slides as they leave the center (transform only, follows your finger while dragging).

```tsx
import { Carousel } from "@/components/sheenui/carousel/carousel";
// Package build (after the first npm release, or a packed tarball): import { Carousel } from "@sheenui/theme";

const quotes = [
  { name: "Asha", text: "Shipped our dashboard in a week." },
  { name: "Ravi", text: "The motion feels native." },
  { name: "Meera", text: "Accessible out of the box." },
];

function Quote({ name, text }: (typeof quotes)[number]) {
  return (
    <figure className="glass-1 rounded-sheen-lg p-6">
      <blockquote>{text}</blockquote>
      <figcaption className="mt-3 text-sm text-sheen-fg-muted">{name}</figcaption>
    </figure>
  );
}

export function Example() {
  return (
    <Carousel
      aria-label="What teams say"
      align="center"
      loop
      effect="scale"
      slidesPerView={{ 0: 1.2, 640: 1.6, 1024: 2.2 }}
      gap={12}
    >
      {quotes.map((q) => <Quote key={q.name} {...q} />)}
    </Carousel>
  );
}
```

## Example 4 of 4: Right to left

In a right-to-left page the first slide sits on the right, Next moves leftwards, the arrows and the dot pill mirror and ←/→ swap meaning. Every string comes from labels, here in Arabic.

```tsx
import { Carousel } from "@/components/sheenui/carousel/carousel";
// Package build (after the first npm release, or a packed tarball): import { Carousel } from "@sheenui/theme";

const scenes = [
  { title: "كثبان", from: "from-amber-300", to: "to-rose-500" },
  { title: "جبال", from: "from-sky-200", to: "to-indigo-500" },
];

function Scene({ title, from, to }: (typeof scenes)[number]) {
  return (
    <div className={`grid aspect-video place-items-center rounded-sheen-lg bg-gradient-to-br ${from} ${to} text-xl font-semibold text-white`}>
      {title}
    </div>
  );
}

export function Example() {
  return (
    <div dir="rtl" lang="ar">
      <Carousel
        aria-label="مناظر"
        loop
        labels={{
          carousel: "عرض شرائح",
          slide: "شريحة",
          slideLabel: (i, n) => `${i} من ${n}`,
          previous: "الشريحة السابقة",
          next: "الشريحة التالية",
          goTo: (i) => `الشريحة ${i}`,
          picker: "اختر شريحة",
          status: (i, n) => `الشريحة ${i} من ${n}`,
        }}
      >
        {scenes.map((scene) => <Scene key={scene.title} {...scene} />)}
      </Carousel>
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Reach the pause button, the dots and the arrows. |
| Arrow Left / Arrow Right | Previous or next slide (swapped in right-to-left pages). |
| Home / End | First or last slide. |
| Enter / Space | Press the focused button (Play or Pause, an arrow, a dot). |

## Accessibility

- Follows the WAI-ARIA carousel pattern: aria-roledescription="carousel", slides as groups named "3 of 8", and a polite live region that announces the slide after you navigate.
- Off-screen slides are inert. Autoplay pauses on hover, drag, a hidden tab or when off-screen, and stops for good when keyboard focus enters (press Play to resume).
- Under reduced motion autoplay does not start and slides change without a glide.

## All exports on this page

- Carousel — Swipeable slides with arrows, dots, autoplay and loop.
- CarouselCaption — A caption bar for a slide that is an image.
- defaultCarouselLabels — The English strings of Carousel.


## When to use Carousel

- Use it as a React carousel with swipe for a product gallery with one slide per view, loop, overlay arrows and autoplay every five seconds, where users can also swipe, drag or use the dots. Use it as an image slider in Tailwind for a gallery or a row of testimonials, where children are the slides and swipe, arrows and dots come with it.
- Use slidesPerView breakpoints for a row of testimonial or product cards, such as 1.15 on phones to peek at the next card and 2 or 3 as the carousel widens. Set loop for an infinite loop carousel in React, where the last slide wraps around to the first.
- Use align="center" with effect="scale" for a featured showcase where neighbors peek on both sides and slides shrink as they leave the center.
- Skip it when users need to compare all items at once or when the content is critical; a grid or a Tabs panel shows everything, and Scroll area suits a simple sideways list.
- Pair it with GlassCard for slide content, Button for call-to-action links on slides, and Badge for labels over images.


## Frequently asked questions

### How do I make a react carousel with loop and autoplay?

Render Carousel with one child per slide and a required aria-label. Set loop for an endless carousel that wraps without cloning slides, and autoplay to true for 5000 ms or a number of milliseconds. Autoplay pauses on hover, drag, a hidden tab or off screen, and stops when keyboard focus enters.

### Is the carousel keyboard and screen reader friendly?

It follows the WAI-ARIA carousel pattern: aria-roledescription="carousel", slides named like "3 of 8", and a polite live region announcing the slide after you navigate. On the pause button, dots and arrows, Left and Right move, and Home and End jump to the first or last slide. Off-screen slides are inert, so Tab cannot reach hidden content.

### How do I control it from outside and translate it?

Use index with onIndexChange for a controlled carousel, or defaultIndex for an uncontrolled one. onIndexChange is not called on mount. The labels prop holds every string, including slide names, arrows, dots and play and pause, and right-to-left pages mirror the layout, with the arrow keys swapped.

### What happens with reduced motion?

Autoplay never starts by itself under reduced motion and waits until the user presses Play, and slides snap into place instead of gliding, although dragging still follows the finger. Use arrows set to bottom, overlay or false to place or remove the buttons, and dots to show or hide the dots.


## Related pages

- [Code block](https://lokendra-builds.github.io/sheenui/components/code-block)
- [Empty state](https://lokendra-builds.github.io/sheenui/components/empty-state)
- [Meter](https://lokendra-builds.github.io/sheenui/components/meter)
- [Table](https://lokendra-builds.github.io/sheenui/components/table)
- [Skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
