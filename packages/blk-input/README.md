![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)

## `<blk-input>`
An example element.


### `src/BlkInput.ts`:

#### class: `BlkInput`, `blk-input`

##### Mixins

| Name                     | Module | Package                                            |
| ------------------------ | ------ | -------------------------------------------------- |
| `BlkMixinFormAssociated` |        | @blockquote-playground/blk-mixin-element-internals |

##### Static Fields

| Name                | Privacy | Type             | Default                                                      | Description | Inherited From |
| ------------------- | ------- | ---------------- | ------------------------------------------------------------ | ----------- | -------------- |
| `shadowRootOptions` |         | `ShadowRootInit` | `{ ...LitElement.shadowRootOptions, delegatesFocus: true, }` |             |                |

##### Fields

| Name                      | Privacy | Type                                                                                                                           | Default                         | Description                                                                                                                                                                                                                                                    | Inherited From |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `__defaultInput`          |         | `HTMLInputElement \| HTMLTextAreaElement \| undefined`                                                                         |                                 |                                                                                                                                                                                                                                                                |                |
| `__defaultValue`          |         | `string`                                                                                                                       | `''`                            |                                                                                                                                                                                                                                                                |                |
| `__fromReset`             |         | `boolean`                                                                                                                      | `false`                         |                                                                                                                                                                                                                                                                |                |
| `__internalIdref`         |         | `string`                                                                                                                       | `` `${'uuid-'}${randomID()}` `` |                                                                                                                                                                                                                                                                |                |
| `__hasInteracted`         |         | `boolean`                                                                                                                      | `false`                         |                                                                                                                                                                                                                                                                |                |
| `autocapitalize`          |         | `string`                                                                                                                       | `'off'`                         | Controls automatic capitalization of user input. Set to \`"off"\` or \`"none"\` to disable,&#xA;\`"on"\` or \`"sentences"\` to capitalize sentences, \`"words"\` to capitalize each word,&#xA;or \`"characters"\` to capitalize all characters.                |                |
| `autocomplete`            |         | `string \| undefined`                                                                                                          | `'off'`                         | Indicates whether the browser should provide autocomplete suggestions for this input.&#xA;Use \`"on"\` to enable, \`"off"\` to disable, or specific autocomplete tokens like \`"email"\`, \`"username"\`, etc.                                                 |                |
| `autocorrect`             |         | `string \| undefined`                                                                                                          | `'off'`                         | Controls whether the browser should automatically correct spelling and grammar mistakes as the user types.&#xA;Set to \`"on"\` (or \`true\`) to enable corrections, or \`"off"\` (or \`false\`) to disable.                                                    |                |
| `autofocus`               |         | `boolean`                                                                                                                      | `false`                         | When set to \`true\`, the input will automatically receive focus when the page loads.&#xA;Note: Only one element on a page should have autofocus enabled.                                                                                                      |                |
| `disabled`                |         | `boolean`                                                                                                                      | `false`                         | When set to \`true\`, the input is disabled and cannot be interacted with by the user.&#xA;The input will not receive focus and its value will not be submitted with the form.                                                                                 |                |
| `enterKeyHint`            |         | `'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| ''`                                                | `''`                            | Specifies which action button to show on virtual keyboards.&#xA;Options: \`"enter"\`, \`"done"\`, \`"go"\`, \`"next"\`, \`"previous"\`, \`"search"\`, \`"send"\`.                                                                                              |                |
| `inputMode`               |         | `\| 'none'     \| 'text'     \| 'tel'     \| 'url'     \| 'email'     \| 'numeric'     \| 'decimal'     \| 'search'     \| ''` | `'text'`                        | Hints at the type of virtual keyboard to display on mobile devices.&#xA;Options: \`"none"\`, \`"text"\`, \`"tel"\`, \`"url"\`, \`"email"\`, \`"numeric"\`, \`"decimal"\`, \`"search"\`.                                                                        |                |
| `max`                     |         | `string \| number \| undefined`                                                                                                |                                 | The maximum allowed value for number, range, date, and time inputs.&#xA;For number inputs, this should be a numeric value. For date/time inputs, use appropriate date formats.                                                                                 |                |
| `maxLength`               |         | `number \| undefined`                                                                                                          |                                 | The maximum number of characters allowed in text-based inputs.&#xA;Applies to input types: \`text\`, \`email\`, \`search\`, \`password\`, \`tel\`, \`url\`.                                                                                                    |                |
| `min`                     |         | `string \| number \| undefined`                                                                                                |                                 | The minimum allowed value for number, range, date, and time inputs.&#xA;For number inputs, this should be a numeric value. For date/time inputs, use appropriate date formats.                                                                                 |                |
| `minLength`               |         | `number \| undefined`                                                                                                          |                                 | The minimum number of characters required in text-based inputs.&#xA;Applies to input types: \`text\`, \`email\`, \`search\`, \`password\`, \`tel\`, \`url\`.                                                                                                   |                |
| `multiple`                |         | `boolean \| undefined`                                                                                                         |                                 | Allows multiple values to be entered. Currently only supported for email input type,&#xA;where users can enter multiple email addresses separated by commas.                                                                                                   |                |
| `name`                    |         | `string \| undefined`                                                                                                          |                                 | The name of the input control. This value is submitted with the form data and&#xA;should be unique within the form to identify this specific input.                                                                                                            |                |
| `label`                   |         | `string \| undefined`                                                                                                          |                                 | The text label displayed above or beside the input field.&#xA;Used for accessibility and to provide context about what the user should enter.                                                                                                                  |                |
| `pattern`                 |         | `string \| undefined`                                                                                                          |                                 | A regular expression pattern that the input value must match for validation.&#xA;Use standard regex syntax, e.g., \`"\[0-9]{3}-\[0-9]{2}-\[0-9]{4}"\` for SSN format.                                                                                          |                |
| `placeholder`             |         | `string`                                                                                                                       | `''`                            | Placeholder text that appears in the input when it's empty.&#xA;Provides a hint to the user about what type of information is expected.                                                                                                                        |                |
| `readOnly`                |         | `boolean`                                                                                                                      | `false`                         | When set to \`true\`, the input is read-only and cannot be modified by the user.&#xA;The input can still receive focus and its value will be submitted with the form.                                                                                          |                |
| `required`                |         | `boolean`                                                                                                                      | `false`                         | When set to \`true\`, the user must provide a value before the form can be submitted.&#xA;The input will show validation errors if left empty during form submission.                                                                                          |                |
| `rows`                    |         | `number`                                                                                                                       | `3`                             | The number of rows to display for a \`type="textarea"\` text field.&#xA;Defaults to 3.                                                                                                                                                                         |                |
| `cols`                    |         | `number`                                                                                                                       | `20`                            | The number of cols to display for a \`type="textarea"\` text field.&#xA;Defaults to 20.                                                                                                                                                                        |                |
| `spellcheck`              |         | `boolean`                                                                                                                      | `false`                         | Controls whether the browser should check spelling and grammar in the input.&#xA;Set to \`true\` to enable spell checking, or \`false\` to disable it.                                                                                                         |                |
| `step`                    |         | `string \| undefined`                                                                                                          |                                 | Defines the increment/decrement step for numeric inputs when using arrow buttons or arrow keys.&#xA;Set to \`"any"\` to allow decimal values, or specify a positive number for the step size.                                                                  |                |
| `type`                    |         | `'email' \| 'number' \| 'password' \| 'search' \| 'tel' \| 'text' \| 'url' \| 'textarea' \| undefined`                         | `'text'`                        | The type of input control to render. Determines the input behavior, validation, and appearance.&#xA;Common types: \`"text"\`, \`"email"\`, \`"password"\`, \`"number"\`, \`"tel"\`, \`"url"\`, \`"search"\`.                                                   |                |
| `value`                   |         | `string`                                                                                                                       | `''`                            | The current value of the input. This is the text that the user has entered&#xA;or that has been programmatically set. Changes to this property will update the input display.                                                                                  |                |
| `infoMessageText`         |         | `string \| undefined`                                                                                                          |                                 | Message to show below the field                                                                                                                                                                                                                                |                |
| `errorMessageText`        |         | `string \| undefined`                                                                                                          |                                 | Message to show below the field when it's invalid                                                                                                                                                                                                              |                |
| `invalid`                 |         | `boolean`                                                                                                                      | `false`                         |                                                                                                                                                                                                                                                                |                |
| `nativeValidationMessage` |         | `boolean`                                                                                                                      | `false`                         | When true, \`errorMessageText\` is used for the internal validity check, but the visual error message is handled by the browser's native validation UI.                                                                                                        |                |
| `count`                   |         |                                                                                                                                |                                 | The current character count of the input value.&#xA;The minlength and maxlength constraints are only checked on user-provided input. They are not checked if a value is set programmatically, even when explicitly calling checkValidity() or reportValidity() |                |
| `nativeControl`           |         |                                                                                                                                |                                 | The native input/textarea control element.                                                                                                                                                                                                                     |                |
| `touched`                 |         | `boolean`                                                                                                                      |                                 | Returns true if the user has interacted.&#xA;Interaction is detected through typing, key presses, or losing focus.                                                                                                                                             |                |
| `_messageTextEmpty`       |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_messageTextTpl`         |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_infoMessageTextTpl`     |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_errorMessageTextTpl`    |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_fieldTpl`               |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_labelTpl`               |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_inputOrTextareaTpl`     |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_textareaTpl`            |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |
| `_inputTpl`               |         |                                                                                                                                |                                 |                                                                                                                                                                                                                                                                |                |

##### Methods

| Name                   | Privacy | Description | Parameters          | Return | Inherited From |
| ---------------------- | ------- | ----------- | ------------------- | ------ | -------------- |
| `formDisabledCallback` |         |             | `disabled: boolean` |        |                |
| `formResetCallback`    |         |             |                     |        |                |

##### Attributes

| Name                        | Field                   | Inherited From |
| --------------------------- | ----------------------- | -------------- |
| `autocapitalize`            | autocapitalize          |                |
| `autocomplete`              | autocomplete            |                |
| `autocorrect`               | autocorrect             |                |
| `autofocus`                 | autofocus               |                |
| `disabled`                  | disabled                |                |
| `enterkeyhint`              | enterKeyHint            |                |
| `inputmode`                 | inputMode               |                |
| `max`                       | max                     |                |
| `maxlength`                 | maxLength               |                |
| `min`                       | min                     |                |
| `minlength`                 | minLength               |                |
| `multiple`                  | multiple                |                |
| `name`                      | name                    |                |
| `label`                     | label                   |                |
| `pattern`                   | pattern                 |                |
| `placeholder`               | placeholder             |                |
| `readonly`                  | readOnly                |                |
| `required`                  | required                |                |
| `rows`                      | rows                    |                |
| `cols`                      | cols                    |                |
| `spellcheck`                | spellcheck              |                |
| `step`                      | step                    |                |
| `type`                      | type                    |                |
| `value`                     | value                   |                |
| `info-message-text`         | infoMessageText         |                |
| `error-message-text`        | errorMessageText        |                |
| `invalid`                   | invalid                 |                |
| `native-validation-message` | nativeValidationMessage |                |

<details><summary>Private API</summary>

##### Methods

| Name                        | Privacy | Description                                                                                                                            | Parameters                 | Return | Inherited From |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------ | -------------- |
| `_markAsInteracted`         | private | Marks the input as having been interacted with by the user.&#xA;This is used internally to determine when to show validation messages. |                            |        |                |
| `_redispatchEvent`          | private |                                                                                                                                        | `ev: Event \| string`      |        |                |
| `_onKeydown`                | private |                                                                                                                                        | `ev: KeyboardEvent`        |        |                |
| `_onInput`                  | private |                                                                                                                                        | `{target}: Event`          |        |                |
| `_onChange`                 | private |                                                                                                                                        | `ev: Event \| string`      |        |                |
| `_checkValidityAndSetValue` | private |                                                                                                                                        | `value, connectedCallback` |        |                |

</details>

<hr/>

#### Exports

| Kind | Name       | Declaration | Module          | Package |
| ---- | ---------- | ----------- | --------------- | ------- |
| `js` | `BlkInput` | BlkInput    | src/BlkInput.ts |         |

### `src/index.ts`:

#### Exports

| Kind | Name       | Declaration | Module        | Package |
| ---- | ---------- | ----------- | ------------- | ------- |
| `js` | `BlkInput` | BlkInput    | ./BlkInput.js |         |

### `src/define/blk-input.ts`:

#### Exports

| Kind                        | Name        | Declaration | Module           | Package |
| --------------------------- | ----------- | ----------- | ---------------- | ------- |
| `custom-element-definition` | `blk-input` | BlkInput    | /src/BlkInput.js |         |

### `src/styles/blk-input-styles.css.ts`:

#### Variables

| Name     | Description | Type |
| -------- | ----------- | ---- |
| `styles` |             |      |

<hr/>

#### Exports

| Kind | Name     | Declaration | Module                             | Package |
| ---- | -------- | ----------- | ---------------------------------- | ------- |
| `js` | `styles` | styles      | src/styles/blk-input-styles.css.ts |         |
