import {describe, it, expect, beforeAll, afterAll, chai} from 'vitest';
import {fixture, fixtureCleanup} from '@open-wc/testing-helpers';
import {chaiA11yAxe} from 'chai-a11y-axe';
import {getDiffableHTML} from '@open-wc/semantic-dom-diff/get-diffable-html.js';
import {html} from 'lit';
import {BlkInlineInput} from '../src/BlkInlineInput.js';
import '../src/define/blk-inline-input.js';

chai.use(chaiA11yAxe);

describe('BlkInlineInput', () => {
  let el: BlkInlineInput;
  let elShadowRoot: string;

  describe('Semantic Dom and a11y', () => {
    beforeAll(async () => {
      el = await fixture(html`<blk-inline-input label="Test Label">light-dom</blk-inline-input>`);
      elShadowRoot = el?.shadowRoot!.innerHTML;
    });

    afterAll(() => {
      fixtureCleanup();
    });

    it('SHADOW DOM - Structure test', () => {
      expect(getDiffableHTML(elShadowRoot, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot(
        'SHADOW DOM'
      );
    });

    it('LIGHT DOM - Structure test', () => {
      expect(getDiffableHTML(el, {ignoreAttributes: ['id', 'for']})).toMatchSnapshot('LIGHT DOM');
    });

    it('a11y', async () => {
      await expect(el).accessible();
    });
  });
});
