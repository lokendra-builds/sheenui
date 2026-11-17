import { lazyBlock } from "../layout/lazy-block";

/**
 * The calendar, date picker and color picker docs pages. Their demos pull in Base UI's positioner and popup code, so each page body is an island that is requested
 * while the page hydrates: that code is not part of the route's initial JavaScript. The prerendered HTML holds the whole
 * page, so nothing changes on screen.
 */
const island = { eager: true, minHeight: "80vh" };

export const CalendarPage = lazyBlock(() => import("./PickerPagesBody").then((m) => m.CalendarPage), island);
export const DatePickerPage = lazyBlock(() => import("./PickerPagesBody").then((m) => m.DatePickerPage), island);
export const ColorPickerPage = lazyBlock(() => import("./PickerPagesBody").then((m) => m.ColorPickerPage), island);
