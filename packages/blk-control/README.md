![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)

## `<blk-control>`

A custom element that wraps a native **checkbox** (default) or **radio**
(`type` attribute) rendered in the light DOM.

### Architecture
The native `<input>` lives in the light DOM so that:
- same-name radios discover each other and form a native radio group
  (impossible across shadow-root boundaries), and
- the browser owns form participation, validation, reset, and state restore.

The custom element is form-associated only for its lifecycle callbacks
(`formResetCallback`, `formDisabledCallback`): it never calls `setFormValue` /
`setValidity`, so it submits nothing. It exposes custom states (`:state(checked)`,
`:state(indeterminate)`…), proxies the constraint-validation API to the native
input as the single source of truth, and dispatches BlkFormValidationEvent.

### Type: `checkbox`
- Supports `indeterminate` state (`:state(indeterminate)`).

### Type: `radio`
- Same-name radios in the same form/tree form a native group.
- `required` validity is group-level (valid when any member is checked),
  provided natively by the browser.

### When errors are shown
Same policy as `blk-input`, adapted to a control whose every `change` is already a
committed choice (there is no typing to wait for):

> A control that has already shown its error re-validates on every change that can
> affect it, until it is reset.

- **Before the first error** nothing is shown on first render, nor for a `checked` or
  a constraint set by script. The first error comes from the user's own `change`
  (e.g. unchecking a required checkbox) or from an `invalid` event — usually a
  submission attempt, but `checkValidity()` and `reportValidity()` count the same.
- **After it**, `invalid` follows the native validity: checking or unchecking by
  script, toggling `required`, or enabling the control again brings the error back
  or clears it at once.
- **A form reset starts over.**
- **`invalid` is only ever `true` while the native control fails validation.** Set on
  a valid control (by script or as an attribute) it is cleared on that same update:
  there is no error text to explain it, and the form would submit anyway. To show an
  error decided elsewhere (e.g. by a server), make the native control fail with
  `nativeControl.setCustomValidity('…')` and set `invalid`; it stays until the custom
  validity is cleared. To lift it when the user changes the control, clear only the
  custom validity (`setCustomValidity('')`) in your `change` listener: the component
  re-validates right after and drops `invalid` by itself.
- **Do not set properties of this element from a `change` listener.** The component
  syncs from the native input at the end of that event; a property set before that
  renders with the previous `checked` and undoes the user's click.

This is the component's own policy, modelled on the native `:user-invalid` without
reading it or trying to replicate it.

### Your own error message
The component has no error text: the page renders it and shows it with
`blk-control:state(invalid) + .error`. Pass its `id` in `error-message-id` and the
native input points at it with `aria-errormessage` while the error is shown, so a
screen reader can read the reason again from the control, not only when it appears:

```html
<blk-control name="terms" required label="I accept" error-message-id="terms-error">
</blk-control>
<div class="error" role="alert" id="terms-error">You must accept the terms.</div>
```

The message must live in the same tree as the host (the input is in its light DOM).
For a group — required radios, or "at least one" of several checkboxes — the error
belongs to the group: link it from your own container (`role="radiogroup"`,
`<fieldset>`) instead.


### `src/BlkControl.ts`:

#### class: `BlkControl`, `blk-control`

##### Mixins

| Name                     | Module | Package                                            |
| ------------------------ | ------ | -------------------------------------------------- |
| `BlkMixinFormAssociated` |        | @blockquote-playground/blk-mixin-element-internals |

##### Fields

| Name                | Privacy | Type                      | Default      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Inherited From |
| ------------------- | ------- | ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `type`              |         | `BlkControlVariant`       | `'checkbox'` | \`"checkbox"\` (default) or \`"radio"\`. Controls the native input type.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |
| `name`              |         | `string`                  | `''`         | Form field name. For radios this also defines the group scope.&#xA;&#xA;Note: the host is form-associated (for lifecycle callbacks), so with a \`name\`&#xA;attribute \`form.elements.namedItem(name)\` returns a \`RadioNodeList\` holding the&#xA;host \*and\* the native input. Use nativeControl or \`FormData\` instead.                                                                                                                                                                                                  |                |
| `value`             |         | `string`                  | `'on'`       | Value submitted when this control is checked. Defaults to \`"on"\`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                |
| `checked`           |         | `boolean`                 | `false`      | Whether this control is currently selected/checked.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                |
| `disabled`          |         | `boolean`                 | `false`      | Whether the control is disabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |                |
| `required`          |         | `boolean`                 | `false`      | When \`true\`, the form cannot be submitted unless this control is checked.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                |
| `indeterminate`     |         | `boolean`                 | `false`      | (checkbox only) Puts the control into a \`mixed\` state. Like the native property,&#xA;it is independent of \`checked\`: only a user toggle clears it.                                                                                                                                                                                                                                                                                                                                                                         |                |
| `label`             |         | `string \| undefined`     |              | The text label displayed above or beside the input field.&#xA;Used for accessibility and to provide context about what the user should enter.                                                                                                                                                                                                                                                                                                                                                                                  |                |
| `idlabel`           |         | `string \| undefined`     |              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                |
| `labelPosition`     |         | `BlkControlLabelPosition` | `'end'`      | Position of the label text relative to the control: \`"end"\` (default — text&#xA;after the input) or \`"start"\` (text before the input). Purely visual: it is&#xA;applied via CSS (the slotted \`\<label>\` is reversed), so DOM order — and thus&#xA;accessibility/label association — is unchanged.                                                                                                                                                                                                                        |                |
| `errorMessageId`    |         | `string \| undefined`     |              | The \`id\` of an element in the page that holds this control's error message. While&#xA;\`invalid\` is true the native input references it with \`aria-errormessage\`; it is&#xA;not rendered otherwise. The element must be in the same tree as the host.                                                                                                                                                                                                                                                                     |                |
| `invalid`           |         | `boolean`                 | `false`      | Whether the component is showing its invalid state (\`:state(invalid)\`,&#xA;\`aria-invalid="true"\`). It is not the native constraint validation result — read&#xA;\`validity\` for that: a control can fail validation while \`invalid\` is still \`false\`,&#xA;until the policy in "When errors are shown" lets the error through. The reverse&#xA;never holds: on a control that passes validation it is cleared on the next update.&#xA;For an error decided elsewhere, use \`nativeControl.setCustomValidity()\` first. |                |
| `touched`           |         | `boolean`                 |              | Returns true if the user has interacted with the control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                |
| `validity`          |         | `ValidityState`           |              | The ValidityState of the native control. The native input is the single&#xA;source of truth for validation in this architecture.                                                                                                                                                                                                                                                                                                                                                                                               |                |
| `validationMessage` |         | `string`                  |              | The native control's validation message.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |
| `willValidate`      |         | `boolean`                 |              | Whether the native control is a candidate for constraint validation.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |                |
| `nativeControl`     |         |                           |              | The native control/input element backing this control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                |
| `_inputTpl`         |         |                           |              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                |
| `_labelTpl`         |         |                           |              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                |
| `_lightDomTpl`      |         |                           |              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                |

##### Methods

| Name                   | Privacy | Description                                                                                                                                                                                                                                                                                                                                                                                                | Parameters | Return    | Inherited From |
| ---------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | -------------- |
| `checkValidity`        |         | Checks the native control's constraints without surfacing UI.                                                                                                                                                                                                                                                                                                                                              |            | `boolean` |                |
| `reportValidity`       |         | Checks the native control's constraints and surfaces native validation UI.                                                                                                                                                                                                                                                                                                                                 |            | `boolean` |                |
| `formDisabledCallback` |         | Invoked by the browser (FACE) when this element's disabled state changes due&#xA;to an ancestor \`\<fieldset disabled>\` being toggled — the only native "push"&#xA;for that change. We never call \`setFormValue\`/\`setValidity\`, so the host&#xA;stays out of submission; this is FACE used purely for lifecycle callbacks.                                                                            |            |           |                |
| `formResetCallback`    |         | Called by the browser (FACE) after all form controls have been reset to&#xA;their default values — so \`this.\_\_defaultInput.checked\` already reflects the&#xA;restored state. We read it synchronously (no microtask needed), flag the&#xA;update as reset-driven so \`updated()\` suppresses the \`validation\` event,&#xA;and let \`\_syncFromNative()\` propagate the change to the host properties. |            |           |                |

##### Events

| Name         | Type                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Inherited From |
| ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
|              | `BlkFormValidationEvent` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                |
| `change`     |                          | The native \`change\` from the light-DOM \`\<input>\`, which bubbles through the host (not re-dispatched). Its \`target\` is therefore the inner \`\<input>\`, not the host — intentional, to keep native radio-group propagation intact.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                |
| `validation` |                          | {@link BlkFormValidationEvent}, carrying the native input's current \`ValidityState\`. \*\*Contract (aligned with BlkInput):\*\* fires \*only\* when a validity-affecting property changes (\`required\`, \`checked\`, \`name\`, \`type\`). It does \*\*not\*\* fire on the initial render, on form reset, nor on the native \`invalid\` event (submit-time) — those paths only refresh custom states. ### Custom states (for styling) Exposed through \`ElementInternals.states\` because the host submits no value and sets no validity, so \`:checked\` / \`:invalid\` never match it. Match with the \`:state()\` selector on the host: - \`:state(checked)\`       — control is checked - \`:state(indeterminate)\` — (checkbox) mixed state - \`:state(invalid)\`       — native input currently fails constraint validation - \`:state(disabled)\`      — disabled directly or via an ancestor \`\<fieldset disabled>\` |                |

##### Attributes

| Name               | Field          | Inherited From |
| ------------------ | -------------- | -------------- |
| `type`             | type           |                |
| `name`             | name           |                |
| `value`            | value          |                |
| `checked`          | checked        |                |
| `disabled`         | disabled       |                |
| `required`         | required       |                |
| `indeterminate`    | indeterminate  |                |
| `label`            | label          |                |
| `label-position`   | labelPosition  |                |
| `error-message-id` | errorMessageId |                |
| `id-label`         | idlabel        |                |
| `invalid`          | invalid        |                |

<details><summary>Private API</summary>

##### Fields

| Name                    | Privacy | Type                                  | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Inherited From |
| ----------------------- | ------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `__defaultInput`        | private | `HTMLInputElement \| undefined`       |         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |
| `__root`                | private | `Document \| ShadowRoot \| undefined` |         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |
| `__fromReset`           | private | `boolean`                             | `false` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |
| `__firstUpdateComplete` | private | `boolean`                             | `false` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |
| `__fieldsetDisabled`    | private | `boolean`                             | `false` | Reactive mirror of "disabled via an ancestor \`\<fieldset disabled>\`", kept in&#xA;sync by formDisabledCallback. The native input is already disabled by&#xA;the fieldset natively; this flag exists so the host can reflect the state.                                                                                                                                                                                                                                                                                              |                |
| `__hasInteracted`       | private | `boolean`                             | `false` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |
| `__hasReportedError`    | private | `boolean`                             | `false` | The component has already shown this control's error (an invalid \`change\` by the&#xA;user, or an \`invalid\` event); cleared on reset. From then on \`invalid\` follows the&#xA;native validity on every update (see \`updated()\`), script and constraint changes&#xA;included.                                                                                                                                                                                                                                                    |                |
| `_inputRef`             | private |                                       |         | Stable callback: a new arrow per render makes Lit call the old one with \`undefined\`&#xA;and the new one with the element on every update, and can leave \`\_\_defaultInput\`&#xA;pointing at a disconnected input when the label template switches.&#xA;&#xA;In the template, \`.defaultChecked\` must stay \*before\* \`.checked\`: on a fresh input&#xA;(label added/removed) \`live()\` skips an unchanged \`checked=false\`, and a later&#xA;\`defaultChecked=true\` would then check the still-pristine input behind our back. |                |
| `_syncFromNative`       | private |                                       |         | Mirror the native input's live state back onto the host.&#xA;Driven by the root \`change\`/\`reset\` listeners; setting \`checked\` triggers&#xA;\`updated()\`, which syncs custom states and dispatches the validation event.&#xA;The native \`change\` itself bubbles through the light-DOM child, so consumers&#xA;still receive a \`change\` event on the host without manual re-dispatch.                                                                                                                                        |                |
| `_onChange`             | private |                                       |         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                |

##### Methods

| Name                   | Privacy | Description                                                                                                                                                                                                                                                                                                         | Parameters                    | Return | Inherited From |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------ | -------------- |
| `_shouldSyncFormState` | private |                                                                                                                                                                                                                                                                                                                     | `props: PropertyValues<this>` |        |                |
| `_syncStates`          | private |                                                                                                                                                                                                                                                                                                                     |                               |        |                |
| `_validate`            | private | Shows or clears the error from the native validity, and remembers having shown it.                                                                                                                                                                                                                                  |                               |        |                |
| `_onInvalid`           | private | Fired by the browser when the native control fails constraint validation&#xA;(e.g. on form submission). This does not change a reactive property, so we&#xA;refresh custom states here. Per the locked contract it does NOT emit a&#xA;\`validation\` event (mirrors BlkInput, which only flips its invalid state). |                               |        |                |
| `_onFocus`             | private |                                                                                                                                                                                                                                                                                                                     |                               |        |                |
| `_onBlur`              | private |                                                                                                                                                                                                                                                                                                                     |                               |        |                |

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
`:host(:state(...))` + `::slotted()` — both well supported.

### When errors are shown
Same policy as `<blk-control>` and `<blk-input>`; here "the error" is `:state(invalid)`
(there is no `invalid` property: the native input is the only source of truth).

> A control that has already shown its error re-validates on every change the
> component can see, until it is reset.

- **Before the first error** nothing is shown on first render, on tab-through, nor for
  a `checked` set by script. The first error comes from the user's own `change` (e.g.
  unchecking a required checkbox) or from an `invalid` event — usually a submission
  attempt, but `checkValidity()` and `reportValidity()` count the same, which is what
  makes the `novalidate` + manual `checkValidity()` flow work.
- **After it**, `:state(invalid)` follows the native validity each time the states are
  synced: a `change`, the host's `checked`/`indeterminate` setters, focus and blur.
- **A form reset starts over.**

It is the component's own policy, modelled on the native `:user-invalid` without reading
it. One limit comes from not owning the input: attributes changed directly on it
(`required`, `disabled`, `checked`) are not observed, so the state catches up on the
next sync.

The component also keeps an explicit `aria-invalid` on the adopted input, mirroring
`:state(invalid)`, so a required, unchecked control is not exposed as invalid before any
interaction. That needs JS: to cover the time before the element upgrades, render
`aria-invalid="false"` on the input from the server.

The native `<input>` keeps full ownership of submission, validation, reset, state
restore, radio-group discovery, disabled-by-`<fieldset>` and a11y semantics. The host is
form-associated **only** for the `formDisabledCallback` lifecycle hook — it never calls
`setFormValue`/`setValidity`, so it adds nothing to the form's data (no double submit).

### Canonical markup
`<input>` and `<label>` are **separate, direct slotted children** (so `::slotted(input)`
/ `::slotted(label)` can reach them), associated natively with `for`/`id`:

```html
<blk-control-ssr>
  <input
    slot="embedded"
    aria-invalid="false"
    id="terms"
    type="checkbox"
    name="terms"
    value="yes"
    required />
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

| Name                | Privacy | Type                         | Default | Description                                                                                                                                               | Inherited From |
| ------------------- | ------- | ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `labelPosition`     |         | `BlkControlSSRLabelPosition` | `'end'` | Visual placement of the label relative to the control: \`"end"\` (default) or&#xA;\`"start"\`. CSS-only — DOM order (and label association) is unchanged. |                |
| `nativeControl`     |         | `HTMLInputElement \| null`   |         |                                                                                                                                                           |                |
| `validity`          |         | `ValidityState`              |         |                                                                                                                                                           |                |
| `validationMessage` |         | `string`                     |         |                                                                                                                                                           |                |
| `willValidate`      |         | `boolean`                    |         |                                                                                                                                                           |                |
| `checked`           |         | `boolean`                    |         |                                                                                                                                                           |                |
| `indeterminate`     |         | `boolean`                    |         |                                                                                                                                                           |                |
| `value`             |         | `string`                     |         |                                                                                                                                                           |                |
| `name`              |         | `string`                     |         |                                                                                                                                                           |                |
| `type`              |         | `string`                     |         |                                                                                                                                                           |                |
| `required`          |         | `boolean`                    |         |                                                                                                                                                           |                |
| `disabled`          |         | `boolean`                    |         |                                                                                                                                                           |                |

##### Methods

| Name                   | Privacy | Description                                                                                                                                                                                                                         | Parameters | Return    | Inherited From |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | -------------- |
| `checkValidity`        |         |                                                                                                                                                                                                                                     |            | `boolean` |                |
| `reportValidity`       |         |                                                                                                                                                                                                                                     |            | `boolean` |                |
| `formDisabledCallback` |         | Fired by the browser when an ancestor \`\<fieldset disabled>\` toggles.                                                                                                                                                             |            |           |                |
| `formResetCallback`    |         | Called by the browser (FACE) after all form controls are restored to their&#xA;default values. The native input's state is already correct at this point,&#xA;so we forget any reported error and sync custom states synchronously. |            |           |                |

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

| Name                     | Privacy | Type                                  | Default | Description                                                                                                                                                                                                                                       | Inherited From |
| ------------------------ | ------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `__defaultInput`         | private | `HTMLInputElement \| null`            | `null`  | The native control backing this element (acquired from the slot).                                                                                                                                                                                 |                |
| `__root`                 | private | `Document \| ShadowRoot \| undefined` |         |                                                                                                                                                                                                                                                   |                |
| `__hasReportedError`     | private | `boolean`                             | `false` | The component has already shown this control's error (an invalid \`change\` by the&#xA;user, or an \`invalid\` event); cleared on reset. Until then \`:state(invalid)\` stays&#xA;off; from then on it follows the native validity on every sync. |                |
| `_onSlotChange`          | private |                                       |         |                                                                                                                                                                                                                                                   |                |
| `_onGroupSiblingChecked` | private |                                       |         | A group sibling was checked from script, which unchecked this input silently.                                                                                                                                                                     |                |
| `_onInputEvent`          | private |                                       |         |                                                                                                                                                                                                                                                   |                |
| `_onRootChange`          | private |                                       |         |                                                                                                                                                                                                                                                   |                |
| `_isFailing`             | private |                                       |         | Failing constraint validation. A disabled control is barred from it, so never fails.                                                                                                                                                              |                |

##### Methods

| Name             | Privacy | Description                                                                                                                                                                                                                                                                                                                                                                                                                                            | Parameters                        | Return | Inherited From |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------ | -------------- |
| `_adoptInput`    | private |                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `input: HTMLInputElement \| null` |        |                |
| `_listenToInput` | private | Listen for the state-affecting events that don't surface as a bubbling \`change\` on&#xA;the root. Safe to call repeatedly: the same listener is never added twice.                                                                                                                                                                                                                                                                                    |                                   |        |                |
| `_detachInput`   | private |                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                   |        |                |
| `_syncStates`    | private | Mirror the native input's live state into custom states for shadow-DOM styling.&#xA;\`invalid\` is gated by \`\_\_hasReportedError\`, not by \`:user-invalid\`, which is unreliable&#xA;under \`novalidate\` + manual \`checkValidity()\`. The same value goes to an explicit&#xA;\`aria-invalid\` on the input: without it, browsers expose a required, unchecked control&#xA;as invalid from the first render (see the same note in \`BlkControl\`). |                                   |        |                |

</details>

<hr/>

#### Exports

| Kind | Name            | Declaration   | Module               | Package |
| ---- | --------------- | ------------- | -------------------- | ------- |
| `js` | `BlkControlSSR` | BlkControlSSR | src/BlkControlSSR.ts |         |

### `src/index.ts`:

#### Exports

| Kind | Name            | Declaration   | Module             | Package |
| ---- | --------------- | ------------- | ------------------ | ------- |
| `js` | `BlkControl`    | BlkControl    | ./BlkControl.js    |         |
| `js` | `BlkControlSSR` | BlkControlSSR | ./BlkControlSSR.js |         |

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
