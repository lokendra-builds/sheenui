import type { SearchFields } from "./search-rank";

/** Extra search terms of a docs page, by route path: what people call it (aliases) and what it is about (keywords). */
export type Synonyms = Pick<SearchFields, "aliases" | "keywords">;

const SHEET_KEYWORDS = ["bottom sheet", "sheet", "mobile sheet", "mobile", "phone"];

/** Names and topics that a page's title and exports do not carry. Titles and exports are searched as well. */
export const SEARCH_SYNONYMS: Readonly<Record<string, Synonyms>> = {
  // Bottom sheets: the drawers first (they are the sheet), then the pages with a `mobile="sheet"` example.
  "/overlays/drawer": { aliases: ["bottom sheet", "sheet", "bottom drawer", "phone", "mobile"], keywords: ["touch"] },
  "/overlays/side-drawer": { aliases: ["sheet", "bottom sheet", "panel"], keywords: ["mobile", "phone", "slide over"] },
  "/components/dialog": { aliases: ["modal", "popup", "lightbox"], keywords: SHEET_KEYWORDS },
  "/components/popover": { aliases: ["popup", "flyout"], keywords: SHEET_KEYWORDS },
  "/overlays/dropdown-menu": { aliases: ["dropdown", "drop down"], keywords: [...SHEET_KEYWORDS, "context"] },
  "/components/select": {
    aliases: ["dropdown select", "picker", "dropdown", "listbox"],
    keywords: [...SHEET_KEYWORDS, "virtualized", "virtualize", "virtual list", "large list"],
  },
  // Virtualized lists.
  "/components/data-table": {
    aliases: ["datagrid", "data grid", "grid"],
    keywords: ["virtualized", "virtualize", "virtual list", "large list", "thousands of rows", "sortable"],
  },
  "/components/combobox": {
    aliases: ["autocomplete", "searchable select", "typeahead", "multi select", "multiselect"],
    keywords: ["virtualized", "virtualize", "virtual list", "large list"],
  },
  "/overlays/command-palette": {
    aliases: ["cmd k", "ctrl k", "command menu", "search"],
    keywords: ["virtualized", "virtualize", "virtual list", "large list", "spotlight"],
  },
  // Effects.
  "/effects/animated-beam": { aliases: ["beam"], keywords: ["connection", "integration", "data flow", "lines"] },
  "/effects/border-beam": { aliases: ["beam"], keywords: ["glow border", "comet", "outline", "running border"] },
  "/effects/confetti": { keywords: ["celebration", "success", "party", "burst"] },
  "/effects/meteors": { aliases: ["meteor", "shooting star"], keywords: ["streaks", "stars"] },
  "/effects/particles": { aliases: ["particle"], keywords: ["dots", "starfield", "background"] },
  "/effects/orbiting-circles": { aliases: ["orbit", "orbiting"], keywords: ["integrations", "planets", "rings"] },
  "/effects/scroll-progress": {
    aliases: ["scroll progress", "reading progress"],
    keywords: ["progress bar", "reading"],
  },
  "/effects/text-reveal": { aliases: ["scroll text"], keywords: ["words", "highlight words", "scroll reveal"] },
  // Blocks.
  "/blocks/not-found-page": { aliases: ["404", "not found", "error page"], keywords: ["missing page"] },
  "/blocks/hero-section": {
    aliases: ["hero", "landing", "landing page"],
    keywords: ["landing page", "marketing", "headline"],
  },
  "/blocks/faq-section": { aliases: ["faq", "frequently asked questions", "questions"], keywords: ["accordion"] },
  "/blocks/site-footer": { aliases: ["footer"], keywords: ["links", "newsletter", "social"] },
  "/blocks/announcement-banner": { aliases: ["banner", "announcement"], keywords: ["promo", "notice", "top bar"] },
  // Charts.
  "/charts/bump-chart": { aliases: ["bump", "ranking"], keywords: ["rank over time", "ranks"] },
  "/charts/population-pyramid": { aliases: ["pyramid", "age pyramid"], keywords: ["demographics", "age"] },
  "/charts/error-bar-chart": {
    aliases: ["confidence interval", "error bar", "error bars"],
    keywords: ["uncertainty", "whisker", "standard deviation", "interval"],
  },
  "/guides/accessible-react-charts": {
    aliases: ["accessible charts", "chart a11y"],
    keywords: ["chart accessibility", "patterns", "colour blind", "color blind", "table twin"],
  },
  // Docs pages.
  "/docs/rtl": {
    aliases: ["rtl", "right to left", "arabic", "hebrew", "i18n", "l10n", "localization", "localisation", "direction"],
    keywords: [
      "bidi",
      "locale",
      "translate",
      "translation",
      "internationalization",
      "internationalisation",
      "persian",
      "urdu",
      "dir",
      "labels",
    ],
  },
  "/docs/installation": {
    aliases: ["install", "getting started", "setup", "registry", "shadcn registry", "shadcn add", "cli"],
    keywords: ["npm", "pnpm", "shadcn", "quick start", "copy the source", "r/"],
  },
  "/docs/tailwind-v4": {
    aliases: ["tailwind", "tailwind 4", "tailwindcss"],
    keywords: ["css setup", "@source", "theme"],
  },
  "/docs/dark-mode": {
    aliases: ["dark", "light mode", "theme", "theming", "color scheme"],
    keywords: [
      "prefers-color-scheme",
      "toggle theme",
      "aurora",
      "neon",
      "aurora neon",
      "preset",
      "style preset",
      "reduced motion",
    ],
  },
  "/docs/base-ui": { aliases: ["headless", "base ui"], keywords: ["radix", "primitives", "unstyled"] },
  "/docs/forms": { aliases: ["form", "react hook form", "validation"], keywords: ["zod", "submit", "field errors"] },
  "/foundations": {
    aliases: [
      "tokens",
      "design tokens",
      "design system",
      "aurora",
      "neon",
      "aurora neon",
      "style",
      "styles",
      "preset",
      "presets",
      "style preset",
      "reduced motion",
      "prefers-reduced-motion",
    ],
    keywords: ["colors", "colours", "spacing", "typography", "radius", "shadows", "motion", "liquid glass preset"],
  },
  "/showcase": { aliases: ["examples", "demo", "gallery"], keywords: ["templates"] },
  // Auth and account blocks.
  "/blocks/glass-login": {
    aliases: ["sign in", "signin", "log in", "auth", "authentication"],
    keywords: ["password", "email", "social login", "forgot password", "reset password", "password reset", "reset"],
  },
  "/blocks/lamp-login": {
    aliases: ["sign in", "signin", "log in", "auth", "authentication"],
    keywords: ["password", "lamp", "glow", "forgot password", "reset password", "password reset", "reset"],
  },
  "/blocks/signup-page": {
    aliases: ["signup page", "signup", "sign up", "sign in", "register", "registration", "create account", "auth"],
    keywords: ["onboarding", "password"],
  },
  "/blocks/otp-verification": {
    aliases: ["2fa", "two factor", "mfa", "verification code", "one time password"],
    keywords: ["auth", "code", "sms"],
  },
  "/blocks/payment-checkout": {
    aliases: ["checkout", "payment", "credit card", "billing"],
    keywords: ["cart", "order", "card number"],
  },
  "/blocks/pricing": {
    aliases: ["plans", "price table", "pricing table", "subscription"],
    keywords: ["billing", "tiers", "monthly yearly"],
  },
  "/blocks/dashboard-stats": {
    aliases: ["kpi", "kpis", "metrics", "stat cards", "stats row"],
    keywords: ["numbers", "indicators", "summary"],
  },
  "/blocks/ai-chat": {
    aliases: ["chatbot", "assistant", "llm", "copilot"],
    keywords: ["streaming", "prompt", "messages", "gpt"],
  },
  "/blocks/chat-app": {
    aliases: ["messenger", "messaging", "inbox chat"],
    keywords: ["conversation", "slack", "whatsapp"],
  },
  "/blocks/notification-center": { aliases: ["notifications", "inbox", "bell"], keywords: ["alerts", "unread"] },
  "/blocks/feature-grid": { aliases: ["features", "feature list"], keywords: ["benefits", "marketing", "icons"] },
  "/blocks/testimonials": { aliases: ["reviews", "quotes", "social proof"], keywords: ["customers", "wall of love"] },
  "/blocks/settings-page": { aliases: ["settings", "preferences", "account settings"], keywords: ["profile", "form"] },
  "/blocks/contact-form": { aliases: ["contact", "contact us"], keywords: ["support", "message"] },
  "/blocks/bento-grid": { aliases: ["bento"], keywords: ["tiles", "feature cards"] },
  "/chat/list": { aliases: ["conversations", "conversation list"], keywords: ["inbox", "messages"] },
  "/chat/thread": { aliases: ["messages", "message list", "chat thread"], keywords: ["bubbles", "conversation"] },
  "/chat/widget": { aliases: ["chat widget", "support widget", "live chat"], keywords: ["intercom", "floating"] },
  // Dashboards.
  "/dashboards/saas": { aliases: ["mrr", "revenue", "subscription metrics"], keywords: ["arr", "churn"] },
  "/dashboards/ecommerce": { aliases: ["e-commerce", "shop", "store", "orders"], keywords: ["sales"] },
  "/dashboards/crypto-dashboard": { aliases: ["bitcoin", "crypto", "trading"], keywords: ["portfolio", "price"] },
  "/dashboards/web-analytics": { aliases: ["analytics", "traffic"], keywords: ["visitors", "page views"] },
  "/dashboards/product": { aliases: ["product analytics"], keywords: ["funnels", "retention", "events"] },
  // Components.
  "/components/spinner": { aliases: ["loader", "loading", "activity indicator"], keywords: ["busy", "wait"] },
  "/components/skeleton": {
    aliases: ["loader", "loading placeholder", "shimmer loading", "placeholder"],
    keywords: ["loading", "shimmer"],
  },
  "/components/toast": {
    aliases: ["notification", "snackbar", "snack bar"],
    keywords: ["alert", "message", "toaster", "position", "placement", "stacking"],
  },
  "/components/switch": { aliases: ["toggle switch", "on off", "on/off"], keywords: ["toggle"] },
  "/forms/toggle": { aliases: ["toggle button", "pressed"], keywords: ["toggle group"] },
  "/components/button": { aliases: ["cta", "call to action"], keywords: ["click"] },
  "/components/glass-card": { aliases: ["card", "glassmorphism", "panel"], keywords: ["frosted glass"] },
  "/components/input": { aliases: ["text field", "text input", "textbox"], keywords: ["form", "field"] },
  "/components/otp-input": {
    aliases: ["verification code", "pin input", "otp", "passcode"],
    keywords: ["2fa", "code input"],
  },
  "/components/slider": { aliases: ["range slider", "range"], keywords: ["volume"] },
  "/components/avatar": {
    aliases: ["profile picture", "user picture", "profile image"],
    keywords: ["initials", "photo"],
  },
  "/components/badge": { aliases: ["tag", "pill", "chip", "label"], keywords: ["status", "count"] },
  "/components/alert": {
    aliases: ["banner message", "callout", "message box"],
    keywords: ["notice", "warning", "error message"],
  },
  "/components/tooltip": { aliases: ["hint", "hover hint"], keywords: ["help text"] },
  "/components/progress": { aliases: ["progress bar", "loading bar"], keywords: ["percent"] },
  "/components/meter": { aliases: ["gauge meter"], keywords: ["level", "capacity", "usage"] },
  "/components/carousel": {
    aliases: ["slider images", "slideshow", "image slider", "swiper"],
    keywords: ["slides", "gallery"],
  },
  "/components/code-block": {
    aliases: ["syntax highlight", "code snippet", "snippet"],
    keywords: ["highlight", "copy button", "pre", "markdown", "fenced code"],
  },
  "/components/empty-state": {
    aliases: ["no results", "no data", "nothing here", "zero state"],
    keywords: ["placeholder"],
  },
  "/components/table": { aliases: ["html table"], keywords: ["rows", "columns"] },
  "/components/tabs": { aliases: ["tab bar", "tab list"], keywords: ["panels"] },
  "/components/checkbox": { aliases: ["check box", "tick"], keywords: ["indeterminate"] },
  // Forms.
  "/forms/calendar": { aliases: ["month view", "month picker"], keywords: ["dates", "schedule"] },
  "/forms/date-picker": {
    aliases: ["datepicker", "date input", "date"],
    keywords: ["calendar", "range", "time picker", "time", "date range"],
  },
  "/forms/color-picker": {
    aliases: ["colour picker", "colour", "color", "hue"],
    keywords: ["swatch", "eyedropper", "hex"],
  },
  "/forms/file-upload": { aliases: ["dropzone", "upload", "drag and drop"], keywords: ["files", "images"] },
  "/forms/number-field": {
    aliases: ["number input", "stepper input", "numeric input"],
    keywords: ["increment", "quantity"],
  },
  "/forms/radio-group": { aliases: ["radio buttons", "radio"], keywords: ["options"] },
  "/forms/rating": { aliases: ["stars", "star rating", "review stars"], keywords: ["score"] },
  "/forms/segmented-control": {
    aliases: ["button toggle group", "button group toggle", "pill tabs"],
    keywords: ["switcher"],
  },
  "/forms/tags-input": {
    aliases: ["chips input", "multi input", "token input"],
    keywords: ["chips", "labels", "multi select"],
  },
  "/forms/textarea": { aliases: ["multiline", "multi line", "text area"], keywords: ["autosize", "comment box"] },
  // Overlays and navigation.
  "/overlays/alert-dialog": {
    aliases: ["confirmation dialog", "confirm dialog", "confirm"],
    keywords: ["destructive", "are you sure"],
  },
  "/overlays/context-menu": { aliases: ["right click", "right-click"], keywords: ["menu"] },
  "/overlays/kbd": { aliases: ["keyboard", "keyboard shortcut", "shortcut", "hotkey"], keywords: ["keys", "keycap"] },
  "/overlays/menubar": { aliases: ["menu bar"], keywords: ["file edit view"] },
  "/overlays/hover-card": { aliases: ["preview card", "link preview"], keywords: ["hover"] },
  "/navigation/navbar": { aliases: ["header", "top nav", "top bar", "app bar"], keywords: ["navigation", "logo"] },
  "/navigation/sidebar": {
    aliases: ["side nav", "side navigation", "left nav"],
    keywords: ["collapsible", "app shell"],
  },
  "/navigation/navigation-menu": { aliases: ["mega menu", "nav menu"], keywords: ["links", "flyout"] },
  "/navigation/vertical-nav": { aliases: ["vertical navigation", "side menu"], keywords: ["list of links"] },
  // Layout.
  "/layout/accordion": {
    aliases: ["expandable", "faq accordion", "disclosure"],
    keywords: ["collapse", "sections", "tree view", "tree"],
  },
  "/layout/aspect-ratio": { aliases: ["16:9", "ratio"], keywords: ["video", "image"] },
  "/layout/breadcrumb": { aliases: ["breadcrumbs", "trail"], keywords: ["path", "hierarchy"] },
  "/layout/collapsible": {
    aliases: ["collapse", "expand", "show more"],
    keywords: ["toggle content", "tree view", "tree"],
  },
  "/layout/pagination": { aliases: ["pager", "pages", "page numbers", "paging"], keywords: ["next previous"] },
  "/layout/resizable": {
    aliases: ["split pane", "splitter", "split view", "resize"],
    keywords: ["panels", "drag handle"],
  },
  "/layout/scroll-area": {
    aliases: ["scrollbar", "scrollable", "overflow"],
    keywords: ["custom scrollbar", "kanban", "board", "columns"],
  },
  "/layout/separator": { aliases: ["divider", "hr", "horizontal rule"], keywords: ["line"] },
  "/layout/stepper": { aliases: ["wizard", "steps", "multi step"], keywords: ["progress steps", "checkout steps"] },
  "/layout/timeline": { aliases: ["activity feed", "history", "changelog"], keywords: ["events"] },
  // Effects.
  "/effects/blur-in": { aliases: ["fade in", "fade"], keywords: ["entrance", "reveal"] },
  "/effects/marquee": {
    aliases: ["logo ticker", "infinite scroll", "ticker", "scrolling logos"],
    keywords: ["logo cloud", "carousel"],
  },
  "/effects/morphing-dialog": { aliases: ["shared element", "expand card"], keywords: ["layout animation", "modal"] },
  "/effects/number-ticker": {
    aliases: ["count up", "counter", "animated number"],
    keywords: ["odometer", "digits", "countdown", "timer"],
  },
  "/effects/typewriter": { aliases: ["typing effect", "typing", "type effect"], keywords: ["text"] },
  "/effects/word-rotate": { aliases: ["rotating words", "word cycle"], keywords: ["headline"] },
  "/effects/shimmer-text": { aliases: ["shimmer", "shiny text"], keywords: ["gradient text"] },
  "/effects/liquid-glass": { aliases: ["refraction", "apple glass"], keywords: ["lens", "distortion"] },
  "/effects/macos-dock": { aliases: ["dock", "mac dock"], keywords: ["magnification", "icons"] },
  "/effects/spotlight-card": { aliases: ["spotlight", "cursor glow"], keywords: ["hover glow"] },
  "/effects/3d-tilt-card": { aliases: ["tilt", "tilt card", "parallax card"], keywords: ["perspective"] },
  // More charts.
  "/charts/calendar-heatmap": {
    aliases: ["github contributions", "contribution graph", "activity calendar"],
    keywords: ["days"],
  },
  "/charts/candlestick": { aliases: ["stock chart", "ohlc", "financial chart"], keywords: ["trading", "price"] },
  "/charts/combo-chart": { aliases: ["dual axis", "bar and line"], keywords: ["mixed chart"] },
  "/charts/funnel-chart": { aliases: ["conversion funnel", "funnel"], keywords: ["conversion", "sales pipeline"] },
  "/charts/gantt": { aliases: ["project timeline", "schedule chart"], keywords: ["tasks", "roadmap"] },
  "/charts/gauge-chart": { aliases: ["speedometer", "dial"], keywords: ["radial meter"] },
  "/charts/network-graph": { aliases: ["node graph", "graph network", "force graph"], keywords: ["nodes", "links"] },
  "/charts/radar-chart": { aliases: ["spider chart", "web chart", "spider"], keywords: ["axes"] },
  "/charts/sankey-diagram": { aliases: ["flow diagram", "flow chart"], keywords: ["flows"] },
  "/charts/scatter-plot": { aliases: ["scatter", "bubble chart", "xy plot"], keywords: ["correlation"] },
  "/charts/realtime-chart": {
    aliases: ["real time", "realtime", "live chart", "streaming chart", "live data"],
    keywords: ["websocket"],
  },
  "/charts/uptime-tracker": { aliases: ["status page", "uptime"], keywords: ["monitoring", "availability"] },
  "/charts/world-map": { aliases: ["map", "geo", "choropleth", "countries"], keywords: ["geography", "regions"] },
  "/charts/line-chart": { aliases: ["line graph"], keywords: ["trend", "time series"] },
  "/charts/area-chart": { aliases: ["area graph"], keywords: ["time series"] },
  "/charts/bar-chart": { aliases: ["bar graph", "column chart", "columns"], keywords: ["grouped", "stacked"] },
  "/charts/donut-chart": { aliases: ["doughnut", "ring chart"], keywords: ["pie", "share"] },
  "/charts/pie-chart": { aliases: ["pie graph"], keywords: ["share", "proportion"] },
  "/charts/sparkline": { aliases: ["mini chart", "inline chart", "tiny chart"], keywords: ["trend"] },
  "/charts/percent-stacked-bar-chart": {
    aliases: ["stacked bar", "stacked bars", "100% stacked"],
    keywords: ["proportion"],
  },
  "/charts/stacked-area-chart": { aliases: ["stacked area"], keywords: ["layers"] },
  "/charts/box-plot": { aliases: ["boxplot", "violin", "box and whisker"], keywords: ["quartiles"] },
  "/charts/histogram": { aliases: ["distribution", "frequency"], keywords: ["bins"] },
  "/charts/cohort-retention": { aliases: ["cohort", "retention"], keywords: ["triangle"] },
  // Guides.
  "/guides/install-frameworks": {
    aliases: ["install frameworks", "nextjs", "next.js", "install nextjs", "vite"],
    keywords: ["next", "framework", "ssr", "app router"],
  },
  "/guides/shadcn-alternatives": {
    aliases: ["shadcn", "shadcn ui alternative"],
    keywords: ["compare", "comparison", "alternatives"],
  },
  "/guides/framer-motion-to-motion": {
    aliases: ["framer motion", "migrate framer motion"],
    keywords: ["migration", "motion/react"],
  },
  "/guides/accessible-glassmorphism": {
    aliases: ["accessibility", "a11y", "contrast", "wcag"],
    keywords: ["accessible"],
  },
  "/guides/best-glassmorphism-react-libraries": {
    aliases: ["best glassmorphism react libraries", "glassmorphism libraries"],
    keywords: ["comparison"],
  },
  "/guides/base-ui-vs-radix": { aliases: ["radix"], keywords: ["comparison", "headless"] },
};
