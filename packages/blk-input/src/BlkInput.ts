import {html, LitElement, nothing, type PropertyValues} from 'lit';
import {redispatchEvent, randomID} from '@blockquote/frontend-utilities';
import {property} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';
import {ref} from 'lit/directives/ref.js';
import {
  BlkMixinFormAssociated,
  BlkFormValidationEvent,
} from '@blockquote-playground/blk-mixin-element-internals';
import {styles} from './styles/blk-input-styles.css.js';

const stringOrBoolean = {
  fromAttribute: (value: string) => {
    if (value === 'true' || value === '') {
      return true;
    }
    return false;
  },
};

const htmlAttributeStringConverter = {
  fromAttribute: (value: string) => {
    if (value === 'true' || value === '' || value === 'on') {
      return 'on';
    }
    if (value === 'false' || value === 'off') {
      return 'off';
    }
    return value;
  },
};

// https://github.com/ionic-team/ionic-framework/blob/main/core/src/components/input/input.tsx#L373
// https://github.com/Esri/calcite-design-system/blob/dev/packages/calcite-components/src/components/input/input.tsx
// https://github.com/material-components/material-web/blob/main/textfield/internal/text-field.ts
// https://github.com/patternfly/patternfly-elements/blob/main/elements/pf-text-input/pf-text-input.ts#L232
// https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// https://medium.com/stackanatomy/form-validation-using-javascripts-constraint-validation-api-fd4b70720288
// https://mui.com/joy-ui/react-input/
// https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/ElementInternalsType/explainer.md
// https://github.com/w3c/webcomponents-cg/issues/104#issuecomment-2518809518

/**
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-input>`
 * An example element.
 */
export class BlkInput extends BlkMixinFormAssociated(LitElement) {
  __defaultInput?: HTMLInputElement | HTMLTextAreaElement;
  __defaultValue = '';
  __fromReset = false;
  __internalIdref = '';
  __hasInteracted = false;

  static override styles = [styles];

  static override readonly shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * Controls automatic capitalization of user input. Set to `"off"` or `"none"` to disable,
   * `"on"` or `"sentences"` to capitalize sentences, `"words"` to capitalize each word,
   * or `"characters"` to capitalize all characters.
   */
  @property({
    type: String,
  })
  override autocapitalize = 'off';

  /**
   * Indicates whether the browser should provide autocomplete suggestions for this input.
   * Use `"on"` to enable, `"off"` to disable, or specific autocomplete tokens like `"email"`, `"username"`, etc.
   */
  @property({
    type: String,
    converter: htmlAttributeStringConverter,
  })
  autocomplete?: string = 'off';

  /**
   * Controls whether the browser should automatically correct spelling and grammar mistakes as the user types.
   * Set to `"on"` (or `true`) to enable corrections, or `"off"` (or `false`) to disable.
   */
  @property({
    type: String,
    converter: htmlAttributeStringConverter,
  })
  autocorrect?: string = 'off';

  /**
   * When set to `true`, the input will automatically receive focus when the page loads.
   * Note: Only one element on a page should have autofocus enabled.
   */
  @property({
    type: Boolean,
  })
  override autofocus = false;

  /**
   * When set to `true`, the input is disabled and cannot be interacted with by the user.
   * The input will not receive focus and its value will not be submitted with the form.
   */
  @property({
    type: Boolean,
    reflect: true,
    useDefault: true,
  })
  disabled = false;

  /**
   * Specifies which action button to show on virtual keyboards.
   * Options: `"enter"`, `"done"`, `"go"`, `"next"`, `"previous"`, `"search"`, `"send"`.
   */
  @property({type: String, attribute: 'enterkeyhint'})
  override enterKeyHint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | '' =
    '';

  /**
   * Hints at the type of virtual keyboard to display on mobile devices.
   * Options: `"none"`, `"text"`, `"tel"`, `"url"`, `"email"`, `"numeric"`, `"decimal"`, `"search"`.
   */
  @property({type: String, attribute: 'inputmode'})
  override inputMode:
    | 'none'
    | 'text'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search'
    | '' = 'text';

  /**
   * The maximum allowed value for number, range, date, and time inputs.
   * For number inputs, this should be a numeric value. For date/time inputs, use appropriate date formats.
   */
  @property({type: Number})
  max?: string | number;

  /**
   * The maximum number of characters allowed in text-based inputs.
   * Applies to input types: `text`, `email`, `search`, `password`, `tel`, `url`.
   */
  @property({type: Number, attribute: 'maxlength'})
  maxLength?: number;

  /**
   * The minimum allowed value for number, range, date, and time inputs.
   * For number inputs, this should be a numeric value. For date/time inputs, use appropriate date formats.
   */
  @property({type: Number})
  min?: string | number;

  /**
   * The minimum number of characters required in text-based inputs.
   * Applies to input types: `text`, `email`, `search`, `password`, `tel`, `url`.
   */
  @property({type: Number, attribute: 'minlength'})
  minLength?: number;

  /**
   * Allows multiple values to be entered. Currently only supported for email input type,
   * where users can enter multiple email addresses separated by commas.
   */
  @property({
    type: Boolean,
  })
  multiple?: boolean;

  /**
   * The name of the input control. This value is submitted with the form data and
   * should be unique within the form to identify this specific input.
   */
  @property({type: String, reflect: true})
  name?: string;

  /**
   * The text label displayed above or beside the input field.
   * Used for accessibility and to provide context about what the user should enter.
   */
  @property({type: String, reflect: true})
  label?: string;

  /**
   * A regular expression pattern that the input value must match for validation.
   * Use standard regex syntax, e.g., `"[0-9]{3}-[0-9]{2}-[0-9]{4}"` for SSN format.
   */
  @property()
  pattern?: string;

  /**
   * Placeholder text that appears in the input when it's empty.
   * Provides a hint to the user about what type of information is expected.
   */
  @property({type: String})
  placeholder? = '';

  /**
   * When set to `true`, the input is read-only and cannot be modified by the user.
   * The input can still receive focus and its value will be submitted with the form.
   */
  @property({
    type: Boolean,
    reflect: true,
    useDefault: true,
    attribute: 'readonly',
  })
  readOnly = false;

  /**
   * When set to `true`, the user must provide a value before the form can be submitted.
   * The input will show validation errors if left empty during form submission.
   */
  @property({
    type: Boolean,
    reflect: true,
    useDefault: true,
  })
  required = false;

  /**
   * The number of rows to display for a `type="textarea"` text field.
   * Defaults to 3.
   */
  @property({type: Number}) rows = 3;

  /**
   * The number of cols to display for a `type="textarea"` text field.
   * Defaults to 20.
   */
  @property({type: Number}) cols = 20;

  /**
   * Controls whether the browser should check spelling and grammar in the input.
   * Set to `true` to enable spell checking, or `false` to disable it.
   */
  @property({
    type: Boolean,
    converter: stringOrBoolean,
  })
  override spellcheck = false;

  /**
   * Defines the increment/decrement step for numeric inputs when using arrow buttons or arrow keys.
   * Set to `"any"` to allow decimal values, or specify a positive number for the step size.
   */
  @property({type: String})
  step?: string;

  /**
   * The type of input control to render. Determines the input behavior, validation, and appearance.
   * Common types: `"text"`, `"email"`, `"password"`, `"number"`, `"tel"`, `"url"`, `"search"`.
   */
  @property({type: String, reflect: true})
  type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | 'textarea' = 'text';

  /**
   * The current value of the input. This is the text that the user has entered
   * or that has been programmatically set. Changes to this property will update the input display.
   */
  @property({type: String})
  value = '';

  /**
   * Message to show below the field
   */
  @property({attribute: 'info-message-text'})
  infoMessageText?: string;

  /**
   * Message to show below the field when it's invalid
   */
  @property({attribute: 'error-message-text'})
  errorMessageText?: string;

  @property({
    type: Boolean,
    reflect: true,
    useDefault: true,
  })
  invalid = false;

  /**
   * When true, `errorMessageText` is used for the internal validity check, but the visual error message is handled by the browser's native validation UI.
   */
  @property({
    type: Boolean,
    attribute: 'native-validation-message',
  })
  nativeValidationMessage = false;

  /**
   * The current character count of the input value.
   * The minlength and maxlength constraints are only checked on user-provided input. They are not checked if a value is set programmatically, even when explicitly calling checkValidity() or reportValidity()
   */
  get count() {
    return this.value.length;
  }

  /**
   * The native input/textarea control element.
   */
  get nativeControl() {
    return this.__defaultInput;
  }

  /**
   * Returns true if the user has interacted.
   * Interaction is detected through typing, key presses, or losing focus.
   */
  get touched(): boolean {
    return this.__hasInteracted;
  }

  get _messageTextEmpty() {
    return !this.infoMessageText && !this.errorMessageText;
  }

  constructor() {
    super();
    this.__internalIdref = `${'uuid-'}${randomID()}`;
  }

  override async connectedCallback() {
    super.connectedCallback?.();
    await this.updateComplete;

    this.internals.role = 'none';
    this.__defaultValue = this.value;
    this._checkValidityAndSetValue(this.value, true);
  }

  override willUpdate(props: PropertyValues<this>) {
    super.willUpdate(props);

    if (props.has('value') || props.has('errorMessageText')) {
      this._checkValidityAndSetValue(this.value);
    }
    if (props.has('name')) {
      this._checkValidityAndSetValue(this.__defaultValue);
    }
  }

  override render() {
    return html`<div class="field-block">${this._fieldTpl} ${this._messageTextTpl}</div>`;
  }

  get _messageTextTpl() {
    return html`
      ${this._messageTextEmpty
        ? nothing
        : html`<div class="message-text">
            ${this._infoMessageTextTpl} ${this._errorMessageTextTpl}
          </div>`}
    `;
  }

  get _infoMessageTextTpl() {
    return html`${this.infoMessageText
      ? html` <div class="info-message-text" id="info-message-text">${this.infoMessageText}</div> `
      : nothing}`;
  }

  get _errorMessageTextTpl() {
    return html`
      ${this.errorMessageText && !this.nativeValidationMessage
        ? html`<div
            class="error-message-text"
            role="alert"
            id="error-message-text"
            ?hidden="${!this.invalid}"
          >
            ${this.errorMessageText}
          </div>`
        : nothing}
    `;
  }

  get _fieldTpl() {
    return html`
      <div class="field-flex">
        <div class="field">${this._labelTpl}${this._inputOrTextareaTpl}</div>
      </div>
    `;
  }

  get _labelTpl() {
    return html`
      ${this.label
        ? html`<span class="mask"></span>
            <label for="${this.__internalIdref}">${this.label}</label>`
        : nothing}
    `;
  }

  get _inputOrTextareaTpl() {
    return this.type === 'textarea' ? this._textareaTpl : this._inputTpl;
  }

  get _textareaTpl() {
    return html`
      <textarea
        class="input-textarea textarea"
        aria-label="${this.labelText || nothing}"
        id="${this.label ? this.__internalIdref : nothing}"
        aria-invalid="${this.invalid ? 'true' : nothing}"
        aria-describedby="${this.infoMessageText ? 'info-message-text' : nothing}"
        aria-errormessage="${this.errorMessageText ? 'error-message-text' : nothing}"
        aria-required="${this.required ? 'true' : nothing}"
        autocomplete="${this.autocomplete ?? nothing}"
        name="${this.name || nothing}"
        ?disabled="${this.disabled}"
        .maxLength="${this.maxLength || nothing}"
        .minLength="${this.minLength || nothing}"
        .placeholder="${this.placeholder === '' ? ' ' : this.placeholder}"
        ?readonly="${this.readOnly}"
        ?required="${this.required}"
        rows="${this.rows || nothing}"
        cols="${this.cols || nothing}"
        .value="${live(this.value)}"
        @change="${this._onChange}"
        @compositionstart="${this._redispatchEvent}"
        @compositionend="${this._redispatchEvent}"
        @input="${this._onInput}"
        @focus="${this._redispatchEvent}"
        @blur="${this._redispatchEvent}"
        @keydown="${this._onKeydown}"
        @select="${this._redispatchEvent}"
        ${ref((textarea) => (this.__defaultInput = textarea as HTMLTextAreaElement))}
      ></textarea>
    `;
  }

  get _inputTpl() {
    return html`
      <input
        class="input-textarea input"
        aria-label="${this.labelText || nothing}"
        id="${this.label ? this.__internalIdref : nothing}"
        aria-invalid="${this.invalid ? 'true' : nothing}"
        aria-describedby="${this.infoMessageText ? 'info-message-text' : nothing}"
        aria-errormessage="${this.errorMessageText ? 'error-message-text' : nothing}"
        aria-required="${this.required ? 'true' : nothing}"
        .defaultValue="${this.__defaultValue}"
        .disabled="${this.disabled}"
        autocapitalize="${this.autocapitalize || nothing}"
        autocomplete="${this.autocomplete ?? nothing}"
        autocorrect="${this.autocorrect ?? nothing}"
        .autofocus="${this.autofocus}"
        .enterKeyHint="${this.enterKeyHint || nothing}"
        .inputMode="${this.inputMode || nothing}"
        .max="${this.max || nothing}"
        .min="${this.min || nothing}"
        .maxLength="${this.maxLength || nothing}"
        .minLength="${this.minLength || nothing}"
        .multiple="${this.multiple || nothing}"
        name="${this.name ?? nothing}"
        .pattern="${this.pattern || nothing}"
        .placeholder="${this.placeholder === '' ? ' ' : this.placeholder}"
        .readOnly="${this.readOnly}"
        .required="${this.required}"
        spellcheck="${this.spellcheck}"
        .step="${this.step || nothing}"
        .type="${this.type}"
        .value="${live(this.value)}"
        @change="${this._onChange}"
        @compositionstart="${this._redispatchEvent}"
        @compositionend="${this._redispatchEvent}"
        @input="${this._onInput}"
        @focus="${this._redispatchEvent}"
        @blur="${this._redispatchEvent}"
        @keydown="${this._onKeydown}"
        @select="${this._redispatchEvent}"
        ${ref((input) => (this.__defaultInput = input as HTMLInputElement))}
      />
    `;
  }

  formDisabledCallback(disabled: boolean) {
    // Toggling the fieldset's `disabled` property will cause this callback to run.
    // This won't happen if the component itself is already disabled, hence the use of `inert`.
    if (!this.disabled) {
      this.toggleAttribute('inert', disabled);
      this.__defaultInput?.toggleAttribute('disabled', disabled);
    }
  }

  formResetCallback() {
    this.value = this.__defaultValue;
    this.invalid = false;
    this.__fromReset = true;
    this.__hasInteracted = false;
  }

  /**
   * Marks the input as having been interacted with by the user.
   * This is used internally to determine when to show validation messages.
   */
  private _markAsInteracted() {
    if (!this.__hasInteracted) {
      this.__hasInteracted = true;
    }
  }

  private _redispatchEvent(ev: Event | string) {
    redispatchEvent(this, ev);
  }

  private _onKeydown(ev: KeyboardEvent) {
    const {key, target} = ev;
    if (
      ['Tab', 'Shift', 'Meta', 'Alt', 'Control'].includes(key) ||
      (target as HTMLElement).tagName === 'TEXTAREA'
    ) {
      return;
    }

    this._markAsInteracted();

    switch (key) {
      case 'Enter':
        this.requestSubmit(null);
    }
  }

  private _onInput({target}: Event) {
    const newValue = (target as HTMLInputElement).value;
    this.value = newValue;
  }

  private _onChange(ev: Event | string) {
    this._markAsInteracted();
    redispatchEvent(this, ev);
  }

  private async _checkValidityAndSetValue(value = this.value, connectedCallback = false) {
    const input = this.__defaultInput;
    if (!input) {
      return;
    }

    await this.updateComplete;
    this.setFormValue(value);
    this.setValidity(input.validity, this.errorMessageText ?? input.validationMessage, input);

    if (connectedCallback || this.__fromReset) {
      this.__fromReset = false;
      return;
    }
    const event = new BlkFormValidationEvent(this.validity);
    this.dispatchEvent(event);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'blk-input': BlkInput;
  }
}
