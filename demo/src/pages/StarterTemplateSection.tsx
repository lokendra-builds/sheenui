import type { ReactNode } from "react";

import { CommandField } from "../layout/CommandField";
import { href } from "../router";
import { ScrollPre } from "../layout/ScrollPre";
import { REPO_URL, SITE_URL } from "../seo/site";

const inlineCode =
  "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";
const linkClass = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";

function Prose({ children }: { children: ReactNode }) {
  return <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">{children}</div>;
}

function A({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={href(to)} className={linkClass}>
      {children}
    </a>
  );
}

/** The "Starter template" step of the installation page: the Glass Admin apps, copied with degit. */
export function StarterTemplateSection() {
  return (
    <section aria-labelledby="starter-template" className="install-step flex max-w-3xl flex-col gap-3">
      <h2 id="starter-template" className="text-2xl font-semibold tracking-tight">
        Starter template
      </h2>
      <Prose>
        <p>
          Want a whole app instead of single components? Glass Admin is a small admin dashboard starter with a glass app
          shell, an overview with charts, a customers table, a settings page and a sign-in page. It comes for Vite
          (React Router) and for Next.js (App Router). Copy one with degit, then install and start it:
        </p>
      </Prose>
      <CommandField
        command="npx degit lokendra-builds/sheenui/templates/glass-admin-vite my-app"
        label="Starter template command: Vite"
      />
      <Prose>
        <p>
          For Next.js use <code className={inlineCode}>templates/glass-admin-next</code> in the same command. Both are
          on GitHub in the{" "}
          <a href={`${REPO_URL}/tree/main/templates`} className={linkClass}>
            templates folder
          </a>
          . Its analytics page is one of the <A to="/dashboards">dashboard templates</A>.
        </p>
      </Prose>
    </section>
  );
}

/** The "Install everything, or a whole family" step of the installation page: the five bundle items. */
export function InstallBundlesSection() {
  return (
    <section aria-labelledby="install-everything" className="install-step flex max-w-3xl flex-col gap-3">
      <h2 id="install-everything" className="text-2xl font-semibold tracking-tight">
        Install everything, or a whole family
      </h2>
      <Prose>
        <p>
          Five bundle items install a family in one command. A bundle has no files of its own: it lists the real items
          it needs, so nothing is copied twice and the shared theme comes along once.
        </p>
      </Prose>
      <CommandField command={`npx shadcn@latest add ${SITE_URL}/r/all.json`} label="Install command: everything" />
      <Prose>
        <p>
          <code className={inlineCode}>all</code> is the whole library. The smaller ones are{" "}
          <code className={inlineCode}>components</code>, <code className={inlineCode}>charts</code>,{" "}
          <code className={inlineCode}>blocks</code> and <code className={inlineCode}>dashboards</code> (the five
          dashboards with the components, charts and demo data they need). Expect a lot of files:{" "}
          <code className={inlineCode}>all</code> copies several hundred, so prefer a family or single items when you
          only need part of the library. To use short names, add the registry to your{" "}
          <code className={inlineCode}>components.json</code> once:
        </p>
      </Prose>
      <ScrollPre className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm">
        <code>{`"registries": {\n  "@sheenui": "${SITE_URL}/r/{name}.json"\n}`}</code>
      </ScrollPre>
      <CommandField command="npx shadcn@latest add @sheenui/all" label="Install command: everything, short name" />
      <Prose>
        <p>
          The namespace form was tested with shadcn CLI 4.23; the URL form above is the one that needs no setup. The
          same short form works for single items, for example <code className={inlineCode}>@sheenui/button</code>.
        </p>
      </Prose>
    </section>
  );
}
