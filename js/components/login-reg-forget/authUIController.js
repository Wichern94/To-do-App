import { FormErrors } from '../../Services/validators/uiErrorHandler.js';

export class AuthUIController {
  constructor(viewManager) {
    this.viewManager = viewManager;
    this.LoginErrorHandler = new FormErrors('lgn-form');
    this.regErrorHandler = new FormErrors('register-form');
    this.forgetErrorHandler = new FormErrors('forget-form');
    this.bindScreenEvents();
    this.getActiveView();
  }

  bindScreenEvents() {
    const logBackBtns = document.querySelectorAll('.log-back-btn');
    const forgetBtn = document.querySelector('.forget-link');
    const regstrBtn = document.querySelector('.register-link');

    forgetBtn.addEventListener('click', (e) => this.showFrgt(e));

    regstrBtn.addEventListener('click', (e) => this.showRgstr(e));

    logBackBtns.forEach((btns) =>
      btns.addEventListener('click', (e) => this.showLogIn(e))
    );
  }

  showFrgt(e) {
    e.preventDefault();

    this.viewManager.showView('forget-screen');
  }

  showRgstr(e) {
    e.preventDefault();

    this.viewManager.showView('register-screen');
  }

  showLogIn(e) {
    e.preventDefault();
    this.viewManager.hideOneView('forget-screen');

    this.viewManager.showView('login-screen');
  }

  logout() {
    this.viewManager.hideOneView('todo-screen');
    this.viewManager.showView('login-screen');
  }

  getActiveView() {
    if (document.getElementById('login-screen')?.offsetParent !== null) {
      return 'login';
    }
    if (document.getElementById('register-screen')?.offsetParent !== null) {
      return 'register';
    }
    if (document.getElementById('forget-screen')?.offsetParent !== null) {
      return 'reset';
    }
    if (document.getElementById('todo-screen')?.offsetParent !== null) {
      return 'apk';
    }
    return null;
  }
}
