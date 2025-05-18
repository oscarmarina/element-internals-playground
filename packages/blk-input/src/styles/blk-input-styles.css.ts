import {css} from 'lit';

export const styles = css`
  :host {
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
    --_content-animation: var(--input-element-content-animation, 125ms ease);
    display: inline-flex;
    box-sizing: border-box;
    min-height: 2rem;
    resize: both;
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
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
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
  input {
    min-height: inherit;
    width: 100%;
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
    position: relative;
  }

  label {
    cursor: text;
    color: var(--_label-text-color);
    transition: transform var(--_content-animation);
    transform-origin: left top;
    display: block;
    position: absolute;
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    top: 50%;
    width: 100%;
    line-height: 1.15;
    padding: 0 0.375rem;
  }

  @media (prefers-reduced-motion: reduce) {
    label label {
      transition: none;
    }
  }

  input {
    border: none;
    font: inherit;
    line-height: 1;
    background: none;
    padding: 0 0.375rem;
    outline: none;
    width: 100%;
    height: 100%;
    display: block;
    caret-color: currentcolor;
    color: currentcolor;
  }

  label ~ input {
    padding: 1.375em 0.375em 0.375em;
  }

  /* autoprefixer: ignore next */
  input::placeholder {
    transition: opacity 125ms;
  }

  /* autoprefixer: ignore next */
  :host(:not(:focus-within)) label ~ input::placeholder {
    opacity: 0;
  }

  /* autoprefixer: ignore next */
  :host(:focus-within) label ~ input::placeholder {
    opacity: 1;
  }

  /* autoprefixer: ignore next */
  label:has(~ input:placeholder-shown) {
    transform: translateY(-50%);
  }

  /* autoprefixer: ignore next */
  :host(:focus-within) label,
  label:not(:has(~ input:placeholder-shown)) {
    transform: translateY(-102%) scale(0.82) translateX(1%);
  }

  .message-text {
    font-size: 0.875rem;
    text-indent: 0.4375rem;
    margin-top: 0.5rem;
  }

  .message-text > div + div {
    margin-top: 0.25rem;
  }

  .info-message-text {
    color: var(--_info-message-text-color);
  }

  .error-message-text {
    color: var(--_error-message-text-color);
  }
`;
