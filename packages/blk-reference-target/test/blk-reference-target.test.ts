import {describe, it, expect, beforeAll, afterAll, afterEach, chai, assert} from 'vitest';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {chaiA11yAxe} from 'chai-a11y-axe';
import {getDiffableHTML} from '@open-wc/semantic-dom-diff/get-diffable-html.js';
import {html} from 'lit';
import {BlkReferenceTarget} from '../src/BlkReferenceTarget.js';
import '../src/define/blk-reference-target.js';

chai.use(chaiA11yAxe);

describe('BlkReferenceTarget', () => {
  let el: BlkReferenceTarget;
  let elShadowRoot: string;

  describe('Semantic Dom and a11y', () => {
    beforeAll(async () => {
      el = await fixture(html`<blk-reference-target>light-dom</blk-reference-target>`);
      elShadowRoot = el?.shadowRoot!.innerHTML;
    });

    afterAll(() => {
      fixtureCleanup();
    });

    it('SHADOW DOM - Structure test', () => {
      expect(getDiffableHTML(elShadowRoot)).toMatchSnapshot('SHADOW DOM');
    });

    it('LIGHT DOM - Structure test', () => {
      expect(getDiffableHTML(el, {ignoreAttributes: ['id']})).toMatchSnapshot('LIGHT DOM');
    });

    it('a11y', async () => {
      await expect(el).accessible();
    });
  });

  // Only Chromium ships `referenceTarget` today; other engines skip instead of failing.
  const supportsReferenceTarget = 'referenceTarget' in ShadowRoot.prototype;

  describe.skipIf(!supportsReferenceTarget)('referenceTarget', () => {
    // Per test: `commandfor` resolves by id, so a leftover fixture would steal the match.
    afterEach(() => {
      fixtureCleanup();
    });

    const setup = async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <button id="open" commandfor="rt" command="show-modal">Open</button>
          <blk-reference-target id="rt">content</blk-reference-target>
        </div>
      `);
      const host = root.querySelector<BlkReferenceTarget>('blk-reference-target')!;
      await host.updateComplete;
      const dialog = host.shadowRoot!.querySelector('dialog')!;
      return {root, host, dialog};
    };

    it('exposes the inner dialog as the shadow root reference target', async () => {
      const {host} = await setup();
      assert.equal(
        (host.shadowRoot as ShadowRoot & {referenceTarget: string}).referenceTarget,
        'inner-dialog'
      );
    });

    it('an outside commandfor pointing at the host opens the inner dialog', async () => {
      const {root, dialog} = await setup();
      assert.isFalse(dialog.open);

      root.querySelector<HTMLButtonElement>('#open')!.click();

      assert.isTrue(dialog.open);
      assert.isTrue(dialog.matches(':modal'));
      dialog.close();
    });

    it('the inner close button closes the dialog via command="request-close"', async () => {
      const {root, dialog} = await setup();
      root.querySelector<HTMLButtonElement>('#open')!.click();
      assert.isTrue(dialog.open);

      dialog.querySelector<HTMLButtonElement>('#close')!.click();

      assert.isFalse(dialog.open);
    });
  });
});
