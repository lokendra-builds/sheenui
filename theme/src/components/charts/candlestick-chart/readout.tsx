"use client";

import { Button } from "../../button/button";
import { cn } from "../../../lib/cn";
import { LegendKey } from "../chart-parts";
import { ResetIcon, ZoomIcon } from "../chart-icons";
import { Triangle, type CandlestickChartLabels, type Parsed } from "./model";

/** The line above the chart: the read (or latest) candle's date, prices, move, volume and average, and the zoom buttons. */
export function CandleReadout({
  candle,
  dateText,
  labels: t,
  widest,
  priceFormat,
  volumeFormat,
  dir,
  moveText,
  showVolume,
  average,
  maColor,
  zoomButtons,
  zoomed,
  canZoomIn,
  onZoomOut,
  onZoomIn,
  onReset,
}: {
  /** The candle being read, or the latest one. */
  candle: Parsed | undefined;
  /** Its full date, already formatted. */
  dateText: string;
  labels: CandlestickChartLabels;
  /** Characters of the widest price, so the numbers keep a fixed width. */
  widest: number;
  priceFormat: (value: number) => string;
  volumeFormat: (value: number) => string;
  dir: "up" | "down" | "flat";
  moveText: string;
  showVolume: boolean;
  average: number;
  maColor: string;
  /** Whether the zoom buttons are shown at all. */
  zoomButtons: boolean;
  zoomed: boolean;
  canZoomIn: boolean;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
      <bdi aria-hidden className="text-sheen-fg-muted">
        {candle ? dateText : ""}
      </bdi>
      {candle && (
        <span aria-hidden className="flex flex-wrap items-center gap-x-2.5 gap-y-1 tabular-nums">
          {(
            [
              [t.openShort, candle.o],
              [t.highShort, candle.h],
              [t.lowShort, candle.l],
              [t.closeShort, candle.c],
            ] as const
          ).map(([k, v]) => (
            <span key={k} className="whitespace-nowrap">
              <span className="text-sheen-fg-muted">{k}</span>{" "}
              <bdi className="inline-block text-end font-semibold text-sheen-fg" style={{ minWidth: `${widest}ch` }}>
                {priceFormat(v)}
              </bdi>
            </span>
          ))}
        </span>
      )}
      {candle && (
        <span
          aria-hidden
          className={cn(
            "inline-flex items-center gap-1 rounded-sheen-full px-2 py-0.5 font-semibold whitespace-nowrap tabular-nums",
            dir === "up"
              ? "bg-sheen-success-soft text-sheen-success-text"
              : dir === "down"
                ? "bg-sheen-danger-soft text-sheen-danger-text"
                : "bg-sheen-hover text-sheen-fg-muted",
          )}
        >
          {dir !== "flat" && <Triangle down={dir === "down"} />}
          <bdi>{moveText}</bdi>
        </span>
      )}
      {showVolume && candle?.v !== null && candle?.v !== undefined && (
        <span aria-hidden className="whitespace-nowrap tabular-nums">
          <span className="text-sheen-fg-muted">{t.volumeShort}</span>{" "}
          <bdi className="font-semibold text-sheen-fg">{volumeFormat(candle.v)}</bdi>
        </span>
      )}
      {average > 0 && (
        <span aria-hidden className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
          <LegendKey color={maColor} kind="line" />
          <span className="text-sheen-fg-muted">{t.average(average)}</span>
          <bdi className="font-semibold text-sheen-fg">
            {candle?.ma !== null && candle?.ma !== undefined ? priceFormat(candle.ma) : "–"}
          </bdi>
        </span>
      )}
      {zoomButtons && (
        <span className="ms-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.zoomOut}
            disabled={!zoomed}
            className="size-8 any-pointer-coarse:size-11"
            onClick={onZoomOut}
          >
            <ZoomIcon minus />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.zoomIn}
            disabled={!canZoomIn}
            className="size-8 any-pointer-coarse:size-11"
            onClick={onZoomIn}
          >
            <ZoomIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.resetZoom}
            disabled={!zoomed}
            className="size-8 any-pointer-coarse:size-11"
            onClick={onReset}
          >
            <ResetIcon />
          </Button>
        </span>
      )}
    </div>
  );
}
