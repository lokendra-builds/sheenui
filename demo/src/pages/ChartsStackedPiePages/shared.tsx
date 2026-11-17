import { seededLcg } from "../../demo-utils";
import { Button } from "@sheenui/theme";

/* ====================================================================== */
/* Demo data (deterministic, so screenshots are stable)                    */
/* ====================================================================== */

export const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

/* ====================================================================== */
/* Shared bits                                                             */
/* ====================================================================== */

/** "Shuffle data" button: new values for the same categories, so the marks tween. */
export function Shuffle({ onClick, label = "Shuffle data" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="glass" size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}

/** Small seeded PRNG: same numbers on every load; a new seed reshuffles the "live" demos. */
export const seeded = (seed: number) => seededLcg(seed * 7919 + 13);
