import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge only dedupes classes it can classify. Teach it SheenUI's own
 * scales so `cn("rounded-sheen-md", "rounded-sheen-lg")` keeps just the last one
 * instead of shipping both and leaving the winner to CSS source order.
 */
const twMerge = extendTailwindMerge<"glass-level">({
  extend: {
    theme: {
      radius: ["sheen-sm", "sheen-md", "sheen-lg", "sheen-xl", "sheen-full"],
      ease: ["sheen-out", "sheen-in-out", "sheen-exit", "sheen-spring"],
      text: ["2xs"],
    },
    classGroups: {
      // Glass levels replace each other: cn("glass-2", "glass-3") → "glass-3".
      "glass-level": ["glass-1", "glass-2", "glass-3"],
    },
  },
});

/** Merge class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Base UI's `className` is a string OR a function of the part's state. This builds the `className` for a wrapper
 * that adds its own classes: pass the consumer's `className` and a `build` that merges it, and you get a string back
 * for a string (or nothing), or a state function for a function, so `className={(state) => ...}` keeps working.
 *
 * @example
 * ```tsx
 * import { Switch as BaseSwitch } from "@base-ui/react/switch";
 * import { classNameWith, cn } from "@sheenui/theme";
 *
 * type Props = { className?: string | ((state: BaseSwitch.Root.State) => string | undefined) };
 *
 * export function Example({ className }: Props) {
 *   return <BaseSwitch.Root className={classNameWith(className, (extra) => cn("rounded-full", extra))} />;
 * }
 * ```
 *
 * @see /components
 */
export function classNameWith<S>(
  className: string | ((state: S) => string | undefined) | undefined,
  build: (extra: string | undefined) => string,
): string | ((state: S) => string) {
  return typeof className === "function" ? (state: S) => build(className(state)) : build(className);
}
