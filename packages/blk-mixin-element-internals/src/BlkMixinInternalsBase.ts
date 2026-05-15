import {dedupeMixin} from '@open-wc/dedupe-mixin';
export const internals = Symbol('internals');

export type BehaviorCreator = () => unknown | null | undefined;

const InternalsBase = <T extends CustomElementConstructor>(Base: T) =>
  class InternalsBaseMixin extends Base {
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
