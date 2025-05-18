import {BlkInput} from '@blockquote-playground/blk-input';
import {styles} from './styles/blk-inline-input-styles.css.js';

/**
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-inline-input>`

 */
export class BlkInlineInput extends BlkInput {
  static override styles = [styles];
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-inline-input': BlkInlineInput;
  }
}
