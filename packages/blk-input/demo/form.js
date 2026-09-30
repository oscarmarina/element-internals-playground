/**
 * @param {HTMLInputElement} input
 */
const handleNativeInputValidation = (input) => {
  const handleValidation = () => {
    const isValid = input.validity.valid;
    input.setAttribute('aria-invalid', String(!isValid));
  };

  input.addEventListener('input', handleValidation);
  input.addEventListener('invalid', handleValidation);
};

/**
 * @param {HTMLFormElement} form
 * @param {HTMLElement | null} output
 */
const handleFormSubmit = (form, output) => {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    form.classList.remove('just-reset');

    if (!form.checkValidity()) {
      if (output) output.textContent = '';
      return;
    }

    const formData = new FormData(form);
    if (output) {
      const entries = [...formData.entries()];
      output.textContent = entries.length
        ? entries.map(([key, value]) => `${key}: ${value}`).join('\n')
        : '(no fields submitted)';
    }
  });

  form.addEventListener('reset', () => {
    if (output) output.textContent = '';
    form.classList.add('just-reset');
  });
};

document.querySelectorAll('form').forEach((form) => {
  form.querySelectorAll('input').forEach((input) => handleNativeInputValidation(input));
  const output = form.querySelector('.form-output');

  form.addEventListener('reset', () => {
    form.querySelectorAll('input').forEach((input) => {
      input.removeAttribute('aria-invalid');
    });
  });

  const clearResetState = () => form.classList.remove('just-reset');
  form.addEventListener('input', clearResetState, {capture: true});
  form.addEventListener('change', clearResetState, {capture: true});

  handleFormSubmit(form, output);
});

// referenceTarget section: tell whether the engine forwards `<label for>` natively
// or <blk-input-reference-target> is on the classic (aria-label) path.
const rtStatus = document.getElementById('rt-status');
if (rtStatus) {
  rtStatus.textContent =
    'referenceTarget' in ShadowRoot.prototype
      ? 'Supported: outside <label for> is forwarded natively to the inner control.'
      : 'Not supported in this browser: falls back to forwarding the label text as aria-label.';
}
