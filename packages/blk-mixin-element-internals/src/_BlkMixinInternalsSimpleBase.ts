import {dedupeMixin} from '@open-wc/dedupe-mixin';

/**
 * Internal storage key used by the internals mixins.
 *
 * Consumers should use `element.internals` exposed by
 * `BlkMixinElementInternals` or `BlkMixinFormAssociated` instead of accessing this symbol directly.
 */
export const internals = Symbol('internals');

export interface InternalsBaseHost {
  [internals]: ElementInternals;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InternalsBaseConstructor = new (...args: any[]) => InternalsBaseHost;

const InternalsSimpleBase = <T extends CustomElementConstructor>(
  Base: T
): T & InternalsBaseConstructor =>
  class InternalsSimpleBaseMixin extends Base implements InternalsBaseHost {
    [internals]!: ElementInternals;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this[internals] ??= super.attachInternals();
    }
  };

export const BlkMixinInternalsSimpleBase = dedupeMixin(InternalsSimpleBase);
