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
  }
  setLogoutListener() {
    this.button.addEventListener('click', this.#handleSendCustomEvent);
  }

  handleSendCustomEvent(e) {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('auth:logout'));
  }

  handleDisableButton() {
    this.button.disabled = true;
    this.button.setAttribute('aria-busy', 'true');
    this.button.blur(); // <- focus ring
  }

  handleEnableButton() {
    this.button.disabled = false;
    this.button.removeAttribute('aria-busy');
  }
  destroy() {
    this.button.removeEventListener('click', this.#handleSendCustomEvent);

    document.removeEventListener(
      'auth:signout:ended',
      this.#handleEnableButton
    );

    document.removeEventListener(
      'auth:signout:started',
      this.#handleDisableButton
    );
  }
}
