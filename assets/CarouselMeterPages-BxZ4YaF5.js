import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{t as n}from"./avatar-CpgGSsX5.js";import{t as r}from"./badge-AQ2Afjwl.js";import{t as i}from"./button-8i4LQrEk.js";import{t as a}from"./glass-card-OGQy5mxG.js";import{n as o,t as s}from"./ShowcaseStage.carousel.scene-BbZG_nfR.js";import{i as c,n as l,o as u,r as d}from"./Page-ClekXXh-.js";import{t as f}from"./Example-jva669kg.js";import{t as p}from"./lazy-block-BfzH_8EP.js";import{t as m}from"./ShowcaseStage-qzIATPiV.js";import"./demo-clock-CoEY-AlH.js";import{t as h}from"./preload-helper-BrmCrVM7.js";var g=[[`children`,`ReactNode`,``,`Each child becomes one slide of the carousel.`,!1],[`aria-label`,`string`,``,`Accessible name of the carousel, e.g. "Featured products". Required.`,!0],[`slidesPerView`,`number | Record<number, number>`,`1`,`Slides visible at once. A number, or breakpoints keyed by the carousel's own width in px (container width, not the window): { 0: 1.15, 640: 2, 1024: 3 }. Fractions show a peek of the next slide.`,!1],[`gap`,`number`,`16`,`Sets the space left between slides, in px.`,!1],[`align`,`"center" | "start"`,`"start"`,`Where the current slide sits: at the start, or centred (great with a fractional view + loop).`,!1],[`loop`,`boolean`,`false`,`Endless in both directions. Needs enough slides to fill the view plus one; otherwise it rewinds.`,!1],[`slidesToScroll`,`number | "page"`,`1`,`How far the arrows move: a number of slides, or "page" (the slides in view).`,!1],[`autoplay`,`number | boolean`,`false`,`Advance on its own: true (every 5 s) or an interval in ms. Never starts by itself under reduced motion.`,!1],[`arrows`,`false | "bottom" | "overlay"`,`"bottom"`,`"bottom": in the control row. "overlay": floating on the slides' edges. false: none.`,!1],[`dots`,`boolean`,`true`,`Show the dots (a "3 / 12" counter replaces them when they don't fit).`,!1],[`index`,`number`,``,`Controlled position (snap index; with loop, the slide index). Update it from onIndexChange.`,!1],[`defaultIndex`,`number`,`0`,`Sets the starting position when uncontrolled.`,!1],[`onIndexChange`,`((index: number) => void)`,``,"A user or autoplay move asks for a new position (never fired on mount or when following `index`).",!1],[`effect`,`"none" | "scale"`,`"none"`,`"scale": slides away from the current one shrink a little (transform only).`,!1],[`labels`,`Partial<CarouselLabels>`,`defaultCarouselLabels`,'Every other string, for translation: `labels={{ carousel: "…" }}`; omitted keys keep the English of `defaultCarouselLabels`. All 14 keys of `CarouselLabels` are listed in the key table under the props table.',!1,{type:`CarouselLabels`,const:`defaultCarouselLabels`,keys:[[`carousel`,`carousel`],[`slide`,`slide`],[`slideLabel`,"(i, n) => `${i} of ${n}`"],[`previous`,`Previous slide`],[`next`,`Next slide`],[`goTo`,"(i) => `Slide ${i}`"],[`goToRange`,"(a, b) => `Slides ${a} to ${b}`"],[`picker`,`Choose a slide`],[`play`,`Start automatic slide show`],[`pause`,`Pause automatic slide show`],[`status`,"(i, n) => `Slide ${i} of ${n}`"],[`statusRange`,"(a, b, n) => `Slides ${a} to ${b} of ${n}`"],[`counter`,"(i, n) => `${i} / ${n}`"],[`viewport`,`Slides`]]}],[`slideClassName`,`string`,``,`Adds extra classes to each slide wrapper.`,!1],[`viewportClassName`,`string`,``,`Adds extra classes to the clipping viewport.`,!1]],_=[[`position`,`"top" | "bottom"`,`"bottom"`,`Where the bar sits on the slide: "bottom" or "top".`,!1]];e();var v=t(),y=[{title:`Aurora`,caption:`Violet light over a frozen lake`,art:`radial-gradient(70% 90% at 15% 20%, var(--sheen-chart-1), transparent 70%), radial-gradient(70% 90% at 85% 80%, var(--sheen-chart-3), transparent 70%), var(--sheen-chart-7)`},{title:`Ember`,caption:`The last hour of a desert day`,art:`radial-gradient(70% 90% at 80% 15%, var(--sheen-chart-4), transparent 70%), radial-gradient(80% 90% at 15% 85%, var(--sheen-chart-8), transparent 70%), var(--sheen-chart-2)`},{title:`Lagoon`,caption:`Shallow water, twelve shades of teal`,art:`radial-gradient(70% 90% at 20% 80%, var(--sheen-chart-6), transparent 70%), radial-gradient(70% 90% at 80% 20%, var(--sheen-chart-7), transparent 70%), var(--sheen-chart-3)`},{title:`Bloom`,caption:`A field of late spring tulips`,art:`radial-gradient(70% 90% at 25% 25%, var(--sheen-chart-5), transparent 70%), radial-gradient(70% 90% at 80% 75%, var(--sheen-chart-1), transparent 70%), var(--sheen-chart-8)`},{title:`Meadow`,caption:`Morning haze over the hills`,art:`radial-gradient(70% 90% at 80% 25%, var(--sheen-chart-4), transparent 70%), radial-gradient(70% 90% at 20% 80%, var(--sheen-chart-3), transparent 70%), var(--sheen-chart-6)`}];function b({title:e,caption:t,art:n,index:r,total:i}){return(0,v.jsxs)(`div`,{className:`relative isolate flex aspect-[16/10] min-h-56 w-full items-end overflow-hidden rounded-sheen-xl p-3 sm:aspect-[21/9] sm:p-5`,children:[(0,v.jsx)(`div`,{"aria-hidden":!0,className:`absolute inset-0 -z-10`,style:{background:n}}),(0,v.jsx)(`div`,{"aria-hidden":!0,className:`absolute top-[12%] right-[10%] -z-10 size-24 rounded-full border-[10px] border-white/50 sm:size-36`}),(0,v.jsx)(`div`,{"aria-hidden":!0,className:`absolute top-[20%] left-[8%] -z-10 h-16 w-28 rounded-sheen-lg bg-white/25 [background-image:radial-gradient(circle,white_1.5px,transparent_2px)] [background-size:12px_12px]`}),(0,v.jsxs)(`div`,{className:`glass-3 flex w-full max-w-sm items-center justify-between gap-4 rounded-sheen-lg px-4 py-3`,children:[(0,v.jsxs)(`div`,{className:`min-w-0`,children:[(0,v.jsx)(`p`,{className:`text-base font-semibold tracking-tight`,children:e}),(0,v.jsx)(`p`,{className:`truncate text-sm text-sheen-fg-muted`,children:t})]}),(0,v.jsxs)(`span`,{className:`text-xs font-medium text-sheen-fg-muted tabular-nums`,children:[r+1,`/`,i]})]})]})}var x=[{title:`الشفق`,caption:`ضوء بنفسجي فوق بحيرة متجمدة`},{title:`جمر`,caption:`آخر ساعة من نهار الصحراء`},{title:`بحيرة`,caption:`مياه ضحلة بدرجات الفيروز`}],S=y.slice(0,3).map((e,t)=>({...e,...x[t]})),C={carousel:`عرض شرائح`,slide:`شريحة`,slideLabel:(e,t)=>`${e} من ${t}`,previous:`الشريحة السابقة`,next:`الشريحة التالية`,goTo:e=>`الشريحة ${e}`,picker:`اختر شريحة`,status:(e,t)=>`الشريحة ${e} من ${t}`,play:`تشغيل العرض التلقائي`,pause:`إيقاف العرض التلقائي مؤقتًا`},w=[{name:`Glass login`,kind:`Block`,price:`Free`,tone:`success`,text:`Email + password, social sign-in and a shimmering submit.`},{name:`Data table`,kind:`Component`,price:`Free`,tone:`success`,text:`Sorting, filters, selection, CSV export and a dense mode.`},{name:`Dashboard kit`,kind:`Template`,price:`$49`,tone:`accent`,text:`Charts, stat tiles and a sidebar shell, wired together.`},{name:`Checkout`,kind:`Block`,price:`Free`,tone:`success`,text:`Order summary, card fields and a confident pay button.`},{name:`Docs theme`,kind:`Template`,price:`$29`,tone:`accent`,text:`MDX pages, code blocks, search and a table of contents.`},{name:`Onboarding`,kind:`Block`,price:`Free`,tone:`success`,text:`Steps, progress and an empty state that invites action.`}],T=[{name:`Asha Verma`,role:`Design lead, Northwind`,quote:`The glass finally looks like glass, and our contrast audit passed on the first try.`},{name:`Ravi Kumar`,role:`Frontend, Lumen`,quote:`Reduced motion is respected everywhere. I didn't have to file a single bug.`},{name:`Meera Iyer`,role:`Founder, Tidal`,quote:`We shipped the dashboard in a week. The charts alone saved us a month.`},{name:`Kabir Shah`,role:`Engineer, Orbit`,quote:`Copy the folder, done. No black-box package, no lock-in.`},{name:`Sara Khan`,role:`PM, Fieldnote`,quote:`Our customers keep asking which design system we use.`}];function E(){return(0,v.jsxs)(l,{eyebrow:`Data display`,title:`Carousel`,description:`Swipe, drag or flick (momentum carries you several slides), use the arrows, the dots or the keyboard. Endless loop without cloned slides, responsive slides per view, and autoplay that pauses on hover, focus and drag. Slides fully off screen are inert; what comes into view is announced. Right-to-left pages mirror it.`,source:`theme/src/components/carousel/carousel.tsx`,children:[(0,v.jsx)(m,{label:`Carousel demo`,story:()=>h(()=>import(`./ShowcaseStage.carousel-DNssrGmk.js`),[]),initial:{index:0},minHeight:`20rem`,children:(e,t)=>(0,v.jsx)(s,{scene:e,ctx:t})}),(0,v.jsx)(f,{title:`Gallery with autoplay`,description:`One slide per view, loop, overlay arrows, autoplay every 5 s. The active dot fills as the next slide nears; hover, drag or Tab into it to pause, and use the pause button to stop it. Under reduced motion autoplay waits for Play. The overlay arrows sit on a page-colored veil with a two-tone focus ring, so they stay legible on any image; ←/→ work on them too.`,variant:`bare`,code:`
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
}`,children:(0,v.jsx)(o,{"aria-label":`Landscapes`,loop:!0,autoplay:5e3,arrows:`overlay`,children:y.map((e,t)=>(0,v.jsx)(b,{...e,index:t,total:y.length},e.title))})}),(0,v.jsx)(f,{title:`Responsive cards`,description:`Slides per view follow the carousel's own width: 1.15 on phones (a peek of the next card), 2 from 560px, 3 from 900px. Arrows move a page at a time; the ends rubber-band. With several cards in view, the dots and announcements name the range (“Slides 4 to 6 of 6”).`,stageClassName:`block`,code:`
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
}`,children:(0,v.jsx)(o,{"aria-label":`Templates`,slidesPerView:{0:1.15,560:2,900:3},slidesToScroll:`page`,gap:16,children:w.map(e=>(0,v.jsxs)(a,{className:`flex h-full flex-col gap-3 p-5`,children:[(0,v.jsxs)(`div`,{className:`flex items-center justify-between gap-2`,children:[(0,v.jsx)(r,{tone:e.tone,children:e.kind}),(0,v.jsx)(`span`,{className:`text-sm font-semibold tabular-nums`,children:e.price})]}),(0,v.jsx)(`h3`,{className:`text-lg font-semibold tracking-tight`,children:e.name}),(0,v.jsx)(`p`,{className:`flex-1 text-sm text-pretty text-sheen-fg-muted`,children:e.text}),(0,v.jsx)(i,{size:`sm`,variant:`glass`,className:`self-start`,children:`Preview`})]},e.name))})}),(0,v.jsx)(f,{title:`Centered, with depth`,description:`align="center" with a fractional view and loop: neighbors peek on both sides. effect="scale" shrinks slides as they leave the center (transform only, follows your finger while dragging).`,stageClassName:`block`,code:`
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
}`,children:(0,v.jsx)(o,{"aria-label":`What teams say`,align:`center`,loop:!0,effect:`scale`,slidesPerView:{0:1.2,640:1.6,1024:2.2},gap:12,children:T.map(e=>(0,v.jsxs)(a,{level:3,className:`flex h-full flex-col justify-between gap-6 p-6`,children:[(0,v.jsxs)(`blockquote`,{className:`text-base text-pretty sm:text-lg`,children:[`“`,e.quote,`”`]}),(0,v.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,v.jsx)(n,{name:e.name,size:`sm`}),(0,v.jsxs)(`div`,{className:`flex min-w-0 flex-col`,children:[(0,v.jsx)(`span`,{className:`truncate text-sm font-semibold`,children:e.name}),(0,v.jsx)(`span`,{className:`truncate text-xs text-sheen-fg-muted`,children:e.role})]})]})]},e.name))})}),(0,v.jsx)(f,{title:`Right to left`,description:`In a right-to-left page the first slide sits on the right, Next moves leftwards, the arrows and the dot pill mirror and ←/→ swap meaning. Every string comes from labels, here in Arabic.`,stageClassName:`block`,code:`
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
}`,children:(0,v.jsx)(`div`,{dir:`rtl`,lang:`ar`,children:(0,v.jsx)(o,{"aria-label":`مناظر`,loop:!0,labels:C,children:S.map((e,t)=>(0,v.jsx)(b,{...e,index:t,total:S.length},e.title))})})}),(0,v.jsx)(d,{of:g}),(0,v.jsx)(d,{of:_,title:`CarouselCaption props`,as:`h3`}),(0,v.jsx)(u,{rows:[[`Tab`,`Reach the pause button, the dots and the arrows.`],[`Arrow Left / Arrow Right`,`Previous or next slide (swapped in right-to-left pages).`],[`Home / End`,`First or last slide.`],[`Enter / Space`,`Press the focused button (Play or Pause, an arrow, a dot).`]]}),(0,v.jsx)(c,{items:[`Follows the WAI-ARIA carousel pattern: aria-roledescription="carousel", slides as groups named "3 of 8", and a polite live region that announces the slide after you navigate.`,`Off-screen slides are inert. Autoplay pauses on hover, drag, a hidden tab or when off-screen, and stops for good when keyboard focus enters (press Play to resume).`,`Under reduced motion autoplay does not start and slides change without a glide.`]})]})}p(()=>h(()=>import(`./MeterStorageSlider-CfDbZM0p.js`).then(e=>e.StorageSlider),[]),{minHeight:`2.5rem`});export{E as default};