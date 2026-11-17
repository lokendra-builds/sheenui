import { Badge } from "@sheenui/theme";

import type { BadgeScene } from "./ShowcaseStage.badge";

const LOOK = {
  pending: { tone: "warning", label: "Pending", pulse: true },
  processing: { tone: "accent", label: "Processing", pulse: true },
  paid: { tone: "success", label: "Paid", pulse: false },
} as const;

/** The live Badges on their stage: the status badge changes tone and word as the invoice moves on. */
export function BadgeScene({ scene }: { scene: BadgeScene }) {
  const look = LOOK[scene.status];
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Invoice #1042</p>
      <div className="sheen-stage-slot flex gap-2">
        <Badge tone="neutral">$1,240.00</Badge>
        <Badge key={scene.status} tone={look.tone} dot pulse={look.pulse}>
          {look.label}
        </Badge>
      </div>
    </div>
  );
}
