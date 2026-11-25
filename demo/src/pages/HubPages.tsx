import type { ReactNode } from "react";

import { AboutSection, Faq, type FaqItem } from "../layout/LazyAbout";
import { CommandField } from "../layout/CommandField";
import { slugify } from "../layout/heading-ids";
import { HubCards } from "../layout/HubCards";
import { AllDashboardsStage } from "./DashboardStages";
import { InstallAliasSection } from "./InstallAliasSection";
import { InstallBundlesSection, StarterTemplateSection } from "./StarterTemplateSection";
import { Page } from "../layout/Page";
import { ScrollPre } from "../layout/ScrollPre";
import { href } from "../router";
import { routes } from "../routes";
import { HUBS, hubChildren } from "../seo/hubs";
import { SITE_URL } from "../seo/site";

const inlineCode =
  "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";

/*
 * The hub pages that list a whole part of the library (the planned hub pages): a few
 * paragraphs of real text that own the hub's keyword, then one card per page with the page's
 * keyword H1 as its link and its first sentence as the blurb. /charts and /guides are hubs too
 * (ChartsPage.tsx, GuidePages.tsx); the HUBS table in seo/hubs.ts drives all of them.
 */

const linkClass = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";

function A({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={href(to)} className={linkClass}>
      {children}
    </a>
  );
}

function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** Cards grouped by the sidebar group each page belongs to, one H2 per group. */
function GroupedCards({ hub, blurbs }: { hub: string; blurbs: Record<string, string> }) {
  const children = hubChildren(routes, hub);
  const groups = HUBS[hub]?.groups ?? [];
  return (
    <>
      {groups.map((group) => {
        const paths = children.filter((r) => r.group === group).map((r) => r.path);
        if (paths.length === 0) return null;
        const id = `hub-${group.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <section key={group} aria-labelledby={id} className="flex flex-col gap-4">
            <div className="flex max-w-3xl flex-col gap-1">
              <h2 id={id} className="text-2xl font-semibold tracking-tight">
                {group} ({paths.length})
              </h2>
              {blurbs[group] && <p className="text-sm text-pretty text-sheen-fg-muted">{blurbs[group]}</p>}
            </div>
            <HubCards paths={paths} />
          </section>
        );
      })}
    </>
  );
}

/** The hub's overview text and FAQ, collapsed in one glass accordion below the card grid (the text stays in the HTML). */
function AboutHub({ name, faq, children }: { name: string; faq: FaqItem[]; children: ReactNode }) {
  return (
    <AboutSection
      title={`About ${name}`}
      className="max-w-4xl"
      groups={[
        { items: [{ value: "overview", title: "Overview", body: <Prose>{children}</Prose> }] },
        {
          title: "Frequently asked questions",
          anchorPrefix: "faq-",
          items: faq.map(({ q, a }) => ({ value: slugify(q), title: q, body: <p>{a}</p> })),
        },
      ]}
    />
  );
}

const count = (hub: string) => hubChildren(routes, hub).length;

/** /components */
export function ComponentsHubPage() {
  const faq: FaqItem[] = [
    {
      q: "What are glass UI components?",
      a: "Glass UI components are interface parts such as buttons, cards, dialogs and menus drawn as frosted glass: a translucent tint, a backdrop blur and a lit border over a colorful background. SheenUI adds Liquid Glass refraction on top, and a solid fallback for people who turn transparency off.",
    },
    {
      q: "Which library are the components built on?",
      a: "Behavior, focus handling and ARIA come from Base UI's headless primitives, the styling is Tailwind CSS v4, and the animation is Motion. You copy the source into your own project.",
    },
    {
      q: "Are the components accessible?",
      a: "Each page lists its keyboard model and accessibility notes. Every component is tested with axe and a keyboard, and glass turns into solid surfaces with reduced transparency, more contrast or Windows High Contrast.",
    },
  ];
  return (
    <Page
      eyebrow="Components"
      title="All components"
      description={`${count("/components")} pages, each with a live demo, a props table and the files to copy.`}
      related={false}
    >
      <GroupedCards
        hub="/components"
        blurbs={{
          Components: "The everyday parts: buttons, cards, inputs, dialogs, tabs, toasts and the data table.",
          Forms: "Pickers, uploads, number fields, ratings and tags, with labels and errors wired for screen readers.",
          Overlays: "Menus, context menus, drawers, hover cards and the command palette.",
          Navigation: "A horizontal navbar and a vertical sidebar.",
          Layout: "Accordion, breadcrumb, stepper, timeline, toolbar and scroll area.",
          "Data display": "Carousel, code block, empty state, meter and skeleton.",
          Chat: "A chat list, a conversation view and a support widget.",
        }}
      />
      <AboutHub name="components" faq={faq}>
        <p>
          Pick a glassy part and copy it. Every one of the {count("/components")} pages below is a glass React component
          with a live demo, the props, the keyboard model and the exact files to copy, so you can take a single button
          or a whole form kit without installing a package. The set grows from the same foundation: three glass levels,
          a handful of <A to="/foundations">glass design tokens</A>, and shared motion presets.
        </p>
        <p>
          The components are grouped the way you build screens. <strong>Components</strong> are the everyday parts, such
          as the <A to="/components/button">glass button</A>, <A to="/components/glass-card">glassmorphism card</A>,{" "}
          <A to="/components/dialog">modal dialog</A> and <A to="/components/data-table">data table</A>.{" "}
          <strong>Forms</strong> cover inputs, pickers and uploads, <strong>Overlays</strong> hold menus, drawers and
          command palettes, and <strong>Navigation</strong> and <strong>Layout</strong> give you the frame around them.
        </p>
        <p>
          Looking for motion? The <A to="/effects">animated React components</A> page lists the effects built with
          Motion. Need whole screens? See the <A to="/blocks">React Tailwind blocks</A> and the{" "}
          <A to="/dashboards">glassmorphism dashboard templates</A>. Charts live on{" "}
          <A to="/charts">their own gallery</A>, and the <A to="/docs/installation">installation guide</A> shows how to
          add any of these with the shadcn CLI; the <A to="/docs/tailwind-v4">Tailwind CSS v4 setup</A> covers the two
          CSS imports.
        </p>
        <p>
          Everything is free and MIT licensed, built on Base UI and Tailwind CSS v4, and checked in light and dark, in
          both style presets and with reduced motion on. New to glass UI? Start with the{" "}
          <A to="/guides/glassmorphism-react-tutorial">glassmorphism React tutorial</A>.
        </p>
      </AboutHub>
    </Page>
  );
}

/** /effects */
export function EffectsHubPage() {
  const faq: FaqItem[] = [
    {
      q: "Which animation library do the effects use?",
      a: "Motion, the library formerly called Framer Motion, imported from motion/react. Springs and durations come from shared motion tokens so every effect feels the same.",
    },
    {
      q: "What happens with reduced motion?",
      a: "Each effect has a still fallback: movement turns into a short fade or the final state is shown at once, whether the setting comes from the operating system or from SheenUI's own toggle.",
    },
    {
      q: "Can I use one effect without the rest of SheenUI?",
      a: "Yes. Each effect page lists the files to copy; they need Motion (motion/react), Tailwind CSS v4 and the SheenUI tokens and motion presets they import. Add SheenMotionProvider at the root as well: without it Motion ignores the operating system's reduced-motion setting.",
    },
    {
      q: "Do the effects hurt performance?",
      a: "They animate transform and opacity, pause when off screen or in a hidden tab, and a page keeps to a budget of 8 blurred surfaces in view. See the backdrop-filter performance guide for the glass cost.",
    },
  ];
  return (
    <Page
      eyebrow="Effects"
      title="All effects"
      description={`${count("/effects")} animated components with live demos.`}
      related={false}
    >
      <section aria-labelledby="hub-effects" className="flex flex-col gap-4">
        <h2 id="hub-effects" className="text-2xl font-semibold tracking-tight">
          Effects ({count("/effects")})
        </h2>
        <HubCards paths={hubChildren(routes, "/effects").map((r) => r.path)} />
      </section>
      <AboutHub name="effects" faq={faq}>
        <p>
          These are the animated React components in SheenUI: glassy, classy effects you drop onto a page to make it
          feel alive. Each of the {count("/effects")} pages below has a live demo, the props, the keyboard and
          reduced-motion behavior, and the files to copy. They are built with Motion (formerly Framer Motion), the same
          engine that powers the rest of the library, so one provider sets the spring and the pace for everything.
        </p>
        <p>
          The set mixes surface effects and text effects. <A to="/effects/liquid-glass">Liquid Glass for React</A> bends
          the background behind a panel, the way iOS 26 does, with a frosted fallback for Safari and Firefox. A{" "}
          <A to="/effects/border-beam">border beam</A> sends light around a card, a{" "}
          <A to="/effects/spotlight-card">spotlight card</A> follows the pointer, and the{" "}
          <A to="/effects/macos-dock">macOS-style dock</A> magnifies icons as you move across them. For text there are a{" "}
          <A to="/effects/number-ticker">number ticker</A>, a <A to="/effects/typewriter">typewriter</A>,{" "}
          <A to="/effects/shimmer-text">shimmer text</A> and a <A to="/effects/blur-in">blur-in</A> reveal.
        </p>
        <p>
          Which effect for which job: for text, <A to="/effects/typewriter">typewriter</A>,{" "}
          <A to="/effects/word-rotate">word rotate</A>, <A to="/effects/shimmer-text">shimmer text</A> and{" "}
          <A to="/effects/text-reveal">text reveal</A>; for a background, <A to="/effects/particles">particles</A> and{" "}
          <A to="/effects/meteors">meteors</A>; for a card, <A to="/effects/3d-tilt-card">3D tilt</A>,{" "}
          <A to="/effects/spotlight-card">spotlight</A> and <A to="/effects/border-beam">border beam</A>; for a diagram,{" "}
          <A to="/effects/animated-beam">animated beam</A> and <A to="/effects/orbiting-circles">orbiting circles</A>;
          for a success moment, <A to="/effects/confetti">confetti</A>.
        </p>
        <p>
          By how they move: <A to="/effects/particles">particles</A>, <A to="/effects/meteors">meteors</A>,{" "}
          <A to="/effects/marquee">marquee</A> and <A to="/effects/orbiting-circles">orbiting circles</A> loop on their
          own; <A to="/effects/spotlight-card">spotlight</A>, <A to="/effects/3d-tilt-card">3D tilt</A> and the{" "}
          <A to="/effects/macos-dock">dock</A> answer the pointer; <A to="/effects/scroll-progress">scroll progress</A>{" "}
          answers the page scroll; <A to="/effects/confetti">confetti</A> and{" "}
          <A to="/effects/morphing-dialog">morphing dialog</A> play once when you trigger them. Pick the least
          continuous motion that does the job, because a loop is the only kind that keeps running while someone reads.
        </p>
        <p>
          What every effect shares. One <code className={inlineCode}>SheenMotionProvider</code> at the root of your app
          wraps Motion&rsquo;s config: it makes Motion follow the operating system&rsquo;s reduced-motion setting and
          SheenUI&rsquo;s own switch, sets the default spring, pauses looping CSS animations while they are off screen
          and pauses decorative loops in a hidden tab. Timing comes from shared tokens, with durations between 0.1 and
          0.6 seconds, an exit that is always shorter than the entrance and never overshoots, so a toast and a dialog
          feel like one product.
        </p>
        <p>
          To use one, open its page and copy the files it lists, which include the motion tokens that effect imports, or
          install it through the shadcn registry as the <A to="/docs/installation">installation page</A> shows, after
          the <A to="/docs/tailwind-v4">Tailwind CSS v4 setup</A>. The effects are plain React source in your
          repository, so you can change a spring or a duration without waiting for a release.
        </p>
        <p>
          Motion that ignores people is a bug, so every effect respects reduced motion and pauses when it leaves the
          screen. Learn the patterns in <A to="/guides/framer-motion-examples">12 Framer Motion examples</A>, or read
          why the package was renamed in <A to="/guides/framer-motion-to-motion">Framer Motion is now Motion</A>. For
          the static building blocks see <A to="/components">all glass UI components</A>, and for full screens the{" "}
          <A to="/blocks">React blocks</A>.
        </p>
      </AboutHub>
    </Page>
  );
}

/** /blocks */
export function BlocksHubPage() {
  const faq: FaqItem[] = [
    {
      q: "What is a block?",
      a: "A block is a ready-made section or screen, such as a login form, a pricing table or an AI chat, assembled only from SheenUI components so it matches the rest of your interface.",
    },
    {
      q: "How do I add a block to my project?",
      a: "Every block page lists its files to copy, and the registry installs it with one shadcn command. The installation page shows the steps.",
    },
    {
      q: "Can I change the blocks?",
      a: "Yes. They are plain React source in your repository, with Tailwind classes you can edit; nothing is hidden in a package.",
    },
  ];
  return (
    <Page
      eyebrow="Blocks"
      title="All blocks"
      description={`${count("/blocks")} blocks and ${count("/dashboards")} dashboards, all copy-paste.`}
      related={false}
    >
      <section aria-labelledby="hub-blocks" className="flex flex-col gap-4">
        <h2 id="hub-blocks" className="text-2xl font-semibold tracking-tight">
          Blocks ({count("/blocks")})
        </h2>
        <HubCards paths={hubChildren(routes, "/blocks").map((r) => r.path)} />
      </section>
      <AboutHub name="blocks" faq={faq}>
        <p>
          Blocks are complete sections you can paste into an app and ship, from a glassy login page to a full dashboard.
          Each of the {count("/blocks")} blocks below is built only from SheenUI components, so spacing, glass levels
          and motion already match, which makes them free React UI blocks under the MIT licence and ready-made landing
          page sections for Tailwind. You get a live demo, the code, the keyboard notes and the list of files to copy,
          and the same React and Tailwind source works in Vite, Next.js and any other React 19 setup.
        </p>
        <p>
          Start with authentication: a <A to="/blocks/glass-login">glassmorphism login form</A>, a split-screen{" "}
          <A to="/blocks/signup-page">sign-up page</A> and an <A to="/blocks/otp-verification">OTP verification page</A>
          . For selling, there is a <A to="/blocks/pricing">pricing table</A> and a{" "}
          <A to="/blocks/payment-checkout">checkout form</A>. For product screens, see the{" "}
          <A to="/blocks/ai-chat">AI chat UI</A>, the <A to="/blocks/chat-app">chat app</A>, a{" "}
          <A to="/blocks/settings-page">settings page</A>, a <A to="/blocks/notification-center">notification center</A>{" "}
          and a <A to="/blocks/bento-grid">bento grid</A>.
        </p>
        <p>
          Looking for full analytics screens? The <A to="/dashboards">glassmorphism dashboard templates</A> have their
          own page, with five complete dashboards that use the <A to="/charts">animated React charts</A>. If you would
          rather assemble your own, browse the <A to="/components">glass UI components</A> they are made from, and read
          the <A to="/guides/glassmorphism-react-tutorial">glassmorphism React tutorial</A> to see how the surface
          works. To add a block to your app, follow the <A to="/docs/installation">installation page</A> and the{" "}
          <A to="/docs/tailwind-v4">Tailwind CSS v4 setup</A>.
        </p>
      </AboutHub>
    </Page>
  );
}

const dashboardTemplates = [
  {
    to: "/dashboards/web-analytics",
    name: "Web analytics",
    item: "analytics-web",
    component: "WebAnalyticsDashboard",
    charts: "Area trend with the previous period, streaming realtime chart, bar lists, donut, world map",
    data: "points, totals, pages, referrers, countries, devices, realtime",
  },
  {
    to: "/dashboards/saas",
    name: "SaaS revenue",
    item: "analytics-saas",
    component: "SaasRevenueDashboard",
    charts: "Stacked area (MRR by plan), donut, waterfall (MRR movement), retention cohorts, sortable table",
    data: "points per plan, kpis, movement, cohorts, customers",
  },
  {
    to: "/dashboards/ecommerce",
    name: "E-commerce",
    item: "analytics-ecommerce",
    component: "EcommerceDashboard",
    charts: "Revenue bars with a comparison line, checkout funnel, treemap, hour-by-weekday heatmap, bar list",
    data: "points, kpis, funnel, categories, heatmap, products",
  },
  {
    to: "/dashboards/product",
    name: "Product analytics",
    item: "analytics-product",
    component: "ProductDashboard",
    charts: "Sankey user journey, activation funnel, feature adoption bars, cohorts, calendar heatmap",
    data: "dau, wau, mau, flow, funnel, adoption, cohorts, events",
  },
  {
    to: "/dashboards/crypto-dashboard",
    name: "Crypto",
    item: "analytics-finance",
    component: "FinanceDashboard",
    charts: "Scrub-and-measure area chart, candlesticks with volume, allocation donut or treemap, live watchlist",
    data: "assets, series, previous, candles, transactions",
  },
] as const;

/** What each of the dashboard templates contains, the data it takes and how to install it: the hub's own content. */
function DashboardsGuide() {
  const th = "px-3 py-2 text-start font-semibold";
  const td = "px-3 py-2 align-top";
  return (
    <>
      <section aria-labelledby="dashboard-compare" className="flex flex-col gap-4">
        <h2 id="dashboard-compare" className="text-2xl font-semibold tracking-tight">
          Which glass dashboard template to pick
        </h2>
        <Prose>
          <p>
            Pick Web analytics for traffic and live visitors, SaaS revenue for MRR and churn, E-commerce for orders and
            conversion, Product analytics for funnels and Sankey flows, Crypto for candlesticks and streaming prices.
            All five are one component built on the same kit: a glass header (time range, filters, Live, Compare and CSV
            export), a KPI strip with rolling numbers and sparklines, then panels that each have a chart and a table
            view. They differ in the charts they draw and in the shape of the data they take.
          </p>
        </Prose>
        <div
          role="region"
          aria-label="Dashboard templates compared"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a sideways-scrolling table region must be keyboard-focusable
          tabIndex={0}
          className="glass-2 max-w-full overflow-x-auto rounded-sheen-lg"
        >
          <table className="w-full min-w-[44rem] text-start text-sm">
            <caption className="sr-only">
              The five React glass dashboard templates: component, charts and data shape
            </caption>
            <thead>
              <tr className="border-b border-sheen-border">
                <th scope="col" className={th}>
                  Template
                </th>
                <th scope="col" className={th}>
                  Charts
                </th>
                <th scope="col" className={th}>
                  Data fields
                </th>
                <th scope="col" className={th}>
                  Registry items (component, with demo data)
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardTemplates.map((t) => (
                <tr key={t.item} className="border-b border-sheen-border last:border-b-0">
                  <th scope="row" className={`${td} text-start font-medium`}>
                    <A to={t.to}>{t.name}</A>
                    <br />
                    <code className={inlineCode}>{t.component}</code>
                  </th>
                  <td className={td}>{t.charts}</td>
                  <td className={td}>
                    <code className={inlineCode}>{t.data}</code>
                  </td>
                  <td className={td}>
                    <code className={inlineCode}>{t.item}</code>
                    <br />
                    <code className={inlineCode}>{t.item.replace("analytics-", "analytics-demo-")}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="dashboard-install" className="flex flex-col gap-4">
        <h2 id="dashboard-install" className="text-2xl font-semibold tracking-tight">
          Install a dashboard template with the shadcn registry
        </h2>
        <Prose>
          <p>
            Each template is a registry item, and its sample data is a second item named{" "}
            <code className={inlineCode}>analytics-demo-&lt;name&gt;</code> that also installs the dashboard. Run the
            add command with the demo item, for example the SaaS one, and the shadcn CLI copies the dashboard, the
            dashboard kit, the charts it uses and the sample data into{" "}
            <code className={inlineCode}>components/sheenui/</code>:
          </p>
        </Prose>
        <CommandField
          command={`npx shadcn@latest add ${SITE_URL}/r/analytics-demo-saas.json`}
          label="Install command: dashboard template"
        />
        <Prose>
          <p>
            For production, where <code className={inlineCode}>load</code> returns your own data, install the component
            only: <code className={inlineCode}>analytics-saas</code> instead of{" "}
            <code className={inlineCode}>analytics-demo-saas</code>. Your app needs React 19.2 and Tailwind CSS v4; the{" "}
            <A to="/docs/tailwind-v4">Tailwind v4 glass UI setup</A> covers the two CSS imports, and the{" "}
            <A to="/docs/installation">installation page</A> lists the rest.
          </p>
        </Prose>
      </section>
      <section aria-labelledby="dashboard-data" className="flex flex-col gap-4">
        <h2 id="dashboard-data" className="text-2xl font-semibold tracking-tight">
          Swap the demo data for your own
        </h2>
        <Prose>
          <p>
            A template ships with no data. You pass <code className={inlineCode}>load</code>, a function that gets the
            date range, the active filters and an abort signal and returns the object in the table above, synchronously
            or as a promise. The demos use <code className={inlineCode}>saasRevenueDemoLoader</code> from{" "}
            <code className={inlineCode}>@sheenui/theme/demo-data</code>; replace it with a function that calls your API
            and maps the response to the same fields:
          </p>
        </Prose>
        <ScrollPre
          label="Using your own loader"
          className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm"
        >
          <code>{`import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";

export function Revenue() {
  return (
    <SaasRevenueDashboard
      currency="EUR"
      locale="de-DE"
      load={async ({ range, signal }) => {
        const res = await fetch(\`/api/revenue?range=\${range}\`, { signal });
        return res.json(); // { points, kpis, movement, cohorts, customers, ... }
      }}
    />
  );
}`}</code>
        </ScrollPre>
        <Prose>
          <p>
            Money and dates go through Intl from the <code className={inlineCode}>locale</code> and{" "}
            <code className={inlineCode}>currency</code> props, every string is in a{" "}
            <code className={inlineCode}>labels</code> object, and the live ticker (
            <code className={inlineCode}>liveStep</code>) is optional: leave it out for a static report. The{" "}
            <A to="/charts">chart gallery</A> shows what each chart takes if you want to build a screen of your own from
            the same pieces.
          </p>
        </Prose>
      </section>
    </>
  );
}
/** /dashboards */
export function DashboardsHubPage() {
  const faq: FaqItem[] = [
    {
      q: "Are these dashboard templates really free?",
      a: "Yes. SheenUI is MIT licensed, so you can use the dashboards in personal and commercial projects.",
    },
    {
      q: "What do the dashboards use for charts?",
      a: "SheenUI's own animated React charts: line, area, bar, donut, funnel, heatmap and more, each with keyboard reading and a table view.",
    },
    {
      q: "Is the data real?",
      a: "No. The numbers are deterministic demo data, so the screens look the same every time. Replace the arrays with your own API.",
    },
    {
      q: "How do I connect my own data to a dashboard?",
      a: "Pass the required load prop, a function that returns the data for the current date range and filters, synchronously or as a promise. The demo loaders in @sheenui/theme/demo-data show the shape, and money and dates are formatted with Intl from the locale and currency props.",
    },
  ];
  return (
    <Page
      eyebrow="Dashboards"
      title="All dashboards"
      description={`${count("/dashboards")} complete dashboards on glass.`}
      related={false}
    >
      <p className="max-w-3xl text-base leading-relaxed text-pretty text-sheen-fg-muted">
        A React glass dashboard template is a full analytics screen you copy into your app: frosted KPI tiles, animated
        charts and filters, with the data left to you. These {count("/dashboards")} templates (web analytics, SaaS
        revenue, e-commerce, product analytics and crypto) install with one shadcn command each. MIT licence, no account
        or email gate: run one shadcn command and keep the source.
      </p>
      <AllDashboardsStage />
      <section aria-labelledby="hub-dashboards" className="flex flex-col gap-4">
        <h2 id="hub-dashboards" className="text-2xl font-semibold tracking-tight">
          Dashboards ({count("/dashboards")})
        </h2>
        <HubCards paths={hubChildren(routes, "/dashboards").map((r) => r.path)} />
      </section>
      <DashboardsGuide />
      <AboutHub name="dashboards" faq={faq}>
        <p>
          A glassy dashboard, or glassmorphism dashboard, puts KPI tiles, charts and filters on frosted panels over a
          soft background, and it only works when contrast, density and speed stay under control. The{" "}
          {count("/dashboards")} React dashboard templates below do that work for you: each is a full page you can copy,
          with animated charts, sparklines, date filters and a table view for every chart.
        </p>
        <p>
          Pick the one closest to your product. <A to="/dashboards/web-analytics">Web analytics</A> shows traffic,
          sources and a live visitor count; <A to="/dashboards/saas">SaaS revenue</A> follows MRR, churn and plans;{" "}
          <A to="/dashboards/ecommerce">e-commerce</A> tracks orders and conversion;{" "}
          <A to="/dashboards/product">product analytics</A> adds funnels and cohorts; and the{" "}
          <A to="/dashboards/crypto-dashboard">crypto dashboard</A> has candlesticks and a streaming price.
        </p>
        <p>
          The charts come from the <A to="/charts">animated React charts gallery</A>, where you can read about each
          type, and the surrounding parts from the <A to="/components">glass UI components</A>. For smaller pieces, see
          the <A to="/blocks/dashboard-stats">dashboard stat cards</A>. Dashboards draw many surfaces at once, so read{" "}
          <A to="/guides/backdrop-filter-performance">backdrop-filter performance</A> to keep them fast, and{" "}
          <A to="/guides/accessible-react-charts">accessible React charts</A> for the reading model.
        </p>
        <p>
          Each template is one component with a required <code>load</code> prop: a function (sync or async) that
          receives the date range and the active filters and returns the numbers and rows to draw. The templates ship no
          data of their own; the demo loaders in <code>@sheenui/theme/demo-data</code> are only for trying them out.
          Header controls (range, Live, Compare) are props too, so you can control them from your router or a store.
          Every label is in a <code>labels</code> object and every number goes through Intl, so a dashboard in another
          language or currency needs props, not edits.
        </p>
        <p>
          Want a whole admin app around a dashboard? The{" "}
          <A to="/docs/installation#starter-template">Glass Admin starter template</A> (Vite or Next.js) wires the SaaS
          revenue dashboard into an app shell with a customers table, settings and sign-in.
        </p>
      </AboutHub>
    </Page>
  );
}

/** /docs/installation */
export function InstallationPage() {
  const faq: FaqItem[] = [
    {
      q: "Which versions do I need?",
      a: "React 19.2 or newer and Tailwind CSS v4. The components also use Base UI, Motion, clsx and tailwind-merge; the shadcn CLI installs the ones a component needs.",
    },
    {
      q: "Do I need a tailwind.config.js?",
      a: "No. Tailwind v4 is configured in CSS. Import tailwindcss first and the SheenUI styles after it, and add an @source line only if Tailwind does not scan the folder that holds your copied components.",
    },
    {
      q: "Does it work with Next.js and Vite?",
      a: "Yes. Next.js App Router and Vite with React Router or TanStack Router were tested end to end. The installation guide lists the tested versions and the one CSS path to change in Next.js.",
    },
    {
      q: "Can I copy files instead of using the CLI?",
      a: "Yes. Every docs page has a Files to copy box with the exact folders and npm packages for that component, so you take only what you use.",
    },
  ];
  const pre = "glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm";
  return (
    <Page
      eyebrow="Docs"
      title="Installation"
      description="Add SheenUI to a React 19 and Tailwind CSS v4 app with one shadcn CLI command."
      related
    >
      <Prose className="-mt-6">
        <p>
          SheenUI works like shadcn/ui: you copy the source of the components you use into your project and own it. The
          fastest way is the shadcn CLI, because every component, chart and block is a registry item. One command copies
          the files and installs the packages they need, so you can add the{" "}
          <A to="/components/glass-card">glass card</A> or the <A to="/components/button">button</A> without reading an
          import graph. You end up with plain React components in your own folders that you can read, change and keep.
        </p>
      </Prose>
      <InstallAliasSection />
      <section aria-labelledby="install-shadcn" className="install-step flex max-w-3xl flex-col gap-3">
        <h2 id="install-shadcn" className="text-2xl font-semibold tracking-tight">
          Install with the shadcn CLI
        </h2>
        <Prose>
          <p>
            In a project that already has React 19.2 and Tailwind CSS v4 (new to it? the{" "}
            <A to="/docs/tailwind-v4">Tailwind v4 glass UI setup</A> is two lines of CSS), run the add command with the
            registry URL of the component:
          </p>
        </Prose>
        <CommandField
          command={`npx shadcn@latest add ${SITE_URL}/r/glass-card.json`}
          label="Install command: one component"
        />
        <Prose>
          <p>
            The item installs into <code className={inlineCode}>components/sheenui/</code> and pulls in the shared
            tokens, glass styles, motion presets and hooks. Replace <code className={inlineCode}>glass-card</code> with
            any item name: <code className={inlineCode}>button</code>, <code className={inlineCode}>dialog</code>,{" "}
            <code className={inlineCode}>data-table</code>, a chart or a block.
          </p>
        </Prose>
        <Prose>
          <p>
            An example can use more than the page&apos;s own component: the dialog example has an{" "}
            <code className={inlineCode}>Input</code>, so add <code className={inlineCode}>input</code> too. The Files
            to copy box on each page lists every item its examples import. A dashboard is the item{" "}
            <code className={inlineCode}>analytics-demo-saas</code> (dashboard plus sample data; the other four are{" "}
            <code className={inlineCode}>analytics-demo-web</code>, <code className={inlineCode}>-ecommerce</code>,{" "}
            <code className={inlineCode}>-product</code> and <code className={inlineCode}>-finance</code>) or{" "}
            <code className={inlineCode}>analytics-saas</code> for the dashboard alone.
          </p>
        </Prose>
        <Prose>
          <p>
            The command only adds files. To see a styled page you still need the alias, the two CSS imports below, the{" "}
            <code className={inlineCode}>SheenMotionProvider</code> and the backdrop, and the preference script. In Vite
            that script goes into <code className={inlineCode}>index.html</code> as an inline{" "}
            <code className={inlineCode}>&lt;script&gt;</code> in the head (its text is{" "}
            <code className={inlineCode}>sheenPreferenceScript</code>), because a component cannot be imported there. If
            the CLI fails with a 503 from github.io, run the command again.
          </p>
        </Prose>
      </section>
      <InstallBundlesSection />
      <StarterTemplateSection />
      <section aria-labelledby="install-css" className="install-step flex max-w-3xl flex-col gap-3">
        <h2 id="install-css" className="text-2xl font-semibold tracking-tight">
          Add the two CSS imports
        </h2>
        <Prose>
          <p>
            Import Tailwind first and the SheenUI styles after it in your global stylesheet. The CLI adds the second
            line for you; check the order and the path:
          </p>
        </Prose>
        <ScrollPre className={pre}>
          <code>{`@import "tailwindcss";\n@import "@/components/sheenui/styles/index.css";`}</code>
        </ScrollPre>
        <Prose>
          <p>
            That is the line the CLI adds, and Vite resolves the <code className={inlineCode}>@/</code> alias inside
            CSS. Next.js cannot, so there write the relative path from your global stylesheet, for example{" "}
            <code className={inlineCode}>../components/sheenui/styles/index.css</code> in{" "}
            <code className={inlineCode}>app/globals.css</code>. Then put{" "}
            <code className={inlineCode}>sheenPreferenceScript</code> in the document head to avoid a flash of the wrong
            theme (see <A to="/docs/dark-mode">dark mode</A>). The <A to="/docs/tailwind-v4">Tailwind CSS v4 setup</A>{" "}
            explains what the stylesheet defines.
          </p>
          <p>
            In Next.js, a chart or dashboard example that passes a function (a{" "}
            <code className={inlineCode}>format</code> formatter, <code className={inlineCode}>seriesLegend</code>, a
            dashboard&apos;s <code className={inlineCode}>load</code>) must live in a file that starts with{" "}
            <code className={inlineCode}>&quot;use client&quot;</code>; a Server Component cannot pass functions to
            client components.
          </p>
        </Prose>
      </section>
      <section aria-labelledby="install-manual" className="install-step flex max-w-3xl flex-col gap-3">
        <h2 id="install-manual" className="text-2xl font-semibold tracking-tight">
          Copy the files by hand
        </h2>
        <Prose>
          <p>
            Prefer no CLI? Every docs page has a Files to copy box computed from the real import graph: the folders to
            copy from <code className={inlineCode}>theme/src</code> and the npm packages to add, usually{" "}
            <code className={inlineCode}>@base-ui/react</code>, <code className={inlineCode}>motion</code>,{" "}
            <code className={inlineCode}>clsx</code> and <code className={inlineCode}>tailwind-merge</code>. Copy the
            shared <code className={inlineCode}>styles</code>, <code className={inlineCode}>lib</code>,{" "}
            <code className={inlineCode}>motion</code> and <code className={inlineCode}>hooks</code> folders once, then
            the component folders you need, all under <code className={inlineCode}>components/sheenui/</code> (the
            folder the CLI uses, so the stylesheet import above is the same), and import the styles after Tailwind.
            Components that need the browser already start with <code className={inlineCode}>"use client"</code>, so
            they also work in the Next.js App Router.
          </p>
        </Prose>
      </section>
      <section aria-labelledby="install-setup" className="install-step flex max-w-3xl flex-col gap-3">
        <h2 id="install-setup" className="text-2xl font-semibold tracking-tight">
          Set up the providers and the backdrop
        </h2>
        <Prose>
          <p>
            Glass needs something colorful behind it, and Motion needs one shared configuration. Mount them once at the
            root of your app: <code className={inlineCode}>SheenMotionProvider</code> follows the reduced-motion
            setting, <code className={inlineCode}>SheenBackdrop</code> is the live wallpaper of the active style (or
            give <code className={inlineCode}>&lt;body&gt;</code> the static{" "}
            <code className={inlineCode}>sheen-backdrop</code> class), and{" "}
            <code className={inlineCode}>ToastProvider</code> with <code className={inlineCode}>Toaster</code> are only
            needed if you use toasts.
          </p>
        </Prose>
        <ScrollPre className={pre}>
          <code>{`import { SheenMotionProvider } from "@/components/sheenui/motion/provider";
import { SheenBackdrop } from "@/components/sheenui/backdrop/backdrop";
import { ToastProvider } from "@/components/sheenui/toast/toast";
import { Toaster } from "@/components/sheenui/toast/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SheenMotionProvider>
      <ToastProvider>
        <SheenBackdrop />
        {children}
        <Toaster />
      </ToastProvider>
    </SheenMotionProvider>
  );
}`}</code>
        </ScrollPre>
        <Prose>
          <p>
            In Next.js put this in a client component and render it inside{" "}
            <code className={inlineCode}>&lt;body&gt;</code>. The README&apos;s Project setup section also shows how to
            inline <code className={inlineCode}>sheenPreferenceScript</code> before first paint.
          </p>
        </Prose>
      </section>
      <section aria-labelledby="import-paths" className="flex max-w-3xl flex-col gap-3">
        <h2 id="import-paths" className="text-2xl font-semibold tracking-tight">
          Import paths: copied files or the package
        </h2>
        <Prose>
          <p>
            A copied install (the shadcn CLI or a hand copy) has no barrel: every component is its own file under{" "}
            <code className={inlineCode}>components/sheenui/</code>, so you import it from that file, for example{" "}
            <code className={inlineCode}>{'import { Button } from "@/components/sheenui/button/button"'}</code>.{" "}
            <code className={inlineCode}>@/components</code> is the alias from your{" "}
            <code className={inlineCode}>components.json</code>.
          </p>
          <p>
            The <code className={inlineCode}>@sheenui/theme</code> package (one barrel,{" "}
            <code className={inlineCode}>import {"{ Button }"} from &quot;@sheenui/theme&quot;</code>) is the single
            import form for a project that consumes the theme as a package. Copying files is the route this site
            documents, so the Code tab of every example shows the <strong>Copied files</strong> imports by default. The{" "}
            <strong>Import path</strong> switch above each code sample changes it to <strong>Package</strong>, and the
            choice is remembered. Helpers from <code className={inlineCode}>@sheenui/theme/demo-data</code> map to their
            own files too, for example{" "}
            <code className={inlineCode}>@/components/sheenui/blocks/analytics/demo-web</code>, which a dashboard page
            lists as an optional extra registry item.
          </p>
        </Prose>
      </section>
      <section aria-labelledby="install-fix" className="flex max-w-3xl flex-col gap-3">
        <h2 id="install-fix" className="text-2xl font-semibold tracking-tight">
          Common install problems
        </h2>
        <Prose>
          <ul className="flex list-disc flex-col gap-2 ps-6">
            <li>
              Components render unstyled: the SheenUI import is missing or comes before{" "}
              <code className={inlineCode}>@import "tailwindcss"</code> (the order is explained in the{" "}
              <A to="/docs/tailwind-v4">Tailwind v4 glass UI setup</A>).
            </li>
            <li>
              Next.js reports it cannot resolve{" "}
              <code className={inlineCode}>@/components/sheenui/styles/index.css</code>: change the import to the
              relative path.
            </li>
            <li>
              The theme flashes or <code className={inlineCode}>html</code> shows a hydration warning: inline{" "}
              <code className={inlineCode}>sheenPreferenceScript</code> in the head and add{" "}
              <code className={inlineCode}>suppressHydrationWarning</code> to <code className={inlineCode}>html</code>.
            </li>
          </ul>
          <p>
            Framework steps, tested versions and the rest of the troubleshooting table are in the{" "}
            <A to="/guides/install-frameworks">guide to installing SheenUI in Next.js and Vite</A>. The components sit
            on Base UI: see <A to="/docs/base-ui">Base UI components styled with glass</A>, and browse{" "}
            <A to="/components">all glass UI components</A> when you are set up. To see who maintains the project and
            what is tested, read the <A to="/about">About SheenUI</A> page.
          </p>
        </Prose>
      </section>
      <Faq items={faq} />
    </Page>
  );
}
