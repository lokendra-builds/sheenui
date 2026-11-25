import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Avatar, Badge, Button, GlassCard, Input, useLoopPlayback } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { lazyBlock } from "../layout/lazy-block";
import type { MeterScene as MeterSceneData } from "../layout/ShowcaseStage.meter";
import { MeterScene } from "../layout/ShowcaseStage.meter.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { CarouselScene as CarouselSceneData } from "../layout/ShowcaseStage.carousel";
import { CarouselScene } from "../layout/ShowcaseStage.carousel.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { DEMO_LOCALE } from "../demo-clock";
import { Carousel } from "@sheenui/theme";
import { Meter } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";

/** Ticks a value over time, for "live" demos. Stops under unmount, while `ref`'s element is off-screen and in a hidden tab. */
function useTicker(ref: RefObject<Element | null>, initial: number, next: (v: number) => number, ms: number) {
  const [value, setValue] = useState(initial);
  const fn = useRef(next);
  const playing = useLoopPlayback(ref, { respectReducedMotion: false });
  useLayoutEffect(() => {
    fn.current = next;
  });
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setValue((v) => fn.current(v)), ms);
    return () => window.clearInterval(timer);
  }, [ms, playing]);
  return [value, setValue] as const;
}

/* ====================================================================== */
/* Carousel                                                                */
/* ====================================================================== */

const scenes = [
  {
    title: "Aurora",
    caption: "Violet light over a frozen lake",
    art: "radial-gradient(70% 90% at 15% 20%, var(--sheen-chart-1), transparent 70%), radial-gradient(70% 90% at 85% 80%, var(--sheen-chart-3), transparent 70%), var(--sheen-chart-7)",
  },
  {
    title: "Ember",
    caption: "The last hour of a desert day",
    art: "radial-gradient(70% 90% at 80% 15%, var(--sheen-chart-4), transparent 70%), radial-gradient(80% 90% at 15% 85%, var(--sheen-chart-8), transparent 70%), var(--sheen-chart-2)",
  },
  {
    title: "Lagoon",
    caption: "Shallow water, twelve shades of teal",
    art: "radial-gradient(70% 90% at 20% 80%, var(--sheen-chart-6), transparent 70%), radial-gradient(70% 90% at 80% 20%, var(--sheen-chart-7), transparent 70%), var(--sheen-chart-3)",
  },
  {
    title: "Bloom",
    caption: "A field of late spring tulips",
    art: "radial-gradient(70% 90% at 25% 25%, var(--sheen-chart-5), transparent 70%), radial-gradient(70% 90% at 80% 75%, var(--sheen-chart-1), transparent 70%), var(--sheen-chart-8)",
  },
  {
    title: "Meadow",
    caption: "Morning haze over the hills",
    art: "radial-gradient(70% 90% at 80% 25%, var(--sheen-chart-4), transparent 70%), radial-gradient(70% 90% at 20% 80%, var(--sheen-chart-3), transparent 70%), var(--sheen-chart-6)",
  },
];

function Scene({ title, caption, art, index, total }: (typeof scenes)[number] & { index: number; total: number }) {
  return (
    <div className="relative isolate flex aspect-[16/10] min-h-56 w-full items-end overflow-hidden rounded-sheen-xl p-3 sm:aspect-[21/9] sm:p-5">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: art }} />
      {/* Crisp shapes for the caption's glass to blur. */}
      <div
        aria-hidden
        className="absolute top-[12%] right-[10%] -z-10 size-24 rounded-full border-[10px] border-white/50 sm:size-36"
      />
      <div
        aria-hidden
        className="absolute top-[20%] left-[8%] -z-10 h-16 w-28 rounded-sheen-lg bg-white/25 [background-image:radial-gradient(circle,white_1.5px,transparent_2px)] [background-size:12px_12px]"
      />
      <div className="glass-3 flex w-full max-w-sm items-center justify-between gap-4 rounded-sheen-lg px-4 py-3">
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-tight">{title}</p>
          <p className="truncate text-sm text-sheen-fg-muted">{caption}</p>
        </div>
        <span className="text-xs font-medium text-sheen-fg-muted tabular-nums">
          {index + 1}/{total}
        </span>
      </div>
    </div>
  );
}

const arabicText = [
  { title: "الشفق", caption: "ضوء بنفسجي فوق بحيرة متجمدة" },
  { title: "جمر", caption: "آخر ساعة من نهار الصحراء" },
  { title: "بحيرة", caption: "مياه ضحلة بدرجات الفيروز" },
];

const arabicScenes = scenes.slice(0, 3).map((scene, i) => ({ ...scene, ...arabicText[i] }));

const arabicLabels = {
  carousel: "عرض شرائح",
  slide: "شريحة",
  slideLabel: (i: number, n: number) => `${i} من ${n}`,
  previous: "الشريحة السابقة",
  next: "الشريحة التالية",
  goTo: (i: number) => `الشريحة ${i}`,
  picker: "اختر شريحة",
  status: (i: number, n: number) => `الشريحة ${i} من ${n}`,
  play: "تشغيل العرض التلقائي",
  pause: "إيقاف العرض التلقائي مؤقتًا",
};

const products = [
  {
    name: "Glass login",
    kind: "Block",
    price: "Free",
    tone: "success" as const,
    text: "Email + password, social sign-in and a shimmering submit.",
  },
  {
    name: "Data table",
    kind: "Component",
    price: "Free",
    tone: "success" as const,
    text: "Sorting, filters, selection, CSV export and a dense mode.",
  },
  {
    name: "Dashboard kit",
    kind: "Template",
    price: "$49",
    tone: "accent" as const,
    text: "Charts, stat tiles and a sidebar shell, wired together.",
  },
  {
    name: "Checkout",
    kind: "Block",
    price: "Free",
    tone: "success" as const,
    text: "Order summary, card fields and a confident pay button.",
  },
  {
    name: "Docs theme",
    kind: "Template",
    price: "$29",
    tone: "accent" as const,
    text: "MDX pages, code blocks, search and a table of contents.",
  },
  {
    name: "Onboarding",
    kind: "Block",
    price: "Free",
    tone: "success" as const,
    text: "Steps, progress and an empty state that invites action.",
  },
];

const quotes = [
  {
    name: "Asha Verma",
    role: "Design lead, Northwind",
    quote: "The glass finally looks like glass, and our contrast audit passed on the first try.",
  },
  {
    name: "Ravi Kumar",
    role: "Frontend, Lumen",
    quote: "Reduced motion is respected everywhere. I didn't have to file a single bug.",
  },
  {
    name: "Meera Iyer",
    role: "Founder, Tidal",
    quote: "We shipped the dashboard in a week. The charts alone saved us a month.",
  },
  { name: "Kabir Shah", role: "Engineer, Orbit", quote: "Copy the folder, done. No black-box package, no lock-in." },
  { name: "Sara Khan", role: "PM, Fieldnote", quote: "Our customers keep asking which design system we use." },
];

/** The "Carousel" docs page (/components/carousel): live examples, props and notes. */
export function CarouselPage() {
  return (
    <Page
      eyebrow="Data display"
      title="Carousel"
      description="Swipe, drag or flick (momentum carries you several slides), use the arrows, the dots or the keyboard. Endless loop without cloned slides, responsive slides per view, and autoplay that pauses on hover, focus and drag. Slides fully off screen are inert; what comes into view is announced. Right-to-left pages mirror it."
      source="theme/src/components/carousel/carousel.tsx"
    >
      <ShowcaseStage<CarouselSceneData>
        label="Carousel demo"
        story={() => import("../layout/ShowcaseStage.carousel")}
        initial={{ index: 0 }}
        minHeight="20rem"
      >
        {(scene, ctx) => <CarouselScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Gallery with autoplay"
        description="One slide per view, loop, overlay arrows, autoplay every 5 s. The active dot fills as the next slide nears; hover, drag or Tab into it to pause, and use the pause button to stop it. Under reduced motion autoplay waits for Play. The overlay arrows sit on a page-colored veil with a two-tone focus ring, so they stay legible on any image; ←/→ work on them too."
        variant="bare"
        code={`
import { Carousel, CarouselCaption } from "@sheenui/theme";

const scenes = [
  { title: "Dunes", from: "from-amber-300", to: "to-rose-500" },
  { title: "Glacier", from: "from-sky-200", to: "to-indigo-500" },
  { title: "Forest", from: "from-lime-300", to: "to-emerald-700" },
];

function Scene({ title, from, to }: (typeof scenes)[number]) {
  return (
    <div className={\`relative aspect-video overflow-hidden rounded-sheen-lg bg-gradient-to-br \${from} \${to}\`}>
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
}`}
      >
        <Carousel aria-label="Landscapes" loop autoplay={5000} arrows="overlay">
          {scenes.map((scene, i) => (
            <Scene key={scene.title} {...scene} index={i} total={scenes.length} />
          ))}
        </Carousel>
      </Example>

      <Example
        title="Responsive cards"
        description="Slides per view follow the carousel's own width: 1.15 on phones (a peek of the next card), 2 from 560px, 3 from 900px. Arrows move a page at a time; the ends rubber-band. With several cards in view, the dots and announcements name the range (“Slides 4 to 6 of 6”)."
        stageClassName="block"
        code={`
import { Carousel } from "@sheenui/theme";

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
}`}
      >
        <Carousel aria-label="Templates" slidesPerView={{ 0: 1.15, 560: 2, 900: 3 }} slidesToScroll="page" gap={16}>
          {products.map((p) => (
            <GlassCard key={p.name} className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <Badge tone={p.tone}>{p.kind}</Badge>
                <span className="text-sm font-semibold tabular-nums">{p.price}</span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
              <p className="flex-1 text-sm text-pretty text-sheen-fg-muted">{p.text}</p>
              <Button size="sm" variant="glass" className="self-start">
                Preview
              </Button>
            </GlassCard>
          ))}
        </Carousel>
      </Example>

      <Example
        title="Centered, with depth"
        description='align="center" with a fractional view and loop: neighbors peek on both sides. effect="scale" shrinks slides as they leave the center (transform only, follows your finger while dragging).'
        stageClassName="block"
        code={`
import { Carousel } from "@sheenui/theme";

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
}`}
      >
        <Carousel
          aria-label="What teams say"
          align="center"
          loop
          effect="scale"
          slidesPerView={{ 0: 1.2, 640: 1.6, 1024: 2.2 }}
          gap={12}
        >
          {quotes.map((q) => (
            <GlassCard key={q.name} level={3} className="flex h-full flex-col justify-between gap-6 p-6">
              <blockquote className="text-base text-pretty sm:text-lg">“{q.quote}”</blockquote>
              <div className="flex items-center gap-3">
                <Avatar name={q.name} size="sm" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{q.name}</span>
                  <span className="truncate text-xs text-sheen-fg-muted">{q.role}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </Carousel>
      </Example>

      <Example
        title="Right to left"
        description="In a right-to-left page the first slide sits on the right, Next moves leftwards, the arrows and the dot pill mirror and ←/→ swap meaning. Every string comes from labels, here in Arabic."
        stageClassName="block"
        code={`
import { Carousel } from "@sheenui/theme";

const scenes = [
  { title: "كثبان", from: "from-amber-300", to: "to-rose-500" },
  { title: "جبال", from: "from-sky-200", to: "to-indigo-500" },
];

function Scene({ title, from, to }: (typeof scenes)[number]) {
  return (
    <div className={\`grid aspect-video place-items-center rounded-sheen-lg bg-gradient-to-br \${from} \${to} text-xl font-semibold text-white\`}>
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
          slideLabel: (i, n) => \`\${i} من \${n}\`,
          previous: "الشريحة السابقة",
          next: "الشريحة التالية",
          goTo: (i) => \`الشريحة \${i}\`,
          picker: "اختر شريحة",
          status: (i, n) => \`الشريحة \${i} من \${n}\`,
        }}
      >
        {scenes.map((scene) => <Scene key={scene.title} {...scene} />)}
      </Carousel>
    </div>
  );
}`}
      >
        <div dir="rtl" lang="ar">
          <Carousel aria-label="مناظر" loop labels={arabicLabels}>
            {arabicScenes.map((scene, i) => (
              <Scene key={scene.title} {...scene} index={i} total={arabicScenes.length} />
            ))}
          </Carousel>
        </div>
      </Example>

      <PropsTable of={PROPS.Carousel} />
      <PropsTable of={PROPS.CarouselCaption} title="CarouselCaption props" as="h3" />
      <KeyboardTable
        rows={[
          ["Tab", "Reach the pause button, the dots and the arrows."],
          ["Arrow Left / Arrow Right", "Previous or next slide (swapped in right-to-left pages)."],
          ["Home / End", "First or last slide."],
          ["Enter / Space", "Press the focused button (Play or Pause, an arrow, a dot)."],
        ]}
      />
      <A11yNotes
        items={[
          'Follows the WAI-ARIA carousel pattern: aria-roledescription="carousel", slides as groups named "3 of 8", and a polite live region that announces the slide after you navigate.',
          "Off-screen slides are inert. Autoplay pauses on hover, drag, a hidden tab or when off-screen, and stops for good when keyboard focus enters (press Play to resume).",
          "Under reduced motion autoplay does not start and slides change without a glide.",
        ]}
      />
    </Page>
  );
}

/* Below the fold of the stage: its own chunk (Slider is ~10 KB gzip), fetched once idle; the prerendered HTML holds it. */
const StorageSlider = lazyBlock(() => import("./MeterStorageSlider").then((m) => m.StorageSlider), {
  minHeight: "2.5rem",
});

/* ====================================================================== */
/* Meter                                                                   */
/* ====================================================================== */

export function MeterPage() {
  const [storage, setStorage] = useState(72);
  const liveRef = useRef<HTMLDivElement>(null);
  const [cpu] = useTicker(
    liveRef,
    34,
    (v) => Math.round(Math.min(98, Math.max(6, v + (Math.random() - 0.45) * 30))),
    1600,
  );
  const [password, setPassword] = useState("glass");
  const strength = Math.min(
    100,
    password.length * 8 +
      (/[A-Z]/.test(password) ? 15 : 0) +
      (/\d/.test(password) ? 15 : 0) +
      (/[^\w]/.test(password) ? 15 : 0),
  );

  return (
    <Page
      eyebrow="Data display"
      title="Meter"
      description="A level within a known range: storage, battery, signal, password strength. Built on Base UI's Meter, colored by the HTML <meter> rules: give low / high / optimum and it turns green, amber or red. The level is spoken and can be written, so color is never the only signal."
      source="theme/src/components/meter/meter.tsx"
    >
      <ShowcaseStage<MeterSceneData>
        label="Meter demo"
        story={() => import("../layout/ShowcaseStage.meter")}
        initial={{ value: 38 }}
        minHeight="14rem"
      >
        {(scene, ctx) => <MeterScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Levels"
        description="Storage: lower is better (optimum 0), so it goes amber past 70% and red past 90%. Battery: higher is better. CPU updates live; the fill springs and the number counts with it."
        controls={<StorageSlider value={storage} onChange={setStorage} />}
        code={`
import { Meter } from "@sheenui/theme";

export function Example() {
  const storage = 82; // percent used
  const cpu = 41;

  return (
    <>
      <Meter label="Storage" value={storage} low={70} high={90} optimum={0} showLevel
        description={\`\${(storage * 0.64).toFixed(1)} GB of 64 GB used\`} />
      <Meter label="Battery" value={18} low={20} high={60} optimum={100} showLevel />
      <Meter label="CPU" value={cpu} low={60} high={85} optimum={0} size="sm" />
    </>
  );
}`}
      >
        <div ref={liveRef} className="glass-2 flex w-full max-w-md flex-col gap-6 rounded-sheen-lg p-5 sm:p-6">
          <Meter
            locale={DEMO_LOCALE}
            label="Storage"
            value={storage}
            low={70}
            high={90}
            optimum={0}
            showLevel
            description={`${(storage * 0.64).toFixed(1)} GB of 64 GB used`}
          />
          <Meter locale={DEMO_LOCALE} label="Battery" value={18} low={20} high={60} optimum={100} showLevel />
          <Meter locale={DEMO_LOCALE} label="CPU" value={cpu} low={60} high={85} optimum={0} size="sm" />
        </div>
      </Example>

      <Example
        title="Segmented and custom values"
        description="variant=segmented draws cells, like a battery or signal meter. format / valueText change the number; levelLabels rename the levels."
        code={`
import { Meter } from "@sheenui/theme";

export function Example() {
  const strength = 60; // 0 to 100, from your password checker

  return (
    <>
      <Meter
        label="Password strength"
        value={strength}
        low={40}
        high={75}
        optimum={100}
        variant="segmented"
        segments={4}
        showLevel
        valueText={false}
        levelLabels={{ critical: "Weak", suboptimal: "Fair", optimum: "Strong" }}
      />
      <Meter label="Bandwidth" value={7.4} max={10} format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }} />
      <Meter label="Signal" value={3} max={5} variant="segmented" segments={5} valueText={(_, v) => \`\${v} of 5 bars\`} />
    </>
  );
}`}
      >
        <div className="glass-2 flex w-full max-w-md flex-col gap-6 rounded-sheen-lg p-5 sm:p-6">
          <Input
            label="Try a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <Meter
            locale={DEMO_LOCALE}
            label="Password strength"
            value={strength}
            low={40}
            high={75}
            optimum={100}
            variant="segmented"
            segments={4}
            showLevel
            valueText={false}
            levelLabels={{ critical: "Weak", suboptimal: "Fair", optimum: "Strong" }}
          />
          <Meter
            locale={DEMO_LOCALE}
            label="Bandwidth this month"
            value={7.4}
            max={10}
            format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }}
          />
          <Meter
            locale={DEMO_LOCALE}
            label="Signal"
            value={3}
            max={5}
            variant="segmented"
            segments={5}
            valueText={(_, v) => `${v} of 5 bars`}
          />
        </div>
      </Example>

      <PropsTable
        of={PROPS.Meter}
        rows={[
          ["value", "number", "", "Required. Clamped to [min, max] (NaN falls back to min)."],
          [
            "format / locale",
            "Intl.NumberFormatOptions / string",
            "",
            "Number formatting (Intl), also used for aria-valuetext.",
          ],
          ["getAriaValueText", "(formatted, value) => string", "", "Gives full control over the spoken value."],
        ]}
      />
      <KeyboardTable rows={[["Tab", "Not focusable: a meter is a read-out, not a control."]]} />
      <A11yNotes
        items={[
          'role="meter" named by label (or aria-label), described by description, with aria-valuenow, aria-valuemin and aria-valuemax.',
          "The level (critical, suboptimal, optimum) is part of the spoken value (aria-valuetext) and, with showLevel, written next to the value, so color is never the only signal.",
          'Use variant="segmented" for battery- or signal-style read-outs; the same spoken value applies.',
        ]}
      />
    </Page>
  );
}
