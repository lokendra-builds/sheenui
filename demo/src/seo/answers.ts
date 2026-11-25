import { SITE_URL } from "./site";

/**
 * The answer-first lines of the docs pages: for every component, chart, effect, block and dashboard route, a plain definition
 * (1 to 2 sentences: what it is, the use case and, for charts, the data shape) and the shadcn registry item that installs it.
 * A page header renders `answerFor(path)` and `installCommand(path)` right under the H1 and llms.txt repeats them.
 * `pnpm seo:check` verifies that the lengths hold, that every route has both and that each item exists in registry.json.
 */
export const ANSWERS: Record<string, string> = {
  "/blocks/ai-chat":
    "An AI chat UI for React with replies that stream in word by word, a \u201cthinking\u201d shimmer, Markdown with code blocks and a model picker.",
  "/blocks/bento-grid":
    "A glassmorphism bento grid for React whose cells run live mini-demos built from real SheenUI components.",
  "/blocks/chat-app":
    "A complete React chat app template: the chat list and the open chat side by side, stacking into list then chat on narrow screens.",
  "/blocks/dashboard-stats":
    "Dashboard stat cards for React are glass KPI cards whose numbers count up, sparklines draw in and periods switch with a sliding pill.",
  "/blocks/glass-login":
    "A glassmorphism login form for React with validation, a password reveal, a loading state and social sign-in buttons, built from SheenUI's Button, GlassCard and Input.",
  "/blocks/lamp-login":
    "A dark stage with a pull cord: pull it and a warm light cone reveals a glass sign-in card. The card is always there for keyboards and screen readers.",
  "/blocks/notification-center":
    "A React notification center: a bell with a live unread count that opens a glass inbox with tabs, day groups and inline actions.",
  "/blocks/otp-verification":
    "A glass OTP verification page for React that submits on the last digit, shakes on a wrong code and counts down to resend.",
  "/blocks/payment-checkout":
    "A glass React checkout form for card or UPI payments, with a live card preview, input formatting and an order summary.",
  "/blocks/pricing":
    "A glass React pricing table with a monthly/yearly toggle, prices that roll like an odometer and a full comparison table. Use Pricing as a pricing section with a monthly and yearly toggle for a SaaS product, with several tiers, billing that defaults to yearly, and a highlighted popular plan.",
  "/blocks/hero-section":
    "HeroSection is a React hero section block that sets a display headline, a lede and calls to action over any backdrop, with a lit glass frame for a product shot and a logo strip. Use it as the first block of a landing page.",
  "/blocks/feature-grid":
    "FeatureGrid is a React feature grid block of glass cards, each with an icon, a title and a line of text, in two to four columns that follow its own width. One optional highlight card spans two columns and is lit from a corner.",
  "/blocks/testimonials":
    "Testimonials is a React testimonials block that shows customer quotes on glass cards, as a grid or a marquee in one or two rows. The marquee rests on hover, focus, off-screen and has a Pause button.",
  "/blocks/faq-section":
    "FaqSection is a React FAQ section block: a heading and an accordion of questions on glass whose closed answers open on find-in-page. faqPageJsonLd(items) returns the schema.org FAQPage object for the same questions.",
  "/blocks/contact-form":
    "ContactForm is a React contact form block with name, email and message fields on glass, inline validation, a button that glows while sending and a success seal. It works with a plain onSubmit or react-hook-form.",
  "/blocks/site-footer":
    "SiteFooter is a React site footer block on one glass panel: brand and blurb, link columns that are navigation landmarks, a newsletter field with validation, social icon links and a legal row. Every part is optional.",
  "/blocks/not-found-page":
    "NotFound is a React 404 page block: a large code whose zeros are glass rings, a plain explanation, a slot for your own search field, a main action and suggested links. It is also usable for 403 and 500 pages.",
  "/blocks/announcement-banner":
    "AnnouncementBanner is a React announcement banner: a dismissible top bar on glass with a tone, an optional link and static copy. It stores nothing and reports the dismissal through onDismiss so you can remember it.",
  "/blocks/settings-page":
    "A complete React settings page with a scroll-spy side nav, profile upload, notification switches and a glass save bar. Use SettingsPage as an account settings UI with Profile, Notifications, Appearance and Danger sections, where a sticky side nav jumps to each card and focuses its heading.",
  "/blocks/signup-page":
    "A split-screen sign-up page for React: an animated brand panel beside a glass form with social sign-up and a live password-strength meter.",
  "/charts/area-chart":
    "An animated React area chart with soft gradient fills, a crosshair tooltip and keyboard reading. Each row of readonly ChartRow[] is one x value; every series key holds a number, and its fill runs down to the zero baseline.",
  "/charts/bar-chart":
    "A React bar chart compares values as animated bars in grouped, stacked or horizontal layouts, each with tooltips, keyboard reading and a table view. Pass data as readonly ChartRow[]: one object per category: the index key plus one number per series key.",
  "/charts/bar-list":
    'A React bar list draws each value as a soft bar behind its name: the most compact way to rank many named values in a card. Pass data as readonly BarListItem[]: one row per item: { name: "Google", value: 4821 }.',
  "/charts/beeswarm":
    "A React beeswarm chart plots every observation as its own dot along one axis, nudged just enough that none overlap. Pass data as readonly BeeswarmPoint[]: the observations to plot, each drawn as one dot.",
  "/charts/box-plot":
    "A React box plot compares distributions across groups; the violin variant shows the full shape, so two-peaked groups stand out. Pass data as readonly BoxPlotGroup[]: one box per group, in order.",
  "/charts/bullet-chart":
    "A React bullet chart shows actual against target with qualitative ranges behind, so many KPIs fit where one gauge would. Pass data as readonly BulletItem[]: the rows to draw, one per measure.",
  "/charts/calendar-heatmap":
    'A React calendar heatmap that draws a GitHub-style contribution graph: one cell per day on sequential color steps. Pass data as readonly CalendarDatum[]: one entry per day: { date: "2026-03-04", value: 12 }.',
  "/charts/candlestick":
    "A React candlestick chart shows prices over time as candles or OHLC bars, with a volume strip and a moving average. Pass data as readonly Candle[]: one candle per period, oldest first.",
  "/charts/category-bar":
    "A React category bar splits one bar into named bands and pins where a value sits, such as a credit score or an NPS. Pass data as readonly CategoryBarItem[]: the bands, start to end.",
  "/charts/chord-diagram":
    "A React chord diagram draws flows between a handful of groups as ribbons across a circle. Pass groups plus a square matrix: matrix[i][j] is the flow from group i to group j.",
  "/charts/cohort-retention":
    "A React cohort retention chart shows how many people from each starting week or month are still around. Pass data as readonly CohortRow[]: takes one row per cohort, oldest first.",
  "/charts/combo-chart":
    "A React combo chart that draws bars and lines on one shared y-axis, such as a daily count with its rolling average. Pass data as readonly ChartRow[]: one object per category: the index key plus one number per series key.",
  "/charts/diverging-bar":
    "A React diverging bar chart centers survey answers on a neutral midpoint; the butterfly variant draws a population pyramid. Pass data as readonly ChartRow[]: one row per item (a question, a product, an age group).",
  "/charts/donut-chart":
    'An animated React donut chart with the total in the center, a full legend and keyboard-readable slices. Pass data as readonly DonutSlice[]: part-to-whole only, at most 6 slices: fold the rest into "Other".',
  "/charts/bump-chart":
    "A React bump chart that shows how a ranking changes over time, one line per series with the rank in every dot. Pass data as readonly ChartRow[]: one row per point in time with a number per series, plus index and series.",
  "/charts/error-bar-chart":
    "A React error bar chart that draws an estimate with its confidence interval as bars, points or a shaded band. Pass data as readonly ErrorBarItem[]: one item per mark, { label, value, low, high }.",
  "/charts/population-pyramid":
    "A React population pyramid: two sets of horizontal bars mirrored around a centre line, one row per age group. Pass data as readonly PyramidGroup[]: one item per group, { label, start, end }.",
  "/charts/dumbbell":
    "A React dumbbell or slope chart shows before and after for each item, with every change printed in words and arrows. Pass data as readonly DumbbellItem[]: takes one item per row: { label, from, to }.",
  "/charts/funnel-chart":
    "A React funnel chart that shows conversion stage by stage, printing how many continued and how many dropped off at every step. Pass data as readonly FunnelStage[]: the stages in order.",
  "/charts/gantt":
    "A React Gantt chart puts a plan on a timeline, with progress, dependency arrows, milestones and a today line. Pass tasks as a readonly GanttTask[]: an id, a label, a start and an end day, plus optional progress and dependencies.",
  "/charts/gauge-chart":
    "A React gauge chart shows one number against its scale as a semicircle or a speedometer whose needle springs into place. Pass one number as value, with optional min, max, target and colored bands.",
  "/charts/heatmap":
    "A React heatmap chart that colors a category-by-category grid from light to dark, with a tooltip on every cell. Pass data as readonly ChartRow[]: one object per row.",
  "/charts/histogram":
    "A React histogram shows how a measure is spread, with automatic bins, an optional density curve and percentile markers. Pass values as a readonly number[] of raw measurements: the chart bins them for you.",
  "/charts/line-chart":
    "An animated React line chart with end labels, a crosshair tooltip you can drive with the arrow keys, and a table view of the same data. Pass data as readonly ChartRow[]: one object per point: the index key plus one number per series key.",
  "/charts/lollipop":
    "A React lollipop chart gives all the reading of a bar chart with a fraction of the ink: a thin stem and a dot per value. Pass data as readonly LollipopItem[]: takes one item per stem: { label, value }.",
  "/charts/marimekko":
    "A React Marimekko chart is a 100% stacked mosaic whose columns are as wide as their totals. Pass data as readonly ChartRow[]: one row per column.",
  "/charts/network-graph":
    "A force-directed React network graph shows who is connected to whom, laid out by a simulation written in the component. Pass nodes (an id, with an optional group and value) and links (a source and a target id).",
  "/charts/percent-stacked-bar-chart":
    "A React 100% stacked bar chart that scales every bar to 100%, so you can compare the mix inside each category whatever its size. Pass data as readonly ChartRow[]: one object per bar: the index key plus one number per series key (shares are worked out for you).",
  "/charts/pie-chart":
    "A React pie chart for part-to-whole at a glance, folding the smallest slices into \u201cOther\u201d after six. Pass data as readonly PieSlice[]: part-to-whole only.",
  "/charts/polar-area":
    "A React polar area chart, Nightingale's rose, draws one wedge per category around a circle, its area proportional to the value. Pass data as readonly ChartRow[]: one row per wedge.",
  "/charts/radar-chart":
    "A React radar chart, also called a spider chart, compares a few profiles across the same set of measures. Pass data as readonly ChartRow[]: one row per axis (spoke), clockwise from the top.",
  "/charts/radial-bar-chart":
    "A React radial bar chart draws 2 to 5 measures as concentric rings against their goals, like activity rings. Pass data as readonly RadialBarItem[]: takes 2\u20135 measures, outermost ring first.",
  "/charts/range-area-chart":
    "A React range area chart draws a line inside a min-max band, such as a forecast and its confidence interval. Pass data as readonly ChartRow[]: one row per x value.",
  "/charts/realtime-chart":
    "A real-time React line chart: each new sample glides in from the right while the time axis slides under it. Pass data as readonly ChartRow[]: samples so far, oldest first: { time, \u2026values }.",
  "/charts/ridgeline":
    "A React ridgeline chart stacks overlapping density ridges, one per group, to show how a spread shifts between groups. Pass data as readonly RidgelineGroup[]: one group per ridge, top to bottom, each with its raw values.",
  "/charts/sankey-diagram":
    "A React Sankey diagram draws flows between stages as ribbons whose thickness is the amount, laid out without a chart library. Pass links as readonly SankeyLink[]: { source, target, value } objects, and optionally nodes with an id, a label and a color slot.",
  "/charts/scatter-plot":
    "A React scatter plot and bubble chart that shows how two measures relate, one dot per item, with an optional trend line. Pass series as readonly ScatterSeries[]: each a label plus a data array of { x, y } points, with an optional size for bubbles.",
  "/charts/sparkbar":
    "A React sparkbar is a mini bar chart for stat tiles and table cells, the bar twin of the sparkline. Pass values as a readonly number[], oldest first; a missing entry leaves a gap, never a zero.",
  "/charts/sparkline":
    "A React sparkline is a tiny trend line for stat tiles and table cells, summarized in words for screen readers. Pass values as a readonly number[], oldest first.",
  "/charts/stacked-area-chart":
    "A React stacked area chart shows how a total builds from its parts over time, or in 100% mode how the mix shifts. Pass data as readonly ChartRow[]: one object per point: the index key plus one number per series key.",
  "/charts/step-line-chart":
    "A React step line chart for values that hold and then jump, such as prices, plan limits and headcount. Pass data as readonly ChartRow[]: one object per point: the index key plus one number per series key.",
  "/charts/streamgraph":
    "A React streamgraph shows how a mix swells and fades over time as stacked areas flowing around a moving center line. Pass data as readonly ChartRow[]: one row per x value.",
  "/charts/sunburst":
    "A React sunburst chart shows a hierarchy as rings around a center; click a group to zoom into it with an animated sweep. Pass data as readonly SunburstNode[]: the hierarchy: leaves carry a value; groups carry children (any depth).",
  "/charts/treemap":
    "A React treemap shows part-to-whole as nested rectangles, laid out by the squarified algorithm so tiles stay easy to compare. Pass data as readonly TreemapNode[]: nodes: leaves carry a value; groups carry children (any depth).",
  "/charts/uptime-tracker":
    "A React uptime tracker draws the status-page view of uptime: one block per day, build or check, each with its own tooltip. Pass data as readonly TrackerBlock[]: takes one block per period, oldest first.",
  "/charts/waffle":
    "A React waffle chart is a 10 \u00d7 10 grid where every cell is one percent, so \u201c61 in 100\u201d lands faster than any pie. Pass data as readonly WaffleItem[]: the parts of the whole.",
  "/charts/waterfall-chart":
    "A React waterfall chart, or bridge chart, breaks a running total into its increases and decreases. Pass data as readonly WaterfallStep[]: the steps in order: { label, value }.",
  "/charts/world-map":
    'A React choropleth world map and bubble map on the Equal Earth projection, with no map library. Pass data as readonly WorldMapDatum[]: values by country (choropleth), or bubble sizes at each country\'s centre (mode="bubble").',
  "/chat/list":
    "A React chat list UI for a messaging app, with search, filters with counts, pinned chats, presence and unread badges.",
  "/chat/thread":
    "A React chat UI for one conversation: bubbles grouped by sender, sticky day labels, replies, reactions, photos and typing.",
  "/chat/widget":
    "A React chat widget for support: a launcher in the corner of the page springs open a glass panel with a greeting and recent conversations.",
  "/components/alert":
    "A glass React alert component for inline messages, with four tones, an optional action and a dismiss button, announced by screen readers.",
  "/components/avatar":
    "A glass React avatar component that shows an image, falls back to gradient initials, and can show an online status dot.",
  "/components/badge":
    "A React badge is a small glass label for status and counts that stays readable on any background and never relies on color alone. Use Badge as a status badge next to a table row or card title, such as Paid, Draft or Beta, where one short word explains the state at a glance.",
  "/components/button":
    "A glass button for React is a button that lifts on hover and presses down on tap, with a sweep of light across the filled variants, animated with Motion and kept still under reduced motion.",
  "/components/button-group":
    "A React button group that joins related buttons into one control, with attached corners and arrow-key roving focus. Use ButtonGroup to join related buttons into one control: a Day, Week, Month switch, a split action, or an editor toolbar with Cut, Copy and Paste.",
  "/components/carousel":
    "A glass React carousel you can swipe, drag or flick, with an endless loop, responsive slides per view and autoplay that pauses on hover and focus.",
  "/components/checkbox":
    "An animated checkbox for React whose check pops in, with an indeterminate state for \u201cselect all\u201d, built on Base UI's accessible checkbox.",
  "/components/code-block":
    "A glass React code block with a small built-in syntax highlighter, line numbers, highlighted and diff lines, a file tab and a copy button.",
  "/components/combobox":
    "A React combobox with search in the style of Select2: type to filter, pick one or many as animated chips, group or create options, or search a server as you type.",
  "/components/data-table":
    "A typed, accessible React data table on TanStack Table v9 with search, faceted filters, multi-sort, pagination, selection and CSV export, all in glass.",
  "/components/dialog":
    "A strong-glass React modal dialog that springs in with Motion, with focus trapping, Escape to close and focus return handled by Base UI.",
  "/components/empty-state":
    "An animated React empty state component that shows one clear next step when a page, list or search has nothing in it yet.",
  "/components/glass-card":
    "The glassmorphism card is SheenUI's basic frosted-glass surface for React: pick one of three blur levels, and a soft highlight follows the pointer.",
  "/components/input":
    "A glass text input for React with its label, description and error message wired up for screen readers, and a soft accent glow on focus.",
  "/components/meter":
    "A glass React meter for a level inside a known range, such as storage, battery or password strength, that is spoken as well as colored.",
  "/components/otp-input":
    "A React OTP input with one slot per digit, paste and SMS autofill, and Motion feedback: digits pop in, errors shake and success ripples.",
  "/components/popover":
    "A glass React popover anchored to its trigger, for small forms and details; Escape or a click outside closes it. Use Popover as a glass popover for a small filter panel opened from a toolbar button, where a few controls and an Apply action fit in a panel anchored to the button.",
  "/components/progress":
    "A glass React progress bar with an accent fill and a sweep of light, plus an indeterminate mode for loading states.",
  "/components/select":
    "A glass React select dropdown for picking one option, with type-to-jump and items that drift in; for search or multi-select, use the Combobox.",
  "/components/skeleton":
    "A glass React skeleton loader that holds the exact layout while content loads, so nothing jumps when it arrives.",
  "/components/slider":
    "A glass React slider that picks a single value or a range by dragging, clicking the track or pressing the arrow keys. Use Slider as a React slider component for a volume or brightness control where people want to drag and hear or see the change as they go, and exact digits matter less than feel.",
  "/components/spinner":
    "A React loading spinner for work with no known length, announced politely and held still as a static arc under reduced motion. Use Spinner as a loading indicator in React for a wait with no known length, such as a route transition, a panel waiting for data or a search that has just been submitted.",
  "/components/switch":
    "An animated React toggle switch, an iOS switch in Tailwind, whose thumb springs across a glass track with Motion and fills with the accent color when on.",
  "/components/table":
    "The React table component is a set of plain, styled table primitives for small static tables, in a glass region that scrolls sideways on narrow screens. Use Table for small static tables: a pricing comparison, a spec sheet, a list of keyboard shortcuts or API limits.",
  "/components/tabs":
    "Animated tabs for React are a Base UI tab list where a glass pill slides to the active tab, driven by the indicator variables, with full arrow-key support.",
  "/components/toast":
    "A React toast is a glass notification that stacks, fans out on hover and can be swiped away, announced automatically to screen readers.",
  "/components/tooltip":
    "A glass React tooltip that appears on hover and keyboard focus; inside a provider, moving between tooltips is instant. Use Tooltip as a glass tooltip to name an icon-only toolbar button on hover or focus, such as Bold or Export, adding the shortcut in the text when there is one.",
  "/dashboards/crypto-dashboard":
    "A crypto and finance dashboard template for React with candlesticks, live prices and a portfolio breakdown. Use it as a portfolio dashboard for a crypto or brokerage screen where the balance chart can be scrubbed to roll the big number to any moment or dragged to measure a move.",
  "/dashboards/ecommerce":
    "An ecommerce sales dashboard template for React with orders, top products, a conversion funnel and a regional map.",
  "/dashboards/product":
    "A product analytics dashboard for React with funnels, retention cohorts and Sankey user flows. Use it as a funnel and retention dashboard for a product analytics screen that tracks daily, weekly and monthly active users and stickiness (DAU divided by MAU) for web, iOS and Android.",
  "/dashboards/saas":
    "A SaaS dashboard template for React that tracks MRR, churn and cohort retention in glass charts. Use it as a revenue dashboard for the revenue page of a subscription product, showing MRR, ARR, churn rate and ARPU as rolling numbers with deltas and sparklines.",
  "/dashboards/web-analytics":
    "A web analytics dashboard template for React in the style of Plausible and Vercel Analytics, built from SheenUI charts. Use it as a Plausible style dashboard for a traffic screen in a SaaS app, with visitors, pageviews, bounce rate and visit duration in a KPI strip.",
  "/effects/3d-tilt-card":
    "A 3D tilt card for React that leans toward the pointer, up to 8\u00b0, with a glare sliding across its glass surface on springs. Use it as a tilt effect for a hero tile or a featured product card that leans toward the pointer in 3D, with a glare and a rim light sliding across the glass.",
  "/effects/blur-in":
    "A blur text animation for React where words sharpen out of a soft blur one after another: the classic hero-headline reveal.",
  "/effects/border-beam":
    "Border beam is an animated gradient border for React: a comet of light that runs around a rounded edge at one steady speed. Use it as a glowing border animation to mark the recommended plan in a pricing table, so one GlassCard carries a comet of light around its edge while the other tiers stay calm.",
  "/effects/liquid-glass":
    "A Liquid Glass effect for React in the style of Apple's iOS 26 design: a lens that refracts the page behind it through an SVG displacement map, with a specular rim.",
  "/effects/macos-dock":
    "A macOS dock for React with magnification: icons near the pointer swell and push their neighbors apart, with labels riding on top.",
  "/effects/marquee":
    "A React marquee for an endless, seamless strip of logos or testimonials that eases to a stop under the mouse or keyboard focus. Use it as an infinite logo carousel for a trusted-by strip under a landing page hero, where customer logos scroll in a seamless loop at a steady speed in pixels per second.",
  "/effects/morphing-dialog":
    "A morphing dialog for React where a card grows into a modal: its image, title and surface fly into place with Motion's shared layout animation.",
  "/effects/number-ticker":
    "A number ticker for React where every digit is a little wheel that rolls to its new value, formatted with Intl.NumberFormat. Use it as an animated counter for KPI tiles and dashboard totals that change when a date range or filter changes, so each digit rolls to its new value like an odometer.",
  "/effects/shimmer-text":
    "A shimmer text animation for React: a band of light sweeps across the letters while the real text stays whole and selectable.",
  "/effects/spotlight-card":
    "A spotlight card for React: a glass card lit by a soft glow that follows the pointer, written straight to CSS variables.",
  "/effects/typewriter":
    "A typewriter effect for React that types each phrase with a human rhythm, holds it, deletes it and types the next. Use it as a typing animation for a hero line that cycles through a few phrases, such as I build design systems, fast websites and accessible apps, typed and deleted one after another.",
  "/effects/animated-beam":
    "AnimatedBeam is a React effect that sends a light along an SVG path between two elements, measured from refs. Use it for integration diagrams and data-flow maps; it moves by transform only and rests off-screen.",
  "/effects/particles":
    "Particles is a React canvas effect: a capped field of small drifting lights that lean softly away from the pointer. Use it behind a hero or glass card; it draws one still frame under reduced motion.",
  "/effects/meteors":
    "Meteors is a React effect that sends occasional streaks of light across a card or section background. Use it for quiet depth; each streak moves by transform and opacity only and stays still under reduced motion.",
  "/effects/confetti":
    "Confetti is a React effect that fires a one-shot burst of paper on demand with useConfetti().fire(), for success moments. It idles at zero cost and shows a still badge instead under reduced motion.",
  "/effects/orbiting-circles":
    "OrbitingCircles is a React effect that spins icons or avatars around a centre on rings, using transform only. Use it for integration sections; it holds still on hover and focus and is static under reduced motion.",
  "/effects/text-reveal":
    "TextReveal is a React effect that lights up the words of a statement one by one as you scroll. The text stays real, readable without JavaScript, never shifts layout and is fully visible under reduced motion.",
  "/effects/scroll-progress":
    "ScrollProgress is a React effect: a thin bar that fills with page or container scroll through a scaleX transform. It is decorative by default and becomes a named progressbar only when you pass a label.",
  "/effects/word-rotate":
    "A rotating text animation for React: one slot in a sentence cycles through words, each sliding up through a clipped window.",
  "/forms/calendar":
    "A glass React calendar built on Intl, so the week starts and the month names read the way the user's locale expects.",
  "/forms/color-picker":
    "A glass React color picker with a saturation area, hue and opacity sliders, typed hex, RGB and HSL values, swatches and the screen eyedropper.",
  "/forms/date-picker":
    "A glass React date picker that opens a calendar in a popover, or in a bottom sheet on phones, for single dates and ranges.",
  "/forms/field":
    "A composable React form field that wires a label, a description and an error message to any control, ready for react-hook-form.",
  "/forms/file-upload":
    "A glass drag-and-drop file upload for React that validates files on drop and lists each one with a thumbnail, progress bar, cancel and retry.",
  "/forms/input-group":
    "A React input group that attaches text, icons or buttons to a field and shares one focus ring. Use InputGroup when one field needs things attached to it: an https:// prefix, a .com suffix, a currency or unit, or a button such as Apply inside the same edge.",
  "/forms/number-field":
    "A glass React number input with steppers you can hold, a scrub label you can drag, and Intl formatting for currency, percentages and units.",
  "/forms/radio-group":
    "A React radio group in two styles: glass dots whose pip springs out, or rich option cards where the selection glides from card to card.",
  "/forms/rating":
    "An animated React star rating with hover preview and half steps, built as a radio group so arrow keys and screen readers just work.",
  "/forms/segmented-control":
    "An iOS-style segmented control for React where a glass pill slides to the chosen segment and the arrow keys move between segments.",
  "/forms/tags-input":
    "A glass React tags input that turns typed text into chips, adds a pasted list at once and lets you walk and remove chips from the keyboard.",
  "/forms/textarea":
    "A glass React textarea that auto-resizes to fit its content and can show a character counter whose ring fills as you type.",
  "/forms/toggle":
    "A React toggle button that stays pressed and is announced as \u201cpressed\u201d, and can be grouped in a glass toolbar.",
  "/layout/accordion":
    "An animated React accordion whose sections open on a spring, with every trigger a real button in the tab order. Use it as a React accordion for an FAQ section on a pricing or landing page, where the default glass variant puts all questions in one card and the open item rises as a lighter pane.",
  "/layout/aspect-ratio":
    "A React aspect ratio box that keeps images, video and maps at a fixed width-to-height ratio, preventing layout shift. Use AspectRatio to reserve the space of an image, a video poster or a map before it loads, so the page does not jump when the content arrives.",
  "/layout/breadcrumb":
    "A responsive React breadcrumb whose middle items fold into a menu when space runs out, and unfold again when there is room.",
  "/layout/collapsible":
    "A React collapsible section that animates its height and keeps closed content out of the page and the tab order. Use it as an expandable section for an Advanced options link at the bottom of a form, so retry limits, timeouts and proxy settings stay out of the way until someone needs them.",
  "/layout/pagination":
    "A React pagination component with page numbers, ellipses and first, previous, next and last buttons in a labeled navigation landmark.",
  "/layout/resizable":
    "Resizable panels for React split a layout into regions with draggable, keyboard-resizable handles, size limits and nested groups. Use Resizable panels for workspaces where people choose how much room each area gets: a file tree beside an editor, a list beside a detail pane, a console under a canvas.",
  "/layout/scroll-area":
    "A React scroll area that keeps native scrolling but adds slim custom scrollbars in glass, with edges that fade only where there is more to see.",
  "/layout/separator":
    "A React separator for hairline dividers, horizontal or vertical, solid, fading or dashed, with an optional label. Use it as a React divider between groups in a settings page, such as Account and Notifications, where a fading or solid hairline gives the page rhythm without adding another card.",
  "/layout/stepper":
    "An animated React stepper for multi-step forms and checkouts that collapses to \u201cStep 2 of 4\u201d on phones.",
  "/layout/timeline":
    "An animated React timeline for activity feeds, audit logs, order tracking and changelogs that draws itself as you scroll. Use it as an activity feed or audit log with avatars, action badges and a Today group heading, where new events should slide in at the top and push the rest down smoothly.",
  "/layout/toolbar":
    "A glass React toolbar that groups related controls behind a single tab stop, moved through with the arrow keys.",
  "/navigation/navbar":
    "A glassmorphism navbar for React comes in two forms: a floating Apple-style pill whose highlight morphs between items, and a full-width top bar with a sliding underline.",
  "/navigation/navigation-menu":
    "A glass React navigation menu whose items open rich dropdown panels, with hover intent, a panel that morphs between items, and full keyboard support.",
  "/navigation/sidebar":
    "A glass React sidebar for app shells with collapsible groups, badges and a collapsed icon rail. Use Sidebar for an app shell: a glass column with a header, collapsible groups of links and a footer for the user menu.",
  "/navigation/vertical-nav":
    "A glass sidebar navigation for React with grouped items, icons and counts that collapses into an icon rail with tooltips.",
  "/overlays/alert-dialog":
    "A glass React alert dialog that asks before destructive actions, focuses the safe choice first and stays open with the error if the action fails.",
  "/overlays/command-palette":
    "A glass React command palette that opens with \u2318K or Ctrl+K, with fuzzy search, recent picks first and nested pages.",
  "/overlays/context-menu":
    "A glass React context menu that opens on right-click, on long-press on touch screens, or with Shift+F10, right where you pressed.",
  "/overlays/drawer":
    "A glass React drawer that slides in from any edge, with bottom sheets you can drag, snap and swipe away. Use it as a bottom sheet for filters on a mobile product list, with snap points such as peek, half and full so people can glance at the filters or expand them to full height.",
  "/overlays/dropdown-menu":
    "A glass React dropdown menu with icons, shortcuts, groups, checkbox and radio items and submenus, whose highlight glides from item to item.",
  "/overlays/hover-card":
    "A glass React hover card that previews what is behind a link, opening on hover or keyboard focus after a short delay.",
  "/overlays/kbd":
    "The Kbd component renders keyboard shortcuts as glass key caps in React, showing \u2318K on a Mac and Ctrl+K on Windows and Linux from one definition.",
  "/overlays/menubar":
    "A glass desktop-style React menubar with File, Edit and View menus, reached with one Tab stop and walked with the arrow keys.",
  "/overlays/side-drawer":
    "A glass React slide-over panel, or side drawer, that slides in to edit a record or show its details, with an edit form that guards unsaved changes.",
};

/** Route -> the name of the registry item (demo/public/r/<name>.json) that installs it. */
export const INSTALL_ITEM: Record<string, string> = {
  "/blocks/ai-chat": "ai-chat",
  "/blocks/bento-grid": "bento-grid",
  "/blocks/chat-app": "chat-app",
  "/blocks/dashboard-stats": "dashboard-stats",
  "/blocks/glass-login": "glass-login",
  "/blocks/lamp-login": "lamp-login",
  "/blocks/notification-center": "notification-center",
  "/blocks/otp-verification": "otp-verification",
  "/blocks/payment-checkout": "payment-checkout",
  "/blocks/pricing": "pricing",
  "/blocks/hero-section": "hero-section",
  "/blocks/feature-grid": "feature-grid",
  "/blocks/testimonials": "testimonials",
  "/blocks/faq-section": "faq-section",
  "/blocks/contact-form": "contact-form",
  "/blocks/site-footer": "site-footer",
  "/blocks/not-found-page": "not-found-page",
  "/blocks/announcement-banner": "announcement-banner",
  "/blocks/settings-page": "settings-page",
  "/blocks/signup-page": "auth-split",
  "/charts/area-chart": "line-chart",
  "/charts/bar-chart": "bar-chart",
  "/charts/bar-list": "bar-list",
  "/charts/beeswarm": "beeswarm",
  "/charts/box-plot": "box-plot",
  "/charts/bullet-chart": "bullet-chart",
  "/charts/calendar-heatmap": "calendar-heatmap",
  "/charts/candlestick": "candlestick-chart",
  "/charts/category-bar": "category-bar",
  "/charts/chord-diagram": "chord-diagram",
  "/charts/cohort-retention": "cohort-chart",
  "/charts/combo-chart": "combo-chart",
  "/charts/diverging-bar": "diverging-bar-chart",
  "/charts/donut-chart": "donut-chart",
  "/charts/bump-chart": "bump-chart",
  "/charts/error-bar-chart": "error-bar-chart",
  "/charts/population-pyramid": "population-pyramid",
  "/charts/dumbbell": "dumbbell-chart",
  "/charts/funnel-chart": "funnel-chart",
  "/charts/gantt": "gantt-chart",
  "/charts/gauge-chart": "gauge-chart",
  "/charts/heatmap": "heatmap",
  "/charts/histogram": "histogram",
  "/charts/line-chart": "line-chart",
  "/charts/lollipop": "lollipop-chart",
  "/charts/marimekko": "marimekko-chart",
  "/charts/network-graph": "network-graph",
  "/charts/percent-stacked-bar-chart": "percent-bar-chart",
  "/charts/pie-chart": "pie-chart",
  "/charts/polar-area": "polar-area-chart",
  "/charts/radar-chart": "radar-chart",
  "/charts/radial-bar-chart": "radial-bar-chart",
  "/charts/range-area-chart": "range-area-chart",
  "/charts/realtime-chart": "streaming-chart",
  "/charts/ridgeline": "ridgeline-chart",
  "/charts/sankey-diagram": "sankey-chart",
  "/charts/scatter-plot": "scatter-chart",
  "/charts/sparkbar": "sparkbar",
  "/charts/sparkline": "sparkline",
  "/charts/stacked-area-chart": "stacked-area-chart",
  "/charts/step-line-chart": "step-line-chart",
  "/charts/streamgraph": "streamgraph",
  "/charts/sunburst": "sunburst-chart",
  "/charts/treemap": "treemap",
  "/charts/uptime-tracker": "tracker-chart",
  "/charts/waffle": "waffle-chart",
  "/charts/waterfall-chart": "waterfall-chart",
  "/charts/world-map": "geo-map",
  "/chat/list": "chat",
  "/chat/thread": "chat",
  "/chat/widget": "chat",
  "/components/alert": "alert",
  "/components/avatar": "avatar",
  "/components/badge": "badge",
  "/components/button": "button",
  "/components/button-group": "button-group",
  "/components/carousel": "carousel",
  "/components/checkbox": "checkbox",
  "/components/code-block": "code-block",
  "/components/combobox": "combobox",
  "/components/data-table": "data-table",
  "/components/dialog": "dialog",
  "/components/empty-state": "empty-state",
  "/components/glass-card": "glass-card",
  "/components/input": "input",
  "/components/meter": "meter",
  "/components/otp-input": "otp-input",
  "/components/popover": "popover",
  "/components/progress": "progress",
  "/components/select": "select",
  "/components/skeleton": "skeleton",
  "/components/slider": "slider",
  "/components/spinner": "spinner",
  "/components/switch": "switch",
  "/components/table": "table",
  "/components/tabs": "tabs",
  "/components/toast": "toast",
  "/components/tooltip": "tooltip",
  "/dashboards/crypto-dashboard": "analytics-demo-finance",
  "/dashboards/ecommerce": "analytics-demo-ecommerce",
  "/dashboards/product": "analytics-demo-product",
  "/dashboards/saas": "analytics-demo-saas",
  "/dashboards/web-analytics": "analytics-demo-web",
  "/effects/3d-tilt-card": "tilt-card",
  "/effects/blur-in": "text-effects",
  "/effects/border-beam": "border-beam",
  "/effects/liquid-glass": "liquid-glass",
  "/effects/macos-dock": "dock",
  "/effects/marquee": "marquee",
  "/effects/morphing-dialog": "morphing-dialog",
  "/effects/number-ticker": "number-ticker",
  "/effects/shimmer-text": "text-effects",
  "/effects/spotlight-card": "spotlight",
  "/effects/typewriter": "text-effects",
  "/effects/animated-beam": "animated-beam",
  "/effects/particles": "particles",
  "/effects/meteors": "meteors",
  "/effects/confetti": "confetti",
  "/effects/orbiting-circles": "orbiting-circles",
  "/effects/text-reveal": "text-reveal",
  "/effects/scroll-progress": "scroll-progress",
  "/effects/word-rotate": "text-effects",
  "/forms/calendar": "calendar",
  "/forms/color-picker": "color-picker",
  "/forms/date-picker": "date-picker",
  "/forms/field": "field",
  "/forms/file-upload": "file-upload",
  "/forms/input-group": "input-group",
  "/forms/number-field": "number-field",
  "/forms/radio-group": "radio-group",
  "/forms/rating": "rating",
  "/forms/segmented-control": "segmented",
  "/forms/tags-input": "tags-input",
  "/forms/textarea": "textarea",
  "/forms/toggle": "toggle",
  "/layout/accordion": "accordion",
  "/layout/aspect-ratio": "aspect-ratio",
  "/layout/breadcrumb": "breadcrumb",
  "/layout/collapsible": "collapsible",
  "/layout/pagination": "pagination",
  "/layout/resizable": "resizable",
  "/layout/scroll-area": "scroll-area",
  "/layout/separator": "separator",
  "/layout/stepper": "stepper",
  "/layout/timeline": "timeline",
  "/layout/toolbar": "toolbar",
  "/navigation/navbar": "navbar",
  "/navigation/navigation-menu": "navigation-menu",
  "/navigation/sidebar": "sidebar",
  "/navigation/vertical-nav": "vertical-nav",
  "/overlays/alert-dialog": "alert-dialog",
  "/overlays/command-palette": "command",
  "/overlays/context-menu": "context-menu",
  "/overlays/drawer": "drawer",
  "/overlays/dropdown-menu": "menu",
  "/overlays/hover-card": "hover-card",
  "/overlays/kbd": "kbd",
  "/overlays/menubar": "menubar",
  "/overlays/side-drawer": "side-drawer",
};

/** The plain definition of a page, or undefined for a page that has none (guides, docs, hubs). */
export function answerFor(path: string): string | undefined {
  return ANSWERS[path];
}

/** The page's install line: `npx shadcn@latest add <site>/r/<item>.json`, or undefined when the page has no registry item. */
export function installCommand(path: string): string | undefined {
  const item = INSTALL_ITEM[path];
  return item ? `npx shadcn@latest add ${SITE_URL}/r/${item}.json` : undefined;
}
