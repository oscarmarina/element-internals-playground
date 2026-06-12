export {};

/**
 * @typedef {import('../../blk-mixin-element-internals/src/BlkFormValidationEvent').BlkFormValidationEvent} BlkFormValidationEvent
 */

/**
 * @typedef {HTMLElement & {name?: string, value?: string}} NamedValueElement
 */

/**
 * @param {HTMLFormElement | null} form
 */
const handleFormSubmit = (form) => {
  if (!form) {
    return;
  }

  form.addEventListener('submit', (ev) => {
    if (!form.checkValidity()) {
      ev.preventDefault();
      return;
    }
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  });
};

/** @type {HTMLFormElement | null} */
const blkFormElement = /** @type {HTMLFormElement | null} */ (document.getElementById('form-sec1'));

handleFormSubmit(blkFormElement);

blkFormElement?.addEventListener('validation', (e) => {
  /** @type {NamedValueElement | null} */
  const el = e.target instanceof HTMLElement ? e.target : null;
  if (!el) {
    return;
  }

  console.log(`validation [${el.name}=${el.value}] valid=${e.valid}`);
});

/** @type {HTMLFormElement | null} */
const nativeForm = /** @type {HTMLFormElement | null} */ (document.getElementById('form-native'));

/**
 * @param {HTMLInputElement | null} input
 * @param {string} errorId
 */
const toggle = (input, errorId) => {
  if (!input) {
    return;
  }

  const err = document.getElementById(errorId);
  if (!err) {
    return;
  }

  const update = () => err.classList.toggle('visible', !input.validity.valid);
  input.addEventListener('invalid', update);
  input.addEventListener('change', update);
};
const nativeTermsInput = document.getElementById('n-terms');
toggle(nativeTermsInput instanceof HTMLInputElement ? nativeTermsInput : null, 'n-termsError');

/** @type {HTMLInputElement[]} */
const nativeContactInputs = nativeForm
  ? Array.from(nativeForm.querySelectorAll('input[name="n-contact"]'))
  : [];
nativeContactInputs.forEach((r) => toggle(r, 'n-contactError'));

handleFormSubmit(nativeForm);
nativeForm?.addEventListener('reset', () => {
  nativeForm?.querySelectorAll('.error-native').forEach((e) => e.classList.remove('visible'));
});
