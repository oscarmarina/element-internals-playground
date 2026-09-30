import {BlkInput} from '@blockquote-playground/blk-input';
import {styles} from './styles/blk-inline-input-styles.css.js';

/**
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-inline-input>`
 * `<blk-input>` with its styles **replaced** (not extended) by a minimal stylesheet.
 * API, form association, validation and events are inherited unchanged — this is the
 * base for an inline/unstyled variant that only swaps presentation.
 */
export class BlkInlineInput extends BlkInput {
  static override styles = [styles];
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-inline-input': BlkInlineInput;
  }
}
