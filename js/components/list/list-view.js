import { FormErrors } from '../../uiErrorHandler.js';
import { FormValidator } from '../../Services/form-validator.js';
export class ListView {
  constructor(root = '.todo', { animationManager } = {}) {
    const rootEl =
      typeof root === 'string' ? document.querySelector(root) : root;
    if (!rootEl) {
      throw new Error('List root not found (selector or element invalid)');
    }
    /**
     * ========================================
     * ROOT + QUERYHELPER
     * ========================================
     */
    this.ui = { root: rootEl };

    this._q = (sel) => this.ui.root.querySelector(sel);
    this._qa = (sel) => this.ui.root.querySelectorAll(sel);

    this.ui.task = {
      list: this._q('.todo__list'),
    };

    this.ui.modal = {
      /**
       * ========================================
       *  MODAL WINDOWS
       * ========================================
       */
      modalDialog: this._q('.task-modal'),
      modalFieldset: this._q('.task-modal__section'),

      /**
       * ========================================
       * FORM ELEMENTS
       * ========================================
       */

      form: this._q('#list-form'),
      titleInput: this._q('#list-input'),
      detailsInput: this._q('#list-description'),

      /**
       * ========================================
       * BUTTONS
       * ========================================
       */

      submitBtn: this._q('.task-modal__btn--submit'),
      cancelBtn: this._q('.task-modal__btn--cancel'),
      openModalBtn: this._q('#todo-open-modal-ID'),
    };

    /**
     * ========================================
     * LOCAL STATES
     * ========================================
     */
    this.localStates = {
      bound: false,
      isLoading: false,
    };

    /**
     * ========================================
     * HANDLERS
     * ========================================
     */
    this.handlers = {
      onAdd: null,
      onToggle: null,
      onDelete: null,
      onEdit: null,
    };
    /**
     * ========================================
     * SERVICES
     * ========================================
     */
    this.animationManager = animationManager || null;
    this.formErrors = new FormErrors('list-form');

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
      {
        el: this.ui.modal.submitBtn,
        event: 'click',
        handler: this.handleSubmit.bind(this),
      },
      {
        el: this.ui.modal.form,
        event: 'click',
        handler: this.handleClearError.bind(this),
      },
    ];
  }
  /**
   * ========================================
   * INITIALIZATION METHODS
   * ========================================
   */
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

  bind(handlers = {}) {
    this.handlers = { ...this.handlers, ...handlers };
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

  /**
   * ========================================
   * UI SETUP METHODS
   * ========================================
   */

  listActions(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true')
      return;

    const actions = btn.dataset.action;
    if (!actions) return;

    switch (actions) {
      case 'accordion-toggle':
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

    await this.animationManager?.toggleAccordeon(btn, details, li);
  }
  setupConfettti(item) {
    const container = document.getElementById('view-standard');
    if (!container) return;

    const rect = item.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const relX = (centerX - contRect.left) / contRect.width;
    const relY = (centerY - contRect.top) / contRect.height;

    this.animationManager?.launchConfetti(container, relX, relY);
  }

  setupCharacterCounter() {
    const formElements = this._qa('input[maxlength], textarea[maxlength]');

    formElements.forEach((element) => {
      const counterSpan = this._q(`.char-counter[data-for="${element.id}"]`);

      if (counterSpan) {
        element.addEventListener('input', () => {
          const currentLength = element.value.length;
          const maxlength = element.getAttribute('maxlength');

          counterSpan.textContent = `${currentLength}/${maxlength}`;

          if (currentLength >= maxlength) {
            counterSpan.classList.add('exceeded');
            this.animationManager?.buttonOneAnimation(counterSpan, 'shakeX');
          } else {
            counterSpan.classList.remove('exceeded');
            this.animationManager?.buttonOneAnimation(counterSpan, 'jello');
          }
        });
      }
    });
  }

  /**
   * ========================================
   * OPEN/CLOSE HANDLERS METHODS
   * ========================================
   */
  async handleOpenModal(e) {
    const btn = e.target;
    const bluredOne = this.ui.modal.modalDialog;
    const fieldset = this.ui.modal.modalFieldset;

    this.animationManager?.buttonOneAnimation(btn, 'rubberBand');
    await this.animationManager?.blurInElement(bluredOne);
    await this.animationManager?.showAnimation(fieldset, 'bounceInUp', '1s');
    this.setupCharacterCounter();
  }

  async handleCloseModal(e) {
    const btn = e.target;
    const bluredOne = this.ui.modal.modalDialog;
    const fieldset = this.ui.modal.modalFieldset;

    this.animationManager?.buttonOneAnimation(btn, 'rubberBand');
    await this.animationManager?.hideAnimation(fieldset, 'bounceOutDown', '1s');
    await this.animationManager?.blurOutElement(bluredOne);

    this.formErrors.clearAllErrors();
    this.ui.modal.titleInput.value = '';
    this.ui.modal.detailsInput.value = '';
    this.handlerClearCounters();
  }
  /**
   * ========================================
   * FORM SUBMIT/DELETE METHODS
   * ========================================
   */
  async handleSubmit(e) {
    e.preventDefault();
    const btn = e.target;
    this.animationManager?.buttonOneAnimation(btn, 'rubberBand');

    try {
      const nameInputData = this.ui.modal.titleInput.value.trim();
      const isValid = FormValidator.validateOneInput(
        nameInputData,
        'title',
        this.formErrors
      );
      if (!isValid) return;
      // if (!nameInputData) {
      //   this.formErrors.showError('title', 'Name it!');
      //   return;
      // }

      const detailsInputData = this.ui.modal.detailsInput.value.trim();

      const listData = {
        title: nameInputData,
        desc: detailsInputData || '',
      };

      if (typeof this.handlers.onAdd === 'function') {
        this.handlers.onAdd(listData);
      }
      await this.handleCloseModal();
    } catch (err) {
      console.error('Form sending error:', err);
    }
  }

  handleToggletask(btn) {
    const li = btn.closest('.task');
    const taskID = li?.dataset.id;

    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.setAttribute('aria-pressed', 'true');

    const finishedDetails = {
      id: taskID,
      isDone: true,
      finishedAt: Date.now(),
    };
    this.setupConfettti(btn);
    this.animationManager?.buttonOneAnimation(btn, 'rubberBand');
    if (typeof this.handlers.onToggle === 'function') {
      this.handlers.onToggle(finishedDetails);
    }
  }

  /**
   * ========================================
   * RENDER METHOD
   * ========================================
   */

  render(taskData) {
    const li = document.createElement('li');
    li.className = 'task';
    li.dataset.id = taskData.id;

    li.innerHTML = `<div class="task__main">
             <button type="button"
                     class="task__main--toggle"
                     aria-label="mark task as done"
                     aria-pressed="false"
                     data-action="toggle-task">

                 <svg aria-hidden="true" 
                          
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                 <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                       stroke="currentColor"
                       stroke-width="2"
                       stroke-linecap="round"
                       stroke-linejoin="round"/>
                 </svg>
 
              </button>
                    
                <span class="task__main--title" id="title-${taskData.a11yId}">${
      taskData.title
    }</span>
                    <button type="button"
                            data-action="accordion-toggle"
                            class="task__main--accordion-btn"
                            aria-controls="details-${taskData.a11yId}"
                            aria-label = "expand task"
                            aria-expanded="false">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="1.5" 
                                stroke="currentColor" 
                                class="size-6">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                    </button>
            </div>
            <div class="task__divider"></div>
            <div  class="task__details hidden" id="details-${
              taskData.a11yId
            }" role="region" aria-labelledby="title-${taskData.a11yId}">
                <p class="task__description">
                    ${taskData.desc ?? ''}                
                </p>
                                
            </div>`;
    this.ui.task.list.appendChild(li);
  }

  /**
   * ========================================
   * HELPER METHODS
   * ========================================
   */
  handleClearError(e) {
    if (e.target.tagName === 'INPUT') {
      this.formErrors.clearError(e.target.name);
    } else return;
  }

  handlerClearCounters() {
    const counterSpans = this._qa('.char-counter');
    counterSpans.forEach((span) => {
      span.textContent = '';
    });
  }
}
