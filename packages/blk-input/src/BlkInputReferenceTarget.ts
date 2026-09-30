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

  override updated(props: PropertyValues<this>) {
    super.updated(props);
    const wasTargeting = this.hasReferenceTarget;
    this._syncReferenceTarget();
    // The first render ran before the target existed: labels resolved to the host and
    // `labelText` copied them into `aria-label`. Re-render once now that it is targeting.
    if (!wasTargeting && this.hasReferenceTarget) {
      this.requestUpdate();
    }
  }

  /**
   * Points the shadow root at the live inner control. It is re-run after every update
   * because the control's id changes with `label`, and `type="textarea"` swaps the element.
   */
  private _syncReferenceTarget() {
    const root = this.shadowRoot as ShadowRootWithReferenceTarget | null;
    const control = this.nativeControl;
    // Feature-detect on the instance: assigning on an unsupported engine would just create
    // an expando and make `hasReferenceTarget` report a false positive.
    if (!root || !control || !('referenceTarget' in root)) {
      return;
    }
    control.id ||= BlkInputReferenceTarget.fallbackControlId;
    if (root.referenceTarget !== control.id) {
      root.referenceTarget = control.id;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-input-reference-target': BlkInputReferenceTarget;
  }
}
