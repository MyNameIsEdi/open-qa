/**
 * Copied from @base-ui/utils
 *
 * Shadow DOM-aware containment check.
 *
 * Native `parent.contains(child)` returns `false` when the child is inside a
 * shadow root that is a descendant of the parent. This function handles that
 * case by traversing up through shadow root hosts.
 *
 * @param parent - The potential ancestor element.
 * @param child - The potential descendant element.
 * @returns Whether `parent` contains `child`, even across shadow root boundaries.
 */
export default function contains(parent: Element | null | undefined, child: Element | null | undefined): boolean;