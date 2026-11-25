export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * What a `headingLevel` prop accepts: a level (1 to 6), or `"none"` to render the same styled text as a
 * paragraph with no heading role. `"none"` is for a component embedded as an example or inside another widget,
 * where its title must not appear in the page's document outline. Headings nested inside the component follow suit.
 */
export type HeadingLevelOption = HeadingLevel | "none";

/** The element a heading renders as: `h1` to `h6`, or `p` for a `"none"` heading. */
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

/**
 * The element for a heading `offset` levels below `level`.
 *
 * @param level The component's `headingLevel`.
 * @param offset How many levels deeper this heading sits (0 for the component's own title).
 * @returns `h1` to `h6` (clamped at `h6`), or `p` when `level` is `"none"` (or `false`, the older spelling).
 * @example
 * const Title = headingTag(headingLevel); // <Title>Plans</Title>
 */
export function headingTag(level: HeadingLevelOption | false, offset = 0): HeadingTag {
  if (level === "none" || level === false) return "p";
  return `h${Math.min(6, level + offset)}` as HeadingTag;
}

/**
 * The `headingLevel` to hand to a nested component that renders its headings `by` levels below `level`.
 *
 * @param level The component's `headingLevel`.
 * @param by How many levels deeper the child sits.
 * @returns A level clamped at 6, or `"none"` when `level` is `"none"` (so the whole subtree stays out of the outline).
 */
export function headingBelow(level: HeadingLevelOption | false, by = 1): HeadingLevel | "none" {
  if (level === "none" || level === false) return "none";
  return Math.min(6, level + by) as HeadingLevel;
}

/**
 * The element for each `headingLevel` value, for use as `const Title = HEADING_TAGS[level]`.
 * A plain lookup, so the React lint rule does not take it for a component created during render (it does for a function call's result).
 */
export const HEADING_TAGS: Readonly<Record<HeadingLevel | "none", HeadingTag>> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
  none: "p",
};
