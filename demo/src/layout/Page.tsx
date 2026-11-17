import {
  Children,
  Suspense,
  cloneElement,
  isValidElement,
  lazy,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { GlassCard, cn } from "@sheenui/theme";

import { Breadcrumbs } from "./Breadcrumbs";
import { slugify, useHeadingId } from "./heading-ids";
import { A11yNotes, KeyboardTable, type KeyRow } from "./DocSections";
import { PageByline } from "./PageByline";
import { PageExtras } from "./PageExtras";
import { lazyBlock } from "./lazy-block";
import { RichText } from "./rich-text";
import { useScrollFade } from "./use-scroll-fade";
import { routes } from "../routes";
import { href } from "../router";
import { ExternalIcon, GithubIcon, sourceUrl } from "./links";
import { seoRow } from "../seo/head";
import { RoutePathContext } from "../seo/route-context";

type PageProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /**
   * Where the code lives, e.g. "theme/src/components/button/button.tsx" (or several).
   * Each one gets a "View source" link to GitHub.
   */
  source?: string | string[];
  /**
   * Show "Files to copy" (worked out from the real import graph of `source`).
   * Defaults to on for components, charts and blocks.
   */
  files?: boolean;
  /**
   * Keyboard table, rendered after the children (props tables) under an h2 "Keyboard".
   * Every docs page should have one: `[["Enter / Space", "Open the menu."], …]`.
   */
  keyboard?: KeyRow[];
  /** Accessibility notes, rendered last under an h2 "Accessibility": one list item per note. */
  a11y?: ReactNode[];
  /** Show the "Related pages" section (related components, guides, the hub). On by default. */
  related?: boolean;
  /** Never clamp the lede to two lines on a phone (a short two-sentence lede, e.g. the 404 page). Off by default. */
  fullLede?: boolean;
  /** Reserve and render the row of export chips (default true). A page that exports nothing passes false, so no empty row is reserved and then removed. */
  exportChips?: boolean;
  children: ReactNode;
};

const THEME_ROOT = "theme/src/";

/**
 * "Files to copy" reads the import graph of the whole theme (virtual:sheen-deps, ~4 KB gzip), so it is
 * its own chunk: the prerendered HTML has the panel, and the table arrives right after the page hydrates.
 * (A client-side visit shows a same-size placeholder meanwhile.)
 */
const FilesToCopy = lazy(() => import("./FilesToCopy"));
const filesFallback = <div aria-hidden className="min-h-10 max-w-3xl" />;

// Stage art by page, where the sidebar group is too coarse: sheets that open over the page (dialog, popover) take the
// overlays picture, the action controls take their own, so a button stage and a dialog stage are never the same scene.
const STAGE_FAMILY_OVERRIDE: Record<string, string> = {
  "/components/dialog": "overlays",
  "/components/popover": "overlays",
  "/components/button": "controls",
  "/components/button-group": "controls",
  "/components/switch": "controls",
  "/components/slider": "controls",
};

/** An element type that is the showcase stage (marked by ShowcaseStage.tsx, which Page does not import). */
const isStageType = (type: unknown) =>
  typeof type === "function" && (type as { isShowcaseStage?: boolean }).isShowcaseStage === true;

/** An element type that is `Example` (marked by Example.tsx, which Page does not import). */
const isExampleType = (type: unknown) =>
  typeof type === "function" && (type as { isSheenExample?: boolean }).isSheenExample === true;

/** The docs page template: eyebrow, title, description, source files, then the examples. */
export function Page({
  title,
  description,
  source,
  files,
  keyboard,
  a11y,
  related = true,
  fullLede = false,
  exportChips = true,
  children,
}: PageProps) {
  // The keyword map (src/seo/meta.ts) owns the <title>, the description and the intro, which opens with the page's keyword sentence.
  const path = useContext(RoutePathContext);
  const row = seoRow(path);
  // The H1 is the keyword headline of the keyword map (meta/*.ts: "Glass Button for React"), the same phrase the <title> and
  // the JSON-LD headline carry. The sidebar, the breadcrumb and the cards keep the route's short name ("Button").
  const heading = row?.h1 ?? routes.find((r) => r.path === path)?.title ?? title;
  const intro = row?.intro;
  // One intro under the H1: the answer-first definition when the page has one, else the keyword intro, else the description.
  const ledeText = row?.answer ?? intro ?? description;
  const lede = row?.answer?.includes("`") ? <RichText>{row.answer}</RichText> : ledeText;
  const sources = source === undefined ? [] : Array.isArray(source) ? source : [source];
  const showFiles = files ?? sources.some((s) => /^theme\/src\/(components|blocks)\//.test(s));

  const items = Children.toArray(children);
  // A page whose first child is the showcase stage puts the stage right under the lede (inside the first 900 px), with the
  // chips, "View source" and the FormsNote in one compact row below it. Other pages keep them in the header.
  const hasStage = isValidElement(items[0]) && isStageType(items[0].type);
  const firstDemo = items.findIndex((child) => isValidElement(child) && isExampleType(child.type));
  // "Files to copy" follows the first demo (the minimal example first, then the file list); with no top-level Example it
  // follows the stage, or the header when there is no stage either.
  const cut = firstDemo >= 0 ? firstDemo + 1 : hasStage ? 1 : 0;
  const stage = hasStage ? items[0] : null;
  const before = items.slice(hasStage ? 1 : 0, Math.max(cut, hasStage ? 1 : 0));
  // Examples after the first two skip style, layout and paint until they near the viewport (Example's `deferRender`): the
  // first layout and the style recalculation after each font swap then cover the screens a reader can see, not the page.
  const afterItems = items.slice(Math.max(cut, hasStage ? 1 : 0));
  const after = afterItems.map((child, index) => {
    if (!isValidElement<{ deferRender?: boolean }>(child) || !isExampleType(child.type)) return child;
    const earlier = afterItems.slice(0, index).filter((c) => isValidElement(c) && isExampleType(c.type)).length;
    return earlier >= 2 && child.props.deferRender === undefined ? cloneElement(child, { deferRender: true }) : child;
  });
  // The panel reads the import graph of the whole theme: it is lazy.
  const filesPanel = showFiles ? (
    <div key="files" className="min-w-0">
      <Suspense fallback={filesFallback}>
        <FilesToCopy sources={sources} />
      </Suspense>
    </div>
  ) : null;
  const metaRow = (
    <>
      {/* A hub (a route that has child routes) browses pages; the names to import belong to the pages it leads to. */}
      {exportChips && !routes.some((route) => route.path.startsWith(`${path}/`)) && <ExportChips path={path} />}
      <FormsNote path={path} />
      {sources.length > 0 && <SourceLinks sources={sources} />}
    </>
  );
  // The page's family (its sidebar group) art-directs the preview stages: backdrop.css draws a bar silhouette behind
  // charts, field rows behind forms, stacked panes behind overlays, bubbles behind chat and so on.
  const family =
    STAGE_FAMILY_OVERRIDE[path] ??
    routes
      .find((route) => route.path === path)
      ?.group.toLowerCase()
      .replace(/\s+/g, "-");

  return (
    <article className="flex flex-col gap-12" data-stage-family={family}>
      <header className="flex flex-col gap-3 sm:gap-4">
        <Breadcrumbs path={path} />
        {/* The breadcrumb already names the group, so the eyebrow is not rendered (the prop stays for pages that pass it). */}
        {/* tabIndex -1: focus lands here after navigating (see RouteFocus in App.tsx). */}
        <h1
          tabIndex={-1}
          className="scroll-mt-28 text-[1.75rem] leading-tight font-semibold tracking-tight text-balance outline-none sm:text-4xl"
        >
          {heading}
        </h1>
        {/* One short lede: the keyword intro replaces the older description (the same meaning twice read as padding). */}
        {lede && (
          <Lede full={fullLede} length={typeof ledeText === "string" ? ledeText.length : 0}>
            {lede}
          </Lede>
        )}
        {/* Answer-first: the plain definition, then the one-line install command (both prerendered text). */}
        {row?.install && <InstallLine command={row.install} />}
        {!hasStage && metaRow}
      </header>
      {stage && <div className="-mt-6">{stage}</div>}
      {hasStage && <div className="flex flex-col gap-3 sm:-mt-6">{metaRow}</div>}
      {firstDemo < 0 && filesPanel}
      {before}
      {firstDemo >= 0 && filesPanel}
      {after}
      <ExportIndex path={path} />
      {keyboard && keyboard.length > 0 && <KeyboardTable rows={keyboard} />}
      {a11y && a11y.length > 0 && <A11yNotes notes={a11y} />}
      <PageExtras path={path} />
      {related && <RelatedLinks path={path} />}
      <PageByline path={path} />
    </article>
  );
}

/**
 * Characters above which a phone lede is cut to four lines. The rule uses the text length alone, so the server and the client
 * always agree: a lede at or under it renders no clamp, no button and no reserved slot; one over it always renders the button.
 * Numbers: a phone lede is `text-base` (16 px) in at least 288 px at 320 px wide, about 7.5 px per character, so about 38
 * characters per line and about 35 after word-wrap loss. Four lines hold about 140 characters at 320 px, and about 212 at 430 px
 * (398 px of text, 53 characters per line, 7.5 px) or about 230 at 6.9 px per character. A lede over 240 characters therefore
 * needs more than four lines on every common phone width, so its clamp and its button always do something. A lede at or under
 * 240 is shown whole (at most about seven lines at 320 px) and has nothing to expand.
 */
const LEDE_CLAMP_FROM = 240;

/**
 * The page lede. On a phone only a long one (over `LEDE_CLAMP_FROM` characters) is cut to four lines, with a "More" button; the
 * full text stays in the HTML for search engines and screen readers. From `sm` it is shown whole. Nothing is measured, so
 * nothing below the lede moves on hydration.
 */
function Lede({ children, length, full = false }: { children: ReactNode; length: number; full?: boolean }) {
  const [open, setOpen] = useState(false);
  const long = !full && length > LEDE_CLAMP_FROM;
  return (
    <div className="flex flex-col items-start gap-1">
      <p className={cn("max-w-2xl text-base text-pretty text-sheen-fg-muted", long && !open && "max-sm:line-clamp-4")}>
        {children}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="cursor-pointer rounded-sheen-sm text-sm font-medium text-sheen-accent underline underline-offset-4 any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11 sm:hidden"
        >
          {open ? "Less" : "More"}
        </button>
      )}
    </div>
  );
}

/** The page's install command on one line (it scrolls sideways when narrow) with a Copy button. The text is in the prerendered HTML. */
function InstallLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <div className="glass-1 flex max-w-2xl min-w-0 items-center gap-2 rounded-sheen-lg ps-3 pe-1 font-sheen-mono text-xs">
      {/* A dashboard's install item brings its sample data; the "component only" command is under Files to copy. */}
      {/\/r\/analytics-demo[\w-]*\.json$/.test(command) && (
        <span className="shrink-0 font-sans text-sheen-fg-muted select-none">With demo data:</span>
      )}
      <code className="min-w-0 flex-1 py-2.5 [overflow-wrap:anywhere]">{command}</code>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(command).then(() => setCopied(true));
        }}
        className="min-h-9 shrink-0 cursor-pointer rounded-sheen-md px-3 font-sans text-sm font-medium text-sheen-accent hover:text-sheen-fg any-pointer-coarse:min-h-11"
      >
        {copied ? "Copied" : "Copy"}
        <span className="sr-only"> install command</span>
      </button>
    </div>
  );
}

/* ---------- Forms link ---------- */

const FORM_CONTROLS = new Set([
  "/components/input",
  "/components/select",
  "/components/checkbox",
  "/components/switch",
  "/components/slider",
  "/components/otp-input",
  "/components/combobox",
]);

/** On every form-control page: a link to the react-hook-form and zod recipe. */
function FormsNote({ path }: { path: string }) {
  const route = routes.find((r) => r.path === path);
  if (!route || path === "/docs/forms" || !(route.group === "Forms" || FORM_CONTROLS.has(path))) return null;
  return (
    <p className="text-sm text-sheen-fg-muted">
      Using it in a form?{" "}
      <a
        href={href("/docs/forms")}
        className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
      >
        See the react-hook-form and zod recipe
      </a>
      .
    </p>
  );
}

/* ---------- Export names ---------- */

// The chips and the export index are islands (ExportBlocks.tsx): the route -> exports table stays out of the initial JavaScript.
// "Related pages" (its link map and the guide list) loads once the page is idle; the links are in the prerendered HTML.
const RelatedLinks = lazyBlock(() => import("./RelatedLinks").then((m) => m.RelatedLinks), { minHeight: "0" });
const ExportIndex = lazyBlock(() => import("./ExportBlocks").then((m) => m.ExportIndex), { minHeight: "0" });
const ExportChips = lazyBlock(() => import("./ExportBlocks").then((m) => m.ExportChips), {
  // One chip row (22px), so the chips arriving late (dev, an in-app visit) do not push the page down.
  minHeight: "1.375rem",
});

/* ---------- View source ---------- */

function SourceLinks({ sources }: { sources: string[] }) {
  return (
    <ul className="flex min-w-0 flex-wrap gap-2">
      {sources.map((src) => (
        <li key={src} className="max-w-full">
          <a
            href={sourceUrl(src)}
            target="_blank"
            rel="noopener"
            className="glass-1 inline-flex min-h-9 max-w-full items-center gap-2 rounded-sheen-full px-3.5 py-1 text-sm font-medium [overflow-wrap:anywhere] transition-colors hover:text-sheen-accent any-pointer-coarse:min-h-11 [&>svg]:shrink-0"
          >
            <GithubIcon />
            {sources.length === 1 ? "View source" : src.replace(THEME_ROOT, "").replace(/\/$/, "").split("/").pop()}
            <ExternalIcon />
            <span className="sr-only">{sources.length === 1 ? ` (${src}, ` : " ("}opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Props table ---------- */

/** The keys of a `labels` prop: its `Partial<XLabels>` type, the exported `defaultXLabels` and each key's English default. */
export type LabelKeys = {
  type: string;
  const: string;
  keys: readonly (readonly [key: string, text: string])[];
  /** Set when the prop takes the whole object (not a Partial of it): the caption then says to spread the default. */
  full?: true;
};

/**
 * Which props table of a page owns the key table of each labels type: a type is listed once per page (the 140-key ChatLabels
 * table is not printed under every chat component) and the later rows link to the first one. Route path -> type -> details id.
 */
const labelTableOwners = new Map<string, Map<string, string>>();

/** [prop, type, default ("" when there is none), description, required?, labels?] (`labels`: the key table of a `labels` prop). */
export type PropRow = [
  name: string,
  type: string,
  defaultValue: string,
  description: ReactNode,
  required?: boolean,
  labels?: LabelKeys,
];

type PropsTableProps = {
  /**
   * The component's props, generated from its TypeScript source (`import * as PROPS from "../generated/component-props"`,
   * then `of={PROPS.Tooltip}`). Several components' rows can be passed as an array of arrays; same-named rows keep the first.
   */
  of?: readonly PropRow[] | readonly (readonly PropRow[])[];
  /** Hand-written rows: with `of`, a row replaces the generated one of the same name and any other row is appended. */
  rows?: readonly PropRow[];
  /** Heading above the table. */
  title?: string;
  /** Heading level, to fit the page outline (h3 when several tables sit under one h2). */
  as?: "h2" | "h3";
  className?: string;
};

/** A cell in the stacked phone layout: a block with its column name ("Type", "Default") as a small label in front (index.css `.prop-cell`). */
const CARD_CELL = "prop-cell max-[40rem]:mt-1 max-[40rem]:block max-[40rem]:max-w-none max-[40rem]:p-0";

/** A props table for a docs page: name, type, default and description per row. Below 40rem it stacks into one card per prop. */
export function PropsTable({
  of,
  rows: handRows = [],
  title = "Props",
  as: Heading = "h2",
  className,
}: PropsTableProps) {
  const headingId = useHeadingId(title);
  const scroller = useScrollFade<HTMLDivElement>();
  const [openTables, setOpenTables] = useState<string[]>([]);
  const list = of ?? [];
  const generated = (
    list.length > 0 && Array.isArray(list[0]?.[0]) ? (list as readonly (readonly PropRow[])[]).flat() : list
  ) as readonly PropRow[];
  const hand = new Map(handRows.map((row) => [row[0], row] as const));
  const seen = new Set<string>();
  const rows: PropRow[] = [];
  for (const row of generated) {
    if (seen.has(row[0])) continue;
    seen.add(row[0]);
    rows.push(hand.get(row[0]) ?? row);
  }
  for (const row of handRows) if (!seen.has(row[0])) rows.push(row);
  // One key table per labels TYPE (a component can take two: DatePicker's `labels` and `calendarLabels`), listed once per page.
  const routePath = useContext(RoutePathContext);
  let owners = labelTableOwners.get(routePath);
  if (!owners) labelTableOwners.set(routePath, (owners = new Map<string, string>()));
  const labelTables: { id: string; keys: LabelKeys; prop: string }[] = [];
  const labelAnchor = new Map<string, string>();
  for (const row of rows) {
    const keys = row[5];
    if (!keys || labelAnchor.has(keys.type)) continue;
    const id = `${headingId}-labels-${slugify(keys.type)}`;
    const owner = owners.get(keys.type) ?? (owners.set(keys.type, id), id);
    labelAnchor.set(keys.type, owner);
    if (owner === id) labelTables.push({ id, keys, prop: row[0] });
  }
  const tableIds = labelTables.map((t) => t.id).join(" ");
  // A link to a key table (in this props table or another one on the page) opens it.
  useEffect(() => {
    const ids = tableIds ? tableIds.split(" ") : [];
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (ids.includes(id)) setOpenTables((open) => (open.includes(id) ? open : [...open, id]));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [tableIds]);
  const deferred = rows.length > 16;
  return (
    <section
      // A long props table (more than 16 rows) sits below the fold: the browser skips its style and layout until it nears
      // the viewport (padding and an equal negative margin keep the glass shadow from being clipped by the containment).
      // Its placeholder height is measured per breakpoint (a row is 62 px at 90rem and up and about 100 px beside the
      // sidebar at 64rem, where the description column is narrowest, up to 146 px once the table stacks on a phone; each figure sits at
      // the tall end of what the real tables measure, since a too-short box clips the last rows under the next block, plus the heading), so it renders without a layout shift; `auto` then remembers the real height.
      // A short table is not worth it: its guessed height was the source of the scroll shifts.
      className={cn(
        "flex flex-col gap-3",
        deferred &&
          "-mx-3 -my-3 [--props-h:calc(var(--props-rows)*104px+104px)] [content-visibility:auto] px-3 py-3 min-[52rem]:[--props-h:calc(var(--props-rows)*80px+104px)] min-[64rem]:[--props-h:calc(var(--props-rows)*100px+104px)] min-[90rem]:[--props-h:calc(var(--props-rows)*62px+104px)] max-[40rem]:[--props-h:calc(var(--props-rows)*146px+104px)]",
        className,
      )}
      style={
        deferred
          ? ({ "--props-rows": rows.length, containIntrinsicSize: "auto var(--props-h)" } as CSSProperties)
          : undefined
      }
    >
      <Heading
        id={headingId}
        className={
          Heading === "h2" ? "text-xl font-semibold tracking-tight" : "font-sheen-mono text-base font-semibold"
        }
      >
        {title}
      </Heading>
      {/* Focusable so keyboard users can scroll it sideways on small screens. */}
      <div
        ref={scroller}
        role="region"
        aria-labelledby={headingId}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so it can be scrolled without a mouse
        tabIndex={0}
        // overflow-y-hidden: the region only ever scrolls sideways; a vertical overflow is just the off-screen content-visibility placeholder height.
        className="scroll-fade glass-2 overflow-x-auto overflow-y-hidden rounded-sheen-lg [scrollbar-width:thin]"
      >
        <table
          role="table"
          className="w-full min-w-[40rem] text-start [:where(&)_th]:text-start text-sm max-[40rem]:block max-[40rem]:min-w-0"
        >
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- the phone layout sets display:block, which makes Safari drop the implicit table roles; explicit roles keep them */}
          <thead role="rowgroup" className="text-xs text-sheen-fg-muted max-[40rem]:sr-only">
            <tr role="row" className="border-b border-sheen-border">
              <th scope="col" className="px-4 py-3 font-medium">
                Prop
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Type
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Default
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Description
              </th>
            </tr>
          </thead>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- same reason as the thead above */}
          <tbody role="rowgroup" className="max-[40rem]:block">
            {rows.map(([name, type, defaultValue, description, required, labelInfo]) => (
              <tr
                key={name}
                role="row"
                className="border-b border-sheen-border align-top last:border-0 max-[40rem]:block max-[40rem]:px-4 max-[40rem]:py-3"
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-start font-sheen-mono text-xs font-semibold break-words text-[color-mix(in_oklab,var(--sheen-accent)_68%,var(--sheen-fg))] sm:max-w-56 max-[40rem]:block max-[40rem]:p-0 max-[40rem]:text-sm max-[40rem]:whitespace-normal max-[40rem]:break-all"
                >
                  {name}
                  {required && <span className="sr-only"> (required)</span>}
                </th>
                <td
                  data-label="Type"
                  className={cn(
                    "max-w-64 px-4 py-3 font-sheen-mono text-xs break-words text-sheen-fg-muted",
                    CARD_CELL,
                  )}
                >
                  {type}
                </td>
                <td
                  data-label="Default"
                  className={cn(
                    "px-4 py-3 font-sheen-mono text-xs",
                    // A short default (a literal) stays on one line; a stated rule ("the browser's locale") wraps in a narrow column.
                    defaultValue.length > 24 ? "max-w-56 break-words" : "whitespace-nowrap",
                    CARD_CELL,
                    "max-[40rem]:max-w-none max-[40rem]:whitespace-normal",
                  )}
                >
                  {defaultValue ? (
                    labelInfo ? (
                      <a
                        href={`#${labelAnchor.get(labelInfo.type)}`}
                        onClick={() => {
                          const id = labelAnchor.get(labelInfo.type) ?? "";
                          setOpenTables((open) => (open.includes(id) ? open : [...open, id]));
                        }}
                        className="text-sheen-accent underline underline-offset-2 hover:text-sheen-fg inline-block min-h-6 py-1 any-pointer-coarse:min-h-11 any-pointer-coarse:py-2.5"
                      >
                        {defaultValue}
                      </a>
                    ) : // An arrow function default keeps its template-literal backticks; prose clauses render their `code` spans.
                    defaultValue.includes("=>") ? (
                      defaultValue
                    ) : (
                      <RichText>{defaultValue}</RichText>
                    )
                  ) : (
                    <>
                      <span aria-hidden className="text-sheen-fg-muted">
                        —
                      </span>
                      <span className="sr-only">None</span>
                    </>
                  )}
                </td>
                <td className={cn("min-w-56 px-4 py-3 text-sheen-fg-muted", CARD_CELL, "max-[40rem]:min-w-0")}>
                  <RichText>{description}</RichText>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {labelTables.map(({ id, keys: labelKeys, prop }) => (
        <details
          key={id}
          id={id}
          open={openTables.includes(id)}
          onToggle={(e) => {
            const open = e.currentTarget.open;
            setOpenTables((now) => (open ? (now.includes(id) ? now : [...now, id]) : now.filter((x) => x !== id)));
          }}
          className="glass-2 scroll-mt-24 rounded-sheen-lg text-sm"
        >
          <summary className="cursor-pointer px-4 py-3 font-medium">
            <span className="font-sheen-mono text-xs text-sheen-accent">{labelKeys.type}</span> keys and English
            defaults ({labelKeys.keys.length})
          </summary>
          <div className="overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
            <table className="w-full min-w-[20rem] text-start text-xs [:where(&)_th]:text-start">
              <caption className="pb-2 text-start text-sheen-fg-muted">
                {labelKeys.full ? (
                  <>
                    Spread <code className="font-sheen-mono">{labelKeys.const}</code> and override single keys in{" "}
                    <code className="font-sheen-mono">{prop}</code>.
                  </>
                ) : (
                  <>
                    Pass any key in <code className="font-sheen-mono">{prop}</code>; the rest keep the defaults of{" "}
                    <code className="font-sheen-mono">{labelKeys.const}</code>.
                  </>
                )}
              </caption>
              <thead className="text-sheen-fg-muted">
                <tr className="border-b border-sheen-border">
                  <th scope="col" className="py-2 pe-4 font-medium">
                    Key
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    English default
                  </th>
                </tr>
              </thead>
              <tbody>
                {labelKeys.keys.map(([key, text]) => (
                  <tr key={key} className="border-b border-sheen-border align-top last:border-0">
                    <th
                      scope="row"
                      className="py-2 pe-4 font-sheen-mono font-semibold text-[color-mix(in_oklab,var(--sheen-accent)_68%,var(--sheen-fg))]"
                    >
                      {key}
                    </th>
                    <td className="py-2 font-sheen-mono break-words text-[color-mix(in_oklab,var(--sheen-fg-muted)_65%,var(--sheen-fg))]">
                      {text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </section>
  );
}

// CodeBlock lives here, not in its own module: the guide article and the Example both need it, and a module of
// its own is a separate chunk (about 0.5 KB gzip) in the initial JavaScript of every page that uses both.
// The library's own CodeBlock (tokenizer, copy button, scroll region), loaded on demand: the plain fallback below has the
// same size as the finished block, so nothing shifts when it arrives.
const LibraryCodeBlock = lazy(() => import("./LibraryCodeBlock"));

/** A copy-able code block with a language label, used by every Example and Files-to-copy list. */
export function CodeBlock({
  code,
  label = "Code",
  plain = false,
  maxHeight,
}: {
  code: string;
  label?: string;
  plain?: boolean;
  maxHeight?: number;
}) {
  const trimmed = code.trim();
  const fallback = (
    <GlassCard level={3} sheen={false} className="relative overflow-hidden">
      <div
        role="region"
        aria-label={label}
        style={maxHeight ? { maxHeight } : undefined}
        className="max-h-[28rem] overflow-auto overscroll-contain rounded-[inherit] [scrollbar-width:thin]"
      >
        <pre className="w-fit min-w-full p-5 pe-24 font-sheen-mono text-[0.8125rem] leading-relaxed">
          <code>{trimmed}</code>
        </pre>
      </div>
    </GlassCard>
  );
  return (
    <Suspense fallback={fallback}>
      <LibraryCodeBlock code={trimmed} label={label} language={plain ? "text" : "tsx"} maxHeight={maxHeight} />
    </Suspense>
  );
}
