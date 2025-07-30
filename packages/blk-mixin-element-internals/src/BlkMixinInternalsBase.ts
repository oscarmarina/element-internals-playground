import {dedupeMixin} from '@open-wc/dedupe-mixin';
export const internals = Symbol('internals');

const InternalsBase = <T extends CustomElementConstructor>(Base: T) =>
  class InternalsBaseMixin extends Base {
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

export const BlkMixinInternalsBase = dedupeMixin(InternalsBase);
