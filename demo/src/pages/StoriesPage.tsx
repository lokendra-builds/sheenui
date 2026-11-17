import { Suspense, startTransition, useEffect, useRef, useState, type CSSProperties } from "react";
import { Button, useSheenReducedMotion } from "@sheenui/theme";

import { Page } from "../layout/Page";
import { installCommand } from "../seo/answers";
import { href } from "../router";
import { STORY_CARDS, type StoryCard } from "./StoriesPage/cards";
import { StageFrame } from "./StoriesPage/StoryView";

/** At most this many cards move at once; the rest rest on their last frame. */
const MAX_ANIMATING = 3;
/** A card counts as on screen when this much of it is visible. */
const ON_SCREEN = 0.6;
/** The sticky header covers this much of the top of the viewport: a card under it is not on screen (a dialog story is a fixed layer). */
const HEADER_PX = 96;
/** The pause between two cards being loaded. */
const MOUNT_GAP_MS = 220;

const same = (a: ReadonlySet<string>, b: ReadonlySet<string>) => a.size === b.size && [...a].every((id) => b.has(id));

/**
 * Decides which cards load and which move. `near` grows as cards come within a screen of the viewport (their code is
 * fetched then and kept); `playing` is at most MAX_ANIMATING of the cards on screen, the ones nearest the middle of the
 * viewport, and a card that stays on screen keeps its slot so scrolling does not restart stories.
 */
function useCardSchedule(paused: boolean) {
  const grid = useRef<HTMLUListElement | null>(null);
  const [near, setNear] = useState<ReadonlySet<string>>(() => new Set());
  const [onScreen, setOnScreen] = useState<ReadonlySet<string>>(() => new Set());
  const [playing, setPlaying] = useState<ReadonlySet<string>>(() => new Set());
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const list = grid.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const cards = [...list.querySelectorAll<HTMLElement>("[data-card]")];
    const idOf = (node: Element) => (node as HTMLElement).dataset.card ?? "";
    const visible = new Set<string>();
    // Cards that come near are loaded one at a time, a beat apart and as a transition (React renders them in short
    // slices), so a screenful of stories never lands in one long task.
    const queue: string[] = [];
    let timer: number | undefined;
    const drain = () => {
      timer = undefined;
      const id = queue.shift();
      if (id) startTransition(() => setNear((current) => new Set([...current, id])));
      if (queue.length > 0) timer = window.setTimeout(drain, MOUNT_GAP_MS);
    };
    const nearIo = new IntersectionObserver(
      (entries) => {
        const add = entries.filter((e) => e.isIntersecting);
        for (const e of add) {
          nearIo.unobserve(e.target);
          queue.push(idOf(e.target));
        }
        // The cards nearest the top of the page first.
        queue.sort((a, b) => cards.findIndex((c) => idOf(c) === a) - cards.findIndex((c) => idOf(c) === b));
        if (add.length > 0 && timer === undefined) timer = window.setTimeout(drain, 0);
      },
      { rootMargin: "500px 0px" },
    );
    const visibleIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= ON_SCREEN) visible.add(idOf(e.target));
          else visible.delete(idOf(e.target));
        }
        setOnScreen(new Set(visible));
      },
      { threshold: [0, ON_SCREEN, 1], rootMargin: `-${HEADER_PX}px 0px 0px 0px` },
    );
    for (const card of cards) {
      nearIo.observe(card);
      visibleIo.observe(card);
    }
    return () => {
      window.clearTimeout(timer);
      nearIo.disconnect();
      visibleIo.disconnect();
    };
  }, []);

  useEffect(() => {
    const onChange = () => setHidden(document.hidden);
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  // Choose who moves whenever the set of cards on screen changes.
  useEffect(() => {
    setPlaying((current) => {
      const list = grid.current;
      const keep = [...current].filter((id) => onScreen.has(id));
      if (!list) return new Set(keep);
      const middle = window.innerHeight / 2;
      const distance = (id: string) => {
        const node = list.querySelector<HTMLElement>(`[data-card="${id}"]`);
        if (!node) return Infinity;
        const box = node.getBoundingClientRect();
        return Math.abs(box.top + box.height / 2 - middle);
      };
      const rest = [...onScreen].filter((id) => !keep.includes(id)).sort((a, b) => distance(a) - distance(b));
      const next = new Set([...keep, ...rest].slice(0, MAX_ANIMATING));
      return same(next, current) ? current : next;
    });
  }, [onScreen]);

  const running = !paused && !hidden;
  return { grid, near, playing: running ? playing : new Set<string>() };
}

function Card({ card, near, playing }: { card: StoryCard; near: boolean; playing: boolean }) {
  const { View } = card;
  const shell = <StageFrame minHeight={card.minHeight} />;
  return (
    // content-visibility: a card far off screen skips style, layout and paint; its reserved height (the stage's minHeight
    // plus the text under it, see stories.css) keeps the grid and the scroll bar steady until it is rendered.
    <li
      className="stories-tile flex min-w-0"
      data-card={card.id}
      style={{ "--tile-h": card.minHeight } as CSSProperties}
    >
      <div
        className={`stories-card ${playing ? "" : "docs-flat"} relative flex w-full min-w-0 flex-col gap-3 rounded-sheen-lg focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-sheen-focus`}
        data-story-playing={playing ? "true" : "false"}
      >
        {/* The stage is a picture of the story: nothing in it takes focus or a click, the link below is the target. */}
        <div inert className="flex min-w-0 flex-1 flex-col">
          {near ? (
            <Suspense fallback={shell}>
              <View active={playing} minHeight={card.minHeight} />
            </Suspense>
          ) : (
            shell
          )}
        </div>
        <div className="flex flex-col gap-1 px-1">
          <p className="text-xs font-medium tracking-wide text-sheen-fg-muted uppercase">{card.kind}</p>
          <h2 id={`story-${card.id}`} className="text-lg font-semibold tracking-tight">
            <a
              href={href(card.path)}
              className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-sheen-accent"
            >
              {HEADINGS[card.id] ?? card.name}
            </a>
          </h2>
          <p className="text-sm text-pretty text-sheen-fg-muted">{card.blurb}</p>
          {installCommand(card.path) && (
            <div className="text-xs break-all text-sheen-fg-muted">
              Install: <code>{installCommand(card.path)}</code>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** The H2 of each card: the query the component answers, rather than its bare name (the link text stays the name's page). */
const HEADINGS: Readonly<Record<string, string>> = {
  button: "Animated React button",
  "lamp-login": "Glass lamp login page for React",
  "otp-input": "React OTP input with a glass seal",
  "payment-checkout": "Glass payment checkout form",
  switch: "React Switch with a spring thumb",
  "otp-verification": "React OTP verification screen",
  toast: "Toast stack in React",
  tabs: "React Tabs with a sliding pill",
  dialog: "Glass modal dialog for React",
  "morphing-dialog": "React morphing dialog",
  dock: "macOS-style dock in React",
  "tilt-card": "3D tilt card in React",
  "spotlight-card": "Spotlight card in React",
  "liquid-glass": "Liquid Glass effect for React",
  "border-beam": "Animated border beam in React",
  "blur-in": "Blur-in text animation for React",
  typewriter: "Typewriter text effect in React",
  "number-ticker": "Animated number ticker in React",
  "command-palette": "React command palette",
  "color-picker": "Glass color picker for React",
  carousel: "React carousel with glass dots",
};

const cardLink = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";

/** The "Showcase" docs page (/showcase): every pilot story and the payoff blocks as small looping stages. */
export function StoriesPage() {
  const reduced = useSheenReducedMotion();
  const [paused, setPaused] = useState(false);
  const { grid, near, playing } = useCardSchedule(paused || reduced);
  return (
    <Page
      eyebrow="Showcase"
      title="Showcase"
      description={`${STORY_CARDS.length} live glass components you can copy: each card runs the real SheenUI component, not a video.`}
      related={false}
      exportChips={false}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="glass"
          size="sm"
          aria-pressed={paused}
          disabled={reduced}
          onClick={() => setPaused((value) => !value)}
        >
          {paused || reduced ? "Play animations" : "Pause animations"}
        </Button>
        <p className="text-sm text-sheen-fg-muted">
          {reduced
            ? "Reduced motion is on: every card shows the last frame of its story."
            : "Three cards move at a time, only while they are on screen."}
        </p>
      </div>
      <ul ref={grid} className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        {STORY_CARDS.map((card) => (
          <Card key={card.id} card={card} near={near.has(card.id)} playing={playing.has(card.id)} />
        ))}
      </ul>
      <section aria-labelledby="showcase-next" className="flex max-w-3xl flex-col gap-3">
        <h2 id="showcase-next" className="text-xl font-semibold tracking-tight">
          From a card to your app
        </h2>
        <p className="text-base leading-relaxed text-pretty">
          Every card links to the page that documents it: the props, the keyboard and accessibility notes, the files to
          copy and the shadcn install command. For a whole screen, start with the{" "}
          <a href={href("/blocks/glass-login")} className={cardLink}>
            React glass login page
          </a>{" "}
          or the{" "}
          <a href={href("/blocks/lamp-login")} className={cardLink}>
            lamp login
          </a>
          ; for the refraction look, with{" "}
          <a href={href("/effects/liquid-glass")} className={cardLink}>
            Liquid Glass UI for React
          </a>
          ; for motion on its own, with the{" "}
          <a href={href("/effects")} className={cardLink}>
            animated React components
          </a>
          .
        </p>
      </section>
      <p className="text-base">
        <a
          href={href("/components")}
          className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
        >
          See all components
        </a>
        , or browse the{" "}
        <a
          href={href("/effects")}
          className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
        >
          effects
        </a>{" "}
        and{" "}
        <a
          href={href("/blocks")}
          className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
        >
          blocks
        </a>
        .
      </p>
    </Page>
  );
}
