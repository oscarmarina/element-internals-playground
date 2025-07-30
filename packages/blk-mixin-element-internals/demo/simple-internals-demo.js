/* eslint-disable import/no-extraneous-dependencies */
import {LitElement, html, css} from 'lit';
import {BlkMixinElementInternals} from '../src/BlkMixinElementInternals.js';

export class SimpleInternalsDemo extends BlkMixinElementInternals(LitElement) {
  static get properties() {
    return {
      value: {type: String},
      _states: {state: true},
    };
  }

  static styles = css`
    :host {
      --color-text-primary: #2d3748;
      --color-text-secondary: #5d6776ff;
      --color-background: #f7fafc;
      --color-surface: #fff;
      --color-border: #e2e8f0;
      --color-active: #00579e;
      --color-error: #e53e3e;
      --color-success: #38a169;
      --color-active-surface: #bee3f8;
      --color-error-surface: #fed7d7;
      --color-success-surface: #c6f6d5;
      --color-error-extra-surface: #fff5f5;
      --color-success-extra-surface: #f0fff4;

      display: block;
      padding: 2rem;
      text-wrap: balance;
      color: var(--color-text-primary);
      background-color: var(--color-background);
      border: 0.0625rem solid var(--color-border);
      max-inline-size: 31.25rem;
      margin-block: 2rem;
      margin-inline: auto;
    }

    .demo-header {
      text-align: center;
      margin-block-end: 2rem;
    }

    .demo-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
      margin-block-end: 0.5rem;
    }

    .demo-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    a {
      text-decoration: none;
      color: var(--color-active);
    }

    .input-wrapper {
      position: relative;
      margin-block-end: 1.5rem;
    }

    .input-box {
      position: relative;
    }

    input {
      inline-size: 100%;
      font-size: 1rem;
      font-family: inherit;
      padding-block: 1rem;
      padding-inline: 1.25rem;
      border: 0.125rem solid var(--border-color, var(--color-border));
      outline: none;
      background: var(--color-surface);
      transition: all 190ms cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
    }

    input:hover {
      box-shadow: 0 0 0.5rem 0 rgb(0, 0, 0, 0.1);
    }

    :host(:state(active)) input {
      --border-color: var(--color-active);
    }

    :host(:state(invalid)) input {
      --border-color: var(--color-error);
    }

    :host(:state(valid)) input {
      --border-color: var(--color-success);
    }

    .msg {
      margin-block-start: 0.75rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
      padding-block: 0.5rem;
      padding-inline: 0.75rem;
      background: var(--color-background);
      border-inline-start: 0.1875rem solid var(--color-border);
      transition: all 0.3s ease;
    }

    :host(:state(invalid)) .msg {
      color: var(--color-error);
      background: var(--color-error-extra-surface);
      border-inline-start-color: var(--color-error);
    }

    :host(:state(valid)) .msg {
      color: var(--color-success);
      background: var(--color-success-extra-surface);
      border-inline-start-color: var(--color-success);
    }

    .states-display {
      margin-block-start: 1rem;
      padding: 1rem;
      background: var(--color-surface);
      font-size: 0.8rem;
      border: 0.0625rem solid var(--color-border);
    }

    .states-title {
      font-weight: 600;
      color: var(--color-text-primary);
      margin-block-end: 0.5rem;
    }

    .state-item {
      display: inline-block;
      margin-block: 0.25rem;
      margin-inline: 0 0.5rem;
      padding-block: 0.25rem;
      padding-inline: 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .state-item[data-state='active'] {
      background: var(--color-active-surface);
      color: var(--color-active);
    }

    .state-item[data-state='invalid'] {
      background: var(--color-error-surface);
      color: var(--color-error);
    }

    .state-item[data-state='valid'] {
      background: var(--color-success-surface);
      color: var(--color-success);
    }
  `;

  constructor() {
    super();
    this.value = '';
    this._states = new Set();
  }

  render() {
    const currentStates = Array.from(this._states);

    return html`
      <div class="demo-header">
        <h2 class="demo-title">Element Internals</h2>
        <p class="demo-subtitle">
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/CSS/:state"
            target="_blank"
            rel="noopener noreferrer"
            >The :state() CSS pseudo-class matches custom elements that have the specified custom
            state.</a
          >
        </p>
      </div>

      <div class="input-wrapper">
        <div class="input-box">
          <input
            id="input"
            .value=${this.value}
            @input=${this._onInput}
            @focus=${() => this._setState('active', true)}
            @blur=${() => this._setState('active', false)}
            required
            placeholder="Type to see the states"
            aria-label="Demo input with internals states"
          />
        </div>
        <div class="msg">${this._getMessage()}</div>
      </div>

      <div class="states-display">
        <div class="states-title">Active states (internals.states):</div>
        ${currentStates.length > 0
          ? currentStates.map(
              (state) => html`
                <span class="state-item" data-state="${state}">:state(${state})</span>
              `
            )
          : html`<span class="state-item">No active states</span>`}
      </div>
    `;
  }

  _onInput({target}) {
    this.value = target.value;
    const hasValue = Boolean(this.value.trim());

    this._setState('invalid', !hasValue);
    this._setState('valid', hasValue);
  }

  _isInvalid() {
    return this._states.has('invalid');
  }

  _isValid() {
    return this._states.has('valid');
  }

  _getMessage() {
    if (this._isInvalid()) {
      return 'This field is required';
    }
    if (this._isValid()) {
      return 'Perfect! The field has valid content';
    }
    return 'Type something to see how Element Internals states change';
  }

  _setState(state, on) {
    const newStates = new Set(this._states);
    if (on) {
      this.internals.states.add(state);
      newStates.add(state);
    } else {
      this.internals.states.delete(state);
      newStates.delete(state);
    }
    this._states = newStates;
  }
}

customElements.define('simple-internals-demo', SimpleInternalsDemo);
