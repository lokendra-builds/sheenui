"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { HEADING_TAGS, headingBelow, type HeadingTag, type HeadingLevelOption } from "../../lib/heading";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useLoopPlayback } from "../../motion/gate";
import { duration, ease, spring } from "../../motion/tokens";
import { Button } from "../../components/button/button";
import { CheckIcon } from "../icons";
import { type AuthSplitTestimonial, type AuthSplitStat, type AuthSplitLabels, type AuthSplitProps } from "./model";
import { StarIcon, QuoteIcon, PauseIcon, PlayIcon, SendIcon } from "./utils";

/* ---------- Success ---------- */

/** The panel that replaces the form once sign-up succeeds. @internal */
export function SuccessView({
  Heading,
  email,
  L,
  onResend,
  onBack,
}: {
  Heading: HeadingTag;
  email: string;
  L: AuthSplitLabels;
  onResend?: AuthSplitProps["onResend"];
  onBack: () => void;
}) {
  const reduced = useSheenReducedMotion();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The submit button that had focus is gone: land on the new heading, so the result is read out.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  async function resend() {
    if (state !== "idle") return;
    setState("sending");
    try {
      await onResend?.(email);
      setState("sent");
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <span className="relative flex size-16 items-center justify-center">
        {!reduced && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-sheen-success"
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: duration.slower * 1.5, ease: ease.out, delay: 0.15 }}
          />
        )}
        <motion.span
          aria-hidden
          initial={reduced ? false : { scale: 0.4, rotate: -16 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...spring.bouncy, delay: 0.05 }}
          className="flex size-16 items-center justify-center rounded-full bg-sheen-success-soft text-sheen-success-text forced-colors:border forced-colors:border-[CanvasText]"
        >
          <SendIcon className="size-7" />
        </motion.span>
      </span>
      <div className="flex flex-col gap-2">
        <Heading ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">
          {L.successTitle}
        </Heading>
        <p className="text-sm text-pretty text-sheen-fg-muted">{L.successBody(email)}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {onResend && (
          <Button
            variant="glass"
            fullWidth
            loading={state === "sending"}
            onClick={resend}
            // aria-disabled, not disabled: the button keeps focus after it has done its job.
            aria-disabled={state === "sent" || undefined}
            data-unavailable={state === "sent" ? "" : undefined}
            className="data-unavailable:pointer-events-none data-unavailable:opacity-55"
          >
            {state === "sent" ? (
              <>
                <CheckIcon />
                {L.resent}
              </>
            ) : (
              L.resend
            )}
          </Button>
        )}
        <Button variant="ghost" fullWidth onClick={onBack}>
          {L.changeEmail}
        </Button>
      </div>
      <span role="status" className="sr-only">
        {state === "sent" ? L.resent : ""}
      </span>
    </div>
  );
}

/* ---------- Brand panel ---------- */

/** The brand side of the split layout: logo, headline and testimonials. @internal */
export function BrandPanel({
  logo,
  headline,
  description,
  features,
  stats,
  testimonials,
  rotateEvery,
  headingLevel,
  L,
  className,
}: {
  logo: ReactNode;
  headline?: ReactNode;
  description?: ReactNode;
  features: ReactNode[];
  stats: AuthSplitStat[];
  testimonials: AuthSplitTestimonial[];
  rotateEvery: number;
  headingLevel: HeadingLevelOption;
  L: AuthSplitLabels;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // A soft light follows the pointer (mouse and pen; a finger is scrolling).
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={panelRef}
      onPointerMove={onPointerMove}
      data-slot="auth-split-panel"
      // Dark island: tokens inside resolve to their dark values in either theme.
      className={cn(
        "group/panel relative isolate flex min-w-0 flex-col justify-between gap-10 overflow-hidden rounded-sheen-xl bg-sheen-bg p-6 text-sheen-fg [color-scheme:dark] @lg/auth:p-10",
        "shadow-[0_0_0_1px_var(--sheen-glass-edge),0_24px_64px_-24px_var(--sheen-shadow-far)]",
        "forced-colors:border forced-colors:border-[CanvasText]",
        className,
      )}
    >
      <Aurora />

      <div className="hidden @4xl/auth:flex">{logo}</div>

      <div className="flex flex-col gap-6">
        <p className="max-w-lg text-3xl leading-[1.1] font-semibold tracking-tight text-balance @lg/auth:text-4xl">
          {headline ?? (
            <>
              Interfaces that{" "}
              <span className="bg-clip-text text-transparent [background-image:linear-gradient(120deg,var(--sheen-violet-300),var(--sheen-teal-300))] forced-colors:text-[CanvasText] forced-colors:[background-image:none]">
                feel expensive
              </span>
              , shipped this afternoon.
            </>
          )}
        </p>
        <p className="max-w-md text-base text-pretty text-sheen-fg-muted">
          {description ?? "Glass components with motion that respects your users, ready to drop into any React app."}
        </p>

        {features.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span
                  aria-hidden
                  className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-sheen-accent-soft text-sheen-accent ring-1 ring-sheen-accent-border"
                >
                  <CheckIcon className="size-3" strokeWidth="2.6" />
                </span>
                <span className="text-sheen-fg">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {stats.length > 0 && (
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5.5rem),1fr))] gap-3 border-t border-sheen-border pt-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex min-w-0 flex-col-reverse gap-0.5">
                <dt className="text-xs text-sheen-fg-muted">{stat.label}</dt>
                <dd className="text-xl font-semibold tracking-tight tabular-nums break-words @lg/auth:text-2xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {testimonials.length > 0 && (
        <Testimonials items={testimonials} rotateEvery={rotateEvery} headingLevel={headingLevel} L={L} />
      )}
    </div>
  );
}

/** Decorative colour: three drifting blobs, a fine grid and the pointer light. Transform-only motion. */
export function Aurora() {
  // The wrapper is as tall as the whole panel, so the shared off-screen pause (which watches the parent) would see it
  // as on screen whenever any of the panel is; the blobs themselves ask for the pause (also in a hidden tab).
  const ref = useRef<HTMLDivElement>(null);
  const playing = useLoopPlayback(ref, { margin: "0px", respectReducedMotion: false });
  const blob =
    "pointer-events-none absolute rounded-full motion-ok:animate-[sheen-float_var(--sheen-duration-ambient)_var(--sheen-ease-in-out)_infinite] in-data-[paused]:[animation-play-state:paused]";
  return (
    <div
      ref={ref}
      aria-hidden
      data-paused={playing ? undefined : ""}
      className="pointer-events-none absolute inset-0 -z-10 forced-colors:hidden"
    >
      <span
        className={cn(
          blob,
          "-top-1/4 -start-1/4 size-[70%] [background:radial-gradient(closest-side,color-mix(in_oklch,var(--sheen-violet-500)_70%,transparent),transparent)]",
        )}
      />
      <span
        className={cn(
          blob,
          "top-1/3 -end-1/3 size-[75%] [background:radial-gradient(closest-side,color-mix(in_oklch,var(--sheen-teal-500)_45%,transparent),transparent)] [animation-delay:var(--sheen-loop-phase-a)]",
        )}
      />
      <span
        className={cn(
          blob,
          "-bottom-1/3 start-[10%] size-[65%] [background:radial-gradient(closest-side,var(--sheen-blob-3),transparent)] [animation-delay:var(--sheen-loop-phase-b)]",
        )}
      />
      {/* Fine grid, fading out toward the edges. */}
      <span className="absolute inset-0 [background-image:linear-gradient(to_bottom,var(--sheen-backdrop-grid)_1px,transparent_1px),linear-gradient(to_right,var(--sheen-backdrop-grid)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_30%_20%,#000,transparent_70%)]" />
      {/* Pointer light. */}
      <span className="absolute inset-0 opacity-0 transition-opacity duration-(--sheen-duration-slow) group-hover/panel:opacity-100 [background:radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,30%),color-mix(in_oklch,var(--sheen-violet-300)_16%,transparent),transparent_65%)]" />
    </div>
  );
}

/** The auto-advancing testimonial carousel of the brand panel. @internal */
export function Testimonials({
  items,
  rotateEvery,
  headingLevel,
  L,
}: {
  items: AuthSplitTestimonial[];
  rotateEvery: number;
  headingLevel: HeadingLevelOption;
  L: AuthSplitLabels;
}) {
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 1)];
  const reduced = useSheenReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [manual, setManual] = useState(false);
  const many = items.length > 1;
  // Reduced motion: no auto-rotation at all; the dots still switch quotes.
  const auto = many && rotateEvery > 0 && !reduced;
  const sectionRef = useRef<HTMLElement>(null);
  // The rotation also waits while the card is off-screen or the tab is hidden.
  const visible = useLoopPlayback(sectionRef, { respectReducedMotion: false });
  const running = auto && !paused && !held && visible;
  const headingId = useId();

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), rotateEvery * 1000);
    return () => window.clearTimeout(timer);
  }, [running, index, items.length, rotateEvery]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- hover and focus only pause the quote rotation (WCAG 2.2.2); they activate nothing
    <section
      ref={sectionRef}
      role="group"
      aria-labelledby={headingId}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
      className="glass-2 relative flex flex-col gap-4 rounded-sheen-xl p-5 @lg/auth:p-6"
    >
      <Heading id={headingId} className="sr-only">
        {L.testimonials}
      </Heading>
      <QuoteIcon aria-hidden className="absolute top-4 end-5 size-9 text-sheen-accent opacity-30" />

      {/* All quotes share one grid cell, so the card is as tall as the longest and never jumps. */}
      <div className="grid" aria-live={manual || !running ? "polite" : "off"}>
        {items.map((item, i) => {
          const active = i === index;
          return (
            <figure
              key={i}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                "col-start-1 row-start-1 flex flex-col gap-4",
                // Hand-over, not a cross-fade: the old quote leaves quickly, the new one rises in after it.
                active
                  ? "opacity-100 transition-[opacity,translate] delay-(--sheen-duration-exit) duration-(--sheen-duration-slow) ease-sheen-out"
                  : "pointer-events-none opacity-0 transition-[opacity,translate] duration-(--sheen-duration-exit) ease-sheen-exit motion-ok:-translate-y-1.5",
              )}
            >
              {item.rating !== undefined && (
                <div className="flex gap-0.5 text-sheen-warning" role="img" aria-label={L.rating(item.rating)}>
                  {[0, 1, 2, 3, 4].map((star) => (
                    <StarIcon
                      key={star}
                      className={cn("size-4", star >= Math.round(item.rating ?? 0) && "opacity-25")}
                    />
                  ))}
                </div>
              )}
              <blockquote className="pe-8 text-base leading-relaxed text-pretty text-sheen-fg">
                {/* Quote marks come from CSS for the page's language (“…” in English, „…“ in German, «…» in French). */}
                <p className="[quotes:auto] before:content-[open-quote] after:content-[close-quote]">{item.quote}</p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="sheen-fill flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]"
                >
                  {item.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold">{item.name}</span>
                  {item.role && <span className="text-xs text-sheen-fg-muted">{item.role}</span>}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {many && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {items.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={L.showTestimonial(i + 1, items.length)}
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    setManual(true);
                    setIndex(i);
                  }}
                  className={cn(
                    "group/dot relative flex h-6 min-w-6 items-center justify-center rounded-sheen-full px-1",
                    "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
                    "any-pointer-coarse:h-11 any-pointer-coarse:min-w-11 any-pointer-coarse:px-2",
                  )}
                >
                  <span
                    className={cn(
                      "relative block h-1.5 overflow-hidden rounded-full bg-sheen-border",
                      active ? "w-8" : "w-1.5 group-hover/dot:bg-sheen-fg-subtle",
                      "forced-colors:border forced-colors:border-[CanvasText]",
                    )}
                  >
                    {active && (
                      // Fills over one rotation (scaleX, transform only); full while paused or held.
                      <motion.span
                        key={`${index}-${running}`}
                        initial={running ? { scaleX: 0 } : false}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: running ? rotateEvery : 0, ease: "linear" }}
                        className="absolute inset-0 origin-left rounded-full bg-sheen-fg rtl:origin-right forced-colors:bg-[Highlight]"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {auto && (
            <Button
              variant="ghost"
              size="sm"
              // The label says what pressing does (WAI carousel pattern), so no aria-pressed on top of it.
              aria-label={paused ? L.play : L.pause}
              onClick={() => setPaused((p) => !p)}
              className="size-8 px-0 text-sheen-fg-muted hover:text-sheen-fg"
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
