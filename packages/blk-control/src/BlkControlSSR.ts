import {css, html, isServer, LitElement, type PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';
import {
  BlkMixinFormAssociated,
  BlkFormValidationEvent,
} from '@blockquote-playground/blk-mixin-element-internals';

export type BlkControlSSRVariant = 'checkbox' | 'radio';
export type BlkControlSSRLabelPosition = 'start' | 'end';

/** `el.matches()` throws on selectors the engine doesn't know — guard the modern ones. */
const safeMatches = (el: Element | null | undefined, selector: string): boolean => {
  try {
    return !!el?.matches(selector);
  } catch {
    return false;
  }
};

/**
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-control-ssr>`
 *
 * SSR-friendly, **declarative** sibling of `<blk-control>`.
 *
 * `<blk-control>` renders its own `<input>` imperatively into the light DOM, which is not
 * SSR-safe. This variant instead **does not create the control**: the author (or the
 * server) provides a native `<input type="checkbox|radio">` and a `<label>` as slotted
 * light-DOM children, and the component *enhances* them.
 *
 * ### Why JS still mirrors state (and why it isn't pure `:has()` CSS)
 * The visual indicator lives in the shadow DOM, while `:checked`/`:disabled`/… live on the
 * light-DOM `<input>`. The only CSS bridge would be `:host(:has(input:checked))`, but
 * `:has()` inside `:host()` is **not honoured as a style selector** in current engines
 * (it matches in `element.matches()` yet the rule is dropped). So this component mirrors
 * the native input's state into `ElementInternals.states` and styles with
 * `:host(:state(...))` + `::slotted()` — both well supported. The invalid state is gated by
 * a "touched" flag (set on input/blur/invalid/change), matching `<blk-control>` and working
 * under the `novalidate` + manual `checkValidity()` flow where `:user-invalid` is unreliable.
 *
 * The native `<input>` keeps full ownership of submission, validation, reset, state
 * restore, radio-group discovery, disabled-by-`<fieldset>` and a11y semantics. The host is
 * form-associated **only** for the `formDisabledCallback` lifecycle hook — it never calls
 * `setFormValue`/`setValidity`, so it adds nothing to the form's data (no double submit).
 *
 * ### Canonical markup
 * `<input>` and `<label>` are **separate, direct slotted children** (so `::slotted(input)`
 * / `::slotted(label)` can reach them), associated natively with `for`/`id`:
 *
 * ```html
 * <blk-control-ssr>
 *   <input slot="embedded" id="terms" type="checkbox" name="terms" value="yes" required />
 *   <label slot="embedded" for="terms">I accept the terms</label>
 * </blk-control-ssr>
 * ```
 *
 * @attribute label-position - `"end"` (default) | `"start"`. CSS-only visual placement.
 * @fires validation - {@link BlkFormValidationEvent} on the native input's `change`
 *   (for radios, also on the sibling the browser deselects) and on a programmatic
 *   `checked` change. Not on initial render, reset, or the native `invalid` event.
 *
 * @cssState checked
 * @cssState indeterminate
 * @cssState invalid - invalid AND touched (after interaction / submit attempt)
 * @cssState disabled - own attribute or an ancestor `<fieldset disabled>`
 * @cssState focus - keyboard focus (`:focus-visible`)
 */
export class BlkControlSSR extends BlkMixinFormAssociated(LitElement) {
  static override styles = css`
    :host {
      --_control-size: var(--control-element-size, 1rem);
      --_control-color: var(--control-element-color, #1a73e8);
      --_control-border-color: var(--control-element-border-color, #757575);
      --_control-disabled-opacity: var(--control-element-disabled-opacity, 0.38);
      --_control-gap: var(--control-element-gap, calc(1rem + 4px));
      --_control-error-color: var(--control-element-error-color, #d83020);
      --_control-hover-border-color: var(--control-element-hover-border-color, fieldtext);
      --_control-focus-outline-color: var(--control-element-focus-outline-color, #007ac2);
      --_control-animation: var(
        --control-element-animation,
        125ms cubic-bezier(0.45, 0.05, 0.55, 0.95)
      );

      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      line-height: 1;
      cursor: pointer;
    }

    :host([hidden]) {
      display: none !important;
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    .mark {
      display: flex;
      align-items: center;
      position: relative;
      min-block-size: 1.5rem;
    }

    .mark i {
      display: flex;
      flex-direction: column;
      position: absolute;
      pointer-events: none;
      inset-block-start: 50%;
      inset-inline-start: 0;
      transform: translateY(-50%);
      block-size: var(--_control-size);
      inline-size: var(--_control-size);
      border: 2px solid var(--_control-border-color);
      background-color: transparent;
      transition:
        border-color var(--_control-animation),
        background-color var(--_control-animation);
    }

    .mark i::after {
      content: '';
      display: block;
      block-size: 50%;
      inline-size: 50%;
      margin: auto;
      background-color: var(--_control-color);
      border-radius: inherit;
      opacity: 0;
      transition: opacity var(--_control-animation);
    }

    /* shape — the host "type" attribute is reflected from the native input */
    :host([type='radio']) i {
      border-radius: 50%;
    }

    :host([type='checkbox']) i {
      border-radius: 2px;
    }

    /* checked / indeterminate */
    :host(:state(checked):not(:state(disabled))) i {
      border-color: var(--_control-color);
    }

    :host(:state(checked)) i::after {
      opacity: 1;
    }

    :host(:state(indeterminate)) i::after {
      opacity: 1;
      block-size: 2px;
      inline-size: calc(var(--_control-size) * 0.6);
      border-radius: 0;
    }

    /* hover */
    :host(:hover:not(:state(disabled))) i {
      border-color: var(--_control-hover-border-color);
    }

    /* keyboard-only focus ring */
    :host(:state(focus):not(:state(disabled))) i {
      border-color: var(--_control-focus-outline-color);
      outline: 2px solid var(--_control-focus-outline-color);
      outline-offset: 2px;
    }

    /* invalid (sourced from native :user-invalid → "touched") */
    :host(:state(invalid):not(:state(disabled))) i {
      border-color: var(--_control-error-color);
    }

    :host(:state(invalid):state(focus):not(:state(disabled))) i {
      outline-color: var(--_control-error-color);
    }

    :host(:state(invalid):not(:state(disabled))) ::slotted(label) {
      color: var(--_control-error-color);
    }

    /* disabled (own attribute OR ancestor <fieldset disabled>) */
    :host(:state(disabled)) {
      opacity: var(--_control-disabled-opacity);
      cursor: not-allowed;
    }

    :host(:state(disabled)) i {
      border-color: var(--_control-border-color);
    }

    :host(:state(disabled)) i::after {
      background-color: var(--_control-border-color);
    }

    :host(:state(disabled)) ::slotted(label) {
      cursor: not-allowed;
    }

    /* the native input: transparent overlay on the indicator (focusable/operable, and the
 native validation bubble anchors here). Pure CSS → applied on first paint, no flash. */
    ::slotted(input) {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 0;
      transform: translateY(-50%);
      block-size: var(--_control-size);
      inline-size: var(--_control-size);
      margin: 0;
      border: 0;
      opacity: 0;
      cursor: pointer;
    }

    ::slotted(label) {
      display: inline-flex;
      align-items: center;
      min-block-size: 1.5rem; /* WCAG 2.2 (2.5.8) target size */
      padding-inline-start: var(--_control-gap);
      cursor: pointer;
    }

    /* label-position="start": move indicator + input to the end, flip label padding */
    :host([label-position='start']) .mark i,
    :host([label-position='start']) ::slotted(input) {
      inset-inline: auto 0;
    }

    :host([label-position='start']) ::slotted(label) {
      padding-inline: 0 var(--_control-gap);
    }

    /* Forced colors / Windows High Contrast: author colors are ignored → redraw with
 CSS system color keywords to keep the indicator visible and stateful. */
    @media (forced-colors: active) {
      .mark i {
        border-color: CanvasText;
      }

      :host(:state(checked)) i {
        border-color: CanvasText;
      }

      :host(:state(checked)) i::after,
      :host(:state(indeterminate)) i::after {
        background-color: CanvasText;
      }

      :host(:state(focus)) i {
        border-color: Highlight;
        outline-color: Highlight;
      }

      :host(:state(disabled)) {
        opacity: 1;
      }

      :host(:state(disabled)) i,
      :host(:state(disabled)) i::after {
        border-color: GrayText;
        background-color: GrayText;
      }

      :host(:state(disabled)) ::slotted(label) {
        color: GrayText;
      }
    }
  `;

  /** The native control backing this element (acquired from the slot). */
  __defaultInput: HTMLInputElement | null = null;
  __root?: Document | ShadowRoot;
  /** "Touched" gate so errors show only after interaction / a submit attempt. */
  __hasInteracted = false;

  // `change` is handled on the root (to also catch deselected radio siblings). These are
  // the events that don't surface there: focus/blur for the focus ring, invalid for touched.
  private static readonly _inputEvents = ['focus', 'blur', 'invalid'] as const;

  /**
   * Visual placement of the label relative to the control: `"end"` (default) or
   * `"start"`. CSS-only — DOM order (and label association) is unchanged.
   */
  @property({type: String, reflect: true, attribute: 'label-position'})
  labelPosition: BlkControlSSRLabelPosition = 'end';

  // ── Validation API: proxied to the native input (single source of truth) ──

  get nativeControl(): HTMLInputElement | null {
    return this.__defaultInput;
  }

  override get validity(): ValidityState {
    return this.__defaultInput?.validity ?? ({valid: true} as ValidityState);
  }

  override get validationMessage(): string {
    return this.__defaultInput?.validationMessage ?? '';
  }

  override get willValidate(): boolean {
    return this.__defaultInput?.willValidate ?? false;
  }

  override checkValidity(): boolean {
    return this.__defaultInput?.checkValidity() ?? true;
  }

  override reportValidity(): boolean {
    return this.__defaultInput?.reportValidity() ?? true;
  }

  // ── Convenience accessors proxying the native input ──

  get checked(): boolean {
    return this.__defaultInput?.checked ?? false;
  }

  set checked(value: boolean) {
    const input = this.__defaultInput;
    if (!input || input.checked === value) {
      return;
    }
    input.checked = value;
    this._syncStates();
    this.dispatchEvent(new BlkFormValidationEvent(this.validity));
  }

  get indeterminate(): boolean {
    return this.__defaultInput?.indeterminate ?? false;
  }

  set indeterminate(value: boolean) {
    if (this.__defaultInput) {
      this.__defaultInput.indeterminate = value;
      this._syncStates();
    }
  }

  get value(): string {
    return this.__defaultInput?.value ?? '';
  }

  get name(): string {
    return this.__defaultInput?.name ?? '';
  }

  get type(): string {
    return this.__defaultInput?.type ?? '';
  }

  get required(): boolean {
    return this.__defaultInput?.required ?? false;
  }

  get disabled(): boolean {
    return safeMatches(this.__defaultInput, ':disabled');
  }

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) {
      return;
    }
    this.internals.role = 'none';
    // Not notified of radio-group deselection / form reset (the host owns no value),
    // so observe the root — both `change` and `reset` bubble there.
    this.__root = this.getRootNode() as Document | ShadowRoot;
    this.__root.addEventListener('change', this._onRootChange);
    this.__root.addEventListener('reset', this._onRootReset);
  }

  override disconnectedCallback() {
    this.__root?.removeEventListener('change', this._onRootChange);
    this.__root?.removeEventListener('reset', this._onRootReset);
    this.__root = undefined;
    this._detachInput();
    super.disconnectedCallback();
  }

  /** Fired by the browser when an ancestor `<fieldset disabled>` toggles. */
  formDisabledCallback() {
    this._syncStates();
  }

  override firstUpdated(_props: PropertyValues<this>) {
    super.firstUpdated(_props);
    if (!this.__defaultInput) {
      this._adoptInput(this.querySelector('input'));
    }
  }

  override render() {
    return html`
      <span class="mark">
        <i aria-hidden="true"></i>
        <slot name="embedded" @slotchange=${this._onSlotChange}></slot>
      </span>
    `;
  }

  private _onSlotChange = (ev: Event) => {
    const slot = ev.target as HTMLSlotElement;
    let input: HTMLInputElement | null = null;
    for (const el of slot.assignedElements({flatten: true})) {
      if (el instanceof HTMLInputElement) {
        input = el;
        break;
      }
      const nested = el.querySelector('input');
      if (nested) {
        input = nested;
        break;
      }
    }
    this._adoptInput(input);
  };

  private _adoptInput(input: HTMLInputElement | null) {
    if (this.__defaultInput === input) {
      this._syncStates();
      return;
    }
    this._detachInput();
    this.__defaultInput = input;
    if (input) {
      // Reflect type for the indicator shape, and listen for state-affecting events
      // that don't surface as a bubbling `change` on the root.
      this.setAttribute('type', input.type);
      for (const type of BlkControlSSR._inputEvents) {
        input.addEventListener(type, this._onInputEvent);
      }
    }
    this._syncStates();
  }

  private _detachInput() {
    const input = this.__defaultInput;
    if (!input) {
      return;
    }
    for (const type of BlkControlSSR._inputEvents) {
      input.removeEventListener(type, this._onInputEvent);
    }
  }

  private _onInputEvent = (ev: Event) => {
    // `:user-invalid` is unreliable under `novalidate` + manual `checkValidity()`, so we
    // gate the invalid state with our own "touched" flag. A submit attempt fires `invalid`
    // → touched. Real value interaction is handled by the root `change` listener. `blur`
    // only refreshes the `:state(focus)` ring — tabbing through must not flag the field.
    if (ev.type === 'invalid') {
      this.__hasInteracted = true;
    }
    this._syncStates();
  };

  private _onRootChange = (ev: Event) => {
    const target = ev.target;
    const input = this.__defaultInput;
    if (!input || !(target instanceof HTMLInputElement)) {
      return;
    }
    const isOwnInput = target === input;
    // Native radio group: same name AND same form owner (both `null` for form-less
    // radios in the same root).
    const isGroupSibling =
      input.type === 'radio' &&
      !!input.name &&
      target.type === 'radio' &&
      target.name === input.name &&
      target.form === input.form;

    if (isOwnInput || isGroupSibling) {
      this.__hasInteracted = true;
      this._syncStates();
      this.dispatchEvent(new BlkFormValidationEvent(this.validity));
    }
  };

  private _onRootReset = () => {
    // `reset` fires before defaults are applied → read on the next microtask.
    // Reset returns the field to "pristine" so errors are cleared.
    queueMicrotask(() => {
      this.__hasInteracted = false;
      this._syncStates();
    });
  };

  /**
   * Mirror the native input's live state into custom states for shadow-DOM styling.
   * `invalid` is sourced from the native `:user-invalid`, so the "touched" behaviour
   * (only flag after interaction/submit) comes from the platform.
   */
  private _syncStates() {
    const input = this.__defaultInput;
    const {states} = this.internals;
    const set = (name: string, on: boolean) => (on ? states.add(name) : states.delete(name));
    set('checked', !!input?.checked);
    set('indeterminate', !!input?.indeterminate);
    set('disabled', safeMatches(input, ':disabled'));
    set('invalid', this.__hasInteracted && !this.validity.valid);
    set('focus', safeMatches(input, ':focus-visible'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-control-ssr': BlkControlSSR;
  }
}
