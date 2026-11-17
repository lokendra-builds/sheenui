import { type TrackerBlock, type TrackerStatus } from "@sheenui/theme";
import { days, seeded } from "./shared";

/* ====================================================================== */
/* Tracker                                                                */
/* ====================================================================== */

/** 90 days of uptime with a few realistic incidents. */
function uptimeDays(
  seed: number,
  count: number,
  incidents: Partial<Record<number, ["degraded" | "down", string]>>,
): TrackerBlock[] {
  const rand = seeded(seed);
  return days(count).map((date, i) => {
    const incident = incidents[i];
    if (incident) return { label: date, status: incident[0], detail: incident[1] };
    if (i < 3 && seed === 7) return { label: date, status: "none", detail: "Monitoring not yet enabled" };
    return {
      label: date,
      status: "ok",
      detail: rand() > 0.85 ? "No incidents · 1 maintenance window" : "No incidents",
    };
  });
}

export const apiUptime = uptimeDays(7, 90, {
  18: ["degraded", "Elevated error rate on /v2/search for 22 min"],
  19: ["degraded", "Slow responses in eu-west for 41 min"],
  47: ["down", "Full outage for 14 min: expired TLS certificate"],
  71: ["degraded", "Webhook delivery delayed by up to 6 min"],
  86: ["degraded", "Partial outage of file uploads for 9 min"],
});

export const services = [
  { name: "API", uptime: "99.98%", data: uptimeDays(11, 30, { 9: ["degraded", "Elevated latency for 18 min"] }) },
  { name: "Dashboard", uptime: "100%", data: uptimeDays(12, 30, {}) },
  {
    name: "Webhooks",
    uptime: "99.71%",
    data: uptimeDays(13, 30, {
      4: ["down", "Delivery halted for 2 h 5 min"],
      5: ["degraded", "Backlog drained over 3 h"],
      22: ["degraded", "Retries delayed for 35 min"],
    }),
  },
];

export const buildStatuses: Record<string, TrackerStatus> = {
  passed: {
    label: "Passed",
    tone: 7,
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 8.5l3 3 6-7" />
      </svg>
    ),
  },
  failed: {
    label: "Failed",
    tone: 8,
    flag: true,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    ),
  },
  flaky: {
    label: "Passed on retry",
    tone: 4,
    striped: true,
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5V5h-2.5" />
      </svg>
    ),
  },
  none: {
    label: "Cancelled",
    tone: "neutral",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M4 8h8" />
      </svg>
    ),
  },
};

export const builds: TrackerBlock[] = (() => {
  const rand = seeded(42);
  return Array.from({ length: 48 }, (_, i) => {
    const r = rand();
    const n = 1203 + i;
    const status = r > 0.93 ? "failed" : r > 0.83 ? "flaky" : r > 0.79 ? "none" : "passed";
    const minutes = 6 + Math.round(rand() * 5);
    return {
      label: `Build #${n}`,
      status,
      detail:
        status === "failed"
          ? "e2e: checkout.spec.ts timed out"
          : status === "none"
            ? "Superseded by a newer push"
            : `${minutes} min ${Math.round(rand() * 59)} s`,
    };
  });
})();
