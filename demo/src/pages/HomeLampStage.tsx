import { wait } from "../demo-utils";
import { setHeroStoryPlaying } from "../hero-story";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Button, GlassLogin, LampLogin, SegmentedControl, duration, staggerStep, useMotionGate } from "@sheenui/theme";

/*
 * The home hero's stage (its own chunk, fetched after hydration): the real LampLogin block plays a
 * 5-6 s story once, and a "Lamp / Simple" switch swaps it for the plain GlassLogin card on the same spot.
 *
 * The story drives the real components from outside, so the library needs no demo props and nothing takes focus:
 *   - the cord is clicked with `button.click()` (a click does not focus), the lamp swings and the cone grows as usual;
 *   - the fields are filled with the native value setter + an `input` event (React's onChange runs, no focus is moved);
 *   - the form is sent with `form.requestSubmit()`; the button shows its own loading spinner.
 * Any focus, pointer or key use inside the stage ends the story at once, so the card is the visitor's from then on.
 * The clock stands still while the stage is off-screen, the tab is hidden or "Pause motion" is on. Reduced motion shows the final frame
 * (lamp on, filled, signed in) without any clock.
 */

/** One beat of the choreography = the slow token (0.35 s); a keystroke = twice the word stagger. */
const beat = (n: number) => n * duration.slow;
const TYPE = staggerStep.words * 2;
const EMAIL = "ava@example.com";
const PASSWORD = "sheen-glass";

type Mode = "lamp" | "simple";
type Phase = "idle" | "working" | "done";

const MODES = [
  { value: "lamp", label: "Lamp" },
  { value: "simple", label: "Simple" },
];

/** Marks the stage as playing or idle (a plain function, so the hook rules see no write to a hook argument). */
function setStory(host: HTMLElement, state: "playing" | "idle") {
  host.dataset.story = state;
  // While the script drives the card it is inert (no tab stops, hidden from assistive technology, no stray clicks);
  // the first press on it, or the story ending, hands it to the visitor.
  host.inert = state === "playing";
  setHeroStoryPlaying(state === "playing");
}

/** Sets an input's value the way typing does (React's onChange runs) without focusing it. */
function setField(host: HTMLElement | null, name: string, value: string) {
  const input = host?.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) return;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

/** The steps of the story as [seconds, action] pairs, in order. Total about 5.6 s. */
function script(host: HTMLElement, typing: (field: "" | "email" | "password") => void): [number, () => void][] {
  const steps: [number, () => void][] = [];
  const at = (s: number, fn: () => void) => steps.push([s, fn]);
  at(beat(3), () => host.querySelector<HTMLButtonElement>("button[aria-pressed]")?.click());
  let t = beat(3) + beat(4);
  at(t, () => typing("email"));
  Array.from({ length: EMAIL.length }).forEach((_, i) =>
    at(t + beat(0.5) + i * TYPE, () => setField(host, "email", EMAIL.slice(0, i + 1))),
  );
  t += beat(0.5) + EMAIL.length * TYPE + beat(0.5);
  at(t, () => typing("password"));
  Array.from({ length: PASSWORD.length }).forEach((_, i) =>
    at(t + beat(0.5) + i * TYPE, () => setField(host, "password", PASSWORD.slice(0, i + 1))),
  );
  t += beat(0.5) + PASSWORD.length * TYPE + beat(1);
  at(t, () => {
    typing("");
    host.querySelector("form")?.requestSubmit();
  });
  return steps;
}

/**
 * Plays the story once per `run` (and the final frame under reduced motion). Returns nothing: the story only touches
 * the DOM of `host` and reports through `typing`.
 */
function useStory(
  host: HTMLElement | null,
  run: number,
  active: boolean,
  reduced: boolean,
  typing: (field: "" | "email" | "password") => void,
  heroRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!host || !active) return;
    if (reduced) {
      // The real final frame of the story's first half: the lamp is on (LampLogin starts lit under reduced motion)
      // and the form is filled, ready to send. Nothing claims a sign-in that never happened.
      setField(host, "email", EMAIL);
      setField(host, "password", PASSWORD);
      return;
    }
    const stage: HTMLElement = host;
    let tasks = script(stage, typing);
    let clock = 0;
    let prev = performance.now();
    let raf = 0;
    setStory(host, "playing");
    // On a phone the stage starts below the fold: the clock waits until it is in view.
    let visible = typeof IntersectionObserver === "undefined";
    const isHeld = () => !visible || document.hidden || !!heroRef.current?.hasAttribute("data-paused");
    // While held (off-screen, hidden tab, paused) no frame is requested at all; the listeners below wake the pump again.
    const kick = () => {
      if (raf || !tasks.length || isHeld()) return;
      raf = requestAnimationFrame(() => {
        prev = performance.now();
        raf = requestAnimationFrame(pump);
      });
    };
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((e) => {
            visible = e.some((x) => x.isIntersecting);
            kick();
          });
    io?.observe(host);
    const watchPaused = typeof MutationObserver === "undefined" || !heroRef.current ? null : new MutationObserver(kick);
    if (heroRef.current) watchPaused?.observe(heroRef.current, { attributes: true, attributeFilter: ["data-paused"] });
    document.addEventListener("visibilitychange", kick);
    const stop = () => {
      tasks = [];
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      typing("");
      setStory(host, "idle");
      io?.disconnect();
      watchPaused?.disconnect();
      document.removeEventListener("visibilitychange", kick);
    };
    function pump(now: number) {
      raf = 0;
      if (isHeld()) {
        prev = now;
        return;
      }
      clock += Math.max(0, Math.min(100, now - prev)) / 1000;
      prev = now;
      const due = tasks.filter(([s]) => s <= clock);
      tasks = tasks.filter(([s]) => s > clock);
      due.forEach(([, fn]) => fn());
      if (tasks.length) raf = requestAnimationFrame(pump);
      else setStory(stage, "idle");
    }
    // The idle frame paints first, then the clock starts.
    kick();
    // The visitor takes over: a press on the card (an inert box is not hit, so the press lands on its parent) ends the
    // story where it is and makes the card interactive. The press itself is not replayed: the next one is theirs.
    const parent = host.parentElement;
    const takeOver = (event: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom)
        stop();
    };
    parent?.addEventListener("pointerdown", takeOver);
    return () => {
      parent?.removeEventListener("pointerdown", takeOver);
      stop();
    };
    // `typing` is stable (a useState setter in the caller).
  }, [host, run, active, reduced, typing, heroRef]);
}

/**
 * Both strings sit in one grid cell and only the visible one is shown, so the swap moves no text box: a centred line
 * whose width changed would otherwise count as a (tiny) layout shift when the story ends mid-scroll.
 */
function Swap({ done, before, after }: { done: boolean; before: string; after: string }) {
  return (
    <span className="grid">
      <span className={done ? "invisible [grid-area:1/1]" : "[grid-area:1/1]"}>{before}</span>
      <span className={done ? "[grid-area:1/1]" : "invisible [grid-area:1/1]"}>{after}</span>
    </span>
  );
}

/** The hero's login stage: the Lamp / Simple switch, the Replay button and the card. */
export default function HomeLampStage() {
  const { reduced } = useMotionGate();
  const [mode, setMode] = useState<Mode>("lamp");
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typingField, setTypingField] = useState<"" | "email" | "password">("");
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = host?.closest<HTMLElement>(".home-hero") ?? null;
  }, [host]);

  const signIn = useCallback(async () => {
    setPhase("working");
    await wait(beat(3) * 1000);
    setPhase("done");
  }, []);
  const lamp = mode === "lamp";
  useStory(host, run, lamp, reduced, setTypingField, heroRef);

  const done = phase === "done";
  return (
    <>
      <div className="home-stage-bar">
        <SegmentedControl
          aria-label="Login style"
          size="sm"
          value={mode}
          onValueChange={(v) => {
            setMode(v === "simple" ? "simple" : "lamp");
            setPhase("idle");
            setTypingField("");
            setRun((n) => n + 1);
          }}
          items={MODES}
        />
        {lamp && !reduced && (
          <Button
            variant="glass"
            size="sm"
            aria-label="Replay the login story"
            onClick={() => {
              setPhase("idle");
              setTypingField("");
              setRun((n) => n + 1);
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
        )}
      </div>
      <div
        ref={setHost}
        className="home-stage"
        data-hero-story=""
        data-mode={mode}
        data-phase={lamp ? phase : "idle"}
        data-typing={lamp ? typingField : ""}
      >
        {lamp ? (
          <LampLogin
            key={run}
            headingLevel="none"
            title={<Swap done={done} before="Sign in" after="Welcome back, Ava" />}
            subtitle={<Swap done={done} before="Use your work email." after="You are signed in on this Mac." />}
            signUpHref={null}
            loginLabels={{ submit: done ? "Signed in" : "Sign in", emailPlaceholder: "you@example.com" }}
            onSubmit={signIn}
          />
        ) : (
          <GlassLogin
            key={run}
            headingLevel="none"
            signUpHref={null}
            onSubmit={() => wait(beat(3) * 1000)}
            labels={{ emailPlaceholder: "you@example.com" }}
          />
        )}
      </div>
    </>
  );
}
