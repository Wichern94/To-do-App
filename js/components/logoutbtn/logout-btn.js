import { getAuth } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';

export class LogoutButtonHandler {
  #handleDisableButton = null;
  #handleEnableButton = null;
  #handleSendCustomEvent = null;

  constructor() {
    this.root = document.getElementById('view-header');
    this.button = this.root
      ? this.root.querySelector('[data-action="logout"]')
      : null;

    if (!this.button) return;

    this.#handleDisableButton = this.handleDisableButton.bind(this);
    this.#handleEnableButton = this.handleEnableButton.bind(this);
    this.#handleSendCustomEvent = this.handleSendCustomEvent.bind(this);

    document.addEventListener(
      'auth:signout:started',
      this.#handleDisableButton
    );
    document.addEventListener('auth:signout:ended', this.#handleEnableButton);

    this.setLogoutListener();

    const isLoggedIn = !!getAuth().currentUser;
    if (isLoggedIn) this.handleEnableButton();
    else this.handleDisableButton();

    document.addEventListener('view:changed', this.refreshButton.bind(this));
  }

  setLogoutListener() {
    this.button.addEventListener('click', this.#handleSendCustomEvent);
  }

  refreshButton() {
    const root = document.getElementById('view-header');
    const newBtn = root ? root.querySelector('[data-action="logout"]') : null;
    if (newBtn === this.button) return;

    if (this.button)
      this.button.removeEventListener('click', this.#handleSendCustomEvent);
    this.button = newBtn;
    if (this.button) {
      this.setLogoutListener();

      const isLoggedIn = !!getAuth().currentUser;
      if (isLoggedIn) this.handleEnableButton();
      else this.handleDisableButton();
    }
  }

  handleSendCustomEvent(e) {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('auth:logout'));
  }

  handleDisableButton() {
    if (!this.button) return;
    this.button.disabled = true;
    this.button.setAttribute('aria-busy', 'true');

    this.button.blur();
  }

  handleEnableButton() {
    if (!this.button) return;
    this.button.disabled = false;
    this.button.removeAttribute('aria-busy');
  }

  destroy() {
    this.button?.removeEventListener('click', this.#handleSendCustomEvent);
    document.removeEventListener(
      'auth:signout:ended',
      this.#handleEnableButton
    );
    document.removeEventListener(
      'auth:signout:started',
      this.#handleDisableButton
    );
    document.removeEventListener('view:changed', this.refreshButton);
  }
}
