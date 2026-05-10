import {html, nothing} from 'lit';
import {live} from 'lit/directives/live.js';
import '@blockquote-playground/blk-input/blk-input.js';

/**
 * Structural type matching the FieldApi surface we actually need.
 * Avoids importing the full generic FieldApi<...23 type params...> from @tanstack/form-core.

interface FieldLike {
  name: string;
  state: {
    value: string;
    meta: {
      touched: boolean;
      errors: unknown[];
    };
  };
  handleChange: (value: string) => void;
  handleBlur: () => void;
}
 */

/**
 * A DX helper to render a TanStack Form Field as a <blk-input> element.
 *
 * Usage inside a TanStackFormController.field() render callback:
 *   this.#form.field({ name: 'email', validators: {...} }, (field) => BlkFormField(field, 'Email'))
 */
export const BlkFormField = (field: any, label: string, type = 'text', minLength?: number) => {
  const errors = field.state.meta.touched && field.state.meta.errors.length > 0;
  const errorMessage = field.state.meta.touched ? field.state.meta.errors.join(', ') : '';

  return html`
    <blk-input
      label=${label}
      name=${field.name}
      type=${type as 'text' | 'email' | 'password'}
      minlength=${minLength ?? nothing}
      .value=${live(field.state.value)}
      ?invalid=${errors}
      errorMessageText=${errorMessage}
      @input=${(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
      @blur=${field.handleBlur}></blk-input>
  `;
};
