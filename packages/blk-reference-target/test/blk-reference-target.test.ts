import {describe, it, expect, beforeAll, afterAll, chai} from 'vitest';
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
});
