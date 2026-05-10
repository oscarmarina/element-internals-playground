### `src/BlkTanstackPlayground.ts`:

#### class: `BlkTanstackPlayground`, `blk-tanstack-playground`

<details><summary>Private API</summary>

##### Fields

| Name    | Privacy | Type | Default                                                                                                                                                                                              | Description | Inherited From |
| ------- | ------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------- |
| `#form` | private |      | `new TanStackFormController(this, { defaultValues: { username: '', email: '', }, onSubmit: async ({value}) => { console.log('Form Submitted:', value); alert(JSON.stringify(value, null, 2)); }, })` |             |                |

</details>

<hr/>

#### Exports

| Kind | Name                    | Declaration           | Module                       | Package |
| ---- | ----------------------- | --------------------- | ---------------------------- | ------- |
| `js` | `BlkTanstackPlayground` | BlkTanstackPlayground | src/BlkTanstackPlayground.ts |         |

### `src/index.ts`:

#### Exports

| Kind | Name                    | Declaration           | Module                       | Package |
| ---- | ----------------------- | --------------------- | ---------------------------- | ------- |
| `js` | `BlkTanstackPlayground` | BlkTanstackPlayground | ./BlkTanstackPlayground.js   |         |
| `js` | `BlkFormField`          | BlkFormField          | ./components/BlkFormField.js |         |

### `src/components/BlkFormField.ts`:

#### Functions

| Name           | Description                                                                                                                                                                                                                                          | Parameters                                           | Return |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| `BlkFormField` | A DX helper to render a TanStack Form Field as a \<blk-input> element.&#xA;&#xA;Usage inside a TanStackFormController.field() render callback:&#xA;  this.#form.field({ name: 'email', validators: {...} }, (field) => BlkFormField(field, 'Email')) | `field: any, label: string, type, minLength: number` |        |

<hr/>

#### Exports

| Kind | Name           | Declaration  | Module                         | Package |
| ---- | -------------- | ------------ | ------------------------------ | ------- |
| `js` | `BlkFormField` | BlkFormField | src/components/BlkFormField.ts |         |

### `src/define/blk-tanstack-playground.ts`:

#### Exports

| Kind                        | Name                      | Declaration           | Module                        | Package |
| --------------------------- | ------------------------- | --------------------- | ----------------------------- | ------- |
| `custom-element-definition` | `blk-tanstack-playground` | BlkTanstackPlayground | /src/BlkTanstackPlayground.js |         |

### `src/styles/blk-tanstack-playground-styles.css.ts`:

#### Variables

| Name     | Description | Type |
| -------- | ----------- | ---- |
| `styles` |             |      |

<hr/>

#### Exports

| Kind | Name     | Declaration | Module                                           | Package |
| ---- | -------- | ----------- | ------------------------------------------------ | ------- |
| `js` | `styles` | styles      | src/styles/blk-tanstack-playground-styles.css.ts |         |
