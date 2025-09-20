export class LogoutButtonHandler {
  constructor() {
    this.root = document.getElementById('view-header');
    this.button = this.root.querySelector('[data-action="logout"]');
    this.setLogoutListener();
  }
  setLogoutListener() {
    if (!this.button) return;

    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('auth:logout'));
      window.location.reload();
    });
  }
}
