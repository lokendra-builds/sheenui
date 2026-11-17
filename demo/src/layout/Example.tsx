import { Fragment, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { useHeadingId } from "./heading-ids";
import { Button, Tabs, TabsList, TabsPanel, TabsTab, cn, useSheenReducedMotion } from "@sheenui/theme";

import { href } from "../router";
import { CodeBlock } from "./Page";
import { Deferred } from "./Deferred";
import { lazyBlock } from "./lazy-block";
import { extraPackages, importsPackage, useImportedCode, useImportMode } from "./import-mode";

type ExampleProps = {
  title?: string;
  description?: ReactNode;
  code: string;
  children: ReactNode;
  /**
   * "stage": framed preview with its own colorful backdrop (default).
   * "bare": no frame, padding or backdrop, for content that is already a card (charts).
   */
  variant?: "stage" | "bare";
  /** Show the preview inside an app window with this title in its title bar (e.g. "example.com/inbox"). */
  frame?: string;
  /** Demo controls (toggles, resets) shown above the preview, outside the frame. */
  controls?: ReactNode;
  /** Extra classes for the preview area (e.g. min height, alignment). */
  stageClassName?: string;
  /**
   * Signature motion that plays once, the first time at least 60% of the preview is on screen (not under reduced
   * motion, and not when `autoplayMode="manual"`), and again whenever "Replay" / "Play demo" is pressed. Return a
   * cleanup to stop it (called before each replay and on unmount).
   */
  autoplay?: () => (() => void) | undefined;
  /**
   * What `autoplay` may do (WCAG 3.2.1, 4.1.3).
   * "visual" (default): the demo only moves pixels (charts drawing, tickers, switches, carousels), so it may start by
   * itself when scrolled into view. It must never post to a live region (toast, status, alert) or move focus.
   * "manual": the demo opens a dialog, posts toasts or otherwise announces; it runs only when the person presses
   * "Play demo", and its live regions stay silent until then.
   */
  autoplayMode?: "visual" | "manual";
  /** Show "Replay" and remount the preview when it is pressed, so a self-drawing demo (a chart) runs its entrance again. */
  replayable?: boolean;
  /**
   * Skip style, layout and paint of this example while it is far off screen (`content-visibility: auto`; the browser
   * still finds its text, and it renders as soon as it nears the viewport). For examples with a lot of DOM (data
   * tables, big charts): the first render of a long page then lays out only what is near the viewport. A little
   * padding with a matching negative margin keeps focus rings and shadows from being clipped by the containment, so
   * the page looks the same. Do not use it for an example whose preview holds `position: fixed` content (the
   * containment would become its containing block). `intrinsicHeight` is the placeholder height in px until the
   * example has rendered once (the browser then remembers the real height). It is measured for a desktop width; on a phone
   * the preview stacks into a taller one, which only moves what is below it, never anything on screen. `Page` turns this
   * on by itself for every example after its second.
   */
  deferRender?: boolean;
  intrinsicHeight?: number;
  /**
   * Prerender an empty stage of about `intrinsicHeight` instead of the preview, and build the preview when the example
   * nears the viewport (1500 px ahead, so it is in place long before it is seen). For examples far below the first one
   * whose DOM is bulky (table rows, transcripts): the prerendered HTML stays small, the code is still in it (the plain
   * copy below) and the example is live where a visitor can see it.
   */
  lazyPreview?: boolean;
  /**
   * For an example whose component switches on the viewport width (`mobile="sheet"`): adds a "Preview on a phone"
   * button that opens this page, at this example, in a 390 px frame. The frame is a real narrow viewport, so the
   * sheet appears on a desktop screen. Nothing loads until the button is pressed.
   */
  phonePreview?: boolean;
};

/**
 * A live preview with a Code tab, built from SheenUI's own Tabs and GlassCard. Each example is its own hydration
 * boundary (see Deferred), so a page with several of them hydrates in short tasks.
 */
export function Example(props: ExampleProps) {
  return (
    <Deferred>
      <ExampleSection {...props} />
    </Deferred>
  );
}

/** Page.tsx finds the first Example among a page's children by this mark, so it need not import this module (the
 * Tabs, Button and Segmented behind it) into the route of a page that has no live example, such as a guide. */
Example.isSheenExample = true;

// The switch is only mounted in the Code tab: its chunk is requested as soon as an example renders (not at idle), so it is
// there by the time the tab opens. The reserved height is the switch's own (a small control).
const ImportModeSwitch = lazyBlock(() => import("./ImportModeSwitch").then((m) => m.ImportModeSwitch), {
  minHeight: "2rem",
  eager: true,
});

function ExampleSection({
  title,
  description,
  code,
  children,
  variant = "stage",
  frame,
  controls,
  stageClassName,
  autoplay,
  autoplayMode = "visual",
  replayable,
  deferRender = false,
  intrinsicHeight = 560,
  lazyPreview = false,
  phonePreview = false,
}: ExampleProps) {
  const headingId = useHeadingId(title);
  const label = title ?? "Example";
  // The preview sets the height: the Code panel fills that same height (the code scrolls inside it), so switching
  // Preview/Code never moves what is below, and a long sample never makes the block taller than its preview.
  const [previewHeight, setPreviewHeight] = useState(0);
  // A stable ref callback: a new function every render would tear down and recreate the ResizeObserver each time.
  const watch = useCallback((node: HTMLElement | null) => {
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setPreviewHeight(Math.ceil(node.getBoundingClientRect().height)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // The import-path row above the code takes room from the same height, so the code gets what is left of it.
  const [rowHeight, setRowHeight] = useState(0);
  const watchRow = useCallback((node: HTMLElement | null) => {
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setRowHeight(Math.ceil(node.getBoundingClientRect().height) + 8));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const [importMode, setImportMode] = useImportMode();
  const shownCode = useImportedCode(code, importMode);
  const hasImport = importsPackage(code);
  const extras = extraPackages(code);
  const { replay, playKey, watchPlay, busy } = useReplay(autoplay, replayable, autoplayMode);
  const [near, setNear] = useState(!lazyPreview);
  const watchNear = useCallback(
    (node: HTMLElement | null) => {
      if (!node || near) return;
      if (typeof IntersectionObserver === "undefined") {
        setNear(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) setNear(true);
        },
        { rootMargin: "1500px 0px" },
      );
      io.observe(node);
      return () => io.disconnect();
    },
    [near],
  );
  const body = near ? (
    <Fragment key={playKey}>{children}</Fragment>
  ) : (
    <div aria-hidden style={{ minHeight: Math.max(160, intrinsicHeight - 170) }} />
  );
  // Controlled so a find-in-page hit inside the hidden plain copy (below) can open the Code tab.
  const [tab, setTab] = useState("preview");
  // The plain copy is `hidden="until-found"` (the prerender writes it for `data-until-found`; client-side renders set it
  // here), so find-in-page and search engines can match the code. A match fires `beforematch` and the browser reveals
  // the copy: show the real Code tab instead and hide the copy again, so the code never appears twice.
  const watchCopy = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    node.setAttribute("hidden", "until-found");
    const onMatch = () => {
      setTab("code");
      requestAnimationFrame(() => node.setAttribute("hidden", "until-found"));
    };
    node.addEventListener("beforematch", onMatch);
    return () => node.removeEventListener("beforematch", onMatch);
  }, []);
  return (
    <section
      ref={watchNear}
      aria-labelledby={title ? headingId : undefined}
      className={cn("flex flex-col gap-3", deferRender && "-mx-3 -my-3 [content-visibility:auto] px-3 py-3")}
      style={deferRender ? { containIntrinsicSize: `auto ${intrinsicHeight + 24}px` } : undefined}
    >
      {(Boolean(title) || Boolean(description)) && (
        <div className="flex flex-col gap-1">
          {title && (
            <h2 id={headingId} className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
          )}
          {description && <p className="max-w-3xl text-sm text-pretty text-sheen-fg-muted">{description}</p>}
        </div>
      )}
      <Tabs value={tab} onValueChange={(next) => setTab(String(next))}>
        <TabsList aria-label={`${label}: preview or code`}>
          <TabsTab value="preview">Preview</TabsTab>
          <TabsTab value="code">Code</TabsTab>
        </TabsList>
        <TabsPanel value="preview" ref={watch} aria-busy={busy || undefined} className="flex min-h-48 flex-col gap-3">
          {(Boolean(controls) || replay !== undefined || phonePreview) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {controls}
              {phonePreview && <PhonePreviewToggle headingId={headingId} />}
              {replay && (
                <Button variant="glass" size="sm" onClick={replay} className="ms-auto">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
                  </svg>
                  {autoplay !== undefined && autoplayMode === "manual" ? "Play demo" : "Replay"}
                  <span className="sr-only">: {label}</span>
                </Button>
              )}
            </div>
          )}
          <div ref={watchPlay} className="contents">
            {frame ? (
              <AppFrame title={frame} className={stageClassName}>
                {body}
              </AppFrame>
            ) : variant === "bare" ? (
              <div className={cn("relative", stageClassName)}>{body}</div>
            ) : (
              <Stage className={stageClassName}>{body}</Stage>
            )}
          </div>
        </TabsPanel>
        <TabsPanel value="code" style={previewHeight > 0 ? { height: previewHeight } : undefined}>
          {hasImport && (
            <div
              ref={watchRow}
              className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-sheen-fg-muted"
            >
              <ImportModeSwitch value={importMode} onValueChange={setImportMode} />
              <span>
                {importMode === "files"
                  ? "Paths the shadcn CLI installs (your @/ alias). "
                  : "From the @sheenui/theme package (after the first npm release, or a packed tarball). "}
                <a
                  className="underline underline-offset-2 hover:text-sheen-fg"
                  href={href("/docs/installation") + "#import-paths"}
                >
                  Which one?
                </a>
              </span>
              {extras.length > 0 && (
                <span>
                  Also needs <code className="font-sheen-mono">{extras.join(", ")}</code>
                  {": "}
                  <code className="font-sheen-mono">npm install {extras.join(" ")}</code>
                </span>
              )}
            </div>
          )}
          <CodeBlock
            code={shownCode}
            label={`${label} code`}
            maxHeight={previewHeight > 0 ? Math.max(120, previewHeight - (hasImport ? rowHeight : 0)) : undefined}
          />
        </TabsPanel>
      </Tabs>
      {/* The Code tab is only mounted when opened; this plain copy keeps the import line and example in the static HTML
          (crawlers, llms-full.txt, AI fetches) without rendering or hydrating a second code block. */}
      <div hidden data-example-code data-until-found="" ref={watchCopy}>
        <pre>
          {/* The prerender swaps in the copied-files imports (scripts/lib/install-imports.mjs); the text node stays as served. */}
          <code suppressHydrationWarning>{code.trim()}</code>
        </pre>
      </div>
    </section>
  );
}

/**
 * "Preview on a phone": a 390 px iframe of this same page, scrolled to the example. A phone-width viewport is what makes
 * `mobile="sheet"` open as a sheet, and an iframe is the only way to give one to part of a desktop page. Mounted on
 * demand (the page inside is a normal docs page), and not offered inside such a frame.
 */
function PhonePreviewToggle({ headingId }: { headingId: string }) {
  const [open, setOpen] = useState(false);
  // Server snapshot true: hidden until the client knows it is the top window.
  const embedded = useSyncExternalStore(
    () => () => undefined,
    () => window.self !== window.top,
    () => true,
  );
  const panelId = useId();
  if (embedded) return null;
  return (
    <>
      <Button
        variant="glass"
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close phone preview" : "Preview on a phone"}
      </Button>
      <div id={panelId} className="basis-full">
        {open && (
          <div className="mx-auto w-full max-w-[26rem] rounded-[2.25rem] border border-sheen-border bg-sheen-hover p-2">
            <iframe
              title="Phone-width preview of this example: open the trigger to see the bottom sheet"
              src={`${window.location.pathname}#${headingId}`}
              className="block h-[40rem] w-full rounded-[1.75rem] border-0 bg-sheen-bg"
              style={{ maxWidth: 390 }}
            />
          </div>
        )}
      </div>
    </>
  );
}

const PLAY_WINDOW_MS = 3600;

/**
 * Autoplay-once (visual demos only) + replay for an Example. `watchPlay` goes on an element that wraps the preview
 * (display: contents has no box, so it observes the first child element instead). `replay` is undefined when the
 * example has neither `autoplay` nor `replayable`. A "manual" example never starts by itself.
 */
function useReplay(
  autoplay: ExampleProps["autoplay"],
  replayable: boolean | undefined,
  mode: NonNullable<ExampleProps["autoplayMode"]>,
) {
  const reduced = useSheenReducedMotion();
  const [playKey, setPlayKey] = useState(0);
  const stop = useRef<(() => void) | undefined>(undefined);
  const latest = useRef(autoplay);
  const done = useRef(false);
  const [busy, setBusy] = useState(false);
  const busyTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    latest.current = autoplay;
  });
  const run = useCallback(() => {
    stop.current?.();
    stop.current = latest.current?.();
    // aria-busy while the demo plays, so a screen reader does not announce each state change mid-play
    // (the longest autoplay runs about 3 s).
    setBusy(true);
    window.clearTimeout(busyTimer.current);
    busyTimer.current = window.setTimeout(() => setBusy(false), PLAY_WINDOW_MS);
  }, []);
  useEffect(
    () => () => {
      stop.current?.();
      window.clearTimeout(busyTimer.current);
    },
    [],
  );
  const watchPlay = useCallback(
    (node: HTMLElement | null) => {
      const target = node?.firstElementChild;
      if (
        !target ||
        !latest.current ||
        mode === "manual" ||
        reduced ||
        done.current ||
        typeof IntersectionObserver === "undefined"
      )
        return;
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          // Never take over a demo the person is already using: with focus or the pointer inside, wait.
          if (target.matches(":hover") || target.contains(document.activeElement)) return;
          io.disconnect();
          done.current = true; // at most once per page view; only "Replay" plays it again
          run();
        },
        { threshold: 0.6 },
      );
      io.observe(target);
      return () => io.disconnect();
    },
    [reduced, run, mode],
  );
  const replay =
    autoplay !== undefined || replayable === true
      ? () => {
          if (replayable) setPlayKey((k) => k + 1);
          run();
        }
      : undefined;
  return { replay, playKey, watchPlay, busy };
}

/**
 * Vivid color behind a preview, so glass always reads as glass: soft light plus crisp shapes
 * (a glossy sphere and a silk band in Liquid Glass; an aurora disc and neon rings in Aurora Neon).
 * Painted by the active style preset (styles/backdrop.css, .sheen-stage-backdrop).
 */
function Backdrop() {
  // Four compositions, picked per stage from its useId (stable across server and client), so
  // neighboring previews never carry the same stamp.
  const id = useId();
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return (
    <div aria-hidden className="sheen-stage-backdrop" data-v={sum % 4}>
      <i data-s="1" />
      <i data-s="2" />
      <i data-s="3" />
    </div>
  );
}

/** Preview area with its own colorful backdrop so glass is always visible. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate flex min-h-56 flex-wrap items-center justify-center gap-4 overflow-hidden rounded-sheen-xl border border-sheen-border p-5 sm:p-10",
        className,
      )}
    >
      <Backdrop />
      {children}
    </div>
  );
}

/**
 * A browser-like window around a preview, for components that live inside an app
 * (sidebars, forms) and look lost on an empty stage.
 */
export function AppFrame({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className="relative isolate overflow-hidden rounded-sheen-xl border border-sheen-border">
      <Backdrop />
      <div aria-hidden className="flex h-10 items-center gap-3 border-b border-sheen-border bg-sheen-hover px-4">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-sheen-danger" />
          <span className="size-2.5 rounded-full bg-sheen-warning" />
          <span className="size-2.5 rounded-full bg-sheen-success" />
        </span>
        <span className="mx-auto max-w-[60%] truncate rounded-sheen-full bg-sheen-hover px-3 py-0.5 font-sheen-mono text-2xs text-sheen-fg">
          {title}
        </span>
        <span className="w-[2.625rem]" />
      </div>
      <div className={cn("flex min-h-56 p-3 sm:p-4", className)}>{children}</div>
    </div>
  );
}
