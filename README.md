# Element Internals Playground

Explore the [ElementInternals API](https://developer.mozilla.org/docs/Web/API/ElementInternals) using reusable mixins.

- [blk-input](./packages/blk-input/README.md) & **blk-inline-input**: Simple custom input elements demonstrating internal messaging and validity control.
- **BlkMixinElementInternals**: Core mixin to attach `ElementInternals` to any custom element.
- [BlkMixinFormAssociated](./packages/blk-mixin-element-internals/README.md): Extension of the core mixin enabling form-associated custom elements.
- **BlkFormValidationEvent**: Custom event for validation state changes.

---

**References and related projects:**

- [Lookwe69 - lit-mixins](https://github.com/Lookwe69/lit-mixins/tree/main/src/internal)
- [@lit-labs/forms](https://github.com/lit/lit/tree/form-associated/packages/labs/forms)
- [Playground](https://lit.dev/playground/#gist=31460b33459d68e87f07cceb16ffb1f1)
  - [adoptedStylesheets](https://github.com/w3c/csswg-drafts/issues/11403)
- [Webcomponents cg](https://github.com/w3c/webcomponents-cg/issues/104#issuecomment-2518809518)
- [Ionic Input Component](https://github.com/ionic-team/ionic-framework/blob/main/core/src/components/input/input.tsx#L373)
- [Calcite Input Component](https://github.com/Esri/calcite-design-system/blob/dev/packages/calcite-components/src/components/input/input.tsx)
- [Material Web Text Field](https://github.com/material-components/material-web/blob/main/textfield/internal/text-field.ts)
- [PatternFly Text Input](https://github.com/patternfly/patternfly-elements/blob/main/elements/pf-text-input/pf-text-input.ts#L232)
- [Custom forms with Web Components and ElementInternals (dev.to)](https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj)
- [Form validation using JavaScript's Constraint Validation API (medium.com)](https://medium.com/stackanatomy/form-validation-using-javascripts-constraint-validation-api-fd4b70720288)
- [MUI Joy UI Input](https://mui.com/joy-ui/react-input/)
- [ElementInternalsType Explainer (Microsoft Edge)](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/ElementInternalsType/explainer.md)
