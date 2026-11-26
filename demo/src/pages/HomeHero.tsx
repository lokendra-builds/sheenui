import {
  Fragment,
  Suspense,
  lazy,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useAnimate, useMotionValue, useSpring, type AnimationSequence } from "motion/react";
import {
  Button,
  budgetStagger,
  distance,
  duration,
  ease,
  follow,
  spring,
  staggerStep,
  useBeatFollower,
  useMotionGate,
  type SheenStyle,
} from "@sheenui/theme";
// Hero-only internals of the style engine: not part of the public API, so they come from the source files.
import { auroraSky, registerAuroraFloor, useSkyTick } from "../../../theme/src/components/backdrop/sky-state";
import { wakeBeat } from "../../../theme/src/motion/beat";
import { clamp } from "../../../theme/src/lib/math";

import { itemAt } from "../lookup";
import { href } from "../router";
import { COUNTS } from "../seo/counts";

/*
 * The home hero. It is its own chunk (HomePage.tsx lazy-loads it): the prerendered HTML already
 * has all the text and links, and the text enters with CSS (index.css), so this code only adds
 * what needs Motion: the glass composition, the pointer parallax and light, the CTAs' magnetic
 * pull and the entrance of the decoration.
 */

/* =====================================================================
 * The hero: the WOW composition of the active style (ported from the wow-liquid / wow-aurora
 * prototypes), with ONE entrance timeline:
 *   - the TEXT (badge, headline, lede, CTAs, proof) is visible in the prerendered HTML and enters
 *     with CSS animations (index.css) that start at first paint, before any script runs: headline
 *     words condense out of an 8px blur, the accent word wipes in, the lede rises, the CTAs pop
 *     last. Nothing waits for JavaScript, so the text is the page's LCP
 *   - the DECORATION is Motion's: light first (the glow, Aurora's rays and floor bloom), then the
 *     cards of the composition settle (useHeroIntro below); it waits for the display fonts
 *     (capped at 450 ms)
 *   - a same-session replay runs 1.8x faster without the blur
 *   - reduced motion: one 220 ms fade, no movement, blur or wipe
 * Pointer: parallax on the pieces (and, in Aurora, a light behind the glass), written on the
 * shared beat. Scroll: the copy drifts up and the composition sinks back (§4q).
 * ===================================================================== */

const COPY: Record<SheenStyle, { eyebrow: string; lines: [string, string]; accent: string; lede: string }> = {
  liquid: {
    eyebrow: "Glassy, classy React components. In motion.",
    lines: ["Glassmorphism React", "components, built to"],
    accent: "glow.",
    lede: "SheenUI is a free library of glassmorphism and Liquid Glass React components, animated with Motion and built on Base UI and Tailwind CSS v4. Accessible by default. Copy the source and make it yours.",
  },
  aurora: {
    eyebrow: "Glassy UI with a neon glow.",
    lines: ["Glassmorphism React", "components, built to"],
    accent: "glow.",
    lede: "SheenUI is a free library of glassmorphism React components in the Aurora Neon style: frosted glass with real light, depth and Motion animation, built on Base UI and Tailwind CSS v4. Copy the source and make it yours.",
  },
};

/** The login stage (Lamp / Simple switch, the story): its own chunk, fetched once the hero has hydrated. */
const LampStage = lazy(() => import("./HomeLampStage"));

/** Holds the stage's box (switch row + card) until the stage chunk has loaded, so nothing shifts. */
const stagePlaceholder = <div className="home-comp-ph" aria-hidden />;

const PROOF = [`${COUNTS.components} components`, "Light & dark", "Reduced-motion safe", "MIT licensed"];
const BUILT = ["React 19.2+", "Base UI", "Motion", "Tailwind CSS 4"];

const fadeIn = { type: "tween", duration: 0.35, ease: ease.out } as const;
const glassFade = {
  type: "tween",
  duration: duration.base,
  ease: ease.out,
} as const;

const PLAYED_KEY = "sheen:hero-played";
function playedThisSession() {
  try {
    return sessionStorage.getItem(PLAYED_KEY) === "1";
  } catch {
    return false;
  }
}
function markPlayed() {
  try {
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    /* storage blocked */
  }
}

/** The home page hero: headline, call-to-action buttons and the animated glass scene. */
export default function Hero({ style }: { style: SheenStyle }) {
  const aurora = style === "aurora";
  const copy = COPY[style];
  const { reduced, pointerFx } = useMotionGate();
  const fontsReady = useFontsReady(450);
  // The glass composition renders in a transition right after the first paint (time-sliced);
  // a same-size placeholder holds its box, so nothing shifts.
  const [compOn, setCompOn] = useState(false);
  // The login stage (its chunk, the lamp, the form) mounts on a later idle slot of its own: the hero's headline, the
  // intro and the backdrop each get their own frames instead of one long task.
  const [stageOn, setStageOn] = useState(false);
  useEffect(() => {
    startTransition(() => setCompOn(true));
    const start = () => startTransition(() => setStageOn(true));
    // Safari has no requestIdleCallback: typed as optional here, so the timer fallback is a real branch.
    const scheduler: {
      requestIdleCallback?: Window["requestIdleCallback"];
      cancelIdleCallback?: Window["cancelIdleCallback"];
    } = window;
    if (scheduler.requestIdleCallback && scheduler.cancelIdleCallback) {
      const cancelIdle = scheduler.cancelIdleCallback.bind(window);
      const id = scheduler.requestIdleCallback.call(window, start, { timeout: 700 });
      return () => cancelIdle(id);
    }
    const timer = window.setTimeout(start, 200);
    return () => window.clearTimeout(timer);
  }, []);
  const { scope } = useHeroIntro(reduced, compOn && (reduced || fontsReady));
  const heroRef = useRef<HTMLElement | null>(null);
  // Never null the scope: Motion's timeline resolves its selectors inside it during stop().
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      assignRef(scope, el);
      assignRef(heroRef, el);
    },
    [scope],
  );
  useOffscreenFlag(heroRef);
  // Coming back in the same session: index.css plays the text entrance 1.8x faster, without the blur.
  useLayoutEffect(() => {
    if (playedThisSession()) heroRef.current?.setAttribute("data-replay", "");
  }, []);

  // Hand-off on the first scroll (§4q): the copy drifts up, the composition sinks back. It is a
  // CSS view-timeline animation on .home-copy / .home-comp-track (index.css), so it runs on the
  // compositor: no scroll listener, no per-frame style writes, nothing to re-rasterise (Motion's
  // useScroll version cost 3-4 ms of main thread per scroll frame at 4x CPU).

  // Pointer: -1..1 over the hero on the pointer follow spring (parallax), and the light behind
  // the Aurora glass in px inside the hero.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, follow.pointer);
  const sy = useSpring(my, follow.pointer);
  const gxRaw = useMotionValue(900);
  const gyRaw = useMotionValue(320);
  const gOn = useMotionValue(0);
  const gx = useSpring(gxRaw, follow.pointer);
  const gy = useSpring(gyRaw, follow.pointer);
  const gOpacity = useSpring(gOn, { visualDuration: 0.5, bounce: 0 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el || !pointerFx) {
      mx.set(0);
      my.set(0);
      gOn.set(0);
      return;
    }
    let rect: DOMRect | null = null;
    const invalidate = () => {
      rect = null;
    };
    const onMove = (e: PointerEvent) => {
      const r = (rect ??= el.getBoundingClientRect());
      mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
      gxRaw.set(e.clientX - r.left);
      gyRaw.set(e.clientY - r.top);
      gOn.set(1);
      wakeBeat();
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
      gOn.set(0);
      wakeBeat();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, [pointerFx, mx, my, gxRaw, gyRaw, gOn]);

  // DOM writes on the beat (~30 Hz): the pieces' parallax and the light behind the glass.
  const glowEl = useRef<HTMLElement>(null);
  const pieces = useRef<{ el: HTMLElement; depth: number; last: string }[] | null>(null);
  const glowWritten = useRef("");
  useBeatFollower(() => {
    const root = heroRef.current;
    if (!root) return;
    if (!pieces.current?.length)
      pieces.current = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]")).map((el) => ({
        el,
        depth: Number(el.dataset.depth) || 1,
        last: "",
      }));
    const x = sx.get();
    const y = sy.get();
    for (const p of pieces.current) {
      const next = `translate3d(${(x * p.depth * 9).toFixed(1)}px,${(y * p.depth * 7).toFixed(1)}px,0)`;
      if (next === p.last) continue;
      p.last = next;
      p.el.style.transform = next;
    }
    const g = glowEl.current;
    if (!g) return;
    const key = `${gx.get().toFixed(1)},${gy.get().toFixed(1)},${gOpacity.get().toFixed(3)}`;
    if (key === glowWritten.current) return;
    glowWritten.current = key;
    g.style.transform = `translate3d(${gx.get().toFixed(1)}px,${gy.get().toFixed(1)}px,0)`;
    g.style.opacity = gOpacity.get().toFixed(3);
  }, pointerFx);

  // Aurora's light rays sway on the sky clock (-3deg .. 4deg over 40 s).
  const rays = useRef<HTMLElement>(null);
  useSkyTick(
    aurora && !reduced
      ? (t) => {
          if (rays.current)
            rays.current.style.transform = `rotate(${(0.5 + 3.5 * Math.sin((Math.PI * 2 * t) / 40)).toFixed(2)}deg)`;
        }
      : null,
  );

  return (
    <section
      ref={setRef}
      className="home-hero"
      data-style={style}
      data-intro-state="pending"
      aria-labelledby="home-hero-title"
    >
      {aurora && (
        <span className="home-glowclip home-glowclip--tall" aria-hidden>
          <i ref={rays} className="home-rays" data-intro="rays" />
        </span>
      )}
      {aurora && pointerFx && (
        <span className="home-glowclip" aria-hidden>
          <i ref={glowEl} className="home-hero-glow" data-intro="glow" />
        </span>
      )}
      <div className="home-hero__grid">
        <div className="home-copy">
          <a href={href("/foundations")} className="home-eyebrow" data-intro="badge">
            <span className="home-eyebrow__tag">New</span>
            <span className="home-eyebrow__text">{copy.eyebrow}</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-3.5 rtl:-scale-x-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          {/* tabIndex -1: focus lands here after navigating home (see RouteFocus in App.tsx). */}
          <h1 id="home-hero-title" tabIndex={-1} className="sheen-display home-h1 outline-none">
            {/* The words are the heading's text (one copy, read in order by screen readers and crawlers). */}
            <span className="home-line">
              <Words text={copy.lines[0]} />
            </span>{" "}
            <span className="home-line">
              <Words text={copy.lines[1]} start={copy.lines[0].split(" ").length} />{" "}
              <span className="home-lightword">
                <span className="sheen-accent-text" data-intro-wipe>
                  {copy.accent}
                </span>
              </span>
            </span>
          </h1>
          <p className="home-lede" data-intro="lead">
            {copy.lede}
          </p>
          <div className="home-ctas">
            <Magnetic>
              <Button
                size="lg"
                data-intro="cta"
                style={{ "--i": 0 } as CSSProperties}
                // eslint-disable-next-line jsx-a11y/anchor-has-content -- Button passes its children into the rendered <a>
                render={<a href={href("/components")} />}
              >
                Browse components
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-[18px] rtl:-scale-x-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                size="lg"
                variant="glass"
                data-intro="cta"
                style={{ "--i": 1 } as CSSProperties}
                // eslint-disable-next-line jsx-a11y/anchor-has-content -- Button passes its children into the rendered <a>
                render={<a href={href("/docs/installation")} />}
              >
                Install SheenUI
              </Button>
            </Magnetic>
          </div>
          <ul className="home-proof" data-intro="stats" aria-label="At a glance">
            {PROOF.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="home-comp-track">
          {!aurora && <i className="home-comp-halo" data-intro="glow" aria-hidden />}
          {compOn && stageOn ? (
            <Suspense fallback={stagePlaceholder}>
              <LampStage />
            </Suspense>
          ) : (
            stagePlaceholder
          )}
          <div className="home-comp-foot">
            <p className="home-stage-links">
              <a href={href("/blocks/lamp-login")}>Lamp login</a>
              <span aria-hidden> · </span>
              <a href={href("/blocks/glass-login")}>Simple login</a>
            </p>
            <PauseControl heroRef={heroRef} />
          </div>
        </div>
      </div>
      {aurora && <Floor />}
      <ul className="home-built" data-intro="row" aria-label="Built with">
        {BUILT.map((t) => (
          <li key={t}>
            <i aria-hidden /> {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Magnetic hover for the hero CTAs only: the button leans toward the pointer, at
 * most `distance.magneticMax` (6 px) on the `follow.magnetic` spring, and springs home when it
 * leaves. A transform-only wrapper (the glass button inside is untouched); the pull is two
 * MotionValues, so nothing re-renders per frame. Off for touch / coarse pointers and reduced motion.
 */
function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const { pointerFx } = useMotionGate();
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const x = useSpring(pullX, follow.magnetic);
  const y = useSpring(pullY, follow.magnetic);

  if (!pointerFx) return <>{children}</>;

  const pull = (v: number) => clamp(v, -distance.magneticMax, distance.magneticMax);
  const onPointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const r = (rect.current ??= ref.current?.getBoundingClientRect() ?? null);
    if (!r) return;
    pullX.set(pull((event.clientX - (r.left + r.width / 2)) * strength));
    pullY.set(pull((event.clientY - (r.top + r.height / 2)) * strength));
  };
  const onPointerLeave = () => {
    rect.current = null; // re-measure next time (the page may have scrolled)
    pullX.set(0);
    pullY.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className="home-magnet"
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </motion.span>
  );
}

/** Words that rise into place one after another: the sentence stays one string for screen readers (see the h1). */
function Words({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      {/* --i: the word's place in the headline; index.css staggers the entrance by it. */}
      <span className="home-mask">
        <span className="home-word" data-split="word" style={{ "--i": start + i } as CSSProperties}>
          {word}
        </span>
      </span>
    </Fragment>
  ));
}

/** The player: pauses every loop in the hero (the constellation, the beam). Always reachable, 44 px tall. */
function PauseControl({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      className="home-pause"
      aria-pressed={paused}
      onClick={() => {
        const next = !paused;
        setPaused(next);
        if (next) heroRef.current?.setAttribute("data-paused", "");
        else heroRef.current?.removeAttribute("data-paused");
      }}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
        {paused ? <path d="M7 4.5v15l12.5-7.5L7 4.5Z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
      </svg>
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}

/** Aurora's glossy floor: the sky paints its reflection into this canvas on the beat. */
function Floor() {
  const floor = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const f = floor.current;
    const c = canvas.current;
    if (!f || !c) return;
    const measure = () => {
      const r = f.getBoundingClientRect();
      auroraSky.floorTop = r.top + window.scrollY;
      auroraSky.floorH = r.height;
      const w = Math.max(2, Math.round(r.width / 3));
      const h = Math.max(2, Math.round(r.height / 3));
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
    };
    const unregister = registerAuroraFloor(c, measure);
    const ro = new ResizeObserver(measure);
    ro.observe(f);
    window.addEventListener("resize", measure);
    return () => {
      unregister();
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return (
    <div ref={floor} className="home-floor" data-intro="floor" aria-hidden>
      <i className="home-floor__water" />
      <canvas ref={canvas} className="home-floor__canvas" />
      <i className="home-floor__pool" />
      <i className="home-floor__seam" />
    </div>
  );
}

/* ---------- The entrance timeline ---------- */

/** Sets a ref object's value. A plain function, so React Compiler's hook checks do not see a write to a hook's result. */
function assignRef<T>(ref: { current: T }, value: T) {
  ref.current = value;
}

/** `useAnimate` types `scope.current` as always set, but it is null until the section mounts. */
function scopeRoot(scope: { current: HTMLElement }): HTMLElement | null {
  return scope.current;
}

function useHeroIntro(reduced: boolean, ready: boolean) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const run = useRef({ id: 0, left: 0 });

  const finish = useCallback(() => {
    const root = scopeRoot(scope);
    if (!root) return;
    root.setAttribute("data-intro-state", "done");
    // The glass timeline leaves identity values inline: drop them (no 3D layer for good).
    root
      .querySelectorAll<HTMLElement>("[data-intro], [data-intro-rise], [data-split], [data-intro-wipe]")
      .forEach((el) => {
        el.style.removeProperty("transform");
        el.style.removeProperty("filter");
        el.style.removeProperty("clip-path");
      });
    markPlayed();
  }, [scope]);

  const partDone = useCallback(
    (id: number) => {
      if (id !== run.current.id) return;
      if (--run.current.left > 0) return;
      finish();
    },
    [finish],
  );

  // 0 ms: light blooms before any object arrives (non-glass layers: opacity + scale are fine).
  useEffect(() => {
    const root = scopeRoot(scope);
    if (reduced || !root) return;
    const light = animate(
      present(root, [
        [
          "[data-intro='glow']",
          { opacity: [0, 1], transform: ["scale(0.85)", "scale(1)"] },
          { ...spring.gentle, opacity: fadeIn, at: 0 },
        ],
        ["[data-intro='rays']", { opacity: [0, 1] }, { duration: 1.1, ease: ease.out, at: 0 }],
        ["[data-intro='floor']", { opacity: [0, 1] }, { duration: 1.2, ease: ease.out, at: 0.1 }],
      ]),
    );
    return () => light.stop();
  }, [animate, scope, reduced]);

  useEffect(() => {
    const root = scopeRoot(scope);
    if (!ready || !root) return;
    const id = ++run.current.id;
    run.current.left = 1;

    if (reduced) {
      const calm = animate(
        present(root, [
          ["[data-intro-rise]", { transform: "none" }, { duration: 0, at: 0 }],
          [DECOR, { opacity: [0, 1] }, { duration: duration.base, ease: ease.out, at: 0 }],
        ]),
      );
      void calm.then(() => partDone(id));
      return () => calm.stop();
    }

    // Coming back in the same session: the same choreography, 1.8x faster.
    const replay = playedThisSession();

    // The composition's cards settle in. Every moving value is opacity or a full transform string (WAAPI).
    const glassPart = present(root, [
      [
        "[data-intro='card']",
        {
          opacity: [0, 1],
          transform: [`translateY(${distance.panel}px) scale(0.96)`, "translateY(0px) scale(1)"],
        },
        {
          ...spring.gentle,
          opacity: glassFade,
          delay: budgetStagger(staggerStep.cards),
          at: 1.0,
        },
      ],
    ]);

    const timeline = animate(glassPart);
    if (replay) timeline.speed = 1.8;
    void timeline.then(() => partDone(id));
    return () => timeline.stop();
  }, [animate, scope, reduced, ready, partDone]);

  return { scope };
}

/** The decorative layers Motion enters (the text is CSS, see index.css): glass cards, glows, rays, floor. */
const DECOR = "[data-intro='card'], [data-intro='glow'], [data-intro='rays'], [data-intro='floor']";

/** Keep only the segments whose selector matches something in `root` (a style may not render every part). */
function present(root: HTMLElement, seq: AnimationSequence): AnimationSequence {
  return seq.filter((seg) => !Array.isArray(seg) || typeof seg[0] !== "string" || root.querySelector(seg[0]) !== null);
}

/** True once the display fonts are in, or after `capMs`: the headline never waits longer than that. */
function useFontsReady(capMs: number) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    const done = () => live && setReady(true);
    const timer = window.setTimeout(done, capMs);
    if (typeof document !== "undefined" && "fonts" in document) void document.fonts.ready.then(done);
    else done();
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [capMs]);
  return ready;
}

/** Sets data-offscreen on the element while it is out of view, so CSS can pause its loops. */
function useOffscreenFlag(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (itemAt(entries, 0)?.isIntersecting) el.removeAttribute("data-offscreen");
      else el.setAttribute("data-offscreen", "");
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
