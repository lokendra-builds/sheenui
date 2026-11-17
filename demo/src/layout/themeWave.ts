import { ease, useSheenReducedMotion, useTheme, type ThemeChoice } from "@sheenui/theme";

/**
 * Theme switch as a wave of light: the new theme grows out of `origin` (the control that was
 * used) as a circle over the old one. One View Transition of the root, so both snapshots are flat images and
 * glass keeps its blur. Reduced motion, or no View Transitions: the theme swaps at once.
 *
 *   const { theme, sweepTo } = useThemeWave();
 *   <button onClick={(e) => sweepTo("dark", e.currentTarget)}>Dark</button>
 */
let waves = 0;

/**
 * Motion's View Transition builder is only needed once a person switches theme, so it is not in the entry: it is
 * fetched on the first press or key (and on first use if the click comes first) and shared by every later wave.
 */
const loadViewBuilder = () => import("./view-builder").then((module) => module.animateView);
let viewBuilder: ReturnType<typeof loadViewBuilder> | undefined;
const whenViewBuilder = () => (viewBuilder ??= loadViewBuilder());
if (typeof window !== "undefined") {
  // The first press or key anywhere starts the download (a theme click follows a press by ~100 ms), so a page that is
  // only read never fetches it and nothing runs while the page loads.
  const prefetch = () => void whenViewBuilder();
  for (const type of ["pointerdown", "keydown", "touchstart"]) {
    window.addEventListener(type, prefetch, { once: true, passive: true });
  }
}

export function useThemeWave() {
  const { theme, setTheme } = useTheme();
  const reduced = useSheenReducedMotion();

  function sweepTo(next: ThemeChoice, origin?: Element | null) {
    const from = origin ?? document.activeElement;
    if (reduced || typeof document.startViewTransition !== "function" || !from) {
      setTheme(next);
      return;
    }
    const box = from.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
    const root = document.documentElement;
    const clear = () => root.removeAttribute("data-theme-wave");
    root.setAttribute("data-theme-wave", "");
    // The builder resolves once the transition is set up (its animations exist from then on): the wave is over when
    // every view-transition animation has finished (no timer guessing how long it takes). A second toggle during the
    // first wave is queued behind it: only the LAST wave clears the flag.
    const mine = ++waves;
    const clearIfLast = () => {
      if (mine === waves) clear();
    };
    const whenOver = () => {
      const running = document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition"));
      void Promise.allSettled(running.map((a) => a.finished)).then(clearIfLast);
    };
    void whenViewBuilder().then(
      (animateView) =>
        animateView(() => setTheme(next))
          .new(
            { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
            { duration: 0.6, ease: ease.out },
          )
          .then(whenOver, clearIfLast),
      () => {
        clearIfLast();
        setTheme(next);
      },
    );
  }

  return { theme, sweepTo };
}
