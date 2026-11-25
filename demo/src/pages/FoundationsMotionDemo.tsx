import { useState } from "react";
import { motion } from "motion/react";
import { Button, GlassCard, duration, spring, useSheenReducedMotion } from "@sheenui/theme";

export function MotionDemo() {
  const reduced = useSheenReducedMotion();
  const [on, setOn] = useState(false);
  const rows = [
    ["snappy", spring.snappy],
    ["gentle", spring.gentle],
    ["bouncy", spring.bouncy],
  ] as const;

  return (
    <GlassCard level={2} className="flex flex-col gap-5 p-6">
      {rows.map(([name, transition]) => (
        <div key={name} className="flex items-center gap-4">
          <code className="w-20 shrink-0 font-sheen-mono text-xs text-sheen-fg-muted">{name}</code>
          <div className="relative h-10 min-w-0 flex-1 rounded-sheen-full bg-sheen-border">
            {/* The dot travels the track minus its own width: x is a transform (100% of this inset box). */}
            <div className="absolute inset-y-1 end-[2.25rem] start-1">
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ x: on ? "100%" : "0%" }}
                transition={reduced ? { duration: 0 } : transition}
              >
                <div className="sheen-fill size-8 rounded-full shadow-lg [background-image:var(--sheen-accent-fill)]" />
              </motion.div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button onClick={() => setOn((v) => !v)}>Play</Button>
        <span className="text-xs text-sheen-fg-muted">
          durations:{" "}
          {Object.entries(duration)
            .map(([k, v]) => `${k} ${v * 1000}ms`)
            .join(" · ")}
        </span>
      </div>
    </GlassCard>
  );
}
