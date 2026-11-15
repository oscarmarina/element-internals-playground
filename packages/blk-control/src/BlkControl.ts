import {html, LitElement, nothing, render as LitHtmlRender, type PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';
import {ref} from 'lit/directives/ref.js';
import {styleMap} from 'lit/directives/style-map.js';
import {
  BlkMixinFormAssociated,
  BlkFormValidationEvent,
} from '@blockquote-playground/blk-mixin-element-internals';
import {styles} from './styles/blk-control-styles.css.js';
import {
  isRadioGroupSibling,
  registerRadioHost,
  syncRadioGroupSiblings,
  unregisterRadioHost,
} from './radioGroup.js';

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
 * The custom element is form-associated only for its lifecycle callbacks
 * (`formResetCallback`, `formDisabledCallback`): it never calls `setFormValue` /
 * `setValidity`, so it submits nothing. It exposes custom states (`:state(checked)`,
 * `:state(indeterminate)`…), proxies the constraint-validation API to the native
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
 * ### When errors are shown
 * Same policy as `blk-input`, adapted to a control whose every `change` is already a
 * committed choice (there is no typing to wait for):
 *
 * > A control that has already shown its error re-validates on every change that can
 * > affect it, until it is reset.
 *
 * - **Before the first error** nothing is shown on first render, nor for a `checked` or
 *   a constraint set by script. The first error comes from the user's own `change`
 *   (e.g. unchecking a required checkbox) or from an `invalid` event — usually a
 *   submission attempt, but `checkValidity()` and `reportValidity()` count the same.
 * - **After it**, `invalid` follows the native validity: checking or unchecking by
 *   script, toggling `required`, or enabling the control again brings the error back
 *   or clears it at once.
 * - **A form reset starts over.**
 * - **`invalid` is only ever `true` while the native control fails validation.** Set on
 *   a valid control (by script or as an attribute) it is cleared on that same update:
 *   there is no error text to explain it, and the form would submit anyway. To show an
 *   error decided elsewhere (e.g. by a server), make the native control fail with
 *   `nativeControl.setCustomValidity('…')` and set `invalid`; it stays until the custom
 *   validity is cleared. To lift it when the user changes the control, clear only the
 *   custom validity (`setCustomValidity('')`) in your `change` listener: the component
 *   re-validates right after and drops `invalid` by itself.
 * - **Do not set properties of this element from a `change` listener.** The component
 *   syncs from the native input at the end of that event; a property set before that
 *   renders with the previous `checked` and undoes the user's click.
 *
 * This is the component's own policy, modelled on the native `:user-invalid` without
 * reading it or trying to replicate it.
 *
 * ### Your own error message
 * The component has no error text: the page renders it and shows it with
 * `blk-control:state(invalid) + .error`. Pass its `id` in `error-message-id` and the
 * native input points at it with `aria-errormessage` while the error is shown, so a
 * screen reader can read the reason again from the control, not only when it appears:
 *
 * ```html
 * <blk-control name="terms" required label="I accept" error-message-id="terms-error">
 * </blk-control>
 * <div class="error" role="alert" id="terms-error">You must accept the terms.</div>
 * ```
 *
 * The message must live in the same tree as the host (the input is in its light DOM).
 * For a group — required radios, or "at least one" of several checkboxes — the error
 * belongs to the group: link it from your own container (`role="radiogroup"`,
 * `<fieldset>`) instead.
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
 * @attribute error-message-id - `id` of the page's own error message for this control.
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
 * Exposed through `ElementInternals.states` because the host submits no value and
 * sets no validity, so `:checked` / `:invalid` never match it. Match with the
 * `:state()` selector on the host:
 * - `:state(checked)`       — control is checked
 * - `:state(indeterminate)` — (checkbox) mixed state
 * - `:state(invalid)`       — native input currently fails constraint validation
 * - `:state(disabled)`      — disabled directly or via an ancestor `<fieldset disabled>`
 */
export class BlkControl extends BlkMixinFormAssociated(LitElement) {
  private __defaultInput?: HTMLInputElement;
  private __root?: Document | ShadowRoot;
  private __fromReset = false;
  private __firstUpdateComplete = false;

  static override styles = [styles];

  /**
   * `"checkbox"` (default) or `"radio"`. Controls the native input type.
   */
  @property({type: String, reflect: true})
  type: BlkControlVariant = 'checkbox';

  /**
   * Form field name. For radios this also defines the group scope.
   *
   * Note: the host is form-associated (for lifecycle callbacks), so with a `name`
   * attribute `form.elements.namedItem(name)` returns a `RadioNodeList` holding the
   * host *and* the native input. Use {@link nativeControl} or `FormData` instead.
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
   * (checkbox only) Puts the control into a `mixed` state. Like the native property,
   * it is independent of `checked`: only a user toggle clears it.
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
   * The `id` of an element in the page that holds this control's error message. While
   * `invalid` is true the native input references it with `aria-errormessage`; it is
   * not rendered otherwise. The element must be in the same tree as the host.
   */
  @property({type: String, attribute: 'error-message-id'})
  errorMessageId?: string;

  /**
   * Whether the component is showing its invalid state (`:state(invalid)`,
   * `aria-invalid="true"`). It is not the native constraint validation result — read
   * `validity` for that: a control can fail validation while `invalid` is still `false`,
   * until the policy in "When errors are shown" lets the error through. The reverse
   * never holds: on a control that passes validation it is cleared on the next update.
   * For an error decided elsewhere, use `nativeControl.setCustomValidity()` first.
   */
  @property({type: Boolean, reflect: true})
  invalid = false;

  /**
   * Reactive mirror of "disabled via an ancestor `<fieldset disabled>`", kept in
   * sync by {@link formDisabledCallback}. The native input is already disabled by
   * the fieldset natively; this flag exists so the host can reflect the state.
   */
  @state() private __fieldsetDisabled = false;

  private __hasInteracted = false;
  /**
   * The component has already shown this control's error (an invalid `change` by the
   * user, or an `invalid` event); cleared on reset. From then on `invalid` follows the
   * native validity on every update (see `updated()`), script and constraint changes
   * included.
   */
  private __hasReportedError = false;

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

    // Observe the root to re-sync state from the native input:
    // - radio deselection (the browser unchecks a sibling without an event on it)
    // `change` bubbles from the light-DOM input through the host.
    // Native form reset is handled by formResetCallback() (FACE lifecycle),
    // which the browser calls after all controls in the form are already restored.
    this.__root = this.getRootNode() as Document | ShadowRoot;
    this.__root.addEventListener('change', this._onChange);
  }

  override disconnectedCallback() {
    this.__root?.removeEventListener('change', this._onChange);
    this.__root = undefined;
    super.disconnectedCallback?.();
  }

  /**
   * Invoked by the browser (FACE) when this element's disabled state changes due
   * to an ancestor `<fieldset disabled>` being toggled — the only native "push"
   * for that change. We never call `setFormValue`/`setValidity`, so the host
   * stays out of submission; this is FACE used purely for lifecycle callbacks.
   */
  formDisabledCallback() {
    // The argument is the *combined* state (own attribute OR fieldset), so derive only the
    // fieldset part from the DOM. See also willUpdate().
    this.__fieldsetDisabled = this.isFieldsetDisabled;
  }

  override willUpdate(props: PropertyValues<this>) {
    super.willUpdate(props);
    // formDisabledCallback() does not fire when the host's own `disabled` toggles while an
    // ancestor fieldset keeps the combined state unchanged — recompute the fieldset part.
    if (props.has('disabled')) {
      this.__fieldsetDisabled = this.isFieldsetDisabled;
    }
  }

  override update(props: PropertyValues<this>) {
    super.update(props);
    // The native input is rendered into the light DOM (outside Lit's render root), right
    // after the shadow DOM, so it exists before `updated()` reads its validity.
    LitHtmlRender(this._lightDomTpl, this, {host: this});
  }

  override updated(props: PropertyValues<this>) {
    super.updated(props);

    // A valid control never keeps an error. A failing one shows it only if it has already
    // shown it once: a `checked` or a constraint set by script never raises the first one.
    // A disabled control is barred from validation (`willValidate` is false) but its
    // `validity` still reports the failure, so check both.
    if (this.validity.valid || this.__defaultInput?.willValidate === false) {
      this.invalid = false;
    } else if (this.__hasReportedError) {
      this.invalid = true;
    }

    // Custom states always reflect the current snapshot — cheap, and covers
    // validity/disabled changes that aren't tied to a single reactive property.
    this._syncStates();

    // Checking a radio from script unchecks its group siblings natively, with no event:
    // tell their hosts, or they keep a stale `checked` and steal it back on next render.
    if (props.has('checked') && this.checked && this.__defaultInput) {
      syncRadioGroupSiblings(this.__defaultInput);
    }

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

  override render() {
    return html`<div class="mark"><i aria-hidden="true"></i><slot name="embedded"></slot></div>`;
  }

  get _inputTpl() {
    const atStart = this.labelPosition === 'start';
    // `aria-invalid` is always explicit: left alone, browsers expose a required, unchecked
    // native checkbox or radio as invalid from the first render, before any interaction.
    // Honoured by Chromium and Safari; seen ignored by Firefox on a required radio.
    // Inline styles: the input may be nested in a slotted <label>, out of `::slotted()` reach.
    const inputStyles = {
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
    };
    return html`
      <input
        id="${this.idlabel || nothing}"
        slot="embedded"
        class="control"
        name="${this.name}"
        type="${this.type}"
        .value="${live(this.value)}"
        .defaultChecked="${this.hasAttribute('checked')}"
        .checked="${live(this.checked)}"
        .indeterminate="${this.indeterminate}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        aria-invalid="${this.invalid ? 'true' : 'false'}"
        aria-errormessage="${(this.invalid && this.errorMessageId) || nothing}"
        @invalid="${this._onInvalid}"
        @focus="${this._onFocus}"
        @blur="${this._onBlur}"
        style=${styleMap(inputStyles)}
        ${ref(this._inputRef)}
      />
    `;
  }

  get _labelTpl() {
    return html`
      ${
        this.label
          ? html`<label slot="embedded"
              >${this._inputTpl} <span class="label-text">${this.label}</span></label
            >`
          : html`${this._inputTpl}`
      }
    `;
  }

  get _lightDomTpl() {
    return this._labelTpl;
  }

  /**
   * Stable callback: a new arrow per render makes Lit call the old one with `undefined`
   * and the new one with the element on every update, and can leave `__defaultInput`
   * pointing at a disconnected input when the label template switches.
   *
   * In the template, `.defaultChecked` must stay *before* `.checked`: on a fresh input
   * (label added/removed) `live()` skips an unchanged `checked=false`, and a later
   * `defaultChecked=true` would then check the still-pristine input behind our back.
   */
  private _inputRef = (input?: Element) => {
    if (this.__defaultInput) {
      unregisterRadioHost(this.__defaultInput);
    }
    this.__defaultInput = input as HTMLInputElement | undefined;
    if (this.__defaultInput) {
      registerRadioHost(this.__defaultInput, this._syncFromNative);
    }
  };

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
  private _syncFromNative = () => {
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
      this._validate();
    }
  };

  /** Shows or clears the error from the native validity, and remembers having shown it. */
  private _validate() {
    this.invalid = !this.validity.valid;
    this.__hasReportedError ||= this.invalid;
  }

  private _onChange = (ev: Event) => {
    const target = ev.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const input = this.__defaultInput;
    const isOwnInput = target === input;
    // A sibling radio in the same group was selected → this one was deselected
    // natively, without firing an event on it.
    const isGroupSibling = !!input && isRadioGroupSibling(input, target);

    if (isOwnInput) {
      this.__hasInteracted = true;
      this._validate();
    }

    if (isOwnInput || isGroupSibling) {
      this._syncFromNative();
    }
  };

  /**
   * Called by the browser (FACE) after all form controls have been reset to
   * their default values — so `this.__defaultInput.checked` already reflects the
   * restored state. We read it synchronously (no microtask needed), flag the
   * update as reset-driven so `updated()` suppresses the `validation` event,
   * and let `_syncFromNative()` propagate the change to the host properties.
   */
  formResetCallback() {
    const input = this.__defaultInput;
    if (!input) {
      return;
    }
    const resetRequiresUpdate =
      this.checked !== input.checked || this.indeterminate !== input.indeterminate;
    this.__fromReset = resetRequiresUpdate;
    this.__hasInteracted = false;
    this.__hasReportedError = false;
    this.invalid = false;
    this._syncFromNative();
  }

  /**
   * Fired by the browser when the native control fails constraint validation
   * (e.g. on form submission). This does not change a reactive property, so we
   * refresh custom states here. Per the locked contract it does NOT emit a
   * `validation` event (mirrors BlkInput, which only flips its invalid state).
   */
  private _onInvalid() {
    this.__hasInteracted = true;
    this.__hasReportedError = true;
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
