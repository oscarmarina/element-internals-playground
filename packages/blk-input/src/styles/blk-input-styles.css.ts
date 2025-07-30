import {css} from 'lit';

export const styles = css`
  :host {
    --_filled-color: var(--input-element-filled-color, #f9f9f9);
    --_content-color: var(--input-element-content-color, #1d1b20);
    --_outline-color: var(--input-element-outline-color, #79747e);
    --_label-text-color: var(--input-element-label-text-color, #49454f);
    --_disabled-content-opacity: var(--input-element-disabled-content-opacity, 0.38);
    --_error-content-color: var(--input-element-error-content-color, #d83020);
    --_error-outline-color: var(--input-element-error-outline-color, #d83020);
    --_error-label-text-color: var(--input-element-error-label-text-color, #d83020);
    --_hover-outline-color: var(--input-element-hover-outline-color, fieldtext);
    --_focus-outline-color: var(--input-element-focus-outline-color, #007ac2);
    --_focus-label-text-color: var(--input-element-focus--label-text-color, #007ac2);
    --_error-message-text-color: var(--input-element-error-message-text-color, #d83020);
    --_info-message-text-color: var(--input-element-info-message-text-color, #1d1b20);
    --_content-animation: var(
      --input-element-content-animation,
      125ms cubic-bezier(0.45, 0.05, 0.55, 0.95)
    );
    --_top-space: var(--input-element-top-space, 1.375em);
    --_around-space: var(--input-element-around-space, 0.375em);
    --_label-line-height: 1;
    display: inline-flex;
    box-sizing: border-box;
    min-block-size: 1rem;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .sr-only {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  :host(:disabled) .field-block,
  :host(:disabled:hover) .field-block,
  :host([inert]) .field-block {
    opacity: var(--_disabled-content-opacity);
  }

  :host(:disabled) .field-flex,
  :host(:disabled:hover) .field-flex,
  :host([inert]) .field-flex {
    opacity: var(--_disabled-content-opacity);
    border-color: var(--_outline-color);
  }

  :host(:enabled[invalid]) .field-flex {
    border-color: var(--_error-content-color);
  }

  :host(:hover) .field-flex,
  :host(:not(:focus-within):enabled[invalid]:hover) .field-flex {
    border-color: var(--_hover-outline-color);
  }

  /* :focus-within instead of :focus because it works better at the :host level in Safari. */
  :host(:focus-within) .field-flex {
    border-color: var(--_focus-outline-color);
  }

  :host(:focus-within) label {
    color: var(--_focus-label-text-color);
  }

  :host(:enabled[invalid]:focus-within) label {
    color: var(--input-element-error-label-text-color);
  }

  .field-block,
  .field-flex,
  .field,
  .input-textarea {
    min-block-size: inherit;
    inline-size: 100%;
  }

  .field-flex {
    display: flex;
    align-items: center;
    color: var(--_content-color);
    border: 2px solid var(--_outline-color);
    border-radius: 4px;
    transition: border-color, var(--_content-animation);
  }

  .field {
    background-color: var(--_filled-color);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  label {
    cursor: text;
    color: var(--_label-text-color);
    transition:
      transform var(--_content-animation),
      inset-block-start var(--_content-animation);
    transform-origin: 0 0;
    display: block;
    position: absolute;
    overflow: hidden;
    max-inline-size: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    inset-block-start: calc(50% - 0.5em * var(--_label-line-height));
    inline-size: 100%;
    line-height: var(--_label-line-height);
    padding-block: 0;
    padding-inline: 0.375rem;
  }

  @media (prefers-reduced-motion: reduce) {
    label {
      transition: none;
    }
  }

  .mask {
    display: none;
  }

  .mask:has(~ textarea) {
    display: block;
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: calc(100% - 1rem);
    block-size: var(--_top-space);
    background-color: var(--_filled-color);
    opacity: 0.92;
    pointer-events: none;
  }

  input,
  textarea {
    border: none;
    font: inherit;
    line-height: 1;
    background: none;
    padding: var(--_around-space);
    outline: none;
    inline-size: 100%;
    block-size: 100%;
    display: block;
    caret-color: currentcolor;
    color: currentcolor;
    resize: vertical;
  }

  label ~ input,
  label ~ textarea {
    padding-inline: var(--_around-space);
    padding-block: var(--_top-space) var(--_around-space);
  }

  /* autoprefixer: ignore next */
  .input-textarea::placeholder {
    transition: opacity 125ms;
  }

  /* autoprefixer: ignore next */
  :host(:not(:focus-within)) label ~ .input-textarea::placeholder {
    opacity: 0;
  }

  /* autoprefixer: ignore next */
  :host(:focus-within) label ~ .input-textarea::placeholder {
    opacity: 1;
  }

  /* autoprefixer: ignore next */
  :host(:focus-within) label,
  label:not(:has(~ .input-textarea:placeholder-shown)) {
    transform: scale(0.82);
    inset-block-start: calc(var(--_top-space) - 1em * var(--_label-line-height));
  }

  .message-text {
    font-size: 0.875rem;
    text-indent: 0.4375rem;
    margin-block-start: 0.5rem;
  }

  .message-text > div + div {
    margin-block-start: 0.25rem;
  }

  .info-message-text {
    color: var(--_info-message-text-color);
  }

  .error-message-text {
    color: var(--_error-message-text-color);
  }
`;
