# BlkMixinElementInternals

[![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)](https://lit.dev)

## Overview

A layered mixin toolkit for building **form-associated custom elements** with native-level accessibility. The goal is to create form controls that are virtually indistinguishable from native `<input>` elements when examined through Chrome's Accessibility panel.

The library also provides first-class support for **platform-provided behaviors** — an experimental API that lets custom elements opt into browser-managed semantics (submit-button behavior, popup behavior, etc.) via `attachInternals({ behaviors })`.

## Inspiration & Research

- **Reference Implementations**: [Ionic](https://ionicframework.com/), [Calcite](https://developers.arcgis.com/calcite-design-system/), [Material Web](https://material-web.dev/), [PatternFly](https://www.patternfly.org/)
- **Technical Foundation**: Custom forms and [Constraint Validation API](https://developer.mozilla.org/docs/Web/API/Constraint_validation) deep dives
- **Methodology**: Following patterns from [Justin's lit-labs/forms](https://github.com/lit/lit/tree/main/packages/labs/forms) research
- **Behaviors**: [Platform-provided behaviors for custom elements](https://microsoftedge.github.io/Demos/platform-provided-behaviors-for-custom-elements/) (Edge/Chromium explainer)

---

## Architecture

The library provides a layered architecture of mixins. Each layer extends the previous one:

```
HTMLElement
  └── BlkMixinInternalsBase    ← ElementInternals + behavior support
        └── BlkMixinElementInternals  ← public .internals getter
              └── BlkMixinFormAssociated    ← full form association & validation
```

| Mixin | Responsibility |
|---|---|
| `BlkMixinInternalsBase` | Calls `attachInternals()` in the constructor, stores the result in `this[internals]`. Provides the two-level behavior API. |
| `BlkMixinElementInternals` | Adds a public `get internals()` getter for convenient access. |
| `BlkMixinFormAssociated` | Sets `static formAssociated = true` and delegates the full form interface (`form`, `labels`, `validity`, `setFormValue`, `checkValidity`, etc.) to `ElementInternals`. |

All mixins use `dedupeMixin` from `@open-wc/dedupe-mixin`, so they are safe to apply multiple times in a class hierarchy.

---

## Behavior API — Two Levels

`BlkMixinInternalsBase` exposes a **progressive-disclosure API** for platform-provided behaviors. Pick the level that matches your needs:

### Level 1 — Static `internalsBehaviors` (zero boilerplate)

Declare a static array of factory functions. The mixin calls each factory during construction, filters out nullish results, and passes them to `attachInternals({ behaviors })`.

```ts
import {BlkMixinInternalsBase} from '@blockquote-playground/blk-mixin-element-internals';

class MySubmitButton extends BlkMixinInternalsBase(HTMLElement) {
  static formAssociated = true;

  static internalsBehaviors = globalThis.HTMLSubmitButtonBehavior
    ? [() => new HTMLSubmitButtonBehavior()]
    : undefined;
}

customElements.define('my-submit-button', MySubmitButton);
```

**When to use:** The behavior is stateless or self-contained — you never need to read or update its properties after creation.

### Level 2 — Override `createBehaviors()` (full control)

Override the instance method to create behaviors yourself. This gives you a reference to each behavior object, so you can update its properties over time.

```ts
import {BlkMixinInternalsBase} from '@blockquote-playground/blk-mixin-element-internals';

class A11ySubmitButton extends BlkMixinInternalsBase(HTMLElement) {
  static formAssociated = true;
  static observedAttributes = ['name', 'value', 'formmethod'];

  _submitBehavior;

  createBehaviors() {
    if (globalThis.HTMLSubmitButtonBehavior) {
      this._submitBehavior = new HTMLSubmitButtonBehavior();
      return [this._submitBehavior];
    }
  }

  connectedCallback() {
    if (this._submitBehavior) {
      this._submitBehavior.name = this.getAttribute('name') ?? '';
      this._submitBehavior.value = this.getAttribute('value') ?? '';
      this._submitBehavior.formMethod = this.getAttribute('formmethod') ?? null;
    }
  }

  attributeChangedCallback(name, _old, value) {
    if (!this._submitBehavior) return;
    if (name === 'name') this._submitBehavior.name = value ?? '';
    if (name === 'value') this._submitBehavior.value = value ?? '';
    if (name === 'formmethod') this._submitBehavior.formMethod = value ?? null;
  }
}

customElements.define('a11y-submit-button', A11ySubmitButton);
```

**When to use:** You need to keep a reference to the behavior and mutate it — for example, syncing `name`/`value`/`formmethod` attributes to an `HTMLSubmitButtonBehavior` instance.

### How it works internally

```
constructor()
  └── attachInternalsWithBehaviors()
        ├── createBehaviors()
        │     ├── (default) runs static internalsBehaviors, filters nullish
        │     └── (override) your custom creation logic
        └── attachInternals( behaviors && { behaviors } )
```

- `createBehaviors()` is called once, during construction.
- The default implementation reads `static internalsBehaviors`, invokes each factory, and drops any `null`/`undefined` results.
- If `createBehaviors()` returns `undefined` (no behaviors, or no factories), `attachInternals()` is called without arguments — fully backward-compatible.
- Browsers that don't support the `{ behaviors }` option simply ignore the unknown dictionary member (per WebIDL), so this is safe on all platforms.

### Fallback pattern

On browsers without `HTMLSubmitButtonBehavior` (or other behavior constructors), the behavior reference will be `undefined`. Add manual event listeners as a fallback:

```ts
connectedCallback() {
  if (!this._submitBehavior) {
    // Fallback: manual submit via click/keydown
    this.setAttribute('role', 'button');
    this.addEventListener('click', () => this.closest('form')?.requestSubmit());
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  }
}
```

---

## Quick uick Example — Form-Associa

```html
<form id="signup-form" novalidate>
  <fieldset>
    <legend>Sign Up</legend>
    <blk-input label="Name" name="name" required placeholder="Enter your name"></blk-input>
    <blk-input label="Email" type="email" name="email" required placeholder="Enter your email"></blk-input>
    <blk-input label="Message" type="textarea" name="message" placeholder="Your message..."></blk-input>
  </fieldset>
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
</form>
```

```js
const form = document.querySelector('#signup-form');

form.querySelectorAll('blk-input').forEach((input) => {
  input.addEventListener('validation', (e) => {
    e.target.invalid = !e.valid;
  });
});

form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  console.log('Submitted:', data);
});
```

---

## Resources

- [ElementInternals API](https://developer.mozilla.org/docs/Web/API/ElementInternals)
- [Form-associated Custom Elements](https://html.spec.whatwg.org/multipage/custom-elements.html#form-associated-custom-elements)
- [Constraint Validation API](https://developer.mozilla.org/docs/Web/API/Constraint_validation)
- [Platform-provided behaviors for custom elements](https://microsoftedge.github.io/Demos/platform-provided-behaviors-for-custom-elements/) (Edge explainer)

---

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

| Name          | Privacy | Type               | Default | Description                                                     | Inherited From        |
| ------------- | ------- | ------------------ | ------- | --------------------------------------------------------------- | --------------------- |
| `internals`   |         | `ElementInternals` |         | Exposes the ElementInternals instance attached to this element. |                       |
| `[internals]` |         | `ElementInternals` |         |                                                                 | BlkMixinInternalsBase |
|               |         |                    |         |                                                                 | BlkMixinInternalsBase |

##### Methods

| Name                           | Privacy | Description | Parameters | Return                                      | Inherited From        |
| ------------------------------ | ------- | ----------- | ---------- | ------------------------------------------- | --------------------- |
| `createBehaviors`              |         |             |            | `readonly InternalsBehavior[] \| undefined` | BlkMixinInternalsBase |
| `attachInternalsWithBehaviors` |         |             |            | `ElementInternals`                          | BlkMixinInternalsBase |

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

| Name                | Privacy | Type               | Default | Description                                                                                                                                                                                                  | Inherited From        |
| ------------------- | ------- | ------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `form`              |         |                    |         | The form read-only property of the ElementInternals interface returns the HTMLFormElement associated with this element.                                                                                      |                       |
| `labels`            |         |                    |         | The labels read-only property of the ElementInternals interface returns the labels associated with the element.                                                                                              |                       |
| `labelText`         |         | `string`           |         | A best-attempt based on observed behaviour in FireFox 115 on fedora 38                                                                                                                                       |                       |
| `role`              |         |                    |         | The role read-only property of the ElementInternals interface returns the WAI-ARIA role for the element.                                                                                                     |                       |
| `shadowRoot`        |         |                    |         | The shadowRoot read-only property of the ElementInternals interface returns the ShadowRoot for this element.                                                                                                 |                       |
| `states`            |         |                    |         | The states read-only property of the ElementInternals interface returns a CustomStateSet representing the possible states of the custom element.                                                             |                       |
| `isDisabled`        |         |                    |         | Returns whether the host element is currently disabled.                                                                                                                                                      |                       |
| `isReadOnly`        |         |                    |         | Returns whether the host element is currently read-only.                                                                                                                                                     |                       |
| `internals`         |         | `ElementInternals` |         | Exposes the ElementInternals instance attached to this element.                                                                                                                                              |                       |
| `validationMessage` |         |                    |         | The validationMessage read-only property of the ElementInternals interface returns the validation message for the element.                                                                                   |                       |
| `validity`          |         |                    |         | The validity read-only property of the ElementInternals interface returns a ValidityState object which represents the different validity states the element can be in, with respect to constraint validation |                       |
| `willValidate`      |         |                    |         | The willValidate read-only property of the ElementInternals interface returns true if the element is a submittable element that is a candidate for constraint validation.                                    |                       |
| `[internals]`       |         | `ElementInternals` |         |                                                                                                                                                                                                              | BlkMixinInternalsBase |
|                     |         |                    |         |                                                                                                                                                                                                              | BlkMixinInternalsBase |

##### Methods

| Name                           | Privacy | Description                                                                                                                                       | Parameters                                                      | Return                                      | Inherited From        |
| ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------- | --------------------- |
| `checkValidity`                |         | The checkValidity() method of the ElementInternals interface checks if the element meets any constraint validation rules applied to it.           |                                                                 |                                             |                       |
| `reportValidity`               |         | The reportValidity() method of the ElementInternals interface checks if the element meets any constraint validation rules applied to it.          |                                                                 |                                             |                       |
| `setFormValue`                 |         | The setFormValue() method of the ElementInternals interface sets the element's submission value and state, communicating these to the user agent. | `value: FormValue, state: FormState`                            |                                             |                       |
| `setValidity`                  |         | The setValidity() method of the ElementInternals interface sets the validity of the element.                                                      | `validity: ValidityState, message: string, anchor: HTMLElement` |                                             |                       |
| `requestSubmit`                |         |                                                                                                                                                   | `submitter: HTMLElement \| null`                                |                                             |                       |
| `reset`                        |         |                                                                                                                                                   |                                                                 |                                             |                       |
| `createBehaviors`              |         |                                                                                                                                                   |                                                                 | `readonly InternalsBehavior[] \| undefined` | BlkMixinInternalsBase |
| `attachInternalsWithBehaviors` |         |                                                                                                                                                   |                                                                 | `ElementInternals`                          | BlkMixinInternalsBase |

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

| Name          | Privacy | Type               | Default | Description | Inherited From |
| ------------- | ------- | ------------------ | ------- | ----------- | -------------- |
| `[internals]` |         | `ElementInternals` |         |             |                |
|               |         |                    |         |             |                |

##### Methods

| Name                           | Privacy | Description | Parameters | Return                                      | Inherited From |
| ------------------------------ | ------- | ----------- | ---------- | ------------------------------------------- | -------------- |
| `createBehaviors`              |         |             |            | `readonly InternalsBehavior[] \| undefined` |                |
| `attachInternalsWithBehaviors` |         |             |            | `ElementInternals`                          |                |

<hr/>

#### Variables

| Name        | Description | Type |
| ----------- | ----------- | ---- |
| `internals` |             |      |

<hr/>

#### Exports

| Kind | Name                    | Declaration           | Module                       | Package |
| ---- | ----------------------- | --------------------- | ---------------------------- | ------- |
| `js` | `internals`             | internals             | src/BlkMixinInternalsBase.ts |         |
| `js` | `BlkMixinInternalsBase` | BlkMixinInternalsBase | src/BlkMixinInternalsBase.ts |         |

### `src/index.ts`:

#### Exports

| Kind | Name                       | Declaration              | Module                        | Package |
| ---- | -------------------------- | ------------------------ | ----------------------------- | ------- |
| `js` | `BlkMixinElementInternals` | BlkMixinElementInternals | ./BlkMixinElementInternals.js |         |
| `js` | `BlkMixinInternalsBase`    | BlkMixinInternalsBase    | ./BlkMixinInternalsBase.js    |         |
| `js` | `internals`                | internals                | ./BlkMixinInternalsBase.js    |         |
| `js` | `BehaviorCreator`          | BehaviorCreator          | ./BlkMixinInternalsBase.js    |         |
| `js` | `BlkMixinFormAssociated`   | BlkMixinFormAssociated   | ./BlkMixinFormAssociated.js   |         |
| `js` | `FormAssociated`           | FormAssociated           | ./BlkMixinFormAssociated.js   |         |
| `js` | `BlkFormValidationEvent`   | BlkFormValidationEvent   | ./BlkFormValidationEvent.js   |         |
