Canonical: https://lokendra-builds.github.io/sheenui/foundations

# Glass Design Tokens: Blur, Tint, Rim & Motion

URL: https://lokendra-builds.github.io/sheenui/foundations
Sidebar name: Foundations

Glass design tokens behind SheenUI: blur, tint and rim at three levels, OKLCH colors, motion presets and solid fallbacks for reduced transparency.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Foundations

Every SheenUI surface is built from a few design tokens (a tint, a backdrop blur and a lit rim at three glass levels), with motion tokens beside them.

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { SheenScene } from "@/components/sheenui/backdrop/scene";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, SegmentedControl, SheenScene } from "@sheenui/theme";
```

## SheenScene props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| src | string | required | The fallback image (WebP or JPEG). Required. Decorative: it gets an empty alt. |
| avifSrc | string | optional, no default | Optional AVIF source for modern browsers; the browser falls back to src. |
| srcSet | string | optional, no default | srcset of the fallback image, e.g. "/scenes/room-800.webp 800w, /scenes/room.webp 1600w". |
| avifSrcSet | string | optional, no default | Sets the srcset of the AVIF source, like srcSet for the fallback image. |
| sizes | string | "100vw" | Sets the sizes attribute that tells the browser how wide the image displays, so it picks a srcSet candidate. |
| width | number | 1600 | Intrinsic width of the image in pixels. It is written on the <img> with height so the browser knows the aspect ratio before the file arrives; the scene itself still fills its container. |
| height | number | 900 | Intrinsic height of the image in pixels, written on the <img> with width to reserve its aspect ratio. |
| dim | number | 0.5 | How much of the page background colour is laid over the image (0 to 1). It dims the scene in dark mode and washes it in light mode, so text over glass keeps 4.5:1. |
| parallax | boolean | false | Drift the image slowly against the scroll (transform only). Off under reduced motion; it is driven by scroll progress, so nothing runs while the scene is off screen. |
| priority | boolean | false | Scene is above the fold: load it eagerly with high fetch priority. Otherwise it is lazy, decoded async and low priority. |
| fixed | boolean | false | Pin the scene behind the whole page (position fixed, z-index -1) instead of filling its positioned parent. |
| className | string | optional, no default | Adds extra classes to the scene element. |

## SheenLogo props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| px | number | 32 | Height of the mark in px; the wordmark scales with it. |
| variant | "mark" \| "full" | "full" | "full" = mark + "Sheenui" wordmark, "mark" = the ribbon S only. |
| glow | boolean | true | Soft violet glow under the mark. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## SheenMark props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| px | number | 32 | Sets the width and height in px. |
| title | string | "SheenUI" | Accessible name. Pass "" when the mark sits next to visible "Sheenui" text. |

## SheenBackdrop props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| mode | "hero" \| "page" | "page" | "hero": the home page look (brightest light behind the hero composition, caustics, a calm veil under the copy; it settles into the page look as the first viewport scrolls away). "page": the quieter docs look. |
| style | "liquid" \| "aurora" | the saved one (html[data-sheen-style]) | Force a style preset ("liquid" or "aurora"); defaults to the saved one (html[data-sheen-style]). |
| paused | boolean | false | Pause the ambient motion (e.g. a Pause button). |
| className | string | optional, no default | Adds extra classes to the fixed backdrop element. |

## SheenMotionProvider props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| nonce | string | optional, no default | CSP nonce for the inline styles Motion injects. |
| skipAnimations | boolean | false | Turn every Motion animation off (tests, screenshots); the final state is shown at once. |

## AnimatedList props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| as | "div" \| "ol" \| "section" \| "tbody" \| "ul" | "ul" | Sets the tag of the list element. |
| children | ReactNode | optional, no default | Holds the items, which are AnimatedListItems with stable keys. |
| className | string | optional, no default | Class names for the list element. |
| animateExit | boolean | true | Animate items leaving (shorter than an entrance, items below close the gap by sliding up). |

## AnimatedListItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| as | "div" \| "a" \| "article" \| "li" \| "p" \| "section" \| "tr" | "li" | Sets the tag of the item element. |
| resize | boolean | false | Animate the item's size too (layout), not just its position. Off by default: position-only FLIP never stretches the content. |

## Example: Scene switcher

Blurs the room scene.

```tsx
import { useState } from "react";
import { SheenScene } from "@/components/sheenui/backdrop/scene";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, SegmentedControl, SheenScene } from "@sheenui/theme";

const scenes = ["room", "swoosh", "street", "hills", "studio"];

export function Example() {
  const [scene, setScene] = useState("room");

  return (
    <div>
      <SegmentedControl
        aria-label="Scene"
        value={scene}
        onValueChange={setScene}
        items={scenes.map((name) => ({ value: name, label: name }))}
      />
      <div style={{ position: "relative", isolation: "isolate", overflow: "hidden", borderRadius: 16 }}>
        <SheenScene
          key={scene}
          src={`/scenes/${scene}-v2.webp`}
          avifSrc={`/scenes/${scene}-v2.avif`}
          srcSet={`/scenes/${scene}-800-v2.webp 800w, /scenes/${scene}-v2.webp 1600w`}
          avifSrcSet={`/scenes/${scene}-800-v2.avif 800w, /scenes/${scene}-v2.avif 1600w`}
          dim={0.5}
        />
        <div style={{ position: "relative", display: "grid", gap: 12, padding: 16, minHeight: 256, alignContent: "center" }}>
          {[1, 2, 3].map((level) => (
            <GlassCard key={level} level={level as 1 | 2 | 3} className="p-4">
              glass-{level}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Token board

Read live from the --sheen-* variables of the look you have on. Switch style or theme in the top bar and every swatch follows.

### Motion springs

- snappy 0.22 s, bounce 0.12
- smooth 0.3 s, bounce 0
- gentle 0.55 s, bounce 0.18
- bouncy 0.4 s, bounce 0.38


## Glass levels: backdrop-filter blur for three surfaces

Three levels, each with a solid fallback. Try Reduce transparency or Lite glass in the top bar.

Chips, inputs, toggles. Light blur, most transparent.

Cards and popovers. The everyday surface.

Dialogs and nav bars. Strongest blur, most opaque, safest for text.


## Three glass levels, each a set of CSS variables

Glassmorphism is a frosted-glass look: a translucent tint, a backdrop blur and a light rim over a colorful background. In SheenUI it is not a pile of utility classes you repeat on every element. The stylesheet defines three utilities, glass-1, glass-2 and glass-3, and every component picks one. Add a class to your own element and it gets the same surface: <div className="glass-2 rounded-sheen-lg p-6">.

Each level reads a few CSS variables: a tint (--sheen-glass-2-bg), a blur (--sheen-glass-2-blur), a saturation boost, a border and highlights for the lit rim. Because they are variables, the two style presets (Liquid Glass and Aurora Neon) and the light and dark themes only re-point them; no component changes. To use these utilities in a project, follow the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) (the two imports), and see [the glassmorphism card](https://lokendra-builds.github.io/sheenui/components/glass-card) for the basic surface.


## Backdrop-filter blur values and the glass budget

The blur is backdrop-filter. Level 1 (chips, inputs, switches) has no blur of its own, only a tint and a rim, because a small control sitting on a blurred card would only blur that card's tint. Level 2 (cards, popovers) blurs 20px, and level 3 (dialogs, navigation bars) blurs 32px and is the most opaque. Every blurred surface costs a full offscreen pass per frame, so the site keeps at most 8 in view and a Lite mode cuts the blur on weak devices. [Backdrop-filter performance](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance) measures why.


## Frosted glass CSS without Tailwind

The same look is plain CSS: a semi-transparent background, backdrop-filter: blur(20px) saturate(180%) and a 1px light border. The [glassmorphism React tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial) builds it layer by layer in CSS first, then in Tailwind, then as a component. What the utilities add is the part tutorials skip: dark-mode tuning, a specular highlight and the fallbacks below.

```css
background: var(--sheen-glass-2-bg);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid var(--sheen-glass-border);
```


## Fallbacks: reduced transparency, more contrast, forced colors

Glass is decoration, never the only thing keeping text readable. When the system asks for reduced transparency (or the in-app switch is on) or for more contrast, every level becomes a solid surface with a solid border. In Windows forced-colors mode it uses system colors with no blur and no rim, and the in-app Lite mode swaps the blur for a cheaper one. [Accessible glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) covers the contrast checks.


## API conventions

Every component speaks one vocabulary, so a prop you learn on one component works the same on the next. The generated props table on each component page shows how it uses these words.

- tone is the semantic colour of a component and comes from one list of six words: danger, warning, success, info, neutral and accent. A component accepts the subset it can show. Alert takes danger, warning, success and info. Badge adds solid, a filled neutral. Spinner and Sparkline add the ink choices current and muted. tone never means a shape or a layout.
- variant is the visual form (glass, ghost, outline, plain, card and so on), never a colour.
- Content slots. leading and trailing are the content slots of a control: a node placed before or after the label of Button, Input, the alert dialog actions and the side drawer header. icon is the single decorative glyph of an item-like component such as Alert, an accordion trigger, a menu item or an empty state, and it is hidden from screen readers. A component has one or the other, not both.
- emptyState is the node shown when there is nothing to show: every chart and table twin, DataTable, BarList and CommandPalette. Boolean state is a flag with a plain name such as loading, disabled or open.
- labels. Every string a component renders or announces lives in one labels object. Each component exports a default labels constant that your app can spread and translate. A chart and its table twin share one labels type, and an accessible name that depends on content is still a label key.
- headingLevel (1 to 6) is on every component that renders a heading. Blocks and shells default to 2, cards and panels to 3, and "none" turns the heading into plain text where the component is used inline (false is the deprecated older spelling). The page keeps a correct outline without the component guessing.
- size is one scale: sm, md and lg, with xs and xl only where the scale needs them. Fields and buttons share the control heights 32, 40 and 48 px (coarse pointers lift small and medium to 44 px), so a Button and an Input of the same size line up. Pixel dimensions of a drawing are named for what they are, such as diameter or px, never size.
- Logical sides. Anything that places content horizontally uses the words start and end, so right-to-left layouts flip on their own: align takes start, center or end, and menus take inline-start and inline-end for side. Physical names stay only where the screen edge is meant, such as Toaster position or the Dock and Drawer side.
- Controlled state comes as value, defaultValue and onValueChange (open, defaultOpen and onOpenChange for overlays). A component warns once in development if it switches between controlled and uncontrolled.


## Color tokens in OKLCH

OKLCH colors that switch between light and dark with light-dark(). Toggle the theme in the top bar to see them change.


## Scenes: a real picture behind the glass

SheenScene is an image layer for the first child of a positioned container, so the blur has something to refract. The dim prop (default 0.5) mixes the page background over it to keep text readable. Serve the files from your own public folder; this page adds the site base path to the same URLs.

The scene example below uses three components. Add them with the shadcn CLI, or copy the files the Files to copy lists on each component page:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/backdrop.json https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/segmented.json
```

## Motion tokens

Springs are defined by duration and bounce. Press play to compare them. With reduced motion on, they all become instant.


## Logo and mark

A folded satin ribbon “S”: light on the upper bowl and the band, a deep violet fold below, the moment light catches a polished surface. Use <SheenLogo /> for the full logo, <SheenMark /> for the ribbon alone, and sheen-glint.svg (or the files in brand/) for favicons and images.


## Every signature effect

These are the moments that make the library feel physical. Each row names the export behind it and links to a page where it runs live. Turn on Reduce motion in the bar at the top and every row stops moving.

Signature effects, their exports and where to see them live

| Effect | What it does | Export | See it live |
| --- | --- | --- | --- |
| Hero entrance | The home hero builds in one timeline: badge, headline, text, buttons and floating cards arrive in order. | Hero (docs site) with spring and follow tokens | Home |
| Scroll parallax and reveals | Layers drift at different speeds as you scroll, rows rise in when a panel enters, and the hero hands off to the page. | useScroll in the home sections, plus CSS scroll timelines in backdrop.css | Home |
| Pointer-reactive light | A soft light follows the cursor across glass, so the surface looks like it catches the light. | SpotlightCard, useSheenPointerLight | Spotlight card |
| Magnetic and press physics | A primary button leans toward the cursor as it gets close, then lifts on hover and sinks on press. | Button, useMagnetic | Button |
| 3D tilt | A card turns a few degrees toward the pointer on a spring and settles flat when you leave. | TiltCard, TiltCardLayer | Tilt card |
| Shared-element morph | A card grows into its dialog and shrinks back, so the eye follows one object. A selection pill slides between options the same way. | MorphingDialog, Segmented | Morphing dialog |
| Rolling numbers | Digits roll to a new value instead of swapping, and charts draw in when they appear. | NumberTicker, chart components | Number ticker |
| Drag physics | Toasts can be swiped away and a drawer can be dragged shut, and the exit speed follows how fast you flick. | Toaster, Drawer | Toast |
| Route transitions | Changing page cross-fades and lifts the new content, using the browser's view transitions when they exist. | startRouteTransition | Any page link |
| Ambient backdrop | Slow ribbons and orbs (Liquid) or an aurora sky (Aurora) move behind the glass and pause when off screen or under Pause motion. | SheenBackdrop | Home |
| Text effects | Headlines blur in, type out, rotate words or shimmer. | BlurIn, Typewriter, WordRotate, ShimmerText | Blur in |
| Micro-interactions | Button glow, a light sweep across cards, an underline that draws, icon nudges and a focus pulse. | Button, GlassCard, DialogContent | Button |
| Theme wave | Switching light and dark sweeps a circle of the new theme out from the switch you pressed. | useThemeWave (docs site) | Home, theme switch |
| One light for a bento grid | One pointer light is shared by every cell of a bento grid, so only one glow is ever painted. | BentoGrid, BentoCell | Bento grid |

## Foundation components

The logo, the animated backdrop and the app-wide motion provider. SheenBackdrop also pauses its loops off-screen, so you never need to manage that yourself.

### SheenLogo props

### SheenMark props

### SheenBackdrop props

### SheenMotionProvider props

### AnimatedList props

### AnimatedListItem props


## Frequently asked questions

### How do I put a glass surface on my own element?

Give the element glass-1, glass-2 or glass-3. Each utility sets a translucent tint, a backdrop blur and a lit border from variables, so you do not repeat the CSS on each element. The setup (the Tailwind imports) is on the Tailwind v4 glass UI page.

### Which backdrop-filter blur should I use?

SheenUI blurs 20px on cards and popovers and 32px on dialogs and navigation bars, and none on small controls. Larger blurs cost more per frame, so keep a handful of blurred surfaces in view.

### Can I change the glass tint or blur?

Yes. Override the variables, for example --sheen-glass-2-bg or --sheen-glass-2-blur, on :root or on one container. Components follow because they read the variables, and the two style presets do exactly that.

### What happens when someone turns off transparency?

The glass becomes a solid surface with a solid border for reduced transparency and more contrast, and system colors in Windows forced-colors mode. Text contrast does not depend on the blur.


## All exports on this page

- ANALYTICS_RANGES — Every AnalyticsRange, shortest first (the order of the range picker).
- AlertIcon — An exclamation in a circle, for errors and warnings.
- AnimatedList — A list whose items slide to their new position when they are reordered, inserted or removed, and fade and scale in or out.
- AnimatedListItem — One item of an AnimatedList.
- COARSE_POINTER_QUERY — The one touch query SheenUI uses: any coarse pointer (a touch laptop with a mouse counts as touch-capable).
- CheckIcon — A check mark, for selected states and success.
- CloseIcon — A cross, for close and remove buttons.
- DEFAULT_SHEEN_STYLE — The style preset used when nothing is saved: liquid.
- PREFERS_DARK_QUERY — The OS dark colour scheme query.
- SHEEN_STYLES — SheenUI's style presets.
- STAGGER_BUDGET — No stagger may spread a group over more than this (seconds).
- SheenBackdrop — The page's live wallpaper, one per style preset: silk ribbons and spheres for Liquid Glass, a canvas aurora for Aurora Neon.
- SheenLogo — The full logo: the ribbon "S" mark plus the wide "Sheenui" wordmark with a violet i-dot.
- SheenMark — The SheenUI logo mark on its own: a glossy ribbon "S", light on top and a deep violet fold below.
- SheenMotionProvider — One MotionConfig for the whole app.
- SheenScene — A real picture behind your glass, so the blur has something to refract.
- WORLD_FRAME_HEIGHT — Height of the world map's drawing frame (875 units); the frame is 2000 units wide.
- WORLD_FRAME_WIDTH — Size of the map frame (SVG user units).
- budgetStagger — A stagger that never spreads a group over more than STAGGER_BUDGET, however many children: transition: { delayChildren.
- bumpLegend — The legend of a BumpChart: one entry per series, in the chart's colours.
- changeRatio — Signed percent change from previous to current, as a ratio; null when undefined.
- chartCsv — The chart's data as CSV text: raw numbers (not formatted), one column per series.
- chartFileName — File-name-safe slug: "Revenue by channel" → "revenue-by-channel" ("Größe" → "grosse", "Café" → "cafe").
- chartPngBlob — The chart as a PNG (2× by default, for sharp slides and docs).
- createForceSimulation — Builds a force simulation over count nodes of radius radii, linked by links (indexes).
- defaultChartCsvLabels — The English header texts of chartCsv; pass labels to override any of them.
- defaultEmojiCategories — The built-in emoji set the picker uses, grouped into ChatEmojiCategory entries with searchable names and keywords.
- defaultKbdLabels — Default key-cap glyphs and spoken names per platform (mac and other, plus their *Spoken variants).
- defaultQuickReactions — The quick reactions (WhatsApp's set): one tap under a message.
- distance — Movement distances in pixels: nudge, rise, reveal, panel, hero, and the magneticMax / parallaxMax caps.
- divergingColor — One step of a diverging scale: t in [-1, 1], 0 is the neutral midpoint.
- downloadBlob — Save a Blob as a file through a temporary link.
- duration — Seconds (Motion's unit).
- ease — Easing curves as cubic-bezier arrays: out for entrances, inOut for loops, exit for leaving .
- emojiName — The spoken name of an emoji when it is in the set ("red heart"), else the emoji itself.
- errorBarLegend — The legend of an ErrorBarChart: the estimate and the interval around it.
- escapeCsvValue — One CSV field: quoted when it holds a comma, quote or line break, and defanged against spreadsheet formula injection.
- exitPreset — Stand-alone exit target for AnimatePresence children: exit={reduced ?
- exitTransition — Leaving the screen: duration.exit with ease.exit.
- exportChartImage — Download the chart inside root as an SVG or PNG file.
- exportCsv — Download rows as a CSV file: a header row plus data rows (UTF-8 with BOM, quoted and formula-safe).
- fadeUp — Variants for a fade-and-rise entrance (hidden, visible, exit), each with a full and a reduced (opacity only) version.
- fileKind — A coarse kind for picking an icon and a tint.
- findChartSvg — The chart's SVG inside root: the one marked as a chart, else the largest.
- follow — Physics springs for MotionValues that chase a moving target (useSpring / useFollowValue).
- formatBytes — 5242880 → "5 MB" (binary steps, the way most upload limits are set).
- formatChange — "+12.4%", "−3%" in a locale (typographic minus).
- formatColor — The colour as text in a format: "#7c5cff", "rgb(124 92 255 / 50%)", "hsl(252 100% 68%)".
- formatShortcut — Formats a shortcut ("mod+shift+p" or an array of keys) for a platform: visible key labels, spoken words and the aria-keyshortcuts value.
- fuzzyMatch — Fuzzy-match query against text.
- ganttDay — A date (Date or "YYYY-MM-DD" string, read as a local date) as a day number; null if invalid.
- ganttLegend — Legend items for a ChartCard: one per group (phase), in its fixed colour slot.
- getWeekStart — The locale's first day of the week (0 = Sunday).
- hoverLift — Hover lift + press physics for interactive surfaces (release rebounds on the press spring).
- isApplePlatform — True on macOS, iOS and iPadOS, where mod means ⌘ Command.
- isJumboEmoji — True for a short message that is only emoji (1-3): shown large, without a bubble (as WhatsApp, iMessage and Telegram do).
- isMotionReduced — True when motion is reduced, live: data-motion="reduced" on <html> or the OS setting.
- isSheenStyle — Type guard: true when value is one of SHEEN_STYLES.
- isWeakDevice — A device that should get Lite glass straight away: little memory, few cores, or the visitor asked to save data.
- loadWorld110m — Starts loading the bundled 1:110m world outlines (cached; safe to call repeatedly, e.g.
- matchCommand — Best match of a query against a label and its extra search words.
- matchesAccept — Whether a file is allowed by an accept string, by MIME type or extension.
- matchesShortcut — Does a keydown event match a shortcut?
- mergeLabels — Merge partial labels over defaults (one level deep for the range maps).
- networkLegend — Legend items for a network graph's groups (pass to ChartCard's legend).
- normalizeColor — Normalised hex of any parsable colour (for comparisons), or null.
- normalizeText — Lower-case, strip accents.
- orderShortcut — Modifiers first (in the platform's usual order), then the other keys as written.
- parseColor — Parses #rgb, #rgba, #rrggbb, #rrggbbaa (with or without #), rgb()/rgba() and hsl()/hsla().
- parseISODate — Parses "YYYY-MM-DD" as a local date.
- parseShortcut — Split "shift+mod+k" (or an array) into canonical, lower-case key names.
- populationPyramidLegend — The legend of a PopulationPyramid: the two sides, in the chart's colours.
- prepareText — Analyse a text once so it can be matched against many queries cheaply.
- press — Press physics: sink to 0.97 on the stiff press spring, rebound 1.5% on release.
- projectWorld — Longitude / latitude (degrees) to a point in the map frame.
- rangeLength — How many points a range has.
- rangePoints — The time points of a range that ends at end (UTC ms): 24 hours, 7/30/90 days or 12 months.
- readSheenStyle — The active style preset outside React (reads <html>; "liquid" on the server).
- resolveChatLabels — Merge partial labels over the defaults (nested records too).
- resolveCssColor — Resolve a CSS colour expression (tokens, light-dark(), color-mix()) against context.
- resolveLanguage — Normalise a language name or alias ("typescript", "sh", "py"…).
- riseIn — Fallback page transition for browsers without View Transitions.
- scaleIn — Variants for a small scale-and-fade entrance (hidden, visible, exit), each with a full and a reduced (opacity only) version.
- scaleTo — Scale targets (1 = unchanged) for press, pop-in, overlay entrance and hover.
- serializeChartSvg — A standalone SVG document of svg, with every style resolved.
- sheenPointer — Pointer position, shared with backdrops (the aurora sky lifts under it).
- sheenPreferenceScript — Inline this in <head> (before your CSS) to apply saved preferences with no flash.
- splitLines — Split tokens into lines (tokens that contain newlines are cut).
- spring — The four springs.
- stagger — Parent variant that staggers its children's "visible" state.
- staggerStep — Stagger steps in seconds, by what is being staggered.
- startRouteTransition — Run a navigation as a view transition when the browser supports it and motion is allowed, else run it at once.
- supportsViewTransitions — True when document.startViewTransition exists (Chrome/Edge 111+, Safari 18+, Firefox 144+).
- tableCsv — CSV from a rendered table (the chart's table view): what you see is what you get.
- toAriaKeyShortcuts — aria-keyshortcuts value for a shortcut, resolving mod for the platform.
- toCsv — Build a CSV document (CRLF line endings) from a header row and data rows.
- toISODate — "2026-10-29" for the local calendar day (what a form submits).
- tokenize — Tokenize code for language (any alias).
- useAmbientBeat — Run cb(now, dt) on every ambient beat (~30 Hz, fewer while the page scrolls) while mounted and on.
- useAutoLiteGlass — Lite glass, automatically, on weak devices: low memory, few cores, Save-Data.
- useBeatAnimations — Drives paused Web Animations from the shared ambient beat (~30 Hz) instead of letting them free-run at the display rate.
- useBeatFollower — Run cb(now) on every beat while the beat is awake (see wakeBeat), while mounted and on.
- useCoarsePointer — True on devices with a coarse pointer (touch).
- useControllable — One controlled/uncontrolled state hook for every SheenUI component.
- useFinePointer — True on a mouse or trackpad ((hover: hover) and (pointer: fine)), live; false on touch screens and during server rendering.
- useGlassMode — Lite glass: cheaper blur and a calmer backdrop for weak devices.
- useKeepFocusOnReorder — Keeps keyboard focus on an element that React moved.
- useLoopPlayback — Should a loop (ambient drift, beam, marquee, shimmer, typing dots, a live ticker) be playing?
- useMagnetic — Magnetic pull: the element leans toward the pointer while the pointer is within reach px of its box, by at most distance.magneticMax px.
- useMediaQuery — Whether a CSS media query currently matches, kept live with useSyncExternalStore.
- useMotionGate — Which motion tiers are allowed right now.
- useMotionPreference — The in-app "reduce motion" switch: [on, setOn] (data-motion="reduced" on <html>, saved in localStorage, synced across tabs; false on the server).
- useOffscreenLoops — Pause every looping CSS animation while its element (its parent, for loops that move their own element) is off-screen, resume it when it returns.
- useOsSolidGlass — True when the OS asks for solid surfaces (reduced transparency, more contrast or forced colours).
- usePrefersDark — True when the OS prefers a dark colour scheme.
- useReducedTransparency — The in-app "reduce transparency" switch: [on, setOn].
- useResolvedTheme — The theme actually on screen: the saved choice, or the OS setting when it is "system".
- useRowReorder — The layout props for a row that should slide to its new place when its siblings reorder.
- useSheenPointerLight — The pointer rim light for every glass surface (the work is described at the top of this file).
- useSheenReducedMotion — True when the OS asks for reduced motion OR the in-app toggle is on.
- useSheenStyle — The active style preset ("liquid" by default, or "aurora") and a setter that saves it (data-sheen-style on <html> plus localStorage, synced across tabs).
- useTheme — The visitor's colour theme and a setter that saves it (data-theme on <html> plus localStorage, synced across tabs).
- viewSpring — A spring token for View Transition layers (AnimateView, animateView).
- worldCountryName — A country's name in locale (Intl.DisplayNames), e.g.


## Related pages

- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [Installation](https://lokendra-builds.github.io/sheenui/docs/installation)
- [Showcase](https://lokendra-builds.github.io/sheenui/showcase)
- [Forms recipe](https://lokendra-builds.github.io/sheenui/docs/forms)
- [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)

### Guides that cover it

- [Install SheenUI Glass Components in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks)
- [Glassmorphism in React: A Step-by-Step Tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial)
- [Apple Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react)
- [Accessible Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism)
- [Glassmorphism vs Liquid Glass vs Neumorphism](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-vs-liquid-glass)
- [backdrop-filter Performance: Fast Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)
- [Base UI vs Radix UI for React in 2026](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix)
- [Best Glassmorphism React Libraries (2026)](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries)
- [Glassmorphism UI Prompts for AI Coding Agents](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
