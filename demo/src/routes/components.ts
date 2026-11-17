import { lazyPage, type Route } from "./shared";

const formControls = () => import("../pages/FormControlPages");
const overlays = () => import("../pages/OverlayPages");
const display = () => import("../pages/DisplayPages");
const hubs = () => import("../pages/HubPages");
const primitives = () => import("../pages/PrimitivePages");

/** The "Components" routes of the docs site, in sidebar order. */
export const componentsRoutes: Route[] = [
  { path: "/components", title: "All components", group: "Components", ...lazyPage(hubs, (m) => m.ComponentsHubPage) },
  { path: "/components/alert", title: "Alert", group: "Components", ...lazyPage(primitives, (m) => m.AlertPage) },
  { path: "/components/avatar", title: "Avatar", group: "Components", ...lazyPage(display, (m) => m.AvatarPage) },
  { path: "/components/badge", title: "Badge", group: "Components", ...lazyPage(display, (m) => m.BadgePage) },
  {
    path: "/components/button",
    title: "Button",
    group: "Components",
    ...lazyPage(
      () => import("../pages/ButtonPage"),
      (m) => m.ButtonPage,
    ),
  },
  {
    path: "/components/button-group",
    title: "Button group",
    group: "Components",
    ...lazyPage(primitives, (m) => m.ButtonGroupPage),
  },
  {
    path: "/components/checkbox",
    title: "Checkbox",
    group: "Components",
    ...lazyPage(formControls, (m) => m.CheckboxPage),
  },
  {
    path: "/components/combobox",
    title: "Combobox (Select2)",
    group: "Components",
    ...lazyPage(
      () => import("../pages/ComboboxPage"),
      (m) => m.ComboboxPage,
    ),
  },
  {
    path: "/components/data-table",
    title: "Data table",
    group: "Components",
    ...lazyPage(
      () => import("../pages/DataTablePage"),
      (m) => m.DataTablePage,
    ),
  },
  {
    path: "/components/dialog",
    title: "Dialog",
    group: "Components",
    ...lazyPage(
      () => import("../pages/DialogPage"),
      (m) => m.DialogPage,
    ),
  },
  {
    path: "/components/glass-card",
    title: "Glass card",
    group: "Components",
    ...lazyPage(
      () => import("../pages/GlassCardPage"),
      (m) => m.GlassCardPage,
    ),
  },
  {
    path: "/components/input",
    title: "Input",
    group: "Components",
    ...lazyPage(
      () => import("../pages/InputPage"),
      (m) => m.InputPage,
    ),
  },
  {
    path: "/components/otp-input",
    title: "OTP input",
    group: "Components",
    ...lazyPage(
      () => import("../pages/OtpInputPage"),
      (m) => m.OtpInputPage,
    ),
  },
  { path: "/components/popover", title: "Popover", group: "Components", ...lazyPage(overlays, (m) => m.PopoverPage) },
  { path: "/components/progress", title: "Progress", group: "Components", ...lazyPage(display, (m) => m.ProgressPage) },
  { path: "/components/select", title: "Select", group: "Components", ...lazyPage(formControls, (m) => m.SelectPage) },
  { path: "/components/slider", title: "Slider", group: "Components", ...lazyPage(formControls, (m) => m.SliderPage) },
  { path: "/components/switch", title: "Switch", group: "Components", ...lazyPage(formControls, (m) => m.SwitchPage) },
  { path: "/components/spinner", title: "Spinner", group: "Components", ...lazyPage(primitives, (m) => m.SpinnerPage) },
  {
    path: "/components/tabs",
    title: "Tabs",
    group: "Components",
    ...lazyPage(
      () => import("../pages/TabsPage"),
      (m) => m.TabsPage,
    ),
  },
  {
    path: "/components/toast",
    title: "Toast",
    group: "Components",
    ...lazyPage(
      () => import("../pages/ToastPage"),
      (m) => m.ToastPage,
    ),
  },
  { path: "/components/tooltip", title: "Tooltip", group: "Components", ...lazyPage(overlays, (m) => m.TooltipPage) },
];
