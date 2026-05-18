'use client';

import * as React from 'react';
import FormControlContext from "./FormControlContext.mjs";
export default function useFormControl() {
  return React.useContext(FormControlContext);
}
export function useFormControlState({
  props,
  states
}) {
  const muiFormControl = React.useContext(FormControlContext);
  const result = {};
  states.forEach(state => {
    const value = props[state];
    result[state] = value === undefined && muiFormControl ? muiFormControl[state] : value;
  });
  return [result, muiFormControl];
}