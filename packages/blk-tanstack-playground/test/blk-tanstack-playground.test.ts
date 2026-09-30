import {suite, test, assert, expect, vi} from 'vitest';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {html} from 'lit';
import type {BlkInput} from '@blockquote-playground/blk-input';
import type {BlkTanstackPlayground} from '../src/BlkTanstackPlayground.js';
import '../src/define/blk-tanstack-playground.js';

const typeInto = async (field: BlkInput, value: string) => {
  const input = field.nativeControl!;
  input.focus();
  input.value = value;
  input.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
  await field.updateComplete;
};

const blurTo = async (el: BlkTanstackPlayground, field: BlkInput) => {
  el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-reset')!.focus();
  await el.updateComplete;
  await field.updateComplete;
};

const setup = async () => {
  const el = await fixture<BlkTanstackPlayground>(html`
    <blk-tanstack-playground></blk-tanstack-playground>
  `);
  const [username, email] = el.shadowRoot!.querySelectorAll<BlkInput>('blk-input');
  return {el, username, email};
};

suite('BlkTanstackPlayground', () => {
  test('renders one blk-input per field with its label and name', async () => {
    const {username, email} = await setup();
    assert.equal(username.label, 'Username');
    assert.equal(username.name, 'username');
    assert.equal(username.minLength, 3);
    assert.equal(email.type, 'email');
    fixtureCleanup();
  });

  test('passes TanStack errors to errorMessageText (property, not attribute)', async () => {
    const {el, email} = await setup();
    await typeInto(email, 'not-an-email');
    await blurTo(el, email);

    assert.equal(email.errorMessageText, 'Must be a valid email');
    assert.isTrue(email.invalid);
    fixtureCleanup();
  });

  test('keeps invalid when TanStack fails but the native input is valid', async () => {
    const {el, username} = await setup();
    // `required` is a TanStack rule only: natively the empty input is valid, so
    // <blk-input> clears `invalid` on blur — TanStack's verdict must win.
    await typeInto(username, 'a');
    await typeInto(username, '');
    await blurTo(el, username);
    await el.updateComplete;

    assert.isTrue(username.validity.valid);
    assert.equal(username.errorMessageText, 'Username is required');
    assert.isTrue(username.invalid);
    fixtureCleanup();
  });

  test('reset clears values and errors', async () => {
    const {el, email} = await setup();
    await typeInto(email, 'x');
    await blurTo(el, email);
    assert.isTrue(email.invalid);

    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-reset')!.click();
    await el.updateComplete;
    await email.updateComplete;

    assert.equal(email.value, '');
    assert.isFalse(email.invalid);
    fixtureCleanup();
  });

  test('submits valid values through TanStack', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockReturnValue(undefined);
    const logSpy = vi.spyOn(console, 'log').mockReturnValue(undefined);
    const {el, username, email} = await setup();
    await typeInto(username, 'oscar');
    await typeInto(email, 'a@b.c');
    await blurTo(el, email);

    // TanStack keeps canSubmit=false while the debounced async validator (~1s) runs,
    // and handleSubmit() ignores submissions in that window.
    const submitButton = el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-submit')!;
    await vi.waitFor(() => assert.isFalse(submitButton.disabled), {timeout: 3000});
    el.shadowRoot!.querySelector('form')!.requestSubmit();

    await vi.waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1), {timeout: 3000});
    expect(alertSpy).toHaveBeenCalledWith(
      JSON.stringify({username: 'oscar', email: 'a@b.c'}, null, 2)
    );
    alertSpy.mockRestore();
    logSpy.mockRestore();
    fixtureCleanup();
  });
});
