// Props whose default is applied by a hook, a child component or a rule that depends on other props, so no single phrase in
// the prose or literal in the destructuring can carry it. The reason is what the Default cell shows (gen-props) and what
// docs:check requires; a prop whose prose states a short default needs no entry here (the cell reads it from the prose).
export const DEFAULT_APPLIED_ELSEWHERE = new Map([
  ["Button.nativeButton", "true; false when `render` is a non-button element"],
  ["AlertDialogAction.nativeButton", "true; false when `render` is a non-button element"],
  ["AlertDialogCancel.nativeButton", "true; false when `render` is a non-button element"],
  ["DivergingBarChart.normalize", "true for Likert, false for butterfly (follows `mode`)"],
  ["WorldMap.emptyState", "`labels.noData`, applied from the labels object"],
  ["LineChart.live", "off; an object's `duration` defaults to 0.6 inside the slide hook"],
  ["AreaChart.live", "off; an object's `duration` defaults to 0.6 inside the slide hook"],
]);
