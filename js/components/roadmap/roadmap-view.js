import { FormErrors } from '../../Services/validators/uiErrorHandler.js';

import { hideElement } from '../../utils/helper.js';
export class RoadmapView {
  constructor(root = 'roadmap-view', { animationManager } = {}) {
    const rootEl =
      typeof root === 'string' ? document.getElementById(root) : root;

    if (!rootEl) {
      throw new Error(
        'Roadmap ID Section root not found (selector or element invalid)'
      );
    }
    /**
     * ========================================
     * ROADMAP ID
     * ========================================
     */

    /**
     * ========================================
     * ROOT + QUERYHELPER
     * ========================================
     */
    this.ui = { root: rootEl };

    this._q = (sel) => this.ui.root.querySelector(sel);

    this._qa = (sel) => this.ui.root.querySelectorAll(sel);

    /**
     * ========================================
     *  SELECTOR UI ELEMENTS
     * ========================================
     */

    this.ui.selector = {
      list: this._q('.roadmap-selector__list'),
      titleContainer: this._q('.roadmap-selector__empty'),
      panel: this._q('.roadmap-selector__panel'),
    };

    /**
     * ========================================
     *      ROADMAP CONTAINER
     * ========================================
     */
    this.ui.roadmap = {
      backBtn: this._q('.roadmap__btn--back'),
      content: this._q('.roadmap__content'),
      addBtnContainer: this._q('#add-node-btn-cont'),
    };

    /**
     * ========================================
     *  MODAL WINDOWS
     * ========================================
     */

    this.ui.modal = {
      dialog: this._q('#add-node-element-dialog'),
      fieldset: this._q('#add-node-element-fieldset'),

      /**
       * ========================================
       *  MODAL FORM ELEMENTS
       * ========================================
       */

      manualForm: this._q('#add-node-form--manual'),
      titleInput: this._q('#form--manual-input-title'),
      subtaskInput: this._q('#form--manual-input-subelements'),
      importForm: this._q('#add-node-form--import'),
      textArea: this._q('#form--import-textarea'),
      subtaskContainer: this._q('#subtask-list'),

      /**
       * ========================================
       * MODAL BUTTONS
       * ========================================
       */

      importSubmitBtn: this._q('#form--import-submit-btn'),
      manualSubmitBtn: this._q('#form--manual-submit-btn'),
      cancelBtn: this._q('.selector-modal__btn--cancel'),
      openModalBtn: this._q('#roadmap-open-modal-ID'),
      promtBtn: this._q('#form--import-promt-btn'),
      subtaskBtn: this._q('#subtask-add-btn'),
      allBtns: this._qa('.selector-modal__btn'),
    };

    /**
     * ========================================
     * LOCAL STATES
     * ========================================
     */
    this.localStates = {
      modalCurrentMode: this.ui.modal.manualForm,
      countersBound: false,
    };

    /**
     * ========================================
     * HANDLERS
     * ========================================
     */
    this.initialHandlers = {
      onQuitRoadmap: null,
      onModalOpen: null,
      onModalClose: null,
      onManualSubmit: null,
      onImportSubmit: null,
      onAddSubtask: null,
      onPromtCopy: null,
      onManualSwitch: null,
      onImportSwitch: null,
    };
    this.handlers = null;
    /**
     * ========================================
     * SERVICES
     * ========================================
     */
    this.animationManager = animationManager || null;
    this.importFormErrors = new FormErrors('add-node-form--import');
    this.manualFormErrors = new FormErrors('add-node-form--manual');

    this.listeners = [
      {
        el: this.ui.modal.fieldset,
        event: 'click',
        handler: this.setupModal.bind(this),
      },
      {
        el: this.ui.modal.subtaskBtn,
        event: 'click',
        handler: this.handleAddSubtask.bind(this),
      },
      {
        el: this.ui.modal.openModalBtn,
        event: 'click',
        handler: this.sendOnModalOpen.bind(this),
      },
      {
        el: this.ui.roadmap.backBtn,
        event: 'click',
        handler: this.sendGoBack.bind(this),
      },
      {
        el: this.ui.modal.manualForm,
        event: 'submit',
        handler: this.handleManualSubmit.bind(this),
      },
      {
        el: this.ui.modal.importForm,
        event: 'submit',
        handler: this.handleImportSubmit.bind(this),
      },
      {
        el: this.ui.modal.manualForm,
        event: 'click',
        handler: this.handleClearManualError.bind(this),
      },
      {
        el: this.ui.modal.importForm,
        event: 'click',
        handler: this.handleClearImportError.bind(this),
      },
      {
        el: this.ui.modal.promtBtn,
        event: 'click',
        handler: this.sendOnPromtCopy.bind(this),
      },
    ];
    this.bouncingBtn();
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
    this.handlers = { ...this.initialHandlers, ...handlers };
  }
  unbind() {
    this.handlers = { ...this.initialHandlers };
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
   *
   * ========================================
   */

  /**
   * ========================================
   * UI SETUP METHODS
   * ========================================
   */

  setupModal(e) {
    const modeBtn = e.target.closest('button[data-mode]');
    if (
      !modeBtn ||
      modeBtn.disabled ||
      modeBtn.getAttribute('aria-disabled') === 'true'
    )
      return;

    const mode = modeBtn.dataset.mode;
    if (!mode) return;

    switch (mode) {
      case 'manual':
        this.sendOnManualSwitch(modeBtn);
        break;

      case 'import':
        this.sendOnImportSwitch(modeBtn);
        break;
    }

    this.setModalClickButtons(e);
  }
  setModalClickButtons(e) {
    const btn = e.target.closest('[data-action]');

    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true')
      return;

    const action = btn.dataset.action;
    if (!action) return;

    switch (action) {
      case 'cancel':
        this.sendOnModalClose(e);
        break;
    }
  }

  setupCharacterCounter() {
    if (this.localStates.countersBound) return;
    const formElements = this._qa('input[maxlength], textarea[maxlength]');

    formElements.forEach((element) => {
      const counterSpan = this._q(`.char-counter[data-for="${element.id}"]`);

      if (counterSpan) {
        this.localStates.countersBound = true;
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
   *
   * ========================================
   */

  /**
   * ========================================
   * QUIT ANIMATION
   * ========================================
   */
  async handleQuitAnimation(roadmapID) {
    const { panel } = this.ui.selector;
    const { content, addBtnContainer } = this.ui.roadmap;
    // preparing elements:
    const targetUl = this._q(`ul[id="${roadmapID}"]`);
    const backBtn = this._q('#btn-back');

    //Animated Show/Hide Sequence
    //1) Buttons:

    //back
    await this.animationManager?.hideBtns(backBtn, '.2s');

    // I hide the global button for adding nodes
    await this.animationManager?.hideBtns(addBtnContainer, '.2s');

    //2) I hide the correct container according to the ID
    await this.animationManager?.hideAnimation(targetUl, 'fadeOutLeft', '.5s');

    //3) I'm hiding the  UL container  they're all hidden here!
    await this.animationManager?.hideAnimation(content, 'fadeOutLeft', '.1s');
    //4) I hide the container for selecting the roadmap:
    await this.animationManager?.showAnimation(panel, 'fadeInLeft', '.5s');
  }
  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * OPEN/CLOSE HANDLERS METHODS
   * ========================================
   */
  async openModal(e) {
    const btn = e.target;
    const bluredOne = this.ui.modal.dialog;
    const fieldset = this.ui.modal.fieldset;

    this.animationManager?.buttonOneAnimation(btn, 'rubberBand');
    await this.animationManager?.blurInElement(bluredOne);
    await this.animationManager?.showAnimation(fieldset, 'bounceInUp', '1s');
  }

  async closeModal() {
    const bluredOne = this.ui.modal.dialog;
    const fieldset = this.ui.modal.fieldset;

    await this.animationManager?.hideAnimation(fieldset, 'bounceOutDown', '1s');
    await this.animationManager?.blurOutElement(bluredOne);
    this.handlerClearCounters();
  }
  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * MODAL UI METHODS
   * ========================================
   */
  async handleManualSwitch(btn) {
    const { importForm, manualForm } = this.ui.modal;
    const importBtn = this._q('button[data-mode="import"]');

    if (this.localStates.modalCurrentMode === manualForm) return;
    if (!btn || !importBtn) throw new Error('cant find button!');

    importBtn.classList.remove('pressed');
    btn.classList.add('pressed');

    if (btn.classList.contains('pressed')) {
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.setAttribute('aria-pressed', 'false');
    }

    hideElement(importForm);
    await this.animationManager.showAnimation(manualForm, 'fadeIn', '.5s');

    this.localStates.modalCurrentMode = manualForm;
  }

  async handleImportSwitch(btn) {
    const { importForm, manualForm } = this.ui.modal;
    const manualBtn = this._q('button[data-mode="manual"]');

    if (this.localStates.modalCurrentMode === importForm) return;
    if (!btn || !manualBtn) throw new Error('cant find button!');

    manualBtn.classList.remove('pressed');
    btn.classList.add('pressed');

    if (btn.classList.contains('pressed')) {
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.setAttribute('aria-pressed', 'false');
    }

    hideElement(manualForm);
    await this.animationManager.showAnimation(importForm, 'fadeIn', '.5s');

    this.localStates.modalCurrentMode = importForm;
  }
  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * FORM SUBMIT METHOD
   * ========================================
   */
  async handleImportSubmit(e) {
    if (this.ui.modal.importSubmitBtn.disabled === true) return;
    e.preventDefault();
    try {
      const rawAreaData = this.ui.modal.textArea.value || '';

      if (typeof this.handlers.onImportSubmit === 'function') {
        this.handlers.onImportSubmit(rawAreaData);
      }
    } catch (err) {
      console.error('import Submit Error:');
    }
  }
  async handleManualSubmit(e) {
    if (this.ui.modal.manualSubmitBtn.disabled === true) return;
    e.preventDefault();
    try {
      const rawInputData = this.ui.modal.titleInput.value || '';

      const rawFormData = {
        title: rawInputData,
      };

      if (typeof this.handlers.onManualSubmit === 'function') {
        this.handlers.onManualSubmit(rawFormData);
      }
    } catch (err) {
      console.error('Form sending error:', err);
    }
  }
  async handleAddSubtask() {
    const rawInputValue = this.ui.modal.subtaskInput?.value;

    if (typeof this.handlers.onAddSubtask === 'function') {
      this.handlers.onAddSubtask(rawInputValue);
    }
  }
  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * CALLBACK METHODS
   * ========================================
   */
  sendOnModalClose(e) {
    if (typeof this.handlers.onModalClose === 'function') {
      this.handlers.onModalClose(e);
    }
  }

  sendOnManualSwitch(btn) {
    if (btn.disabled === true) return;
    if (typeof this.handlers.onManualSwitch === 'function') {
      this.handlers.onManualSwitch(btn);
    }
  }
  sendOnImportSwitch(btn) {
    if (btn.disabled === true) return;
    if (typeof this.handlers.onImportSwitch === 'function') {
      this.handlers.onImportSwitch(btn);
    }
  }

  sendOnModalOpen(e) {
    if (typeof this.handlers.onModalOpen === 'function') {
      this.handlers.onModalOpen(e);
    }
  }
  sendGoBack() {
    if (typeof this.handlers.onQuitRoadmap === 'function') {
      this.handlers.onQuitRoadmap();
    }
  }
  sendOnPromtCopy() {
    if (typeof this.handlers.onPromtCopy === 'function') {
      this.handlers.onPromtCopy();
    }
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   * CLAER METHODS
   * ========================================
   */

  handleClearManualError(e) {
    if (e.target.tagName === 'INPUT') {
      this.manualFormErrors.clearError(e.target.name);
    } else return;
  }
  handleClearImportError(e) {
    if (e.target.tagName === 'TEXTAREA') {
      this.importFormErrors.clearError(e.target.name);
    } else return;
  }

  handlerClearCounters() {
    const counterSpans = this._qa('.char-counter');
    counterSpans.forEach((span) => {
      span.textContent = '';
    });
  }
  clearManualForm() {
    this.manualFormErrors.clearAllErrors();

    this.ui.modal.titleInput.value = '';
    this.ui.modal.subtaskInput.value = '';
    this.ui.modal.subtaskContainer.innerHTML = '';
  }
  clearImportForm() {
    this.importFormErrors.clearAllErrors();

    this.ui.modal.textArea.value = '';
  }
  clearSubtaskInputAndContainer() {
    this.ui.modal.subtaskInput.value = '';

    this.ui.modal.subtaskContainer.innerHTML = '';
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   * RENDER METHOD
   * ========================================
   */
  renderSubtasks(subtasks) {
    subtasks.forEach(async (value) => {
      const li = document.createElement('li');
      li.textContent = value;
      li.classList.add('selector-modal__subtask-item');
      this.ui.modal.subtaskContainer.appendChild(li);
      await this.animationManager.showAnimation(li, 'fadeIn', '.5s');
    });
  }
  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * HELPER METHODS
   * ========================================
   */

  bouncingBtn() {
    const btn = this.ui.modal.openModalBtn;
    if (btn) {
      this.animationManager?.bounceBtn(btn);
    }
  }

  animateInvalidBtn() {
    this.animationManager?.addElementAnimation(
      this.ui.modal.subtaskBtn,
      'shakeX',
      '1s'
    );
  }

  setPending(isPending) {
    const inputs = [
      this.ui.modal.titleInput,
      this.ui.modal.subtaskInput,
      this.ui.modal.textArea,
    ];
    const allBtns = this.ui.modal.allBtns;

    allBtns.forEach((btn) => {
      btn.disabled = isPending;
    });

    inputs.forEach((inpt) => {
      inpt.disabled = isPending;
    });
  }
  getRootUl(roadmapID) {
    const element = this._q(`#${roadmapID}`);
    return element;
  }
}
