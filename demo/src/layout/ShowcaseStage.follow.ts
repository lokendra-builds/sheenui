import { useState } from "react";

/**
 * State that follows a prop (the story's scene) and can still be changed by the person: when the prop changes, the
 * state takes its new value; in between, the person's changes stand. (Adjusting state while rendering, not in an effect.)
 */
export function useFollow<T>(value: T) {
  const [local, setLocal] = useState(value);
  const [seen, setSeen] = useState(value);
  if (!Object.is(seen, value)) {
    setSeen(value);
    setLocal(value);
  }
  return [local, setLocal] as const;
}
