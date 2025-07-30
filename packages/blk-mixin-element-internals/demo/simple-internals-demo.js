import {LitElement, html, css} from 'lit';
import {BlkMixinElementInternals} from '../src/BlkMixinElementInternals.js';

export class SimpleInternalsDemo extends BlkMixinElementInternals(LitElement) {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      color: #1a1a1a;
      background-color: #f3f3f3;
      border: 0.0625rem solid #e2e8f0;
      max-width: 31.25rem;
      margin: 2rem auto;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .demo-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .demo-subtitle {
      font-size: 0.9rem;
      color: #718096;
      margin: 0;
    }

    .input-wrapper {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .input-box {
      position: relative;
    }

    input {
      width: 100%;
      font-size: 1rem;
      font-family: inherit;
      padding: 1rem 1.25rem;
      border: 0.125rem solid var(--border-color, #e2e8f0);
      outline: none;
      background: #fff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
    }

    input:hover {
      border-color: #cbd5e0;
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
    }

    :host(:--active) input {
      --border-color: #4299e1;
      transform: translateY(-0.0625rem);
    }

    /* State: :--invalid (when validation fails) */
    :host(:--invalid) input {
      --border-color: #e53e3e;
      box-shadow:
        0 0 0 0.1875rem rgba(229, 62, 62, 0.15),
        0 0.25rem 0.75rem rgba(229, 62, 62, 0.2);
    }

    /* State: :--valid (when validation succeeds) */
    :host(:--valid) input {
      --border-color: #38a169;
      box-shadow:
        0 0 0 0.1875rem rgba(56, 161, 105, 0.15),
        0 0.25rem 0.75rem rgba(56, 161, 105, 0.2);
    }

    .msg {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      color: #718096;
      line-height: 1.4;
      padding: 0.5rem 0.75rem;
      background: #f7fafc;
      border-left: 0.1875rem solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .msg.error {
      color: #e53e3e;
      background: #fff5f5;
      border-left-color: #e53e3e;
    }

    .msg.success {
      color: #38a169;
      background: #f0fff4;
      border-left-color: #38a169;
    }

    /* Visual states in message */
    .states-display {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.9);
      font-size: 0.8rem;
      border: 0.0625rem solid #e2e8f0;
    }

    .states-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .state-item {
      display: inline-block;
      margin: 0.25rem 0.5rem 0.25rem 0;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .state-active {
      background: #bee3f8;
      color: #2b6cb0;
    }

    .state-invalid {
      background: #fed7d7;
      color: #c53030;
    }

    .state-valid {
      background: #c6f6d5;
      color: #2f855a;
    }
  `;

  value = '';

  connectedCallback() {
    super.connectedCallback();
    this._setState('invalid', true);
  }

  render() {
    const currentStates = Array.from(this.internals.states);

    return html`
      <div class="demo-header">
        <h2 class="demo-title">Element Internals</h2>
        <p class="demo-subtitle">Demonstrates the use of :--custom-states with Element Internals</p>
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
        <div class="msg ${this._getMessageClass()}">${this._getMessage()}</div>
      </div>

      <div class="states-display">
        <div class="states-title">Active states (internals.states):</div>
        ${currentStates.length > 0
          ? currentStates.map(
              (state) => html` <span class="state-item state-${state}">:--${state}</span> `
            )
          : html`<span class="state-item">No active states</span>`}
      </div>
    `;
  }

  _onInput(e) {
    this.value = e.target.value;
    const hasValue = Boolean(this.value.trim());

    // State logic based on content
    this._setState('invalid', !hasValue);
    this._setState('valid', hasValue);

    this.requestUpdate();
  }

  _isInvalid() {
    return this.internals.states.has('invalid');
  }

  _isValid() {
    return this.internals.states.has('valid');
  }

  _getMessageClass() {
    if (this._isInvalid()) return 'error';
    if (this._isValid()) return 'success';
    return '';
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
    if (on) {
      this.internals.states.add(state);
    } else {
      this.internals.states.delete(state);
    }
    this.requestUpdate();
  }
}

customElements.define('simple-internals-demo', SimpleInternalsDemo);
