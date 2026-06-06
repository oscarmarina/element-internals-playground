![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)

## `<blk-control>`

A custom element that wraps a native **checkbox** (default) or **radio**
(`type` attribute) rendered in the light DOM.

### Architecture
The native `<input>` lives in the light DOM so that:
- same-name radios discover each other and form a native radio group
  (impossible across shadow-root boundaries), and
- the browser owns form participation, validation, reset, and state restore.

The custom element does **not** participate in the form via ElementInternals.
It keeps `attachInternals()` only to expose custom states (`:state(checked)`,
`:state(indeterminate)`), proxies the constraint-validation API to the native
input as the single source of truth, and dispatches BlkFormValidationEvent.

### Type: `checkbox`
- Supports `indeterminate` state (`:state(indeterminate)`).

### Type: `radio`
- Same-name radios in the same form/tree form a native group.
- `required` validity is group-level (valid when any member is checked),
  provided natively by the browser.


### `src/BlkControl.ts`:

#### class: `BlkControl`, `blk-control`

##### Mixins

| Name                     | Module | Package                                            |
| ------------------------ | ------ | -------------------------------------------------- |
| `BlkMixinFormAssociated` |        | @blockquote-playground/blk-mixin-element-internals |

##### Fields

| Name                    | Privacy | Type                                  | Default      | Description                                                                                                                                                                                                                                                                                             | Inherited From |
| ----------------------- | ------- | ------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `__defaultInput`        |         | `HTMLInputElement \| undefined`       |              |                                                                                                                                                                                                                                                                                                         |                |
| `__root`                |         | `Document \| ShadowRoot \| undefined` |              |                                                                                                                                                                                                                                                                                                         |                |
| `__fromReset`           |         | `boolean`                             | `false`      |                                                                                                                                                                                                                                                                                                         |                |
| `__firstUpdateComplete` |         | `boolean`                             | `false`      |                                                                                                                                                                                                                                                                                                         |                |
| `type`                  |         | `BlkControlVariant`                   | `'checkbox'` | \`"checkbox"\` (default) or \`"radio"\`. Controls the native input type.                                                                                                                                                                                                                                |                |
| `name`                  |         | `string`                              | `''`         | Form field name. For radios this also defines the group scope.                                                                                                                                                                                                                                          |                |
| `value`                 |         | `string`                              | `'on'`       | Value submitted when this control is checked. Defaults to \`"on"\`.                                                                                                                                                                                                                                     |                |
| `checked`               |         | `boolean`                             | `false`      | Whether this control is currently selected/checked.                                                                                                                                                                                                                                                     |                |
| `disabled`              |         | `boolean`                             | `false`      | Whether the control is disabled.                                                                                                                                                                                                                                                                        |                |
| `required`              |         | `boolean`                             | `false`      | When \`true\`, the form cannot be submitted unless this control is checked.                                                                                                                                                                                                                             |                |
| `indeterminate`         |         | `boolean`                             | `false`      | (checkbox only) Puts the control into a \`mixed\` state.&#xA;Setting \`checked=true\` clears indeterminate.                                                                                                                                                                                             |                |
| `label`                 |         | `string \| undefined`                 |              | The text label displayed above or beside the input field.&#xA;Used for accessibility and to provide context about what the user should enter.                                                                                                                                                           |                |
| `idlabel`               |         | `string \| undefined`                 |              |                                                                                                                                                                                                                                                                                                         |                |
| `labelPosition`         |         | `BlkControlLabelPosition`             | `'end'`      | Position of the label text relative to the control: \`"end"\` (default — text&#xA;after the input) or \`"start"\` (text before the input). Purely visual: it is&#xA;applied via CSS (the slotted \`\<label>\` is reversed), so DOM order — and thus&#xA;accessibility/label association — is unchanged. |                |
| `invalid`               |         | `boolean`                             | `false`      | When true, the control is currently invalid based on the validation rules.                                                                                                                                                                                                                              |                |
| `__hasInteracted`       |         | `boolean`                             | `false`      |                                                                                                                                                                                                                                                                                                         |                |
| `touched`               |         | `boolean`                             |              | Returns true if the user has interacted with the control.                                                                                                                                                                                                                                               |                |
| `validity`              |         | `ValidityState`                       |              | The ValidityState of the native control. The native input is the single&#xA;source of truth for validation in this architecture.                                                                                                                                                                        |                |
| `validationMessage`     |         | `string`                              |              | The native control's validation message.                                                                                                                                                                                                                                                                |                |
| `willValidate`          |         | `boolean`                             |              | Whether the native control is a candidate for constraint validation.                                                                                                                                                                                                                                    |                |
| `nativeControl`         |         |                                       |              | The native control/input element backing this control.                                                                                                                                                                                                                                                  |                |
| `_inputTpl`             |         |                                       |              |                                                                                                                                                                                                                                                                                                         |                |
| `_labelTpl`             |         |                                       |              |                                                                                                                                                                                                                                                                                                         |                |
| `_lightDomTpl`          |         |                                       |              |                                                                                                                                                                                                                                                                                                         |                |

##### Methods

| Name                   | Privacy | Description                                                                                                                                                                                                                                                                                                                     | Parameters          | Return    | Inherited From |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------- | -------------- |
| `checkValidity`        |         | Checks the native control's constraints without surfacing UI.                                                                                                                                                                                                                                                                   |                     | `boolean` |                |
| `reportValidity`       |         | Checks the native control's constraints and surfaces native validation UI.                                                                                                                                                                                                                                                      |                     | `boolean` |                |
| `formDisabledCallback` |         | Invoked by the browser (FACE) when this element's disabled state changes due&#xA;to an ancestor \`\<fieldset disabled>\` being toggled — the only native "push"&#xA;for that change. We never call \`setFormValue\`/\`setValidity\`, so the host&#xA;stays out of submission; this is FACE used purely for lifecycle callbacks. | `disabled: boolean` |           |                |
| `_litHtmlRender`       |         |                                                                                                                                                                                                                                                                                                                                 |                     |           |                |

##### Events

| Name         | Type                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Inherited From |
| ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
|              | `BlkFormValidationEvent` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                |
| `change`     |                          | The native \`change\` from the light-DOM \`\<input>\`, which bubbles through the host (not re-dispatched). Its \`target\` is therefore the inner \`\<input>\`, not the host — intentional, to keep native radio-group propagation intact.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                |
| `validation` |                          | {@link BlkFormValidationEvent}, carrying the native input's current \`ValidityState\`. \*\*Contract (aligned with BlkInput):\*\* fires \*only\* when a validity-affecting property changes (\`required\`, \`checked\`, \`name\`, \`type\`). It does \*\*not\*\* fire on the initial render, on form reset, nor on the native \`invalid\` event (submit-time) — those paths only refresh custom states. ### Custom states (for styling) Exposed through \`ElementInternals.states\` because host pseudo-classes (\`:checked\`, \`:invalid\`, \`:disabled\`) are unavailable on a non–form-associated element. Match with the \`:state()\` selector on the host: - \`:state(checked)\`       — control is checked - \`:state(indeterminate)\` — (checkbox) mixed state - \`:state(invalid)\`       — native input currently fails constraint validation - \`:state(disabled)\`      — disabled directly or via an ancestor \`\<fieldset disabled>\` |                |

##### Attributes

| Name             | Field         | Inherited From |
| ---------------- | ------------- | -------------- |
| `type`           | type          |                |
| `name`           | name          |                |
| `value`          | value         |                |
| `checked`        | checked       |                |
| `disabled`       | disabled      |                |
| `required`       | required      |                |
| `indeterminate`  | indeterminate |                |
| `label`          | label         |                |
| `label-position` | labelPosition |                |
| `id-label`       | idlabel       |                |
| `invalid`        | invalid       |                |

<details><summary>Private API</summary>

##### Fields

| Name                 | Privacy | Type      | Default | Description                                                                                                                                                                                                                              | Inherited From |
| -------------------- | ------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `__fieldsetDisabled` | private | `boolean` | `false` | Reactive mirror of "disabled via an ancestor \`\<fieldset disabled>\`", kept in&#xA;sync by formDisabledCallback. The native input is already disabled by&#xA;the fieldset natively; this flag exists so the host can reflect the state. |                |
| `_onChange`          | private |           |         |                                                                                                                                                                                                                                          |                |
| `_onRootReset`       | private |           |         |                                                                                                                                                                                                                                          |                |

##### Methods

| Name                   | Privacy | Description                                                                                                                                                                                                                                                                                                                                                                                    | Parameters                    | Return | Inherited From |
| ---------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------ | -------------- |
| `_shouldSyncFormState` | private |                                                                                                                                                                                                                                                                                                                                                                                                | `props: PropertyValues<this>` |        |                |
| `_syncStates`          | private |                                                                                                                                                                                                                                                                                                                                                                                                |                               |        |                |
| `_syncFromNative`      | private | Mirror the native input's live state back onto the host.&#xA;Driven by the root \`change\`/\`reset\` listeners; setting \`checked\` triggers&#xA;\`updated()\`, which syncs custom states and dispatches the validation event.&#xA;The native \`change\` itself bubbles through the light-DOM child, so consumers&#xA;still receive a \`change\` event on the host without manual re-dispatch. |                               |        |                |
| `_onInvalid`           | private | Fired by the browser when the native control fails constraint validation&#xA;(e.g. on form submission). This does not change a reactive property, so we&#xA;refresh custom states here. Per the locked contract it does NOT emit a&#xA;\`validation\` event (mirrors BlkInput, which only flips its invalid state).                                                                            |                               |        |                |
| `_onFocus`             | private |                                                                                                                                                                                                                                                                                                                                                                                                |                               |        |                |
| `_onBlur`              | private |                                                                                                                                                                                                                                                                                                                                                                                                |                               |        |                |

</details>

<hr/>

#### Exports

| Kind | Name         | Declaration | Module            | Package |
| ---- | ------------ | ----------- | ----------------- | ------- |
| `js` | `BlkControl` | BlkControl  | src/BlkControl.ts |         |

![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)

## `<blk-control-ssr>`

SSR-friendly, **declarative** sibling of `<blk-control>`.

`<blk-control>` renders its own `<input>` imperatively into the light DOM, which is not
SSR-safe. This variant instead **does not create the control**: the author (or the
server) provides a native `<input type="checkbox|radio">` and a `<label>` as slotted
light-DOM children, and the component *enhances* them.

### Why JS still mirrors state (and why it isn't pure `:has()` CSS)
The visual indicator lives in the shadow DOM, while `:checked`/`:disabled`/… live on the
light-DOM `<input>`. The only CSS bridge would be `:host(:has(input:checked))`, but
`:has()` inside `:host()` is **not honoured as a style selector** in current engines
(it matches in `element.matches()` yet the rule is dropped). So this component mirrors
the native input's state into `ElementInternals.states` and styles with
`:host(:state(...))` + `::slotted()` — both well supported. The invalid state is gated by
a "touched" flag (set on input/blur/invalid/change), matching `<blk-control>` and working
under the `novalidate` + manual `checkValidity()` flow where `:user-invalid` is unreliable.

The native `<input>` keeps full ownership of submission, validation, reset, state
restore, radio-group discovery, disabled-by-`<fieldset>` and a11y semantics. The host is
form-associated **only** for the `formDisabledCallback` lifecycle hook — it never calls
`setFormValue`/`setValidity`, so it adds nothing to the form's data (no double submit).

### Canonical markup
`<input>` and `<label>` are **separate, direct slotted children** (so `::slotted(input)`
/ `::slotted(label)` can reach them), associated natively with `for`/`id`:

```html
<blk-control-ssr>
  <input slot="embedded" id="terms" type="checkbox" name="terms" value="yes" required />
  <label slot="embedded" for="terms">I accept the terms</label>
</blk-control-ssr>
```


### `src/BlkControlSSR.ts`:

#### class: `BlkControlSSR`, `blk-control-ssr`

##### Mixins

| Name                     | Module | Package                                            |
| ------------------------ | ------ | -------------------------------------------------- |
| `BlkMixinFormAssociated` |        | @blockquote-playground/blk-mixin-element-internals |

##### Fields

| Name                | Privacy | Type                                  | Default | Description                                                                                                                                               | Inherited From |
| ------------------- | ------- | ------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `__defaultInput`    |         | `HTMLInputElement \| null`            | `null`  | The native control backing this element (acquired from the slot).                                                                                         |                |
| `__root`            |         | `Document \| ShadowRoot \| undefined` |         |                                                                                                                                                           |                |
| `__hasInteracted`   |         | `boolean`                             | `false` | "Touched" gate so errors show only after interaction / a submit attempt.                                                                                  |                |
| `labelPosition`     |         | `BlkControlSSRLabelPosition`          | `'end'` | Visual placement of the label relative to the control: \`"end"\` (default) or&#xA;\`"start"\`. CSS-only — DOM order (and label association) is unchanged. |                |
| `nativeControl`     |         | `HTMLInputElement \| null`            |         |                                                                                                                                                           |                |
| `validity`          |         | `ValidityState`                       |         |                                                                                                                                                           |                |
| `validationMessage` |         | `string`                              |         |                                                                                                                                                           |                |
| `willValidate`      |         | `boolean`                             |         |                                                                                                                                                           |                |
| `checked`           |         | `boolean`                             |         |                                                                                                                                                           |                |
| `indeterminate`     |         | `boolean`                             |         |                                                                                                                                                           |                |
| `value`             |         | `string`                              |         |                                                                                                                                                           |                |
| `name`              |         | `string`                              |         |                                                                                                                                                           |                |
| `type`              |         | `string`                              |         |                                                                                                                                                           |                |
| `required`          |         | `boolean`                             |         |                                                                                                                                                           |                |
| `disabled`          |         | `boolean`                             |         |                                                                                                                                                           |                |

##### Methods

| Name                   | Privacy | Description                                                             | Parameters | Return    | Inherited From |
| ---------------------- | ------- | ----------------------------------------------------------------------- | ---------- | --------- | -------------- |
| `checkValidity`        |         |                                                                         |            | `boolean` |                |
| `reportValidity`       |         |                                                                         |            | `boolean` |                |
| `formDisabledCallback` |         | Fired by the browser when an ancestor \`\<fieldset disabled>\` toggles. |            |           |                |

##### Events

| Name         | Type | Description                                                                                                                                                                                                                      | Inherited From |
| ------------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `validation` |      | {@link BlkFormValidationEvent} on the native input's \`change\` (for radios, also on the sibling the browser deselects) and on a programmatic \`checked\` change. Not on initial render, reset, or the native \`invalid\` event. |                |

##### Attributes

| Name             | Field         | Inherited From |
| ---------------- | ------------- | -------------- |
| `label-position` | labelPosition |                |

<details><summary>Private API</summary>

##### Fields

| Name            | Privacy | Type | Default | Description | Inherited From |
| --------------- | ------- | ---- | ------- | ----------- | -------------- |
| `_onSlotChange` | private |      |         |             |                |
| `_onInputEvent` | private |      |         |             |                |
| `_onRootChange` | private |      |         |             |                |
| `_onRootReset`  | private |      |         |             |                |

##### Methods

| Name           | Privacy | Description                                                                                                                                                                                                                                | Parameters                        | Return | Inherited From |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------ | -------------- |
| `_adoptInput`  | private |                                                                                                                                                                                                                                            | `input: HTMLInputElement \| null` |        |                |
| `_detachInput` | private |                                                                                                                                                                                                                                            |                                   |        |                |
| `_syncStates`  | private | Mirror the native input's live state into custom states for shadow-DOM styling.&#xA;\`invalid\` is sourced from the native \`:user-invalid\`, so the "touched" behaviour&#xA;(only flag after interaction/submit) comes from the platform. |                                   |        |                |

</details>

<hr/>

#### Exports

| Kind | Name            | Declaration   | Module               | Package |
| ---- | --------------- | ------------- | -------------------- | ------- |
| `js` | `BlkControlSSR` | BlkControlSSR | src/BlkControlSSR.ts |         |

### `src/index.ts`:

#### Exports

| Kind | Name         | Declaration | Module          | Package |
| ---- | ------------ | ----------- | --------------- | ------- |
| `js` | `BlkControl` | BlkControl  | ./BlkControl.js |         |

### `src/define/blk-control.ts`:

#### Exports

| Kind                        | Name              | Declaration   | Module                | Package |
| --------------------------- | ----------------- | ------------- | --------------------- | ------- |
| `custom-element-definition` | `blk-control`     | BlkControl    | /src/BlkControl.js    |         |
| `custom-element-definition` | `blk-control-ssr` | BlkControlSSR | /src/BlkControlSSR.js |         |

### `src/styles/blk-control-styles.css.ts`:

#### Variables

| Name     | Description | Type |
| -------- | ----------- | ---- |
| `styles` |             |      |

<hr/>

#### Exports

| Kind | Name     | Declaration | Module                               | Package |
| ---- | -------- | ----------- | ------------------------------------ | ------- |
| `js` | `styles` | styles      | src/styles/blk-control-styles.css.ts |         |
