import {dedupeMixin} from '@open-wc/dedupe-mixin';
import {BlkMixinInternalsBase, internals} from './BlkMixinInternalsBase.js';

const ElementInternalsBase = <T extends CustomElementConstructor>(Base: T) =>
  class ElementInternalsMixin extends BlkMixinInternalsBase(Base) {
    /**
     * Exposes the ElementInternals instance attached to this element.
     */
    get internals(): ElementInternals {
      return this[internals];
    }
  };

export const BlkMixinElementInternals = dedupeMixin(ElementInternalsBase);
