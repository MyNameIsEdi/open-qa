"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getEventTarget;
/**
 * Copied from @base-ui/utils
 *
 * Gets the actual target of an event, using `composedPath()` to traverse
 * shadow DOM boundaries.
 *
 * In shadow DOM, `event.target` may return the shadow host rather than the
 * actual element that triggered the event. `composedPath()[0]` returns the
 * true originating element.
 *
 * @param event - The event to get the target from.
 * @returns The actual event target, or `null` if not available.
 */
function getEventTarget(event) {
  return event.composedPath?.()[0] ?? event.target;
}