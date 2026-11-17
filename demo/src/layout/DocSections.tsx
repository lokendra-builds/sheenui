import type { ReactNode } from "react";

import { SITE_URL } from "../seo/site";
import { useHeadingId } from "./heading-ids";
import { ScrollPre } from "./ScrollPre";

/**
 * The two sections every docs page ends with: a keyboard table and
 * accessibility notes. Same markup everywhere, so the page outline and styling never drift.
 */

/**
 * [keys, action]. A string: separate alternatives with " / " (e.g. "← / →") and each one renders as its own key cap.
 * A node: rendered as given (use it when you need your own markup).
 */
export type KeyRow = [keys: ReactNode, action: ReactNode];

type KeyboardTableProps = {
  rows: KeyRow[];
  /** Heading text (default "Keyboard"). */
  title?: string;
  /** Heading level, to fit the page outline (h3 inside a gallery section). */
  as?: "h2" | "h3";
};

/** "Keys | Action" table in a focusable, scrollable region (so it never widens the page at 320px). */
export function KeyboardTable({ rows, title = "Keyboard", as: Heading = "h2" }: KeyboardTableProps) {
  const id = useHeadingId(title);
  return (
    <section className="flex flex-col gap-3">
      <Heading
        id={id}
        className={Heading === "h2" ? "text-xl font-semibold tracking-tight" : "text-lg font-semibold tracking-tight"}
      >
        {title}
      </Heading>
      <div
        role="region"
        aria-labelledby={id}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so it can be scrolled without a mouse
        tabIndex={0}
        className="glass-2 overflow-x-auto rounded-sheen-lg [scrollbar-width:thin]"
      >
        {/* Under sm each row stacks as a card (key caps above the action): a long key combo never squeezes the action into a sliver. */}
        <table className="w-full text-start [:where(&)_th]:text-start text-sm max-sm:block sm:min-w-[20rem]">
          <thead className="text-xs text-sheen-fg-muted max-sm:sr-only">
            <tr className="border-b border-sheen-border">
              <th scope="col" className="px-4 py-3 font-medium">
                Keys
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="max-sm:block">
            {rows.map(([keys, action], index) => {
              // "Enter / Space on a legend key": key caps first, then where the keys apply.
              const text = typeof keys === "string" ? keys : null;
              const [caps = text ?? "", context] = text ? text.split(/ (?=on )/, 2) : [];
              return (
                <tr
                  key={text ?? index}
                  className="border-b border-sheen-border align-top last:border-0 max-sm:block max-sm:px-1 max-sm:py-2"
                >
                  <th
                    scope="row"
                    className="px-3 py-3 font-normal max-sm:block max-sm:pb-0 sm:px-4 sm:whitespace-nowrap"
                  >
                    {text === null
                      ? keys
                      : caps.split(" / ").map((k, i) => (
                          // inline-block boxes sit in the line box, so wrapped key caps never overlap (WCAG 1.4.12).
                          <span key={k} className="inline-block py-0.5 whitespace-nowrap">
                            {i > 0 && <span className="px-1 text-sheen-fg-muted">/</span>}
                            <kbd className="inline-block rounded-sheen-sm border border-sheen-border bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-xs leading-normal">
                              {k}
                            </kbd>
                          </span>
                        ))}
                    {context && <span className="ps-1.5 text-sheen-fg-muted">{context}</span>}
                  </th>
                  <td className="px-4 py-3 text-sheen-fg-muted max-sm:block max-sm:pt-1">{action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type A11yNotesProps = {
  /** One `<li>` per note (or pass `notes`). */
  children?: ReactNode;
  /** Shorthand: each string or node becomes one list item. */
  notes?: ReactNode[];
  /** Alias of `notes`. */
  items?: ReactNode[];
  /** Heading text (default "Accessibility"). */
  title?: string;
  as?: "h2" | "h3";
};

/** "Accessibility" section: a short list of what the component does for assistive tech and what the consumer must supply. */
export function A11yNotes({ children, notes, items, title = "Accessibility", as: Heading = "h2" }: A11yNotesProps) {
  const id = useHeadingId(title);
  return (
    <section className="flex flex-col gap-3">
      <Heading
        id={id}
        className={Heading === "h2" ? "text-xl font-semibold tracking-tight" : "text-lg font-semibold tracking-tight"}
      >
        {title}
      </Heading>
      <ul className="glass-1 flex max-w-3xl list-disc flex-col gap-2 rounded-sheen-lg py-4 ps-9 pe-5 text-sm text-pretty text-sheen-fg-muted marker:text-sheen-fg-subtle">
        {(notes ?? items)?.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
        {children}
      </ul>
    </section>
  );
}

type DemoDataNoteProps = {
  /** Registry item that holds the sample data, e.g. "analytics-demo-web". */
  item: string;
  /** Names exported by `@sheenui/theme/demo-data`, e.g. ["webAnalyticsDemoLoader", "webLiveStep"]. */
  names: [loader: string, liveStep: string];
  /** The dashboard component, e.g. "WebAnalyticsDashboard". */
  component: string;
};

/**
 * The "Data" section of a dashboard page: `load` is required (no dashboard falls back to fake data), and the sample data
 * for demos lives in the separate `@sheenui/theme/demo-data` module.
 */
export function DemoDataNote({ item, names, component }: DemoDataNoteProps) {
  const id = useHeadingId("Data");
  const code = "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em]";
  return (
    <section className="flex max-w-3xl flex-col gap-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        Data
      </h2>
      <p className="text-sm text-pretty text-sheen-fg-muted">
        <code className={code}>load</code> is required: <code className={code}>{component}</code> never invents numbers.
        Return your own data (or a promise of it) from <code className={code}>load</code>. For demos and prototypes use
        the sample loader and live step from the separate <code className={code}>@sheenui/theme/demo-data</code> module:
      </p>
      <ScrollPre
        label="Demo data import example"
        className="glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-xs"
      >
        <code data-copy-imports="" suppressHydrationWarning>{`import { ${component} } from "@sheenui/theme";
import { ${names[0]}, ${names[1]} } from "@sheenui/theme/demo-data";

<${component} load={${names[0]}} liveStep={${names[1]}} />`}</code>
      </ScrollPre>
      <p className="text-sm text-pretty text-sheen-fg-muted">
        With the shadcn CLI the sample data is its own optional item, which also installs the dashboard (the &ldquo;with
        demo data&rdquo; command at the top of this page):{" "}
        <code className={code}>{`npx shadcn@latest add ${SITE_URL}/r/${item}.json`}</code>. The &ldquo;component
        only&rdquo; command under Files to copy leaves the sample data out, which is what a production build wants.
      </p>
    </section>
  );
}
