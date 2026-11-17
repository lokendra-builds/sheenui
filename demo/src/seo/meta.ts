/**
 * The keyword map: one row per live route in routes.ts.
 *
 * `title` is the page part of the <title> (" | SheenUI" is appended by pageSeo); keep the full
 * title at or under 60 characters and the description at or under 155. `pnpm seo:check`
 * enforces both on the built HTML, and that every route has a row here.
 *
 * Rows whose planned slug differs from the live slug (the planned "-chart" renames, chat and
 * dashboard pages) are keyed by the live path; the rename itself is a separate step.
 */

import type { SeoMeta } from "./meta/types";
import { PAGE_MODIFIED } from "../generated/page-dates";
import { answerFor, installCommand } from "./answers";
import { seoStart } from "./meta/start";
import { seoComponents } from "./meta/components";
import { seoNavigation } from "./meta/navigation";
import { seoForms } from "./meta/forms";
import { seoOverlays } from "./meta/overlays";
import { seoLayout } from "./meta/layout";
import { seoDataDisplay } from "./meta/data-display";
import { seoChat } from "./meta/chat";
import { seoCharts } from "./meta/charts";
import { seoEffects } from "./meta/effects";
import { seoBlocks } from "./meta/blocks";
import { seoDashboards } from "./meta/dashboards";
import { seoGuides } from "./meta/guides";

export type { SeoMeta };

/** Every row of the keyword map, keyed by the route path; one table per route group in `meta/`. */
const rows: Record<string, SeoMeta> = {
  ...seoStart,
  ...seoComponents,
  ...seoNavigation,
  ...seoForms,
  ...seoOverlays,
  ...seoLayout,
  ...seoDataDisplay,
  ...seoChat,
  ...seoCharts,
  ...seoEffects,
  ...seoBlocks,
  ...seoDashboards,
  ...seoGuides,
};

/** The keyword map with each page's `answer` and `install` fields filled in (see answers.ts). */
export const seoMeta: Record<string, SeoMeta> = Object.fromEntries(
  Object.entries(rows).map(([path, row]) => [
    path,
    { ...row, answer: answerFor(path), install: installCommand(path), modified: PAGE_MODIFIED[path] },
  ]),
);
