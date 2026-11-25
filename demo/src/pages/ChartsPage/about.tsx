import { AboutSection } from "../../layout/LazyAbout";
import { slugify } from "../../layout/heading-ids";
import { href } from "../../router";

const linkClass = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";

const FAQ = [
  {
    q: "What chart types does SheenUI include?",
    a: "Line, area, bar, donut and sparkline charts, plus funnels, heatmaps, treemaps, sankey diagrams, candlesticks, maps and more, all drawn with the same glass tooltip, legend and table view.",
  },
  {
    q: "Are the charts accessible?",
    a: "Yes. Every chart can be read with the arrow keys, announces the point it is on, and has a table view of the same data. Status colors always come with a word or an icon, and reduced motion shows final values.",
  },
  {
    q: "Can I use them with my own data?",
    a: "Each chart takes plain arrays of objects. Pass the rows and the series, and the axes, legend, tooltip and table view are built from them.",
  },
];

/** The charts hub's prose, collapsed under the gallery (the text stays in the HTML, hidden="until-found"). */
export function AboutHubCharts() {
  return (
    <AboutSection
      title="About charts"
      className="max-w-4xl"
      groups={[
        {
          items: [
            {
              value: "overview",
              title: "Overview",
              body: (
                <div className="flex max-w-3xl flex-col gap-4">
                  <p>
                    SheenUI's React charts are animated, accessible chart components for Tailwind CSS v4: smooth curves,
                    gradient fills, draw-in entrances, previous-period comparison, clickable legends, annotations, a
                    brush, synced crosshairs and PNG, SVG and CSV export. As a shadcn charts alternative, each chart has
                    a table view of the same data.
                  </p>
                  <p>
                    Open any card above for its live demo, props and keyboard map, or start with the{" "}
                    <a className={linkClass} href={href("/charts/line-chart")}>
                      line chart
                    </a>
                    , the{" "}
                    <a className={linkClass} href={href("/charts/bar-chart")}>
                      bar chart
                    </a>{" "}
                    and the{" "}
                    <a className={linkClass} href={href("/charts/donut-chart")}>
                      donut chart
                    </a>
                    .
                  </p>
                </div>
              ),
            },
          ],
        },
        {
          title: "Frequently asked questions",
          anchorPrefix: "faq-",
          items: FAQ.map(({ q, a }) => ({ value: slugify(q), title: q, body: <p>{a}</p> })),
        },
      ]}
    />
  );
}
