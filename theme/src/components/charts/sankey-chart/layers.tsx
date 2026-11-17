"use client";

import { useMemo, useRef } from "react";

import { cn } from "../../../lib/cn";
import { r2 } from "../flow-utils";
import { sankeyLinkPath, type SankeyLayout } from "./layout";
import { LINK_GAP, type SankeyHandlers } from "./paint";

/** What the static (hover-independent) layers depend on. @internal */
export type SankeyStaticInput = {
  layout: SankeyLayout;
  linkColor: string;
  uid: string;
  nodeWidth: number;
  clickableLinks: boolean;
  clickableNodes: boolean;
};

/**
 * The layers that never change on hover, rendered once per layout: the link gradients and the hit areas
 * (ribbons at least 10px thick, then the nodes). The hit areas call the handlers kept in the returned
 * `handlersRef` at event time, so the layers never re-render when the handlers change.
 * @internal
 */
export function useSankeyStaticLayers(o: SankeyStaticInput) {
  const { layout, linkColor, uid, nodeWidth, clickableLinks, clickableNodes } = o;
  const handlersRef = useRef<SankeyHandlers | null>(null);
  const staticLayers = useMemo(() => {
    const h = () => handlersRef.current;
    // Thin flows draw on top of thick ones, so every flow can be hovered.
    const hitOrder = [...layout.links].sort((a, b) => b.width - a.width);
    return {
      gradients:
        linkColor === "gradient"
          ? layout.links.map((l) => (
              <linearGradient
                key={l.id}
                id={`${uid}-g${l.index}`}
                gradientUnits="userSpaceOnUse"
                x1={r2(l.source.x1)}
                x2={r2(l.target.x0)}
                y1={0}
                y2={0}
              >
                <stop offset="0" style={{ stopColor: l.source.color }} />
                <stop offset="1" style={{ stopColor: l.target.color }} />
              </linearGradient>
            ))
          : null,
      // Hit areas: ribbons at least 10px thick (thin ones on top), then the nodes (wider than drawn).
      hits: (
        <>
          <g fill="none" stroke="transparent">
            {hitOrder.map((l) => (
              <path
                key={l.id}
                d={sankeyLinkPath(l, LINK_GAP)}
                strokeWidth={Math.max(10, l.width)}
                className={cn(clickableLinks && "cursor-pointer")}
                onPointerEnter={(e) => h()?.enterLink(l, e)}
                onPointerMove={(e) => h()?.moveLink(e)}
                onPointerLeave={(e) => h()?.leave(e)}
                onPointerDown={(e) => h()?.downLink(l, e)}
                onClick={() => h()?.clickLink(l)}
              />
            ))}
          </g>
          <g fill="transparent">
            {layout.nodes.map((n) => (
              <rect
                key={n.id}
                x={n.x0 - 6}
                y={n.y0 - 2}
                width={nodeWidth + 12}
                height={Math.max(12, n.y1 - n.y0 + 4)}
                className={cn(clickableNodes && "cursor-pointer")}
                onPointerEnter={(e) => h()?.enterNode(n.id, e)}
                onPointerLeave={(e) => h()?.leave(e)}
                onPointerDown={(e) => h()?.downNode(n.id, e)}
                onClick={() => h()?.clickNode(n.id)}
              />
            ))}
          </g>
        </>
      ),
    };
  }, [layout, linkColor, uid, nodeWidth, clickableLinks, clickableNodes]);
  return { staticLayers, handlersRef };
}
