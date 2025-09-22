export class FormErrors {
  constructor(formSelector) {
    this.form = document.getElementById(formSelector);
    this.inputs = this.form.querySelectorAll('input');
    this.errorElement = this.form.querySelectorAll('.err-message');
  }

  showError(rightInput, errMessage) {
    const targetError = Array.from(this.errorElement).find(
      (el) => el.dataset.for === rightInput
    );
    const inputElement = this.form.querySelector(`[name='${rightInput}']`);

    if (targetError) {
      targetError.textContent = errMessage;
      targetError.classList.remove('hidden');
    }

    if (inputElement.tagName === 'INPUT') {
      inputElement.classList.add('input-error');
    } else if (inputElement.tagName === 'TEXTAREA') {
      inputElement.classList.add('error-border');
    }
  }

  clearError(rightInput) {
    const inputElement = this.form.querySelector(`[name='${rightInput}']`);
    if (!inputElement) {
      console.warn(`Could not find the element named: ${rightInput}!`);
    }
    const targetError = Array.from(this.errorElement).find(
      (el) => el.dataset.for === rightInput
    );
    if (targetError) {
      targetError.textContent = '';
      targetError.classList.add('hidden');
    }
    if (inputElement.tagName === 'INPUT') {
      inputElement.classList.remove('input-error');
    } else if (inputElement.tagName === 'TEXTAREA') {
      inputElement.classList.remove('error-border');
    }
  }
  clearAllErrors() {
    this.errorElement.forEach((err) => {
      err.textContent = '';
      err.classList.add('hidden');
    });
    this.inputs.forEach((inpt) => {
      inpt.classList.remove('input-error');
    });
  }
}
