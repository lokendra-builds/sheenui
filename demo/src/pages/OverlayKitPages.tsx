import { lazyBlock } from "../layout/lazy-block";

/**
 * The drawer, alert dialog and hover card docs pages. Their demos pull in Base UI's positioner, popup and drawer code
 * (about 20 KB gzip), so each page body is an island requested while the page hydrates: that code is not part of the
 * route's initial JavaScript. The prerendered HTML holds the whole page, so nothing changes on screen.
 */
const island = { eager: true, minHeight: "80vh" };

export const DrawerPage = lazyBlock(() => import("./OverlayKitPagesBody").then((m) => m.DrawerPage), island);
export const AlertDialogPage = lazyBlock(() => import("./OverlayKitPagesBody").then((m) => m.AlertDialogPage), island);
export const HoverCardPage = lazyBlock(() => import("./OverlayKitPagesBody").then((m) => m.HoverCardPage), island);
