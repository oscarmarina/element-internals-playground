import {dedupeMixin} from '@open-wc/dedupe-mixin';

/**
 * Internal storage key used by the internals mixins.
 *
 * Consumers should use `element.internals` exposed by
 * `BlkMixinElementInternals` or `BlkMixinFormAssociated` instead of accessing this symbol directly.
 */
export const internals = Symbol('internals');

/**
 * Storage key for the behavior objects passed to `attachInternals({behaviors})`.
 *
 * Read behavior references from `this[behaviors]`; don't stash them from an
 * overridden `createBehaviors()`. That method runs inside the base constructor, and
 * subclass class fields are initialized only *after* `super()` returns:
 *
 * ```js
 * class Broken extends BlkMixinInternalsBase(HTMLElement) {
 *   _submitBehavior; // (2) field init runs after super(): resets it to undefined
 *
 *   createBehaviors() {
 *     this._submitBehavior = new HTMLSubmitButtonBehavior(); // (1) set during super()
 *     return [this._submitBehavior];
 *   }
 * }
 *
 * class Works extends BlkMixinInternalsBase(HTMLElement) {
 *   static internalsBehaviors = [() => new HTMLSubmitButtonBehavior()];
 *
 *   get _submitBehavior() {
 *     // `this[behaviors]` is owned by the mixin, never touched by subclass fields.
 *     return this.getBehavior(HTMLSubmitButtonBehavior);
 *   }
 * }
 * ```
 *
 * (A TypeScript `declare _submitBehavior: X;` emits no field, so it doesn't trigger
 * this — but a plain JS field or TS field without `declare` does.)
 */
export const behaviors = Symbol('behaviors');

export type BehaviorCreator<T = unknown> = () => T | null | undefined;

export interface InternalsBaseHost {
  [internals]: ElementInternals;
  readonly [behaviors]: readonly unknown[];
  createBehaviors(): readonly unknown[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBehavior<B>(ctor: new (...args: any[]) => B): B | undefined;
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
    [behaviors]: readonly unknown[] = [];

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

    /**
     * Returns the attached behavior created by `ctor`, typed as its instance, or
     * `undefined` if none was created (e.g. the browser lacks that behavior).
     * Looks it up by type, so it does not depend on the order of `internalsBehaviors`.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getBehavior<B>(ctor: new (...args: any[]) => B): B | undefined {
      return this[behaviors].find((b): b is B => b instanceof ctor);
    }

    protected attachInternalsWithBehaviors(): ElementInternals {
      const created = this.createBehaviors();
      this[behaviors] = created ?? [];
      // @ts-expect-error Experimental attachInternals options are not typed in lib.dom yet.
      return super.attachInternals(created && {behaviors: created});
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this[internals] ??= this.attachInternalsWithBehaviors();
    }
  };

export const BlkMixinInternalsBase = dedupeMixin(InternalsBase);
