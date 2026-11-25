import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Avatar, GlassCard, NumberTicker, Switch, useLoopPlayback, useMotionGate } from "@sheenui/theme";

/*
 * The hero's constellation: six live mini-components on three depth layers (far, middle, near).
 * Each one performs its signature motion once the hero is in view, and the ones that loop (the
 * odometer, the typing chat, the toast, the fan, the line) pause while the hero is off-screen,
 * the tab is hidden or the visitor pressed "Pause motion" (HomeHero sets data-paused / data-offscreen).
 *
 * Glass budget: four pieces are glass (backdrop-filter): the line, the odometer, the chat, the
 * toast. The toggle chip and the avatars are flat tinted surfaces (no blur). Together with the
 * refracting slab and the glass CTA the hero holds 6 blurred surfaces (limit 8).
 *
 * Everything inside is decorative (the headline and the links carry the page), so the field is
 * aria-hidden and inert: no focus stops, nothing for a screen reader to read twice.
 * Reduced motion: every piece shows its finished state (value, drawn line, switch on, full text,
 * toast in place, avatars fanned) and nothing moves.
 */

const SERIES = [12, 18, 15, 22, 19, 27, 24, 31, 29, 38, 35, 44];
const CHAT = "Shipped the glass. It catches light now.";
const STAT_FORMAT: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
};

/** True while this piece's loop should run: the hero is on screen, the tab visible, motion allowed and not paused. */
function useHeroLoopFlag(ref: { current: HTMLElement | null }) {
  const { reduced } = useMotionGate();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const hero = ref.current?.closest<HTMLElement>(".home-hero");
    if (!hero) return;
    const sync = () => setPaused(hero.hasAttribute("data-paused"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(hero, { attributes: true, attributeFilter: ["data-paused"] });
    return () => mo.disconnect();
  }, [ref]);
  const playing = useLoopPlayback(ref, { paused });
  return playing && !reduced;
}

/** The constellation field. */
export function Constellation() {
  return (
    <div className="home-comp" aria-hidden inert>
      <div className="home-layer home-layer--far">
        <div className="home-piece home-piece--line" data-depth="0.5">
          <LineCard />
        </div>
        <div className="home-piece home-piece--toggle" data-depth="0.6">
          <ToggleChip />
        </div>
      </div>
      <div className="home-layer home-layer--mid">
        <div className="home-piece home-piece--ticker" data-depth="1">
          <TickerCard />
        </div>
        <div className="home-piece home-piece--chat" data-depth="0.9">
          <ChatCard />
        </div>
      </div>
      <div className="home-layer home-layer--near">
        <div className="home-piece home-piece--toast" data-depth="1.3">
          <ToastLive />
        </div>
        <div className="home-piece home-piece--fan" data-depth="1.2">
          <AvatarFan />
        </div>
      </div>
    </div>
  );
}

function sparkPath(series: readonly number[], w: number, h: number) {
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

/** A sparkline that draws itself in (a clip rect scaling from the left: transform only), then redraws now and then. */
function LineCard() {
  const uid = useId().replace(/[^\w-]/g, "");
  const fillId = `home-spark-fill-${uid}`;
  const clipId = `home-spark-clip-${uid}`;
  const w = 180;
  const h = 56;
  const d = sparkPath(SERIES, w, h);
  return (
    <GlassCard level={2} sheen={false} data-intro="card" className="home-mini home-line-card">
      <div className="flex items-baseline justify-between gap-3">
        <p className="home-mini__label">Signups</p>
        <span className="home-stat__delta">+18%</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="home-spark" preserveAspectRatio="none">
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sheen-accent)" stopOpacity="0.38" />
            <stop offset="1" stopColor="var(--sheen-accent)" stopOpacity="0" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect className="home-spark__reveal" x="0" y="-4" width={w} height={h + 8} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${fillId})`} />
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
    </GlassCard>
  );
}

/** The odometer: counts up from a lower figure, then ticks up again every few seconds while it is on screen. */
function TickerCard() {
  const ref = useRef<HTMLDivElement>(null);
  const playing = useHeroLoopFlag(ref);
  const [value, setValue] = useState(48210);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setValue((v) => v + 120 + Math.round(Math.random() * 380)), 3200);
    return () => window.clearInterval(id);
  }, [playing]);
  return (
    <GlassCard ref={ref} level={2} sheen={false} data-intro="card" className="home-mini home-ticker-card">
      <p className="home-mini__label">Revenue</p>
      <p className="home-stat__value">
        <NumberTicker value={value} from={41870} delay={1.1} locales="en-US" format={STAT_FORMAT} live="off" />
      </p>
    </GlassCard>
  );
}

/** A switch that flips itself on once, a beat after the slab lands. Flat (no blur). */
function ToggleChip() {
  const { reduced } = useMotionGate();
  const [flipped, setOn] = useState(false);
  const on = reduced || flipped;
  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setOn(true), 1900);
    return () => window.clearTimeout(id);
  }, [reduced]);
  return (
    <div data-intro="card" className="home-mini home-flat-chip">
      <Switch checked={on} onCheckedChange={setOn} label="Glass effects" tabIndex={-1} />
    </div>
  );
}

/** A chat bubble: three dots, then the line types itself out; repeats while on screen. Text is written straight to the DOM (no per-character React render). */
function ChatCard() {
  const ref = useRef<HTMLDivElement>(null);
  const typed = useRef<HTMLSpanElement>(null);
  const playing = useHeroLoopFlag(ref);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const out = typed.current;
    if (!out) return;
    if (!playing) {
      out.textContent = CHAT;
      return;
    }
    const ac = new AbortController();
    const stopped = () => ac.signal.aborted;
    let timer = 0;
    const sleep = (ms: number) => new Promise<void>((res) => (timer = window.setTimeout(res, ms)));
    void (async () => {
      await sleep(1500);
      while (!stopped()) {
        out.textContent = "";
        setTyping(true);
        await sleep(900);
        if (stopped()) return;
        setTyping(false);
        for (let i = 1; i <= CHAT.length && !stopped(); i++) {
          out.textContent = CHAT.slice(0, i);
          await sleep(34);
        }
        await sleep(4200);
      }
    })();
    return () => {
      ac.abort();
      window.clearTimeout(timer);
      setTyping(false);
    };
  }, [playing]);
  return (
    <GlassCard ref={ref} level={2} sheen={false} data-intro="card" className="home-mini home-chat">
      <Avatar name="Ada Lovelace" size="sm" />
      <div className="home-chat__bubble">
        <span className="home-chat__ghost">{CHAT}</span>
        <span ref={typed} className="home-chat__typed">
          {CHAT}
        </span>
        <span className="home-chat__dots" data-on={typing || undefined}>
          <i />
          <i />
          <i />
        </span>
      </div>
    </GlassCard>
  );
}

/** A toast that slides in, rests, and slides away on a long cycle (transform only; the cycle is CSS, paused off-screen). */
function ToastLive() {
  return (
    <div className="home-live-toast">
      <GlassCard level={3} sheen={false} data-intro="card" className="home-toast">
        <span className="home-toast__icon">
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">Deployed</span>
          <span className="block truncate text-xs text-sheen-fg-muted">example.com is live.</span>
        </span>
      </GlassCard>
    </div>
  );
}

const PEOPLE = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Torvalds"];

/** Four avatars that fan out of a stack and fold back in (transform only). */
function AvatarFan() {
  return (
    <div data-intro="card" className="home-mini home-fan" aria-hidden>
      {PEOPLE.map((name, i) => (
        <span key={name} className="home-fan__item" style={{ "--n": i } as CSSProperties}>
          <Avatar name={name} size="md" />
        </span>
      ))}
      <span className="home-fan__count">+12</span>
    </div>
  );
}
