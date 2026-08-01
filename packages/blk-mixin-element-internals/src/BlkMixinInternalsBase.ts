import {dedupeMixin} from '@open-wc/dedupe-mixin';

/**
 * Internal storage key used by the internals mixins.
 *
 * Consumers should use `element.internals` exposed by
 * `BlkMixinElementInternals` or `BlkMixinFormAssociated` instead of accessing this symbol directly.
 */
export const internals = Symbol('internals');

export type BehaviorCreator<T = unknown> = () => T | null | undefined;

export interface InternalsBaseHost {
  [internals]: ElementInternals;
  createBehaviors(): readonly unknown[] | undefined;
}

export interface InternalsBaseConstructor {
  internalsBehaviors?: readonly BehaviorCreator[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): InternalsBaseHost;
}

const InternalsBase = <T extends CustomElementConstructor>(Base: T): T & InternalsBaseConstructor =>
  class InternalsBaseMixin extends Base implements InternalsBaseHost {
    static internalsBehaviors?: readonly BehaviorCreator[];

    [internals]!: ElementInternals;

    createBehaviors(): readonly unknown[] | undefined {
      const creators = (this.constructor as typeof InternalsBaseMixin).internalsBehaviors;
      if (!creators?.length) {
        return undefined;
      }

      const behaviors = creators
        .map((creator) => creator())
        .filter((b): b is NonNullable<unknown> => b != null);

      return behaviors.length ? behaviors : undefined;
    }

    protected attachInternalsWithBehaviors(): ElementInternals {
      const behaviors = this.createBehaviors();
      // @ts-expect-error Experimental attachInternals options are not typed in lib.dom yet.
      return super.attachInternals(behaviors && {behaviors});
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this[internals] ??= this.attachInternalsWithBehaviors();
    }
  };

export const BlkMixinInternalsBase = dedupeMixin(InternalsBase);
