// startRouteTransition / riseIn against a controllable document.startViewTransition: the instant path, the transition
// path (flag on #main, types, timeout, skip of a running one, cleanup) and the Motion fallback.

import { afterEach, describe, expect, it, vi } from "vitest";

import { holdFor } from "../helpers";
import {
  isMotionReduced,
  riseIn,
  startRouteTransition,
  supportsViewTransitions,
} from "../../src/motion/route-transition";

type Fake = {
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

const original = Object.getOwnPropertyDescriptor(Document.prototype, "startViewTransition");

/** Install a fake startViewTransition; `finish()` ends the latest transition, `reject()` fails its promises. */
function installFake() {
  const created: {
    update: () => Promise<void>;
    types?: string[];
    finish: () => void;
    skip: ReturnType<typeof vi.fn>;
  }[] = [];
  const fn = vi.fn((arg: (() => Promise<void>) | { update: () => Promise<void>; types: string[] }) => {
    const update = typeof arg === "function" ? arg : arg.update;
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => (finish = resolve));
    const skip = vi.fn();
    const transition: Fake = {
      ready: Promise.resolve(),
      updateCallbackDone: Promise.reject(new Error("skipped")),
      finished,
      skipTransition: skip,
    };
    created.push({ update, ...(typeof arg === "function" ? {} : { types: arg.types }), finish, skip });
    return transition;
  });
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: fn });
  return { fn, created };
}

afterEach(() => {
  delete (document as unknown as Record<string, unknown>).startViewTransition;
  if (original) Object.defineProperty(Document.prototype, "startViewTransition", original);
  document.documentElement.removeAttribute("data-motion");
  document.getElementById("main")?.remove();
});

describe("startRouteTransition", () => {
  it("runs the update at once and returns false when motion is reduced", () => {
    const { fn } = installFake();
    const update = vi.fn();
    expect(startRouteTransition(update, { reduced: true })).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
    expect(fn).not.toHaveBeenCalled();
  });

  it("runs the update at once without View Transitions", () => {
    delete (document as unknown as Record<string, unknown>).startViewTransition;
    Object.defineProperty(document, "startViewTransition", { configurable: true, value: undefined });
    expect(supportsViewTransitions()).toBe(false);
    const update = vi.fn();
    expect(startRouteTransition(update, { reduced: false })).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("starts a transition, flags #main while it runs and clears the flag when it finishes", async () => {
    const main = document.createElement("main");
    main.id = "main";
    document.body.append(main);
    const { fn, created } = installFake();
    expect(supportsViewTransitions()).toBe(true);
    const update = vi.fn();
    expect(startRouteTransition(update, { reduced: false })).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(main).toHaveAttribute("data-route-transition");
    await created[0]!.update();
    expect(update).toHaveBeenCalledTimes(1);
    created[0]!.finish();
    await expect.poll(() => main.hasAttribute("data-route-transition")).toBe(false);
  });

  it("flags <html> when there is no #main, and passes transition types", async () => {
    const { created } = installFake();
    startRouteTransition(() => undefined, { reduced: false, types: ["back"] });
    expect(document.documentElement).toHaveAttribute("data-route-transition");
    expect(created[0]!.types).toEqual(["back"]);
    created[0]!.finish();
    await expect.poll(() => document.documentElement.hasAttribute("data-route-transition")).toBe(false);
  });

  it("a newer navigation skips the running transition and keeps the flag until the last one finishes", async () => {
    const { created } = installFake();
    startRouteTransition(() => undefined, { reduced: false });
    startRouteTransition(() => undefined, { reduced: false });
    expect(created[0]!.skip).toHaveBeenCalledTimes(1);
    created[0]!.finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(document.documentElement).toHaveAttribute("data-route-transition");
    created[1]!.finish();
    await expect.poll(() => document.documentElement.hasAttribute("data-route-transition")).toBe(false);
  });

  it("does not hold the old frame longer than timeoutMs when the update never resolves", async () => {
    const { created } = installFake();
    startRouteTransition(() => new Promise<void>(() => undefined), { reduced: false, timeoutMs: 20 });
    const started = performance.now();
    await created[0]!.update();
    expect(performance.now() - started).toBeLessThan(1000);
    created[0]!.finish();
  });

  it("falls back to the plain update when startViewTransition throws", () => {
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: () => {
        throw new Error("nope");
      },
    });
    const update = vi.fn();
    expect(startRouteTransition(update, { reduced: false })).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
    expect(document.documentElement).not.toHaveAttribute("data-route-transition");
  });
});

describe("isMotionReduced", () => {
  it("is true when <html> says data-motion=reduced", () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    expect(isMotionReduced()).toBe(true);
  });
});

describe("riseIn", () => {
  it("lifts the element with the Web Animations API where View Transitions are missing, leaving no inline transform", async () => {
    Object.defineProperty(document, "startViewTransition", { configurable: true, value: undefined });
    const el = document.createElement("div");
    document.body.append(el);
    const animate = vi.spyOn(el, "animate");
    riseIn(el, { distance: 8, duration: 0.02 });
    expect(animate).toHaveBeenCalledWith(
      { transform: ["translateY(8px)", "translateY(0px)"] },
      expect.objectContaining({ duration: 20, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }),
    );
    await expect.poll(() => el.style.transform, { timeout: 3000 }).toMatch(/^(|translateY\(0(px)?\))$/);
    // A second rise cancels the first without throwing.
    riseIn(el, { duration: 0.02 });
    riseIn(el, { duration: 0.02 });
    await expect.poll(() => el.style.transform, { timeout: 3000 }).toMatch(/^(|translateY\(0(px)?\))$/);
    el.remove();
  });

  it("does nothing for null, with View Transitions, or under reduced motion", async () => {
    const el = document.createElement("div");
    riseIn(null);
    installFake();
    riseIn(el);
    delete (document as unknown as Record<string, unknown>).startViewTransition;
    document.documentElement.setAttribute("data-motion", "reduced");
    riseIn(el);
    await holdFor(100);
    expect(el.style.transform).toBe("");
  });
});
