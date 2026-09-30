import {html, nothing} from 'lit';
import {live} from 'lit/directives/live.js';
import type {AnyFieldApi} from '@tanstack/lit-form';
import '@blockquote-playground/blk-input/blk-input.js';

/**
 * A DX helper to render a TanStack Form Field as a <blk-input> element.
 *
 * Usage inside a TanStackFormController.field() render callback:
 *   this.#form.field({ name: 'email', validators: {...} }, (field) => BlkFormField(field, 'Email'))
 */
export const BlkFormField = (
  field: AnyFieldApi,
  label: string,
  type = 'text',
  minLength?: number
) => {
  const errors = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  // Property bindings on purpose:
  // - `errorMessageText=` would target the lowercase `errormessagetext` attribute, which
  //   <blk-input> does not observe (its attribute is `error-message-text`).
  // - `live()` on `invalid`: <blk-input> also flips `invalid` itself on blur from native
  //   validity; `live` re-asserts TanStack's verdict even when it did not change.
  const errorMessage = field.state.meta.isTouched ? field.state.meta.errors.join(', ') : '';

  return html`
    <blk-input
      label=${label}
      name=${field.name}
      type=${type as 'text' | 'email' | 'password'}
      minlength=${minLength ?? nothing}
      .value=${live(field.state.value)}
      .invalid=${live(errors)}
      .errorMessageText=${errorMessage}
      @input=${(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
      @blur=${field.handleBlur}></blk-input>
  `;
};
