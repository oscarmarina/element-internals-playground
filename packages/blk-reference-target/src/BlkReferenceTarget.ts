import {html, LitElement} from 'lit';
import {styles} from './styles/blk-reference-target-styles.css.js';

/**
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-reference-target>`
 * https://blogs.igalia.com/alice/reference-target-having-your-encapsulation-and-eating-it-too/
 *
 * @slot - This element has a slot
 */
export class BlkReferenceTarget extends LitElement {
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
    referenceTarget: 'inner-dialog',
  };
  static override styles = [styles];

  override render() {
    return html`
      <dialog id="inner-dialog">
        <button id="close" aria-label="close" commandfor="inner-dialog" command="request-close">
          X
        </button>
        <slot></slot>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-reference-target': BlkReferenceTarget;
  }
}
