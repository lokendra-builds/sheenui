import { lazyBlock } from "../layout/lazy-block";

/**
 * The Combobox docs page (/components/combobox). Its demos pull in Base UI's positioner, popup and list code, which is
 * about 30 KB gzip: the page body is an island (requested while the page hydrates), so that code is not in the route's
 * initial JavaScript. The prerendered HTML holds the whole page, so nothing changes on screen.
 */
export const ComboboxPage = lazyBlock(() => import("./ComboboxPageBody").then((m) => m.ComboboxPage), {
  eager: true,
  minHeight: "80vh",
});
