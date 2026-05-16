import {LitElement, html, css} from 'lit';
import {BlkMixinInternalsBase} from '../src/BlkMixinInternalsBase.js';
import {BlkMixinFormAssociated} from '../src/BlkMixinFormAssociated.js';
import '@blockquote-playground/blk-input/blk-input.js';
/**
 * @typedef {{
 *   name: string;
 *   value: string;
 *   formMethod: string | null;
 * }} SubmitButtonBehaviorLike
 */

const SubmitButtonBehaviorCtor =
  /** @type {{HTMLSubmitButtonBehavior?: new () => SubmitButtonBehaviorLike}} */ (globalThis)
    .HTMLSubmitButtonBehavior;
const supportsSubmitBehavior = typeof SubmitButtonBehaviorCtor !== 'undefined';

class SimpleSubmitButton extends BlkMixinFormAssociated(HTMLElement) {
  static internalsBehaviors = SubmitButtonBehaviorCtor
    ? [() => new SubmitButtonBehaviorCtor()]
    : undefined;

  connectedCallback() {
    if (!supportsSubmitBehavior && !this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }

    if (!supportsSubmitBehavior) {
      this.setAttribute('role', 'button');
      this.addEventListener('click', this._onFallbackActivate);
      this.addEventListener('keydown', this._onFallbackKeydown);
    }
  }

  disconnectedCallback() {
    if (!supportsSubmitBehavior) {
      this.removeEventListener('click', this._onFallbackActivate);
      this.removeEventListener('keydown', this._onFallbackKeydown);
    }
  }

  _onFallbackActivate = () => {
    this.closest('form')?.requestSubmit();
  };

  /** @param {KeyboardEvent} event */
  _onFallbackKeydown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.click();
  };
}

customElements.define('simple-submit-button', SimpleSubmitButton);

class A11ySubmitButton extends BlkMixinInternalsBase(HTMLElement) {
  static formAssociated = true;

  static observedAttributes = ['name', 'value', 'formmethod'];

  // Override createBehaviors() to retain a reference for later attribute sync.
  createBehaviors() {
    if (SubmitButtonBehaviorCtor) {
      this._submitBehavior = new SubmitButtonBehaviorCtor();
      return [this._submitBehavior];
    }
  }

  connectedCallback() {
    if (!supportsSubmitBehavior && !this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }

    if (this._submitBehavior) {
      this._submitBehavior.name = this.getAttribute('name') ?? '';
      this._submitBehavior.value = this.getAttribute('value') ?? '';
      this._submitBehavior.formMethod = this.getAttribute('formmethod') ?? null;
    }

    if (!supportsSubmitBehavior) {
      this.setAttribute('role', 'button');
      this.addEventListener('click', this._onFallbackActivate);
      this.addEventListener('keydown', this._onFallbackKeydown);
    }
  }

  disconnectedCallback() {
    if (!supportsSubmitBehavior) {
      this.removeEventListener('click', this._onFallbackActivate);
      this.removeEventListener('keydown', this._onFallbackKeydown);
    }
  }

  /** @param {string} name @param {string | null} _old @param {string | null} value */
  attributeChangedCallback(name, _old, value) {
    if (!this._submitBehavior) {
      return;
    }
    if (name === 'name') this._submitBehavior.name = value ?? '';
    if (name === 'value') this._submitBehavior.value = value ?? '';
    if (name === 'formmethod') this._submitBehavior.formMethod = value ?? null;
  }

  _onFallbackActivate = () => {
    this.closest('form')?.requestSubmit();
  };

  /** @param {KeyboardEvent} event */
  _onFallbackKeydown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.click();
  };
}

if (!customElements.get('a11y-submit-button')) {
  customElements.define('a11y-submit-button', A11ySubmitButton);
}

class A11ySubmitButtonDemo extends LitElement {
  static properties = {
    _simpleSubmitLog: {state: true},
    _submitLog: {state: true},
    _btnName: {state: true},
    _btnValue: {state: true},
    _btnFormMethod: {state: true},
  };

  static styles = css`
    :host {
      --bg: #f9fafb;
      --surface: #fff;
      --line: #d8dee9;
      --ink: #0f172a;
      --muted: #475569;
      --accent: #005a9c;
      display: block;
      box-sizing: border-box;
      padding: 1.5rem;
      margin: 1.5rem auto;
      max-inline-size: 64rem;
      background: var(--bg);
      border: 1px solid var(--line);
      color: var(--ink);
      font-family: sans-serif;
    }

    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
    }

    p {
      margin: 0.25rem 0 1rem;
      color: var(--muted);
      font-size: 0.95rem;
    }

    form {
      display: grid;
      gap: 0.75rem;
      background: var(--surface);
      border: 1px solid var(--line);
      padding: 1rem;
    }

    label {
      display: grid;
      gap: 0.375rem;
      font-size: 0.9rem;
    }

    input,
    select {
      font: inherit;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--line);
    }

    simple-submit-button,
    a11y-submit-button {
      user-select: none;
      justify-self: start;
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 0.625rem 0.9rem;
      cursor: pointer;
      font-weight: 600;
      letter-spacing: 0.02em;
      background: #e7f1fa;
    }

    simple-submit-button:focus-visible,
    a11y-submit-button:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    div:has(> section) {
      display: flex;
      align-items: flex-end;
      gap: 2rem;
    }

    section {
      display: grid;
      gap: 0.75rem;
      margin-block-start: 1.25rem;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
    }

    .behavior-controls {
      margin-block-end: 1rem;
      padding: 0.875rem;
      border: 1px dashed var(--line);
      background: var(--surface);
    }

    .behavior-controls p {
      margin: 0 0 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .behavior-controls-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    pre {
      margin: 0;
      background: #0b1220;
      color: #d7e2ff;
      padding: 0.875rem;
      overflow: auto;
      font-size: 0.85rem;
    }
  `;

  constructor() {
    super();
    this._simpleSubmitLog = 'No submissions yet';
    this._submitLog = 'No submissions yet';
    this._btnName = 'intent';
    this._btnValue = 'primary';
    this._btnFormMethod = '';
  }

  firstUpdated() {
    const simpleForm = /** @type {HTMLFormElement | null} */ (
      this.renderRoot.querySelector('form[data-demo="simple"]')
    );
    const advancedForm = /** @type {HTMLFormElement | null} */ (
      this.renderRoot.querySelector('form[data-demo="advanced"]')
    );
    if (!simpleForm || !advancedForm) {
      return;
    }

    simpleForm.addEventListener('submit', (event) => {
      const submitEvent = /** @type {SubmitEvent} */ (event);
      event.preventDefault();
      const data = Object.fromEntries(new FormData(simpleForm));
      // FormData(form, submitter) only accepts native buttons — add custom submitter data manually
      const sub = submitEvent.submitter;
      const submitter = sub?.localName ?? 'unknown';
      this._simpleSubmitLog = JSON.stringify(
        {
          supportsSubmitBehavior,
          submitter,
          data,
        },
        null,
        2
      );
    });

    advancedForm.addEventListener('submit', (event) => {
      const submitEvent = /** @type {SubmitEvent} */ (event);
      event.preventDefault();
      const data = Object.fromEntries(new FormData(advancedForm));
      // FormData(form, submitter) only accepts native buttons — add custom submitter data manually
      const sub = submitEvent.submitter;
      const subName = sub?.getAttribute('name');
      if (subName) {
        data[subName] = sub?.getAttribute('value') ?? '';
      }

      const submitter = sub?.localName ?? 'unknown';
      this._submitLog = JSON.stringify(
        {
          supportsSubmitBehavior,
          submitter,
          data,
        },
        null,
        2
      );
    });
  }

  render() {
    return html`
      <h2>A11y submit button demo</h2>
      <p>
        <a
          href="https://microsoftedge.github.io/Demos/platform-provided-behaviors-for-custom-elements/"
          target="_blank"
          rel="noopener noreferrer">
          [Platform-provided behaviors for custom elements]
        </a>
      </p>
      <p>
        HTMLSubmitButtonBehavior support:
        <strong>${supportsSubmitBehavior ? 'yes' : 'no'}</strong>
      </p>
      <div>
        <section>
          <h3>Simple case: static internalsBehaviors</h3>
          <p>This button uses a static factory and does not keep a behavior reference.</p>
          <form data-demo="simple">
            <blk-input label="name" name="name" placeholder="Type and submit" required></blk-input>
            <simple-submit-button>Submit</simple-submit-button>
            <button hidden>Native submit</button>
          </form>
          <p>Latest simple submit:</p>
          <pre>${this._simpleSubmitLog}</pre>
        </section>

        <section>
          <h3>Advanced case: override createBehaviors()</h3>
          <div class="behavior-controls">
            <p>Button attributes -> _submitBehavior</p>
            <div class="behavior-controls-grid">
              <label>
                name
                <input
                  .value=${this._btnName}
                  @input=${
                    /** @param {Event} e */ (e) =>
                      (this._btnName = /** @type {HTMLInputElement} */ (e.target).value)
                  } />
              </label>
              <label>
                value
                <input
                  .value=${this._btnValue}
                  @input=${
                    /** @param {Event} e */ (e) =>
                      (this._btnValue = /** @type {HTMLInputElement} */ (e.target).value)
                  } />
              </label>
              <label>
                formmethod
                <select
                  .value=${this._btnFormMethod}
                  @change=${
                    /** @param {Event} e */ (e) =>
                      (this._btnFormMethod = /** @type {HTMLSelectElement} */ (e.target).value)
                  }>
                  <option value="">— (default)</option>
                  <option value="get">get</option>
                  <option value="post">post</option>
                  <option value="dialog">dialog</option>
                </select>
              </label>
            </div>
          </div>

          <form data-demo="advanced">
            <label>
              Name
              <input name="name" placeholder="Type and submit" required />
            </label>
            <a11y-submit-button
              name=${this._btnName}
              value=${this._btnValue}
              formmethod=${this._btnFormMethod}
              >Submit</a11y-submit-button
            >
          </form>
          <p>Latest advanced submit:</p>
          <pre>${this._submitLog}</pre>
        </section>
      </div>
    `;
  }
}

customElements.define('a11y-submit-button-demo', A11ySubmitButtonDemo);
