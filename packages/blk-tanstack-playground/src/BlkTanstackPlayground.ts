import {LitElement, html} from 'lit';
import {TanStackFormController} from '@tanstack/lit-form';
import {BlkFormField} from './components/BlkFormField.js';
import {styles} from './styles/blk-tanstack-playground-styles.css.js';

/*
 * ![Lit](https://img.shields.io/badge/lit-3.0.0-blue.svg)
 *
 * ## `<blk-tanstack-playground>`
 * A playground component to demonstrate TanStack Form integration with blk-input.
 *
 * This playground validates the "State-Manager / Presentational-Component" pattern:
 *  - **TanStack Form**: Manages canonical state and complex validation.
 *  - **blk-input**: Handles UI, A11y, and native form integration via `ElementInternals`.
 *  - **BlkFormField**: A DX wrapper that binds the two together.
 */
export class BlkTanstackPlayground extends LitElement {
  static override styles = [styles];

  // TanStackFormController is a Lit ReactiveController.
  // The form state lives at `this.#form.api`.
  readonly #form = new TanStackFormController(this, {
    defaultValues: {
      username: '',
      email: '',
    },
    onSubmit: async ({value}) => {
      console.log('Form Submitted:', value);
      alert(JSON.stringify(value, null, 2));
    },
  });

  override render() {
    // Convenient alias to shorten template expressions.
    const form = this.#form.api;

    return html`
      <div class="playground-container">
        <h2>TanStack Form + blk-input</h2>
        <form
          @submit=${(e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}>
          <div class="form-field">
            ${this.#form.field(
              {
                name: 'username',
                validators: {
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({value}) => {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return value.includes('admin') ? 'Username cannot contain admin' : undefined;
                  },
                  onChange: ({value}) => {
                    if (!value) return 'Username is required';
                    if (value.length < 3) return 'Username must be at least 3 characters';
                    return undefined;
                  },
                },
              },
              (field) => BlkFormField(field, 'Username', 'text', 3)
            )}
          </div>

          <div class="form-field">
            ${this.#form.field(
              {
                name: 'email',
                validators: {
                  onChange: ({value}) => {
                    if (!value) return 'Email is required';
                    if (!value.includes('@')) return 'Must be a valid email';
                    return undefined;
                  },
                },
              },
              (field) => BlkFormField(field, 'Email Address', 'email')
            )}
          </div>

          <div class="form-actions">
            <button
              class="btn-submit"
              type="submit"
              ?disabled=${!form.state.canSubmit || form.state.isSubmitting}>
              ${form.state.isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
            <button class="btn-reset" type="button" @click=${() => form.reset()}>Reset</button>
          </div>
        </form>

        <div class="form-state">
          <h3>Current Form State (Debug):</h3>
          <pre>${JSON.stringify(form.state.values, null, 2)}</pre>
        </div>
      </div>
    `;
  }
}
