/* =====================================================================
 * Scroll area
 * ===================================================================== */

export const releases = Array.from({ length: 18 }, (_, i) => ({
  version: `v2.${14 - Math.floor(i / 3)}.${2 - (i % 3)}`,
  note: [
    "Glass fallback for reduced transparency",
    "Breadcrumb collapses before paint",
    "Stepper connector stagger",
    "Toolbar gliding pill",
    "Timeline live feed",
    "Scroll area edge fades",
  ][i % 6],
}));

export const viewed = ["Aurora", "Nebula", "Lagoon", "Ember", "Glacier", "Meadow", "Dune", "Harbor"];

export const scrollVerticalCode = `
import { ScrollArea } from "@sheenui/theme";

const releases = [
  { version: "2.14.0", notes: "Stepper and Timeline." },
  { version: "2.13.0", notes: "Data table density." },
  { version: "2.12.0", notes: "Side drawer." },
];

export function Example() {
  // Round it like its card: the keyboard focus ring follows the radius.

  return (
    <ScrollArea className="h-72 rounded-b-sheen-lg" label="Release notes">
      <ul>{releases.map((r) => <li key={r.version}>
            <b>{r.version}</b> {r.notes}
          </li>)}</ul>
    </ScrollArea>
  );
}`;

export const scrollHorizontalCode = `
import { GlassCard, ScrollArea } from "@sheenui/theme";

const themes = ["Aurora", "Liquid", "Midnight", "Paper", "Sunset", "Mono"];

export function Example() {
  // Glass cards inside: use the "shadow" fade (a mask would stop their blur), and level 1 for a long
  // strip of small tiles (it has no blur of its own, so six tiles in view stay inside the glass budget).

  return (
    <ScrollArea orientation="horizontal" fade="shadow" label="Recently viewed">
      <ul className="flex w-max gap-3">
        {themes.map((t) => <li key={t}><GlassCard level={1} className="w-44 p-4">
              {t}
            </GlassCard></li>)}
      </ul>
    </ScrollArea>
  );
}`;

export const scrollBothCode = `
import { GlassCard, ScrollArea } from "@sheenui/theme";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const regions = [
  "Amsterdam", "Bengaluru", "Cape Town", "Dublin", "Frankfurt", "Jakarta", "London", "Montréal", "Mumbai", "Oregon",
  "Osaka", "Paris", "São Paulo", "Seoul", "Singapore", "Stockholm", "Sydney", "Tokyo", "Virginia", "Zürich",
];

export function Example() {
  return (
    <GlassCard className="w-full max-w-2xl overflow-hidden p-0">
      <ScrollArea orientation="both" className="h-80 rounded-sheen-lg" scrollbars="always" label="Usage by region">
        <table className="w-max text-start [:where(&)_th]:text-start text-sm">
          <thead className="text-xs text-sheen-fg-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Region
              </th>
              {months.map((m) => (
                <th key={m} scope="col" className="px-4 py-3 text-end font-medium">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region, r) => (
              <tr key={region} className="border-t border-sheen-border">
                <th scope="row" className="px-4 py-2.5 font-medium whitespace-nowrap">
                  {region}
                </th>
                {months.map((m, c) => (
                  <td key={m} className="px-4 py-2.5 text-end text-sheen-fg-muted tabular-nums">
                    {(((r + 3) * (c + 7) * 37) % 900) + 100}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </GlassCard>
  );
}`;
