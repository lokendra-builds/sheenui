// Motion engine + preferences: tokens, presets, the 30 Hz beat, motion gates, the pointer light,
// the preference store + inline script, and the provider's reduced-motion wiring.

import { useContext, useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";

import {
  budgetStagger,
  distance,
  duration,
  ease,
  exitTransition,
  follow,
  misc,
  scaleTo,
  spring,
  STAGGER_BUDGET,
  staggerStep,
  viewSpring,
} from "../../src/motion/tokens";
import { exit, fadeUp, hoverLift, press, scaleIn, stagger } from "../../src/motion/presets";
import {
  addAmbient,
  addFollower,
  markScrolling,
  setBeatRate,
  useAmbientBeat,
  useBeatFollower,
  wakeBeat,
} from "../../src/motion/beat";
import { useFinePointer, useLoopPlayback, useMotionGate } from "../../src/motion/gate";
import { sheenPointer, useSheenPointerLight } from "../../src/motion/pointer-light";
import { SheenMotionProvider } from "../../src/motion/provider";
import {
  isSheenStyle,
  readSheenStyle,
  sheenPreferenceScript,
  useGlassMode,
  useMotionPreference,
  useReducedTransparency,
  useSheenReducedMotion,
  useSheenStyle,
  useTheme,
} from "../../src/hooks/use-preferences";
import { MotionConfigContext } from "motion/react";
import { PHONE_QUERY } from "../../src/hooks/use-media-query";
import { frames } from "../helpers";

/** act() in its async form (it also flushes microtasks) around a synchronous change. */
const actAsync = (change: () => unknown) =>
  act(async () => {
    change();
    await Promise.resolve();
  });

type Listener = () => void;
type FakeMql = { matches: boolean; listeners: Set<Listener>; media: string };

/** Replace window.matchMedia for the queries named in `initial` (matched by substring); others pass through. */
function stubMedia(initial: Record<string, boolean>) {
  const real = window.matchMedia.bind(window);
  const lists = new Map<string, FakeMql>();
  for (const [key, matches] of Object.entries(initial)) lists.set(key, { matches, listeners: new Set(), media: key });
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
    const key = [...lists.keys()].find((k) => query.includes(k));
    if (!key) return real(query);
    const mql = lists.get(key)!;
    return {
      get matches() {
        return mql.matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_t: string, l: Listener) => mql.listeners.add(l),
      removeEventListener: (_t: string, l: Listener) => mql.listeners.delete(l),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  });
  return {
    set(key: string, matches: boolean) {
      const mql = lists.get(key)!;
      mql.matches = matches;
      mql.listeners.forEach((l) => l());
    },
    listeners: (key: string) => lists.get(key)!.listeners.size,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("motion tokens", () => {
  it("exposes the duration, easing, spring and follow token tables", () => {
    expect(duration.exit).toBeLessThan(duration.base);
    expect(duration.exitFast).toBeLessThan(duration.exit);
    expect(ease.out).toHaveLength(4);
    expect(spring.smooth).toMatchObject({ type: "spring", bounce: 0 });
    expect(spring.bouncy.bounce).toBeGreaterThan(spring.gentle.bounce);
    expect(follow.scroll.restDelta).toBe(0.001);
    expect(exitTransition).toEqual({ duration: duration.exit, ease: ease.exit });
    expect(distance.nudge).toBeLessThan(distance.rise);
    expect(scaleTo.press).toBeLessThan(1);
    expect(staggerStep.chars).toBeLessThan(staggerStep.sections);
  });

  it("budgetStagger never spreads a group over more than the budget", () => {
    const fn = budgetStagger(staggerStep.cards) as (i: number, total: number) => number;
    // Few children: the plain step.
    expect(fn(3, 4)).toBeCloseTo(3 * staggerStep.cards, 5);
    // Many children: the last one lands exactly on the budget.
    expect(fn(19, 20)).toBeCloseTo(STAGGER_BUDGET, 5);
    expect(fn(0, 20)).toBe(0);
    // A single child never divides by zero.
    expect(fn(0, 1)).toBe(0);
    expect(Number.isFinite(fn(1, 0))).toBe(true);
  });

  it("viewSpring hands the spring generator FUNCTION (not the string) to View Transitions", () => {
    const t = viewSpring({ visualDuration: 0.3, bounce: 0 }) as {
      type: unknown;
      visualDuration: number;
      bounce: number;
    };
    expect(typeof t.type).toBe("function");
    expect(t).toMatchObject({ visualDuration: 0.3, bounce: 0 });
  });

  it("the hero and handoff tilt are off on a phone-sized or touch-only screen, on otherwise", () => {
    stubMedia({ [PHONE_QUERY]: false });
    expect(misc.heroTilt).toBe(10);
    expect(misc.handoffTilt).toBe(8);
    expect(misc.tiltMax).toBe(6);
    expect(misc.textBlur).toBe(8);
    vi.restoreAllMocks();
    stubMedia({ [PHONE_QUERY]: true });
    expect(misc.heroTilt).toBe(0);
    expect(misc.handoffTilt).toBe(0);
  });
});

describe("motion presets", () => {
  it("fadeUp and scaleIn have a full and a reduced version; reduced keeps opacity only", () => {
    for (const preset of [fadeUp, scaleIn]) {
      expect(preset.full.hidden).toHaveProperty("opacity", 0);
      expect(preset.full.visible).toHaveProperty("opacity", 1);
      expect(preset.reduced.hidden).toEqual({ opacity: 0 });
      expect(preset.reduced.visible).toMatchObject({ opacity: 1 });
      expect(preset.full.exit.transition).toBe(exitTransition);
      expect(preset.reduced.exit.transition).toBe(exitTransition);
    }
    expect(fadeUp.full.hidden).toHaveProperty("y", 12);
    expect(scaleIn.full.hidden).toHaveProperty("scale", scaleTo.popFrom);
  });

  it("exit, hoverLift and press are ready-made targets", () => {
    expect(exit.full).toMatchObject({ opacity: 0, scale: 0.98 });
    expect(exit.reduced).toEqual({ opacity: 0, transition: exitTransition });
    expect(hoverLift.whileHover.y).toBe(-distance.nudge);
    expect(hoverLift.whileTap.scale).toBe(scaleTo.press);
    expect(press.whileTap.scale).toBe(scaleTo.press);
    expect(press.whileTap.transition).toMatchObject({ type: "spring", out: true });
  });

  it("stagger() delays children with a budgeted function", () => {
    const v = stagger();
    expect(v.hidden).toEqual({});
    const delay = (v.visible as { transition: { delayChildren: (i: number, n: number) => number } }).transition
      .delayChildren;
    expect(delay(2, 3)).toBeCloseTo(2 * staggerStep.items, 5);
    expect(delay(49, 50)).toBeCloseTo(STAGGER_BUDGET, 5);
    const custom = stagger(0.2).visible as { transition: { delayChildren: (i: number, n: number) => number } };
    expect(custom.transition.delayChildren(1, 2)).toBeCloseTo(0.2, 5);
  });
});

describe("the beat", () => {
  const toFake = [
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "performance",
    "setTimeout",
    "clearTimeout",
    "Date",
  ] as const;
  const offs: (() => void)[] = [];
  /** Remember an unsubscribe so a failing assertion cannot leave the shared loop running into the next test. */
  const track = (off: () => void) => {
    offs.push(off);
    return off;
  };

  const fake = () => vi.useFakeTimers({ toFake: [...toFake] });
  /** Let the rAF loop notice nothing is registered and stop itself, so the next test starts clean. */
  const drain = () => vi.advanceTimersByTime(3000);

  afterEach(() => {
    offs.splice(0).forEach((off) => off());
    if (vi.isFakeTimers()) drain();
    setBeatRate(30);
  });

  it("runs ambient callbacks ~30 times a second with a clamped dt, and stops when removed", () => {
    fake();
    const amb = vi.fn();
    const off = track(addAmbient(amb));
    vi.advanceTimersByTime(1000);
    expect(amb.mock.calls.length).toBeGreaterThan(20);
    expect(amb.mock.calls.length).toBeLessThanOrEqual(32);
    expect(amb.mock.calls[0]![1]).toBe(0);
    for (const [, dt] of amb.mock.calls) expect(dt).toBeLessThanOrEqual(0.1);
    off();
    const seen = amb.mock.calls.length;
    drain();
    expect(amb.mock.calls.length).toBe(seen);
  });

  it("followers ride along while the loop runs; wakeBeat alone keeps them running briefly, then the loop sleeps", () => {
    fake();
    const fol = vi.fn();
    track(addFollower(fol));
    vi.advanceTimersByTime(500);
    expect(fol).not.toHaveBeenCalled();
    wakeBeat(300);
    vi.advanceTimersByTime(250);
    expect(fol.mock.calls.length).toBeGreaterThan(3);
    expect(fol.mock.calls[0]![1]).toBe(0);
    vi.advanceTimersByTime(1000);
    const after = fol.mock.calls.length;
    vi.advanceTimersByTime(1000);
    expect(fol.mock.calls.length).toBe(after);
  });

  it("setBeatRate changes the rate and clamps it to 1..60 fps", () => {
    fake();
    const amb = vi.fn();
    setBeatRate(10);
    const off = track(addAmbient(amb));
    vi.advanceTimersByTime(1000);
    expect(amb.mock.calls.length).toBeGreaterThanOrEqual(8);
    expect(amb.mock.calls.length).toBeLessThanOrEqual(11);
    off();
    drain();
    amb.mockClear();
    setBeatRate(1000); // clamps to 60 fps: every frame
    const off2 = track(addAmbient(amb));
    vi.advanceTimersByTime(1000);
    expect(amb.mock.calls.length).toBeGreaterThan(50);
    off2();
    drain();
    amb.mockClear();
    setBeatRate(-5); // clamps to 1 fps
    track(addAmbient(amb));
    vi.advanceTimersByTime(2500);
    expect(amb.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it("ambient loops skip beats while the page scrolls: every 2nd on a mouse screen, every 4th on touch", () => {
    // beat.ts reads (pointer: coarse) once and keeps the list, so the stub must exist before the first scroll.
    const media = stubMedia({ "pointer: coarse": false });
    fake();
    const amb = vi.fn();
    track(addAmbient(amb));
    vi.advanceTimersByTime(1000);
    const free = amb.mock.calls.length;

    amb.mockClear();
    markScrolling(1000);
    vi.advanceTimersByTime(1000);
    const mouse = amb.mock.calls.length;
    expect(mouse).toBeLessThan(free * 0.7);
    expect(mouse).toBeGreaterThan(free * 0.3);

    media.set("pointer: coarse", true);
    amb.mockClear();
    markScrolling(1000);
    vi.advanceTimersByTime(1000);
    const touch = amb.mock.calls.length;
    expect(touch).toBeLessThan(mouse);
    expect(touch).toBeGreaterThan(0);
    media.set("pointer: coarse", false);
  });

  it("owns one scroll listener while it runs: a scroll event throttles the ambient loop for ~150 ms", () => {
    fake();
    const amb = vi.fn();
    const off = track(addAmbient(amb));
    vi.advanceTimersByTime(300);
    amb.mockClear();
    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(100);
    }
    const scrolled = amb.mock.calls.length;
    expect(scrolled).toBeLessThan(22);
    expect(scrolled).toBeGreaterThan(5);
    off();
    drain();
    // The listener is gone once the loop sleeps: a scroll no longer matters (and nothing throws).
    window.dispatchEvent(new Event("scroll"));
  });

  it("useAmbientBeat / useBeatFollower use the latest callback and honour `on`", () => {
    fake();
    const first = vi.fn();
    const second = vi.fn();
    const fol = vi.fn();
    const { rerender, unmount } = renderHook(({ cb, on }) => useAmbientBeat(cb, on), {
      initialProps: { cb: first, on: true },
    });
    const f = renderHook(({ on }) => useBeatFollower(fol, on), { initialProps: { on: true } });
    track(unmount);
    track(f.unmount);
    vi.advanceTimersByTime(300);
    expect(first).toHaveBeenCalled();
    expect(fol).toHaveBeenCalled();
    rerender({ cb: second, on: true });
    first.mockClear();
    vi.advanceTimersByTime(300);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
    rerender({ cb: second, on: false });
    f.rerender({ on: false });
    second.mockClear();
    fol.mockClear();
    vi.advanceTimersByTime(500);
    expect(second).not.toHaveBeenCalled();
    expect(fol).not.toHaveBeenCalled();
  });
});

describe("motion gate", () => {
  it("useFinePointer follows (hover: hover) and (pointer: fine) live and unsubscribes", async () => {
    const media = stubMedia({ "pointer: fine": true });
    const { result, unmount } = renderHook(() => useFinePointer());
    expect(result.current).toBe(true);
    await actAsync(() => media.set("pointer: fine", false));
    expect(result.current).toBe(false);
    expect(media.listeners("pointer: fine")).toBe(1);
    unmount();
    expect(media.listeners("pointer: fine")).toBe(0);
  });

  it("useMotionGate: pointer effects need a fine pointer and motion; rich effects also need full glass", async () => {
    const media = stubMedia({ "pointer: fine": true });
    const { result } = renderHook(() => useMotionGate());
    expect(result.current).toEqual({ reduced: false, pointerFx: true, richFx: true });

    await actAsync(() => media.set("pointer: fine", false));
    expect(result.current).toMatchObject({ pointerFx: false, richFx: true });

    await actAsync(() => media.set("pointer: fine", true));
    await actAsync(() => document.documentElement.setAttribute("data-glass", "lite"));
    expect(result.current).toMatchObject({ reduced: false, pointerFx: true, richFx: false });

    await actAsync(() => {
      document.documentElement.setAttribute("data-glass", "full");
      document.documentElement.setAttribute("data-motion", "reduced");
    });
    expect(result.current).toEqual({ reduced: true, pointerFx: false, richFx: false });
  });

  function Loop({ paused }: { paused?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const on = useLoopPlayback(ref, { paused });
    return <div ref={ref} data-testid="loop" data-on={String(on)} style={{ height: 20, width: 20 }} />;
  }

  it("useLoopPlayback is true only when visible, not paused, motion allowed and the tab is shown", async () => {
    const view = render(<Loop />);
    await expect.poll(() => screen.getByTestId("loop").dataset.on).toBe("true");

    view.rerender(<Loop paused />);
    await expect.poll(() => screen.getByTestId("loop").dataset.on).toBe("false");
    view.rerender(<Loop />);
    await expect.poll(() => screen.getByTestId("loop").dataset.on).toBe("true");

    await actAsync(() => document.documentElement.setAttribute("data-motion", "reduced"));
    await expect.poll(() => screen.getByTestId("loop").dataset.on).toBe("false");
    await actAsync(() => document.documentElement.removeAttribute("data-motion"));
    await expect.poll(() => screen.getByTestId("loop").dataset.on).toBe("true");

    // Hidden tab.
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    await actAsync(() => void document.dispatchEvent(new Event("visibilitychange")));
    await expect.poll(() => screen.getByTestId("loop").dataset.on).toBe("false");
  });

  it("useLoopPlayback is false for an element far off screen", async () => {
    render(
      <div>
        <div style={{ height: 6000 }} />
        <Loop />
      </div>,
    );
    await frames(10);
    expect(screen.getByTestId("loop").dataset.on).toBe("false");
  });
});

describe("pointer light", () => {
  function Light({ on = true }: { on?: boolean }) {
    useSheenPointerLight(on);
    return null;
  }
  const box = (
    id: string,
    left: number,
    top: number,
    extra: Record<string, string> = {},
    cls = "glass-2",
    w = 200,
    h = 100,
  ) => (
    <div
      key={id}
      data-testid={id}
      className={cls}
      {...extra}
      style={{ position: "fixed", left, top, width: w, height: h }}
    />
  );
  const move = (x: number, y: number, pointerType = "mouse") =>
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType, bubbles: true }));
  const lit = (id: string) => screen.getByTestId(id).hasAttribute("data-sheen-lit");

  it("lights the glass surface under the pointer (position, angle, strength) and leaves far ones alone", async () => {
    render(
      <>
        <Light />
        {box("near", 100, 100)}
        {box("far", 800, 600)}
        {box("off", 100, 250, { "data-sheen-light": "off" })}
      </>,
    );
    move(150, 150);
    await expect.poll(() => lit("near"), { timeout: 4000 }).toBe(true);
    const near = screen.getByTestId("near");
    expect(near.style.getPropertyValue("--sheen-mx")).toBe("50.0px");
    expect(near.style.getPropertyValue("--sheen-my")).toBe("50.0px");
    expect(near.style.getPropertyValue("--sheen-ra")).toMatch(/deg$/);
    expect(Number(near.style.getPropertyValue("--sheen-lit"))).toBeGreaterThan(0.4);
    expect(lit("far")).toBe(false);
    expect(lit("off")).toBe(false);
    expect(sheenPointer.on).toBe(true);
    expect(sheenPointer.x).toBeCloseTo(150 / window.innerWidth, 3);
    expect(sheenPointer.y).toBeCloseTo(150 / window.innerHeight, 3);
  });

  it("ignores touch, text fields and surfaces with no size; lights at most 6 at once", async () => {
    render(
      <>
        <Light />
        {Array.from({ length: 9 }, (_, i) => box(`g${i}`, 100 + i * 4, 100 + i * 4))}
        {box("tiny", 100, 100, {}, "glass-3", 1, 1)}
        <input
          data-testid="field"
          data-sheen-light=""
          style={{ position: "fixed", left: 100, top: 100, width: 50, height: 20 }}
        />
        <textarea
          data-testid="area"
          data-sheen-light=""
          style={{ position: "fixed", left: 100, top: 130, width: 50, height: 20 }}
        />
      </>,
    );
    move(120, 120, "touch");
    await frames(13);
    expect(document.querySelectorAll("[data-sheen-lit]")).toHaveLength(0);
    move(120, 120);
    await expect.poll(() => document.querySelectorAll("[data-sheen-lit]").length, { timeout: 4000 }).toBe(6);
    expect(lit("tiny")).toBe(false);
    expect(lit("field")).toBe(false);
    expect(lit("area")).toBe(false);
  });

  it("a fast flick flares the whole page for a moment; leaving the window eases the light back out", async () => {
    render(
      <>
        <Light />
        {box("s", 300, 300)}
      </>,
    );
    move(10, 10);
    move(900, 700);
    expect(document.documentElement).toHaveAttribute("data-sheen-flare");
    await expect.poll(() => document.documentElement.hasAttribute("data-sheen-flare"), { timeout: 2000 }).toBe(false);

    move(350, 350);
    await expect.poll(() => lit("s"), { timeout: 4000 }).toBe(true);
    // Moving to another element inside the page (relatedTarget set) keeps the light on.
    document.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, relatedTarget: document.body }));
    expect(sheenPointer.on).toBe(true);
    // Leaving the window (no relatedTarget) turns it off and the surface rests again.
    document.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, relatedTarget: null }));
    expect(sheenPointer.on).toBe(false);
    await expect.poll(() => lit("s"), { timeout: 4000 }).toBe(false);
    expect(screen.getByTestId("s").style.getPropertyValue("--sheen-lit")).toBe("");
  });

  it("re-measures after a scroll or resize, fades surfaces that fall out of reach, and cleans up on unmount", async () => {
    const view = render(
      <>
        <Light />
        {box("a", 100, 100)}
        {box("b", 700, 100)}
      </>,
    );
    move(150, 150);
    await expect.poll(() => lit("a"), { timeout: 4000 }).toBe(true);
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    move(750, 150);
    await expect.poll(() => lit("b"), { timeout: 4000 }).toBe(true);
    await expect.poll(() => lit("a"), { timeout: 4000 }).toBe(false);
    view.unmount();
    expect(document.querySelectorAll("[data-sheen-lit]")).toHaveLength(0);
    expect(sheenPointer.on).toBe(false);
  });

  it("does nothing when disabled", async () => {
    render(
      <>
        <Light on={false} />
        {box("x", 100, 100)}
      </>,
    );
    move(150, 150);
    await frames(13);
    expect(lit("x")).toBe(false);
  });
});

describe("preference store", () => {
  const html = document.documentElement;

  it("useTheme reads, writes and clears html[data-theme] and localStorage", async () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
    await actAsync(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("sheen:theme")).toBe("dark");
    await actAsync(() => result.current.setTheme("light"));
    expect(html).toHaveAttribute("data-theme", "light");
    await actAsync(() => result.current.setTheme("system"));
    expect(html).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem("sheen:theme")).toBeNull();
  });

  it("transparency, motion and glass toggles map to their attribute values", async () => {
    const t = renderHook(() => useReducedTransparency());
    const m = renderHook(() => useMotionPreference());
    const g = renderHook(() => useGlassMode());
    expect([t.result.current[0], m.result.current[0], g.result.current[0]]).toEqual([false, false, false]);
    await actAsync(() => t.result.current[1](true));
    await actAsync(() => m.result.current[1](true));
    await actAsync(() => g.result.current[1](true));
    expect(html).toHaveAttribute("data-transparency", "reduced");
    expect(html).toHaveAttribute("data-motion", "reduced");
    expect(html).toHaveAttribute("data-glass", "lite");
    expect([t.result.current[0], m.result.current[0], g.result.current[0]]).toEqual([true, true, true]);
    expect(localStorage.getItem("sheen:glass")).toBe("lite");
    await actAsync(() => t.result.current[1](false));
    await actAsync(() => m.result.current[1](false));
    await actAsync(() => g.result.current[1](false));
    expect(html).not.toHaveAttribute("data-transparency");
    expect(html).not.toHaveAttribute("data-motion");
    // Turning Lite off is a saved choice ("full"), not a return to automatic.
    expect(html).toHaveAttribute("data-glass", "full");
    expect(localStorage.getItem("sheen:glass")).toBe("full");
  });

  it("useSheenStyle / readSheenStyle / isSheenStyle fall back to Liquid for anything unknown", async () => {
    const { result } = renderHook(() => useSheenStyle());
    expect(result.current.style).toBe("liquid");
    await actAsync(() => result.current.setStyle("aurora"));
    expect(result.current.style).toBe("aurora");
    expect(readSheenStyle()).toBe("aurora");
    expect(localStorage.getItem("sheen:style")).toBe("aurora");
    await actAsync(() => html.setAttribute("data-sheen-style", "holo"));
    expect(result.current.style).toBe("liquid");
    expect(readSheenStyle()).toBe("liquid");
    expect(isSheenStyle("liquid")).toBe(true);
    expect(isSheenStyle("aurora")).toBe(true);
    expect(isSheenStyle("holo")).toBe(false);
    expect(isSheenStyle(null)).toBe(false);
    expect(isSheenStyle(3)).toBe(false);
  });

  it("an attribute changed from outside (the inline script, devtools) updates every subscriber", async () => {
    const a = renderHook(() => useTheme());
    const b = renderHook(() => useTheme());
    html.setAttribute("data-theme", "dark");
    await expect.poll(() => [a.result.current.theme, b.result.current.theme]).toEqual(["dark", "dark"]);
    a.unmount();
    b.unmount();
  });

  it("another tab's change arrives as a storage event and is applied; foreign or invalid keys are ignored", async () => {
    const { result } = renderHook(() => useTheme());
    const style = renderHook(() => useSheenStyle());
    const fire = (key: string | null, newValue: string | null) =>
      actAsync(() => void window.dispatchEvent(new StorageEvent("storage", { key, newValue })));
    await fire("sheen:theme", "dark");
    expect(result.current.theme).toBe("dark");
    await fire("sheen:theme", null);
    expect(result.current.theme).toBe("system");
    await fire("sheen:style", "aurora");
    expect(style.result.current.style).toBe("aurora");
    await fire("sheen:style", "nonsense");
    expect(style.result.current.style).toBe("liquid");
    await fire(null, null); // localStorage.clear() in another tab
    await fire("other:theme", "dark");
    await fire("sheen:bogus", "x");
    expect(result.current.theme).toBe("system");
    expect(html).not.toHaveAttribute("data-bogus");
  });

  it("still applies the attribute when storage is blocked (private mode)", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "QuotaExceededError");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { result } = renderHook(() => useTheme());
    await actAsync(() => result.current.setTheme("dark"));
    expect(html).toHaveAttribute("data-theme", "dark");
    await actAsync(() => result.current.setTheme("system"));
    expect(html).not.toHaveAttribute("data-theme");
  });

  it("useSheenReducedMotion is the OS setting OR the app switch, read live", async () => {
    const media = stubMedia({ "prefers-reduced-motion": false });
    const { result, unmount } = renderHook(() => useSheenReducedMotion());
    expect(result.current).toBe(false);
    await actAsync(() => media.set("prefers-reduced-motion", true));
    expect(result.current).toBe(true);
    await actAsync(() => media.set("prefers-reduced-motion", false));
    expect(result.current).toBe(false);
    await actAsync(() => html.setAttribute("data-motion", "reduced"));
    expect(result.current).toBe(true);
    unmount();
    expect(media.listeners("prefers-reduced-motion")).toBe(0);
  });
});

describe("sheenPreferenceScript (inline, pre-hydration)", () => {
  // The inline script is a string by design (it runs in <head> before React), so the test evaluates it the same way.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return -- evaluating the shipped inline-script string is the point of the test
  const run = () => new Function(sheenPreferenceScript)();
  const html = document.documentElement;

  it("restores the saved theme, motion, transparency, glass and style onto <html>", () => {
    localStorage.setItem("sheen:theme", "dark");
    localStorage.setItem("sheen:motion", "reduced");
    localStorage.setItem("sheen:transparency", "reduced");
    localStorage.setItem("sheen:glass", "lite");
    localStorage.setItem("sheen:style", "aurora");
    run();
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(html).toHaveAttribute("data-motion", "reduced");
    expect(html).toHaveAttribute("data-transparency", "reduced");
    expect(html).toHaveAttribute("data-glass", "lite");
    expect(html).toHaveAttribute("data-sheen-style", "aurora");
  });

  it("defaults to Liquid for a missing or unknown style and sets nothing for unsaved prefs", () => {
    run();
    expect(html).toHaveAttribute("data-sheen-style", "liquid");
    expect(html).not.toHaveAttribute("data-theme");
    localStorage.setItem("sheen:style", "holo");
    run();
    expect(html).toHaveAttribute("data-sheen-style", "liquid");
  });

  it("falls back to Liquid when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    html.removeAttribute("data-sheen-style");
    run();
    expect(html).toHaveAttribute("data-sheen-style", "liquid");
  });
});

describe("SheenMotionProvider", () => {
  /** Reads the MotionConfig the provider sets up. */
  function Probe() {
    const cfg = useContext(MotionConfigContext);
    return (
      <output
        data-testid="cfg"
        data-reduced={cfg.reducedMotion}
        data-skip={String(!!cfg.skipAnimations)}
        data-nonce={cfg.nonce}
        data-spring={(cfg.transition as { type?: string } | undefined)?.type}
      />
    );
  }
  const cfg = () => screen.getByTestId("cfg").dataset;

  it('follows the OS setting ("user") by default, uses the smooth spring and does not skip animations', () => {
    render(
      <SheenMotionProvider>
        <Probe />
      </SheenMotionProvider>,
    );
    expect(cfg().reduced).toBe("user");
    expect(cfg().spring).toBe("spring");
    expect(cfg().skip).toBe("false");
  });

  it("forces reducedMotion=always when the app switch is on, live, and passes the CSP nonce", async () => {
    const view = render(
      <SheenMotionProvider nonce="abc">
        <Probe />
      </SheenMotionProvider>,
    );
    expect(cfg().nonce).toBe("abc");
    await actAsync(() => document.documentElement.setAttribute("data-motion", "reduced"));
    expect(cfg().reduced).toBe("always");
    await actAsync(() => document.documentElement.removeAttribute("data-motion"));
    expect(cfg().reduced).toBe("user");
    view.unmount();
  });

  it("forces reducedMotion=always when the OS asks for reduced motion", () => {
    stubMedia({ "prefers-reduced-motion": true });
    render(
      <SheenMotionProvider>
        <Probe />
      </SheenMotionProvider>,
    );
    expect(cfg().reduced).toBe("always");
  });

  it("skipAnimations skips every animation (visual snapshots); the URL is never read and the default is off", () => {
    history.replaceState(null, "", "?snapshot=1");
    try {
      const view = render(
        <SheenMotionProvider>
          <Probe />
        </SheenMotionProvider>,
      );
      expect(cfg().skip).not.toBe("true");
      view.unmount();
      render(
        <SheenMotionProvider skipAnimations>
          <Probe />
        </SheenMotionProvider>,
      );
      expect(cfg().skip).toBe("true");
    } finally {
      history.replaceState(null, "", location.pathname);
    }
  });
});
