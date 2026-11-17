/**
 * True while an input method editor (Japanese, Chinese, Korean and other IMEs) is composing text, so
 * Enter must confirm the composition instead of committing a value. `isComposing` alone misses the
 * key that ends the composition in Safari, which fires `compositionend` first; the legacy
 * `keyCode === 229` still reports it. Pass a native `KeyboardEvent` (`event.nativeEvent` in React).
 * Pure: it only reads the event it is given, so it is safe to import on the server.
 */
export function isImeComposing(event: { isComposing: boolean; keyCode: number }): boolean {
  return event.isComposing || event.keyCode === 229;
}
