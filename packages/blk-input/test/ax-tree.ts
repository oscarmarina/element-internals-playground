import {cdp, server} from 'vitest/browser';

/**
 * Reads Chromium's real accessibility tree through the DevTools protocol (CDP).
 *
 * axe and Playwright's `getByRole` compute accessible names in JavaScript and ignore
 * `referenceTarget` and `ariaLabelledByElements`; only the browser's own tree shows what
 * assistive technology receives. CDP exists only in Chromium, so guard suites with
 * `suite.skipIf(!hasAXTree)`.
 */
export const hasAXTree = server.browser === 'chromium';

export interface AXNode {
  ignored: boolean;
  role: string;
  name: string;
  description: string;
  /** Flattened `properties`: `invalid`, `required`, `disabled`, `checked`, `focusable`… */
  props: Record<string, unknown>;
}

interface DOMNode {
  backendNodeId: number;
  attributes?: string[];
  children?: DOMNode[];
  shadowRoots?: DOMNode[];
  contentDocument?: DOMNode;
}

interface RawAXNode {
  ignored: boolean;
  role?: {value: string};
  name?: {value: string};
  description?: {value: string};
  properties?: {name: string; value: {value: unknown}}[];
}

const marker = 'data-ax-tree-target';
let counter = 0;

const findMarked = (node: DOMNode, id: string): DOMNode | undefined => {
  const attrs = node.attributes ?? [];
  const at = attrs.indexOf(marker);
  if (at !== -1 && at % 2 === 0 && attrs[at + 1] === id) {
    return node;
  }
  const next = [...(node.children ?? []), ...(node.shadowRoots ?? [])];
  if (node.contentDocument) {
    next.push(node.contentDocument);
  }
  for (const child of next) {
    const found = findMarked(child, id);
    if (found) {
      return found;
    }
  }
  return undefined;
};

/**
 * The accessibility node Chromium built for `element` (works inside shadow roots and
 * inside the iframe the tests run in).
 */
export const axNode = async (element: Element): Promise<AXNode> => {
  // The protocol addresses nodes by backend id: tag the element, then look it up in a
  // DOM snapshot that pierces iframes and shadow roots.
  const id = String(++counter);
  element.setAttribute(marker, id);
  try {
    const session = cdp() as unknown as {
      send(method: string, params?: Record<string, unknown>): Promise<unknown>;
    };
    const {root} = (await session.send('DOM.getDocument', {depth: -1, pierce: true})) as {
      root: DOMNode;
    };
    const target = findMarked(root, id);
    if (!target) {
      throw new Error('axNode: element not found in the page DOM snapshot');
    }
    const {nodes} = (await session.send('Accessibility.getPartialAXTree', {
      backendNodeId: target.backendNodeId,
      fetchRelatives: false,
    })) as {nodes: RawAXNode[]};
    const [raw] = nodes;
    return {
      ignored: raw.ignored,
      role: raw.role?.value ?? '',
      name: raw.name?.value ?? '',
      description: raw.description?.value ?? '',
      props: Object.fromEntries((raw.properties ?? []).map((p) => [p.name, p.value.value])),
    };
  } finally {
    element.removeAttribute(marker);
  }
};
