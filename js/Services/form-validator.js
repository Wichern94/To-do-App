const ERRORS = {
  E_TITLE_MISSING: 'Title is missing!',
  E_TITLE_TYPE: 'Title has an invalid data type!',
  E_TITLE_EMPTY: 'Title is empty!',
  E_TITLE_DUPLICATE: 'Title already exists!',
  E_TITLE_TOO_LONG: 'Title is too long!',
  E_VALUE_TOO_SHORT: 'Value is too short!',
  E_VALUE_EMPTY: 'Value is empty!',
  E_ILLEGAL_CHAR: 'Field contains illegal characters!',
  E_JSON_PARSE: 'Invalid JSON format!',
  E_TOPLEVEL_NOT_ARRAY: 'The root structure is not an array!',
  E_ITEM_NOT_OBJECT: 'One of the elements is not an object!',
  E_SUBTASKS_NOT_ARRAY: 'Subtasks are not an array!',
  E_SUBTASK_TYPE: 'Subtask has an invalid data type!',
  E_SUBTASK_EMPTY: 'Subtask is empty!',
  E_TOO_MANY_SUBTASKS: 'Too many subtasks!',
};

export default ERRORS;
export class FormValidator {
  static validateOneInput(inputValue, name, formErrors) {
    const sepcialChars = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const value = String(inputValue ?? '').trim();

    if (!value) {
      formErrors.showError(name, ERRORS.E_VALUE_EMPTY);
      return false;
    } else if (sepcialChars.test(value)) {
      formErrors.showError(name, ERRORS.E_ILLEGAL_CHAR);
      return false;
    } else if (value && value.length < 3) {
      formErrors.showError(name, ERRORS.E_VALUE_TOO_SHORT);
      return false;
    } else return true;
  }
}
