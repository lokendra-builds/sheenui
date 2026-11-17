import { lazyBlock } from "../layout/lazy-block";

/**
 * The tooltip and popover docs pages. Their demos pull in Base UI's positioner and popup code, so each page body is an island that is requested
 * while the page hydrates: that code is not part of the route's initial JavaScript. The prerendered HTML holds the whole
 * page, so nothing changes on screen.
 */
const island = { eager: true, minHeight: "80vh" };

export const TooltipPage = lazyBlock(() => import("./OverlayPagesBody").then((m) => m.TooltipPage), island);
export const PopoverPage = lazyBlock(() => import("./OverlayPagesBody").then((m) => m.PopoverPage), island);
