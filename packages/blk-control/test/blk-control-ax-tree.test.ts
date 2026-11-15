import {suite, test, assert, afterEach} from 'vitest';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {html} from 'lit';
import {BlkControl} from '../src/BlkControl.js';
import {BlkControlSSR} from '../src/BlkControlSSR.js';
import '../src/define/blk-control.js';
import {axNode, hasAXTree} from './ax-tree.js';

// What assistive technology actually receives, read from Chromium's accessibility tree:
// the native light-DOM input owns role, name and state; the host must stay out of the way.
suite.skipIf(!hasAXTree)('BlkControl accessibility tree (Chromium)', () => {
  afterEach(() => {
    fixtureCleanup();
  });

  suite('blk-control', () => {
    test('exposes a named checkbox and ignores the host', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="Accept"></blk-control>`);
      const control = await axNode(el.nativeControl!);
      assert.equal(control.role, 'checkbox');
      assert.equal(control.name, 'Accept');
      assert.equal(control.props['checked'], 'false');
      assert.isTrue((await axNode(el)).ignored);
    });

    test('exposes checked and mixed', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="All"></blk-control>`);
      el.checked = true;
      await el.updateComplete;
      assert.equal((await axNode(el.nativeControl!)).props['checked'], 'true');

      el.indeterminate = true;
      await el.updateComplete;
      assert.equal((await axNode(el.nativeControl!)).props['checked'], 'mixed');
    });

    test('exposes a named radio', async () => {
      const el = await fixture<BlkControl>(
        html`<blk-control type="radio" name="ax-radio" label="Express" checked></blk-control>`
      );
      const control = await axNode(el.nativeControl!);
      assert.equal(control.role, 'radio');
      assert.equal(control.name, 'Express');
      assert.equal(control.props['checked'], 'true');
    });

    test('is not exposed as invalid until the user has had a chance to fail', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><blk-control name="terms" label="Terms" required></blk-control></form>`
      );
      const el = form.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      // Left alone, Chromium reports a required, unchecked checkbox as invalid right away.
      assert.equal((await axNode(el.nativeControl!)).props['invalid'], 'false');

      form.addEventListener('submit', (ev) => ev.preventDefault());
      el.nativeControl!.addEventListener('invalid', (ev) => ev.preventDefault());
      form.requestSubmit();
      await el.updateComplete;
      assert.equal((await axNode(el.nativeControl!)).props['invalid'], 'true');

      el.nativeControl!.click();
      await el.updateComplete;
      await el.updateComplete;
      assert.equal((await axNode(el.nativeControl!)).props['invalid'], 'false');
    });

    test('links the page error message once the error is shown', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <blk-control name="terms" label="Terms" required error-message-id="ax-terms-error">
          </blk-control>
          <div id="ax-terms-error" role="alert">You must accept the terms.</div>
        </form>`
      );
      const el = form.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      assert.isUndefined((await axNode(el.nativeControl!)).props['errormessage']);

      form.addEventListener('submit', (ev) => ev.preventDefault());
      el.nativeControl!.addEventListener('invalid', (ev) => ev.preventDefault());
      form.requestSubmit();
      await el.updateComplete;
      const control = await axNode(el.nativeControl!);
      assert.equal(control.props['invalid'], 'true');
      assert.equal(control.props['errormessage'], 'ax-terms-error');
    });

    test('a required radio group is not exposed as invalid before interaction either', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <blk-control type="radio" name="ax-contact" value="a" label="Email" required>
          </blk-control>
          <blk-control type="radio" name="ax-contact" value="b" label="Phone" required>
          </blk-control>
        </form>
      `);
      const [a, b] = Array.from(form.querySelectorAll<BlkControl>('blk-control'));
      await a.updateComplete;
      await b.updateComplete;
      assert.isFalse(a.nativeControl!.validity.valid);
      assert.equal((await axNode(a.nativeControl!)).props['invalid'], 'false');
      assert.equal((await axNode(b.nativeControl!)).props['invalid'], 'false');
    });

    // `required` is not asserted: Chromium does not expose it for checkboxes or radios
    // (not even with `aria-required`), native ones included.
    test('exposes disabled', async () => {
      const el = await fixture<BlkControl>(html`<blk-control label="Terms"></blk-control>`);
      el.disabled = true;
      await el.updateComplete;
      assert.isTrue((await axNode(el.nativeControl!)).props['disabled']);
    });

    test('exposes disabled when it comes from a fieldset', async () => {
      const fieldset = await fixture<HTMLFieldSetElement>(
        html`<fieldset disabled><blk-control label="Inherited"></blk-control></fieldset>`
      );
      const el = fieldset.querySelector<BlkControl>('blk-control')!;
      await el.updateComplete;
      assert.isTrue((await axNode(el.nativeControl!)).props['disabled']);
    });
  });

  suite('blk-control-ssr', () => {
    test('keeps the name of the slotted label and ignores the host', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="ax-ssr" type="checkbox" name="terms" required />
          <label slot="embedded" for="ax-ssr">Accept the terms</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      const control = await axNode(el.nativeControl!);
      assert.equal(control.role, 'checkbox');
      assert.equal(control.name, 'Accept the terms');
      assert.isTrue((await axNode(el)).ignored);
    });

    test('is not exposed as invalid until the error has been shown', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form novalidate>
          <blk-control-ssr>
            <input slot="embedded" id="ax-ssr-req" type="checkbox" name="terms" required />
            <label slot="embedded" for="ax-ssr-req">Accept the terms</label>
          </blk-control-ssr>
        </form>
      `);
      const el = form.querySelector<BlkControlSSR>('blk-control-ssr')!;
      await el.updateComplete;
      // Left alone, Chromium reports a required, unchecked checkbox as invalid right away.
      assert.equal((await axNode(el.nativeControl!)).props['invalid'], 'false');

      form.checkValidity();
      assert.equal((await axNode(el.nativeControl!)).props['invalid'], 'true');

      el.nativeControl!.click();
      assert.equal((await axNode(el.nativeControl!)).props['invalid'], 'false');
    });

    test('follows a checked change made through the host', async () => {
      const el = await fixture<BlkControlSSR>(html`
        <blk-control-ssr>
          <input slot="embedded" id="ax-ssr-checked" type="checkbox" name="news" />
          <label slot="embedded" for="ax-ssr-checked">Newsletter</label>
        </blk-control-ssr>
      `);
      await el.updateComplete;
      el.checked = true;
      assert.equal((await axNode(el.nativeControl!)).props['checked'], 'true');
    });
  });
});
