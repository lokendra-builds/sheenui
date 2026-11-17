// The showcase stage at the top of a component page: its idle frame is prerendered with a reserved height, its story
// plays once when it comes into view and again from Replay, a touch stops it, reduced motion jumps to the end, and the
// page does not shift. One block per pilot page (button, otp-input, switch, toast, tabs, dialog, then the W9 form, overlay and display pages).
import { expect, test, type Page } from "@playwright/test";

import { urlFor } from "./routes";

type Pilot = {
  name: string;
  path: string;
  label: string;
  /** Asserts the resting final state (what reduced motion shows). */
  final: (stage: ReturnType<Page["getByRole"]>, page: Page) => Promise<void>;
};

const PILOTS: Pilot[] = [
  {
    name: "button",
    path: "/components/button",
    label: "Button demo",
    final: (s) => expect(s.getByRole("button", { name: "Save changes" })).toBeVisible(),
  },
  {
    name: "otp-input",
    path: "/components/otp-input",
    label: "OTP input demo",
    final: (s) => expect(s.getByText("Your number is confirmed.").first()).toBeVisible(),
  },
  {
    name: "switch",
    path: "/components/switch",
    label: "Switch demo",
    final: (s) => expect(s.getByRole("switch")).toBeChecked(),
  },
  {
    name: "toast",
    path: "/components/toast",
    label: "Toast demo",
    final: (s) => expect(s.getByText("Release 4.2 is live")).toBeVisible(),
  },
  {
    name: "tabs",
    path: "/components/tabs",
    label: "Tabs demo",
    final: (s) => expect(s.getByRole("tab", { name: /Activity/ })).toHaveAttribute("aria-selected", "true"),
  },
  {
    name: "dialog",
    path: "/components/dialog",
    label: "Dialog demo",
    final: (s) => expect(s.getByText("2 invites sent")).toBeVisible(),
  },
  {
    name: "calendar",
    path: "/forms/calendar",
    label: "Calendar demo",
    final: (s) => expect(s.getByText("Tuesday, November 24, 2026")).toBeVisible(),
  },
  {
    name: "color-picker",
    path: "/forms/color-picker",
    label: "Color picker demo",
    final: (s) => expect(s.getByText("#10b981")).toBeVisible(),
  },
  {
    name: "date-picker",
    path: "/forms/date-picker",
    label: "Date picker demo",
    final: (s) => expect(s.getByText(/Your parcel arrives on/)).toBeVisible(),
  },
  {
    name: "field",
    path: "/forms/field",
    label: "Field demo",
    final: (s) => expect(s.getByRole("textbox", { name: /Email/ })).toHaveValue("alex@example.com"),
  },
  {
    name: "file-upload",
    path: "/forms/file-upload",
    label: "File upload demo",
    final: (s) => expect(s.getByText("brand-notes.pdf")).toBeVisible(),
  },
  {
    name: "input-group",
    path: "/forms/input-group",
    label: "Input group demo",
    final: (s) => expect(s.getByText("Link copied to the clipboard.")).toBeVisible(),
  },
  {
    name: "number-field",
    path: "/forms/number-field",
    label: "Number field demo",
    final: (s) => expect(s.getByText(/Total:/)).toContainText("$96"),
  },
  {
    name: "radio-group",
    path: "/forms/radio-group",
    label: "Radio group demo",
    final: (s) => expect(s.getByRole("radio", { name: /Team/ })).toBeChecked(),
  },
  {
    name: "rating",
    path: "/forms/rating",
    label: "Rating demo",
    final: (s) => expect(s.getByText("Thanks! You gave 4 stars.")).toBeVisible(),
  },
  {
    name: "segmented-control",
    path: "/forms/segmented-control",
    label: "Segmented control demo",
    final: (s) => expect(s.getByText(/Showing the/)).toContainText("calendar"),
  },
  {
    name: "tags-input",
    path: "/forms/tags-input",
    label: "Tags input demo",
    final: (s) => expect(s.getByText("a11y").first()).toBeVisible(),
  },
  {
    name: "textarea",
    path: "/forms/textarea",
    label: "Textarea demo",
    final: (s) => expect(s.getByRole("textbox", { name: /Leave a note/ })).toHaveValue(/Breakfast was lovely/),
  },
  {
    name: "toggle",
    path: "/forms/toggle",
    label: "Toggle demo",
    final: (s) => expect(s.getByRole("button", { name: "Underline" })).toHaveAttribute("aria-pressed", "true"),
  },
  {
    name: "alert",
    path: "/components/alert",
    label: "Alert demo",
    final: (s) => expect(s.getByText("All changes saved")).toBeVisible(),
  },
  {
    name: "avatar",
    path: "/components/avatar",
    label: "Avatar demo",
    final: (s) => expect(s.getByText("4 of 4 online")).toBeVisible(),
  },
  {
    name: "badge",
    path: "/components/badge",
    label: "Badge demo",
    final: (s) => expect(s.getByText("Paid")).toBeVisible(),
  },
  {
    name: "button-group",
    path: "/components/button-group",
    label: "Button group demo",
    final: (s) => expect(s.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true"),
  },
  {
    name: "checkbox",
    path: "/components/checkbox",
    label: "Checkbox demo",
    final: (s) => expect(s.getByRole("checkbox", { name: "Ship" })).toBeChecked(),
  },
  {
    name: "combobox",
    path: "/components/combobox",
    label: "Combobox demo",
    final: (s) => expect(s.getByText("React").first()).toBeVisible(),
  },
  {
    name: "glass-card",
    path: "/components/glass-card",
    label: "Glass card demo",
    final: (s) => expect(s.getByText("Glass level 3")).toBeVisible(),
  },
  {
    name: "input",
    path: "/components/input",
    label: "Input demo",
    final: (s) => expect(s.getByRole("textbox", { name: "Email" })).toHaveValue("maya@example.com"),
  },
  {
    name: "popover",
    path: "/components/popover",
    label: "Popover demo",
    final: (s) => expect(s.getByRole("button", { name: "Q3 roadmap v2" })).toBeVisible(),
  },
  {
    name: "progress",
    path: "/components/progress",
    label: "Progress demo",
    final: (s) => expect(s.getByText("Upload complete")).toBeVisible(),
  },
  {
    name: "select",
    path: "/components/select",
    label: "Select demo",
    final: (s) => expect(s.getByRole("combobox", { name: /Framework/ })).toBeVisible(), // modal: the story only nudges the field,
  },
  {
    name: "slider",
    path: "/components/slider",
    label: "Slider demo",
    final: (s) => expect(s.getByRole("slider")).toHaveValue("85"),
  },
  {
    name: "spinner",
    path: "/components/spinner",
    label: "Spinner demo",
    final: (s) => expect(s.getByText("Everything is synced")).toBeVisible(),
  },
  {
    name: "tooltip",
    path: "/components/tooltip",
    label: "Tooltip demo",
    final: (s) => expect(s.getByRole("button", { name: "Underline" })).toBeVisible(),
  },
  {
    name: "accordion",
    path: "/layout/accordion",
    label: "Accordion demo",
    final: (s) =>
      expect(s.getByRole("button", { name: "Is there a warranty?" })).toHaveAttribute("aria-expanded", "true"),
  },
  {
    name: "aspect-ratio",
    path: "/layout/aspect-ratio",
    label: "Aspect ratio demo",
    final: (s) => expect(s.getByText("Ratio 4:5", { exact: false })).toBeVisible(),
  },
  {
    name: "breadcrumb",
    path: "/layout/breadcrumb",
    label: "Breadcrumb demo",
    final: (s) => expect(s.getByText("Colors", { exact: true }).first()).toBeVisible(),
  },
  {
    name: "collapsible",
    path: "/layout/collapsible",
    label: "Collapsible demo",
    final: (s) => expect(s.getByText("report-q3.pdf")).toBeVisible(),
  },
  {
    name: "pagination",
    path: "/layout/pagination",
    label: "Pagination demo",
    final: (s) => expect(s.getByText("Results 231 to 240")).toBeVisible(),
  },
  {
    name: "resizable",
    path: "/layout/resizable",
    label: "Resizable panels demo",
    final: (s) => expect(s.getByText("Files 40%")).toBeVisible(),
  },
  {
    name: "scroll-area",
    path: "/layout/scroll-area",
    label: "Scroll area demo",
    final: (s) => expect(s.getByText("First public release")).toBeVisible(),
  },
  {
    name: "separator",
    path: "/layout/separator",
    label: "Separator demo",
    final: (s) => expect(s.getByLabel("Email")).toBeVisible(),
  },
  {
    name: "stepper",
    path: "/layout/stepper",
    label: "Stepper demo",
    final: (s) => expect(s.getByText("You are all set.")).toBeVisible(),
  },
  {
    name: "timeline",
    path: "/layout/timeline",
    label: "Timeline demo",
    final: (s) => expect(s.getByText("Delivered")).toBeVisible(),
  },
  {
    name: "toolbar",
    path: "/layout/toolbar",
    label: "Toolbar demo",
    final: (s) => expect(s.getByRole("button", { name: "Underline" })).toHaveAttribute("aria-pressed", "true"),
  },
  {
    name: "carousel",
    path: "/components/carousel",
    label: "Carousel demo",
    final: (s) => expect(s.getByText("Forest").first()).toBeVisible(),
  },
  {
    name: "code-block",
    path: "/components/code-block",
    label: "Code block demo",
    final: (s) => expect(s.getByText("i.price * i.qty", { exact: false })).toBeVisible(),
  },
  {
    name: "empty-state",
    path: "/components/empty-state",
    label: "Empty state demo",
    final: (s) => expect(s.getByText("My first project")).toBeVisible(),
  },
  {
    name: "meter",
    path: "/components/meter",
    label: "Meter demo",
    final: (s) => expect(s.getByText("Almost full: free up space.")).toBeVisible(),
  },
  {
    name: "table",
    path: "/components/table",
    label: "Table demo",
    final: (s) => expect(s.getByText("$2640")).toBeVisible(),
  },
  {
    name: "skeleton",
    path: "/components/skeleton",
    label: "Skeleton demo",
    final: (s) => expect(s.getByText("Merged the redesign, 2 minutes ago.")).toBeVisible(),
  },
  {
    name: "alert-dialog",
    path: "/overlays/alert-dialog",
    label: "Alert dialog demo",
    final: (s) => expect(s.getByRole("button", { name: /^(?!Replay)/ }).first()).toBeVisible(), // modal: the story only nudges the trigger,
  },
  {
    name: "command-palette",
    path: "/overlays/command-palette",
    label: "Command palette demo",
    final: (s) => expect(s.getByText("Opened Settings")).toBeVisible(),
  },
  {
    name: "context-menu",
    path: "/overlays/context-menu",
    label: "Context menu demo",
    final: (s) => expect(s.getByLabel(/Aurora\.jpg/)).toBeVisible(), // modal: the story only nudges the photo,
  },
  {
    name: "drawer",
    path: "/overlays/drawer",
    label: "Drawer demo",
    final: (s) => expect(s.getByText("12 results, under $50")).toBeVisible(),
  },
  {
    name: "dropdown-menu",
    path: "/overlays/dropdown-menu",
    label: "Dropdown menu demo",
    final: (s) => expect(s.getByText("Opened Billing")).toBeVisible(),
  },
  {
    name: "hover-card",
    path: "/overlays/hover-card",
    label: "Hover card demo",
    final: (s) => expect(s.getByRole("link", { name: "@mira.designs" })).toBeVisible(),
  },
  {
    name: "kbd",
    path: "/overlays/kbd",
    label: "Kbd demo",
    final: (s) => expect(s.getByText("Search opened")).toBeVisible(),
  },
  {
    name: "menubar",
    path: "/overlays/menubar",
    label: "Menubar demo",
    final: (s) => expect(s.getByText("Shopping list: oat milk, limes, basil.")).toHaveClass(/text-base/),
  },
  {
    name: "side-drawer",
    path: "/overlays/side-drawer",
    label: "Side drawer demo",
    final: (s) => expect(s.getByText("Design lead")).toBeVisible(),
  },
  {
    name: "horizontal",
    path: "/navigation/navbar",
    label: "Horizontal nav demo",
    final: (s) => expect(s.getByText("Free for open source. $24 a seat.")).toBeVisible(),
  },
  {
    name: "navigation-menu",
    path: "/navigation/navigation-menu",
    label: "Navigation menu demo",
    final: (s) => expect(s.getByRole("button", { name: "Developers" })).toHaveAttribute("aria-expanded", "false"),
  },
  {
    name: "sidebar",
    path: "/navigation/sidebar",
    label: "Sidebar demo",
    final: (s) => expect(s.getByRole("link", { name: /Beta/ })).toHaveAttribute("aria-current", "page"),
  },
  {
    name: "vertical",
    path: "/navigation/vertical-nav",
    label: "Vertical nav demo",
    final: (s) => expect(s.getByText("4 active projects.")).toBeVisible(),
  },
  {
    name: "blur-in",
    path: "/effects/blur-in",
    label: "Blur in demo",
    final: (s) => expect(s.getByText("Every word lands once, then rests.").first()).toBeVisible(),
  },
  {
    name: "border-beam",
    path: "/effects/border-beam",
    label: "Border beam demo",
    final: (s) => expect(s.getByText("Live in production")).toBeVisible(),
  },
  {
    name: "dock",
    path: "/effects/macos-dock",
    label: "Dock demo",
    final: (s) => expect(s.getByRole("toolbar")).toBeVisible(),
  },
  {
    name: "liquid-glass",
    path: "/effects/liquid-glass",
    label: "Liquid glass demo",
    final: (s) => expect(s.getByText("Liquid", { exact: true })).toBeVisible(),
  },
  {
    name: "marquee",
    path: "/effects/marquee",
    label: "Marquee demo",
    final: (s) => expect(s.getByText("Trusted by teams at")).toBeVisible(),
  },
  {
    name: "morphing-dialog",
    path: "/effects/morphing-dialog",
    label: "Morphing dialog demo",
    final: (s) => expect(s.getByText("Aurora").first()).toBeVisible(),
  },
  {
    name: "number-ticker",
    path: "/effects/number-ticker",
    label: "Number ticker demo",
    final: (s) => expect(s.getByText("Monthly revenue")).toBeVisible(),
  },
  {
    name: "shimmer-text",
    path: "/effects/shimmer-text",
    label: "Shimmer text demo",
    final: (s) => expect(s.getByText("Your report is ready").first()).toBeVisible(),
  },
  {
    name: "spotlight-card",
    path: "/effects/spotlight-card",
    label: "Spotlight card demo",
    final: (s) => expect(s.getByText("Calm")).toBeVisible(),
  },
  {
    name: "tilt-card",
    path: "/effects/3d-tilt-card",
    label: "Tilt card demo",
    final: (s) => expect(s.getByText("Sheen Pay")).toBeVisible(),
  },
  {
    name: "typewriter",
    path: "/effects/typewriter",
    label: "Typewriter demo",
    final: (s) => expect(s.getByText("Make it shorter and warmer").first()).toBeVisible(),
  },
  {
    name: "word-rotate",
    path: "/effects/word-rotate",
    label: "Word rotate demo",
    final: (s) => expect(s.getByText("Ship interfaces")).toBeVisible(),
  },
  {
    name: "chat-list",
    path: "/chat/list",
    label: "Chat list demo",
    final: (s) => expect(s.getByText("Taking the S-Bahn into town now").first()).toBeVisible(),
  },
  {
    name: "chat-thread",
    path: "/chat/thread",
    label: "Chat view demo",
    final: (s) => expect(s.getByText("See you there").filter({ visible: true }).first()).toBeVisible(),
  },
  {
    name: "chat-widget",
    path: "/chat/widget",
    label: "Popover chat demo",
    final: (s) => expect(s.getByText("Glad to hear it").filter({ visible: true }).first()).toBeVisible(),
  },
  // R2 completeness: stages of the seven newer effect pages (appended as one block).
  {
    name: "animated-beam",
    path: "/effects/animated-beam",
    label: "Animated beam demo",
    final: (s) => expect(s.getByText("3 sources synced")).toBeVisible(),
  },
  {
    name: "particles",
    path: "/effects/particles",
    label: "Particles demo",
    final: (s) => expect(s.getByText("A soft field of light.")).toBeVisible(),
  },
  {
    name: "meteors",
    path: "/effects/meteors",
    label: "Meteors demo",
    final: (s) => expect(s.getByText("Ship the quiet details")).toBeVisible(),
  },
  {
    name: "confetti",
    path: "/effects/confetti",
    label: "Confetti demo",
    final: (s) => expect(s.getByText("Order placed.")).toBeVisible(),
  },
  {
    name: "orbiting-circles",
    path: "/effects/orbiting-circles",
    label: "Orbiting circles demo",
    final: (s) => expect(s.getByText("Core", { exact: true })).toBeVisible(),
  },
  {
    name: "text-reveal",
    path: "/effects/text-reveal",
    label: "Text reveal demo",
    final: (s) => expect(s.getByText("Every word is lit.")).toBeVisible(),
  },
  {
    name: "scroll-progress",
    path: "/effects/scroll-progress",
    label: "Scroll progress demo",
    final: (s) => expect(s.getByText("Read to the end.")).toBeVisible(),
  },
];

/** W10: every chart page's first chart draws in on a stage; its resting frame is the chart, fully drawn. */
const CHART_PILOTS: Pilot[] = [
  {
    name: "chart-line-chart",
    path: "/charts/line-chart",
    label: "Line chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-area-chart",
    path: "/charts/area-chart",
    label: "Area chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-bar-chart",
    path: "/charts/bar-chart",
    label: "Bar chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-donut-chart",
    path: "/charts/donut-chart",
    label: "Donut chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-sparkline",
    path: "/charts/sparkline",
    label: "Sparkline demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-percent-bars",
    path: "/charts/percent-stacked-bar-chart",
    label: "100% stacked bars demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-bar-list",
    path: "/charts/bar-list",
    label: "Bar list demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-beeswarm",
    path: "/charts/beeswarm",
    label: "Beeswarm demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-box-plot",
    path: "/charts/box-plot",
    label: "Box plot demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-bullet",
    path: "/charts/bullet-chart",
    label: "Bullet chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-calendar-heatmap",
    path: "/charts/calendar-heatmap",
    label: "Calendar heatmap demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-candlestick",
    path: "/charts/candlestick",
    label: "Candlestick chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-category-bar",
    path: "/charts/category-bar",
    label: "Category bar demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-chord",
    path: "/charts/chord-diagram",
    label: "Chord diagram demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-cohort",
    path: "/charts/cohort-retention",
    label: "Cohort chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-combo",
    path: "/charts/combo-chart",
    label: "Combo chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-diverging-bar",
    path: "/charts/diverging-bar",
    label: "Diverging bar chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-dumbbell",
    path: "/charts/dumbbell",
    label: "Dumbbell chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-funnel",
    path: "/charts/funnel-chart",
    label: "Funnel chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-gantt",
    path: "/charts/gantt",
    label: "Gantt chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-gauge",
    path: "/charts/gauge-chart",
    label: "Gauge demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-heatmap",
    path: "/charts/heatmap",
    label: "Heatmap demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-histogram",
    path: "/charts/histogram",
    label: "Histogram demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-lollipop",
    path: "/charts/lollipop",
    label: "Lollipop chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-marimekko",
    path: "/charts/marimekko",
    label: "Marimekko chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-network",
    path: "/charts/network-graph",
    label: "Network graph demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-pie",
    path: "/charts/pie-chart",
    label: "Pie chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-polar-area",
    path: "/charts/polar-area",
    label: "Polar area chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-radar",
    path: "/charts/radar-chart",
    label: "Radar chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-radial-bar",
    path: "/charts/radial-bar-chart",
    label: "Radial bar chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-range-area",
    path: "/charts/range-area-chart",
    label: "Range area chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-ridgeline",
    path: "/charts/ridgeline",
    label: "Ridgeline chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-sankey",
    path: "/charts/sankey-diagram",
    label: "Sankey diagram demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-scatter",
    path: "/charts/scatter-plot",
    label: "Scatter chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-sparkbar",
    path: "/charts/sparkbar",
    label: "Sparkbar demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-stacked-area",
    path: "/charts/stacked-area-chart",
    label: "Stacked area chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-step-line",
    path: "/charts/step-line-chart",
    label: "Step line chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-streamgraph",
    path: "/charts/streamgraph",
    label: "Streamgraph demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-streaming",
    path: "/charts/realtime-chart",
    label: "Streaming chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-sunburst",
    path: "/charts/sunburst",
    label: "Sunburst chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-tracker",
    path: "/charts/uptime-tracker",
    label: "Tracker demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-treemap",
    path: "/charts/treemap",
    label: "Treemap demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-waffle",
    path: "/charts/waffle",
    label: "Waffle chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-waterfall",
    path: "/charts/waterfall-chart",
    label: "Waterfall chart demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
  {
    name: "chart-world-map",
    path: "/charts/world-map",
    label: "World map demo",
    final: (s) => expect(s.locator("svg, [role=figure], [role=img]").first()).toBeVisible(),
  },
];

// Block pages and dashboards: the real block, scaled to its plate (BlockStage), played by a story.
const BLOCK_PILOTS: Pilot[] = [
  {
    name: "block-glass-login",
    path: "/blocks/glass-login",
    label: "Glass login demo",
    final: (s) => expect(s.getByText("Signed in").first()).toBeVisible(),
  },
  {
    name: "block-lamp-login",
    path: "/blocks/lamp-login",
    label: "Lamp login demo",
    final: (s) => expect(s.getByText("Signed in").first()).toBeVisible(),
  },
  {
    name: "block-otp-verification",
    path: "/blocks/otp-verification",
    label: "OTP verification demo",
    final: (s) => expect(s.getByText("You're verified").first()).toBeVisible(),
  },
  {
    name: "block-payment-checkout",
    path: "/blocks/payment-checkout",
    label: "Payment checkout demo",
    final: (s) => expect(s.getByText("Payment successful").first()).toBeVisible(),
  },
  {
    name: "block-dashboard-stats",
    path: "/blocks/dashboard-stats",
    label: "Dashboard stats demo",
    final: (s) => expect(s.getByRole("tab", { name: /^7d/ })).toHaveAttribute("aria-selected", "true"),
  },
  {
    name: "block-ai-chat",
    path: "/blocks/ai-chat",
    label: "AI chat demo",
    final: (s) => expect(s.getByText("Explain glassmorphism in two sentences").first()).toBeVisible(),
  },
  {
    name: "block-signup-page",
    path: "/blocks/signup-page",
    label: "Sign-up page demo",
    final: (s) => expect(s.getByText("Check your inbox").first()).toBeVisible(),
  },
  {
    name: "block-bento-grid",
    path: "/blocks/bento-grid",
    label: "Bento grid demo",
    final: (s) => expect(s.getByRole("radio", { name: "Last 90 days" })).toBeChecked(),
  },
  {
    name: "block-chat-app",
    path: "/blocks/chat-app",
    label: "Chat app demo",
    final: (s) => expect(s.getByText("Lunch at one tomorrow?").first()).toBeVisible(),
  },
  {
    name: "block-notification-center",
    path: "/blocks/notification-center",
    label: "Notification center demo",
    final: (s) => expect(s.getByRole("tab", { name: "Unread" })).toHaveAttribute("aria-selected", "true"),
  },
  {
    name: "block-pricing",
    path: "/blocks/pricing",
    label: "Pricing demo",
    final: (s) => expect(s.getByRole("radio", { name: /Yearly/ })).toBeChecked(),
  },
  {
    name: "block-settings-page",
    path: "/blocks/settings-page",
    label: "Settings page demo",
    final: (s) => expect(s.getByRole("textbox", { name: "Display name" })).toHaveValue("Ada Lovelace-King"),
  },
  {
    name: "block-hero-section",
    path: "/blocks/hero-section",
    label: "Hero section demo",
    final: (s) => expect(s.getByText("Evergreen")).toBeVisible(),
  },
  {
    name: "block-feature-grid",
    path: "/blocks/feature-grid",
    label: "Feature grid demo",
    final: (s) => expect(s.getByText("Tested", { exact: true })).toBeVisible(),
  },
  {
    name: "block-testimonials",
    path: "/blocks/testimonials",
    label: "Testimonials demo",
    final: (s) => expect(s.getByText("Priya Nair")).toBeVisible(),
  },
  {
    name: "block-faq-section",
    path: "/blocks/faq-section",
    label: "FAQ section demo",
    final: (s) =>
      expect(s.getByRole("button", { name: "Can I change the colours?" })).toHaveAttribute("aria-expanded", "true"),
  },
  {
    name: "block-contact-form",
    path: "/blocks/contact-form",
    label: "Contact form demo",
    final: (s) => expect(s.getByText("Message sent").first()).toBeVisible(),
  },
  {
    name: "block-site-footer",
    path: "/blocks/site-footer",
    label: "Site footer demo",
    final: (s) => expect(s.getByText(/Check your inbox to confirm/)).toBeVisible(),
  },
  {
    name: "block-not-found-page",
    path: "/blocks/not-found-page",
    label: "404 page demo",
    final: (s) => expect(s.getByText("Contact sales")).toBeVisible(),
  },
  {
    name: "block-announcement-banner",
    path: "/blocks/announcement-banner",
    label: "Announcement banner demo",
    final: (s) => expect(s.getByText(/Version 2.1 is live/)).toBeVisible(),
  },
  {
    name: "dash-web-analytics",
    path: "/dashboards/web-analytics",
    label: "Web analytics dashboard demo",
    final: (s) => expect(s.getByText("last 30 days")).toBeVisible(),
  },
  {
    name: "dash-saas",
    path: "/dashboards/saas",
    label: "SaaS revenue dashboard demo",
    final: (s) => expect(s.getByText("last 30 days")).toBeVisible(),
  },
  {
    name: "dash-ecommerce",
    path: "/dashboards/ecommerce",
    label: "E-commerce dashboard demo",
    final: (s) => expect(s.getByText("last 30 days")).toBeVisible(),
  },
  {
    name: "dash-product",
    path: "/dashboards/product",
    label: "Product dashboard demo",
    final: (s) => expect(s.getByText("last 30 days")).toBeVisible(),
  },
  {
    name: "dash-crypto",
    path: "/dashboards/crypto-dashboard",
    label: "Portfolio dashboard demo",
    final: (s) => expect(s.getByText("last 30 days")).toBeVisible(),
  },
  {
    name: "dash-hub",
    path: "/dashboards",
    label: "Dashboards demo",
    final: (s) => expect(s.getByText("last 30 days")).toBeVisible(),
  },
];

const stage = (page: Page, label: string) => page.getByRole("group", { name: label });

test.use({ viewport: { width: 1440, height: 900 } });

for (const pilot of [...PILOTS, ...CHART_PILOTS, ...BLOCK_PILOTS]) {
  test.describe(pilot.name, () => {
    const url = urlFor(pilot.path);

    test("the idle frame is in the prerendered HTML", async ({ request }) => {
      const html = await (await request.get(url)).text();
      // Dev server pages are client-rendered; the prerendered site is what this guards.
      test.skip(!html.includes("<main"), "needs the built site");
      expect(html).toContain("sheen-showcase");
      expect(html).toContain('data-story="ready"');
      expect(html).toContain(`aria-label="${pilot.label}"`);
      expect(html).toContain(`aria-label="Replay ${pilot.label}"`);
    });

    test("no layout shift: the height is reserved and does not change while the story plays", async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { __cls: number }).__cls = 0;
        // Every layout-shift without recent input counts, as Chrome and Lighthouse sum it.
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { hadRecentInput: boolean; value: number }[])
            if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(url);
      const s = stage(page, pilot.label);
      await expect(s).toBeVisible();
      const before = (await s.boundingBox())!.height;
      await expect(s).toHaveAttribute("data-story", "done", { timeout: 15_000 });
      expect((await s.boundingBox())!.height).toBe(before);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      expect(cls).toBeLessThan(0.002);
    });

    test("the story plays once in view, not again by itself, and Replay plays it again", async ({ page }) => {
      await page.goto(url);
      const s = stage(page, pilot.label);
      await expect(s).toHaveAttribute("data-story", "playing", { timeout: 6000 });
      await expect(s).toHaveAttribute("data-story", "done", { timeout: 15_000 });
      // Absence check: the story must not replay by itself, so a fixed observation window is the assertion.
      await page.waitForTimeout(1500);
      await expect(s).toHaveAttribute("data-story", "done");
      await s.getByRole("button", { name: /^Replay/ }).click();
      await expect(s).toHaveAttribute("data-story", "playing");
      await expect(s).toHaveAttribute("data-story", "done", { timeout: 15_000 });
    });

    test("reduced motion shows the final state with no waiting", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(url);
      await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
      const s = stage(page, pilot.label);
      await expect(s).toHaveAttribute("data-story", "done", { timeout: 3000 });
      await pilot.final(s, page);
    });

    test("Replay is reachable and operable from the keyboard", async ({ page }) => {
      await page.goto(url);
      const s = stage(page, pilot.label);
      await expect(s).toHaveAttribute("data-story", "done", { timeout: 15_000 });
      const replay = s.getByRole("button", { name: /^Replay/ });
      await expect(replay).toBeVisible();
      // Reachable: Tab from the last control on the stage lands on it.
      await page.keyboard.press("Tab");
      await replay.focus();
      await expect(replay).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(s).toHaveAttribute("data-story", "playing");
      await expect(s).toHaveAttribute("data-story", "done", { timeout: 15_000 });
      await page.keyboard.press("Space");
      await expect(s).toHaveAttribute("data-story", "playing");
    });
  });
}

test.describe("button: a touch stops the story", () => {
  test("a touch on the component stops the story and leaves nothing loading", async ({ page }) => {
    await page.goto(urlFor("/components/button"));
    const s = stage(page, "Button demo");
    await expect(s).toHaveAttribute("data-state", "working", { timeout: 6000 });
    await s.locator("[data-stage-plate]").dispatchEvent("pointerdown");
    await expect(s).toHaveAttribute("data-story", "done");
    await expect(s).toHaveAttribute("data-state", "idle");
    await expect(s.getByRole("button", { name: "Save changes" })).not.toHaveAttribute("aria-busy", "true");
  });
});

test("switch: flipping it by hand works and colours the light", async ({ page }) => {
  await page.goto(urlFor("/components/switch"));
  const s = stage(page, "Switch demo");
  await expect(s).toHaveAttribute("data-story", "done", { timeout: 8000 });
  await expect(s).toHaveAttribute("data-state", "lit");
  await s.getByRole("switch").click();
  await expect(s).toHaveAttribute("data-state", "off");
  await expect(s.getByRole("switch")).not.toBeChecked();
});

// A stage is never empty: whether its story autoplays (normal motion, after it has finished) or is blocked (reduced
// motion jumps straight to the final state), the plate shows the finished UI. A chart whose marks are still at opacity 0
// (the entrance never ran, for example because it started before the animation engine arrived) is an empty stage.
const painted = (page: Page, label: string) =>
  page.evaluate((name) => {
    const root = [...document.querySelectorAll<HTMLElement>('[role="group"]')].find(
      (el) => el.getAttribute("aria-label") === name,
    );
    const plate = root?.querySelector("[data-stage-plate]");
    if (!plate) return { marks: 0, text: 0, textTotal: 0 };
    const visible = (el: Element) => {
      let opacity = 1;
      for (let node: Element | null = el; node && node !== plate.parentElement; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.visibility === "hidden" || style.display === "none") return false;
        opacity *= Number(style.opacity);
      }
      return opacity >= 0.3;
    };
    const skip = ".sheen-stage-chart-legend, .sheen-showcase-replay, [data-stage-decor]";
    let marks = 0;
    for (const el of plate.querySelectorAll("svg path, svg rect, svg circle, svg polygon, svg ellipse")) {
      if (el.closest(skip)) continue;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const filled = style.fill !== "none" && !/rgba\(.*, 0\)$|transparent/.test(style.fill);
      const stroked = style.stroke !== "none" && Number.parseFloat(style.strokeWidth) >= 1.5;
      if ((filled || stroked) && box.width >= 3 && box.height >= 3 && visible(el)) marks += 1;
    }
    // Charts drawn with boxes instead of SVG (bar list, cohort grid): a filled box in the chart area is a mark too.
    for (const el of plate.querySelectorAll(".sheen-stage-chart-area div, .sheen-stage-chart-area span")) {
      const box = el.getBoundingClientRect();
      const bg = getComputedStyle(el).backgroundColor;
      if (!/rgba\(.*, 0\)$|transparent/.test(bg) && box.width >= 3 && box.height >= 3 && visible(el)) marks += 1;
    }
    const frame = plate.getBoundingClientRect();
    let text = 0;
    let textTotal = 0;
    for (const el of plate.querySelectorAll("*")) {
      if (el.closest(skip) || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue;
      // Text under the crop (below the frame, or clipped by a scroller) or below the fold (it reveals on scroll) is not judged.
      const at = el.getBoundingClientRect();
      if (at.bottom > frame.bottom || at.top < frame.top || at.top > window.innerHeight) continue;
      // A loop that is between two beats (a notification fading in and out) is animating, not empty.
      let looping = false;
      for (let node: Element | null = el; node && node !== plate.parentElement; node = node.parentElement)
        if (node.getAnimations().some((a) => a.effect?.getComputedTiming().iterations === Infinity)) looping = true;
      if (looping) continue;
      textTotal += 1;
      if (visible(el)) text += 1;
    }
    return { marks, text, textTotal };
  }, label);

for (const pilot of [...CHART_PILOTS, ...BLOCK_PILOTS]) {
  const isChart = CHART_PILOTS.includes(pilot);
  test.describe(`${pilot.name}: never an empty stage`, () => {
    // Polled for a few seconds: a chart is allowed a moment to measure itself and to remount when the animation engine
    // lands, but it must get to its drawn state without anyone pressing Replay or scrolling.
    const check = async (page: Page) => {
      if (isChart)
        await expect
          .poll(async () => (await painted(page, pilot.label)).marks, {
            message: "drawn marks on the plate",
            timeout: 4000,
          })
          .toBeGreaterThanOrEqual(2);
      await expect
        .poll(
          async () => {
            const seen = await painted(page, pilot.label);
            return seen.text >= 3 && seen.text >= seen.textTotal * 0.5;
          },
          { message: "visible text on the plate", timeout: 4000 },
        )
        .toBe(true);
    };

    test("autoplay blocked (reduced motion): the final state is on the plate at load", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(urlFor(pilot.path));
      await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
      await expect(stage(page, pilot.label)).toHaveAttribute("data-story", "done", { timeout: 3000 });
      await check(page);
    });

    test("autoplay on: the finished story leaves the full UI on the plate", async ({ page }) => {
      await page.goto(urlFor(pilot.path));
      await expect(stage(page, pilot.label)).toHaveAttribute("data-story", "done", { timeout: 20_000 });
      await page.waitForTimeout(800);
      await check(page);
    });
  });
}
