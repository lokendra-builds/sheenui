"use client";

import { AnimatePresence, motion, type HTMLMotionProps, type Transition } from "motion/react";
import { useLayoutEffect, useRef, type ElementType, type ReactNode, type RefObject } from "react";

import { useSheenReducedMotion } from "../hooks/use-preferences";
import { duration, ease, spring } from "./tokens";

/** Motion's `layout` transition for reordering: `spring.smooth` (never overshoots), instant with reduced motion. */
const instant = { duration: 0 } satisfies Transition;

/** The tags an item can render as (a fixed map: Motion components are created once, never during render). */
const motionTags = {
  li: motion.li,
  div: motion.div,
  section: motion.section,
  article: motion.article,
  tr: motion.tr,
  a: motion.a,
  p: motion.p,
} as const;

/** Tags an {@link AnimatedListItem} can render as. */
export type AnimatedListItemTag = keyof typeof motionTags;

/**
 * Keeps keyboard focus on an element that React moved. Reordering keyed children moves their DOM
 * nodes, and a browser drops focus from a node that is re-inserted. Give it the list element: it
 * remembers the focused descendant and puts focus back after the render that moved it.
 *
 * Accessibility: Only restores focus that the move itself dropped (focus on `body`); it never steals focus from elsewhere.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useKeepFocusOnReorder } from "@sheenui/theme";
 *
 * export function Rows({ ids }: { ids: string[] }) {
 *   const ref = useRef<HTMLUListElement>(null);
 *   useKeepFocusOnReorder(ref);
 *   return (
 *     <ul ref={ref}>
 *       {ids.map((id) => (
 *         <li key={id}>
 *           <button type="button">{id}</button>
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @param ref - Ref of the element whose children are reordered.
 * @see /foundations
 */
export function useKeepFocusOnReorder(ref: RefObject<HTMLElement | null>) {
  const last = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const remember = (event: FocusEvent) => {
      last.current = event.target instanceof HTMLElement ? event.target : null;
    };
    const forget = (event: FocusEvent) => {
      // Moving a node fires blur with no related target; a real move of focus sets one.
      if (event.relatedTarget) last.current = null;
    };
    root.addEventListener("focusin", remember);
    root.addEventListener("focusout", forget);
    return () => {
      root.removeEventListener("focusin", remember);
      root.removeEventListener("focusout", forget);
    };
  }, [ref]);
  // Every render: if the remembered node is still in the list but focus fell to the body, restore it.
  useLayoutEffect(() => {
    const node = last.current;
    const active = document.activeElement;
    if (node && node.isConnected && ref.current?.contains(node) && (!active || active === document.body)) {
      node.focus({ preventScroll: true });
    }
  });
}

/** Props of {@link AnimatedList}. */
export type AnimatedListProps = {
  /**
   * Sets the tag of the list element.
   * @default "ul"
   */
  as?: "ul" | "ol" | "div" | "section" | "tbody";
  /** Holds the items, which are {@link AnimatedListItem}s with stable `key`s. */
  children?: ReactNode;
  /** Class names for the list element. */
  className?: string;
  /**
   * Animate items leaving (shorter than an entrance, items below close the gap by sliding up).
   * @default true
   */
  animateExit?: boolean;
} & Omit<React.HTMLAttributes<HTMLElement>, "children" | "className">;

/**
 * A list whose items slide to their new position when they are reordered, inserted or removed, and
 * fade and scale in or out. Use it for to-do lists, ranked lists, sortable cards and any keyed list
 * that changes. It is built on Motion `layout` (a transform-only FLIP: the new layout is measured,
 * then each item is animated from where it was, so nothing outside the list shifts), springs from
 * the motion tokens, and keeps keyboard focus on an item that moved. Pair it with
 * {@link AnimatedListItem}; every item needs a stable `key`.
 *
 * Props: `as` (default `"ul"`), `animateExit` (default `true`), `className`, plus any native element prop.
 *
 * Keyboard: Nothing is added: items keep their own tab order, and a focused item stays focused while it slides to its new place.
 * Accessibility: Renders a plain `ul` (or your `as`) with real children, so list semantics and reading order follow the DOM, which already has the new order. Reordering is not announced by itself: announce it from your own live region when the user caused it.
 * Motion: Items move with `spring.smooth` on transform only; an entrance fades and scales in, an exit uses `duration.exit` with `ease.exit` (shorter than the entrance). With reduced motion items jump to their new place with no animation, and only a plain fade remains.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { AnimatedList, AnimatedListItem } from "@sheenui/theme";
 *
 * export function Todos() {
 *   const [items, setItems] = useState(["Write", "Review", "Ship"]);
 *   return (
 *     <>
 *       <button type="button" onClick={() => setItems((list) => [...list].reverse())}>
 *         Reverse
 *       </button>
 *       <AnimatedList>
 *         {items.map((item) => (
 *           <AnimatedListItem key={item}>{item}</AnimatedListItem>
 *         ))}
 *       </AnimatedList>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function AnimatedList({ as = "ul", animateExit = true, children, ...rest }: AnimatedListProps) {
  const ref = useRef<HTMLElement>(null);
  useKeepFocusOnReorder(ref);
  const Tag = as as ElementType;
  return (
    <Tag ref={ref} data-slot="animated-list" {...rest}>
      {animateExit ? (
        <AnimatePresence initial={false} mode="popLayout">
          {children}
        </AnimatePresence>
      ) : (
        children
      )}
    </Tag>
  );
}

/** Props of {@link AnimatedListItem}. */
export type AnimatedListItemProps = {
  /**
   * Sets the tag of the item element.
   * @default "li"
   */
  as?: AnimatedListItemTag;
  /**
   * Animate the item's size too (`layout`), not just its position. Off by default: position-only
   * FLIP never stretches the content.
   * @default false
   */
  resize?: boolean;
} & Omit<HTMLMotionProps<"li">, "layout" | "transition">;

/**
 * One item of an {@link AnimatedList}. It animates to a new position with Motion `layout="position"`
 * (transform only), fades and scales in on insert and out on removal, and renders as any tag with
 * `as`. Give it a stable `key`; the key is what lets it be tracked across a reorder.
 *
 * Props: `as` (default `"li"`), `resize` (default `false`), plus any Motion / native element prop except `layout` and `transition`.
 *
 * Keyboard: Nothing is added; interactive content inside keeps its own keys and its focus survives the move.
 * Accessibility: A plain `li` by default (use `as="div"` outside a `ul`); it adds no roles or live regions. Animation never delays the content: the new DOM order is correct from the first frame.
 * Motion: Reflow uses `spring.smooth`, transform only; entrance is a short fade and scale, exit uses `duration.exit` and `ease.exit`. Reduced motion: no movement, no scaling, instant.
 *
 * @example
 * ```tsx
 * import { AnimatedList, AnimatedListItem } from "@sheenui/theme";
 *
 * export function Ranking({ names }: { names: string[] }) {
 *   return (
 *     <AnimatedList>
 *       {names.map((name) => (
 *         <AnimatedListItem key={name}>{name}</AnimatedListItem>
 *       ))}
 *     </AnimatedList>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function AnimatedListItem({ as = "li", resize = false, ...rest }: AnimatedListItemProps) {
  const reduced = useSheenReducedMotion();
  const Item = motionTags[as] as typeof motion.li;
  return (
    <Item
      data-slot="animated-list-item"
      layout={reduced ? false : resize ? true : "position"}
      initial={reduced ? false : { opacity: 0, scale: 0.98 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: reduced ? instant : { ...spring.smooth, opacity: { duration: duration.base } },
      }}
      exit={{
        opacity: 0,
        scale: reduced ? 1 : 0.98,
        transition: { duration: reduced ? 0 : duration.exit, ease: ease.exit },
      }}
      transition={reduced ? instant : spring.smooth}
      {...rest}
    />
  );
}

/**
 * The `layout` props for a row that should slide to its new place when its siblings reorder, for
 * markup that cannot use {@link AnimatedListItem} (table rows, grid cells). Spread them on a
 * `motion.tr`, `motion.div`, ...: `<motion.tr {...useRowReorder()} />`. It is position-only
 * (transform), with `spring.smooth`, and `{ layout: false }` under reduced motion.
 *
 * Accessibility: Adds no semantics, so `display` and table roles are untouched.
 * Motion: Transform only; reduced motion: no animation.
 *
 * @example
 * ```tsx
 * import { motion } from "motion/react";
 * import { useRowReorder } from "@sheenui/theme";
 *
 * export function Row({ label }: { label: string }) {
 *   const reorder = useRowReorder();
 *   return (
 *     <motion.div {...reorder}>
 *       {label}
 *     </motion.div>
 *   );
 * }
 * ```
 *
 * @returns Props to spread on a Motion element: `layout` and `transition`.
 * @see /foundations
 */
export function useRowReorder() {
  const reduced = useSheenReducedMotion();
  return reduced
    ? ({ layout: false } as const)
    : ({ layout: "position", transition: { layout: spring.smooth } } as const);
}
