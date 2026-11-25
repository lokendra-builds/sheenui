import { useCallback, useEffect, useRef, useState, Fragment, type CSSProperties, type ReactNode } from "react";
import { Button, useSheenReducedMotion } from "@sheenui/theme";

import { Deferred } from "./Deferred";

/**
 * The state the stage's light shows: "idle" is the accent glow, "working" breathes, "success", "error" and "warning" are
 * status colours, "off" is an almost dark stage, "lit" a warm light, "dim" a stage dimmed behind an overlay.
 */
export type StageState = "idle" | "working" | "success" | "error" | "warning" | "off" | "lit" | "dim";

/** What the stage hands to its children besides the scene. */
export type StageContext = {
  /** The stage's root element once mounted (null on the server and the first render): a container for portals such as a Toaster. */
  host: HTMLElement | null;
  /** Colour the light from the component itself (for example when the person flips the Switch). */
  setState: (next: StageState) => void;
};

/** What a story receives. It never touches the DOM: it sets the state, patches the scene and waits. */
export type StageController<S extends object> = {
  /** Colour the aura, pool of light and lit edge ("success" also plays the light sweep). */
  state: (next: StageState) => void;
  /** Patch the scene: the props the stage's children render from (for example `{ loading: true }`). */
  scene: (patch: Partial<S>) => void;
  /** Resolves after `ms` of the tab being visible. Rejects with an AbortError when the story is aborted. Instant under reduced motion. */
  wait: (ms: number) => Promise<void>;
  /** Aborted when the person touches the component, presses Replay again or leaves the page. */
  signal: AbortSignal;
  /** True under reduced motion: no movement, so `wait` is instant and the story ends on its final state. */
  reduced: boolean;
};

/** A story: runs once in view and on Replay. Return (or throw an AbortError) to stop. */
export type Story<S extends object> = (ctl: StageController<S>) => Promise<void>;

type ShowcaseStageProps<S extends object> = {
  /** Accessible name of the group, for example "Button demo". */
  label: string;
  /** Dynamic import of the story module (`default` export): its code loads after hydration, never in the page's initial JS. */
  story: () => Promise<{ default: Story<S> }>;
  /** The scene the server renders (the idle frame) and the one Replay and an interrupted story go back to. */
  initial: S;
  /** The live component. A function receives the current scene and the stage context. */
  children: ReactNode | ((scene: S, ctx: StageContext) => ReactNode);
  /** The light the server renders and Replay goes back to (default "idle"). */
  initialState?: StageState;
  /** Height reserved for the stage, a CSS length (default 17rem): size it for the tallest frame of the story so nothing shifts. */
  minHeight?: string;
  /**
   * What a touch on the component does to a running story: "reset" (default) puts the scene and light back to the idle
   * frame; "keep" stops the story and leaves everything as it is (the person's own state wins).
   */
  onInterrupt?: "reset" | "keep";
  /** Where the Replay button sits ("bottom" by default). Use "top" when the component raises things at the bottom, such as toasts. */
  replayAt?: "top" | "bottom";
  className?: string;
};

/** A stage reserved taller than the 24rem floor is one whose story grows: its content hangs from the top so growth pushes nothing up. */
const growsPast24rem = (minHeight?: string) => {
  const rem = /^(\d+(?:\.\d+)?)rem$/.exec(minHeight ?? "");
  return rem ? Number(rem[1]) > 24 : false;
};

const aborted = (signal: AbortSignal) => signal.aborted;

/** Direct children of the stage that stay live while a story plays (Replay). */
const KEEP = ".sheen-showcase-replay";
/** Markers of a stage popup that is portalled out of the stage. */
/** The toast stage's own toast stack: a picture of toasts, never announced (it stays inert and hidden after the story too). */
const SILENT = '[aria-label="Stage notifications"]';
const POPUP = "[data-stage-menu],[data-stage-popup]";

/**
 * Whether a story may advance: the tab is visible (and not frozen or in the back/forward cache) and the stage is on
 * screen. A closed gate pauses every `wait` and the stage's CSS animations; reopening resumes them.
 */
class Gate extends EventTarget {
  open = true;
  private tab = true;
  private view = true;
  set(part: "tab" | "view", value: boolean) {
    this[part] = value;
    const next = this.tab && this.view;
    if (next === this.open) return;
    this.open = next;
    this.dispatchEvent(new Event("change"));
  }
}

/** Wait that pauses while the gate is closed (tab hidden, stage off screen) and rejects on abort. */
function sleep(ms: number, signal: AbortSignal, gate: Gate): Promise<void> {
  return new Promise((resolve, reject) => {
    let left = ms;
    let startedAt = 0;
    let timer: number | undefined;
    const cleanup = () => {
      window.clearTimeout(timer);
      gate.removeEventListener("change", onGate);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException("aborted", "AbortError"));
    };
    const run = () => {
      // Never two pending timers: a second "visible" event (pageshow after visibilitychange) must not double the wait.
      window.clearTimeout(timer);
      startedAt = performance.now();
      timer = window.setTimeout(() => {
        cleanup();
        resolve();
      }, left);
    };
    const pause = () => {
      if (timer === undefined) return;
      window.clearTimeout(timer);
      timer = undefined;
      left = Math.max(0, left - (performance.now() - startedAt));
    };
    function onGate() {
      if (gate.open) run();
      else pause();
    }
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort);
    gate.addEventListener("change", onGate);
    if (gate.open) run();
  });
}

/**
 * The showcase stage at the top of a component page: a studio (a dim scene of the page's look, a floor, a pool of light) with
 * one live component on a glass plate, a soft aura behind it whose colour follows the story's state and a light sweep across
 * the glass on success.
 *
 * The idle frame (stage, aura, component, Replay) is in the prerendered HTML and the stage's height is reserved in CSS,
 * so nothing shifts. The story is a separate chunk: it is imported once a fifth of the stage is seen (after hydration), plays
 * once, and again from Replay. It pauses when the tab is hidden or the stage scrolls away, stops when the person presses the
 * component (the stage keeps what they did), and under reduced motion it runs with no waiting and ends on its final state.
 * While it plays, the component copy and its popups are `inert` and `aria-hidden`, so nothing is focusable or announced.
 * The aura and light are decorative (aria-hidden).
 */
export function ShowcaseStage<S extends object>(props: ShowcaseStageProps<S>) {
  return (
    <Deferred>
      <Stage {...props} />
    </Deferred>
  );
}

/** Page.tsx finds a page's stage among its children by this mark, so it need not import this module. */
ShowcaseStage.isShowcaseStage = true;

function Stage<S extends object>({
  label,
  story,
  initial,
  children,
  className,
  initialState = "idle",
  minHeight,
  onInterrupt = "reset",
  replayAt = "bottom",
}: ShowcaseStageProps<S>) {
  const reduced = useSheenReducedMotion();
  const reducedRef = useRef(reduced);
  const [state, setState] = useState<StageState>(initialState);
  const [scene, setScene] = useState<S>(initial);
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [round, setRound] = useState(0);
  const root = useRef<HTMLDivElement | null>(null);
  const setRoot = useCallback((node: HTMLDivElement | null) => {
    root.current = node;
    setHost(node);
  }, []);
  const run = useRef<AbortController | null>(null);
  const [gate] = useState(() => new Gate());
  const seen = useRef(false);
  const touched = useRef(false);
  const playedReduced = useRef(false);
  const latest = useRef({ story, initial, initialState });
  useEffect(() => {
    reducedRef.current = reduced;
    latest.current = { story, initial, initialState };
  });

  const stop = useCallback(() => {
    run.current?.abort();
    run.current = null;
  }, []);

  const play = useCallback(async () => {
    stop();
    const ac = new AbortController();
    run.current = ac;
    const { signal } = ac;
    setState(latest.current.initialState);
    setScene(latest.current.initial);
    setPhase("playing");
    const ctl: StageController<S> = {
      state: (next) => {
        if (!aborted(signal)) setState(next);
      },
      scene: (patch) => {
        if (!aborted(signal)) setScene((current) => ({ ...current, ...patch }));
      },
      wait: (ms) => (reducedRef.current ? Promise.resolve() : sleep(ms, signal, gate)),
      signal,
      reduced: reducedRef.current,
    };
    try {
      const mod = await latest.current.story();
      if (signal.aborted) return;
      await mod.default(ctl);
    } catch (error) {
      if (!signal.aborted) console.error("ShowcaseStage story failed", error);
    }
    if (run.current === ac) {
      run.current = null;
      setPhase("done");
    }
  }, [stop, gate]);

  // The tab: a hidden, frozen or cached page (visibilitychange, pagehide/pageshow, freeze/resume) pauses the story's clock.
  useEffect(() => {
    const g = gate;
    const sync = () => g.set("tab", !document.hidden);
    const off = () => g.set("tab", false);
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    window.addEventListener("pagehide", off);
    document.addEventListener("freeze", off);
    document.addEventListener("resume", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("pagehide", off);
      document.removeEventListener("freeze", off);
      document.removeEventListener("resume", sync);
    };
  }, [gate]);

  // In view: the first time a fifth of the stage is visible the story plays once, never loops (Replay plays again). When
  // the stage scrolls away the story pauses (its clock and the stage's CSS animations) and resumes when it is back.
  useEffect(() => {
    const node = root.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        gate.set("view", entry.isIntersecting);
        if (entry.isIntersecting) node.removeAttribute("data-offscreen");
        else node.setAttribute("data-offscreen", "");
        if (seen.current || touched.current || !entry.isIntersecting || entry.intersectionRatio < 0.2) return;
        const plate = node.querySelector("[data-stage-plate]");
        // Never take over a component the person is already using.
        if (plate?.matches(":hover") || plate?.contains(document.activeElement)) return;
        seen.current = true;
        void play();
      },
      { threshold: [0, 0.2] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [play, gate]);

  // While a story plays, the stage's demo is a picture: its component copy and every popup it opens are `inert` (no tab
  // stops, no focus taken, no clicks) and `aria-hidden` (nothing announced: no toast or status region, no dialog without a
  // trap). Real dialogs and overlays elsewhere on the page keep their normal focus behaviour, because nothing here touches
  // `focus()` and only the stage's own markers (`data-stage-menu`, `data-stage-popup`, `data-stage-layer`) are silenced.
  // The first press on the stage ends the story (see `interrupt`) and hands the component over.
  useEffect(() => {
    const node = root.current;
    if (!node || phase !== "playing") return;
    const marked = new Set<Element>();
    const mark = (el: Element) => {
      if (marked.has(el) || el.hasAttribute("inert")) return;
      marked.add(el);
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    };
    const sweep = () => {
      for (const el of node.children) if (!el.hasAttribute("data-stage-decor") && !el.matches(KEEP)) mark(el);
      // Popups that Base UI portals to the page: only those carrying a stage marker.
      for (const el of document.body.children) if (!el.contains(node) && el.querySelector(POPUP)) mark(el);
    };
    sweep();
    const observer = new MutationObserver(sweep);
    observer.observe(node, { childList: true });
    observer.observe(document.body, { childList: true });
    return () => {
      observer.disconnect();
      for (const el of marked) {
        if (el.querySelector(SILENT)) continue;
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    };
  }, [phase]);

  // Reduced motion: no waiting for the stage to scroll into view, the story jumps straight to its final state.
  useEffect(() => {
    if (!reduced || touched.current || playedReduced.current) return;
    playedReduced.current = true;
    seen.current = true;
    void play();
    return () => {
      // StrictMode runs the effect twice and the cleanup of the first run aborts its story: arm it again.
      playedReduced.current = false;
      seen.current = false;
    };
  }, [reduced, play]);

  useEffect(() => stop, [stop]);

  // Any input on the component ends the story: the aura settles to idle, the scene goes back to the resting props
  // (nothing is left loading) and what the person did stays.
  const interrupt = useCallback(() => {
    touched.current = true;
    seen.current = true;
    if (!run.current) return;
    stop();
    if (onInterrupt === "reset") {
      setState(latest.current.initialState);
      setScene(latest.current.initial);
    }
    setPhase("done");
  }, [stop, onInterrupt]);

  // Input anywhere on the stage (the component, a toast, a dialog portalled out of it) ends the story, except Replay itself.
  const interruptFrom = (event: { target: EventTarget }) => {
    if (event.target instanceof Element && event.target.closest(".sheen-showcase-replay")) return;
    interrupt();
  };

  const ctx: StageContext = { host, setState };

  return (
    <div
      ref={setRoot}
      role="group"
      aria-label={label}
      data-llms="skip"
      className={["sheen-showcase", className].filter(Boolean).join(" ")}
      data-theme="dark"
      data-state={state}
      data-story={phase}
      data-replay={replayAt}
      data-grows={growsPast24rem(minHeight) || undefined}
      style={minHeight ? ({ "--stage-min": minHeight } as CSSProperties) : undefined}
      onPointerDownCapture={interruptFrom}
      onKeyDownCapture={interruptFrom}
    >
      <span aria-hidden data-stage-decor="" className="sheen-showcase-scene" />
      <span aria-hidden data-stage-decor="" className="sheen-showcase-aura" />
      <span aria-hidden data-stage-decor="" className="sheen-showcase-floor" />
      <span aria-hidden data-stage-decor="" className="sheen-showcase-pool" />
      <span aria-hidden data-stage-decor="" className="sheen-showcase-dim" />
      <div data-stage-plate="" className="sheen-showcase-plate glass-2">
        <span aria-hidden className="sheen-showcase-fx">
          <i className="sheen-showcase-edge" />
          <i className="sheen-showcase-sweep" />
        </span>
        <Fragment key={round}>{typeof children === "function" ? children(scene, ctx) : children}</Fragment>
      </div>
      <Button
        variant="glass"
        size="sm"
        className="sheen-showcase-replay"
        aria-label={`Replay ${label}`}
        onClick={() => {
          touched.current = false;
          seen.current = true;
          setRound((n) => n + 1);
          void play();
        }}
      >
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
        Replay
      </Button>
    </div>
  );
}
