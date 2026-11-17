/**
 * The plus sign in front of a Combobox's "create" row: a decorative 16 px icon (`aria-hidden`) that takes the row's
 * text colour. It has no props, no keyboard behaviour and no accessible name, the row's label is the name.
 *
 * @example
 * ```tsx
 * import { Combobox } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Combobox label="Item" options={[{ value: "a", label: "A" }]} multiple />;
 * }
 * ```
 *
 * @see /components/combobox
 *
 * @internal
 */
export function PlusIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/**
 * The circular arrow in a Combobox's "retry" row after a failed search: a decorative 16 px icon (`aria-hidden`) in the
 * row's text colour. It has no props, no keyboard behaviour and no accessible name, the row's label is the name.
 *
 * @example
 * ```tsx
 * import { Combobox } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Combobox label="Item" options={[{ value: "a", label: "A" }]} multiple />;
 * }
 * ```
 *
 * @see /components/combobox
 *
 * @internal
 */
export function RetryIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}
