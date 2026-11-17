import type { ReactNode } from "react";

import { Faq, type FaqItem } from "../layout/LazyAbout";
import { Page } from "../layout/Page";
import { ScrollPre } from "../layout/ScrollPre";
import { REPO_FACTS } from "../generated/repo-facts";
import { href } from "../router";
import { COUNTS } from "../seo/counts";
import { AUTHOR, LICENSE_URL, REPO_URL, SITE_URL } from "../seo/site";

/* /about: the entity page. What SheenUI is, who makes it, the licence, the status and how it is checked. Facts come from the repo. */

const a = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";
function A({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={href(to)} className={a}>
      {children}
    </a>
  );
}
const ext = (url: string, children: ReactNode) => (
  <a href={url} target="_blank" rel="noopener" className={a}>
    {children}
    <span className="sr-only"> (opens in a new tab)</span>
  </a>
);
const code = "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";
const C = ({ children }: { children: ReactNode }) => <code className={code}>{children}</code>;
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">{children}</div>
    </section>
  );
}
const pre = "glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm";

const CITATION = `SheenUI. Glassmorphism and Liquid Glass React components. ${AUTHOR.name}. MIT license. ${SITE_URL}/about`;

/** /about */
export function AboutPage() {
  const faq: FaqItem[] = [
    {
      q: "Is SheenUI on npm?",
      a: "No. The theme package is marked private on purpose, so it cannot be published by accident. You install a component with the shadcn CLI (npx shadcn@latest add <url>.json), which copies the source into your app, or you copy the files the page lists.",
    },
    {
      q: "Is it free for commercial use?",
      a: "Yes. The license is MIT: use, change and ship the copied source in a commercial product. Keep the copyright and license notice with the source.",
    },
    {
      q: "Is it stable enough for production?",
      a: "It is version 0.1, pre-1.0, so props and file layout can still change between releases. The tests, the type checks and the accessibility checks run on every component, but no real iPhone or Android phone has been used yet and the Liquid Glass refraction only works in Chromium.",
    },
    {
      q: "Who maintains it, and where do I report a problem?",
      a: `${AUTHOR.name} maintains it. Open an issue on the GitHub repository; a reproduction (the component, browser and the look: Liquid Glass or Aurora Neon, light or dark) is the fastest way to a fix.`,
    },
  ];
  return (
    <Page
      title="About SheenUI"
      description="What SheenUI is, who makes it, its license and status, and how it is built and checked."
      files={false}
      exportChips={false}
    >
      <Section id="what" title="What SheenUI is">
        <p>
          SheenUI is a copy-the-source library of glass React components: {COUNTS.ui} UI components, {COUNTS.effects}{" "}
          animated effects, {COUNTS.charts} charts, {COUNTS.blocks} blocks and {COUNTS.dashboards} dashboards. Each is
          built on a <A to="/docs/base-ui">Base UI</A> primitive where one exists, styled with Tailwind CSS v4 and
          animated with Motion. Two looks ship with it, Liquid Glass and Aurora Neon, each in light and dark.
        </p>
        <p>
          It is a source library, not a package you import from node_modules: the CLI copies the files into your
          repository and you own them. The <A to="/foundations">glass design tokens</A> (three glass levels, blur, tint
          and rim) and the <A to="/docs/tailwind-v4">Tailwind v4 setup</A> are the whole contract between the library
          and your app.
        </p>
      </Section>

      <Section id="who" title="Who makes it">
        <p>
          SheenUI is designed and built by {ext(AUTHOR.url, AUTHOR.name)} (GitHub: <C>{AUTHOR.handle}</C>), as an
          open-source project. The source, the issue tracker and the history live in the{" "}
          {ext(REPO_URL, "SheenUI repository")}. There is no company behind it and no paid tier.
        </p>
      </Section>

      <Section id="license" title="License and cost">
        <p>
          SheenUI is released under the {ext(LICENSE_URL, "MIT license")}. It costs nothing, needs no account and sends
          no telemetry. Third-party licenses (Base UI, Motion, the fonts) are listed in the repository&rsquo;s notices
          file.
        </p>
      </Section>

      <Section id="status" title="Status: version 0.1, pre-1.0, not on npm">
        <p>
          The current version is 0.1.0. Until 1.0, a prop or a file can move between versions. No GitHub release has
          been published yet, so 0.1.0 is simply the version in the source. The package is <C>private</C>, so there is
          nothing to <C>npm install</C>; the <A to="/docs/installation">installation page</A> shows the shadcn CLI route
          ({REPO_FACTS.registryItems} registry items) and the manual one.
        </p>
        <p>
          Known limits, stated plainly: Liquid Glass refraction is Chromium-only (other browsers show frosted glass),
          and no real iPhone or Android phone has been used, so iOS Safari blur is unverified. It needs React 19.2 or
          newer and Tailwind CSS 4.1 or newer.
        </p>
      </Section>

      <Section id="tested" title="How it is built and checked">
        <p>
          Each component has a unit test that renders it in light and dark, in both looks, and runs axe-core on every
          render: {REPO_FACTS.testFiles} test files run in a real Chromium through Vitest browser mode, with coverage
          gates (90% of lines, functions and statements, 80% of branches). {REPO_FACTS.e2eSpecs} Playwright specs cover
          the built site: a sweep of every route, visual baselines, accessibility, a pixel-level contrast check and the
          motion rules (loops pause off-screen, reduced motion is respected).
        </p>
        <p>
          Every docs page lists the exact files to copy, computed from the import graph, and a copy test builds each
          list in an empty Vite app. A build check fails on a missing title, a duplicate description, a broken link or a
          number on the site that disagrees with the code. The <A to="/docs/dark-mode">dark mode</A> and{" "}
          <A to="/docs/rtl">right-to-left</A> pages describe the two behaviours that touch every component.
        </p>
      </Section>

      <Section id="cite" title="How to cite SheenUI">
        <p>Link to {ext(SITE_URL, SITE_URL)} or to the repository. For a text citation, use:</p>
        <ScrollPre label="Citation text" className={pre}>
          <code>{CITATION}</code>
        </ScrollPre>
        <p>
          A page-level fact (a prop, a count, a browser limit) is best cited with the page it comes from: every docs
          page has a stable URL, and <A to="/components">the component index</A>, <A to="/charts">the charts</A> and the{" "}
          <A to="/guides">guides</A> list them.
        </p>
      </Section>

      <Faq items={faq} />
    </Page>
  );
}
