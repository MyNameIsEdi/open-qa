"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FOCUSABLE_ATTRIBUTE = void 0;
exports.getFocusTarget = getFocusTarget;
const FOCUSABLE_ATTRIBUTE = exports.FOCUSABLE_ATTRIBUTE = 'data-mui-focusable';

/**
 * Returns the element marked as the initial focus target inside a focus trap.
 * The root element takes precedence over marked descendants so components can
 * opt into focusing their own root surface directly.
 */
function getFocusTarget(rootElement) {
  if (!rootElement) {
    return null;
  }
  return rootElement.hasAttribute(FOCUSABLE_ATTRIBUTE) ? rootElement : rootElement.querySelector(`[${FOCUSABLE_ATTRIBUTE}]`);
}