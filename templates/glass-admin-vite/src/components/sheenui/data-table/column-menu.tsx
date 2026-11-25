"use client";

import { Fragment, useRef, type RefObject } from "react";

import { Menu } from "@base-ui/react/menu";

import { Button } from "../button/button";
import { DotsIcon, SlidersIcon } from "./icons";
import {
  DataMenu,
  DataMenuCheckboxItem,
  DataMenuContent,
  DataMenuGroup,
  DataMenuItem,
  DataMenuLabel,
  DataMenuRadioGroup,
  DataMenuRadioItem,
  DataMenuSeparator,
  DataMenuTrigger,
} from "./menu";
import { iconButton } from "./shared";
import type { DataTableColumn, DataTableDensity, DataTableLabels, DataTableRowAction } from "./types";

/** The toolbar's View menu: row density and which columns are shown (never the last one). */
export function ViewMenu<TData>({
  labels,
  density,
  onDensityChange,
  columns,
  isVisible,
  visibleCount,
  onToggle,
}: {
  labels: DataTableLabels;
  density: DataTableDensity;
  onDensityChange: (d: DataTableDensity) => void;
  columns: DataTableColumn<TData>[];
  isVisible: (id: string) => boolean;
  visibleCount: number;
  onToggle: (id: string, on: boolean) => void;
}) {
  const hideable = columns.filter((c) => c.enableHiding !== false);
  return (
    <DataMenu>
      <DataMenuTrigger render={<Button variant="glass" className="h-11" leading={<SlidersIcon />} />}>
        <span className="max-sm:sr-only">{labels.view}</span>
      </DataMenuTrigger>
      <DataMenuContent align="end" className="w-56">
        <DataMenuGroup>
          <DataMenuLabel>{labels.density}</DataMenuLabel>
          <DataMenuRadioGroup value={density} onValueChange={(v) => onDensityChange(v as DataTableDensity)}>
            <DataMenuRadioItem value="comfortable" closeOnClick={false}>
              {labels.comfortable}
            </DataMenuRadioItem>
            <DataMenuRadioItem value="compact" closeOnClick={false}>
              {labels.compact}
            </DataMenuRadioItem>
          </DataMenuRadioGroup>
        </DataMenuGroup>
        {hideable.length > 0 && (
          <>
            <DataMenuSeparator />
            <DataMenuGroup>
              <DataMenuLabel>{labels.columns}</DataMenuLabel>
              {hideable.map((col) => {
                const on = isVisible(col.id);
                return (
                  <DataMenuCheckboxItem
                    key={col.id}
                    checked={on}
                    // Never hide the last visible column.
                    disabled={on && visibleCount <= 1}
                    onCheckedChange={(next) => onToggle(col.id, next)}
                  >
                    {col.header}
                  </DataMenuCheckboxItem>
                );
              })}
            </DataMenuGroup>
          </>
        )}
      </DataMenuContent>
    </DataMenu>
  );
}

/** What a row's trigger hands to the table's one shared row-actions menu when it opens. */
type RowMenuPayload<TData> = {
  row: TData;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onFocusLost: () => void;
};

/** Links the row triggers to the one {@link RowActionsHost}. Create it once per table. */
export type RowMenuHandle<TData> = ReturnType<typeof createRowMenuHandle<TData>>;

/** Creates the handle that ties row triggers to the shared menu (safe on the server: it only builds an object). */
export function createRowMenuHandle<TData>() {
  return Menu.createHandle<RowMenuPayload<TData>>();
}

/**
 * The one menu behind every row's "..." button. A Base UI menu per row is costly to mount (a page of 100 rows
 * was 100 menus), so the rows render only a trigger and this host renders the open row's actions.
 */
export function RowActionsHost<TData>({
  handle,
  actionsFor,
}: {
  handle: RowMenuHandle<TData>;
  actionsFor: (row: TData) => DataTableRowAction<TData>[];
}) {
  return (
    <DataMenu handle={handle}>
      {({ payload }) =>
        payload ? (
          <DataMenuContent align="end">
            {actionsFor(payload.row).map((action, i) => (
              <Fragment key={`${action.label}-${i}`}>
                {action.separatorBefore && <DataMenuSeparator />}
                <DataMenuItem
                  tone={action.tone}
                  icon={action.icon}
                  disabled={action.disabled}
                  onClick={() => {
                    action.onSelect(payload.row);
                    // The row may be gone (deleted): don't drop focus on <body>.
                    window.requestAnimationFrame(() => {
                      if (!payload.triggerRef.current?.isConnected) payload.onFocusLost();
                    });
                  }}
                >
                  {action.label}
                </DataMenuItem>
              </Fragment>
            ))}
          </DataMenuContent>
        ) : null
      }
    </DataMenu>
  );
}

/** The "..." button at the end of a row; it opens the table's shared menu with this row's actions. */
export function RowActionsMenu<TData>({
  handle,
  label,
  hasActions,
  row,
  onFocusLost,
}: {
  handle: RowMenuHandle<TData>;
  label: string;
  /** False when this row has no actions: nothing is rendered. */
  hasActions: boolean;
  row: TData;
  /** Called when the row (and so this trigger) is gone after an action, e.g. Delete. */
  onFocusLost: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  if (!hasActions) return null;
  return (
    <DataMenuTrigger
      ref={triggerRef}
      handle={handle}
      payload={{ row, triggerRef, onFocusLost }}
      data-dt-row-actions=""
      aria-label={label}
      className={iconButton}
    >
      <DotsIcon />
    </DataMenuTrigger>
  );
}
