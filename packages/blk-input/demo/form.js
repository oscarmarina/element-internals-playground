/**
 * @param {HTMLInputElement} input
 */
const handleNativeInputValidation = (input) => {
  const errorElement = document.getElementById(`${input.id}Error`);
  if (!errorElement) return;

  const handleValidation = () => {
    const isValid = input.validity.valid;
    input.setAttribute('aria-invalid', String(!isValid));
    errorElement.classList.toggle('visible', !isValid);
  };

  input.addEventListener('input', handleValidation);
  input.addEventListener('invalid', handleValidation);
};

/**
 * @param {HTMLFormElement} form
 */
const handleFormSubmit = (form) => {
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

document.querySelectorAll('form').forEach((form) => {
  form.querySelectorAll('input').forEach((input) => handleNativeInputValidation(input));

  form.addEventListener('reset', () => {
    form.querySelectorAll('input').forEach((input) => {
      input.removeAttribute('aria-invalid');
      const errorElement = document.getElementById(`${input.id}Error`);
      if (errorElement) errorElement.classList.remove('visible');
    });
  });

  handleFormSubmit(form);
});
