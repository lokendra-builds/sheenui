import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";

import type { StageContext, StageController, StageState, Story } from "../../layout/ShowcaseStage";

/** One loop of a card takes about this long (the story, then a rest on its last frame). */
const CYCLE_MS = 6000;
/** How long a card's component shows its first frame before the story jumps to the last one. */
const FIRST_FRAME_MS = 80;
/** The least rest on the last frame between two runs. */
const MIN_REST_MS = 800;

/** What a card needs to play one story: the story, its resting scene and the live component that renders the scene. */
export type ViewConfig<S extends object> = {
  story: Story<S>;
  initial: S;
  initialState?: StageState;
  Scene: ComponentType<{ scene: S; ctx: StageContext }>;
  /** A block that brings its own surface: drawn without the glass plate, scaled down from this natural width (px). */
  fit?: number;
};

/** What the page hands to a card's view. */
export type ViewProps = { active: boolean; minHeight: string };

/** Resolves after `ms`, or rejects with an AbortError when the signal aborts. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    const done = () => {
      window.clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", done);
      resolve();
    }, ms);
    signal.addEventListener("abort", done, { once: true });
  });
}

/**
 * The lit dark stage of a card: the same classes as the stage on a component page (aura, floor, pool of light, glass plate),
 * without the Replay button. With no children it is the empty shell the server renders and the card shows while its code loads;
 * the height is reserved by `minHeight` either way, so nothing shifts when the story arrives.
 */
export function StageFrame({
  minHeight,
  state = "idle",
  playing = false,
  hostRef,
  plate = false,
  fit,
  children,
}: {
  minHeight: string;
  state?: StageState;
  playing?: boolean;
  hostRef?: (node: HTMLDivElement | null) => void;
  plate?: boolean;
  fit?: number;
  children?: ReactNode;
}) {
  const frame = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = frame.current;
    if (!node || !fit) return;
    const measure = () => setScale(Math.min(1, node.clientWidth / fit));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [fit, children]);
  return (
    <div
      ref={(node) => {
        frame.current = node;
        hostRef?.(node);
      }}
      className="sheen-showcase stories-stage"
      data-theme="dark"
      data-state={state}
      data-story={playing ? "playing" : "done"}
      data-replay="bottom"
      style={{ "--stage-min": minHeight } as CSSProperties}
    >
      <span aria-hidden className="sheen-showcase-scene" />
      <span aria-hidden className="sheen-showcase-aura" />
      <span aria-hidden className="sheen-showcase-floor" />
      <span aria-hidden className="sheen-showcase-pool" />
      <span aria-hidden className="sheen-showcase-dim" />
      {plate && (
        <div data-stage-plate="" className="sheen-showcase-plate glass-2">
          <span aria-hidden className="sheen-showcase-fx">
            <i className="sheen-showcase-edge" />
            <i className="sheen-showcase-sweep" />
          </span>
          {children}
        </div>
      )}
      {fit && children && (
        <div className="stories-fit">
          <div style={{ width: fit, scale }}>{children}</div>
        </div>
      )}
    </div>
  );
}

/**
 * One card's live stage. While `active` it loops its story (about every six seconds); otherwise it jumps to the story's
 * last frame (the story runs with `reduced` set, so every wait is instant) and stays there, with no timer and no motion.
 */
export function StoryView<S extends object>({
  cfg,
  active,
  minHeight,
}: ViewProps & {
  cfg: ViewConfig<S>;
}) {
  const [scene, setScene] = useState<S>(cfg.initial);
  const [state, setState] = useState<StageState>(cfg.initialState ?? "idle");
  const [host, setHost] = useState<HTMLElement | null>(null);
  const painted = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;
    const control = (reduced: boolean): StageController<S> => ({
      state: (next) => {
        if (!signal.aborted) setState(next);
      },
      scene: (patch) => {
        if (!signal.aborted) setScene((current) => ({ ...current, ...patch }));
      },
      wait: (ms) => (reduced ? Promise.resolve() : sleep(ms, signal)),
      signal,
      reduced,
    });
    const reset = () => {
      setState(cfg.initialState ?? "idle");
      setScene(cfg.initial);
    };
    void (async () => {
      try {
        if (!active) {
          reset();
          // The first time, the component paints on its own and the last frame follows in a second task, so a
          // heavy scene never renders both in one long task.
          if (!painted.current) {
            painted.current = true;
            await sleep(FIRST_FRAME_MS, signal);
          }
          await cfg.story(control(true));
          return;
        }
        for (;;) {
          reset();
          const startedAt = performance.now();
          await cfg.story(control(false));
          await sleep(Math.max(MIN_REST_MS, CYCLE_MS - (performance.now() - startedAt)), signal);
        }
      } catch (error) {
        if (!signal.aborted) console.error("Stories card failed", error);
      }
    })();
    return () => ac.abort();
  }, [active, cfg]);

  const ctx: StageContext = { host, setState };
  const { Scene } = cfg;
  return (
    <StageFrame minHeight={minHeight} state={state} playing={active} hostRef={setHost} plate={!cfg.fit} fit={cfg.fit}>
      <Scene scene={scene} ctx={ctx} />
    </StageFrame>
  );
}

/** Turns a config into the component a card renders (the type of the scene stays inside the config). */
export function makeView<S extends object>(cfg: ViewConfig<S>): ComponentType<ViewProps> {
  return function CardView(props: ViewProps) {
    return <StoryView cfg={cfg} {...props} />;
  };
}
