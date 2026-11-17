import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
  Avatar,
  Button,
  GlassCard,
  NumberTicker,
  follow,
  useLoopPlayback,
  useMotionGate,
  useSheenStyle,
} from "@sheenui/theme";

import { href } from "../router";
import { COUNTS } from "../seo/counts";

/*
 * Home, under the hero: three scenes that prove the library is alive.
 *
 *   1. ComponentWall: a tilted (perspective) wall of 12 live components. Every tile performs its
 *      signature motion once the wall is in view (a line draws, bars grow, a ticker counts, a chat
 *      types, toasts stack, switches flip, a progress bar fills, a gauge swings, avatars fan, a
 *      slider moves, stars light, a skeleton shimmers). Pure CSS animations, transform/opacity only,
 *      all paused until the wall is on screen and again when it leaves (`data-live` is set by one
 *      IntersectionObserver; a hidden tab is paused by html[data-page-hidden]). The tiles are flat
 *      tints, not blurred glass: twelve backdrop-filters would break the glass budget (<= 8 in view).
 *      The three rows drift sideways at different speeds on scroll (CSS view-timeline, compositor).
 *   2. StyleMorph: scroll progress (Motion useScroll) cross-fades one app window from the Liquid Glass
 *      look to the Aurora Neon look; the button underneath switches the whole site with the real
 *      style switch.
 *   3. DepthStack: three glass cards that start stacked and separate into parallax layers as the
 *      section scrolls (Motion useScroll, transform only).
 *
 * Reduced motion: the wall is static (finished states), the morph shows both looks side by side, the
 * depth cards rest already separated.
 */

/** Marks `data-live` on the element while it is on screen (one IntersectionObserver; no React state). */
function useLiveFlag(ref: RefObject<HTMLElement | null>, margin = "0px") {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) =>
        el.toggleAttribute(
          "data-live",
          entries.some((e) => e.isIntersecting),
        ),
      {
        rootMargin: margin,
        threshold: 0.05,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
}

/* ===================================================================== 1. The wall */

const LINE = [14, 22, 18, 30, 26, 38, 33, 46, 41, 55, 50, 62];
const BARS = [0.45, 0.7, 0.55, 0.9, 0.65, 1, 0.75, 0.5];

function path(series: readonly number[], w: number, h: number) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const pts = series.map(
    (v, i) => [(i / (series.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)] as const,
  );
  const first = pts[0];
  if (!first) return "";
  let d = `M ${first[0]} ${first[1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1] ?? first;
    const [x1, y1] = pts[i] ?? first;
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function Tile({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`wall-tile ${className ?? ""}`}>
      <p className="wall-tile__label">{label}</p>
      <div className="wall-tile__body">{children}</div>
    </div>
  );
}

function LineTile() {
  const clipId = `wall-line-clip-${useId().replace(/[^\w-]/g, "")}`;
  const d = path(LINE, 160, 56);
  return (
    <Tile label="Line chart">
      <svg viewBox="0 0 160 56" className="wall-line" preserveAspectRatio="none">
        <defs>
          <clipPath id={clipId}>
            <rect className="wall-draw" x="0" y="-4" width="160" height="64" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={`${d} L 160 56 L 0 56 Z`} fill="var(--sheen-accent)" opacity="0.16" />
          <path
            d={d}
            fill="none"
            stroke="var(--sheen-accent)"
            strokeWidth="2.25"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </Tile>
  );
}

function BarsTile() {
  return (
    <Tile label="Bar chart">
      <div className="wall-bars">
        {BARS.map((h, i) => (
          <i key={i} style={{ "--h": h, "--i": i } as CSSProperties} />
        ))}
      </div>
    </Tile>
  );
}

function TickerTile({ playing }: { playing: boolean }) {
  const [value, setValue] = useState(12480);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setValue((v) => v + 90 + Math.round(Math.random() * 260)), 2600);
    return () => window.clearInterval(id);
  }, [playing]);
  return (
    <Tile label="Number ticker">
      <p className="wall-number">
        <NumberTicker value={value} from={8120} locales="en-US" live="off" animateOnView={false} />
      </p>
      <span className="home-stat__delta">+12.4%</span>
    </Tile>
  );
}

const MESSAGE = "On it. Shipping glass now.";
function ChatTile({ playing }: { playing: boolean }) {
  const typed = useRef<HTMLSpanElement>(null);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const out = typed.current;
    if (!out) return;
    if (!playing) {
      out.textContent = MESSAGE;
      return;
    }
    const ac = new AbortController();
    const stopped = () => ac.signal.aborted;
    let timer = 0;
    const sleep = (ms: number) => new Promise<void>((res) => (timer = window.setTimeout(res, ms)));
    void (async () => {
      while (!stopped()) {
        out.textContent = "";
        setTyping(true);
        await sleep(800);
        if (stopped()) return;
        setTyping(false);
        for (let i = 1; i <= MESSAGE.length && !stopped(); i++) {
          out.textContent = MESSAGE.slice(0, i);
          await sleep(38);
        }
        await sleep(3600);
      }
    })();
    return () => {
      ac.abort();
      window.clearTimeout(timer);
      setTyping(false);
    };
  }, [playing]);
  return (
    <Tile label="Chat">
      <div className="wall-chat">
        <span className="wall-chat__me">Is the wall live?</span>
        <span className="wall-chat__them">
          <span ref={typed}>{MESSAGE}</span>
          <span className="wall-chat__dots" data-on={typing || undefined}>
            <i />
            <i />
            <i />
          </span>
        </span>
      </div>
    </Tile>
  );
}

function ToastsTile() {
  return (
    <Tile label="Toasts">
      <div className="wall-toasts">
        {["Saved", "Synced", "Deployed"].map((t, i) => (
          <span key={t} className="wall-toast" style={{ "--i": i } as CSSProperties}>
            <b aria-hidden />
            {t}
          </span>
        ))}
      </div>
    </Tile>
  );
}

function SwitchesTile() {
  return (
    <Tile label="Switches">
      <div className="wall-switches">
        {["Glass", "Motion", "Dark"].map((t, i) => (
          <span key={t} className="wall-switch" style={{ "--i": i } as CSSProperties}>
            <i aria-hidden />
            {t}
          </span>
        ))}
      </div>
    </Tile>
  );
}

function ProgressTile() {
  return (
    <Tile label="Progress">
      <div className="wall-progress">
        <span className="wall-progress__bar">
          <i />
        </span>
        <span className="wall-progress__bar wall-progress__bar--b">
          <i />
        </span>
      </div>
    </Tile>
  );
}

function GaugeTile() {
  return (
    <Tile label="Meter">
      <div className="wall-gauge" aria-hidden>
        <i className="wall-gauge__arc" />
        <i className="wall-gauge__needle" />
      </div>
    </Tile>
  );
}

function AvatarsTile() {
  return (
    <Tile label="Avatar group">
      <div className="wall-fan">
        {["Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Torvalds"].map((n, i) => (
          <span key={n} style={{ "--n": i } as CSSProperties}>
            <Avatar name={n} size="md" />
          </span>
        ))}
      </div>
    </Tile>
  );
}

function SliderTile() {
  return (
    <Tile label="Slider">
      <div className="wall-slider">
        <i className="wall-slider__fill" />
        <i className="wall-slider__thumb" />
      </div>
    </Tile>
  );
}

function RatingTile() {
  return (
    <Tile label="Rating">
      <div className="wall-stars" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 24 24" style={{ "--i": i } as CSSProperties}>
            <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="currentColor" />
          </svg>
        ))}
      </div>
    </Tile>
  );
}

function SkeletonTile() {
  return (
    <Tile label="Skeleton">
      <div className="wall-skeleton">
        <i />
        <i />
        <i />
      </div>
    </Tile>
  );
}

/** The tilted wall of 12 live components. */
export function ComponentWall() {
  const ref = useRef<HTMLElement>(null);
  useLiveFlag(ref, "80px");
  const playing = useLoopPlayback(ref);
  const { reduced } = useMotionGate();
  const live = playing && !reduced;
  return (
    <section ref={ref} className="home-wall" aria-labelledby="home-wall-title">
      <div className="home-wall__head">
        <h2 id="home-wall-title" className="home-scene-title">
          {COUNTS.components} React components,{" "}
          <span className="sheen-accent-text">
            {COUNTS.ui} UI and {COUNTS.effects} effects
          </span>
        </h2>
        <p className="home-scene-lede">
          Charts draw, numbers count, chat types, toasts stack, switches flip. Every piece is a real SheenUI component,
          built with Motion and CSS springs.
        </p>
      </div>
      <div className="home-wall__stage" aria-hidden>
        <div className="home-wall__plane">
          <div className="wall-row wall-row--a">
            <LineTile />
            <BarsTile />
            <TickerTile playing={live} />
            <ChatTile playing={live} />
          </div>
          <div className="wall-row wall-row--b">
            <ToastsTile />
            <SwitchesTile />
            <ProgressTile />
            <GaugeTile />
          </div>
          <div className="wall-row wall-row--c">
            <AvatarsTile />
            <SliderTile />
            <RatingTile />
            <SkeletonTile />
          </div>
        </div>
      </div>
      <a href={href("/components")} className="home-wall__link">
        Browse every component <span aria-hidden>→</span>
      </a>
    </section>
  );
}

/* ===================================================================== 2. Liquid -> Aurora morph */

function LookWindow({ look }: { look: "liquid" | "aurora" }) {
  return (
    <div className="morph-window" data-look={look}>
      <div className="morph-window__bar">
        <i />
        <i />
        <i />
        <span>{look === "liquid" ? "Liquid Glass" : "Aurora Neon"}</span>
      </div>
      <div className="morph-window__body">
        <div className="morph-window__card">
          <p className="morph-window__kicker">Revenue</p>
          <p className="morph-window__value">{look === "liquid" ? "$48,210" : "$48,210"}</p>
          <svg viewBox="0 0 160 40" preserveAspectRatio="none" className="morph-window__spark" aria-hidden>
            <path
              d={path(LINE, 160, 40)}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="morph-window__row">
          <span className="morph-window__btn">Get started</span>
          <span className="morph-window__chip">
            <i /> Live
          </span>
        </div>
      </div>
    </div>
  );
}

/** Scroll progress cross-fades one app window from the Liquid look to the Aurora look. */
export function StyleMorph() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionGate();
  const { style, setStyle } = useSheenStyle();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.4"] });
  const p = useSpring(scrollYProgress, follow.pointer);
  const aurora = useTransform(p, [0.25, 0.75], [0, 1], { clamp: true });
  const liquidLabel = useTransform(p, [0.25, 0.6], [1, 0.75], { clamp: true });
  const auroraLabel = useTransform(p, [0.4, 0.75], [0.75, 1], { clamp: true });
  const tilt = useTransform(p, [0, 1], [8, -8]);
  const next = style === "aurora" ? "liquid" : "aurora";
  return (
    <section ref={ref} className="home-morph" aria-labelledby="home-morph-title">
      <div className="home-morph__copy">
        <h2 id="home-morph-title" className="home-scene-title">
          Two looks. <span className="sheen-accent-text">One scroll.</span>
        </h2>
        <p className="home-scene-lede">
          Liquid Glass bends the wallpaper at its rim. Aurora Neon frosts it under curtains of light. Same components,
          same tokens: scroll to watch one app window change look, or switch the whole site.
        </p>
        <div className="home-morph__labels" aria-hidden>
          <motion.span style={reduced ? undefined : { opacity: liquidLabel }}>Liquid Glass</motion.span>
          <i />
          <motion.span style={reduced ? undefined : { opacity: auroraLabel }}>Aurora Neon</motion.span>
        </div>
        <Button variant="glass" onClick={() => setStyle(next)}>
          Switch the whole site to {next === "aurora" ? "Aurora Neon" : "Liquid Glass"}
        </Button>
      </div>
      {reduced ? (
        <div className="home-morph__pair">
          <LookWindow look="liquid" />
          <LookWindow look="aurora" />
        </div>
      ) : (
        <motion.div className="home-morph__stage" style={{ rotateY: tilt }} aria-hidden>
          <LookWindow look="liquid" />
          <motion.div className="home-morph__over" style={{ opacity: aurora }}>
            <LookWindow look="aurora" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

/* ===================================================================== 3. Depth */

const DEPTH = [
  {
    title: "Backdrop",
    body: "Blur and saturation of whatever sits behind: the layer that makes glass read as glass.",
    from: { x: 0, y: 0, r: 0 },
    to: { x: -90, y: -185, r: -3 },
    k: 0.5,
  },
  {
    title: "Rim light",
    body: "A specular edge that follows the pointer, lit from the top left on every surface.",
    from: { x: 0, y: 0, r: 0 },
    to: { x: 20, y: 0, r: 0 },
    k: 1,
  },
  {
    title: "Content",
    body: "Text and controls sit on top, always AA-legible, turning solid when transparency is reduced.",
    from: { x: 0, y: 0, r: 0 },
    to: { x: 90, y: 185, r: 3 },
    k: 1.5,
  },
] as const;

function DepthCard({
  index,
  d,
  progress,
}: {
  index: number;
  d: (typeof DEPTH)[number];
  progress: ReturnType<typeof useSpring>;
}) {
  const x = useTransform(progress, [0.15, 0.7], [index * 6 - 6, d.to.x]);
  const y = useTransform(progress, [0.15, 0.7], [index * 14 - 14, d.to.y]);
  const rotate = useTransform(progress, [0.15, 0.7], [0, d.to.r]);
  const scale = useTransform(progress, [0.15, 0.7], [1 - (2 - index) * 0.03, 1 + (index - 1) * 0.04]);
  // Cards beneath the top one show their words only once they have slid clear, so nothing ever reads as covered text.
  const reveal = useTransform(progress, [0.62, 0.72], [0, 1], { clamp: true });
  return (
    <motion.div className="depth-card" style={{ x, y, rotate, scale, zIndex: index + 1 }}>
      <GlassCard level={3} className="depth-card__glass">
        <motion.div style={index === DEPTH.length - 1 ? undefined : { opacity: reveal }}>
          <p className="home-mini__label">Layer {index + 1}</p>
          <h3 className="depth-card__title">{d.title}</h3>
          <p className="depth-card__body">{d.body}</p>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}

const WIDE = "(min-width: 64rem)";
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function wideNow() {
  return window.matchMedia(WIDE).matches;
}

/** Three glass cards that start stacked and separate into parallax layers as the section scrolls. */
export function DepthStack() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionGate();
  // Phones and tablets get the cards stacked in a column, already separated: the scroll choreography needs the room.
  const wide = useSyncExternalStore(subscribeWide, wideNow, () => false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.3"] });
  const p = useSpring(scrollYProgress, follow.pointer);
  return (
    <section ref={ref} className="home-depth" aria-labelledby="home-depth-title">
      <div className="home-depth__copy">
        <h2 id="home-depth-title" className="home-scene-title">
          Glass has <span className="sheen-accent-text">depth</span>
        </h2>
        <p className="home-scene-lede">
          Backdrop, rim light and content are separate layers. Scroll and they separate: each moves at its own speed, on
          transforms only.
        </p>
      </div>
      {reduced || !wide ? (
        <ul className="home-depth__static">
          {DEPTH.map((d) => (
            <li key={d.title}>
              <GlassCard level={2} className="depth-card__glass">
                <h3 className="depth-card__title">{d.title}</h3>
                <p className="depth-card__body">{d.body}</p>
              </GlassCard>
            </li>
          ))}
        </ul>
      ) : (
        <div className="home-depth__stage">
          {DEPTH.map((d, i) => (
            <DepthCard key={d.title} index={i} d={d} progress={p} />
          ))}
        </div>
      )}
    </section>
  );
}

/** The three scenes in order. */
export function HomeWow() {
  return (
    <>
      <ComponentWall />
      <StyleMorph />
      <DepthStack />
    </>
  );
}
