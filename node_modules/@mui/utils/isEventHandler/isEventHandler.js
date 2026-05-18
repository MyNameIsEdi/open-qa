"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isEventHandler;
// Brought from [Base UI](https://github.com/mui/base-ui/blob/master/packages/react/src/merge-props/mergeProps.ts#L119)
// Use it directly from Base UI once it's a package dependency.
function isEventHandler(key, value) {
  // This approach is more efficient than using a regex.
  const thirdCharCode = key.charCodeAt(2);
  return key[0] === 'o' && key[1] === 'n' && thirdCharCode >= 65 /* A */ && thirdCharCode <= 90 /* Z */ && typeof value === 'function';
}