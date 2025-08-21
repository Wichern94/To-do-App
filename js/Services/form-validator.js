export class FormValidator {
  static validateOneInput(inputValue, name, formErrors) {
    const sepcialChars = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (!inputValue) {
      formErrors.showError(name, 'Name it!');
      return false;
    }
    if (sepcialChars.test(inputValue)) {
      formErrors.showError(name, 'field contains illegal characters');
      return false;
    }
    if (inputValue && inputValue.length < 3) {
      formErrors.showError(name, 'Name is too short');
      return false;
    }

    if (!hasError) {
      return true;
    }
  }
}
