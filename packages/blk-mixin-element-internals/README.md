# BlkMixinElementInternals

[![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)](https://lit.dev)

## Overview

This repository showcases my recent prototyping work with **ElementInternals** and custom input/textarea components. The goal was to create form controls that are virtually indistinguishable from native `<input>` elements when examined through Chrome's Accessibility panel.

## Inspiration & Research

Drawing inspiration from industry-leading implementations and deep technical resources:

- 🏗️ **Reference Implementations**: [Ionic](https://ionicframework.com/), [Calcite](https://developers.arcgis.com/calcite-design-system/), [Material Web](https://material-web.dev/), [PatternFly](https://www.patternfly.org/)
- 📚 **Technical Foundation**: Custom forms and [Constraint Validation API](https://developer.mozilla.org/docs/Web/API/Constraint_validation) deep dives
- 🧪 **Methodology**: Following patterns from [Justin's lit-labs/forms](https://github.com/lit/lit/tree/main/packages/labs/forms) research

## Core Objectives

### 🎯 **Native-Level Accessibility**

Create custom inputs that appear **nearly identical** to native `<input>` elements in Chrome's Accessibility panel, ensuring seamless experiences for both users and assistive technologies.

### ⚡ **Standards Compliance**

- **ElementInternals API** for proper form association
- **Constraint Validation API** for native-like validation
- **ARIA attributes** management for accessibility
- **Form lifecycle** integration (reset, submission, validation)

## Key Features

- ✅ **Form Association**: Seamless integration with HTML forms
- ✅ **Validation**: Native constraint validation with custom messages
- ✅ **Accessibility**: ARIA-compliant with screen reader support
- ✅ **Standards-Based**: Built on modern web APIs

---

## Quick Example

### Basic Form Structure

```html
<form id="signup-form" novalidate>
  <fieldset>
    <legend>Sign Up</legend>

    <div>
      <blk-input
        label="Name"
        name="name"
        required
        placeholder="Enter your name"
        error-message-text="Name must be at least 2 characters"
      >
      </blk-input>
    </div>

    <div>
      <blk-input
        label="Message"
        type="textarea"
        name="message"
        placeholder="Enter your message..."
        info-message-text="Share your thoughts with us"
      >
      </blk-input>
    </div>

    <div>
      <blk-input
        label="Email"
        type="email"
        name="email"
        required
        placeholder="Enter your email"
        error-message-text="Please enter a valid email address"
      >
      </blk-input>
    </div>
  </fieldset>

  <div>
    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
  </div>
</form>
```

### Form Handling

```js
document.querySelectorAll('form').forEach((form) => {
  form.querySelectorAll('blk-input').forEach((input) => {
    input.addEventListener('invalid', (event) => {
      const {target} = event;
      target.invalid = !target.validity.valid;
    });

    input.addEventListener('validation', (event) => {
      const {target, valid} = event;
      target.invalid = !valid;
    });
  });

  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      console.log(`Form ${form.id} is invalid`);
      return;
    }

    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    console.log('Form submitted successfully:', formObject);
  });
});
```

## Architecture

The library provides a layered architecture for building form-associated custom elements:

### Core Mixins

- **`BlkMixinElementInternals`**: Core ElementInternals API access
- **`BlkMixinFormAssociated`**: Complete form association with validation

### Reference Implementation

- **`BlkInput`**: A complete custom input/textarea component built using the mixins, demonstrating best practices for accessibility, validation, and form integration

## Resources

- [ElementInternals API Documentation](https://developer.mozilla.org/docs/Web/API/ElementInternals)
- [Form-associated Custom Elements Spec](https://html.spec.whatwg.org/multipage/custom-elements.html#form-associated-custom-elements)
- [Constraint Validation API](https://developer.mozilla.org/docs/Web/API/Constraint_validation)
