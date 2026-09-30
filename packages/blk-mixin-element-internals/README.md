### `src/BlkFormValidationEvent.ts`:

#### class: `BlkFormValidationEvent`

##### Fields

| Name             | Privacy | Type            | Default          | Description | Inherited From |
| ---------------- | ------- | --------------- | ---------------- | ----------- | -------------- |
| `valid`          |         | `boolean`       |                  |             |                |
| `validityResult` |         | `ValidityState` | `validityResult` |             |                |

<hr/>

#### Exports

| Kind | Name                     | Declaration            | Module                        | Package |
| ---- | ------------------------ | ---------------------- | ----------------------------- | ------- |
| `js` | `BlkFormValidationEvent` | BlkFormValidationEvent | src/BlkFormValidationEvent.ts |         |

### `src/BlkMixinElementInternals.ts`:

#### mixin: `BlkMixinElementInternals`

##### Mixins

| Name                    | Module                        | Package               |
| ----------------------- | ----------------------------- | --------------------- |
| `BlkMixinInternalsBase` | /src/BlkMixinInternalsBase.js |                       |
| `dedupeMixin`           |                               | @open-wc/dedupe-mixin |

##### Parameters

| Name   | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `Base` | `T`  |         |             |

##### Static Fields

| Name                 | Privacy | Type                                      | Default | Description | Inherited From        |
| -------------------- | ------- | ----------------------------------------- | ------- | ----------- | --------------------- |
| `internalsBehaviors` |         | `readonly BehaviorCreator[] \| undefined` |         |             | BlkMixinInternalsBase |

##### Fields

| Name          | Privacy | Type                 | Default | Description                                                     | Inherited From        |
| ------------- | ------- | -------------------- | ------- | --------------------------------------------------------------- | --------------------- |
| `internals`   |         | `ElementInternals`   |         | Exposes the ElementInternals instance attached to this element. |                       |
| `[internals]` |         | `ElementInternals`   |         |                                                                 | BlkMixinInternalsBase |
| `[behaviors]` |         | `readonly unknown[]` | `[]`    |                                                                 | BlkMixinInternalsBase |
|               |         |                      |         |                                                                 | BlkMixinInternalsBase |

##### Methods

| Name              | Privacy | Description                                                                                                                                                                                                                                       | Parameters                        | Return                            | Inherited From        |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------- | --------------------- |
| `createBehaviors` |         |                                                                                                                                                                                                                                                   |                                   | `readonly unknown[] \| undefined` | BlkMixinInternalsBase |
| `getBehavior`     |         | Returns the attached behavior created by \`ctor\`, typed as its instance, or&#xA;\`undefined\` if none was created (e.g. the browser lacks that behavior).&#xA;Looks it up by type, so it does not depend on the order of \`internalsBehaviors\`. | `ctor: new (...args: any[]) => B` | `B \| undefined`                  | BlkMixinInternalsBase |

<details><summary>Private API</summary>

##### Methods

| Name                           | Privacy   | Description | Parameters | Return             | Inherited From        |
| ------------------------------ | --------- | ----------- | ---------- | ------------------ | --------------------- |
| `attachInternalsWithBehaviors` | protected |             |            | `ElementInternals` | BlkMixinInternalsBase |

</details>

<hr/>

#### Exports

| Kind | Name                       | Declaration              | Module                          | Package |
| ---- | -------------------------- | ------------------------ | ------------------------------- | ------- |
| `js` | `BlkMixinElementInternals` | BlkMixinElementInternals | src/BlkMixinElementInternals.ts |         |

### `src/BlkMixinFormAssociated.ts`:

#### mixin: `BlkMixinFormAssociated`

##### Mixins

| Name                    | Module                        | Package               |
| ----------------------- | ----------------------------- | --------------------- |
| `BlkMixinInternalsBase` | /src/BlkMixinInternalsBase.js |                       |
| `dedupeMixin`           |                               | @open-wc/dedupe-mixin |

##### Parameters

| Name   | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `Base` | `T`  |         |             |

##### Static Fields

| Name                 | Privacy | Type                                      | Default | Description | Inherited From        |
| -------------------- | ------- | ----------------------------------------- | ------- | ----------- | --------------------- |
| `formAssociated`     |         | `boolean`                                 | `true`  |             |                       |
| `internalsBehaviors` |         | `readonly BehaviorCreator[] \| undefined` |         |             | BlkMixinInternalsBase |

##### Fields

| Name                 | Privacy | Type                 | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Inherited From        |
| -------------------- | ------- | -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `form`               |         |                      |         | The form read-only property of the ElementInternals interface returns the HTMLFormElement associated with this element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |                       |
| `labels`             |         |                      |         | The labels read-only property of the ElementInternals interface returns the labels associated with the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                       |
| `labelText`          |         | `string`             |         | Resolves the accessible name to forward onto the inner native control,&#xA;mirroring how a native \`\<input>\` resolves its name. Precedence:&#xA;1\. The author-set \`aria-label\` content attribute on the host (overrides the&#xA;   visible label, exactly like a native \`\<input aria-label>\`).&#xA;2\. The \`ElementInternals.ariaLabel\` default semantic set by the component.&#xA;3\. The text of any associated \`\<label>\` elements (\`for\`/\`id\`) — skipped when the&#xA;   shadow root has a \`referenceTarget\`: the platform then forwards those labels&#xA;   to the target natively, and copying them would duplicate (or, on first render,&#xA;   before the target exists, freeze) the name.&#xA;&#xA;A best-attempt based on observed behaviour in FireFox 115 on fedora 38. |                       |
| `hasReferenceTarget` |         | `boolean`            |         | Whether the shadow root forwards IDREF references to an inner element&#xA;(experimental \`referenceTarget\`). Always \`false\` where unsupported.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                       |
| `internalsRole`      |         | `string \| null`     |         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                       |
| `shadowRoot`         |         |                      |         | The shadowRoot read-only property of the ElementInternals interface returns the ShadowRoot for this element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                       |
| `states`             |         |                      |         | The states read-only property of the ElementInternals interface returns a CustomStateSet representing the possible states of the custom element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                       |
| `isDisabled`         |         |                      |         | Returns whether the host element is currently disabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |                       |
| `isFieldsetDisabled` |         |                      |         | Returns whether the host is disabled by an ancestor \`\<fieldset disabled>\`,&#xA;regardless of its own \`disabled\` attribute (elements inside the fieldset's first&#xA;\`\<legend>\` are not disabled by it).&#xA;&#xA;Unlike the combined value passed to \`formDisabledCallback()\`, this can be&#xA;recomputed at any time — e.g. in \`willUpdate()\` when the host's own \`disabled\`&#xA;changes, a case where the callback does not fire if the combined state is unchanged.                                                                                                                                                                                                                                                                                                                  |                       |
| `isReadOnly`         |         |                      |         | Returns whether the host element is currently read-only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                       |
| `internals`          |         | `ElementInternals`   |         | Exposes the ElementInternals instance attached to this element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                       |
| `validationMessage`  |         |                      |         | The validationMessage read-only property of the ElementInternals interface returns the validation message for the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                       |
| `validity`           |         |                      |         | The validity read-only property of the ElementInternals interface returns a ValidityState object which represents the different validity states the element can be in, with respect to constraint validation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                       |
| `willValidate`       |         |                      |         | The willValidate read-only property of the ElementInternals interface returns true if the element is a submittable element that is a candidate for constraint validation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                       |
| `[internals]`        |         | `ElementInternals`   |         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | BlkMixinInternalsBase |
| `[behaviors]`        |         | `readonly unknown[]` | `[]`    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | BlkMixinInternalsBase |
|                      |         |                      |         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | BlkMixinInternalsBase |

##### Methods

| Name              | Privacy | Description                                                                                                                                                                                                                                       | Parameters                                                      | Return                            | Inherited From        |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------- | --------------------- |
| `checkValidity`   |         | The checkValidity() method of the ElementInternals interface checks if the element meets any constraint validation rules applied to it.                                                                                                           |                                                                 |                                   |                       |
| `reportValidity`  |         | The reportValidity() method of the ElementInternals interface checks if the element meets any constraint validation rules applied to it.                                                                                                          |                                                                 |                                   |                       |
| `setFormValue`    |         | The setFormValue() method of the ElementInternals interface sets the element's submission value and state, communicating these to the user agent.                                                                                                 | `value: FormValue, state: FormState`                            |                                   |                       |
| `setValidity`     |         | The setValidity() method of the ElementInternals interface sets the validity of the element.                                                                                                                                                      | `validity: ValidityState, message: string, anchor: HTMLElement` |                                   |                       |
| `requestSubmit`   |         | Submits the \*\*owner form\*\* (not just this control), like \`form.requestSubmit()\`.                                                                                                                                                            | `submitter: HTMLElement \| null`                                |                                   |                       |
| `reset`           |         | Resets the \*\*whole owner form\*\*, like \`form.reset()\`. There is no per-control&#xA;reset in the platform; each control restores itself in \`formResetCallback()\`.                                                                           |                                                                 |                                   |                       |
| `createBehaviors` |         |                                                                                                                                                                                                                                                   |                                                                 | `readonly unknown[] \| undefined` | BlkMixinInternalsBase |
| `getBehavior`     |         | Returns the attached behavior created by \`ctor\`, typed as its instance, or&#xA;\`undefined\` if none was created (e.g. the browser lacks that behavior).&#xA;Looks it up by type, so it does not depend on the order of \`internalsBehaviors\`. | `ctor: new (...args: any[]) => B`                               | `B \| undefined`                  | BlkMixinInternalsBase |

<details><summary>Private API</summary>

##### Methods

| Name                           | Privacy   | Description | Parameters | Return             | Inherited From        |
| ------------------------------ | --------- | ----------- | ---------- | ------------------ | --------------------- |
| `attachInternalsWithBehaviors` | protected |             |            | `ElementInternals` | BlkMixinInternalsBase |

</details>

<hr/>

#### Exports

| Kind | Name                     | Declaration            | Module                        | Package |
| ---- | ------------------------ | ---------------------- | ----------------------------- | ------- |
| `js` | `BlkMixinFormAssociated` | BlkMixinFormAssociated | src/BlkMixinFormAssociated.ts |         |

### `src/BlkMixinInternalsBase.ts`:

#### mixin: `BlkMixinInternalsBase`

##### Mixins

| Name          | Module | Package               |
| ------------- | ------ | --------------------- |
| `dedupeMixin` |        | @open-wc/dedupe-mixin |

##### Parameters

| Name   | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `Base` | `T`  |         |             |

##### Static Fields

| Name                 | Privacy | Type                                      | Default | Description | Inherited From |
| -------------------- | ------- | ----------------------------------------- | ------- | ----------- | -------------- |
| `internalsBehaviors` |         | `readonly BehaviorCreator[] \| undefined` |         |             |                |

##### Fields

| Name          | Privacy | Type                 | Default | Description | Inherited From |
| ------------- | ------- | -------------------- | ------- | ----------- | -------------- |
| `[internals]` |         | `ElementInternals`   |         |             |                |
| `[behaviors]` |         | `readonly unknown[]` | `[]`    |             |                |
|               |         |                      |         |             |                |

##### Methods

| Name              | Privacy | Description                                                                                                                                                                                                                                       | Parameters                        | Return                            | Inherited From |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------- | -------------- |
| `createBehaviors` |         |                                                                                                                                                                                                                                                   |                                   | `readonly unknown[] \| undefined` |                |
| `getBehavior`     |         | Returns the attached behavior created by \`ctor\`, typed as its instance, or&#xA;\`undefined\` if none was created (e.g. the browser lacks that behavior).&#xA;Looks it up by type, so it does not depend on the order of \`internalsBehaviors\`. | `ctor: new (...args: any[]) => B` | `B \| undefined`                  |                |

<details><summary>Private API</summary>

##### Methods

| Name                           | Privacy   | Description | Parameters | Return             | Inherited From |
| ------------------------------ | --------- | ----------- | ---------- | ------------------ | -------------- |
| `attachInternalsWithBehaviors` | protected |             |            | `ElementInternals` |                |

</details>

<hr/>

#### Variables

| Name        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Type |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| `internals` | Internal storage key used by the internals mixins.&#xA;&#xA;Consumers should use \`element.internals\` exposed by&#xA;\`BlkMixinElementInternals\` or \`BlkMixinFormAssociated\` instead of accessing this symbol directly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |      |
| `behaviors` | Storage key for the behavior objects passed to \`attachInternals({behaviors})\`.&#xA;&#xA;Read behavior references from \`this\[behaviors]\`; don't stash them from an&#xA;overridden \`createBehaviors()\`. That method runs inside the base constructor, and&#xA;subclass class fields are initialized only \*after\* \`super()\` returns:&#xA;&#xA;\`\`\`js&#xA;class Broken extends BlkMixinInternalsBase(HTMLElement) {&#xA;  \_submitBehavior; // (2) field init runs after super(): resets it to undefined&#xA;&#xA;  createBehaviors() {&#xA;    this.\_submitBehavior = new HTMLSubmitButtonBehavior(); // (1) set during super()&#xA;    return \[this.\_submitBehavior];&#xA;  }&#xA;}&#xA;&#xA;class Works extends BlkMixinInternalsBase(HTMLElement) {&#xA;  static internalsBehaviors = \[() => new HTMLSubmitButtonBehavior()];&#xA;&#xA;  get \_submitBehavior() {&#xA;    // \`this\[behaviors]\` is owned by the mixin, never touched by subclass fields.&#xA;    return this.getBehavior(HTMLSubmitButtonBehavior);&#xA;  }&#xA;}&#xA;\`\`\`&#xA;&#xA;(A TypeScript \`declare \_submitBehavior: X;\` emits no field, so it doesn't trigger&#xA;this — but a plain JS field or TS field without \`declare\` does.) |      |

<hr/>

#### Exports

| Kind | Name                    | Declaration           | Module                       | Package |
| ---- | ----------------------- | --------------------- | ---------------------------- | ------- |
| `js` | `internals`             | internals             | src/BlkMixinInternalsBase.ts |         |
| `js` | `behaviors`             | behaviors             | src/BlkMixinInternalsBase.ts |         |
| `js` | `BlkMixinInternalsBase` | BlkMixinInternalsBase | src/BlkMixinInternalsBase.ts |         |

### `src/_BlkMixinInternalsSimpleBase.ts`:

#### mixin: `BlkMixinInternalsSimpleBase`

##### Mixins

| Name          | Module | Package               |
| ------------- | ------ | --------------------- |
| `dedupeMixin` |        | @open-wc/dedupe-mixin |

##### Parameters

| Name   | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `Base` | `T`  |         |             |

##### Fields

| Name          | Privacy | Type               | Default | Description | Inherited From |
| ------------- | ------- | ------------------ | ------- | ----------- | -------------- |
| `[internals]` |         | `ElementInternals` |         |             |                |
|               |         |                    |         |             |                |

<hr/>

#### Variables

| Name        | Description                                                                                                                                                                                                                 | Type |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `internals` | Internal storage key used by the internals mixins.&#xA;&#xA;Consumers should use \`element.internals\` exposed by&#xA;\`BlkMixinElementInternals\` or \`BlkMixinFormAssociated\` instead of accessing this symbol directly. |      |

<hr/>

#### Exports

| Kind | Name                          | Declaration                 | Module                               | Package |
| ---- | ----------------------------- | --------------------------- | ------------------------------------ | ------- |
| `js` | `internals`                   | internals                   | src/\_BlkMixinInternalsSimpleBase.ts |         |
| `js` | `BlkMixinInternalsSimpleBase` | BlkMixinInternalsSimpleBase | src/\_BlkMixinInternalsSimpleBase.ts |         |

### `src/index.ts`:

#### Exports

| Kind | Name                              | Declaration                     | Module                        | Package |
| ---- | --------------------------------- | ------------------------------- | ----------------------------- | ------- |
| `js` | `BlkMixinElementInternals`        | BlkMixinElementInternals        | ./BlkMixinElementInternals.js |         |
| `js` | `ElementInternalsHost`            | ElementInternalsHost            | ./BlkMixinElementInternals.js |         |
| `js` | `ElementInternalsHostConstructor` | ElementInternalsHostConstructor | ./BlkMixinElementInternals.js |         |
| `js` | `BlkMixinInternalsBase`           | BlkMixinInternalsBase           | ./BlkMixinInternalsBase.js    |         |
| `js` | `behaviors`                       | behaviors                       | ./BlkMixinInternalsBase.js    |         |
| `js` | `internals`                       | internals                       | ./BlkMixinInternalsBase.js    |         |
| `js` | `BehaviorCreator`                 | BehaviorCreator                 | ./BlkMixinInternalsBase.js    |         |
| `js` | `InternalsBaseHost`               | InternalsBaseHost               | ./BlkMixinInternalsBase.js    |         |
| `js` | `InternalsBaseConstructor`        | InternalsBaseConstructor        | ./BlkMixinInternalsBase.js    |         |
| `js` | `BlkMixinFormAssociated`          | BlkMixinFormAssociated          | ./BlkMixinFormAssociated.js   |         |
| `js` | `FormAssociated`                  | FormAssociated                  | ./BlkMixinFormAssociated.js   |         |
| `js` | `BlkFormValidationEvent`          | BlkFormValidationEvent          | ./BlkFormValidationEvent.js   |         |
