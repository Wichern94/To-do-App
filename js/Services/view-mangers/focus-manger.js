export class FocusManger {
  static #active = null;
  static #backgroundElements = new Map(); // Map to store the original tabindex values of background elements
  static #previousFocusedElement = null;

  static #getElements(modal) {
    // Selector for all potentially focusable elements
    const selectors =
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), dialog';

    const focusableCandidates = Array.from(modal.querySelectorAll(selectors));

    const focusableElements = focusableCandidates.filter((el) => {
      const closestHiddenAncestor = el.closest('.hidden');

      if (closestHiddenAncestor && closestHiddenAncestor !== modal) {
        return false;
      }

      if (el.offsetParent === null) {
        return false;
      }

      return true;
    });

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      return { first: firstElement, last: lastElement };
    }
    // If the list is empty, return undefined
    return undefined;
  }

  static #trapFocus(e, modal, { first, last }) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // --- Added logic to block the background (solves the aria-hidden issue) ---

  static #blockBackground(modalElement) {
    this.#previousFocusedElement = document.activeElement;

    // Find all sibling elements that are not the modal
    const siblings = Array.from(modalElement.parentElement.children).filter(
      (el) => el !== modalElement && el.nodeType === 1
    );

    siblings.forEach((sibling) => {
      // Save original attributes
      const originalTabIndex = sibling.getAttribute('tabindex');
      const originalAriaHidden = sibling.getAttribute('aria-hidden');

      this.#backgroundElements.set(sibling, {
        originalTabIndex,
        originalAriaHidden,
      });

      // Set tabindex -1 to block keyboard focus
      sibling.setAttribute('tabindex', '-1');
      // Set aria-hidden="true" to hide the background from screen readers
      sibling.setAttribute('aria-hidden', 'true');
    });
  }

  static #unblockBackground() {
    this.#backgroundElements.forEach((originals, sibling) => {
      // Restoring original tabindex
      if (originals.originalTabIndex !== null) {
        sibling.setAttribute('tabindex', originals.originalTabIndex);
      } else {
        sibling.removeAttribute('tabindex');
      }

      // Restoring original aria-hidden
      if (originals.originalAriaHidden !== null) {
        sibling.setAttribute('aria-hidden', originals.originalAriaHidden);
      } else {
        sibling.removeAttribute('aria-hidden');
      }
    });
    this.#backgroundElements.clear();

    // Restoring focus
    if (this.#previousFocusedElement) {
      this.#previousFocusedElement.focus();
      this.#previousFocusedElement = null;
    }
  }

  // --------------------------------------------------------------------------

  static setModalFocus(modal) {
    if (this.#active) {
      this.releaseModalFocus(); // Ensure the previous handler is removed
    }

    // 1. Block background and save previous focus
    this.#blockBackground(modal);

    const elements = this.#getElements(modal);

    if (!elements) {
      // No focusable elements: focus the modal itself
      modal.setAttribute('tabindex', '-1');
      modal.focus();
      return;
    }

    // 2. Set focus on the first visible modal element (immediately)
    elements.first.focus();

    // 3. Set the focus trap
    const handler = (e) => this.#trapFocus(e, modal, elements);
    modal.addEventListener('keydown', handler);
    this.#active = { el: modal, handler };
  }

  static releaseModalFocus() {
    if (this.#active) {
      this.#active.el.removeEventListener('keydown', this.#active.handler);
      this.#active = null;
    }
    // Unban background and restore focus
    this.#unblockBackground();
  }
}
