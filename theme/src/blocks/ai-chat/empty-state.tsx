"use client";

import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { duration, spring } from "../../motion/tokens";
import { type AiChatLabels } from "./types";
import { Orb } from "./parts";
import { SparkIcon, ArrowUpIcon } from "./icons";

/* ---------- Empty state ---------- */

/** The chat's empty state: the greeting, the orb and the suggested prompts. */
export function EmptyState({
  suggestions,
  labels,
  reduced,
  onPick,
}: {
  suggestions: string[];
  labels: AiChatLabels;
  reduced: boolean;
  onPick: (text: string) => void;
}) {
  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: duration.base, delay } }
      : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { ...spring.gentle, delay } };

  return (
    <div className="my-auto flex flex-col items-center gap-6 py-4 text-center">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: duration.base } : spring.bouncy}
      >
        <Orb busy={false} size="lg" reduced={reduced} />
      </motion.div>
      <div className="flex flex-col gap-2">
        <motion.p {...rise(0.06)} className="text-xl font-semibold tracking-tight text-balance @lg:text-2xl">
          {labels.emptyTitle}
        </motion.p>
        <motion.p {...rise(0.1)} className="mx-auto max-w-md text-sm text-pretty text-sheen-fg-muted">
          {labels.emptyDescription}
        </motion.p>
      </div>
      {suggestions.length > 0 && (
        <ul aria-label={labels.suggestions} className="grid w-full max-w-xl grid-cols-1 gap-2 @lg:grid-cols-2">
          {suggestions.map((text, i) => (
            <li key={text} className="flex">
              {/* The glass chip animates itself (never a wrapper around glass). */}
              <motion.button
                type="button"
                onClick={() => onPick(text)}
                {...rise(0.14 + i * 0.05)}
                className={cn(
                  "group/chip glass-1 flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-sheen-lg px-3.5 py-2.5 text-start text-sm text-sheen-fg",
                  "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                )}
              >
                <SparkIcon aria-hidden className="size-4 shrink-0 text-sheen-accent" />
                <span className="min-w-0 flex-1">{text}</span>
                <ArrowUpIcon className="size-3.5 shrink-0 rotate-45 text-sheen-fg-muted motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out motion-ok:group-hover/chip:translate-x-0.5 motion-ok:group-hover/chip:-translate-y-0.5" />
              </motion.button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
