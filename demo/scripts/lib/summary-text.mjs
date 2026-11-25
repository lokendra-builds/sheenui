// Plain text of a JSDoc summary for the docs' export index: `{@link Table}` -> `Table`, backticks dropped.
// (Its own module: the page, gen-props.mjs and docs-check.mjs must agree on the exact sentence.)

/** @param {string} summary The first JSDoc sentence as the TypeScript compiler prints it. */
export function cleanSummary(summary) {
  return (summary ?? "")
    .replace(/\{@link(?:code|plain)?\s+([^}|\s]+)\s*(?:\|\s*([^}]*))?\}/g, (_, target, label) =>
      (label || target).trim(),
    )
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
