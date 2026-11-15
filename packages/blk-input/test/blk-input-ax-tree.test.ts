import {suite, test, assert, afterEach} from 'vitest';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {html} from 'lit';
import {BlkInput} from '../src/BlkInput.js';
import {BlkInputReferenceTarget} from '../src/BlkInputReferenceTarget.js';
import '../src/define/blk-input.js';
import '../src/define/blk-input-reference-target.js';
import {axNode, hasAXTree} from './ax-tree.js';

const supportsReferenceTarget = 'referenceTarget' in ShadowRoot.prototype;

// What assistive technology actually receives, read from Chromium's accessibility tree.
// The rest of the suite (axe, DOM assertions) cannot see names that come through
// `ariaLabelledByElements` or `referenceTarget`.
suite.skipIf(!hasAXTree)('BlkInput accessibility tree (Chromium)', () => {
  // Per test: `<label for>` resolves by id, so a leftover fixture would steal the match.
  afterEach(() => {
    fixtureCleanup();
  });

  const withExternalLabel = async (tpl: unknown) => {
    const root = await fixture<HTMLElement>(tpl as never);
    const el = root.querySelector<BlkInput>('blk-input, blk-input-reference-target')!;
    await el.updateComplete;
    return {el, label: root.querySelector('label')!};
  };

  suite('accessible name', () => {
    test('comes from the `label` property', async () => {
      const el = await fixture<BlkInput>(html`<blk-input label="Name"></blk-input>`);
      const control = await axNode(el.nativeControl!);
      assert.equal(control.role, 'textbox');
      assert.equal(control.name, 'Name');
    });

    test('is blank without any label', async () => {
      const el = await fixture<BlkInput>(html`<blk-input></blk-input>`);
      // Not strictly empty: the `' '` placeholder is the name of last resort, so Chromium
      // reports whitespace. Keep that space: Safari needs it for the label animation
      // (`:placeholder-shown`); Chrome and Firefox work without it.
      assert.equal((await axNode(el.nativeControl!)).name.trim(), '');
    });

    test('comes from an external <label for>', async () => {
      const {el} = await withExternalLabel(
        html`<div><label for="ax-ext">Outer</label><blk-input id="ax-ext"></blk-input></div>`
      );
      assert.equal((await axNode(el.nativeControl!)).name, 'Outer');
    });

    test('follows the text of an external label without a render', async () => {
      const {el, label} = await withExternalLabel(
        html`<div><label for="ax-i18n">Name</label><blk-input id="ax-i18n"></blk-input></div>`
      );
      label.textContent = 'Nombre';
      assert.isFalse(el.isUpdatePending);
      assert.equal((await axNode(el.nativeControl!)).name, 'Nombre');
    });

    test('comes from a wrapping <label>, without the value of the control', async () => {
      const {el} = await withExternalLabel(
        html`<div>
          <label>Wrapped <blk-input value="Ada"></blk-input></label>
        </div>`
      );
      assert.equal((await axNode(el.nativeControl!)).name.trim(), 'Wrapped');
    });

    test('prefers the host aria-label over every label', async () => {
      const {el} = await withExternalLabel(
        html`<div>
          <label for="ax-explicit">Outer</label>
          <blk-input id="ax-explicit" aria-label="Explicit" label="Inner"></blk-input>
        </div>`
      );
      assert.equal((await axNode(el.nativeControl!)).name, 'Explicit');
    });

    test('prefers an external label over the `label` property', async () => {
      const {el} = await withExternalLabel(
        html`<div>
          <label for="ax-both">Outer</label>
          <blk-input id="ax-both" label="Inner"></blk-input>
        </div>`
      );
      assert.equal((await axNode(el.nativeControl!)).name, 'Outer');
    });

    test('is not exposed twice: the host is ignored', async () => {
      const {el} = await withExternalLabel(
        html`<div><label for="ax-host">Outer</label><blk-input id="ax-host"></blk-input></div>`
      );
      const host = await axNode(el);
      assert.isTrue(host.ignored);
      assert.equal(host.name, '');
    });
  });

  suite.skipIf(!supportsReferenceTarget)('accessible name through referenceTarget', () => {
    test('the platform forwards an external label to the inner control', async () => {
      const {el} = await withExternalLabel(
        html`<div>
          <label for="ax-rt">Forwarded</label>
          <blk-input-reference-target id="ax-rt"></blk-input-reference-target>
        </div>`
      );
      assert.isTrue((el as BlkInputReferenceTarget).hasReferenceTarget);
      // Nothing was copied: the name below can only come from the forwarded label.
      assert.isFalse(el.nativeControl!.hasAttribute('aria-label'));
      assert.equal((await axNode(el.nativeControl!)).name, 'Forwarded');
    });

    test('follows the text of the forwarded label without a render', async () => {
      const {el, label} = await withExternalLabel(
        html`<div>
          <label for="ax-rt-i18n">Name</label>
          <blk-input-reference-target id="ax-rt-i18n"></blk-input-reference-target>
        </div>`
      );
      label.textContent = 'Nombre';
      assert.isFalse(el.isUpdatePending);
      assert.equal((await axNode(el.nativeControl!)).name, 'Nombre');
    });

    test('still forwards an explicit host aria-label', async () => {
      const {el} = await withExternalLabel(
        html`<div>
          <label for="ax-rt-explicit">Outer</label>
          <blk-input-reference-target
            id="ax-rt-explicit"
            aria-label="Explicit"></blk-input-reference-target>
        </div>`
      );
      assert.equal((await axNode(el.nativeControl!)).name, 'Explicit');
    });
  });

  suite('states and description', () => {
    test('exposes required and the info message as description', async () => {
      const el = await fixture<BlkInput>(
        html`<blk-input label="Email" required info-message-text="We never share it"></blk-input>`
      );
      const control = await axNode(el.nativeControl!);
      assert.isTrue(control.props['required']);
      assert.equal(control.props['invalid'], 'false');
      assert.equal(control.description, 'We never share it');
    });

    test('is not exposed as invalid for a bad initial value, only once it is user-invalid', async () => {
      const el = await fixture<BlkInput>(
        html`<blk-input label="Email" type="email" value="not-an-email"></blk-input>`
      );
      const control = el.nativeControl as HTMLInputElement;
      assert.isFalse(control.validity.valid);
      // Left alone, Chromium reports this control as invalid right away.
      assert.equal((await axNode(control)).props['invalid'], 'false');

      control.value = 'still-not-an-email';
      control.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
      control.dispatchEvent(new FocusEvent('blur'));
      await el.updateComplete;
      assert.isTrue(el.invalid);
      assert.equal(control.getAttribute('aria-invalid'), 'true');
      assert.equal((await axNode(control)).props['invalid'], 'true');
    });

    test('exposes invalid and links the error message once the error is shown', async () => {
      const el = await fixture<BlkInput>(
        html`<blk-input
          label="Email"
          required
          invalid
          error-message-text="Enter an email"></blk-input>`
      );
      const control = await axNode(el.nativeControl!);
      assert.equal(control.props['invalid'], 'true');
      assert.equal(control.props['errormessage'], 'error-message-text');
    });

    test('the error container enters the tree as an assertive alert only with the error', async () => {
      const el = await fixture<BlkInput>(
        html`<blk-input label="Email" error-message-text="Enter an email"></blk-input>`
      );
      const container = el.shadowRoot!.querySelector('.error-message-text')!;
      // Hidden with `display: none` while empty, so it is not in the tree yet.
      assert.isTrue((await axNode(container)).ignored);

      el.invalid = true;
      await el.updateComplete;
      const alert = await axNode(container);
      assert.isFalse(alert.ignored);
      assert.equal(alert.role, 'alert');
      assert.equal(alert.props['live'], 'assertive');
    });

    test('exposes disabled, also when it comes from a fieldset', async () => {
      const own = await fixture<BlkInput>(html`<blk-input label="Own" disabled></blk-input>`);
      assert.isTrue((await axNode(own.nativeControl!)).props['disabled']);

      const fieldset = await fixture<HTMLFieldSetElement>(
        html`<fieldset disabled><blk-input label="Inherited"></blk-input></fieldset>`
      );
      const inherited = fieldset.querySelector<BlkInput>('blk-input')!;
      await inherited.updateComplete;
      assert.isTrue((await axNode(inherited.nativeControl!)).props['disabled']);
    });

    test('exposes readonly', async () => {
      const el = await fixture<BlkInput>(html`<blk-input label="Name" readonly></blk-input>`);
      assert.isTrue((await axNode(el.nativeControl!)).props['readonly']);
    });

    test('exposes a textarea as a multiline textbox', async () => {
      const el = await fixture<BlkInput>(
        html`<blk-input label="Notes" type="textarea"></blk-input>`
      );
      const control = await axNode(el.nativeControl!);
      assert.equal(control.role, 'textbox');
      assert.isTrue(control.props['multiline']);
      assert.equal(control.name, 'Notes');
    });
  });
});
