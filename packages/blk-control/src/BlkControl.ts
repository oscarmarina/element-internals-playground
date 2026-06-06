import {html, LitElement, nothing, render as LitHtmlRender, type PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';
import {ref} from 'lit/directives/ref.js';
import {
  BlkMixinFormAssociated,
  BlkFormValidationEvent,
} from '@blockquote-playground/blk-mixin-element-internals';
import {styles} from './styles/blk-control-styles.css.js';

export type BlkControlVariant = 'checkbox' | 'radio';

export type BlkControlLabelPosition = 'start' | 'end';

/**
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-control>`
 *
 * A custom element that wraps a native **checkbox** (default) or **radio**
 * (`type` attribute) rendered in the light DOM.
 *
 * ### Architecture
 * The native `<input>` lives in the light DOM so that:
 * - same-name radios discover each other and form a native radio group
 *   (impossible across shadow-root boundaries), and
 * - the browser owns form participation, validation, reset, and state restore.
 *
 * The custom element does **not** participate in the form via ElementInternals.
 * It keeps `attachInternals()` only to expose custom states (`:state(checked)`,
 * `:state(indeterminate)`), proxies the constraint-validation API to the native
 * input as the single source of truth, and dispatches {@link BlkFormValidationEvent}.
 *
 * ### Type: `checkbox`
 * - Supports `indeterminate` state (`:state(indeterminate)`).
 *
 * ### Type: `radio`
 * - Same-name radios in the same form/tree form a native group.
 * - `required` validity is group-level (valid when any member is checked),
 *   provided natively by the browser.
 *
 *
 * @attribute type   - `"checkbox"` (default) | `"radio"`
 * @attribute name      - Form field name; also scopes radio groups.
 * @attribute value     - Submitted value when checked (default `"on"`).
 * @attribute checked   - Whether the control is selected.
 * @attribute disabled  - Whether the control is disabled.
 * @attribute required  - Whether the control is required.
 * @attribute indeterminate - (checkbox only) Indeterminate/mixed state.
 * @attribute label     - Visible label text. Falls back to default slot.
 * @attribute label-position - `"end"` (default) | `"start"`. Visual placement of the
 *                      label text relative to the control (CSS-only; DOM order unchanged).
 * @fires change     - The native `change` from the light-DOM `<input>`, which bubbles
 *                      through the host (not re-dispatched). Its `target` is therefore
 *                      the inner `<input>`, not the host — intentional, to keep native
 *                      radio-group propagation intact.
 * @fires validation - {@link BlkFormValidationEvent}, carrying the native input's
 *                      current `ValidityState`. **Contract (aligned with BlkInput):**
 *                      fires *only* when a validity-affecting property changes
 *                      (`required`, `checked`, `name`, `type`). It does **not** fire on
 *                      the initial render, on form reset, nor on the native `invalid`
 *                      event (submit-time) — those paths only refresh custom states.
 *
 * ### Custom states (for styling)
 * Exposed through `ElementInternals.states` because host pseudo-classes
 * (`:checked`, `:invalid`, `:disabled`) are unavailable on a non–form-associated
 * element. Match with the `:state()` selector on the host:
 * - `:state(checked)`       — control is checked
 * - `:state(indeterminate)` — (checkbox) mixed state
 * - `:state(invalid)`       — native input currently fails constraint validation
 * - `:state(disabled)`      — disabled directly or via an ancestor `<fieldset disabled>`
 */
export class BlkControl extends BlkMixinFormAssociated(LitElement) {
  __defaultInput?: HTMLInputElement;
  __root?: Document | ShadowRoot;
  __fromReset = false;
  __firstUpdateComplete = false;

  static override styles = [styles];

  /**
   * `"checkbox"` (default) or `"radio"`. Controls the native input type.
   */
  @property({type: String, reflect: true})
  type: BlkControlVariant = 'checkbox';

  /**
   * Form field name. For radios this also defines the group scope.
   */
  @property({type: String, reflect: true})
  name = '';

  /**
   * Value submitted when this control is checked. Defaults to `"on"`.
   */
  @property({type: String})
  value = 'on';

  /**
   * Whether this control is currently selected/checked.
   */
  @property({type: Boolean})
  checked = false;

  /**
   * Whether the control is disabled.
   */
  @property({type: Boolean, reflect: true})
  disabled = false;

  /**
   * When `true`, the form cannot be submitted unless this control is checked.
   */
  @property({type: Boolean, reflect: true})
  required = false;

  /**
   * (checkbox only) Puts the control into a `mixed` state.
   * Setting `checked=true` clears indeterminate.
   */
  @property({type: Boolean})
  indeterminate = false;

  /**
   * The text label displayed above or beside the input field.
   * Used for accessibility and to provide context about what the user should enter.
   */
  @property({type: String, reflect: true})
  label?: string;

  @property({type: String, reflect: true, attribute: 'id-label'})
  idlabel?: string;

  /**
   * Position of the label text relative to the control: `"end"` (default — text
   * after the input) or `"start"` (text before the input). Purely visual: it is
   * applied via CSS (the slotted `<label>` is reversed), so DOM order — and thus
   * accessibility/label association — is unchanged.
   */
  @property({type: String, reflect: true, useDefault: true, attribute: 'label-position'})
  labelPosition: BlkControlLabelPosition = 'end';

  /**
   * When true, the control is currently invalid based on the validation rules.
   */
  @property({type: Boolean, reflect: true})
  invalid = false;

  /**
   * Reactive mirror of "disabled via an ancestor `<fieldset disabled>`", kept in
   * sync by {@link formDisabledCallback}. The native input is already disabled by
   * the fieldset natively; this flag exists so the host can reflect the state.
   */
  @state() private __fieldsetDisabled = false;

  __hasInteracted = false;

  /**
   * Returns true if the user has interacted with the control.
   */
  get touched(): boolean {
    return this.__hasInteracted;
  }

  /**
   * The ValidityState of the native control. The native input is the single
   * source of truth for validation in this architecture.
   */
  override get validity(): ValidityState {
    return this.__defaultInput?.validity ?? ({valid: true} as ValidityState);
  }

  /**
   * The native control's validation message.
   */
  override get validationMessage(): string {
    return this.__defaultInput?.validationMessage ?? '';
  }

  /**
   * Whether the native control is a candidate for constraint validation.
   */
  override get willValidate(): boolean {
    return this.__defaultInput?.willValidate ?? false;
  }

  /**
   * The native control/input element backing this control.
   */
  get nativeControl() {
    return this.__defaultInput;
  }

  /**
   * Checks the native control's constraints without surfacing UI.
   */
  override checkValidity(): boolean {
    return this.__defaultInput?.checkValidity() ?? true;
  }

  /**
   * Checks the native control's constraints and surfaces native validation UI.
   */
  override reportValidity(): boolean {
    return this.__defaultInput?.reportValidity() ?? true;
  }

  override connectedCallback() {
    super.connectedCallback?.();
    // The native light-DOM input owns the interactive role; keep the host neutral.
    this.internals.role = 'none';

    // Observe the root (works with or without a <form>, since
    // both `change` and `reset` bubble) to re-sync state from the native input:
    // - radio deselection (the browser unchecks a sibling without an event on it)
    // - native form reset (restores the input to its default checked state)
    this.__root = this.getRootNode() as Document | ShadowRoot;
    this.__root.addEventListener('change', this._onChange);
    this.__root.addEventListener('reset', this._onRootReset);
  }

  override disconnectedCallback() {
    this.__root?.removeEventListener('change', this._onChange);
    this.__root?.removeEventListener('reset', this._onRootReset);
    this.__root = undefined;
    super.disconnectedCallback?.();
  }

  /**
   * Invoked by the browser (FACE) when this element's disabled state changes due
   * to an ancestor `<fieldset disabled>` being toggled — the only native "push"
   * for that change. We never call `setFormValue`/`setValidity`, so the host
   * stays out of submission; this is FACE used purely for lifecycle callbacks.
   */
  formDisabledCallback(disabled: boolean) {
    if (!this.disabled) {
      this.__fieldsetDisabled = disabled;
    }
  }

  override firstUpdated(_props: PropertyValues<this>) {
    super.firstUpdated(_props);
    this._syncStates();
  }

  override updated(props: PropertyValues<this>) {
    super.updated(props);

    if (this.validity.valid) {
      this.invalid = false;
    }

    // Custom states always reflect the current snapshot — cheap, and covers
    // validity/disabled changes that aren't tied to a single reactive property.
    this._syncStates();

    // Do not emit `validation` on the initial render (parity with BlkInput): like
    // native controls, validity is not announced until something actually changes.
    if (!this.__firstUpdateComplete) {
      this.__firstUpdateComplete = true;
      return;
    }

    // A reset-driven sync must not emit a `validation` event (see contract).
    const isReset = this.__fromReset;
    this.__fromReset = false;

    if (this._shouldSyncFormState(props) && !isReset) {
      this.dispatchEvent(new BlkFormValidationEvent(this.validity));
    }
  }

  _litHtmlRender() {
    LitHtmlRender(this._lightDomTpl, this, {host: this});
  }

  override render() {
    return html`<div class="mark">
      <i aria-hidden="true"></i><slot name="embedded"></slot> ${this._litHtmlRender()}
    </div> `;
  }

  get _inputTpl() {
    return html`
      <input
        id="${this.idlabel ? this.idlabel : nothing}"
        slot="embedded"
        class="control"
        name="${this.name}"
        type="${this.type}"
        .value="${live(this.value)}"
        .checked="${this.checked}"
        .defaultChecked="${this.hasAttribute('checked')}"
        .indeterminate="${this.indeterminate}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        @invalid="${this._onInvalid}"
        @focus="${this._onFocus}"
        @blur="${this._onBlur}"
        ${ref((input) => {
          this.__defaultInput = input as HTMLInputElement;
          const atStart = this.labelPosition === 'start';
          Object.assign((input as HTMLInputElement)?.style ?? {}, {
            position: 'absolute',
            insetBlockStart: '50%',
            transform: 'translateY(-50%)',
            insetInlineStart: atStart ? 'auto' : '0',
            insetInlineEnd: atStart ? '0' : 'auto',
            blockSize: 'var(--_control-size)',
            inlineSize: 'var(--_control-size)',
            margin: '0',
            border: '0',
            opacity: '0',
            cursor: 'pointer',
          });
        })}
      />
    `;
  }

  get _labelTpl() {
    return html`
      ${this.label
        ? html`<label slot="embedded"
            >${this._inputTpl} <span class="label-text">${this.label}</span></label
          >`
        : html`${this._inputTpl}`}
    `;
  }

  get _lightDomTpl() {
    return this._labelTpl;
  }

  private _shouldSyncFormState(props: PropertyValues<this>) {
    const keys = [
      'checked',
      'name',
      'type',
      'required',
    ] as const satisfies readonly (keyof BlkControl)[];

    return keys.some((prop) => props.has(prop));
  }

  private _syncStates() {
    const {states} = this.internals;
    const set = (name: string, on: boolean) => (on ? states.add(name) : states.delete(name));
    set('checked', this.checked);
    set('indeterminate', this.indeterminate);
    set('invalid', this.invalid);
    // `:disabled` covers both the host's own `disabled` and an ancestor
    // `<fieldset disabled>` — the latter pushed reactively via formDisabledCallback.
    set('disabled', this.disabled || this.__fieldsetDisabled);
    // Keyboard-only focus ring: `:focus-visible` excludes pointer focus, matching
    // native controls (the clipped input would otherwise show a ring on mouse click).
    set('focus', Boolean(this.__defaultInput?.matches(':focus-visible')));
  }

  /**
   * Mirror the native input's live state back onto the host.
   * Driven by the root `change`/`reset` listeners; setting `checked` triggers
   * `updated()`, which syncs custom states and dispatches the validation event.
   * The native `change` itself bubbles through the light-DOM child, so consumers
   * still receive a `change` event on the host without manual re-dispatch.
   */
  private _syncFromNative() {
    const input = this.__defaultInput;
    if (!input) {
      return;
    }
    if (this.checked !== input.checked) {
      this.checked = input.checked;
    }
    if (this.indeterminate !== input.indeterminate) {
      this.indeterminate = input.indeterminate;
    }
    if (this.__hasInteracted) {
      this.invalid = !this.validity.valid;
    }
  }

  private _onChange = (ev: Event) => {
    const target = ev.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const isOwnInput = target === this.__defaultInput;
    // A sibling radio in the same group was selected → this one was deselected
    // natively, without firing an event on it. The native group is scoped by
    // name *and* form owner (both `null` for form-less radios in the same root).
    const isGroupSibling =
      this.type === 'radio' &&
      !!this.name &&
      target.type === 'radio' &&
      target.name === this.name &&
      target.form === this.__defaultInput?.form;

    if (isOwnInput) {
      this.__hasInteracted = true;
      this.invalid = !this.validity.valid;
    }

    if (isOwnInput || isGroupSibling) {
      this._syncFromNative();
    }
  };

  private _onRootReset = () => {
    // The `reset` event fires before the browser applies default values, so read
    // the native input on the next microtask. Flag the upcoming sync as
    // reset-driven so `updated()` suppresses the `validation` event (see contract).
    queueMicrotask(() => {
      const input = this.__defaultInput;
      if (!input) {
        return;
      }
      this.__fromReset =
        this.checked !== input.checked || this.indeterminate !== input.indeterminate;
      this.__hasInteracted = false;
      this.invalid = false;
      this._syncFromNative();
    });
  };

  /**
   * Fired by the browser when the native control fails constraint validation
   * (e.g. on form submission). This does not change a reactive property, so we
   * refresh custom states here. Per the locked contract it does NOT emit a
   * `validation` event (mirrors BlkInput, which only flips its invalid state).
   */
  private _onInvalid() {
    this.__hasInteracted = true;
    this.invalid = true;
    this._syncStates();
  }

  private _onFocus() {
    this._syncStates();
  }

  private _onBlur() {
    this._syncStates();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-control': BlkControl;
  }
}
