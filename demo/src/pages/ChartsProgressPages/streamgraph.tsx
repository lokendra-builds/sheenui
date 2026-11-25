import { type ChartRow, type ChartSeries } from "@sheenui/theme";
import { days, oneDecimal, seeded } from "./shared";

export const hours = (n: number) => `${oneDecimal.format(n)} h`;

/* ====================================================================== */
/* Streamgraph                                                            */
/* ====================================================================== */

export const genres: ChartSeries[] = [
  { key: "pop", label: "Pop", color: 5 },
  { key: "hiphop", label: "Hip-hop", color: 2 },
  { key: "rock", label: "Rock", color: 8 },
  { key: "electronic", label: "Electronic", color: 7 },
  { key: "jazz", label: "Jazz", color: 4 },
  { key: "classical", label: "Classical", color: 1 },
  { key: "lofi", label: "Lo-fi", color: 3 },
];

/** Weekly listening hours: each genre a few seasonal swells, with seeded wobble. */
export const listening: ChartRow[] = (() => {
  const rand = seeded(9);
  // [center week, height, width] of each swell.
  const bumps: Record<string, [number, number, number][]> = {
    pop: [
      [6, 26, 5],
      [22, 14, 4],
      [36, 30, 6],
    ],
    hiphop: [
      [14, 22, 4],
      [30, 12, 3],
      [46, 24, 5],
    ],
    rock: [
      [3, 16, 4],
      [26, 24, 5],
      [40, 8, 3],
    ],
    electronic: [
      [19, 30, 4],
      [29, 20, 3],
    ],
    jazz: [
      [11, 6, 3],
      [49, 18, 4],
    ],
    classical: [
      [0, 10, 3],
      [51, 20, 3],
      [33, 5, 3],
    ],
    lofi: [
      [9, 14, 4],
      [42, 16, 4],
    ],
  };
  const start = Date.UTC(2025, 10, 3);
  const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
  return Array.from({ length: 52 }, (_, w) => {
    const row: ChartRow = { week: fmt.format(new Date(start + w * 7 * 86_400_000)) };
    for (const [key, list] of Object.entries(bumps)) {
      const v = list.reduce((sum, [c, h, sd]) => sum + h * Math.exp(-((w - c) ** 2) / (2 * sd * sd)), 1.5);
      row[key] = Math.round(v * (0.9 + rand() * 0.2) * 10) / 10;
    }
    return row;
  });
})();

export const sources: ChartSeries[] = [
  { key: "search", label: "Search", color: 7 },
  { key: "direct", label: "Direct", color: 1 },
  { key: "social", label: "Social", color: 5 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "email", label: "Email", color: 4 },
];

export const traffic: ChartRow[] = days(30).map((d, i) => {
  const rand = seeded(100 + i);
  const weekday = d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 0.72 : 1;
  const launch = i >= 17 && i <= 21 ? ([1, 1.4, 2.6, 1.8, 1.3][i - 17] ?? 1) : 1;
  return {
    day: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(d),
    search: Math.round(4200 * weekday * (0.92 + rand() * 0.16)),
    direct: Math.round(2600 * weekday * (0.9 + rand() * 0.2) * Math.sqrt(launch)),
    social: Math.round(900 * (0.8 + rand() * 0.4) * launch * launch),
    referral: Math.round(1100 * (0.85 + rand() * 0.3) * launch),
    email: Math.round(i % 7 === 2 ? 2400 : 420 * (0.8 + rand() * 0.4)),
  };
});
