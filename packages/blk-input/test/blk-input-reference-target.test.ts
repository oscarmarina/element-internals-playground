import {suite, test, assert, afterEach, chai} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {chaiA11yAxe} from 'chai-a11y-axe';
import {html} from 'lit';
import {BlkInputReferenceTarget} from '../src/BlkInputReferenceTarget.js';
import '../src/define/blk-input-reference-target.js';

chai.use(chaiA11yAxe);

type ShadowRootWithReferenceTarget = ShadowRoot & {referenceTarget?: string | null};

const supportsReferenceTarget = 'referenceTarget' in ShadowRoot.prototype;

const referenceTargetOf = (el: BlkInputReferenceTarget) =>
  (el.shadowRoot as ShadowRootWithReferenceTarget).referenceTarget;

const setup = async (label?: string) => {
  const form = await fixture<HTMLFormElement>(html`
    <form>
      <label for="rt">Name</label>
      <blk-input-reference-target
        id="rt"
        name="name"
        required
        label=${label ?? ''}></blk-input-reference-target>
    </form>
  `);
  const el = form.querySelector<BlkInputReferenceTarget>('blk-input-reference-target')!;
  await el.updateComplete;
  return {form, el, label: form.querySelector<HTMLLabelElement>('label[for="rt"]')!};
};

suite('BlkInputReferenceTarget', () => {
  // Per test: `<label for>` resolves by id, so a leftover fixture would steal the match.
  afterEach(() => {
    fixtureCleanup();
  });

  suite('any engine', () => {
    test('is a BlkInput: form association, validation and submission are unchanged', async () => {
      const {form, el} = await setup();
      assert.isTrue(el.validity.valueMissing);

      el.value = 'Ada';
      await el.updateComplete;

      assert.isTrue(el.validity.valid);
      assert.deepEqual(new FormData(form).getAll('name'), ['Ada']);
    });

    test('hasReferenceTarget matches what the engine actually applied', async () => {
      const {el} = await setup();
      assert.equal(el.hasReferenceTarget, supportsReferenceTarget);
    });

    test('forwards an explicit host aria-label to the inner control', async () => {
      const {el} = await setup();
      el.setAttribute('aria-label', 'Explicit');
      await el.updateComplete;
      assert.equal(el.nativeControl!.getAttribute('aria-label'), 'Explicit');
    });

    test('is accessible', async () => {
      const {form} = await setup();
      // axe-core computes names in JS and does not know `referenceTarget` yet, so with
      // support it reports the inner control as unlabelled. The real name is asserted
      // below with Playwright's role query instead.
      await assert.isAccessible(
        form,
        supportsReferenceTarget ? {ignoredRules: ['label']} : undefined
      );
    });
  });

  suite.skipIf(!supportsReferenceTarget)('with referenceTarget support', () => {
    test('targets the inner control, using the fallback id when there is no label', async () => {
      const {el} = await setup();
      assert.equal(el.nativeControl!.id, BlkInputReferenceTarget.fallbackControlId);
      assert.equal(referenceTargetOf(el), el.nativeControl!.id);
    });

    test('targets the id BlkInput assigns when it renders its own label', async () => {
      const {el} = await setup('Internal');
      assert.notEqual(el.nativeControl!.id, BlkInputReferenceTarget.fallbackControlId);
      assert.equal(referenceTargetOf(el), el.nativeControl!.id);
    });

    test('an outside <label for=host> labels the inner control natively', async () => {
      const {el, label} = await setup();
      const control = el.nativeControl!;

      assert.include([...control.labels!], label);
      // Naming is native, so the label text is not copied into aria-label — not even
      // from the first render, which ran before the target existed.
      assert.isFalse(control.hasAttribute('aria-label'));
      assert.equal(el.labelText, '');
    });

    test('the inner control is exposed as a textbox named by the outside label', async () => {
      const {el} = await setup();
      const [textbox] = page.getByRole('textbox', {name: 'Name'}).elements();
      assert.strictEqual(textbox, el.nativeControl);
    });

    test('clicking the outside label focuses the inner control', async () => {
      const {el, label} = await setup();

      await userEvent.click(label);

      assert.strictEqual(el.shadowRoot!.activeElement, el.nativeControl);
    });

    test('re-targets the new element when type switches to textarea', async () => {
      const {el} = await setup();
      el.type = 'textarea';
      await el.updateComplete;

      assert.instanceOf(el.nativeControl, HTMLTextAreaElement);
      assert.equal(referenceTargetOf(el), el.nativeControl!.id);
    });
  });

  suite.skipIf(supportsReferenceTarget)('without referenceTarget support (fallback)', () => {
    test('does not create a referenceTarget expando on the shadow root', async () => {
      const {el} = await setup();
      assert.notProperty(el.shadowRoot!, 'referenceTarget');
    });

    test('falls back to forwarding the label text as aria-label', async () => {
      const {el} = await setup();
      assert.equal(el.nativeControl!.getAttribute('aria-label'), 'Name');
    });
  });
});
