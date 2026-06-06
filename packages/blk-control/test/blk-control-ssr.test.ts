import {suite, assert, expect, vi, test} from 'vitest';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {html} from 'lit';
import {BlkControlSSR} from '../src/BlkControlSSR.js';
import '../src/define/blk-control.js';

// ── helpers ──────────────────────────────────────────────────────────────────
const tick = () => new Promise((r) => requestAnimationFrame(r));
const getState = (el: Element, pseudo: string) => el.matches(pseudo);

// ── suite ────────────────────────────────────────────────────────────────────
// BlkControlSSR is the declarative variant: the native <input>/<label> are slotted
// light-DOM children; the host enhances them (proxied validation API, custom states
// for styling, validation event). Native input owns form/validation/reset/group.

suite('BlkControlSSR', () => {
  // ── Acquisition & proxied API ──────────────────────────────────────────────

  suite('Acquisition & API', () => {
    test('acquires the slotted input and proxies its props', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="t" type="checkbox" name="terms" value="yes" required />
          <label slot="embedded" for="t">Terms</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      assert.exists(el.nativeControl);
      assert.equal(el.type, 'checkbox');
      assert.equal(el.name, 'terms');
      assert.equal(el.value, 'yes');
      assert.isTrue(el.required);
      assert.isFalse(el.checked);
      assert.isFalse(el.disabled);
      assert.isFalse(el.indeterminate);
      fixtureCleanup();
    });

    test('finds an input nested inside a slotted <label>', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <label slot="embedded"><input type="checkbox" name="n" value="v" /> X</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      assert.exists(el.nativeControl);
      assert.equal(el.name, 'n');
      fixtureCleanup();
    });

    test('reflects the input type onto the host (shape hook)', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="r" type="radio" name="g" value="a" />
          <label slot="embedded" for="r">A</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      assert.equal(el.getAttribute('type'), 'radio');
      fixtureCleanup();
    });

    test('proxies return safe fallbacks before an input exists', () => {
      const el = document.createElement('blk-control-ssr') as BlkControlSSR;
      assert.isNull(el.nativeControl);
      assert.isTrue(el.validity.valid);
      assert.equal(el.validationMessage, '');
      assert.isFalse(el.willValidate);
      assert.isTrue(el.checkValidity());
      assert.isTrue(el.reportValidity());
      assert.isFalse(el.checked);
      assert.equal(el.value, '');
      assert.equal(el.name, '');
      assert.equal(el.type, '');
      assert.isFalse(el.required);
      assert.isFalse(el.disabled);
      assert.isFalse(el.indeterminate);
    });

    test('host has role="none" (the input owns the role)', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="t" type="checkbox" />
          <label slot="embedded" for="t">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      assert.equal(el.internals.role, 'none');
      fixtureCleanup();
    });
  });

  // ── Custom states ──────────────────────────────────────────────────────────

  suite('Custom states', () => {
    test('exposes :state(checked) from the native input', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="c" type="checkbox" checked />
          <label slot="embedded" for="c">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      assert.isTrue(getState(el, ':state(checked)'));
      fixtureCleanup();
    });

    test('checked/indeterminate setters write the input and update states', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="c" type="checkbox" />
          <label slot="embedded" for="c">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();

      el.checked = true;
      assert.isTrue(el.nativeControl!.checked);
      assert.isTrue(getState(el, ':state(checked)'));

      el.indeterminate = true;
      assert.isTrue(el.nativeControl!.indeterminate);
      assert.isTrue(getState(el, ':state(indeterminate)'));
      fixtureCleanup();
    });

    test(':state(disabled) when the input is disabled', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="d" type="checkbox" disabled />
          <label slot="embedded" for="d">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      assert.isTrue(getState(el, ':state(disabled)'));
      assert.isTrue(el.disabled);
      fixtureCleanup();
    });

    test(':state(disabled) inside a disabled fieldset (formDisabledCallback)', async () => {
      const root = await fixture<HTMLFieldSetElement>(html`
        <fieldset disabled>
          <blk-control-ssr>
            <input slot="embedded" id="d" type="checkbox" name="o" value="y" />
            <label slot="embedded" for="d">x</label>
          </blk-control-ssr>
        </fieldset>
      `);
      const el = root.querySelector<BlkControlSSR>('blk-control-ssr')!;
      await el.updateComplete;
      await tick();
      assert.isTrue(getState(el, ':state(disabled)'));
      fixtureCleanup();
    });
  });

  // ── Touched / invalid ──────────────────────────────────────────────────────

  suite('Invalid (touched)', () => {
    test('not invalid initially, not on tab-through, invalid after submit attempt', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form novalidate>
          <blk-control-ssr>
            <input slot="embedded" id="t" type="checkbox" name="t" value="y" required />
            <label slot="embedded" for="t">x</label>
          </blk-control-ssr>
        </form>
      `);
      const el = form.querySelector<BlkControlSSR>('blk-control-ssr')!;
      await el.updateComplete;
      await tick();
      assert.isFalse(getState(el, ':state(invalid)'), 'pristine → not flagged');

      // tab-through: focus then blur without changing the value
      el.nativeControl!.focus();
      el.nativeControl!.blur();
      await el.updateComplete;
      await tick();
      assert.isFalse(getState(el, ':state(invalid)'), 'tab-through must not flag');

      // submit attempt fires the native `invalid` event → touched
      form.checkValidity();
      await el.updateComplete;
      await tick();
      assert.isTrue(getState(el, ':state(invalid)'), 'after submit attempt → invalid');
      fixtureCleanup();
    });

    test('checking a required control clears invalid', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form novalidate>
          <blk-control-ssr>
            <input slot="embedded" id="t" type="checkbox" name="t" value="y" required />
            <label slot="embedded" for="t">x</label>
          </blk-control-ssr>
        </form>
      `);
      const el = form.querySelector<BlkControlSSR>('blk-control-ssr')!;
      await el.updateComplete;
      await tick();
      form.checkValidity();
      await el.updateComplete;
      await tick();
      assert.isTrue(getState(el, ':state(invalid)'));

      el.nativeControl!.click();
      await el.updateComplete;
      await tick();
      assert.isFalse(getState(el, ':state(invalid)'));
      fixtureCleanup();
    });
  });

  // ── Validation proxy ───────────────────────────────────────────────────────

  suite('Validation API (proxied)', () => {
    test('reflects the native control', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="t" type="checkbox" name="o" value="y" required />
          <label slot="embedded" for="t">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      assert.isFalse(el.checkValidity());
      assert.isTrue(el.willValidate);
      assert.isFalse(el.validity.valid);
      assert.isTrue(el.validity.valueMissing);
      assert.isNotEmpty(el.validationMessage);

      el.nativeControl!.click();
      await tick();
      assert.isTrue(el.checkValidity());
      assert.equal(el.validationMessage, '');
      fixtureCleanup();
    });
  });

  // ── Events ─────────────────────────────────────────────────────────────────

  suite('validation event', () => {
    test('does NOT dispatch on initial render', async () => {
      const spy = vi.fn();
      const el = document.createElement('blk-control-ssr');
      el.innerHTML =
        '<input slot="embedded" id="i" type="checkbox" name="o" value="y" required /><label slot="embedded" for="i">x</label>';
      el.addEventListener('validation', spy);
      document.body.appendChild(el);
      await (el as BlkControlSSR).updateComplete;
      await tick();
      expect(spy).not.toHaveBeenCalled();
      el.remove();
    });

    test('dispatches on user toggle (change)', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="t" type="checkbox" name="o" value="y" />
          <label slot="embedded" for="t">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      const spy = vi.fn();
      el.addEventListener('validation', spy);
      el.nativeControl!.click();
      await el.updateComplete;
      await tick();
      expect(spy).toHaveBeenCalled();
      assert.isTrue(el.checked);
      fixtureCleanup();
    });

    test('dispatches on programmatic checked change', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="t" type="checkbox" name="o" value="y" />
          <label slot="embedded" for="t">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      const spy = vi.fn();
      el.addEventListener('validation', spy);
      el.checked = true;
      expect(spy).toHaveBeenCalledTimes(1);
      fixtureCleanup();
    });

    test('does NOT dispatch on the native invalid event', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="t" type="checkbox" name="o" value="y" required />
          <label slot="embedded" for="t">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      await tick();
      const spy = vi.fn();
      el.addEventListener('validation', spy);
      assert.isFalse(el.reportValidity());
      await tick();
      expect(spy).not.toHaveBeenCalled();
      assert.isTrue(getState(el, ':state(invalid)'));
      fixtureCleanup();
    });

    test('does NOT dispatch on form reset', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control-ssr>
            <input slot="embedded" id="t" type="checkbox" name="t" value="y" checked />
            <label slot="embedded" for="t">x</label>
          </blk-control-ssr>
        </form>
      `);
      const el = form.querySelector<BlkControlSSR>('blk-control-ssr')!;
      await el.updateComplete;
      await tick();
      el.nativeControl!.click(); // diverge from default
      await tick();
      const spy = vi.fn();
      el.addEventListener('validation', spy);
      form.reset();
      await el.updateComplete;
      await tick();
      await tick();
      assert.isTrue(el.checked, 'reset restores the authored-checked default');
      expect(spy).not.toHaveBeenCalled();
      fixtureCleanup();
    });
  });

  // ── Radio group ────────────────────────────────────────────────────────────

  suite('Radio group', () => {
    test('selecting one deselects the sibling and syncs state', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div role="radiogroup" aria-label="g">
          <blk-control-ssr>
            <input slot="embedded" id="a" type="radio" name="g" value="a" checked />
            <label slot="embedded" for="a">A</label>
          </blk-control-ssr>
          <blk-control-ssr>
            <input slot="embedded" id="b" type="radio" name="g" value="b" />
            <label slot="embedded" for="b">B</label>
          </blk-control-ssr>
        </div>
      `);
      const [r1, r2] = Array.from(root.querySelectorAll<BlkControlSSR>('blk-control-ssr'));
      await r1.updateComplete;
      await r2.updateComplete;
      await tick();
      assert.isTrue(getState(r1, ':state(checked)'));

      const spy = vi.fn();
      r1.addEventListener('validation', spy);
      r2.nativeControl!.click();
      await r1.updateComplete;
      await r2.updateComplete;
      await tick();

      assert.isFalse(getState(r1, ':state(checked)'), 'sibling deselected + synced');
      assert.isTrue(getState(r2, ':state(checked)'));
      expect(spy).toHaveBeenCalled(); // sibling re-emits validation
      fixtureCleanup();
    });

    test('same-name radios in different forms do not cross-sync', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <form>
            <blk-control-ssr>
              <input slot="embedded" id="a" type="radio" name="dup" value="a" checked />
              <label slot="embedded" for="a">A</label>
            </blk-control-ssr>
          </form>
          <form>
            <blk-control-ssr>
              <input slot="embedded" id="b" type="radio" name="dup" value="b" />
              <label slot="embedded" for="b">B</label>
            </blk-control-ssr>
          </form>
        </div>
      `);
      const [a, b] = Array.from(root.querySelectorAll<BlkControlSSR>('blk-control-ssr'));
      await a.updateComplete;
      await b.updateComplete;
      await tick();
      b.nativeControl!.click();
      await a.updateComplete;
      await b.updateComplete;
      await tick();
      assert.isTrue(getState(a, ':state(checked)'), 'different form → unaffected');
      assert.isTrue(getState(b, ':state(checked)'));
      fixtureCleanup();
    });
  });

  // ── Form participation ───────────────────────────────────────────────────────

  suite('Form integration', () => {
    test('the native input submits its value', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control-ssr>
            <input slot="embedded" id="t" type="checkbox" name="terms" value="yes" checked />
            <label slot="embedded" for="t">x</label>
          </blk-control-ssr>
        </form>
      `);
      await tick();
      assert.equal(new FormData(form).get('terms'), 'yes');
      fixtureCleanup();
    });

    test('unchecked control submits nothing', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control-ssr>
            <input slot="embedded" id="t" type="checkbox" name="terms" value="yes" />
            <label slot="embedded" for="t">x</label>
          </blk-control-ssr>
        </form>
      `);
      await tick();
      assert.isFalse(new FormData(form).has('terms'));
      fixtureCleanup();
    });
  });

  // ── Label position ───────────────────────────────────────────────────────────

  suite('Label position', () => {
    test('defaults to "end"', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="t" type="checkbox" />
          <label slot="embedded" for="t">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      assert.equal(el.labelPosition, 'end');
      fixtureCleanup();
    });

    test('reflects label-position="start"', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr label-position="start">
          <input slot="embedded" id="t" type="checkbox" />
          <label slot="embedded" for="t">x</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      assert.equal(el.labelPosition, 'start');
      assert.equal(el.getAttribute('label-position'), 'start');
      fixtureCleanup();
    });
  });
});
