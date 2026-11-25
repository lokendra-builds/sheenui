import { useState, type ReactNode } from "react";
import { Pagination, useTheme } from "@sheenui/theme";

import { Example } from "../layout/Example";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { PaginationScene as PaginationSceneData } from "../layout/ShowcaseStage.pagination";
import { PaginationScene } from "../layout/ShowcaseStage.pagination.scene";
import { Faq, type FaqItem } from "../layout/LazyAbout";
import { Page, PropsTable } from "../layout/Page";
import { ScrollPre } from "../layout/ScrollPre";
import { href } from "../router";
import * as PROPS from "../generated/component-props";

/*
 * Four reference pages from the keyword map: how SheenUI uses Base UI, how its Tailwind CSS v4 setup
 * works, how dark mode is wired, and the Pagination component. Text written from the theme source.
 */

const a = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";
function A({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={href(to)} className={a}>
      {children}
    </a>
  );
}
function Prose({ children }: { children: ReactNode }) {
  return <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">{children}</div>;
}
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <Prose>{children}</Prose>
    </section>
  );
}
const code = "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";
const C = ({ children }: { children: ReactNode }) => <code className={code}>{children}</code>;

/** /docs/base-ui */
export function BaseUiDocsPage() {
  const faq: FaqItem[] = [
    {
      q: "Do I have to install Base UI myself?",
      a: "The shadcn CLI and the packed package both add @base-ui/react for you. If you copy files by hand, run pnpm add @base-ui/react next to motion, clsx and tailwind-merge, because it is a peer dependency and the components import its primitives directly.",
    },
    {
      q: "Can I use Radix components next to SheenUI?",
      a: "Yes, nothing is shared at runtime. Base UI and Radix are separate packages with separate state, so mixing them only costs bundle size; avoid nesting one library's overlay inside the other's focus trap.",
    },
    {
      q: "Where does the focus and keyboard behavior come from?",
      a: "From Base UI. SheenUI adds the glass styling, the Motion animation and the Tailwind classes, but arrow-key movement, typeahead, focus return and Escape handling are the primitive's, which is why they stay correct when you restyle.",
    },
    {
      q: "Which Base UI version does SheenUI need?",
      a: "@base-ui/react 1.9 or newer within version 1 (^1.9.0). It is a peer dependency, so your app owns the version, and the theme imports each primitive from a subpath like @base-ui/react/dialog so unused ones stay out of the bundle.",
    },
    {
      q: "How do I replace the element a component renders?",
      a: "Use the render prop, Base UI's equivalent of Radix asChild. SheenUI's Button accepts render={<a href=\"...\" />} to become a link, and the hero buttons on this site do exactly that.",
    },
  ];
  return (
    <Page title="Built on Base UI" description="How SheenUI builds on Base UI's headless primitives.">
      <Section id="base-ui-what" title="What Base UI does for SheenUI">
        <p>
          Base UI is a set of unstyled, accessible React primitives. SheenUI wraps them: the primitive supplies the
          behavior (state, focus management, keyboard handling and ARIA), and SheenUI supplies the glass surface, the
          Tailwind CSS v4 classes and the Motion animation. That split is why a styled Base UI component here keeps its
          accessibility when you change how it looks.
        </p>
        <p>
          The theme imports primitives for dialogs and alert dialogs, drawers, popovers, tooltips, preview cards, menus,
          context menus, menubars, navigation menus, tabs, accordions, collapsibles, selects, comboboxes, autocompletes,
          checkboxes, radio groups, switches, toggles, sliders, number fields, one-time-code fields, fields and
          fieldsets, progress and meter, scroll areas, toasts, toolbars and avatars. Each docs page names the primitive
          it is built on in its source link.
        </p>
      </Section>
      <Section id="base-ui-styling" title="Styled Base UI components with Tailwind CSS v4">
        <p>
          Base UI exposes state as data attributes (open, checked, disabled, active) and CSS variables (the sliding tab
          indicator reads its size and position from variables). SheenUI styles those hooks with Tailwind variants, so
          there is no runtime styling library and no theme provider beyond the optional motion provider. See the{" "}
          <A to="/docs/tailwind-v4">Tailwind CSS v4 setup</A> for how the tokens reach the classes.
        </p>
        <p>
          Animation is layered on top: a dialog springs in with Motion while Base UI owns the focus trap, and under
          reduced motion the spring becomes a short fade. The <A to="/components/dialog">glass modal dialog</A> and{" "}
          <A to="/components/tabs">animated tabs</A> show both layers.
        </p>
      </Section>
      <Section id="base-ui-map" title="Which primitive sits under which component">
        <p>
          Eight of the wrappers, with the Base UI module each one imports and the behavior that stays the
          primitive&rsquo;s. SheenUI adds the glass classes, the Motion animation and flat part names on top.
        </p>
        <div className="overflow-x-auto">
          <table data-llms="include" className="w-full text-start text-sm">
            <caption className="sr-only">
              SheenUI components, the Base UI primitive each wraps, and what stays Base UI&rsquo;s
            </caption>
            <thead>
              <tr>
                <th scope="col" className="pb-2 pe-4 text-start font-medium">
                  SheenUI component
                </th>
                <th scope="col" className="pb-2 pe-4 text-start font-medium">
                  Base UI primitive
                </th>
                <th scope="col" className="pb-2 text-start font-medium">
                  Stays Base UI&rsquo;s
                </th>
              </tr>
            </thead>
            <tbody>
              <tr key="Dialog" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/components/dialog">Dialog</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/dialog</C>
                </td>
                <td className="py-2">focus trap, Escape, scroll lock, focus return</td>
              </tr>
              <tr key="Menu" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/overlays/dropdown-menu">Menu</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/menu</C>
                </td>
                <td className="py-2">arrow keys, typeahead, submenu handling</td>
              </tr>
              <tr key="Popover" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/components/popover">Popover</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/popover</C>
                </td>
                <td className="py-2">positioning, outside-click dismissal, focus handling</td>
              </tr>
              <tr key="Tooltip" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/components/tooltip">Tooltip</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/tooltip</C>
                </td>
                <td className="py-2">open delays, hover and focus triggers</td>
              </tr>
              <tr key="Select" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/components/select">Select</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/select</C>
                </td>
                <td className="py-2">listbox semantics, typeahead, form value</td>
              </tr>
              <tr key="Tabs" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/components/tabs">Tabs</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/tabs</C>
                </td>
                <td className="py-2">arrow-key movement, tab and panel ARIA</td>
              </tr>
              <tr key="Checkbox" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/components/checkbox">Checkbox</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/checkbox</C>
                </td>
                <td className="py-2">checked and indeterminate state, form input</td>
              </tr>
              <tr key="Switch" className="border-t border-sheen-glass-border">
                <th scope="row" className="py-2 pe-4 text-start font-medium">
                  <A to="/components/switch">Switch</A>
                </th>
                <td className="py-2 pe-4">
                  <C>@base-ui/react/switch</C>
                </td>
                <td className="py-2">checked state, form input</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
      <Section id="base-ui-render" title="The render prop instead of asChild">
        <p>
          Where Radix uses <C>asChild</C>, Base UI uses a <C>render</C> prop that takes an element or a function. It is
          how a button becomes a router link without losing its styles. Read{" "}
          <A to="/guides/base-ui-vs-radix">Base UI vs Radix</A> for a checked comparison of coverage and migration, and{" "}
          <A to="/guides/shadcn-alternatives">shadcn alternatives</A> for how this fits the copy-paste approach.
        </p>
      </Section>
      <Section id="base-ui-wrap" title="What a wrapper looks like">
        <p>
          A SheenUI component is a thin layer over one primitive. It forwards props and the <C>render</C> prop to the
          primitive, adds the glass classes and the Motion animation, and exports the parts as flat names (<C>Dialog</C>
          , <C>DialogTrigger</C>, <C>DialogContent</C>, <C>DialogTitle</C>) where Base UI nests them (<C>Dialog.Root</C>
          , <C>Dialog.Trigger</C>, <C>Dialog.Popup</C>). The state of the primitive stays the source of truth:
          controlled and uncontrolled use follow Base UI&rsquo;s <C>value</C>, <C>defaultValue</C> and{" "}
          <C>onValueChange</C> (<C>open</C>, <C>defaultOpen</C> and <C>onOpenChange</C> for overlays).
        </p>
        <p>
          That is also the limit. Where Base UI has no primitive (the charts, the chat blocks, the data table on
          TanStack Table), SheenUI writes the behavior itself, and its tests run an axe check on every component.
        </p>
      </Section>
      <Section id="base-ui-imports" title="Imports and bundle size">
        <p>
          The theme imports every primitive from its own subpath, such as <C>@base-ui/react/dialog</C> or{" "}
          <C>@base-ui/react/menu</C>, and never from the package root. A bundler therefore pulls in only the primitives
          behind the components you use: a project that copies the Button and the Dialog does not ship the Menu or the
          Combobox. The declared range is <C>@base-ui/react ^1.9.0</C>, as a peer dependency of the theme.
        </p>
      </Section>
      <Section id="base-ui-utilities" title="Base UI utilities beyond the primitives">
        <p>
          Some components have no primitive and still accept the <C>render</C> prop: Button, Breadcrumb, Sidebar,
          AspectRatio, BlurIn and LiquidGlass build it with Base UI&rsquo;s <C>useRender</C> hook, so{" "}
          <C>render={'{<a href="/pricing" />}'}</C> works on all of them the same way it works on a dialog trigger.
          Field merges its own props with the control&rsquo;s through <C>mergeProps</C>, and Tabs sets Base UI&rsquo;s{" "}
          <C>DirectionProvider</C>, which is how right-to-left layouts reach the arrow-key order. The theme reads the
          text direction through Base UI&rsquo;s <C>useDirection</C> as well, so a <C>dir</C> set on the page or on an
          ancestor is followed.
        </p>
      </Section>
      <Section id="base-ui-restyle" title="Restyling a wrapper without losing its behavior">
        <p>
          <C>className</C> goes on the outer element of a component and is merged with the glass classes, so yours wins.
          Inner parts take their own <C>partClassName</C> prop (<C>triggerClassName</C> on the Select button, for
          example), and every string the component shows or announces lives in a <C>labels</C> prop. None of this
          touches the primitive, so keyboard handling, focus return and ARIA keep working after a restyle.
        </p>
      </Section>
      <Section id="base-ui-install" title="What you install">
        <p>
          The shadcn CLI and the packed package add <C>@base-ui/react</C> as a peer dependency, next to <C>motion</C>,{" "}
          <C>clsx</C> and <C>tailwind-merge</C>. See the <A to="/docs/installation">installation page</A> for the
          commands.
        </p>
      </Section>
      <Faq items={faq} />
    </Page>
  );
}

/** /docs/tailwind-v4 */
export function TailwindV4DocsPage() {
  const faq: FaqItem[] = [
    {
      q: "How do I set up glassmorphism with Tailwind CSS v4?",
      a: 'Import tailwindcss first and the SheenUI stylesheet after it in your global CSS, with Tailwind\'s plugin for your bundler (@tailwindcss/vite or @tailwindcss/postcss); no tailwind.config.js is needed. The stylesheet defines the glass-1, glass-2 and glass-3 classes and the --sheen tokens, so a panel is className="glass-2 rounded-sheen-lg p-6" over something colorful, such as the sheen-backdrop class on the body.',
    },
    {
      q: "Does SheenUI work with Tailwind CSS v3?",
      a: "No. The styles use Tailwind v4 features: CSS-first configuration with @theme and @custom-variant, and the oklch tokens in the stylesheet. The peer dependency is tailwindcss 4.1 or newer.",
    },
    {
      q: "Do I need a tailwind.config.js?",
      a: "No. Tailwind v4 reads its configuration from your CSS. Import tailwindcss first, then the SheenUI styles; add an @source line only if Tailwind does not scan the folder that holds the copied components.",
    },
    {
      q: "Why must the SheenUI import come after Tailwind?",
      a: "The stylesheet defines tokens, glass levels, motion variants and presets that build on Tailwind's layers. Importing it afterwards lets its rules and custom variants win over the base layer, and the order is the same in the Vite and Next.js steps.",
    },
    {
      q: "How do I get the dark: variant to follow the theme switch?",
      a: "SheenUI declares @custom-variant dark against the data-theme attribute on the html element, so dark: classes follow the visitor's saved choice, with the operating system as the fallback when nothing is saved.",
    },
    {
      q: "Can my own utilities override a glass class?",
      a: "Yes. The glass-1, glass-2 and glass-3 classes sit in the components layer, which Tailwind orders before utilities, so p-6, rounded-sheen-lg or bg-transparent on the same element win without !important.",
    },
    {
      q: "Which Tailwind plugin do I use with Vite and with Next.js?",
      a: "@tailwindcss/vite in a Vite app and @tailwindcss/postcss in a Next.js app. Both read the same CSS entry file; SheenUI adds nothing to either config.",
    },
  ];
  return (
    <Page
      title="Tailwind CSS v4 setup"
      description="The two CSS lines SheenUI needs, the layers and tokens they define, and what changes from Tailwind v3."
    >
      <Section id="tw-setup" title="The two imports">
        <p>
          SheenUI is styled with Tailwind CSS v4 and needs no configuration file. In your global stylesheet, import
          Tailwind first and the SheenUI styles after it:
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`@import "tailwindcss";\n@import "@/components/sheenui/styles/index.css";`}</code>
        </ScrollPre>
        <p>
          This is the copied-files form: the shadcn CLI adds the second line for you when it installs the{" "}
          <C>sheenui-theme</C> item, and a hand copy puts the same stylesheet in the same folder. Vite resolves the{" "}
          <C>@/</C> alias inside CSS; Next.js cannot, so there write the path relative to your global stylesheet, for
          example <C>../components/sheenui/styles/index.css</C> in <C>app/globals.css</C>.
        </p>
        <p>Package build (packed tarball; the package is not on npm yet):</p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`@import "tailwindcss";\n@import "@sheenui/theme/styles.css";`}</code>
        </ScrollPre>
        <p>
          A Vite app also needs Tailwind&rsquo;s Vite plugin (<C>pnpm add -D tailwindcss @tailwindcss/vite</C>), added
          next to the React plugin:
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`// vite.config.ts
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default { plugins: [react(), tailwindcss()] };`}</code>
        </ScrollPre>
        <p>
          In a Next.js app, use <C>@tailwindcss/postcss</C> in <C>postcss.config.mjs</C> instead; the CSS file is the
          same. The <A to="/docs/installation">installation page</A> has the exact paths for the CLI and manual routes,
          and the <A to="/guides/install-frameworks">framework guide</A> covers Next.js, Vite and React Router.
        </p>
      </Section>
      <Section id="tw-source" title="Telling Tailwind where the classes are">
        <p>
          Tailwind only generates the utilities it finds in files it scans, and it skips <C>node_modules</C>. The packed
          package solves that itself: its stylesheet ends with an <C>@source</C> line that points at the package&rsquo;s
          own components, so the two package imports above are enough. If you import only the component folders you use,
          take <C>@sheenui/theme/styles/base.css</C> and add one <C>@source</C> line per folder.
        </p>
        <p>
          When you copy the source into your app, the files are part of your project and Tailwind finds them. Add{" "}
          <C>@source</C> only if your setup excludes the folder (for example a git-ignored one), with a path relative to
          the CSS file that points at <C>components/sheenui</C>. The copy test that backs every &ldquo;Files to
          copy&rdquo; list builds each one in an empty Vite app with the two imports and such an <C>@source</C> line.
        </p>
      </Section>
      <Section id="tw-layers" title="Layer order">
        <p>
          Tailwind v4 declares four cascade layers: <C>theme</C>, <C>base</C>, <C>components</C> and <C>utilities</C>.
          SheenUI uses three of them and adds one. The glass classes (<C>glass-1</C>, <C>glass-2</C>, <C>glass-3</C>)
          live in <C>components</C>, so a utility on the same element, such as <C>p-6</C> or <C>rounded-sheen-lg</C>,
          overrides them without <C>!important</C>. Page defaults (body color, the focus ring, the forced-colors border
          on buttons) are in <C>base</C>. Everything else the library writes by hand (motion rules, presets, backdrops,
          the reduced-transparency and contrast fallbacks) is in a layer named <C>sheen</C>.
        </p>
        <p>
          Because <C>sheen</C> is first mentioned after Tailwind&rsquo;s own declaration, it ranks above{" "}
          <C>utilities</C>. If your app needs its own order, declare the layers once at the top of the stylesheet, as
          this docs site does, and put your page rules in a layer after <C>sheen</C>.
        </p>
      </Section>
      <Section id="tw-tokens" title="Tokens exposed through @theme">
        <p>
          The entry file imports tokens, motion, glass, backgrounds, the two style presets (Liquid Glass and Aurora
          Neon), the backdrop styles and a contrast layer for the <C>prefers-contrast: more</C> setting. Colors are
          oklch values held in <C>--sheen-*</C> custom properties; the presets re-point them through a{" "}
          <C>data-sheen-style</C> attribute on the html element, and light or dark comes from <C>color-scheme</C> and{" "}
          <C>light-dark()</C>.
        </p>
        <p>
          A <C>@theme inline</C> block maps those properties to Tailwind names, so ordinary utilities read the tokens:{" "}
          <C>bg-sheen-bg</C>, <C>text-sheen-fg-muted</C>, <C>bg-sheen-accent-soft</C>, <C>outline-sheen-focus</C>,{" "}
          <C>rounded-sheen-lg</C> and <C>ease-sheen-exit</C>. Because the utilities point at variables, switching the
          theme or the preset restyles them without a rebuild. A small <C>@theme</C> block adds <C>text-2xs</C> (11px
          labels). <A to="/foundations">Glassmorphism tokens for Tailwind CSS</A> explains the glass tokens one by one.
        </p>
      </Section>
      <Section id="tw-plain" title="The smallest glass surface in plain Tailwind">
        <p>
          Without SheenUI, one Tailwind CSS v4 glass surface is a handful of utilities over a colorful background (blur
          needs something to blur). <C>backdrop-blur-xl</C> is a 24px blur:
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`<div className="bg-linear-to-br from-violet-500 via-fuchsia-400 to-amber-300 p-8">
  <div className="rounded-2xl border border-white/60 bg-white/55 p-6 backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-slate-900/50">
    Frosted glass
  </div>
</div>`}</code>
        </ScrollPre>
        <p>
          That is the whole idea; the <A to="/guides/glassmorphism-react-tutorial">glassmorphism tutorial</A> adds the
          lit rim, contrast checks and fallbacks. SheenUI replaces the repeated utilities with <C>glass-1</C>,{" "}
          <C>glass-2</C> and <C>glass-3</C> (below), tokens that follow the preset, and solid fallbacks. The{" "}
          <C>dark:</C> variant above follows the <C>data-theme</C> attribute once the SheenUI styles are imported (see
          the <A to="/docs/dark-mode">dark mode page</A>); in plain Tailwind v4, declare it yourself:
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`}</code>
        </ScrollPre>
      </Section>
      <Section id="tw-glass" title="The glass utilities">
        <p>
          Three classes make a surface glass. <C>glass-1</C> is a tint, a specular gradient, noise and a lit rim with no
          blur of its own, which keeps a page with dozens of small controls inside the budget of eight blurred surfaces.{" "}
          <C>glass-2</C> adds a backdrop blur and saturation, and <C>glass-3</C> a stronger blur with the deepest
          shadow. Use them like any class:
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`<div className="glass-2 rounded-sheen-xl p-6 text-sheen-fg">
  <h2 className="text-lg font-semibold">Plan</h2>
  <p className="text-sheen-fg-muted">Billed yearly.</p>
</div>`}</code>
        </ScrollPre>
        <p>
          Each level falls back on its own: a solid surface where <C>backdrop-filter</C> is missing, under reduced
          transparency and under <C>prefers-contrast: more</C>, and system colors in forced-colors mode. Never fade or
          filter a wrapper of a glass element; the blur then stops seeing the page behind it.
        </p>
      </Section>
      <Section id="tw-variants" title="Custom variants">
        <p>
          Two custom variants ship with it: <C>dark</C> follows <C>data-theme</C>, and <C>motion-ok</C> applies a class
          only when movement is welcome, which keeps transforms out of reduced-motion sessions. A third,{" "}
          <C>motion-reduced</C>, is its inverse, for the calmer stand-in such as a short fade. Write{" "}
          <C>motion-ok:hover:-translate-y-0.5</C> or <C>motion-ok:translate-x-2 motion-reduced:transition-opacity</C>.
          See <A to="/docs/dark-mode">dark mode</A> for the first.
        </p>
      </Section>
      <Section id="tw-v3" title="Coming from Tailwind v3">
        <p>
          Four things change. Configuration moves from <C>tailwind.config.js</C> into CSS (<C>@theme</C>,{" "}
          <C>@custom-variant</C>, <C>@source</C>). The three <C>@tailwind</C> directives become one{" "}
          <C>@import &quot;tailwindcss&quot;</C>. Colors are oklch variables rather than hex values, so an opacity
          modifier such as <C>bg-sheen-accent/20</C> is computed with <C>color-mix</C>. And the <C>dark</C> variant is
          no longer the <C>dark</C> class: here it reads <C>data-theme=&quot;dark&quot;</C>. If you have a v3 project,
          upgrade it first with Tailwind&rsquo;s own migration tool, then add the two imports.
        </p>
      </Section>
      <Faq items={faq} />
    </Page>
  );
}

/** /docs/dark-mode */
export function DarkModeDocsPage() {
  const { theme, setTheme } = useTheme();
  const faq: FaqItem[] = [
    {
      q: "Where is the theme choice stored?",
      a: "In localStorage under sheen:theme, as light or dark. System is the absence of a value, so the operating system's setting applies. The choice is synced across tabs.",
    },
    {
      q: "How do I avoid a flash of the wrong theme?",
      a: "Inline sheenPreferenceScript in the head. It runs before first paint and sets data-theme, data-motion and data-sheen-style from localStorage; in Next.js add suppressHydrationWarning to the html element.",
    },
    {
      q: "Does the glass look the same in dark mode?",
      a: "No, on purpose. Dark glass saturates the backdrop less (140 percent against 180 in light) because the dark blobs are already deep and more saturation would lower text contrast.",
    },
    {
      q: "Can I force one theme?",
      a: "Yes. Call setTheme from the useTheme hook, or set data-theme on the html element yourself. Setting it removes the system fallback until you pass system again.",
    },
    {
      q: "How do I add a theme toggle with a system option?",
      a: "Call setTheme with light, dark or system. System removes the data-theme attribute and the saved value, so the operating system's setting takes over again.",
    },
  ];
  return (
    <Page title="Dark mode" description="How the theme switch, the system setting and the glass tokens fit together.">
      <Example
        title="Switch the theme"
        description="useTheme returns the saved choice and a setter; this page's header toggle uses the same hook."
        code={`
import { useTheme } from "@sheenui/theme";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Theme: {theme}</button>;
}`}
      >
        <button
          type="button"
          className="glass-1 rounded-sheen-full px-4 py-2 text-sm font-medium any-pointer-coarse:min-h-11"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          Theme: {theme}
        </button>
      </Example>
      <Section id="dm-how" title="How dark mode works in SheenUI">
        <p>
          The theme is the <C>data-theme</C> attribute on the html element: <C>light</C>, <C>dark</C>, or absent for the
          system setting. The tokens read it through <C>light-dark()</C> and attribute selectors, and Tailwind's{" "}
          <C>dark:</C> variant is declared against the same attribute, so utility classes and tokens always agree. The{" "}
          <C>useTheme</C> hook writes the attribute, saves it and syncs other tabs.
        </p>
        <p>
          Dark glass is tuned separately: less backdrop saturation, deeper tints and the same contrast targets (WCAG
          AA). Reduced transparency and the contrast preference override both themes with solid surfaces, so dark mode
          never weakens accessibility. Read <A to="/guides/accessible-glassmorphism">accessible glassmorphism</A> for
          the checks.
        </p>
        <p>
          Three things are worth testing in your own app: the first paint (no flash of the wrong theme), the system
          setting when nothing is saved, and the forced-colors and high-contrast modes, where glass becomes solid and
          borders become system colors. All three are handled by the theme, but custom components you add must use the
          tokens instead of fixed colors to inherit that behavior.
        </p>
        <p>
          For first paint, inline <C>sheenPreferenceScript</C> in the head; the{" "}
          <A to="/docs/installation">installation page</A> shows where. The{" "}
          <A to="/guides/install-frameworks">Next.js and Vite guide</A> covers the hydration warning.
        </p>
      </Section>
      <Section id="dm-attrs" title="The attributes on the html element">
        <p>
          Every preference is a data attribute on <C>&lt;html&gt;</C>, saved in localStorage under a <C>sheen:</C> key.
          CSS reacts to the attribute, so a preference needs no JavaScript after the first paint.
        </p>
        <ul className="flex list-disc flex-col gap-1.5 ps-6">
          <li>
            <C>data-theme</C>: <C>light</C> or <C>dark</C>; absent follows the operating system.
          </li>
          <li>
            <C>data-motion</C>: <C>reduced</C> turns springs into short fades; absent is full motion.
          </li>
          <li>
            <C>data-transparency</C>: <C>reduced</C> makes every glass surface solid; absent is glass.
          </li>
          <li>
            <C>data-glass</C>: <C>lite</C> or <C>full</C>, the cheaper blur for slow devices.
          </li>
          <li>
            <C>data-sheen-style</C>: <C>liquid</C> (the default) or <C>aurora</C>, the two style presets.
          </li>
        </ul>
      </Section>
      <Section id="dm-tailwind" title="The dark variant in Tailwind CSS v4">
        <p>
          Tailwind v4 reads <C>dark:</C> from the system setting unless you redefine it. The SheenUI styles already do
          that against <C>data-theme</C>; in a project that does not import them, declare the same variant yourself:
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`@import "tailwindcss";\n@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`}</code>
        </ScrollPre>
        <p>
          Then <C>dark:bg-slate-900/50</C> follows the attribute that <C>useTheme</C> writes, and a plain{" "}
          <C>@media (prefers-color-scheme)</C> no longer decides. See the{" "}
          <A to="/docs/tailwind-v4">Tailwind CSS v4 setup</A> for the rest of the CSS.
        </p>
      </Section>
      <Section id="dm-tokens" title="Colors in your own components">
        <p>
          A custom component inherits dark mode when it takes its colors from tokens instead of writing <C>dark:</C>{" "}
          pairs. The semantic tokens (<C>--sheen-bg</C>, <C>--sheen-fg</C>, <C>--sheen-border</C> and the rest) are
          defined with <C>light-dark()</C>, and <C>color-scheme</C> follows <C>data-theme</C>, so one class resolves to
          a different value in each theme. Tailwind exposes them as <C>bg-sheen-bg</C>, <C>text-sheen-fg</C>,{" "}
          <C>text-sheen-fg-muted</C> and <C>border-sheen-border</C>; <C>glass-1</C>, <C>glass-2</C> and <C>glass-3</C>{" "}
          are the three glass levels, each with its own dark tint.
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`export function Note({ children }: { children: React.ReactNode }) {
  return (
    <aside className="glass-2 rounded-sheen-lg border border-sheen-border p-4 text-sheen-fg">
      <p className="text-sm text-sheen-fg-muted">{children}</p>
    </aside>
  );
}`}</code>
        </ScrollPre>
        <p>
          That component needs no theme logic: switch <C>data-theme</C> and the tint, the border and both text colors
          change together.
        </p>
      </Section>
      <Section id="dm-contrast" title="What the contrast targets are">
        <p>
          The text tokens are measured in the browser against the worst case, the brightest backdrop blob peak under
          plain, <C>glass-1</C> and <C>glass-2</C> surfaces, in both themes: body and status text must reach 4.5:1, and
          focus rings and control edges 3:1. The numbers sit in the comment at the top of the token file. If you add
          your own accent or status color, check it the same way on a glass surface, not only on the flat page color.
        </p>
      </Section>
      <Section id="dm-ssr" title="No flash of the wrong theme">
        <p>
          A server-rendered page does not know the saved choice, so the first paint can show the wrong theme until React
          loads. Put <C>sheenPreferenceScript</C> inline in the head: it runs before first paint, copies the saved
          values onto the html element and falls back to the Liquid Glass preset when storage is unavailable. In a
          Next.js root layout:
        </p>
        <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
          <code>{`import { sheenPreferenceScript } from "@/components/sheenui/hooks/use-preferences";
// Package build (after the first npm release, or a packed tarball): import { sheenPreferenceScript } from "@sheenui/theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-sheen-style="liquid" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: sheenPreferenceScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}`}</code>
        </ScrollPre>
        <p>
          <C>suppressHydrationWarning</C> is needed because the script changes the html element before React compares it
          with the server markup. In a Vite app, paste the script text into <C>index.html</C>.
        </p>
      </Section>
      <Faq items={faq} />
    </Page>
  );
}

/** /layout/pagination */
export function PaginationPage() {
  const [page, setPage] = useState(6);
  const faq: FaqItem[] = [
    {
      q: "How do I make the page links crawlable?",
      a: "Pass getPageHref. The control then renders anchors instead of buttons, so search engines and open-in-new-tab work; add onPageChange as well and clicks are handled in the app with the default navigation prevented.",
    },
    {
      q: "Does the control keep its width as the page changes?",
      a: "Yes. getPageItems always returns the same number of slots for a given page count, using ellipses for the gap, so the bar does not jump while someone clicks through.",
    },
    {
      q: "How do I translate the labels?",
      a: "Pass a partial labels prop. Every accessible name and screen-reader string, including Page 3 and the ellipsis text, is in PaginationLabels; spread defaultPaginationLabels and override single keys.",
    },
    {
      q: "Can I show two paginations on one page?",
      a: "Yes, but give each its own aria-label so the navigation landmarks are distinguishable to screen reader users.",
    },
  ];
  return (
    <Page
      title="Pagination"
      description="Page numbers with ellipses under a long list or table."
      source="theme/src/components/pagination/pagination.tsx"

      keyboard={[
        ["Tab / Shift + Tab", "Move between the first, previous, page, next and last controls."],
        [
          "Enter / Space",
          "Go to the focused page (a button). With getPageHref the items are links: Enter follows the link.",
        ],
        [
          "Edge arrows",
          "Previous on page 1 and Next on the last page stay focusable but do nothing (aria-disabled), so focus never drops to the page body.",
        ],
      ]}
      a11y={[
        "The control is a <nav> landmark named \u201cPagination\u201d; give each pagination on a page its own aria-label.",
        'The current page has aria-current="page"; every page button is named \u201cPage 3\u201d, and ellipses read \u201cMore pages\u201d.',
        "While disabled, nothing can be activated; on touch the targets are 44px; every string is in labels.",
      ]}
    >
      <ShowcaseStage<PaginationSceneData>
        label="Pagination demo"
        story={() => import("../layout/ShowcaseStage.pagination")}
        initial={{ page: 1 }}
        minHeight="13rem"
      >
        {(scene, ctx) => <PaginationScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Controlled pagination"
        description="Page numbers with ellipses; first, previous, next and last buttons."
        code={`
import { useState } from "react";
import { Pagination } from "@sheenui/theme";

export function Example() {
  const [page, setPage] = useState(6);
  return <Pagination page={page} onPageChange={setPage} pageCount={32} />;
}`}
      >
        <div className="flex flex-col items-center gap-3">
          <Pagination page={page} onPageChange={setPage} pageCount={32} />
          <p className="text-sm text-sheen-fg-muted">Current page: {page}</p>
        </div>
      </Example>
      <PropsTable of={PROPS.Pagination} />
      <Section id="pg-when" title="When to use pagination">
        <p>
          Use pagination under a long list or table when people need to know where they are and jump to a position:
          search results, an orders table, an admin list. The data table already uses it in its footer. Prefer infinite
          scroll or a load-more button only when position does not matter, and prefer a{" "}
          <A to="/components/combobox">combobox with search</A> when the goal is finding one item.
        </p>
        <p>
          Keep the page size predictable: a bar with seven slots (first and last page, the current one with a neighbor
          on each side, and two ellipses) fits a phone, and on small screens the control switches to the compact "Page 3
          of 32" text. Disable it while a request is in flight so a second click cannot start a second request, and
          reset to page 1 whenever a filter changes.
        </p>
        <p>
          Pair it with the <A to="/components/data-table">React data table</A> for server-side paging, with{" "}
          <A to="/components/skeleton">skeleton</A> rows while a page loads, and with{" "}
          <A to="/layout/breadcrumb">breadcrumbs</A> for orientation.
        </p>
      </Section>
      <Faq items={faq} />
    </Page>
  );
}
