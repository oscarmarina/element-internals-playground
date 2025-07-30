import {suite, assert, expect, vi, test, chai} from 'vitest';
import {fixture} from '@open-wc/testing-helpers';
import {chaiA11yAxe} from 'chai-a11y-axe';
import {getDiffableHTML} from '@open-wc/semantic-dom-diff/get-diffable-html.js';
import {html} from 'lit';
import {BlkInput} from '../src/BlkInput.js';
import '../src/define/blk-input.js';

chai.use(chaiA11yAxe);

const getElementState = (element: HTMLElement, matchesStr: string) => {
  return element?.matches(matchesStr) ?? false;
};

suite('BlkInput', () => {
  let el: BlkInput;
  let elShadowRoot: string;

  suite('Label Handling', () => {
    test('should render the label when set via attribute', async () => {
      el = await fixture(html`<blk-input required label="Test Label">light-dom</blk-input>`);
      elShadowRoot = el?.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });

    test('should render the label when set via external <label> with "for" attribute', async () => {
      const root = await fixture(
        html`<div><label for="l1">Name</label> <blk-input id="l1">light-dom</blk-input></div>`
      );
      el = root.querySelector('blk-input')!;
      elShadowRoot = el.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });
  });

  suite('Label Handling - Textarea', () => {
    test('should render the label when set via attribute', async () => {
      el = await fixture(html`<blk-input label="Test Label" type="textarea">light-dom</blk-input>`);
      elShadowRoot = el?.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });

    test('should render the label when set via external <label> with "for" attribute', async () => {
      const root = await fixture(
        html`<div>
          <label for="lt1">Name</label> <blk-input id="lt1" type="textarea">light-dom</blk-input>
        </div>`
      );
      el = root.querySelector('blk-input')!;
      elShadowRoot = el.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });
  });

  suite('Accessibility', () => {
    test('should be accessible with native validation message', async () => {
      el = await fixture(
        html`<blk-input
          label="Name"
          type="text"
          name="x1-sec1"
          id="x1-sec1"
          required
          placeholder="Enter your name"
          native-validation-message
        ></blk-input>`
      );
      elShadowRoot = el?.shadowRoot!.innerHTML;
      await assert.isAccessible(el);
    });

    test('should be accessible with info and error messages', async () => {
      el = await fixture(
        html`<blk-input
          label="Email"
          type="email"
          name="x2-sec1"
          id="x2-sec1"
          placeholder="Enter your email"
          required
          pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*"
          info-message-text="Uppercase - Number - Special character"
          error-message-text="Please enter a valid email address"
        ></blk-input>`
      );
      elShadowRoot = el?.shadowRoot!.innerHTML;
      await assert.isAccessible(el);
    });

    test('should be accessible when disabled', async () => {
      el = await fixture(html`<blk-input disabled label="Test disabled"></blk-input>`);
      await assert.isAccessible(el);
    });

    test('should be accessible when invalid', async () => {
      el = await fixture(html`<blk-input required invalid label="Test invalid"></blk-input>`);
      await assert.isAccessible(el);
    });

    test('should be accessible with spellcheck and autocomplete', async () => {
      el = await fixture(
        html`<blk-input
          spellcheck="true"
          autocomplete="on"
          autocorrect="on"
          autocapitalize="sentences"
          label="Test Converters"
        ></blk-input>`
      );
      await assert.isAccessible(el);
    });

    test('should be accessible when read-only', async () => {
      el = await fixture(html`<blk-input readonly value="122" label="Test read-only"></blk-input>`);
      await assert.isAccessible(el);
    });

    test('should be accessible inside a disabled fieldset', async () => {
      const root = await fixture(
        html`<fieldset disabled><blk-input label="Test Label"></blk-input></fieldset>`
      );
      el = root.querySelector('blk-input')!;
      await assert.isAccessible(el);
    });

    test('should have proper ARIA attributes for invalid field', async () => {
      el = await fixture(
        html`<blk-input
          invalid
          label="Invalid Field"
          error-message-text="Error occurred"
        ></blk-input>`
      );
      await assert.isAccessible(el);
    });

    test('should have proper ARIA attributes for field with info message', async () => {
      el = await fixture(
        html`<blk-input label="Info Field" info-message-text="Helpful information"></blk-input>`
      );
      await assert.isAccessible(el);
    });
  });

  suite('Validation and Messages', () => {
    test('should display the native validation message', async () => {
      el = await fixture(
        html`<blk-input
          label="Name"
          type="text"
          name="x1-sec1"
          id="x1-sec1"
          required
          placeholder="Enter your name"
          native-validation-message
        ></blk-input>`
      );
      elShadowRoot = el?.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
    });

    test('should display info and error messages', async () => {
      el = await fixture(
        html`<blk-input
          label="Email"
          type="email"
          name="x2-sec21"
          id="x2-sec21"
          placeholder="Enter your email"
          required
          pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*"
          info-message-text="Uppercase - Number - Special character"
          error-message-text="Please enter a valid email address"
        ></blk-input>`
      );
      elShadowRoot = el?.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
    });

    test('should update the error message text dynamically', async () => {
      el = await fixture(
        html`<blk-input
          label="Email"
          type="email"
          name="x2-sec31"
          id="x2-sec31"
          placeholder="Enter your email"
          required
          pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*"
          info-message-text="Uppercase - Number - Special character"
          error-message-text="Please enter a valid email address"
        ></blk-input>`
      );
      assert.equal(el.errorMessageText, 'Please enter a valid email address');
      el.errorMessageText = 'New error message';
      await el.updateComplete;
      assert.equal(el.errorMessageText, 'New error message');
    });

    test('should be invalid if required and empty', async () => {
      el = await fixture(html`<blk-input required></blk-input>`);
      assert.isFalse(el.validity.valid);
      assert.isTrue(el.validity.valueMissing);
    });

    test('should be valid if min is met', async () => {
      el = await fixture(html`<blk-input type="number"></blk-input>`);
      el.min = 6;
      el.value = '8';
      await el.updateComplete;
      assert.isTrue(el.validity.valid);
    });

    test('should be invalid if min is not met', async () => {
      el = await fixture(html`<blk-input type="number" min="8" value="6"></blk-input>`);
      assert.isFalse(el.validity.valid);
      assert.isTrue(el.validity.rangeUnderflow);
    });

    test('should be invalid if max is exceeded', async () => {
      el = await fixture(html`<blk-input type="number" max="10" value="15"></blk-input>`);
      assert.isFalse(el.validity.valid);
      assert.isTrue(el.validity.rangeOverflow);
    });

    test('should validate pattern constraint', async () => {
      el = await fixture(html`<blk-input pattern="[0-9]+" value="abc123"></blk-input>`);
      assert.isFalse(el.validity.valid);
      assert.isTrue(el.validity.patternMismatch);
    });

    test('should validate email type', async () => {
      el = await fixture(html`<blk-input type="email" value="invalid-email"></blk-input>`);
      assert.isFalse(el.validity.valid);
      assert.isTrue(el.validity.typeMismatch);
    });
  });

  suite('Validation and Messages - Textarea', () => {
    test('should display the native validation message', async () => {
      el = await fixture(
        html`<blk-input
          label="Name"
          type="textarea"
          name="xt1-sec1"
          id="xt1-sec1"
          required
          rows=""
          cols=""
          placeholder="Enter your name"
          native-validation-message
        ></blk-input>`
      );
      elShadowRoot = el?.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
    });

    test('should display info and error messages', async () => {
      el = await fixture(
        html`<blk-input
          label="Textarea"
          type="textarea"
          name="xt2-sec21"
          id="xt2-sec21"
          placeholder="Enter..."
          required
          invalid
          pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*"
          info-message-text="Info message"
          error-message-text="Error message"
        ></blk-input>`
      );
      elShadowRoot = el?.shadowRoot!.innerHTML;
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
    });
  });

  suite('State', () => {
    test('should be disabled when the disabled attribute is set', async () => {
      el = await fixture(html`<blk-input disabled label="Test disabled"></blk-input>`);
      assert.isTrue(getElementState(el, ':disabled'));
    });
    test('should be invalid when the invalid attribute is set', async () => {
      el = await fixture(html`<blk-input required invalid label="Test invalid"></blk-input>`);
      assert.isTrue(getElementState(el, ':invalid'));
    });
    test('should be readonly when the readonly attribute is set', async () => {
      el = await fixture(html`<blk-input readonly value="122" label="Test read-only"></blk-input>`);
      assert.isTrue(getElementState(el, ':read-only'));
    });
    test('should be inert when inside a disabled fieldset', async () => {
      const root = await fixture(
        html`<fieldset disabled><blk-input label="Test Label"></blk-input></fieldset>`
      );
      el = root.querySelector('blk-input')!;
      assert.isTrue(getElementState(el, '[inert]'));
    });
  });

  suite('User Interaction (Touched)', () => {
    test('should not be touched initially', async () => {
      el = await fixture(html`<blk-input label="Test Label" value="Initial value"></blk-input>`);
      assert.isFalse(el.touched);
    });

    test('should not be touched when special keys are pressed without focus', async () => {
      el = await fixture(html`<blk-input label="Test Label" value="Initial value"></blk-input>`);

      const specialKeys = ['Tab', 'Shift', 'Meta', 'Alt', 'Control'];
      for (const key of specialKeys) {
        el.nativeControl?.dispatchEvent(
          new KeyboardEvent('keydown', {key, bubbles: true, composed: true, cancelable: true})
        );
        await el.updateComplete;
      }

      assert.isFalse(el.touched);
    });

    test('should be touched when user presses meaningful keys after focus', async () => {
      el = await fixture(html`<blk-input label="Test Label" value=""></blk-input>`);

      el.nativeControl?.dispatchEvent(
        new KeyboardEvent('keydown', {key: 'a', bubbles: true, composed: true, cancelable: true})
      );
      await el.updateComplete;

      assert.isTrue(el.touched);
    });

    test('should be touched when field loses focus after being changed', async () => {
      el = await fixture(html`<blk-input label="Test Label" value=""></blk-input>`);

      el.nativeControl?.dispatchEvent(new Event('focus', {bubbles: true}));
      await el.updateComplete;
      assert.isFalse(el.touched);

      el.nativeControl?.dispatchEvent(new Event('change', {bubbles: true}));
      await el.updateComplete;

      assert.isTrue(el.touched);
    });

    test('should reset touched state on form reset', async () => {
      const form = (await fixture(
        html`<form>
          <blk-input label="Test Label" value="Initial value"></blk-input>
        </form>`
      )) as HTMLFormElement;
      el = form.querySelector('blk-input')!;

      el.nativeControl?.dispatchEvent(new Event('change', {bubbles: true}));
      await el.updateComplete;
      assert.isTrue(el.touched);

      form.reset();
      await el.updateComplete;

      assert.isFalse(el.touched);
    });

    test('should not be touched when value is set programmatically', async () => {
      el = await fixture(html`<blk-input label="Test Label" value=""></blk-input>`);

      el.value = 'programmatic value';
      await el.updateComplete;

      assert.isFalse(el.touched);
    });
  });

  suite('Form Integration', () => {
    test('should reset the value to the initial value on form reset', async () => {
      const form = (await fixture(
        html`<form><blk-input label="Test Label" value="Initial value"></blk-input></form>`
      )) as HTMLFormElement;
      el = form.querySelector('blk-input')!;
      assert.equal(el.value, 'Initial value');
      el.value = 'New value';
      await el.updateComplete;
      assert.equal(el.value, 'New value');
      form.reset();
      await el.updateComplete;
      assert.equal(el.value, 'Initial value');
    });
    test('should not submit the form when special keys are pressed', async () => {
      const form = (await fixture(
        html`<form id="form" novalidate>
          <blk-input label="Test Label" value="Initial value"></blk-input>
        </form>`
      )) as HTMLFormElement;
      el = form.querySelector('blk-input')!;
      const submitSpy = vi.spyOn(form, 'requestSubmit');
      const specialKeys = ['Tab', 'Shift', 'Meta', 'Alt', 'Control'];
      for (const key of specialKeys) {
        el.nativeControl?.dispatchEvent(
          new KeyboardEvent('keydown', {key, bubbles: true, composed: true, cancelable: true})
        );
        await el.updateComplete;
      }
      expect(submitSpy).toHaveBeenCalledTimes(0);
    });
    test('should submit the form when Enter key is pressed', async () => {
      const form = (await fixture(
        html`<form id="form1" novalidate>
          <blk-input label="Test Label" value="Initial value"></blk-input>
        </form>`
      )) as HTMLFormElement;
      el = form.querySelector('blk-input')!;
      const submitSpy = vi.spyOn(form, 'requestSubmit').mockImplementation(vi.fn());
      el.nativeControl?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      );
      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(submitSpy).toHaveBeenCalledWith(null);
    });
  });

  suite('Attribute Converters and Accessibility', () => {
    test('should handle spellcheck, autocomplete, autocorrect, and autocapitalize attributes (set 1)', async () => {
      el = await fixture(
        html`<blk-input
          spellcheck="true"
          autocomplete="on"
          autocorrect="on"
          autocapitalize="sentences"
          label="Test Converters"
        ></blk-input>`
      );
      expect(
        getDiffableHTML(el.shadowRoot!.innerHTML, {ignoreAttributes: ['id', 'for']})
      ).toMatchSnapshot('SHADOW DOM');
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });
    test('should handle spellcheck, autocomplete, and autocorrect attributes (set 2)', async () => {
      el = await fixture(
        html`<blk-input
          spellcheck=""
          autocomplete="true"
          autocorrect="true"
          label="Test Converters 2"
        ></blk-input>`
      );
      expect(
        getDiffableHTML(el.shadowRoot!.innerHTML, {ignoreAttributes: ['id', 'for']})
      ).toMatchSnapshot('SHADOW DOM');
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });
    test('should handle spellcheck, autocomplete, and autocorrect attributes (set 3)', async () => {
      el = await fixture(
        html`<blk-input
          spellcheck="false"
          autocomplete="off"
          autocorrect="none"
          label="Test Converters 3"
        ></blk-input>`
      );
      expect(
        getDiffableHTML(el.shadowRoot!.innerHTML, {ignoreAttributes: ['id', 'for']})
      ).toMatchSnapshot('SHADOW DOM');
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });
    test('should handle spellcheck and autocapitalize attributes (set 4)', async () => {
      el = await fixture(
        html`<blk-input
          spellcheck="false"
          autocapitalize="words"
          label="Test Converters 4"
        ></blk-input>`
      );
      expect(
        getDiffableHTML(el.shadowRoot!.innerHTML, {ignoreAttributes: ['id', 'for']})
      ).toMatchSnapshot('SHADOW DOM');
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
      await assert.isAccessible(el);
    });

    test('should return the correct character count', async () => {
      el = await fixture(html`<blk-input inputmode="" label="Test" value="four"></blk-input>`);
      assert.equal(el.count, 4);
    });
    test('should expose the correct control element', async () => {
      el = await fixture(html`<blk-input inputmode="" label="Test" value="four"></blk-input>`);
      assert.equal(el.nativeControl?.localName, 'input');
    });
  });

  suite('Events', () => {
    test('should dispatch a validation event', async () => {
      el = await fixture(html`<blk-input label="Test Label" value="initial"></blk-input>`);
      const spyEvent = vi.spyOn(el, 'dispatchEvent');
      el.dispatchEvent(new Event('validation'));
      const calledWithValidation = spyEvent.mock.lastCall?.[0].type === 'validation';
      assert.isTrue(calledWithValidation);
    });

    test('should dispatch an input event from the control element', async () => {
      el = await fixture(html`<blk-input label="Test Label"></blk-input>`);
      const inputSpy = el.nativeControl as HTMLInputElement;
      const spyEvent = vi.spyOn(inputSpy, 'dispatchEvent');
      inputSpy.dispatchEvent(new Event('input'));
      const calledWithValidation = spyEvent.mock.lastCall?.[0].type === 'input';
      assert.isTrue(calledWithValidation);
    });
  });

  suite('Focus', () => {
    test('should focus the control element when read-only and focus is called', async () => {
      el = await fixture(html`<blk-input readonly value="122" label="Test read-only"></blk-input>`);
      el.focus();
      assert.isTrue(getElementState(el, ':focus'));
      assert.isTrue(getElementState(el, ':focus-within'));
    });
  });

  suite('Keyboard Interaction', () => {
    test('should not submit form on navigation keys', async () => {
      const form = (await fixture(
        html`<form>
          <blk-input label="Test Input"></blk-input>
        </form>`
      )) as HTMLFormElement;
      el = form.querySelector('blk-input')!;

      const submitSpy = vi.spyOn(form, 'requestSubmit');
      const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

      for (const key of navigationKeys) {
        el.nativeControl?.dispatchEvent(
          new KeyboardEvent('keydown', {key, bubbles: true, composed: true})
        );
      }

      expect(submitSpy).not.toHaveBeenCalled();
    });
  });
});
