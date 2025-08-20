import { FormErrors } from '../../uiErrorHandler.js';
export class ListView {
  constructor(root = '.todo', { animationManager } = {}) {
    const rootEl =
      typeof root === 'string' ? document.querySelector(root) : root;
    if (!rootEl) {
      throw new Error('List root not found (selector or element invalid)');
    }
    // UI roots
    this.ui = { root: rootEl };

    this._q = (sel) => this.ui.root.querySelector(sel);
    this._qa = (sel) => this.ui.root.querySelectorAll(sel);

    this.ui.task = {
      list: this._q('.todo__list'),
    };

    this.ui.modal = {
      openModalBtn: this._q('#todo-open-modal-ID'),
      modalDialog: this._q('.task-modal'),
      modalFieldset: this._q('.task-modal__section'),
      form: this._q('#task-form'),
      submitBtn: this._q('.task-modal__btn--submit'),
      cancelBtn: this._q('.task-modal__btn--cancel'),
    };
    //local state:
    this.localStates = {
      bound: false,
      isLoading: false,
    };
    //handlers
    this.handlers = {
      onAdd: null,
      onToggle: null,
      onDelete: null,
      onEdit: null,
    };
    //services
    this.animationManager = animationManager || null;
    this.formManager = new FormErrors('task-form');

    this.listeners = [
      {
        el: this.ui.task.list,
        event: 'click',
        handler: this.listActions.bind(this),
      },
      {
        el: this.ui.modal.openModalBtn,
        event: 'click',
        handler: this.handleOpenModal.bind(this),
      },
      {
        el: this.ui.modal.cancelBtn,
        event: 'click',
        handler: this.handleCloseModal.bind(this),
      },
    ];
  }
  // Private, recursive method that loops through the entire this.ui object
  _findAndValidateUiElements(obj, parentKey = '') {
    Object.entries(obj).forEach(([key, el]) => {
      // We create the full path to the element
      const fullPath = parentKey ? `${parentKey}.${key}` : key;
      if (el instanceof Element) return;
      if (
        el instanceof NodeList ||
        el instanceof HTMLCollection ||
        Array.isArray(el)
      ) {
        for (const node of el) {
          if (!(node instanceof Element)) {
            console.warn(`Missing DOM element inside Collection:${fullPath}`);
          }
        }
        return;
      }

      // We check if the given element is an object and not a DOM element
      if (
        el &&
        typeof el === 'object' &&
        !(el instanceof Element) &&
        !(el instanceof NodeList) &&
        !(el instanceof HTMLCollection)
      ) {
        // If so, we call the function recursively on this nested object
        this._findAndValidateUiElements(el, fullPath);
        return;
      }
      // If it's not an object, we check if it's a DOM element
      if (!el) console.warn(`Missing DOM element: ${fullPath}`);
    });
  }

  activate() {
    if (this.localStates.bound) return;
    this._findAndValidateUiElements(this.ui);

    this.listeners.forEach(({ el, event, handler }) => {
      if (el) {
        el.addEventListener(event, handler);
      }
    });
    this.localStates.bound = true;
  }

  deactivate() {
    if (!this.localStates.bound) return;
    this.listeners.forEach(({ el, event, handler }) => {
      if (el) {
        el.removeEventListener(event, handler);
      }
    });
    this.localStates.bound = false;
  }

  bind(handlers = {}) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  listActions(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true')
      return;

    const actions = btn.dataset.action;
    if (!actions) return;

    switch (actions) {
      case 'open-modal':
        this.setupAccordion(btn);
        break;

      case 'toggle-task':
        this.handleToggletask(btn);
        break;
    }
  }

  async setupAccordion(btn) {
    const li = btn.closest('.task');
    const details = li.querySelector('[data-action="accordion-container"]');

    if (!details) return;

    await this.animationManager.toggleAccordeon(btn, details, li);
  }

  handleToggletask(btn) {
    console.log('kliknieto w:', this.animationManager);
  }

  async handleOpenModal() {
    const bluredOne = this.ui.modal.modalDialog;
    const fieldset = this.ui.modal.modalFieldset;

    await this.animationManager.blurInElement(bluredOne);
    await this.animationManager.showAnimation(fieldset, 'bounceInUp', '1s');
  }

  async handleCloseModal() {
    const bluredOne = this.ui.modal.modalDialog;
    const fieldset = this.ui.modal.modalFieldset;

    await this.animationManager.hideAnimation(fieldset, 'bounceOutDown', '1s');
    await this.animationManager.blurOutElement(bluredOne);
  }
}
