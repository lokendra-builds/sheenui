/**
 * The CSS selector that marks an element revealed by a JavaScript entrance (`initial={{ opacity: 0 }}`): add
 * `data-sheen-reveal` to it and render `NoScriptReveal` once near it.
 *
 * @internal Not part of the public barrel: shared by the blocks whose entrance starts from `opacity: 0`.
 * @example
 * ```tsx
 * import { REVEAL_ATTRIBUTE } from "./no-script-reveal";
 *
 * export const attrs = { [REVEAL_ATTRIBUTE]: "" };
 * ```
 *
 * @see /blocks/feature-grid
 */
export const REVEAL_ATTRIBUTE = "data-sheen-reveal";

/**
 * Makes the server-rendered content visible when JavaScript does not run. A Motion entrance writes `opacity: 0` into the
 * server HTML and the script reveals it, so without script the cards stayed invisible. This renders a `<noscript>`
 * style (the server HTML only; React never renders `<noscript>` children on the client) that overrides the inline
 * start state of every `data-sheen-reveal` element. With script the entrance plays as before.
 *
 * Accessibility: the content was always in the accessibility tree; this makes it visible too.
 *
 * @internal Not part of the public barrel: render it once next to the elements that carry `data-sheen-reveal`.
 * @example
 * ```tsx
 * import { NoScriptReveal } from "./no-script-reveal";
 *
 * export function Example() {
 *   return <NoScriptReveal />;
 * }
 * ```
 *
 * @see /blocks/feature-grid
 */
export function NoScriptReveal() {
  return (
    // In a hidden box so the empty <noscript> block takes no room (and no flex gap); a style element applies wherever it is.
    <div hidden>
      <noscript>
        <style>{`[${REVEAL_ATTRIBUTE}]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </div>
  );
}
