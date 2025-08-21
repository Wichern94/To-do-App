export class FormValidator {
  static validateOneInput(inputValue, name, formErrors) {
    const sepcialChars = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    let hasError = false;
    if (!inputValue) {
      formErrors.showError(name, 'Name it!');
      return (hasError = true);
    }
    if (sepcialChars.test(inputValue)) {
      formErrors.showError(name, 'field contains illegal characters');
      return (hasError = true);
    }
    if (inputValue && inputValue.length < 3) {
      formErrors.showError(name, 'Name is too short');
      return (hasError = true);
    }

    if (!hasError) {
      return true;
    }
  }
}
