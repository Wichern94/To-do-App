import { fireApp } from './Services/firebase/firebase-init.js';
import { AuthService } from './Services/firebase/authFirebase.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';

import { ViewManager } from './Services/view-mangers/viewManager.js';

import { AuthController } from './components/login-reg-forget/AuthController.js';
import { AuthUIController } from './components/login-reg-forget/authUIController.js';

import { LoginFormHandler } from './components/login-reg-forget/formHandlers.js';
import { RegisterFormHandler } from './components/login-reg-forget/formHandlers.js';
import { ResetFormHandler } from './components/login-reg-forget/formHandlers.js';

import { TodoApp } from './todo.js';

class App {
  constructor() {
    this.viewManager = new ViewManager();
    this.authUi = new AuthUIController(this.viewManager);
    this.authService = new AuthService(getAuth(fireApp));
    this.authController = new AuthController(
      this.viewManager,
      this.authService,
      this.authUi
    );
    this.activeHandler = null;
    this.todoApp = null;
    this.cleanUpInactiveViews();
    this.initializeForm();
    this.formChecker();
  }

  initializeForm() {
    document.addEventListener('view:changed', () => this.formChecker());
  }

  cleanUpInactiveViews() {
    const inactiveViews = [
      new RegisterFormHandler(
        this.authUi,
        'register-form',
        'email-reg',
        'password-reg',
        'confirm-password'
      ),
      new ResetFormHandler(this.authUi, 'forget-form', 'useremail'),
    ];
    inactiveViews.forEach((handler) => {
      if (handler.destroy) {
        handler.destroy();
      }
    });
  }

  formChecker() {
    if (this.activeHandler?.destroy) {
      this.activeHandler.destroy();
    }
    this.activeHandler = null;

    const activeView = this.authUi.getActiveView();

    switch (activeView) {
      case 'login':
        this.loginHandler = new LoginFormHandler(
          this.authUi,
          'lgn-form',
          'email',
          'password'
        );
        this.activeHandler = this.loginHandler;

        break;

      case 'register':
        this.registerHandler = new RegisterFormHandler(
          this.authUi,
          'register-form',
          'email-reg',
          'password-reg',
          'confirm-password'
        );
        this.activeHandler = this.registerHandler;

        break;

      case 'reset':
        this.resetHandler = new ResetFormHandler(
          this.authUi,
          'forget-form',
          'useremail'
        );
        this.activeHandler = this.resetHandler;
        this.resetHandler.init();

        break;
    }
  }
}

const auth = getAuth(fireApp);
const app = new App();
onAuthStateChanged(auth, (user) => {
  if (user) {
    const appBody = document.getElementById('app');
    appBody.classList.remove('hidden');

    app.viewManager.showView('todo-screen');
    if (app.todoApp === null) {
      app.todoApp = new TodoApp(user, app.viewManager);
    }
  } else {
    document.dispatchEvent(new CustomEvent('auth:signout:ended'));
    app.authController.isSigningOut = false;
    if (app.todoApp) {
      app.todoApp.destroy();
      app.todoApp = null;
    }
    app.viewManager.showView('login-screen');
  }
});
