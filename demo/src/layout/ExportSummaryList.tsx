import { EXPORT_SUMMARIES } from "../generated/export-summaries";

/**
 * The entries of the "All exports on this page" index: each name with the first sentence of its JSDoc. A module of its
 * own (Page.tsx loads it with `lazy(() => import(...))`), so the generated summaries ship as a separate chunk and cost
 * no initial JavaScript; the prerender waits for it, so the static HTML carries every summary.
 */
export default function ExportSummaryList({ names }: { names: readonly string[] }) {
  return (
    <ul className="m-0 grid list-none gap-y-1.5 p-0 text-sm">
      {names.map((name) => (
        <li key={name} className="min-w-0 [overflow-wrap:anywhere]">
          <code className="font-sheen-mono text-xs text-sheen-accent">{name}</code>
          {EXPORT_SUMMARIES[name] ? (
            <span className="text-sheen-fg-muted">{` — ${EXPORT_SUMMARIES[name]}`}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
