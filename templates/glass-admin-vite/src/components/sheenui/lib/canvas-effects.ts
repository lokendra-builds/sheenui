"use client";

/**
 * Small helpers shared by the canvas and scattered-element effects (Particles, Confetti, Meteors): how many
 * pieces a device can afford, a seeded random source so server and client markup agree, and a way to read a
 * `--sheen-*` token as a colour a canvas can paint with.
 */

import { useSyncExternalStore } from "react";

type DeviceHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/**
 * Share (0..1] of the requested particle count this device should draw: halved on low memory, on few cores or when
 * the visitor asked to save data. Always 1 on the server.
 *
 * @internal Used by the effect components; not part of the public barrel.
 */
export function deviceBudget(): number {
  if (typeof navigator === "undefined") return 1;
  const nav = navigator as DeviceHints;
  const weak =
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) ||
    nav.connection?.saveData === true;
  return weak ? 0.5 : 1;
}

/**
 * A small deterministic random generator (mulberry32): the same seed gives the same numbers on the server and in the
 * browser, so scattered decoration hydrates without a mismatch.
 *
 * @internal Used by the effect components; not part of the public barrel.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Resolves any CSS colour (a `var(--sheen-accent)` token, a `light-dark()` pair, `currentColor`) to the colour
 * the browser paints right now, as a string a 2D canvas accepts.
 *
 * @internal Used by the effect components; not part of the public barrel.
 */
export function resolveCssColor(host: Element, value: string): string {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || "transparent";
}

/**
 * Calls `onChange` whenever the colours a token resolves to may have changed: the theme or style preset
 * attribute on `<html>`, or the OS colour scheme. Returns the cleanup.
 *
 * @internal Used by the effect components; not part of the public barrel.
 */
export function watchColorScheme(onChange: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-sheen-style", "class", "style"],
  });
  const media = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
  media?.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media?.removeEventListener("change", onChange);
  };
}

const subscribeNever = () => () => undefined;

/**
 * `false` while rendering on the server and during hydration, `true` once the component runs in the browser. Lets an
 * effect keep the server markup plain (fully readable, no scattered pieces) and switch on after hydration without a
 * state write inside an effect.
 *
 * @internal Used by the effect components; not part of the public barrel.
 * @example
 * ```tsx
 * import { useHydrated } from "./canvas-effects";
 *
 * export function Greeting() {
 *   return <p>{useHydrated() ? "Hello from the browser" : "Hello"}</p>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
