type Conflicting = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart";
const CONFLICTING: readonly Conflicting[] = ["onDrag", "onDragStart", "onDragEnd", "onAnimationStart"];

/** `P` without the handlers whose signatures differ between React's DOM props and Motion's. */
export type MotionSafeProps<P> = Omit<P, Conflicting>;

/**
 * Props of a plain element, typed for spreading onto a `motion.*` element: the four handlers that React and Motion
 * type differently (`onDrag`, `onDragStart`, `onDragEnd`, `onAnimationStart`) are removed, so the spread is checked
 * instead of cast away with `as object`. Public props types use {@link MotionSafeProps} so callers cannot pass them.
 *
 * @internal Not part of the public barrel.
 */
export function motionSafeProps<P extends object>(props: P): MotionSafeProps<P> {
  const rest: Record<string, unknown> = { ...(props as Record<string, unknown>) };
  for (const key of CONFLICTING) Reflect.deleteProperty(rest, key);
  return rest as MotionSafeProps<P>;
}
