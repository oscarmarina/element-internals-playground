import {suite, assert, expect, vi, test, chai} from 'vitest';
import {userEvent} from 'vitest/browser';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {chaiA11yAxe} from 'chai-a11y-axe';
import {getDiffableHTML} from '@open-wc/semantic-dom-diff/get-diffable-html.js';
import {html} from 'lit';
import {BlkControl} from '../src/BlkControl.js';
import '../src/define/blk-control.js';

chai.use(chaiA11yAxe);

// ── helpers ────────────────────────────────────────────────────────────────────

const getState = (el: Element, pseudo: string) => el.matches(pseudo);

// ── suite ──────────────────────────────────────────────────────────────────────
//
// Architecture under test:
// The native <input> lives in the light DOM and is the single source of truth for
// form participation, validation, reset, and radio-group behaviour. The host is NOT
// form-associated; it keeps ElementInternals only for custom states, proxies the
// validation API to the native input, and dispatches `validation` events. The host
// mirrors `checked`/`indeterminate` from the native input via root-level
// `change`/`reset` listeners.

suite('BlkControl', () => {
  // ── Snapshots ──────────────────────────────────────────────────────────────

  suite('Snapshots - checkbox (default)', () => {
    test('renders default checkbox correctly', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="Accept terms"></blk-control>`);
      expect(getDiffableHTML(el.shadowRoot!.innerHTML)).toMatchSnapshot('SHADOW DOM');
      expect(getDiffableHTML(el)).toMatchSnapshot('LIGHT DOM');
      fixtureCleanup();
    });

    test('renders checked checkbox correctly', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control label="Accept terms" checked></blk-control>`
      );
      expect(getDiffableHTML(el.shadowRoot!.innerHTML)).toMatchSnapshot('SHADOW DOM checked');
      fixtureCleanup();
    });

    test('renders indeterminate checkbox correctly', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control label="Select all" indeterminate></blk-control>`
      );
      expect(getDiffableHTML(el.shadowRoot!.innerHTML)).toMatchSnapshot('SHADOW DOM indeterminate');
      fixtureCleanup();
    });
  });

  suite('Snapshots - radio', () => {
    test('renders unchecked radio correctly', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control type="radio" name="color" value="red" label="Red"></blk-control>`
      );
      expect(getDiffableHTML(el.shadowRoot!.innerHTML)).toMatchSnapshot('SHADOW DOM radio');
      fixtureCleanup();
    });

    test('renders checked radio correctly', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control type="radio" name="color" value="red" label="Red" checked></blk-control>`
      );
      expect(getDiffableHTML(el.shadowRoot!.innerHTML)).toMatchSnapshot('SHADOW DOM radio checked');
      fixtureCleanup();
    });
  });

  // ── ARIA / a11y ────────────────────────────────────────────────────────────
  // The native light-DOM input carries the interactive role; the host is neutral.

  suite('Accessibility', () => {
    test('host has role="none" by default (checkbox)', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="Option A"></blk-control>`);
      assert.equal(el.internals.role, 'none');
      fixtureCleanup();
    });

    test('host has role="none" when type="radio"', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control type="radio" name="g" value="a" label="A"></blk-control>`
      );
      assert.equal(el.internals.role, 'none');
      fixtureCleanup();
    });

    test('host stays role="none" when type changes at runtime', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x"></blk-control>`);
      assert.equal(el.internals.role, 'none');

      el.type = 'radio';
      await el.updateComplete;
      assert.equal(el.internals.role, 'none');

      el.type = 'checkbox';
      await el.updateComplete;
      assert.equal(el.internals.role, 'none');
      fixtureCleanup();
    });
  });

  // ── Checkbox behaviour ─────────────────────────────────────────────────────
  // Interactions target the native input; the host mirrors its state.

  suite('Checkbox behaviour', () => {
    test('toggles checked on click', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x"></blk-control>`);
      assert.isFalse(el.checked);

      el.nativeControl!.click();
      await el.updateComplete;
      assert.isTrue(el.checked);

      el.nativeControl!.click();
      await el.updateComplete;
      assert.isFalse(el.checked);
      fixtureCleanup();
    });

    test('toggles checked on Space key', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x"></blk-control>`);
      el.nativeControl!.focus();
      await userEvent.keyboard(' ');
      await el.updateComplete;
      assert.isTrue(el.checked);
      fixtureCleanup();
    });

    test('clears indeterminate on toggle', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control label="x" indeterminate></blk-control>`
      );
      assert.isTrue(el.indeterminate);
      el.nativeControl!.click();
      await el.updateComplete;
      assert.isFalse(el.indeterminate);
      assert.isTrue(el.checked);
      fixtureCleanup();
    });

    test('change event bubbles from the host on toggle, retargeted to the inner input', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x"></blk-control>`);
      const spy = vi.fn();
      el.addEventListener('change', spy);
      el.nativeControl!.click();
      await el.updateComplete;
      expect(spy).toHaveBeenCalledTimes(1);
      // Native change is not re-dispatched, so the consumer sees the inner <input>
      // as the event target (intentional — keeps native radio-group propagation).
      assert.equal(spy.mock.calls[0][0].target, el.nativeControl);
      fixtureCleanup();
    });

    test('does not toggle when disabled', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x" disabled></blk-control>`);
      el.nativeControl!.click();
      await el.updateComplete;
      assert.isFalse(el.checked);
      fixtureCleanup();
    });
  });

  // ── Radio behaviour ────────────────────────────────────────────────────────
  // Same-name radios in the same root form a native group.

  suite('Radio behaviour', () => {
    test('selecting one radio deselects the other in the same group', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div role="radiogroup" aria-label="G1">
          <blk-control type="radio" name="g1" value="a" label="A" checked></blk-control>
          <blk-control type="radio" name="g1" value="b" label="B"></blk-control>
        </div>
      `);
      const [r1, r2] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      assert.isTrue(r1.checked);
      assert.isFalse(r2.checked);

      r2.nativeControl!.click();
      await r2.updateComplete;
      await r1.updateComplete;

      assert.isFalse(r1.checked);
      assert.isTrue(r2.checked);
      fixtureCleanup();
    });

    test('checking a radio from script deselects its group siblings', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div role="radiogroup" aria-label="G1b">
          <blk-control type="radio" name="g1b" value="a" label="A" checked></blk-control>
          <blk-control type="radio" name="g1b" value="b" label="B"></blk-control>
        </div>
      `);
      const [r1, r2] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      const onValidation = vi.fn();
      r1.addEventListener('validation', onValidation);

      r2.checked = true;
      await r2.updateComplete;
      await r1.updateComplete;

      assert.isFalse(r1.checked, 'the sibling host follows its native input');
      assert.isFalse(r1.internals.states.has('checked'));
      expect(onValidation).toHaveBeenCalledTimes(1);

      // An unrelated render of the deselected radio must not steal the selection back.
      r1.label = 'A (renamed)';
      await r1.updateComplete;
      await r2.updateComplete;
      assert.isTrue(r2.nativeControl!.checked);
      assert.isFalse(r1.nativeControl!.checked);
      fixtureCleanup();
    });

    // Same policy as blk-input: once the error has been shown, `invalid` follows the
    // native validity; before that, nothing set by script raises it.
    suite('When errors are shown', () => {
      const mount = async () => {
        const form = await fixture<HTMLFormElement>(
          html`<form><blk-control name="terms" label="Terms" required></blk-control></form>`
        );
        const el = form.querySelector<BlkControl>('blk-control')!;
        await el.updateComplete;
        form.addEventListener('submit', (ev) => ev.preventDefault());
        el.nativeControl!.addEventListener('invalid', (ev) => ev.preventDefault());
        return {form, el};
      };
      const set = async (
        el: BlkControl,
        prop: 'checked' | 'required' | 'disabled',
        value: boolean
      ) => {
        el[prop] = value;
        await el.updateComplete;
        await el.updateComplete;
      };
      const submit = async (form: HTMLFormElement, el: BlkControl) => {
        form.requestSubmit();
        await el.updateComplete;
        assert.isTrue(el.invalid);
      };

      test('nothing set by script raises the first error', async () => {
        const {el} = await mount();
        await set(el, 'checked', true);
        await set(el, 'checked', false);
        assert.isFalse(el.invalid);
        await set(el, 'required', false);
        await set(el, 'required', true);
        assert.isFalse(el.validity.valid);
        assert.isFalse(el.invalid);
        fixtureCleanup();
      });

      test('a user who never failed is not flagged by a later script change', async () => {
        const {el} = await mount();
        el.nativeControl!.click();
        await el.updateComplete;
        await set(el, 'checked', false);
        assert.isFalse(el.invalid);
        fixtureCleanup();
      });

      test('the user unchecking a required control shows the error at once', async () => {
        const {el} = await mount();
        el.nativeControl!.click();
        await el.updateComplete;
        assert.isFalse(el.invalid);
        el.nativeControl!.click();
        await el.updateComplete;
        await el.updateComplete;
        assert.isTrue(el.invalid);
        fixtureCleanup();
      });

      test('once shown, the error follows a checked set by script', async () => {
        const {form, el} = await mount();
        await submit(form, el);
        await set(el, 'checked', true);
        assert.isFalse(el.invalid);
        await set(el, 'checked', false);
        assert.isTrue(el.invalid);
        assert.equal(el.nativeControl!.getAttribute('aria-invalid'), 'true');
        fixtureCleanup();
      });

      test('once shown, the error follows the constraints', async () => {
        const {form, el} = await mount();
        await submit(form, el);
        await set(el, 'required', false);
        assert.isFalse(el.invalid);
        await set(el, 'required', true);
        assert.isTrue(el.invalid);
        await set(el, 'disabled', true);
        assert.isFalse(el.invalid);
        await set(el, 'disabled', false);
        assert.isTrue(el.invalid);
        fixtureCleanup();
      });

      test('error-message-id is referenced by the input only while the error is shown', async () => {
        const form = await fixture<HTMLFormElement>(
          html`<form>
            <blk-control name="terms" label="Terms" required error-message-id="terms-error">
            </blk-control>
            <div id="terms-error">You must accept the terms.</div>
          </form>`
        );
        const el = form.querySelector<BlkControl>('blk-control')!;
        await el.updateComplete;
        form.addEventListener('submit', (ev) => ev.preventDefault());
        el.nativeControl!.addEventListener('invalid', (ev) => ev.preventDefault());
        assert.isFalse(el.nativeControl!.hasAttribute('aria-errormessage'));

        await submit(form, el);
        assert.equal(el.nativeControl!.getAttribute('aria-errormessage'), 'terms-error');

        el.nativeControl!.click();
        await el.updateComplete;
        await el.updateComplete;
        assert.isFalse(el.nativeControl!.hasAttribute('aria-errormessage'));
        fixtureCleanup();
      });

      test('without error-message-id no aria-errormessage is rendered', async () => {
        const {form, el} = await mount();
        await submit(form, el);
        assert.isFalse(el.nativeControl!.hasAttribute('aria-errormessage'));
        fixtureCleanup();
      });

      // A real click, not `input.click()`: only then do microtasks (and so a Lit update)
      // run between two listeners of the same event.
      test('a page change listener lifts an external error by clearing the custom validity', async () => {
        const form = await fixture<HTMLFormElement>(
          html`<form><blk-control name="news" label="News" checked></blk-control></form>`
        );
        const el = form.querySelector<BlkControl>('blk-control')!;
        await el.updateComplete;
        el.nativeControl!.setCustomValidity('Already subscribed');
        el.invalid = true;
        await el.updateComplete;
        assert.isTrue(el.invalid);
        // Only the native control is touched here, never the host (see the class docs).
        form.addEventListener('change', () => el.nativeControl!.setCustomValidity(''));

        await userEvent.click(el.nativeControl!);
        await el.updateComplete;
        await el.updateComplete;
        assert.isFalse(el.nativeControl!.checked, 'one click is enough');
        assert.isFalse(el.checked);
        assert.isFalse(el.invalid);
        fixtureCleanup();
      });

      test('invalid never sticks on a control that passes validation', async () => {
        const el = await fixture<BlkControl>(html`<blk-control label="Valid"></blk-control>`);
        el.invalid = true;
        await el.updateComplete;
        await el.updateComplete;
        assert.isFalse(el.invalid);

        const fromMarkup = await fixture<BlkControl>(
          html`<blk-control label="Valid" invalid></blk-control>`
        );
        await fromMarkup.updateComplete;
        await fromMarkup.updateComplete;
        assert.isFalse(fromMarkup.invalid);
        assert.isFalse(fromMarkup.hasAttribute('invalid'));
        fixtureCleanup();
      });

      test('an external error goes through setCustomValidity and stays until it is cleared', async () => {
        const el = await fixture<BlkControl>(html`<blk-control label="Taken"></blk-control>`);
        el.nativeControl!.setCustomValidity('Taken');
        el.invalid = true;
        await el.updateComplete;
        await el.updateComplete;
        assert.isTrue(el.invalid);
        assert.equal(el.nativeControl!.getAttribute('aria-invalid'), 'true');

        el.nativeControl!.click();
        await el.updateComplete;
        await el.updateComplete;
        assert.isTrue(el.invalid, 'toggling does not lift a custom error');

        el.nativeControl!.setCustomValidity('');
        el.requestUpdate();
        await el.updateComplete;
        await el.updateComplete;
        assert.isFalse(el.invalid);
        fixtureCleanup();
      });

      test('a reset starts over', async () => {
        const {form, el} = await mount();
        await submit(form, el);
        form.reset();
        await el.updateComplete;
        await set(el, 'checked', true);
        await set(el, 'checked', false);
        assert.isFalse(el.invalid);
        fixtureCleanup();
      });
    });

    test('aria-invalid on the native input follows the host invalid state', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><blk-control name="terms" label="Terms" required></blk-control></form>`
      );
      const el = form.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      assert.equal(el.nativeControl!.getAttribute('aria-invalid'), 'false');

      form.addEventListener('submit', (ev) => ev.preventDefault());
      el.nativeControl!.addEventListener('invalid', (ev) => ev.preventDefault());
      form.requestSubmit();
      await el.updateComplete;
      assert.equal(el.nativeControl!.getAttribute('aria-invalid'), 'true');

      form.reset();
      await el.updateComplete;
      assert.equal(el.nativeControl!.getAttribute('aria-invalid'), 'false');
      fixtureCleanup();
    });

    test('a re-created input keeps the host checked state, not the checked attribute', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x" checked></blk-control>`);
      el.nativeControl!.click();
      await el.updateComplete;
      assert.isFalse(el.checked);

      // Dropping the label swaps the template, so a brand new <input> is rendered.
      el.label = undefined;
      el.setAttribute('aria-label', 'x');
      await el.updateComplete;
      el.nativeControl!.setAttribute('aria-label', 'x');
      assert.isFalse(el.nativeControl!.checked, 'defaultChecked must not re-check it');
      assert.isTrue(el.nativeControl!.defaultChecked);
      fixtureCleanup();
    });

    test('same-name radios in different forms do not cross-sync', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <form id="f1">
            <blk-control type="radio" name="dup" value="a" label="A" checked></blk-control>
          </form>
          <form id="f2">
            <blk-control type="radio" name="dup" value="b" label="B"></blk-control>
          </form>
        </div>
      `);
      const [a, b] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      assert.isTrue(a.checked);

      // Selecting the radio in form #2 must not deselect the one in form #1:
      // they share a name but belong to different form owners → different groups.
      b.nativeControl!.click();
      await a.updateComplete;
      await b.updateComplete;
      assert.isTrue(a.checked, 'radio in a different form must stay checked');
      assert.isTrue(b.checked);
      fixtureCleanup();
    });

    test('clicking an already-checked radio keeps it checked', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control type="radio" name="g2" value="a" label="A" checked></blk-control>`
      );
      el.nativeControl!.click();
      await el.updateComplete;
      assert.isTrue(el.checked);
      fixtureCleanup();
    });

    test('ArrowRight moves focus and checks the next radio', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div role="radiogroup" aria-label="G3">
          <blk-control type="radio" name="g3" value="a" label="A" checked></blk-control>
          <blk-control type="radio" name="g3" value="b" label="B"></blk-control>
        </div>
      `);
      const [r1, r2] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      r1.nativeControl!.focus();

      await userEvent.keyboard('{ArrowRight}');
      await r1.updateComplete;
      await r2.updateComplete;

      assert.isFalse(r1.checked);
      assert.isTrue(r2.checked);
      fixtureCleanup();
    });

    // NOTE: arrow-key navigation (and its wrap-around semantics) is native
    // browser behaviour, not implemented by blk-control. Wrap direction differs
    // across engines (e.g. WebKit vs Chromium), so we only assert that keyboard
    // navigation reaches the group and that the host mirrors the result — see the
    // ArrowRight test above.
  });

  // ── Form integration ───────────────────────────────────────────────────────
  // The native light-DOM input participates in the form directly.

  suite('Form integration', () => {
    test('submits the checked value', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control name="opt" value="yes" checked></blk-control>
        </form>
      `);
      const el = form.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      const data = new FormData(form);
      assert.equal(data.get('opt'), 'yes');
      fixtureCleanup();
    });

    test('does not submit a value when unchecked', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control name="opt" value="yes"></blk-control>
        </form>
      `);
      const el = form.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      const data = new FormData(form);
      assert.isFalse(data.has('opt'));
      fixtureCleanup();
    });

    test('native reset restores the initial (default) checked state', async () => {
      // Authored unchecked → default is unchecked. Toggling on then resetting
      // restores the default, and the host mirrors it.
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control name="opt" value="yes" label="x"></blk-control>
        </form>
      `);
      const el = form.querySelector<BlkControl>('blk-control')!;
      el.nativeControl!.click();
      await el.updateComplete;
      assert.isTrue(el.checked);

      form.reset();
      await el.updateComplete;
      assert.isFalse(el.checked);
      assert.isFalse(el.nativeControl!.checked);
      fixtureCleanup();
    });

    test('native reset restores an authored-checked control to checked', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control name="opt" value="yes" label="x" checked></blk-control>
        </form>
      `);
      const el = form.querySelector<BlkControl>('blk-control')!;
      el.nativeControl!.click();
      await el.updateComplete;
      assert.isFalse(el.checked);

      form.reset();
      await el.updateComplete;
      assert.isTrue(el.checked);
      fixtureCleanup();
    });

    test('is invalid when required and unchecked', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control name="opt" value="yes" required></blk-control>`
      );
      await el.updateComplete;
      assert.isFalse(el.validity.valid);
      assert.isTrue(el.validity.valueMissing);
      fixtureCleanup();
    });

    test('is valid when required and checked', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control name="opt" value="yes" required checked></blk-control>`
      );
      await el.updateComplete;
      assert.isTrue(el.validity.valid);
      fixtureCleanup();
    });

    // ── Radio group-level required semantics (native) ─────────────────────────

    test('required radio group: every member is valid when any sibling is checked', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div role="radiogroup" aria-label="Required group">
          <blk-control type="radio" name="rg-req" value="a" label="A" required></blk-control>
          <blk-control
            type="radio"
            name="rg-req"
            value="b"
            label="B"
            required
            checked
          ></blk-control>
        </div>
      `);
      const [r1, r2] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      await r1.updateComplete;
      await r2.updateComplete;
      assert.isTrue(r2.validity.valid, 'checked radio should be valid');
      assert.isTrue(
        r1.validity.valid,
        'unchecked-but-has-checked-sibling radio should also be valid'
      );
      fixtureCleanup();
    });

    test('required radio group: every member is invalid when no member is checked', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div role="radiogroup" aria-label="Required group 2">
          <blk-control type="radio" name="rg-req2" value="a" label="A" required></blk-control>
          <blk-control type="radio" name="rg-req2" value="b" label="B" required></blk-control>
        </div>
      `);
      const [r1, r2] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      await r1.updateComplete;
      await r2.updateComplete;
      assert.isFalse(r1.validity.valid);
      assert.isFalse(r2.validity.valid);
      fixtureCleanup();
    });

    test('required radio group: selecting one makes all members valid', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div role="radiogroup" aria-label="Required group 3">
          <blk-control type="radio" name="rg-req3" value="a" label="A" required></blk-control>
          <blk-control type="radio" name="rg-req3" value="b" label="B" required></blk-control>
        </div>
      `);
      const [r1, r2] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      await r1.updateComplete;
      await r2.updateComplete;
      assert.isFalse(r1.validity.valid);
      assert.isFalse(r2.validity.valid);

      r1.nativeControl!.click();
      await r1.updateComplete;
      await r2.updateComplete;
      assert.isTrue(r1.validity.valid, 'clicked radio should be valid');
      assert.isTrue(r2.validity.valid, 'unchecked sibling should also become valid');
      fixtureCleanup();
    });

    test('does NOT dispatch validation on the initial render', async () => {
      // Attach the listener BEFORE the first render (so we can't use `fixture`, which
      // awaits updateComplete). Parity with BlkInput: validity isn't announced on render.
      const spy = vi.fn();
      const el = document.createElement('blk-control');
      el.setAttribute('name', 'opt');
      el.setAttribute('required', '');
      el.addEventListener('validation', spy);
      document.body.appendChild(el);
      await el.updateComplete;

      expect(spy).not.toHaveBeenCalled();
      el.remove();
    });

    test('dispatches validation event when checked changes programmatically', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x"></blk-control>`);
      const spy = vi.fn();
      el.addEventListener('validation', spy);

      el.checked = true;
      await el.updateComplete;

      expect(spy).toHaveBeenCalledTimes(1);
      fixtureCleanup();
    });

    test('native invalid (failed submit) does NOT dispatch validation, only sets :state(invalid)', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control name="opt" value="yes" required></blk-control>
        </form>
      `);
      const el = form.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      const spy = vi.fn();
      el.addEventListener('validation', spy);

      // reportValidity() surfaces native UI and fires `invalid` on the input.
      // Per the locked contract this must NOT emit a `validation` event.
      assert.isFalse(el.reportValidity());
      expect(spy).not.toHaveBeenCalled();
      assert.isTrue(el.internals.states.has('invalid'));
      fixtureCleanup();
    });

    test('does NOT dispatch validation on form reset', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control name="opt" value="yes" label="x" checked></blk-control>
        </form>
      `);
      const el = form.querySelector<BlkControl>('blk-control')!;
      el.nativeControl!.click(); // toggle off → diverges from default
      await el.updateComplete;
      const spy = vi.fn();
      el.addEventListener('validation', spy);

      form.reset();
      await el.updateComplete;
      await el.updateComplete;

      assert.isTrue(el.checked, 'reset restored the authored-checked default');
      expect(spy).not.toHaveBeenCalled();
      fixtureCleanup();
    });

    test('native input is disabled inside a disabled fieldset', async () => {
      const root = await fixture<HTMLFieldSetElement>(html`
        <fieldset disabled>
          <blk-control label="x" name="opt" value="y"></blk-control>
        </fieldset>
      `);
      const el = root.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      assert.isTrue(getState(el.nativeControl!, ':disabled'));
      fixtureCleanup();
    });
  });

  // ── CSS pseudo-states / custom states ───────────────────────────────────────

  suite('Custom states', () => {
    test('native input matches :disabled when disabled attribute is set', async () => {
      const el = await fixture<BlkControl>(html`<blk-control disabled label="x"></blk-control>`);
      assert.isTrue(getState(el.nativeControl!, ':disabled'));
      fixtureCleanup();
    });

    test('exposes :state(checked) when checked', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x" checked></blk-control>`);
      await el.updateComplete;
      assert.isTrue(el.internals.states.has('checked'));
      fixtureCleanup();
    });

    test('exposes :state(indeterminate) when indeterminate', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control label="x" indeterminate></blk-control>`
      );
      await el.updateComplete;
      assert.isTrue(el.internals.states.has('indeterminate'));
      fixtureCleanup();
    });

    test('exposes :state(invalid) only after interaction, cleared when valid', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control name="o" value="y" required></blk-control>`
      );
      await el.updateComplete;
      // Touched model (aligned with BlkInput): not flagged invalid until interaction.
      assert.isFalse(el.internals.states.has('invalid'), 'untouched → not shown invalid');

      // A failed submit (native `invalid`) marks it touched + invalid.
      assert.isFalse(el.reportValidity());
      await el.updateComplete;
      assert.isTrue(el.internals.states.has('invalid'), 'after failed submit → invalid');

      el.nativeControl!.click();
      await el.updateComplete;
      assert.isFalse(el.internals.states.has('invalid'), 'checked → valid');
      fixtureCleanup();
    });

    test('exposes :state(disabled) when disabled', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x" disabled></blk-control>`);
      await el.updateComplete;
      assert.isTrue(el.internals.states.has('disabled'));
      fixtureCleanup();
    });

    test('exposes :state(disabled) inside a disabled fieldset', async () => {
      const root = await fixture<HTMLFieldSetElement>(html`
        <fieldset disabled>
          <blk-control label="x" name="o" value="y"></blk-control>
        </fieldset>
      `);
      const el = root.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      assert.isTrue(el.internals.states.has('disabled'));
      fixtureCleanup();
    });
  });

  suite('Review fixes', () => {
    test('keeps :state(disabled) from the fieldset after the host disabled attribute is removed', async () => {
      const fieldset = await fixture<HTMLFieldSetElement>(html`
        <fieldset><blk-control disabled label="x" name="o"></blk-control></fieldset>
      `);
      const el = fieldset.querySelector<BlkControl>('blk-control')!;
      fieldset.disabled = true;
      await el.updateComplete;
      el.disabled = false;
      await el.updateComplete;

      assert.isTrue(el.internals.states.has('disabled'));

      fieldset.disabled = false;
      await el.updateComplete;
      assert.isFalse(el.internals.states.has('disabled'));
      fixtureCleanup();
    });

    test('form.elements.namedItem(name) includes both the host and the native input (documented)', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form><blk-control label="Terms" name="terms" value="yes" checked></blk-control></form>
      `);
      const el = form.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;

      const named = form.elements.namedItem('terms') as RadioNodeList;
      assert.instanceOf(named, RadioNodeList);
      assert.sameMembers([...named], [el, el.nativeControl]);
      // The host never contributes to submission.
      assert.deepEqual(new FormData(form).getAll('terms'), ['yes']);
      fixtureCleanup();
    });

    test('nativeControl tracks the live input when the label template switches', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x" name="o"></blk-control>`);
      el.label = '';
      await el.updateComplete;

      const input = el.querySelector('input');
      assert.ok(input);
      assert.strictEqual(el.nativeControl, input);
      assert.isTrue(el.nativeControl!.isConnected);
      fixtureCleanup();
    });

    test('label-position updates the native input placement', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x" name="o"></blk-control>`);
      assert.equal(el.nativeControl!.style.insetInlineStart, '0px');

      el.labelPosition = 'start';
      await el.updateComplete;

      assert.equal(el.nativeControl!.style.insetInlineStart, 'auto');
      assert.equal(el.nativeControl!.style.insetInlineEnd, '0px');
      fixtureCleanup();
    });
  });

  // ── Validation API surface (proxied to native) ─────────────────────────────

  suite('Validation API', () => {
    test('checkValidity reflects the native control', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control name="o" value="y" required></blk-control>`
      );
      await el.updateComplete;
      assert.isFalse(el.checkValidity());
      assert.isTrue(el.willValidate);
      assert.isString(el.validationMessage);
      assert.isNotEmpty(el.validationMessage);

      el.nativeControl!.click();
      await el.updateComplete;
      assert.isTrue(el.checkValidity());
      assert.equal(el.validationMessage, '');
      fixtureCleanup();
    });
  });

  // ── Rendering variants ──────────────────────────────────────────────────────

  suite('Rendering', () => {
    test('renders without a label (no wrapping <label>)', async () => {
      const el = await fixture<BlkControl>(html`<blk-control name="o" value="y"></blk-control>`);
      await el.updateComplete;
      assert.notExists(el.querySelector('label'));
      assert.exists(el.nativeControl);
      fixtureCleanup();
    });

    test('applies id-label to the native input', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control label="x" id-label="my-input"></blk-control>`
      );
      await el.updateComplete;
      assert.equal(el.nativeControl!.id, 'my-input');
      fixtureCleanup();
    });

    test('ignores change events from unrelated controls in the same root', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <blk-control name="a" value="1" label="A"></blk-control>
          <blk-control name="b" value="1" label="B"></blk-control>
        </div>
      `);
      const [a, b] = Array.from(root.querySelectorAll<BlkControl>('blk-control'));
      a.nativeControl!.click();
      await a.updateComplete;
      await b.updateComplete;
      assert.isTrue(a.checked);
      assert.isFalse(b.checked, 'unrelated control must not mirror a sibling change');
      fixtureCleanup();
    });
  });

  // ── Label position ──────────────────────────────────────────────────────────
  // Assert only the stable contract: attribute reflection + DOM order preserved.
  // The exact visual technique (flex order, padding, indicator position) is a CSS
  // implementation detail and is intentionally not pinned here.

  suite('Label position', () => {
    test('defaults to "end" (default not reflected, useDefault)', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="x"></blk-control>`);
      await el.updateComplete;
      assert.equal(el.labelPosition, 'end');
      // `useDefault: true` keeps the default value off the attribute.
      assert.isNull(el.getAttribute('label-position'));
      fixtureCleanup();
    });

    test('label-position="start" reflects and keeps DOM order (a11y) unchanged', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control label="x" label-position="start"></blk-control>`
      );
      await el.updateComplete;
      assert.equal(el.labelPosition, 'start');
      assert.equal(el.getAttribute('label-position'), 'start');
      // The visual reorder is CSS-only: the input remains the first child of the label.
      const label = el.querySelector('label')!;
      assert.equal(label.firstElementChild, el.nativeControl);
      fixtureCleanup();
    });
  });

  // ── Label association (native, light DOM) ──────────────────────────────────
  // The input lives in the light DOM, so an external `<label for>` resolves to it
  // natively (same tree) via the `id-label` prop — no experimental `referenceTarget`
  // bridge is needed (that mechanism only targets shadow-internal elements).

  suite('Label association (native, light DOM)', () => {
    test('external <label for> resolves to the inner input via id-label', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <label for="terms">Accept</label>
          <blk-control id-label="terms" name="t" value="y"></blk-control>
        </div>
      `);
      const el = root.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      const label = root.querySelector<HTMLLabelElement>('label')!;

      assert.equal(label.control, el.nativeControl, 'label.control resolves to the inner input');

      label.click();
      await el.updateComplete;
      assert.isTrue(el.checked, 'clicking the label toggles the control');
      fixtureCleanup();
    });
  });
});
