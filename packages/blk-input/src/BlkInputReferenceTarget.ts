import type {PropertyValues} from 'lit';
import {BlkInput} from './BlkInput.js';

type ShadowRootWithReferenceTarget = ShadowRoot & {referenceTarget?: string | null};

/**
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-input-reference-target>` (experimental)
 * `<blk-input>` whose shadow root forwards IDREF references pointing at the host
 * (`<label for>`, `aria-*`, `commandfor`…) natively to the inner `<input>`/`<textarea>`
 * through [`referenceTarget`](https://blogs.igalia.com/alice/reference-target-having-your-encapsulation-and-eating-it-too/).
 *
 * With support, the platform names the inner control from its labels, so the mixin's
 * `labelText` stops copying label text (only an explicit `aria-label` is forwarded).
 * Without support it behaves exactly like `<blk-input>` (label text forwarded as
 * `aria-label`). API, form association, validation and events are unchanged.
 */
export class BlkInputReferenceTarget extends BlkInput {
  /**
   * Id given to the inner control when `<blk-input>` renders it without one (no `label`),
   * so there is always something to target. Ids are scoped to the shadow root.
   */
  static readonly fallbackControlId = 'control';

  override get _controlId(): string {
    return super._controlId ?? BlkInputReferenceTarget.fallbackControlId;
  }

  /**
   * Points the shadow root at the control's id *before* rendering. `referenceTarget` is
   * an IDREF resolved lazily, so it can name an element that doesn't exist yet: the first
   * render already sees `hasReferenceTarget` and `labelText` never copies the label text.
   * The id changes with `label`; `type="textarea"` swaps the element but keeps the id.
   */
  override willUpdate(props: PropertyValues<this>) {
    super.willUpdate(props);
    const root = this.shadowRoot as ShadowRootWithReferenceTarget | null;
    // Feature-detect on the instance: assigning on an unsupported engine would just create
    // an expando and make `hasReferenceTarget` report a false positive.
    if (root && 'referenceTarget' in root && root.referenceTarget !== this._controlId) {
      root.referenceTarget = this._controlId;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-input-reference-target': BlkInputReferenceTarget;
  }
}
