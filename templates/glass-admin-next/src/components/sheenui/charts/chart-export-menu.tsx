"use client";

import { cn } from "../lib/cn";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu";
import { DownloadIcon } from "./chart-icons";
import type { ChartCardLabels } from "./chart-parts";
import type { ChartExportFormat } from "./chart-export";

/*
 * The chart card's download menu. It lives in its own file so ChartCard can load it lazily:
 * Base UI's Menu (positioner, floating-ui, list navigation) is ~45 KB gzip, and a chart page
 * shows only a small icon button until somebody opens it.
 */

/**
 * Props of ChartExportMenu: the card title, the formats to offer, whether CSV is included, `labels`
 * and the `onExport` handler.
 */
export type ChartExportMenuProps = {
  title: string;
  labels: ChartCardLabels;
  formats: readonly ChartExportFormat[];
  /** The CSV item shows only when there is data to export. */
  csv: boolean;
  onExport: (format: ChartExportFormat) => void;
};

export default function ChartExportMenu({ title, labels: t, formats, csv, onExport }: ChartExportMenuProps) {
  return (
    <Menu>
      <MenuTrigger
        aria-label={t.options(title)}
        className={cn(
          "relative inline-flex size-8 items-center justify-center rounded-sheen-full text-sheen-fg-muted transition-colors duration-(--sheen-duration-fast)",
          "hover:bg-sheen-hover hover:text-sheen-fg data-popup-open:bg-sheen-hover data-popup-open:text-sheen-fg",
          "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-1.5",
        )}
      >
        <DownloadIcon />
      </MenuTrigger>
      <MenuContent align="end">
        {formats.includes("png") && (
          <MenuItem description={t.pngHint} onClick={() => onExport("png")}>
            {t.downloadPng}
          </MenuItem>
        )}
        {formats.includes("svg") && (
          <MenuItem description={t.svgHint} onClick={() => onExport("svg")}>
            {t.downloadSvg}
          </MenuItem>
        )}
        {formats.includes("csv") && csv && (
          <MenuItem description={t.csvHint} onClick={() => onExport("csv")}>
            {t.downloadCsv}
          </MenuItem>
        )}
      </MenuContent>
    </Menu>
  );
}
