import { PropsTable } from "../../layout/Page";
import * as PROPS from "../../generated/component-props";

/**
 * The prop tables of the charts hub (about 200 KB of HTML). ChartsDocs loads this only when the reader opens the
 * API disclosure; every chart's own page carries its tables in the prerendered HTML.
 */
export default function ApiTables() {
  return (
    <div className="flex flex-col gap-8 p-5 pt-2">
      <PropsTable as="h3" title="LineChart / AreaChart" of={[PROPS.LineChart, PROPS.AreaChart]} />

      <PropsTable as="h3" title="BarChart" of={PROPS.BarChart} />

      <PropsTable as="h3" title="DonutChart" of={PROPS.DonutChart} />

      <PropsTable as="h3" title="RadialProgress" of={PROPS.RadialProgress} />

      <PropsTable as="h3" title="Sparkline" of={PROPS.Sparkline} />

      <PropsTable
        as="h3"
        title="ChartCard / ChartTable / ChartLegend"
        of={[PROPS.ChartCard, PROPS.ChartTable, PROPS.ChartLegend]}
        rows={[
          [
            "ChartTooltip docked / glide / notes",
            "boolean / boolean / string[]",
            "false / true",
            "docked pins a one-line readout to the top of the chart (narrow charts); glide eases it between points on a spring; notes adds lines under the values (e.g. an event marker). Visual only: the chart announces the same values.",
          ],
        ]}
      />

      <PropsTable
        as="h3"
        title="Sync, brush, annotations, export, live data"
        rows={[
          [
            "<ChartSyncProvider store?>",
            "component",
            "",
            "Charts inside share their crosshair by x value. createChartSyncStore() syncs charts that don't share a parent.",
          ],
          ["useChartSync(enabled?)", "hook", "", "For chart authors: { synced, external, publish(key | null) }."],
          [
            "<ChartBrush count labelOf range onRangeChange values? minSpan? height? labels?>",
            "component",
            "",
            "The range selector on its own, for custom charts. Two sliders: arrows, Page Up / Down, Home / End, Shift + arrows pan.",
          ],
          [
            "ChartAnnotation",
            '{ type: "line" | "band" | "event" | "range", … , label?, tone? }',
            "",
            "tone: neutral, accent, success, warning, danger. Lines and bands are included in the axis range.",
          ],
          [
            'exportChartImage(el, "png" | "svg", name)',
            "function",
            "",
            "Downloads the chart inside el. serializeChartSvg / chartPngBlob / chartCsv / tableCsv are exported too.",
          ],
          [
            "useLiveData(initial, { next, interval?, max?, ref?, paused?, onPausedChange? })",
            "hook",
            "",
            "{ data, setData, paused, setPaused, running }: a sliding window that pauses off-screen and in hidden tabs.",
          ],
        ]}
      />
      <PropsTable of={PROPS.ChartAnnotationsLayer} title="ChartAnnotationsLayer props" as="h3" />
      <PropsTable of={PROPS.ChartAnnouncer} title="ChartAnnouncer props" as="h3" />
      <PropsTable of={PROPS.ChartBrush} title="ChartBrush props" as="h3" />
      <PropsTable of={PROPS.ChartSyncProvider} title="ChartSyncProvider props" as="h3" />
      <PropsTable of={PROPS.ChartTooltip} title="ChartTooltip props" as="h3" />
      <PropsTable of={PROPS.LegendKey} title="LegendKey props" as="h3" />
      <PropsTable of={PROPS.TableScroll} title="TableScroll props" as="h3" />
    </div>
  );
}
