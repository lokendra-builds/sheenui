/**
 * `initialFocus` for the popup of a showcase-stage copy of a component. The story opens the popup by itself, and
 * must not pull focus into the stage while a visitor reads or types elsewhere on the page (no interaction type:
 * `""`). When the visitor opens it (mouse, touch, pen or keyboard) the popup is modal like any other, so focus has
 * to move into it; leaving it on the trigger behind the scrim lets Tab walk on to the page behind.
 */
export const stageInitialFocus = (openType: string): boolean => openType !== "";
