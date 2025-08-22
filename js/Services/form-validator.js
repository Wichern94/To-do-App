export class FormValidator {
  static validateOneInput(inputValue, name, formErrors) {
    const sepcialChars = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (!inputValue) {
      formErrors.showError(name, 'Name it!');
      return false;
    } else if (sepcialChars.test(inputValue)) {
      formErrors.showError(name, 'field contains illegal characters');
      return false;
    } else if (inputValue && inputValue.length < 3) {
      formErrors.showError(name, 'Name is too short');
      return false;
    } else return true;
  }
}
