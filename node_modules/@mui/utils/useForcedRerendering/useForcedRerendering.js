"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useForcedRerendering;
var React = _interopRequireWildcard(require("react"));
/**
 * Copied from @base-ui/utils
 *
 * Returns a function that forces a rerender.
 */
function useForcedRerendering() {
  const [, setState] = React.useState({});
  return React.useCallback(() => {
    setState({});
  }, []);
}