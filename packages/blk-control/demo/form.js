export {};

/**
 * @typedef {import('../../blk-mixin-element-internals/src/BlkFormValidationEvent').BlkFormValidationEvent} BlkFormValidationEvent
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Renders the submitted FormData entries into the section's output panel.
 * Clears the panel on reset.
 *
 * @param {HTMLFormElement} form
 * @param {string} outputId - ID of the <pre> element to write into
 */
const bindFormOutput = (form, outputId) => {
  const output = document.getElementById(outputId);
  if (!output) return;

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    // A submit attempt ends the "just reset" grace period so :user-invalid
    // errors can surface again on native inputs.
    form.classList.remove('just-reset');

    if (!form.checkValidity()) {
      // checkValidity() on each input fires the `invalid` event, which activates
      // :user-invalid without showing the browser's native tooltip (reportValidity
      // would open the tooltip, which we don't want with novalidate forms).
      form.querySelectorAll('input').forEach((i) => i.checkValidity());
      output.textContent = '';
      return;
    }

    const entries = [...new FormData(form).entries()];
    output.textContent = entries.length
      ? entries.map(([k, v]) => `${k}: ${v}`).join('\n')
      : '(no fields submitted)';
  });

  form.addEventListener('reset', () => {
    output.textContent = '';
    // :user-invalid persists after reset in current browsers — apply a transient
    // class to suppress the stale error state until the user interacts again.
    form.classList.add('just-reset');
  });

  // Remove the suppressor class on the first interaction after reset.
  form.addEventListener('change', () => form.classList.remove('just-reset'), {capture: true});
};

/**
 * Logs `validation` events from blk-control / blk-control-ssr to the console.
 *
 * @param {HTMLFormElement} form
 */
const bindValidationLog = (form) => {
  form.addEventListener('validation', (e) => {
    const el = /** @type {HTMLElement & {name?: string, value?: string}} */ (e.target);
    console.log(`[${form.id}] validation [${el.name}=${el.value}] valid=${e.valid}`);
  });
};

// ── Section 1: <blk-control> ─────────────────────────────────────────────────

const formSec1 = /** @type {HTMLFormElement | null} */ (document.getElementById('form-sec1'));
if (formSec1) {
  bindFormOutput(formSec1, 'output-sec1');
  bindValidationLog(formSec1);
}

// ── Section 2: <blk-control-ssr> ─────────────────────────────────────────────

const formSec2 = /** @type {HTMLFormElement | null} */ (document.getElementById('form-sec2'));
if (formSec2) {
  bindFormOutput(formSec2, 'output-sec2');
  bindValidationLog(formSec2);
}

// ── Section 3: Native <input> reference ──────────────────────────────────────
// Error display is handled entirely via CSS :user-invalid — no JS needed.
// We only wire up the submit/reset to show FormData in the output panel.

const formNative = /** @type {HTMLFormElement | null} */ (document.getElementById('form-native'));
if (formNative) {
  bindFormOutput(formNative, 'output-native');
}
