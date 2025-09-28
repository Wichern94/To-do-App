import { ToastManager } from '../../Services/toastify-manger.js';

export class AuthController {
  constructor(viewManger, authService, authUI) {
    this.viewManger = viewManger;
    this.authService = authService;
    this.authUI = authUI;
    this.init();
    this.isSigningOut = null;
  }
  init() {
    document.addEventListener(
      'auth:login',
      async (e) => await this.handleLogin(e.detail)
    );

    document.addEventListener('auth:register', (e) =>
      this.handleRegister(e.detail)
    );

    document.addEventListener('auth:reset-password', (e) =>
      this.handlePswrdReset(e.detail)
    );

    document.addEventListener(
      'auth:logout',
      async (e) => await this.handleLogout()
    );
  }

  async handleRegister(values) {
    try {
      const { email, password } = values;
      await this.authService.registerUser(email, password);

      this.viewManger.showView('login-screen');
      ToastManager.success('👍 Registration successful. You can log in now!');
    } catch (err) {
      console.error('Registration error:', err.code);

      if (err.code === 'auth/email-already-in-use') {
        this.authUI.regErrorHandler.showError(
          'email-reg',
          'This email is already taken'
        );
      } else if (err.code === 'auth/weak-password') {
        this.authUI.regErrorHandler.showError(
          'password-reg',
          'Password is too weak'
        );
      } else {
        ToastManager.error();
        alert('Registration failed. Please try again.');
      }
    }
  }

  async handleLogin(values) {
    try {
      const { email, password } = values;
      const user = await this.authService.loginUser(email, password);

      ToastManager.success('Logged in!');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          this.authUI.LoginErrorHandler.showError('email', 'User not found');
          break;

        case 'auth/wrong-password':
          this.authUI.LoginErrorHandler.showError(
            'password',
            'Invalid password!'
          );
          break;

        case 'auth/invalid-email':
          this.authUI.LoginErrorHandler.showError(
            'email',
            'Invalid email format'
          );
          break;

        case 'auth/user-disabled':
          this.authUI.LoginErrorHandler.showError(
            'email',
            'Account deactivated!'
          );
          break;

        case 'auth/too-many-requests':
          this.authUI.LoginErrorHandler.showError(
            'email',
            'Too many login attempts!'
          );
          break;

        case 'auth/invalid-credential':
          this.authUI.LoginErrorHandler.showError(
            'email',
            'Incorrect email or password'
          );
          break;
        default:
          console.error('Login error:', err.code);
      }
    }
  }

  async handlePswrdReset({ email }) {
    try {
      await this.authService.resetPassword(email);
      ToastManager.success('Email sent, please check your inbox!');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          this.authUI.forgetErrorHandler.showError(
            'useremail',
            'User not found'
          );
          break;

        case 'auth/invalid-email':
          this.authUI.forgetErrorHandler.showError(
            'useremail',
            'Invalid format.'
          );
          break;

        case 'auth/too-many-requests':
          this.authUI.forgetErrorHandler.showError(
            'useremail',
            'Too many attempts.'
          );
          break;

        default:
          console.error('Reset error:', err.code);
      }
    }
  }
  async handleLogout() {
    try {
      if (this.isSigningOut) return;
      this.isSigningOut = true;
      document.dispatchEvent(new CustomEvent('auth:signout:started'));
      await this.authService.logOut();

      sessionStorage.setItem('postLogoutToast', '1');
      location.replace(location.href);
    } catch (error) {
      console.error('błąd wylogowania', error.code, error.message);
    }
  }
}
