export class FormValidator {
  static validateOneInput(inputValue, name, formErrors) {
    const sepcialChars = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const value = String(inputValue ?? '').trim();

    if (!value) {
      formErrors.showError(name, 'Name it!');
      return false;
    } else if (sepcialChars.test(value)) {
      formErrors.showError(name, 'field contains illegal characters');
      return false;
    } else if (value && value.length < 3) {
      formErrors.showError(name, 'Name is too short');
      return false;
    } else return true;
  }
}
