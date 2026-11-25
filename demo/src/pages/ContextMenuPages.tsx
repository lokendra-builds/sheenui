import { lazyBlock } from "../layout/lazy-block";

/**
 * The context menu, menubar and command palette docs pages. Their demos pull in Base UI's positioner and popup code, so each page body is an island that is requested
 * while the page hydrates: that code is not part of the route's initial JavaScript. The prerendered HTML holds the whole
 * page, so nothing changes on screen.
 */
const island = { eager: true, minHeight: "80vh" };

export const ContextMenuPage = lazyBlock(() => import("./ContextMenuPagesBody").then((m) => m.ContextMenuPage), island);
export const MenubarPage = lazyBlock(() => import("./ContextMenuPagesBody").then((m) => m.MenubarPage), island);
export const CommandPalettePage = lazyBlock(
  () => import("./ContextMenuPagesBody").then((m) => m.CommandPalettePage),
  island,
);
