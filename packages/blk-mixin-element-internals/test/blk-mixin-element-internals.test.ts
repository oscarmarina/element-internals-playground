import {suite, test, assert} from 'vitest';
import {fixture} from '@open-wc/testing-helpers';
import {html} from 'lit';
import {
  BlkMixinInternalsBase,
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
        <label for="lbl-el2">Fancy label</label>
        <form-associated-label id="lbl-el2"></form-associated-label>
      </form>`
    );
    const el2 = root2.querySelector(tag)! as InstanceType<typeof FormAssociatedEl>;
    assert.include(el2.labelText, 'Fancy label');
  });

  test('should expose the role property from ElementInternals', async () => {
    class FormAssociatedEl extends BlkMixinFormAssociated(HTMLElement) {}
    defineTestElement(FormAssociatedEl, 'form-associated-role');
    const el = await fixture<FormAssociatedEl>(html`<form-associated-role></form-associated-role>`);
    assert.property(el, 'role');
    assert.isTrue(el.role === null || el.role === '');
    el.internals.role = 'textbox';
    assert.equal(el.role, 'textbox');
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
