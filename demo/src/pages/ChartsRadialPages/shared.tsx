import { formatCompact } from "@sheenui/theme";

export const CHARTS = "theme/src/components/charts/";

/* ====================================================================== */
/* Bullet                                                                 */
/* ====================================================================== */

export const usdK = (n: number) => (n === 0 ? "$0" : `$${formatCompact(n)}K`);
