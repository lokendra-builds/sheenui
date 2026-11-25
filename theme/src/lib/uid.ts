let counter = 0;

/**
 * A unique id for things created on the client (attachments, optimistic messages, chat turns):
 * `<prefix>-<time in base 36>-<count in base 36>`. Unique within a page load and sortable by creation.
 */
export function uid(prefix = "id") {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
