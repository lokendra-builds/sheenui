import { lazyBlock } from "../layout/lazy-block";

/**
 * The dialog docs page. Its demos pull in Base UI's positioner and popup code, so the page body is an island that is requested
 * while the page hydrates: that code is not part of the route's initial JavaScript. The prerendered HTML holds the whole
 * page, so nothing changes on screen.
 */
const island = { eager: true, minHeight: "80vh" };

export const DialogPage = lazyBlock(() => import("./DialogPageBody").then((m) => m.DialogPage), island);
