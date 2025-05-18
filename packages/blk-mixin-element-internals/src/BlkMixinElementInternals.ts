import {dedupeMixin} from '@open-wc/dedupe-mixin';
export const internals = Symbol('internals');

const ElementInternalsBase = <T extends CustomElementConstructor>(Base: T) =>
  class ElementInternalsMixin extends Base {
    #internals: ElementInternals;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.#internals ??= super.attachInternals();
    }

    get [internals](): ElementInternals {
      return this.#internals;
    }
  };

export const BlkMixinElementInternals = dedupeMixin(ElementInternalsBase);
