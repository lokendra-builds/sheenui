"use client";

import { useEffect, useId, useRef } from "react";

import { useAmbientBeat } from "../../motion/beat";

/** How often the drift and caustic transforms are written (the motion is too slow to need more). */
const SKY_WRITES_PER_SECOND = 8;

/**
 * Liquid Glass wallpaper (lazy): drifting orbs, two glossy spheres and three silk ribbons inside
 * ONE drift wrapper (a single composited layer, rasterised once), plus daylight caustics.
 * Hero mode drifts on the shared ~30 Hz beat (transform only, a few px over 34 s); page mode is
 * still. Classes and placement live in styles/backdrop.css.
 */
export default function LiquidSky({ mode, active }: { mode: "hero" | "page"; active: boolean; lite: boolean }) {
  const drift = useRef<HTMLDivElement>(null);
  const caustic = useRef<HTMLElement>(null);
  const t = useRef(0);
  const lastTick = useRef(-1);
  // Where each layer sits now ("x,y" in px), so the pose can be rewritten in the other form when the sky stops or resumes.
  const pose = useRef({ drift: "-22px,14px", caustic: "0px,0px" });

  // A 3D transform (translate3d) makes its layer a compositor layer of its own for as long as it is set, even when
  // nothing moves it. While the sky plays that is what we want (the drift is a compositor shift). Once it stops (the
  // home hero's story, a hidden tab, off-screen) the same offset is rewritten as a plain 2D translate, which lets the
  // sky's layers merge into one: the glass above then blends one layer instead of several every frame it changes.
  // The picture does not move: the offset is the same.
  useEffect(() => {
    if (lastTick.current < 0) return; // never moved: nothing to rewrite
    const form = (xy: string) => (active && mode === "hero" ? `translate3d(${xy},0)` : `translate(${xy})`);
    if (drift.current) drift.current.style.transform = form(pose.current.drift);
    if (caustic.current) caustic.current.style.transform = form(pose.current.caustic);
  }, [active, mode]);

  useAmbientBeat(
    (_now, dt) => {
      t.current += dt;
      const s = t.current;
      // Both layers move under 7 px/s, so they are written together on a coarse clock (8 Hz, under a pixel per write)
      // instead of every beat: a frame in which nothing visibly moved has no damage to redraw, and the glass above the
      // sky does not re-blur the whole viewport 30 times a second for a sub-pixel change.
      const tick = Math.floor(s * SKY_WRITES_PER_SECOND);
      if (tick === lastTick.current) return;
      lastTick.current = tick;
      const at = tick / SKY_WRITES_PER_SECOND;
      // Drift: 34 s there and back (ease in-out), like the prototype's alternate keyframes. Translation only: a layer
      // that also scales or rotates is composited per pixel, several times the cost of a plain shift (the picture's
      // fixed tilt is baked into `.sheen-sky__pose`).
      const p = 0.5 - 0.5 * Math.cos((Math.PI * at) / 34);
      if (drift.current) {
        pose.current.drift = `${(-22 + 46 * p).toFixed(2)}px,${(14 - 32 * p).toFixed(2)}px`;
        drift.current.style.transform = `translate3d(${pose.current.drift},0)`;
      }
      // Caustics: a slower net of light that slides.
      const q = 0.5 - 0.5 * Math.cos((Math.PI * at) / 26);
      if (caustic.current) {
        pose.current.caustic = `${(-120 * q).toFixed(1)}px,${(80 * q).toFixed(1)}px`;
        caustic.current.style.transform = `translate3d(${pose.current.caustic},0)`;
      }
    },
    active && mode === "hero",
  );

  return (
    <div className="sheen-sky__liquid">
      <div ref={drift} className="sheen-sky__drift">
        <div className="sheen-sky__pose">
          <i className="sheen-sky__orb" data-o="a" />
          <i className="sheen-sky__orb" data-o="b" />
          <i className="sheen-sky__orb" data-o="c" />
          <i className="sheen-sky__orb" data-o="d" />
          <i className="sheen-sky__orb" data-o="e" />
          <Ribbons />
          <i className="sheen-sky__sphere" data-sphere="magenta" />
          <i className="sheen-sky__sphere" data-sphere="blue" />
        </div>
      </div>
      <div className="sheen-sky__caustics">
        <i ref={caustic} />
      </div>
      <i className="sheen-sky__veil" />
      <i className="sheen-sky__vignette" />
    </div>
  );
}

/**
 * Silk ribbons: one static SVG (no animated children, so it rasterises once and the drift
 * wrapper moves it on the compositor). Each ribbon has a fold: a shade below, a shine above,
 * and a 1.5px lit edge (emissive at night).
 */
function Ribbons() {
  const id = useId().replace(/[^\w-]/g, "");
  const ribbon = (key: string, d: string, w: number, grad: string) => (
    <g className={`sheen-ribbon sheen-ribbon--${key}`}>
      <path d={d} stroke={`url(#${id}${grad})`} strokeWidth={w} />
      <path d={d} className="sheen-ribbon__shade" strokeWidth={w * 0.36} transform={`translate(0 ${w * 0.3})`} />
      <path d={d} stroke={`url(#${id}shine)`} strokeWidth={w * 0.22} transform={`translate(0 ${-w * 0.26})`} />
      <path d={d} className="sheen-ribbon__edge" strokeWidth={1.5} transform={`translate(0 ${-w * 0.49})`} />
    </g>
  );
  return (
    <svg
      className="sheen-sky__ribbons"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}warm`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" className="sheen-stop--1" />
          <stop offset=".38" className="sheen-stop--2" />
          <stop offset=".7" className="sheen-stop--3" />
          <stop offset="1" className="sheen-stop--4" />
        </linearGradient>
        <linearGradient id={`${id}cool`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="sheen-stop--5" />
          <stop offset=".5" className="sheen-stop--6" />
          <stop offset="1" className="sheen-stop--1" />
        </linearGradient>
        <linearGradient id={`${id}shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".75" stopColor="#fff" stopOpacity=".15" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ribbon("b", "M -200 330 C 240 140, 640 560, 1020 400 S 1500 60, 1820 150", 120, "cool")}
      {ribbon("a", "M -220 900 C 260 640, 560 1010, 900 760 S 1380 250, 1820 360", 190, "warm")}
      {ribbon("c", "M 420 1120 C 700 860, 980 930, 1240 690 S 1640 540, 1840 620", 64, "cool")}
    </svg>
  );
}
