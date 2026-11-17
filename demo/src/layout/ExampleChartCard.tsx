import { ChartCard as ThemeChartCard, type ChartCardProps } from "@sheenui/theme";

/**
 * The live ChartCard of a docs example: the card title is a paragraph (`headingLevel="none"`), so the many example
 * cards on a page stay out of its heading outline (the section headings and the FAQ keep the outline). The code
 * shown beside the example imports the real `ChartCard`, with its default heading.
 */
export function ChartCard(props: ChartCardProps) {
  return <ThemeChartCard headingLevel="none" {...props} />;
}
