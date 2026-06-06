import {css} from 'lit';

export const styles = css`
  :host {
    --_control-size: var(--control-element-size, 1rem);
    --_control-color: var(--control-element-color, #1a73e8);
    --_control-border-color: var(--control-element-border-color, #757575);
    --_control-disabled-opacity: var(--control-element-disabled-opacity, 0.38);
    --_control-gap: var(--control-element-gap, calc(1rem + 4px));
    --_control-error-color: var(--control-element-error-color, #d83020);
    --_control-hover-border-color: var(--control-element-hover-border-color, fieldtext);
    --_control-focus-outline-color: var(--control-element-focus-outline-color, #007ac2);
    --_control-animation: var(
      --control-element-animation,
      125ms cubic-bezier(0.45, 0.05, 0.55, 0.95)
    );
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    line-height: 1;
    cursor: pointer;
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

  :host(:state(disabled)) {
    opacity: var(--_control-disabled-opacity);
    cursor: not-allowed;
  }

  :host(:state(disabled)) i {
    border-color: var(--_control-border-color);
    background-color: #e0e0e0;
  }

  :host(:state(disabled)) ::slotted(label) {
    cursor: not-allowed;
    color: var(--_control-border-color);
  }

  :host(:state(invalid):not(:state(disabled))) i {
    border-color: var(--_control-error-color);
  }

  :host(:state(invalid):not(:state(disabled))) ::slotted(label) {
    color: var(--_control-error-color);
  }

  :host(:hover:not(:state(disabled))) i {
    border-color: var(--_control-hover-border-color);
  }

  :host(:not(:state(focus)):state(invalid):not(:state(disabled)):hover) i {
    border-color: var(--_control-hover-border-color);
  }

  :host(:state(focus):not(:state(disabled))) i {
    border-color: var(--_control-focus-outline-color);
    outline: 2px solid var(--_control-focus-outline-color);
    outline-offset: 2px;
  }

  :host(:state(focus):state(invalid):not(:state(disabled))) i {
    border-color: var(--_control-error-color);
    outline-color: var(--_control-error-color);
  }

  .mark {
    display: flex;
    align-items: center;
    position: relative;
  }

  .mark i {
    display: flex;
    flex-direction: column;
    position: absolute;
    pointer-events: none;
    block-size: var(--_control-size);
    inline-size: var(--_control-size);
    border: 2px solid var(--_control-border-color);
    background-color: transparent;
    transition: border-color var(--_control-animation), background-color var(--_control-animation);
  }

  .mark i::after {
    content: "";
    display: block;
    block-size: 50%;
    inline-size: 50%;
    background-color: var(--_control-color);
    border-radius: inherit;
    opacity: 0;
    transition: opacity var(--_control-animation);
    margin: auto;
  }

  :host([type=radio]) i {
    border-radius: 50%;
  }

  :host([type=checkbox]) i {
    border-radius: 2px;
  }

  :host(:state(checked):not(:state(disabled))) i {
    border-color: var(--_control-color);
  }

  :host(:state(checked):not(:state(disabled))) i::after {
    opacity: 1;
  }

  :host(:state(indeterminate):not(:state(disabled))) i::after {
    opacity: 1;
    block-size: 2px;
    inline-size: calc(var(--_control-size) * 0.6);
    border-radius: 0;
  }

  ::slotted(label[slot=embedded]) {
    display: flex;
    align-items: center;
    min-block-size: 1.5rem;
    padding-inline-start: var(--_control-gap);
    cursor: pointer;
  }

  :host([label-position=start]) .mark i {
    right: 0;
  }

  :host([label-position=start]) ::slotted(label[slot=embedded]) {
    padding-inline: 0 var(--_control-gap);
  }

  /* Forced colors / Windows High Contrast: author colors are ignored, so redraw the
     indicator with CSS system color keywords to keep it visible and stateful. */
  @media (forced-colors: active) {
    .mark i {
      border-color: CanvasText;
    }

    :host(:state(checked)) i {
      border-color: CanvasText;
    }

    :host(:state(checked)) i::after,
    :host(:state(indeterminate)) i::after {
      background-color: CanvasText;
    }

    :host(:state(focus)) i {
      border-color: Highlight;
      outline-color: Highlight;
    }

    :host(:state(disabled)) {
      opacity: 1;
    }

    :host(:state(disabled)) i,
    :host(:state(disabled)) i::after {
      border-color: GrayText;
      background-color: GrayText;
    }

    :host(:state(disabled)) ::slotted(label) {
      color: GrayText;
    }
  }
`;
