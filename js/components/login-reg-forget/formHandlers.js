import { FormErrors } from '../../Services/validators/uiErrorHandler.js';

export class ResetFormHandler {
  constructor(authUI, formID, formEmail) {
    this.authUI = authUI;
    this.credentialsForm = document.getElementById(formID);
    this.formErrors = new FormErrors(formID);
    this.formEmailName = formEmail;
    this.emailInput = this.credentialsForm.querySelector(
      `input[name="${formEmail}"]`
    );

    this.setupResetErrorClearing();
  }
  init() {
    this.handleSubmit = this.setupForgetForm.bind(this);
    this.credentialsForm.addEventListener('submit', this.handleSubmit);
  }
  setupForgetForm(e) {
    e.preventDefault();
    this.formErrors.clearAllErrors();

    const email = this.emailInput.value.trim();
    let hasError = false;
    if (!email) {
      this.formErrors.showError('useremail', 'Email is required');
      hasError = true;
    } else if (!this.isValidEmail(email)) {
      this.formErrors.showError('useremail', 'Invalid email!');
      hasError = true;
    }
    if (!hasError) {
      document.dispatchEvent(
        new CustomEvent('auth:reset-password', { detail: { email } })
      );
    }
  }
  destroy() {
    this.credentialsForm.removeEventListener('submit', this.handleSubmit);
  }

  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  setupErrorClearing() {
    this.emailInput.addEventListener('focus', () => {
      this.formErrors.clearError(this.formEmailName);
    });
  }
  setupResetErrorClearing() {
    this.emailInput.addEventListener('focus', () => {
      this.formErrors.clearError(this.formEmailName);
    });
  }
}

export class LoginFormHandler extends ResetFormHandler {
  constructor(authUI, formID, formEmail, formPass) {
    super(authUI, formID, formEmail);
    this.formPassName = formPass;
    this.passwordInput = this.credentialsForm.querySelector(
      `input[name="${formPass}"]`
    );
    this.handleSubmit = this.setupFormLogin.bind(this);
    this.credentialsForm.addEventListener('submit', this.handleSubmit);

    this.setupErrorClearing();
  }

  setupFormLogin(e) {
    e.preventDefault();
    this.formErrors.clearAllErrors();
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value.trim();
    let hasError = false;
    if (email === '') {
      this.formErrors.showError('email', 'All fields are required!');
      hasError = true;
    }
    if (password === '') {
      this.formErrors.showError('password', 'All fields are required!');
      hasError = true;
    }
    if (!hasError) {
      const values = { email, password };
      document.dispatchEvent(new CustomEvent('auth:login', { detail: values }));
    }
  }
  destroy() {
    this.credentialsForm.removeEventListener('submit', this.handleSubmit);
    super.destroy();
  }

  setupErrorClearing() {
    super.setupErrorClearing();
    this.passwordInput.addEventListener('focus', () => {
      this.formErrors.clearError(this.formPassName);
    });
  }
}

export class RegisterFormHandler extends ResetFormHandler {
  constructor(authUI, formID, formEmail, formPass, formConfirmPass) {
    super(authUI, formID, formEmail);
    this.confirmPasswordInput = this.credentialsForm.querySelector(
      `input[name="${formConfirmPass}"]`
    );

    this.formPassName = formPass;
    this.confirmPswrd = formConfirmPass;
    this.passwordInput = this.credentialsForm.querySelector(
      `input[name="${formPass}"]`
    );
    this.handleSubmit = this.setupRegisterForm.bind(this);
    this.credentialsForm.addEventListener('submit', this.handleSubmit);

    this.setupErrorClearing();
  }

  setupRegisterForm(e) {
    e.preventDefault();
    this.formErrors.clearAllErrors();

    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value.trim();
    const confirmPassword = this.confirmPasswordInput.value.trim();
    let hasError = false;

    if (password && confirmPassword && password !== confirmPassword) {
      this.formErrors.showError('confirm-password', 'Passwords do not match.');
      hasError = true;
    }
    if (!email) {
      this.formErrors.showError('email-reg', 'Email is required');
      hasError = true;
    }
    if (!password) {
      this.formErrors.showError('password-reg', 'Password is required');
      hasError = true;
    } else if (password.length < 6) {
      this.formErrors.showError('password-reg', 'Password is too short');
      hasError = true;
    }
    if (!this.isValidEmail(email)) {
      this.formErrors.showError('email-reg', 'Invalid email!');
      hasError = true;
    }
    if (!hasError) {
      const values = { email, password };
      document.dispatchEvent(
        new CustomEvent('auth:register', { detail: values })
      );
    }
  }

  destroy() {
    this.credentialsForm.removeEventListener('submit', this.handleSubmit);
    super.destroy();
  }

  // kasowanie błedów
  setupErrorClearing() {
    super.setupErrorClearing();
    this.passwordInput.addEventListener('focus', () => {
      this.formErrors.clearError(this.formPassName);
    });
    this.confirmPasswordInput.addEventListener('focus', () => {
      this.formErrors.clearError(this.confirmPswrd);
    });
  }
}
