import { useState, type ReactNode } from "react";
import { Avatar } from "@sheenui/theme";
import { Button } from "@sheenui/theme";
import { GlassCard } from "@sheenui/theme";
import { useSheenReducedMotion } from "@sheenui/theme";
import { NumberTicker } from "@sheenui/theme";
import { Marquee } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { NumberTickerScene as NumberTickerSceneData } from "../layout/ShowcaseStage.number-ticker";
import { NumberTickerScene } from "../layout/ShowcaseStage.number-ticker.scene";
import type { MarqueeScene as MarqueeSceneData } from "../layout/ShowcaseStage.marquee";
import { MarqueeScene } from "../layout/ShowcaseStage.marquee.scene";

/* =====================================================================
 * Number ticker
 * ===================================================================== */

const pick = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

/** The "Number ticker" docs page (/effects/number-ticker): live examples, props and notes. */
export function NumberTickerPage() {
  const [revenue, setRevenue] = useState(48250);
  const [users, setUsers] = useState(1284093);
  const [rate, setRate] = useState(0.048);
  const [count, setCount] = useState(98);

  function shuffle() {
    setRevenue(pick(9000, 99000));
    setUsers(pick(400000, 2600000));
    setRate(pick(10, 99) / 1000);
  }

  return (
    <Page
      eyebrow="Effect"
      title="Number ticker"
      description="Every digit is a little wheel that rolls to its new value. Formatting is Intl.NumberFormat, so currencies, percentages, compact numbers and any locale just work. Screen readers hear the final value once, not every digit."
      source="theme/src/components/number-ticker/number-ticker.tsx"
    >
      <ShowcaseStage<NumberTickerSceneData>
        label="Number ticker demo"
        story={() => import("../layout/ShowcaseStage.number-ticker")}
        initial={{ revenue: 12480, users: 402118 }}
        minHeight="16rem"
      >
        {(scene, ctx) => <NumberTickerScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Live stats"
        description="Digits roll up when a value rises and down when it falls; new places slide in. Places that went through a full cycle spin an extra turn, like an odometer."
        controls={
          <>
            <Button size="sm" variant="glass" onClick={shuffle}>
              Shuffle values
            </Button>
            <Button size="sm" variant="glass" onClick={() => setCount((c) => c + 1)}>
              Add one
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              Remove one
            </Button>
          </>
        }
        stageClassName="min-h-72"
        code={`
import { NumberTicker } from "@sheenui/theme";

export function Example() {
  const revenue = 128400;
  const users = 18250;
  const rate = 0.043;
  const count = 42;

  return (
    <>
      <NumberTicker value={revenue} locales="en-US" format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
      <NumberTicker value={users} locales="en-US" format={{ notation: "compact", maximumFractionDigits: 1 }} />
      <NumberTicker value={rate} locales="en-US" format={{ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
      <NumberTicker value={count} from={count} locales="en-US" />
    </>
  );
}`}
      >
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-4">
          <StatTile label="Revenue">
            <NumberTicker
              value={revenue}
              locales="en-US"
              format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
            />
          </StatTile>
          <StatTile label="Active users">
            <NumberTicker value={users} locales="en-US" format={{ notation: "compact", maximumFractionDigits: 1 }} />
          </StatTile>
          <StatTile label="Conversion">
            <NumberTicker
              value={rate}
              locales="en-US"
              format={{ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }}
            />
          </StatTile>
          <StatTile label="Seats taken">
            <NumberTicker value={count} from={count} locales="en-US" />
          </StatTile>
        </div>
      </Example>

      <Example
        title="Any locale, any numbering system"
        description="The same value through Intl.NumberFormat: separators, symbols and even the digits themselves follow the locale. In right-to-left locales the digits still read left to right, and the currency sits where the browser puts it."
        stageClassName="min-h-64"
        code={`
import { GlassCard, NumberTicker } from "@sheenui/theme";

const rows = [
  ["German, euro", "de-DE", { style: "currency", currency: "EUR" }, 1234567.89],
  ["Indian grouping, rupee", "en-IN", { style: "currency", currency: "INR" }, 1234567.89],
  ["Japanese, yen", "ja-JP", { style: "currency", currency: "JPY", currencyDisplay: "narrowSymbol" }, 1234567],
  ["Arabic-Indic digits", "ar-EG", {}, 1234567],
  ["Devanagari digits", "hi-IN-u-nu-deva", {}, 1234567],
  ["Compact, French", "fr-FR", { notation: "compact", compactDisplay: "long" }, 1234567],
  ["Egyptian pound, right to left", "ar-EG", { style: "currency", currency: "EGP" }, 1234567.89],
  ["Shekel, right to left", "he-IL", { style: "currency", currency: "ILS" }, 1234.5],
] as const;

export function Example() {
  return (
    <dl className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      {rows.map(([label, locale, format, value]) => (
        <GlassCard key={label} level={1} sheen={false} className="flex flex-col gap-1 px-4 py-3">
          <dt className="text-xs text-sheen-fg-muted">{label}</dt>
          <dd className="text-xl font-semibold">
            <NumberTicker value={value} locales={locale} format={format} />
          </dd>
        </GlassCard>
      ))}
    </dl>
  );
}`}
      >
        <dl className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
          {(
            [
              ["German, euro", "de-DE", { style: "currency", currency: "EUR" }, 1234567.89],
              ["Indian grouping, rupee", "en-IN", { style: "currency", currency: "INR" }, 1234567.89],
              [
                "Japanese, yen",
                "ja-JP",
                { style: "currency", currency: "JPY", currencyDisplay: "narrowSymbol" },
                1234567,
              ],
              ["Arabic-Indic digits", "ar-EG", {}, 1234567],
              ["Devanagari digits", "hi-IN-u-nu-deva", {}, 1234567],
              ["Compact, French", "fr-FR", { notation: "compact", compactDisplay: "long" }, 1234567],
              ["Egyptian pound, right to left", "ar-EG", { style: "currency", currency: "EGP" }, 1234567.89],
              ["Shekel, right to left", "he-IL", { style: "currency", currency: "ILS" }, 1234.5],
            ] as const
          ).map(([label, locale, format, value]) => (
            <GlassCard key={label} level={1} sheen={false} className="flex flex-col gap-1 px-4 py-3">
              <dt className="text-xs text-sheen-fg-muted">{label}</dt>
              <dd className="text-xl font-semibold">
                <NumberTicker value={value} locales={locale} format={format} />
              </dd>
            </GlassCard>
          ))}
        </dl>
      </Example>

      <Example
        title="Counts up when it comes into view"
        description="It starts from `from` (0 by default) and rolls the first time it is on screen. Pass from={value} to skip that."
        stageClassName="min-h-56"
        code={`
import { NumberTicker } from "@sheenui/theme";

export function Example() {
  return (
    <p className="text-6xl font-semibold tracking-tight sm:text-7xl">
      <NumberTicker value={2400000} locales="en-US" format={{ notation: "compact" }} suffix="+" delay={0.2} />
    </p>
  );
}`}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-6xl font-semibold tracking-tight sm:text-7xl">
            <NumberTicker value={2400000} locales="en-US" format={{ notation: "compact" }} suffix="+" delay={0.2} />
          </p>
          <p className="text-sm text-sheen-fg-muted">developers ship with glass every month</p>
        </div>
      </Example>

      <PropsTable of={PROPS.NumberTicker} />
      <KeyboardTable rows={[["Tab", "Not focusable: this is text."]]} />
      <A11yNotes
        items={[
          'The digit wheels are aria-hidden; the final value is in a visually hidden live region (live="polite" by default), so it is read once, correctly formatted, not digit by digit.',
          "Under reduced motion the value appears at once.",
        ]}
      />
    </Page>
  );
}

function StatTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <GlassCard className="flex flex-col gap-1 p-5">
      <p className="text-sm text-sheen-fg-muted">{label}</p>
      <p className="text-3xl font-semibold tracking-tight">{children}</p>
    </GlassCard>
  );
}

/* =====================================================================
 * Marquee
 * ===================================================================== */

const brands = ["Northwind", "Lumina", "Arcadia", "Vertex", "Quanta", "Helix", "Orbitly", "Nimbus"];

function BrandLogo({ name, index }: { name: string; index: number }) {
  const marks = [
    <circle key="c" cx="12" cy="12" r="8" />,
    <rect key="r" x="4" y="4" width="16" height="16" rx="4" />,
    <path key="t" d="M12 3 21 20H3Z" />,
    <path key="d" d="M12 2 22 12 12 22 2 12Z" />,
  ];
  return (
    <a
      href={`#customer-${name.toLowerCase()}`}
      className="flex min-h-11 items-center gap-2 rounded-sheen-sm px-2 text-lg font-semibold tracking-tight text-sheen-fg-muted motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast) hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
        {marks[index % marks.length]}
      </svg>
      {name}
    </a>
  );
}

const reviews = [
  [
    "Ana Ribeiro",
    "Design lead, Lumina",
    "The glass actually stays readable. First theme I've shipped without a contrast fight.",
  ],
  [
    "Kenji Watanabe",
    "Frontend, Vertex",
    "Reduced motion is handled everywhere. Our accessibility audit had nothing to say.",
  ],
  ["Priya Natarajan", "Founder, Helix", "Copied four components and had a landing page that looked custom by lunch."],
  [
    "Marcus Lee",
    "Engineer, Quanta",
    "The springs feel expensive. Exits are quicker than entrances, which is exactly right.",
  ],
  ["Sofia Greco", "Product designer", "Dark mode isn't an afterthought: every token was clearly checked twice."],
  ["Tom Becker", "CTO, Orbitly", "Typed props, Base UI underneath, nothing magic. Easy to own."],
] as const;

function Review({ name, role, quote }: { name: string; role: string; quote: string }) {
  return (
    <figure className="flex h-full flex-col gap-4">
      <blockquote className="text-sm text-pretty">“{quote}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="truncate text-xs text-sheen-fg-muted">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** One Pause / Play button for several marquees (each one is given `paused` and `controls={false}`). */
function PauseAll({
  paused,
  onChange,
  label,
}: {
  paused: boolean;
  onChange: (paused: boolean) => void;
  label: string;
}) {
  return (
    <Button variant="glass" size="sm" className="rounded-sheen-full" onClick={() => onChange(!paused)}>
      {paused ? <PlaySmallIcon /> : <PauseSmallIcon />}
      {paused ? `Play ${label}` : `Pause ${label}`}
    </Button>
  );
}

/** The "Marquee" docs page (/effects/marquee): live examples, props and notes. */
export function MarqueePage() {
  const reduced = useSheenReducedMotion();
  const [reviewsPaused, setReviewsPaused] = useState(false);
  const [columnsPaused, setColumnsPaused] = useState(false);

  return (
    <Page
      eyebrow="Effect"
      title="Marquee"
      description="An endless, seamless strip of logos or testimonials. It eases to a stop under the mouse or keyboard focus, has a Pause button, rests off-screen, runs the other way in right-to-left pages, and holds still when reduced motion is on."
      source="theme/src/components/marquee/marquee.tsx"
    >
      <ShowcaseStage<MarqueeSceneData>
        label="Marquee demo"
        story={() => import("../layout/ShowcaseStage.marquee")}
        initial={{ running: false }}
        minHeight="15rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,28rem)]!"
      >
        {(scene, ctx) => <MarqueeScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Logo cloud"
        description="The list is read once by screen readers and is in the tab order once. The copies that fill the strip are hidden from both, but stay clickable. Tab to a logo that is off to the side and it glides into the middle. The Pause button sits below the strip and comes first in the tab order."
        stageClassName="min-h-48 px-0 sm:px-0"
        code={`
import { Marquee } from "@sheenui/theme";

const brands = [
  { name: "Acme", href: "https://example.com/acme", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><circle cx="12" cy="12" r="10" fill="currentColor" /></svg> },
  { name: "Globex", href: "https://example.com/globex", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" /></svg> },
  { name: "Initech", href: "https://example.com/initech", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><path d="M12 2l10 18H2z" fill="currentColor" /></svg> },
];

export function Example() {
  return (
    <Marquee listLabel="Customers" speed={36} gap={48}>
      {brands.map((brand) => (
        <a
          key={brand.name}
          href={brand.href}
          className="flex min-h-11 items-center gap-2 rounded-sheen-sm px-2 text-lg font-semibold text-sheen-fg-muted hover:text-sheen-fg"
        >
          <brand.Logo className="size-6" />
          {brand.name}
        </a>
      ))}
    </Marquee>
  );
}`}
      >
        <Marquee listLabel="Customers" speed={36} gap={48}>
          {brands.map((brand, i) => (
            <BrandLogo key={brand} name={brand} index={i} />
          ))}
        </Marquee>
      </Example>

      <Example
        title="Testimonials in glass"
        description="Level-1 glass items (tint, rim and light, no blur of their own) keep a moving strip cheap: a blurred card re-blurs its backdrop on every frame it moves, and a dozen in view would blow the glass budget. Put a blurred level (glass-2) on the items and the edges fade card by card instead, each card masked on its own glass element so its blur keeps working (a mask on the strip would switch it off). Both rows share one Pause button."
        stageClassName="min-h-96 flex-col gap-2 px-0 sm:px-0"
        code={`
import { useState } from "react";
import { Button, Marquee } from "@sheenui/theme";

const reviews = [
  { name: "Asha", text: "Best docs I have read this year." },
  { name: "Ravi", text: "Dropped into our app in an afternoon." },
  { name: "Meera", text: "The glass looks great in dark mode." },
];

function Review({ name, text }: (typeof reviews)[number]) {
  return (
    <figure>
      <blockquote className="text-sm">{text}</blockquote>
      <figcaption className="mt-2 text-xs text-sheen-fg-muted">{name}</figcaption>
    </figure>
  );
}

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Marquee
        listLabel="What people say"
        paused={paused}
        controls={false}
        itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
      >
        {reviews.map((review) => <Review key={review.name} {...review} />)}
      </Marquee>
      <Marquee
        reverse
        speed={30}
        listLabel="More reviews"
        paused={paused}
        controls={false}
        itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
      >
        {reviews.map((review) => <Review key={review.name} {...review} />)}
      </Marquee>
      <Button variant="glass" size="sm" onClick={() => setPaused(!paused)}>
        {paused ? "Play reviews" : "Pause reviews"}
      </Button>
    </>
  );
}`}
      >
        <Marquee
          listLabel="What people say"
          paused={reviewsPaused}
          controls={false}
          itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
        >
          {reviews.map(([name, role, quote]) => (
            <Review key={name} name={name} role={role} quote={quote} />
          ))}
        </Marquee>
        <Marquee
          reverse
          speed={30}
          listLabel="More reviews"
          paused={reviewsPaused}
          controls={false}
          itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
        >
          {[...reviews].reverse().map(([name, role, quote]) => (
            <Review key={name} name={name} role={role} quote={quote} />
          ))}
        </Marquee>
        {!reduced && (
          <div className="flex w-full justify-end px-3 sm:px-4">
            <PauseAll paused={reviewsPaused} onChange={setReviewsPaused} label="reviews" />
          </div>
        )}
      </Example>

      <Example
        title="Vertical"
        description="Columns scroll at different speeds and directions. Give a vertical marquee a height; with reduced motion it keeps that height and scrolls instead."
        stageClassName="flex-col gap-3 p-3 sm:p-6"
        code={`
import { useState } from "react";
import { Button, Marquee } from "@sheenui/theme";

const items = ["Fast", "Accessible", "Themeable", "Typed", "Small"];

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Marquee vertical speed={28} paused={paused} controls={false} className="h-[28rem]" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
        <Marquee vertical reverse speed={22} paused={paused} controls={false} className="hidden h-[28rem] sm:flex" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
        <Marquee vertical speed={34} paused={paused} controls={false} className="hidden h-[28rem] sm:flex" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
      </div>
      <Button variant="glass" size="sm" onClick={() => setPaused(!paused)}>
        {paused ? "Play columns" : "Pause columns"}
      </Button>
    </>
  );
}`}
      >
        <div className="grid w-full gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((column) => (
            <Marquee
              key={column}
              vertical
              reverse={column === 1}
              speed={[28, 22, 34][column]}
              gap={16}
              paused={columnsPaused}
              controls={false}
              listLabel={`Reviews, column ${column + 1}`}
              className={column === 0 ? "h-[28rem]" : "hidden h-[28rem] sm:flex"}
              itemClassName="glass-1 w-full rounded-sheen-lg p-5"
            >
              {reviews
                .slice(column * 2)
                .concat(reviews.slice(0, column * 2))
                .map(([name, role, quote]) => (
                  <Review key={name} name={name} role={role} quote={quote} />
                ))}
            </Marquee>
          ))}
        </div>
        {!reduced && (
          <div className="flex w-full justify-end">
            <PauseAll paused={columnsPaused} onChange={setColumnsPaused} label="columns" />
          </div>
        )}
      </Example>

      <PropsTable of={PROPS.Marquee} />
      <KeyboardTable
        rows={[
          ["Tab", "Reach the Pause / Play button first, then the real items."],
          ["Enter / Space", "Pause or resume the strip."],
        ]}
      />
      <A11yNotes
        items={[
          "Mouse over it, or keyboard focus inside it, eases it to a stop (and back up after); focusing an off-screen item glides it into view.",
          "The strip has a Pause / Play button (WCAG 2.2.2). The list is rendered once for assistive tech; the repeated copies are aria-hidden and out of the tab order. listLabel names the list.",
          "Under reduced motion it does not move, and the copies, the edge fade and the button are dropped.",
        ]}
      />
    </Page>
  );
}

function PauseSmallIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  );
}

function PlaySmallIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
      <path d="M4.5 2.9v10.2a1 1 0 0 0 1.53.85l8.1-5.1a1 1 0 0 0 0-1.7l-8.1-5.1A1 1 0 0 0 4.5 2.9Z" />
    </svg>
  );
}
