import { Fragment, useMemo, type ReactNode } from "react";
import { cn } from "@sheenui/theme";

import { Faq, type FaqItem } from "./LazyAbout";
import { slugify } from "./heading-ids";
import { CodeBlock, Page } from "./Page";
import { inlineText, parseGuide, type Block, type Inline } from "./markdown";
import { guidePath, guides, moreGuides } from "../guides";
import { GUIDE_IMAGE_SIZES, guideDarkImage, guideStyledShots, guideImageSrcSet, guideImages } from "../guide-images";
import { href } from "../router";
import { routes } from "../routes";
import { AUTHOR, BASE_PATH, SITE_URL } from "../seo/site";

/** Languages the TSX highlighter reads well; shell, CSS and prose are shown as they are. */
const HIGHLIGHTED = new Set(["ts", "tsx", "js", "jsx", "html"]);

const WORDS_PER_MINUTE = 220;

/** An absolute link to this site becomes an in-app link; anything else on the web opens in a new tab. */
function resolveLink(raw: string): { to: string; external: boolean } {
  if (raw === SITE_URL || raw.startsWith(`${SITE_URL}/`) || raw.startsWith(`${SITE_URL}#`)) {
    const rest = raw.slice(SITE_URL.length);
    const hashAt = rest.search(/[#?]/);
    const path = hashAt < 0 ? rest : rest.slice(0, hashAt);
    return { to: href(path.replace(/\/+$/, "") || "/") + (hashAt < 0 ? "" : rest.slice(hashAt)), external: false };
  }
  return { to: raw, external: /^https?:\/\//.test(raw) };
}

function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((node, i) => {
    if (typeof node === "string") return <Fragment key={i}>{node}</Fragment>;
    switch (node.t) {
      case "code":
        return (
          <code
            key={i}
            className="rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]"
          >
            {node.v}
          </code>
        );
      case "b":
        return (
          <strong key={i} className="font-semibold">
            {renderInline(node.c)}
          </strong>
        );
      case "i":
        return <em key={i}>{renderInline(node.c)}</em>;
      case "a": {
        const { to, external } = resolveLink(node.href);
        return (
          <a
            key={i}
            href={to}
            {...(external ? { target: "_blank", rel: "noopener" } : {})}
            className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
          >
            {renderInline(node.c)}
            {external && <span className="sr-only"> (opens in a new tab)</span>}
          </a>
        );
      }
    }
  });
}

function blockWords(blocks: Block[]): number {
  const count = (nodes: Inline[]) => inlineText(nodes).split(/\s+/).filter(Boolean).length;
  let total = 0;
  for (const block of blocks) {
    if (block.t === "p" || block.t === "h") total += count(block.c);
    else if (block.t === "list") total += block.items.reduce((sum, item) => sum + blockWords(item), 0);
    else if (block.t === "table")
      total += [...block.head, ...block.rows.flat()].reduce((sum, cell) => sum + count(cell), 0);
  }
  return total;
}

/** Names for the code and table regions: the nearest heading, made unique within the article. */
function createNamer() {
  const used = new Map<string, number>();
  let heading = "";
  return {
    heading: (text: string) => {
      heading = text;
    },
    name: (kind: string) => {
      const base = heading ? `${heading}, ${kind}` : kind;
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      return n === 1 ? base : `${base} ${n}`;
    },
  };
}

type Namer = ReturnType<typeof createNamer>;

function renderBlocks(blocks: Block[], namer: Namer): ReactNode {
  return blocks.map((block, i) => {
    switch (block.t) {
      case "h": {
        if (block.level === 2) namer.heading(inlineText(block.c));
        const Tag = `h${block.level}` as const;
        const size = block.level === 2 ? "mt-8 text-2xl" : block.level === 3 ? "mt-4 text-lg" : "mt-2 text-base";
        return (
          <Tag key={i} id={block.id} className={`scroll-mt-28 font-semibold tracking-tight text-balance ${size}`}>
            {renderInline(block.c)}
          </Tag>
        );
      }
      case "p":
        return (
          <p key={i} className="text-base leading-relaxed text-pretty">
            {renderInline(block.c)}
          </p>
        );
      case "list": {
        const Tag = block.ordered ? "ol" : "ul";
        return (
          <Tag
            key={i}
            {...(block.ordered && block.start !== 1 ? { start: block.start } : {})}
            className={`flex flex-col gap-2 ps-6 marker:text-sheen-fg-muted ${block.ordered ? "list-decimal" : "list-disc"}`}
          >
            {block.items.map((item, j) => (
              <li key={j} className="ps-1 text-base leading-relaxed text-pretty">
                {item.length === 1 && item[0]?.t === "p" ? (
                  renderInline(item[0].c)
                ) : (
                  <div className="flex flex-col gap-3">{renderBlocks(item, namer)}</div>
                )}
              </li>
            ))}
          </Tag>
        );
      }
      case "table": {
        // Each column of a wide table keeps a readable width; the table scrolls inside its region.
        const minWidth = block.head.length > 3 ? `${block.head.length * 9}rem` : undefined;
        return (
          // Focusable so keyboard users can scroll a wide table sideways on small screens.
          <div
            key={i}
            role="region"
            aria-label={namer.name("table")}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so it can be scrolled without a mouse
            tabIndex={0}
            className="glass-2 overflow-x-auto rounded-sheen-lg [scrollbar-width:thin]"
          >
            <table style={{ minWidth }} className="w-full text-start text-sm [:where(&)_th]:text-start">
              <thead className="text-xs text-sheen-fg-muted">
                <tr className="border-b border-sheen-border">
                  {block.head.map((cell, j) => (
                    <th key={j} scope="col" className="px-4 py-3 font-medium">
                      {/* A corner cell with no text still needs a name for screen readers. */}
                      {inlineText(cell).trim() ? renderInline(cell) : <span className="sr-only">Item</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-sheen-border align-top last:border-0">
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <th key={c} scope="row" className="px-4 py-3 text-start font-semibold break-words">
                          {renderInline(cell)}
                        </th>
                      ) : (
                        <td key={c} className="px-4 py-3 text-sheen-fg-muted break-words">
                          {renderInline(cell)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "code":
        return (
          <CodeBlock
            key={i}
            code={block.code}
            label={namer.name(`${block.lang || "text"} code`)}
            plain={!HIGHLIGHTED.has(block.lang)}
          />
        );
    }
  });
}

function RouteLinks({ title, paths }: { title: string; paths: string[] }) {
  const items = paths.flatMap((path) => {
    const route = routes.find((r) => r.path === path);
    return route ? [route] : [];
  });
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 id={slugify(title)} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((route) => (
          <li key={route.path}>
            <a
              href={href(route.path)}
              className="glass-1 inline-flex min-h-9 items-center rounded-sheen-full px-3.5 py-1 text-sm font-medium transition-colors hover:text-sheen-accent any-pointer-coarse:min-h-11"
            >
              {route.title}
              <span className="sr-only"> ({route.group})</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FAQ_HEADING = "Frequently asked questions";

/**
 * Splits off a guide's FAQ: the "## Frequently asked questions" section, each `### Question` followed by one answer
 * paragraph. It renders as the site's FAQ accordion (the prerender reads it back into FAQPage JSON-LD); the rest of the
 * article renders as written. The Markdown file stays readable on GitHub and in llms text.
 */
function splitFaq(blocks: Block[]): { body: Block[]; faq: FaqItem[] } {
  const at = blocks.findIndex((b) => b.t === "h" && b.level === 2 && inlineText(b.c) === FAQ_HEADING);
  if (at < 0) return { body: blocks, faq: [] };
  const faq: FaqItem[] = [];
  let question: Inline[] | null = null;
  for (const block of blocks.slice(at + 1)) {
    if (block.t === "h" && block.level === 3) question = block.c;
    else if (block.t === "p" && question) {
      faq.push({ q: inlineText(question), a: renderInline(block.c) });
      question = null;
    }
  }
  return { body: blocks.slice(0, at), faq };
}

/**
 * One guide: the Markdown file docs/guides/<slug>.md rendered inside the docs page template.
 * `markdown` is the file's text (imported with `?raw`), parsed while the site is prerendered.
 */
export function GuideArticle({ slug, markdown }: { slug: string; markdown: string }) {
  const guide = useMemo(() => parseGuide(markdown), [markdown]);
  const info = guides.find((g) => g.slug === slug);
  const updated = String(guide.meta.updated ?? "");
  const published = String(guide.meta.published ?? "");
  const image = guideImages[slug];
  const dark = image && guideDarkImage(image);
  const styled = image && guideStyledShots(image);
  const dateText = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });
  const minutes = Math.max(1, Math.round(blockWords(guide.blocks) / WORDS_PER_MINUTE));
  const { body, faq } = splitFaq(guide.blocks);
  const sections = body.filter((b): b is Extract<Block, { t: "h" }> => b.t === "h" && b.level === 2);
  const related = Array.isArray(guide.meta.relatedRoutes) ? guide.meta.relatedRoutes : (info?.related ?? []);
  const others = moreGuides(slug);
  const namer = createNamer();

  return (
    <Page
      eyebrow="Guide"
      title={guide.title}
      description={String(guide.meta.description ?? "")}
      source={`docs/guides/${slug}.md`}
      related={false}
    >
      <div className="flex max-w-3xl min-w-0 flex-col gap-5">
        {/* A wrap-safe byline: each item carries its own leading dot; the row is shifted left inside a clipping box, so the dot of an item that starts a line sits outside the box and never shows. */}
        <div className="overflow-hidden py-0.5 text-sm text-sheen-fg-muted">
          <p className="-ms-3.5 flex flex-wrap gap-y-1">
            {(
              [
                <>
                  By{" "}
                  <a
                    href={AUTHOR.url}
                    target="_blank"
                    rel="author noopener"
                    className="font-medium text-sheen-fg underline underline-offset-4 hover:text-sheen-accent"
                  >
                    {AUTHOR.name}
                    <span className="sr-only"> (GitHub, opens in a new tab)</span>
                  </a>
                </>,
                <a
                  href={href("/about")}
                  className="font-medium text-sheen-fg underline underline-offset-4 hover:text-sheen-accent"
                >
                  About the author
                </a>,
                published && (
                  <>
                    Published <time dateTime={published}>{dateText(published)}</time>
                  </>
                ),
                updated && updated !== published && (
                  <>
                    Updated <time dateTime={updated}>{dateText(updated)}</time>
                  </>
                ),
                <>{minutes}&nbsp;min&nbsp;read</>,
              ] as ReactNode[]
            )
              .filter(Boolean)
              .map((item, i) => (
                <span
                  key={i}
                  className="relative ps-3.5 whitespace-nowrap before:absolute before:start-1 before:content-['·']"
                >
                  {item}
                </span>
              ))}
          </p>
        </div>

        {image && styled && (
          // The hero scene in all four looks: the page shows the one for the site's style and theme (index.css `.guide-hero-s`).
          <>
            {(["liquid", "aurora"] as const).flatMap((style) =>
              (["light", "dark"] as const).map((tone) => {
                const shot = styled[style][tone];
                const first = style === "liquid" && tone === "light";
                const img = (
                  <img
                    key={`${style}-${tone}`}
                    src={`${BASE_PATH}img/${shot.file}`}
                    width={shot.width}
                    height={shot.height}
                    srcSet={guideImageSrcSet(shot, BASE_PATH)}
                    sizes={GUIDE_IMAGE_SIZES}
                    alt={first ? image.alt : shot.alt}
                    // The default look (Liquid light) is the LCP element of a crawler or a first visit: eager with high priority in the
                    // HTML itself, matching the preload in the head. The other three stay lazy and display:none (never fetched). The inline
                    // script of the prerender (scripts/prerender.mjs, guideHeroScript) moves eager/high to the saved look when it is another.
                    loading={first ? "eager" : "lazy"}
                    fetchPriority={first ? "high" : undefined}
                    decoding="async"
                    className={`guide-hero guide-hero-s guide-hero-s--${style}-${tone} h-auto w-full rounded-sheen-lg border border-sheen-border`}
                  />
                );
                // The `<picture>` wrapper stops React hoisting an unconditional preload for the eager picture: the media-gated one in
                // the head (prerender `guideStaticHeroPreload`) is the only one, so a saved dark or Aurora look fetches just its own cover.
                return first ? (
                  <picture key={`${style}-${tone}`} className="contents">
                    {img}
                  </picture>
                ) : (
                  img
                );
              }),
            )}
          </>
        )}
        {image && !styled && (
          <>
            <img
              src={`${BASE_PATH}img/${image.file}`}
              width={image.width}
              height={image.height}
              srcSet={guideImageSrcSet(image, BASE_PATH)}
              sizes={GUIDE_IMAGE_SIZES}
              alt={image.alt}
              // The hero screenshot is the largest thing above the fold on a phone: its LCP, so it loads first.
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className={cn(
                "guide-hero h-auto w-full rounded-sheen-lg border border-sheen-border",
                dark && "guide-hero--light",
              )}
            />
            {dark && (
              // Dark pages swap to the dark shot (index.css `.guide-hero--dark`); it stays display:none, so it is never fetched, on light pages.
              <img
                src={`${BASE_PATH}img/${dark.file}`}
                width={dark.width}
                height={dark.height}
                srcSet={guideImageSrcSet(dark, BASE_PATH)}
                sizes={GUIDE_IMAGE_SIZES}
                alt={dark.alt}
                loading="lazy"
                decoding="async"
                className="guide-hero guide-hero--dark h-auto w-full rounded-sheen-lg border border-sheen-border"
              />
            )}
          </>
        )}

        {sections.length >= 4 && (
          <nav aria-label="On this page" className="glass-1 rounded-sheen-lg p-5">
            <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-sheen-fg-muted uppercase">On this page</p>
            <ol className="flex flex-col gap-1.5 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-block py-0.5 font-medium text-sheen-accent underline-offset-4 hover:underline any-pointer-coarse:inline-flex any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11 any-pointer-coarse:items-center"
                  >
                    {inlineText(section.c)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {renderBlocks(body, namer)}

        {faq.length > 0 && <Faq items={faq} />}

        <RouteLinks title="Related components and pages" paths={related} />

        <section className="flex flex-col gap-3">
          <h2 id="more-guides" className="text-xl font-semibold tracking-tight">
            More guides
          </h2>
          <ul className="flex flex-col gap-2">
            {others.map((g) => (
              <li key={g.slug}>
                <a
                  href={href(guidePath(g.slug))}
                  className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
                >
                  {g.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href={href("/guides")}
                className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
              >
                All guides
              </a>
            </li>
          </ul>
        </section>
      </div>
    </Page>
  );
}

/**
 * One section of a guide (the blocks under the heading that starts with `from`, up to the next heading of the
 * same or a higher level), without its heading. Other docs pages reuse a guide's text this way.
 */
export function GuideExcerpt({ markdown, from }: { markdown: string; from: string }) {
  const guide = useMemo(() => parseGuide(markdown), [markdown]);
  const start = guide.blocks.findIndex((b) => b.t === "h" && inlineText(b.c).startsWith(from));
  const head = guide.blocks.at(start);
  if (head?.t !== "h") return null;
  let end = start + 1;
  while (end < guide.blocks.length) {
    const block = guide.blocks.at(end);
    if (block?.t === "h" && block.level <= head.level) break;
    end++;
  }
  // Seeding the namer with `from` keeps code-block and table names unique when one page reuses several sections.
  const namer = createNamer();
  namer.heading(from);
  return <div className="flex flex-col gap-5">{renderBlocks(guide.blocks.slice(start + 1, end), namer)}</div>;
}
