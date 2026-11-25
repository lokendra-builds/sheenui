import { useRef, useState } from "react";
import { Button, cn, useToast } from "@sheenui/theme";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@sheenui/theme";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@sheenui/theme";
import { KbdShortcut } from "@sheenui/theme";
import { I, icon } from "./shared";

/* =====================================================================
 * Context menu
 * ===================================================================== */

const photos = [
  { name: "Aurora.jpg", from: 1, to: 7 },
  { name: "Dunes.jpg", from: 4, to: 2 },
  { name: "Lagoon.jpg", from: 3, to: 7 },
  { name: "Bloom.jpg", from: 5, to: 1 },
] as const;

/** One list of actions, shared by the right-click menu and the visible ⋯ button. */
function PhotoActions({
  name,
  favorite,
  onFavorite,
}: {
  name: string;
  favorite: boolean;
  onFavorite: (on: boolean) => void;
}) {
  const toast = useToast();
  return (
    <>
      <MenuItem icon={icon(I.image)} shortcut="space" onClick={() => toast.info(`Opening ${name}`)}>
        Open
      </MenuItem>
      <MenuItem icon={icon(I.pencil)} shortcut="enter" onClick={() => toast.info(`Rename ${name}`)}>
        Rename
      </MenuItem>
      <MenuItem icon={icon(I.copy)} shortcut="mod+d" onClick={() => toast.success(`Duplicated ${name}`)}>
        Duplicate
      </MenuItem>
      <MenuCheckboxItem checked={favorite} onCheckedChange={onFavorite} shortcut="mod+f">
        Favorite
      </MenuCheckboxItem>
      <MenuSub>
        <MenuSubTrigger icon={icon(I.share)}>Share</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem icon={icon(I.mail)} onClick={() => toast.info(`Emailing ${name}`)}>
            Email
          </MenuItem>
          <MenuItem icon={icon(I.link)} onClick={() => toast.success("Link copied")}>
            Copy link
          </MenuItem>
          <MenuItem icon={icon(I.download)} onClick={() => toast.info(`Downloading ${name}`)}>
            Download
          </MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSeparator />
      <MenuItem
        icon={icon(I.trash)}
        tone="danger"
        shortcut="mod+backspace"
        onClick={() => toast.error(`${name} moved to the bin`)}
      >
        Move to bin
      </MenuItem>
    </>
  );
}

export function PhotoGridDemo() {
  const [favorites, setFavorites] = useState<string[]>(["Lagoon.jpg"]);
  const setFavorite = (name: string) => (on: boolean) =>
    setFavorites((f) => (on ? [...f, name] : f.filter((n) => n !== name)));

  return (
    <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {photos.map((p) => {
        const favorite = favorites.includes(p.name);
        const actions = <PhotoActions name={p.name} favorite={favorite} onFavorite={setFavorite(p.name)} />;
        return (
          <li key={p.name} className="relative min-w-0">
            <ContextMenu>
              <ContextMenuTrigger
                tabIndex={0}
                role="group"
                aria-label={p.name}
                aria-describedby="photo-menu-hint"
                className="glass-2 block overflow-hidden rounded-sheen-lg data-popup-open:outline-2 data-popup-open:outline-offset-2 data-popup-open:outline-sheen-accent-border"
              >
                <div
                  aria-hidden
                  className="aspect-[4/3] w-full"
                  style={{
                    backgroundImage: `linear-gradient(135deg, var(--sheen-chart-${p.from}), var(--sheen-chart-${p.to}))`,
                  }}
                />
                <div className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
                  <span className="truncate">{p.name}</span>
                  {favorite && (
                    <span className="ms-auto shrink-0 text-sheen-warning">
                      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" role="img" aria-label="Favorite">
                        <path d={I.star} />
                      </svg>
                    </span>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>{actions}</ContextMenuContent>
            </ContextMenu>
            {/* The same actions behind a visible button: a context menu is never the only way in. */}
            <Menu>
              <MenuTrigger
                render={
                  <Button
                    variant="glass"
                    size="icon"
                    aria-label={`Actions for ${p.name}`}
                    className="absolute top-2 end-2 size-8 rounded-sheen-full"
                  />
                }
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d={I.dots} />
                </svg>
              </MenuTrigger>
              <MenuContent align="end">{actions}</MenuContent>
            </Menu>
          </li>
        );
      })}
      <li id="photo-menu-hint" className="sr-only">
        Right-click, long-press or press Shift+F10 for actions.
      </li>
    </ul>
  );
}

type Shape = { id: number; kind: "square" | "circle" | "star"; x: number; y: number; slot: number };

/** The viewport point an opening event happened at (mouse, pointer or touch). */
function pressPoint(event: Event | undefined): { x: number; y: number } | null {
  if (!event) return null;
  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent) {
    const touch = event.touches.item(0) ?? event.changedTouches.item(0);
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  if (event instanceof MouseEvent) return { x: event.clientX, y: event.clientY };
  return null;
}

export function CanvasDemo() {
  const [snap, setSnap] = useState(true);
  const [rulers, setRulers] = useState(false);
  const [zoom, setZoom] = useState("100");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const point = useRef({ x: 0.5, y: 0.5 });
  const nextId = useRef(0);

  const add = (kind: Shape["kind"]) => {
    const step = (v: number) => (snap ? Math.round(v * 12) / 12 : v);
    const x = Math.min(0.92, Math.max(0.08, step(point.current.x)));
    const y = Math.min(0.88, Math.max(0.12, step(point.current.y)));
    setShapes((s) => [...s.slice(-11), { id: nextId.current++, kind, x, y, slot: (nextId.current % 8) + 1 }]);
  };

  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <ContextMenu
      onOpenChange={(open, details) => {
        // Where it was opened: a right-click or Shift+F10 (a mouse event) or a long-press
        // (the touch that started it; touch screens send no contextmenu event on iOS).
        const at = pressPoint(details.event);
        const r = canvasRef.current?.getBoundingClientRect();
        if (open && at && r && r.width > 0 && r.height > 0) {
          point.current = { x: (at.x - r.left) / r.width, y: (at.y - r.top) / r.height };
        }
      }}
    >
      <ContextMenuTrigger
        ref={canvasRef}
        tabIndex={0}
        role="group"
        aria-label={`Canvas, ${shapes.length} ${shapes.length === 1 ? "shape" : "shapes"}`}
        aria-describedby="canvas-menu-hint"
        className={cn(
          "relative h-72 w-full overflow-hidden rounded-sheen-lg border-2 border-dashed border-sheen-border bg-sheen-surface/40",
          "data-popup-open:border-sheen-accent-border",
          snap &&
            "[background-image:linear-gradient(var(--sheen-chart-grid)_1px,transparent_1px),linear-gradient(90deg,var(--sheen-chart-grid)_1px,transparent_1px)] [background-size:8.333%_8.333%]",
          rulers && "pt-5 ps-5",
        )}
      >
        {rulers && (
          <div aria-hidden className="pointer-events-none absolute inset-0 text-[9px] text-sheen-fg-subtle">
            <div className="absolute inset-x-0 top-0 h-5 border-b border-sheen-border bg-sheen-surface/80 [background-image:repeating-linear-gradient(90deg,var(--sheen-border)_0_1px,transparent_1px_24px)]" />
            <div className="absolute inset-y-0 start-0 w-5 border-e border-sheen-border bg-sheen-surface/80 [background-image:repeating-linear-gradient(var(--sheen-border)_0_1px,transparent_1px_24px)]" />
          </div>
        )}
        {shapes.length === 0 && (
          <p className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 p-6 text-center text-sm text-sheen-fg-muted">
            <span className="font-medium text-sheen-fg">Right-click or long-press anywhere</span>
            <span>
              or focus the canvas and press <KbdShortcut keys="shift+f10" />
            </span>
          </p>
        )}
        {shapes.map((s) => (
          <span
            key={s.id}
            aria-hidden
            className="absolute -translate-1/2 motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, scale: Number(zoom) / 100 }}
          >
            <span className="block motion-ok:animate-[sheen-pop_var(--sheen-duration-slow)_var(--sheen-ease-out)_both]">
              {s.kind === "star" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="size-10"
                  fill={`var(--sheen-chart-${s.slot})`}
                  stroke="var(--sheen-chart-surface)"
                  strokeWidth="1.5"
                >
                  <path d={I.star} />
                </svg>
              ) : (
                <span
                  className={cn(
                    "block size-9 border-2 border-(color:--sheen-chart-surface)",
                    s.kind === "circle" ? "rounded-full" : "rounded-[6px]",
                  )}
                  style={{ backgroundColor: `var(--sheen-chart-${s.slot})` }}
                />
              )}
            </span>
          </span>
        ))}
        <span id="canvas-menu-hint" className="sr-only">
          Right-click, long-press or press Shift+F10 to add shapes and change the view.
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuSub>
          <MenuSubTrigger icon={icon(I.plus)}>Add shape</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem icon={icon(I.square)} onClick={() => add("square")}>
              Square
            </MenuItem>
            <MenuItem icon={icon(I.circle)} onClick={() => add("circle")}>
              Circle
            </MenuItem>
            <MenuItem icon={icon(I.star)} onClick={() => add("star")}>
              Star
            </MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem icon={icon(I.paste)} shortcut="mod+v" disabled>
          Paste
        </MenuItem>
        <MenuSeparator />
        <MenuCheckboxItem checked={snap} onCheckedChange={setSnap} shortcut="mod+'">
          Snap to grid
        </MenuCheckboxItem>
        <MenuCheckboxItem checked={rulers} onCheckedChange={setRulers} shortcut="shift+mod+r">
          Show rulers
        </MenuCheckboxItem>
        <MenuSeparator />
        <MenuRadioGroup value={zoom} onValueChange={(v) => setZoom(String(v))}>
          <MenuLabel>Zoom</MenuLabel>
          <MenuRadioItem value="50">50%</MenuRadioItem>
          <MenuRadioItem value="100">100%</MenuRadioItem>
          <MenuRadioItem value="150">150%</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSeparator />
        <MenuItem icon={icon(I.trash)} tone="danger" disabled={shapes.length === 0} onClick={() => setShapes([])}>
          Clear canvas
        </MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
