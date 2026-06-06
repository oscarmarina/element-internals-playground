import {dedupeMixin} from '@open-wc/dedupe-mixin';
import {BlkMixinInternalsBase, internals} from './BlkMixinInternalsBase.js';

export interface ElementInternalsHost {
  get internals(): ElementInternals;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ElementInternalsHostConstructor = new (...args: any[]) => ElementInternalsHost;

const ElementInternalsBase = <T extends CustomElementConstructor>(
  Base: T
): T & ElementInternalsHostConstructor =>
  class ElementInternalsMixin extends BlkMixinInternalsBase(Base) implements ElementInternalsHost {
    /**
     * Exposes the ElementInternals instance attached to this element.
     */
    get internals(): ElementInternals {
      return this[internals];
    }
  };

export const BlkMixinElementInternals = dedupeMixin(ElementInternalsBase);
