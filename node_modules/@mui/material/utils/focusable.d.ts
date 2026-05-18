export declare const FOCUSABLE_ATTRIBUTE = "data-mui-focusable";
/**
 * Returns the element marked as the initial focus target inside a focus trap.
 * The root element takes precedence over marked descendants so components can
 * opt into focusing their own root surface directly.
 */
export declare function getFocusTarget(rootElement: HTMLElement | null | undefined): HTMLElement | null;