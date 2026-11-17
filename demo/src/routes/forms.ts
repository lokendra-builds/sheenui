import { lazyPage, type Route } from "./shared";

const primitives = () => import("../pages/PrimitivePages");
const tableSidebar = () => import("../pages/TableSidebarPages");

/** The "Forms" routes of the docs site, in sidebar order. */
export const formsRoutes: Route[] = [
  {
    path: "/forms/calendar",
    title: "Calendar",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/PickerPages"),
      (m) => m.CalendarPage,
    ),
  },
  {
    path: "/forms/color-picker",
    title: "Color picker",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/PickerPages"),
      (m) => m.ColorPickerPage,
    ),
  },
  {
    path: "/forms/date-picker",
    title: "Date picker",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/PickerPages"),
      (m) => m.DatePickerPage,
    ),
  },
  { path: "/forms/field", title: "Field and Label", group: "Forms", ...lazyPage(primitives, (m) => m.FieldPage) },
  {
    path: "/forms/file-upload",
    title: "File upload",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/AdvancedFormPages"),
      (m) => m.FileUploadPage,
    ),
  },
  {
    path: "/forms/input-group",
    title: "Input group",
    group: "Forms",
    ...lazyPage(tableSidebar, (m) => m.InputGroupPage),
  },
  {
    path: "/forms/number-field",
    title: "Number field",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/TextareaNumberFieldPages"),
      (m) => m.NumberFieldPage,
    ),
  },
  {
    path: "/forms/radio-group",
    title: "Radio group",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/FormKitPages"),
      (m) => m.RadioGroupPage,
    ),
  },
  {
    path: "/forms/rating",
    title: "Rating",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/AdvancedFormPages"),
      (m) => m.RatingPage,
    ),
  },
  {
    path: "/forms/segmented-control",
    title: "Segmented control",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/FormKitPages"),
      (m) => m.SegmentedControlPage,
    ),
  },
  {
    path: "/forms/tags-input",
    title: "Tags input",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/AdvancedFormPages"),
      (m) => m.TagsInputPage,
    ),
  },
  {
    path: "/forms/textarea",
    title: "Textarea",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/TextareaNumberFieldPages"),
      (m) => m.TextareaPage,
    ),
  },
  {
    path: "/forms/toggle",
    title: "Toggle",
    group: "Forms",
    ...lazyPage(
      () => import("../pages/FormKitPages"),
      (m) => m.TogglePage,
    ),
  },
];
