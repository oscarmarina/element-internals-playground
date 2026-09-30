import {suite, test, assert} from 'vitest';
import {fixture} from '@open-wc/testing-helpers';
import {html} from 'lit';
import {
  BlkMixinInternalsBase,
  behaviors,
  internals,
  BlkMixinElementInternals,
  BlkMixinFormAssociated,
  BlkFormValidationEvent,
} from '../src/index.js';

function defineTestElement(cls: CustomElementConstructor, baseName: string) {
  if (!customElements.get(baseName)) {
    customElements.define(baseName, cls);
  }
  return baseName;
}

suite('BlkMixinInternalsBase (real)', () => {
  test('attaches ElementInternals and exposes via symbol', async () => {
    class InternalsBaseEl extends BlkMixinInternalsBase(HTMLElement) {}
    defineTestElement(InternalsBaseEl, 'internals-base');
    const el = await fixture<InternalsBaseEl>(html`<internals-base></internals-base>`);
    const elemInternals = el[internals];
    assert.ok(elemInternals);
    assert.typeOf(elemInternals.setFormValue, 'function');
    assert.notStrictEqual(elemInternals, undefined);
  });

  test('supports behavior factories and ignores nullish values automatically', async () => {
    class InternalsWithBehaviorEl extends BlkMixinInternalsBase(HTMLElement) {
      static override internalsBehaviors = [() => ({kind: 'submit-behavior'}), () => undefined];
    }

    defineTestElement(InternalsWithBehaviorEl, 'internals-base-behavior');
    const el = await fixture<InternalsWithBehaviorEl>(
      html`<internals-base-behavior></internals-base-behavior>`
    );

    assert.ok(el[internals]);
  });

  test('createBehaviors() override retains behavior references on the instance', async () => {
    class InternalsOverrideEl extends BlkMixinInternalsBase(HTMLElement) {
      declare _behavior: unknown;

      override createBehaviors() {
        this._behavior = {kind: 'submit-behavior'};
        return [this._behavior];
      }
    }

    defineTestElement(InternalsOverrideEl, 'internals-base-override');
    const el = await fixture<InternalsOverrideEl>(
      html`<internals-base-override></internals-base-override>`
    );

    assert.ok(el[internals]);
    assert.ok(el._behavior);
    assert.equal((el._behavior as {kind: string}).kind, 'submit-behavior');
  });

  test('[behaviors] exposes created behaviors and survives subclass class fields', async () => {
    const created = {kind: 'submit-behavior'};
    class InternalsFieldEl extends BlkMixinInternalsBase(HTMLElement) {
      static override internalsBehaviors = [() => created];
      // A class field initializes *after* the base constructor ran createBehaviors().
      _submitBehavior: unknown = undefined;
      get submitBehavior() {
        return this[behaviors][0];
      }
    }

    defineTestElement(InternalsFieldEl, 'internals-base-field');
    const el = await fixture<InternalsFieldEl>(html`<internals-base-field></internals-base-field>`);

    assert.strictEqual(el.submitBehavior, created);
    assert.deepEqual(el[behaviors], [created]);
  });

  test('[behaviors] is an empty array when no behaviors are created', async () => {
    class InternalsNoBehaviorEl extends BlkMixinInternalsBase(HTMLElement) {}
    defineTestElement(InternalsNoBehaviorEl, 'internals-base-no-behavior');
    const el = await fixture<InternalsNoBehaviorEl>(
      html`<internals-base-no-behavior></internals-base-no-behavior>`
    );
    assert.deepEqual(el[behaviors], []);
  });

  test('getBehavior() finds a behavior by constructor, regardless of order', async () => {
    class FakeSubmitBehavior {
      name = '';
    }
    class FakeOtherBehavior {
      kind = 'other';
    }
    class InternalsLookupEl extends BlkMixinInternalsBase(HTMLElement) {
      static override internalsBehaviors = [
        () => new FakeOtherBehavior(),
        () => new FakeSubmitBehavior(),
      ];
    }

    defineTestElement(InternalsLookupEl, 'internals-base-lookup');
    const el = await fixture<InternalsLookupEl>(
      html`<internals-base-lookup></internals-base-lookup>`
    );

    const submit = el.getBehavior(FakeSubmitBehavior);
    assert.instanceOf(submit, FakeSubmitBehavior);
    assert.strictEqual(submit, el[behaviors][1]);
    // Typed as the instance: no cast needed to use its members.
    submit!.name = 'action';
    assert.equal((el[behaviors][1] as FakeSubmitBehavior).name, 'action');
  });

  test('getBehavior() returns undefined when that behavior was not created', async () => {
    class MissingBehavior {
      kind = 'missing';
    }
    class InternalsNoLookupEl extends BlkMixinInternalsBase(HTMLElement) {}
    defineTestElement(InternalsNoLookupEl, 'internals-base-no-lookup');
    const el = await fixture<InternalsNoLookupEl>(
      html`<internals-base-no-lookup></internals-base-no-lookup>`
    );
    assert.isUndefined(el.getBehavior(MissingBehavior));
  });

  test('ElementInternals is unique per element instance', async () => {
    class InternalsBaseEl extends BlkMixinInternalsBase(HTMLElement) {}
    defineTestElement(InternalsBaseEl, 'internals-base-unique');
    const el1 = await fixture<InternalsBaseEl>(
      html`<internals-base-unique></internals-base-unique>`
    );
    const el2 = await fixture<InternalsBaseEl>(
      html`<internals-base-unique></internals-base-unique>`
    );
    assert.notStrictEqual(el1[internals], el2[internals]);
  });
});

suite('BlkMixinElementInternals (real ElementInternals)', () => {
  test('exposes .internals getter for ElementInternals with CustomStateSet API', async () => {
    class ElementInternalsEl extends BlkMixinElementInternals(HTMLElement) {}
    defineTestElement(ElementInternalsEl, 'element-internals');
    const el = await fixture<ElementInternalsEl>(html`<element-internals></element-internals>`);
    assert.ok(el.internals);
    el.internals.states.add('--custom-state');
    assert.isTrue(el.internals.states.has('--custom-state'));
    el.internals.states.delete('--custom-state');
    assert.isFalse(el.internals.states.has('--custom-state'));
  });

  test('.internals getter always returns the same instance', async () => {
    class ElementInternalsEl extends BlkMixinElementInternals(HTMLElement) {}
    defineTestElement(ElementInternalsEl, 'element-internals-same');
    const el = await fixture<ElementInternalsEl>(
      html`<element-internals-same></element-internals-same>`
    );
    const first = el.internals;
    const second = el.internals;
    assert.strictEqual(first, second);
  });
});

suite('BlkMixinFormAssociated (real form association and validation)', () => {
  test('form association and validity properties', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    const tag = defineTestElement(FormAssociatedEl, 'form-associated');
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <form-associated id="fa"></form-associated><button type="submit">Submit</button>
      </form>`
    );
    const el = form.querySelector(tag)! as InstanceType<typeof FormAssociatedEl>;
    assert.ok(el.form);
    assert.property(el, 'validity');
    assert.property(el, 'validationMessage');
    assert.property(el, 'willValidate');
    assert.ok(el.labels);
    assert.ok(el.states);
    assert.ok('role' in el);
    el.setValidity({...el.validity, customError: true}, 'Error!');
    assert.isFalse(el.checkValidity());
    assert.isFalse(el.reportValidity());
    assert.equal(el.validationMessage, 'Error!');
    el.setFormValue('my-value', 'my-state');
  });

  test('labelText returns label content, empty, or ariaLabel', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    const tag = defineTestElement(FormAssociatedEl, 'form-associated-label');
    const root1 = await fixture(
      html`<form id="f1">
        <label for="lbl-el1"></label>
        <form-associated-label id="lbl-el1"></form-associated-label>
      </form>`
    );
    const el1 = root1.querySelector(tag)! as InstanceType<typeof FormAssociatedEl>;
    assert.equal(el1.labelText, '');

    const root2 = await fixture(
      html`<form id="f2">
        <label for="lbl-el2"> Fancy label </label>
        <label for="lbl-el2"> </label>
        <label for="lbl-el2"> Second part </label>
        <form-associated-label id="lbl-el2"></form-associated-label>
      </form>`
    );
    const el2 = root2.querySelector(tag)! as InstanceType<typeof FormAssociatedEl>;
    assert.equal(el2.labelText, 'Fancy label Second part');

    const root3 = await fixture(
      html`<form id="f3">
        <label for="lbl-el3">Ignored label</label>
        <form-associated-label id="lbl-el3"></form-associated-label>
      </form>`
    );
    const el3 = root3.querySelector(tag)! as InstanceType<typeof FormAssociatedEl>;
    el3.internals.ariaLabel = 'Custom Aria Label';
    assert.equal(el3.labelText, 'Custom Aria Label');
  });

  test('role keeps native ARIA reflection, independent of internals.role', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    defineTestElement(FormAssociatedEl, 'form-associated-role');
    const el = await fixture<FormAssociatedEl>(html`<form-associated-role></form-associated-role>`);
    // The component's default semantics live on internals and do not leak into `role`.
    el.internals.role = 'textbox';
    assert.isNull(el.role);
    // Author-set role is writable and reflects to the attribute, like any element.
    el.role = 'button';
    assert.equal(el.getAttribute('role'), 'button');
    assert.equal(el.internals.role, 'textbox');
  });

  test('shadowRoot getter reflects the shadowRoot of the element', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {
      constructor() {
        super();
        this.attachShadow({mode: 'open'});
      }
    }
    defineTestElement(FormAssociatedEl, 'form-associated-shadowroot-getter');
    const el = await fixture<FormAssociatedEl>(
      html`<form-associated-shadowroot-getter></form-associated-shadowroot-getter>`
    );
    assert.strictEqual(el.shadowRoot, el.internals.shadowRoot);
    assert.ok(el.shadowRoot);
  });

  test('isDisabled and isReadOnly reflect :disabled and :read-only', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    defineTestElement(FormAssociatedEl, 'form-associated-state');
    const el = await fixture<FormAssociatedEl>(
      html`<form-associated disabled readonly></form-associated>`
    );
    assert.isTrue(el.isDisabled);
    assert.isTrue(el.isReadOnly);
  });

  test('isFieldsetDisabled ignores the own attribute and the first legend', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    const tag = defineTestElement(FormAssociatedEl, 'form-associated-fieldset');
    const fieldset = await fixture<HTMLFieldSetElement>(
      html`<fieldset>
        <legend><form-associated-fieldset id="in-legend"></form-associated-fieldset></legend>
        <form-associated-fieldset id="inner" disabled></form-associated-fieldset>
      </fieldset>`
    );
    const inner = fieldset.querySelector('#inner') as InstanceType<typeof FormAssociatedEl>;
    const inLegend = fieldset.querySelector('#in-legend') as InstanceType<typeof FormAssociatedEl>;
    assert.equal(inner.localName, tag);

    assert.isFalse(inner.isFieldsetDisabled);
    fieldset.disabled = true;
    assert.isTrue(inner.isFieldsetDisabled);
    assert.isFalse(inLegend.isFieldsetDisabled);
    inner.removeAttribute('disabled');
    assert.isTrue(inner.isFieldsetDisabled);
  });

  test('isFieldsetDisabled: the legend exception only applies to its own fieldset', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    defineTestElement(FormAssociatedEl, 'form-associated-nested-fieldset');
    const outer = await fixture<HTMLFieldSetElement>(
      html`<fieldset disabled>
        <fieldset>
          <legend>
            <form-associated-nested-fieldset></form-associated-nested-fieldset>
            <input />
          </legend>
        </fieldset>
      </fieldset>`
    );
    const el = outer.querySelector('form-associated-nested-fieldset') as InstanceType<
      typeof FormAssociatedEl
    >;
    // Platform reference: a native control in the same spot is disabled by the outer fieldset.
    assert.isTrue(outer.querySelector('input')!.matches(':disabled'));
    assert.isTrue(el.isFieldsetDisabled);
  });

  test('labelText skips label text when the shadow root has a referenceTarget', async () => {
    class FormAssociatedRtEl extends BlkMixinFormAssociated(HTMLElement) {
      constructor() {
        super();
        this.attachShadow({mode: 'open', referenceTarget: 'inner'} as ShadowRootInit);
        // No inner target yet: labels still resolve to the host (the first-render case).
      }
    }
    defineTestElement(FormAssociatedRtEl, 'form-associated-rt-label');
    const root = await fixture<HTMLDivElement>(
      html`<div>
        <label for="rt-label-el">Visible</label>
        <form-associated-rt-label id="rt-label-el"></form-associated-rt-label>
      </div>`
    );
    const el = root.querySelector('form-associated-rt-label') as FormAssociatedRtEl;

    const supported = 'referenceTarget' in ShadowRoot.prototype;
    assert.equal(el.hasReferenceTarget, supported);
    // Labels are forwarded natively to the reference target, so they must not be copied.
    assert.equal(el.labelText, supported ? '' : 'Visible');

    el.setAttribute('aria-label', 'Explicit');
    assert.equal(el.labelText, 'Explicit');
  });

  test('requestSubmit and reset call form methods', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    const tag = defineTestElement(FormAssociatedEl, 'form-associated-submit');
    const form = await fixture<HTMLFormElement>(
      html`<form id="f">
        <form-associated-submit></form-associated-submit><button type="submit">Submit</button>
      </form>`
    );
    const el = form.querySelector(tag)! as InstanceType<typeof FormAssociatedEl>;
    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });
    el.requestSubmit();
    assert.isTrue(submitted);
    let resetCalled = false;
    form.addEventListener('reset', () => (resetCalled = true));
    el.reset();
    assert.isTrue(resetCalled);
  });
});

suite('BlkFormValidationEvent', () => {
  test('should create the event with correct type and properties', () => {
    const validity: ValidityState = {
      valueMissing: false,
      typeMismatch: false,
      patternMismatch: false,
      tooLong: false,
      tooShort: false,
      rangeUnderflow: false,
      rangeOverflow: false,
      stepMismatch: false,
      badInput: false,
      customError: true,
      valid: false,
    };

    const event = new BlkFormValidationEvent(validity);

    assert.instanceOf(event, BlkFormValidationEvent);
    assert.equal(event.type, 'validation');
    assert.isTrue(event.bubbles);
    assert.strictEqual(event.valid, validity.valid);
    assert.deepEqual(event.validityResult, validity);
    assert.isFalse(event.cancelable ?? false);
  });

  test('should work with valid=true', () => {
    const validity: ValidityState = {
      valueMissing: false,
      typeMismatch: false,
      patternMismatch: false,
      tooLong: false,
      tooShort: false,
      rangeUnderflow: false,
      rangeOverflow: false,
      stepMismatch: false,
      badInput: false,
      customError: false,
      valid: true,
    };
    const event = new BlkFormValidationEvent(validity);
    assert.isTrue(event.valid);
    assert.deepEqual(event.validityResult, validity);
  });
});
