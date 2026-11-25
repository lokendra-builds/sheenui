import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { ChartWidthHint, useElementInView } from "@sheenui/theme";
import { useHeadingId } from "../../layout/heading-ids";
import { Deferred } from "../../layout/Deferred";
import { href } from "../../router";
import { COUNTS } from "../../seo/counts";
import { CATEGORIES, GALLERY, type GalleryCategory, type GalleryEntry } from "./gallery-data";

const STAGE_W = 520;

/** The gallery in groups of two tiles, one hydration boundary each (four tiles took 55-77 ms of one task on a phone at 4x CPU). */
const TILE_GROUP_SIZE = 2;
const TILE_GROUPS = Array.from({ length: Math.ceil(GALLERY.length / TILE_GROUP_SIZE) }, (_, g) =>
  GALLERY.slice(g * TILE_GROUP_SIZE, (g + 1) * TILE_GROUP_SIZE),
);

const STAGE_H = 260;

/* ---------- One mount per frame ---------- */

const mountQueue: (() => void)[] = [];

let pumping = false;

/** When the page last scrolled, and when the last chart mounted (a fling mounts a few, not one per frame). */
let lastScroll = 0;

let lastMount = 0;

if (typeof window !== "undefined") {
  window.addEventListener(
    "scroll",
    () => {
      lastScroll = performance.now();
    },
    { passive: true },
  );
}

function pump() {
  const next = mountQueue[0];
  if (!next) {
    pumping = false;
    return;
  }
  const now = performance.now();
  // While the page is scrolling, one mount per ~160 ms: a chart's first render is a long task on a slow phone, and one per frame would
  // take every frame of the scroll. At rest (and on the first screenful) the queue still drains one per frame.
  if (now - lastScroll < 120 && now - lastMount < 160) {
    setTimeout(pump, 40);
    return;
  }
  mountQueue.shift();
  lastMount = now;
  next();
  // Let React render that chart and the browser paint before the next one starts.
  requestAnimationFrame(() => setTimeout(pump, 0));
}

function scheduleMount(task: () => void) {
  mountQueue.push(task);
  if (!pumping) {
    pumping = true;
    requestAnimationFrame(() => setTimeout(pump, 0));
  }
}

const loaded = new Map<string, ComponentType>();

function GalleryTile({
  entry,
  order,
  hidden,
  untilFound,
  onCore,
  onReveal,
}: {
  entry: GalleryEntry;
  order: number;
  hidden: boolean;
  /** Hidden only by "Show all": `hidden="until-found"`, so find-in-page and search engines can match the tile. */
  untilFound: boolean;
  onCore: (slug: string) => void;
  onReveal: () => void;
}) {
  const [tile, setTile] = useState<HTMLLIElement | null>(null);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  // A held-back tile (hidden="until-found", out of flow at the grid's top-left corner) is never observed: it would count as
  // "near" at once and fetch every hidden chart's chunk on load. It is observed from the moment "Show all" reveals it.
  const observed = hidden ? null : tile;
  const near = useElementInView(observed, { once: true, margin: "320px" });
  const seen = useElementInView(observed, { once: true, amount: 0.12 });
  const [Preview, setPreview] = useState<ComponentType | null>(() => loaded.get(entry.slug) ?? null);
  const [scale, setScale] = useState(0);
  const titleId = useHeadingId(`gallery ${entry.title}`);

  // React cannot write `hidden="until-found"` (the prerender does it for `data-until-found`); the live DOM gets it here. A
  // find-in-page match fires `beforematch` and the browser unhides the tile: show all tiles so React's state agrees.
  useEffect(() => {
    if (!tile || !untilFound) return;
    tile.setAttribute("hidden", "until-found");
    tile.addEventListener("beforematch", onReveal);
    return () => tile.removeEventListener("beforematch", onReveal);
  }, [tile, untilFound, onReveal]);

  // Fetch the chart's chunk when the tile nears the viewport, then queue its mount.
  useEffect(() => {
    if (!near || Preview) return;
    let cancelled = false;
    entry
      .load()
      .then((component) => {
        loaded.set(entry.slug, component);
        if (!cancelled) scheduleMount(() => !cancelled && startTransition(() => setPreview(() => component)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [near, Preview, entry]);

  // Scale the fixed stage to the tile's width (measured on resize only).
  useEffect(() => {
    if (!stage) return;
    const update = () => {
      const w = stage.clientWidth;
      if (w > 0) setScale(w / STAGE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [stage]);

  // One preview element per loaded component: re-renders of the tile (a filter change moves
  // `order` / `hidden` on every tile) hand React the same element, so it skips the chart
  // subtree instead of re-rendering 52 charts in one go.
  const preview = useMemo(
    () =>
      Preview ? (
        // The stage's inner width is known: charts draw on their first render, no measure-and-redo.
        <ChartWidthHint value={STAGE_W - 32}>
          <Preview />
        </ChartWidthHint>
      ) : null,
    [Preview],
  );

  const core = entry.path === "";
  return (
    <li
      ref={setTile}
      hidden={hidden}
      data-until-found={untilFound ? "" : undefined}
      data-seen={seen || undefined}
      className="gallery-tile group/tile relative min-w-0 [contain-intrinsic-size:auto_290px] [content-visibility:auto]"
      // The stagger as a plain (non-inherited) property: a custom property here would be
      // inherited by every node of the chart inside, so a new filter (new order) would re-style
      // 52 whole SVGs. animation-delay changes only this element.
      style={{ animationDelay: `${(order % 6) * 55}ms` }}
    >
      <div
        className={
          "relative flex h-full flex-col overflow-hidden rounded-sheen-lg border border-(--sheen-glass-border) bg-(--sheen-glass-2-bg) " +
          "shadow-[var(--sheen-glass-rim),var(--sheen-glass-1-shadow)] [background-image:var(--sheen-glass-specular)] " +
          "transition-[translate,box-shadow,border-color] duration-(--sheen-duration-base) ease-(--sheen-ease-out) " +
          "hover:border-sheen-accent-border motion-ok:hover:-translate-y-0.5 hover:shadow-[var(--sheen-glass-rim),var(--sheen-glass-2-shadow)] " +
          "has-[a:focus-visible]:outline-solid has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-sheen-focus " +
          "forced-colors:border-[CanvasText]"
        }
      >
        {/* The live preview: decorative (inert), a fixed stage scaled to the tile. */}
        <div
          ref={setStage}
          aria-hidden
          inert
          className="relative aspect-[2/1] overflow-hidden border-b border-sheen-border bg-sheen-surface/35"
        >
          {scale > 0 && (
            <div
              className="pointer-events-none absolute top-0 start-0 origin-top-left p-4"
              style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
            >
              {preview ?? (
                <div className="flex size-full items-end gap-3 px-6 pb-6">
                  {[0.45, 0.7, 0.55, 0.9, 0.65, 0.8].map((h, k) => (
                    <span key={k} className="flex-1 rounded-t-md bg-sheen-hover" style={{ height: `${h * 100}%` }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 px-4 pt-3 pb-4">
          <div className="flex items-center justify-between gap-2">
            {/* The link is the title alone (visible text = accessible name, WCAG 2.5.3); its ::after stretches over the whole card. */}
            <h3 id={titleId} className="truncate font-semibold">
              <a
                href={core ? `${href("/charts")}#chart-${entry.slug}` : href(entry.path)}
                aria-describedby={`${titleId}-blurb ${titleId}-cats`}
                onClick={
                  core
                    ? (event) => {
                        event.preventDefault();
                        onCore(entry.slug);
                      }
                    : undefined
                }
                className="outline-none after:absolute after:inset-0 after:content-['']"
              >
                {entry.title}
              </a>
            </h3>
            <span
              aria-hidden
              className="text-sheen-fg-subtle transition-[translate,color] duration-(--sheen-duration-base) group-hover/tile:text-sheen-accent motion-ok:group-hover/tile:translate-x-0.5 rtl:-scale-x-100 rtl:motion-ok:group-hover/tile:-translate-x-0.5"
            >
              →
            </span>
          </div>
          <p id={`${titleId}-blurb`} className="text-sm text-sheen-fg-muted">
            {entry.blurb}
          </p>
          <p id={`${titleId}-cats`} className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {entry.categories.map((c) => (
              <span
                key={c}
                className="rounded-sheen-full bg-sheen-hover px-2 py-0.5 text-2xs font-medium text-sheen-fg-muted"
              >
                {c}
              </span>
            ))}
          </p>
        </div>
      </div>
    </li>
  );
}

/** How many tiles "All" shows before Show all. */
const FIRST_PAGE = 12;

export function Gallery({ onCore }: { onCore: (slug: string) => void }) {
  const [filter, setFilter] = useState<GalleryCategory | "All">("All");
  const [passState, setPass] = useState<"a" | "b">("a");
  // The chips answer at once; the grid of 52 tiles follows in a deferred render that React
  // time-slices, so a filter tap is never one long task.
  const shownFilter = useDeferredValue(filter);
  const pass = useDeferredValue(passState);
  const counts = useMemo(
    () => new Map(CATEGORIES.map((c) => [c, GALLERY.filter((e) => e.categories.includes(c)).length])),
    [],
  );
  // "All" opens on a first dozen (the page stays a few screens long) with a Show-all control; a category shows all of its charts.
  // The rest stay in the document, hidden, so every chart page keeps its link in the prerendered HTML.
  const [expanded, setExpanded] = useState(false);
  const shownExpanded = useDeferredValue(expanded);
  const reveal = useCallback(() => {
    setExpanded(true);
    setPass((p) => (p === "a" ? "b" : "a"));
  }, []);
  const visible = useMemo(() => {
    if (shownFilter !== "All") return GALLERY.filter((e) => e.categories.includes(shownFilter));
    return shownExpanded ? GALLERY : GALLERY.slice(0, FIRST_PAGE);
  }, [shownFilter, shownExpanded]);
  const order = useMemo(() => new Map(visible.map((e, i) => [e.slug, i])), [visible]);

  const chip = (value: GalleryCategory | "All", count: number) => (
    <button
      key={value}
      type="button"
      aria-pressed={filter === value}
      onClick={() => {
        if (filter === value) return;
        setFilter(value);
        setPass((p) => (p === "a" ? "b" : "a"));
      }}
      className={
        "relative inline-flex h-8 items-center gap-1.5 rounded-sheen-full border px-3 text-sm font-medium transition-[background-color,color,border-color] duration-(--sheen-duration-fast) " +
        "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus " +
        "any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:-translate-y-1/2 " +
        (filter === value
          ? "sheen-fill border-transparent text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]"
          : "border-sheen-border bg-sheen-surface/50 text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg")
      }
    >
      {value}
      {/* The count keeps full opacity on the accent fill: at 0.8 it measured 4.3:1 over the Aurora gradient. */}
      <span className={filter === value ? "text-xs font-normal" : "text-xs text-sheen-fg-subtle"}>{count}</span>
    </button>
  );

  return (
    <section aria-labelledby="gallery-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 id="gallery-title" className="text-2xl font-semibold tracking-tight">
          Every chart, live
        </h2>
        <p className="max-w-3xl text-sm text-pretty text-sheen-fg-muted">
          {GALLERY.length} live previews of the {COUNTS.charts} chart components: some charts appear more than once, as
          variants. Each one is the real component with its own data, loaded as you scroll. Open one for its docs, props
          and keyboard map.
        </p>
      </div>
      <div role="group" aria-label="Show charts for" className="flex flex-wrap gap-2 any-pointer-coarse:gap-y-3.5">
        {chip("All", GALLERY.length)}
        {CATEGORIES.map((c) => chip(c, counts.get(c) ?? 0))}
      </div>
      <p aria-live="polite" className="sr-only">
        {shownFilter === "All"
          ? `Showing ${visible.length} of ${GALLERY.length} chart previews`
          : `Showing ${visible.length} ${shownFilter} chart previews`}
      </p>
      <ul
        data-pass={pass}
        className="gallery-grid grid grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-5"
      >
        {/* Filtered-out tiles are hidden, not unmounted: their charts stay drawn for when they return. */}
        {/* Two tiles per hydration boundary: React hydrates each boundary in a task of its own (see Deferred), so the 52
            tiles are twenty-six short tasks instead of one long one (Total Blocking Time on a slow phone). */}
        {TILE_GROUPS.map((group) => (
          <Deferred key={group[0]?.slug}>
            {group.map((entry) => {
              const i = order.get(entry.slug);
              return (
                <GalleryTile
                  key={entry.slug}
                  entry={entry}
                  order={i ?? 0}
                  hidden={i === undefined}
                  untilFound={i === undefined && shownFilter === "All"}
                  onCore={onCore}
                  onReveal={reveal}
                />
              );
            })}
          </Deferred>
        ))}
      </ul>
      {shownFilter === "All" && !shownExpanded && GALLERY.length > FIRST_PAGE ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setExpanded(true);
              setPass((p) => (p === "a" ? "b" : "a"));
            }}
            className="inline-flex h-11 items-center gap-2 rounded-sheen-full border border-sheen-border bg-sheen-surface/50 px-5 text-sm font-medium text-sheen-fg transition-colors hover:bg-sheen-hover focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
          >
            Show all previews
          </button>
        </div>
      ) : null}
    </section>
  );
}
