import {dedupeMixin} from '@open-wc/dedupe-mixin';
export const internals = Symbol('internals');

type InternalsBehavior = unknown;
export type BehaviorCreator = () => InternalsBehavior | null | undefined;

const InternalsBase = <T extends CustomElementConstructor>(Base: T) =>
  class InternalsBaseMixin extends Base {
    static internalsBehaviors?: readonly BehaviorCreator[];

    [internals]!: ElementInternals;

    createBehaviors(): readonly InternalsBehavior[] | undefined {
      const factories = (this.constructor as typeof InternalsBaseMixin).internalsBehaviors;
      if (!factories?.length) {
        return undefined;
      }

      const behaviors = factories
        .map((factory) => factory())
        .filter((behavior): behavior is InternalsBehavior => behavior != null);

      return behaviors.length ? behaviors : undefined;
    }

    attachInternalsWithBehaviors(): ElementInternals {
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
