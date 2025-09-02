import { FormErrors } from '../../uiErrorHandler.js';

import { showElement, hideElement, toggleElement } from '../../utils/helper.js';
export class RoadmapView {
  constructor(root = 'roadmap-view', roadmapRoot, { animationManager } = {}) {
    const rootEl =
      typeof root === 'string' ? document.getElementById(root) : root;
    const rootRo =
      typeof roadmapRoot === 'string'
        ? document.getElementById(roadmapRoot)
        : roadmapRoot;
    if (!rootEl || !rootRo) {
      throw new Error(
        'Roadmap ID Section root not found (selector or element invalid)'
      );
    }
    /**
     * ========================================
     * ROOT + QUERYHELPER
     * ========================================
     */
    this.ui = { root: rootEl, rootR: rootRo };

    this._q = (sel) => this.ui.root.querySelector(sel);
    this._qr = (sel) => this.ui.rootR.querySelector(sel);
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

      /**
       * ========================================
       * MODAL BUTTONS
       * ========================================
       */

      imporSubmitBtn: this._q('#form--import-submit-btn'),
      manualSubmitBtn: this._q('#form--manual-submit-btn'),
      cancelBtn: this._q('.selector-modal__btn--cancel'),
      openModalBtn: this._q('#roadmap-open-modal-ID'),
      promtBtN: this._q('#form--import-promt-btn'),
    };

    /**
     * ========================================
     * LOCAL STATES
     * ========================================
     */
    this.localStates = {
      bound: false,
      isLoading: false,
      modalCurrentMode: this.ui.modal.manualForm,
    };

    /**
     * ========================================
     * HANDLERS
     * ========================================
     */
    this.handlers = {
      onBack: null,
      onModalOpen: null,
      onModalClose: null,
      onManualSubmit: null,
      onImportSubmit: null,
    };
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
        el: this.ui.modal.openModalBtn,
        event: 'click',
        handler: this.handleOpenModal.bind(this),
      },
      // {
      //   el: this.ui.modal.cancelBtn,
      //   event: 'click',
      //   handler: this.handleCloseModal.bind(this),
      // },
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
        this.handleManualSwitch(modeBtn);
        break;

      case 'import':
        this.handleImportSwitch(modeBtn);
        break;
    }
    const cancelbtn = e.target.closest('[data-action="cancel"]');
    if (!cancelbtn) return;

    if (typeof this.handlers.onModalClose === 'function') {
      this.handlers.onModalClose(e);
    }
  }

  async setupQuitAnimation(roadmapID) {
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

  /**?
   * ========================================
   * HANDLER METHODS
   * ========================================
   */

  // handleGoBack() {
  //   if (typeof this.handlers.onQuitRoadmap === 'function') {
  //     this.handlers.onQuitRoadmap();
  //   }
  // }

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
    const bluredOne = this.ui.modal.dialog;
    const fieldset = this.ui.modal.fieldset;

    this.animationManager?.buttonOneAnimation(btn, 'rubberBand');
    await this.animationManager?.blurInElement(bluredOne);
    await this.animationManager?.showAnimation(fieldset, 'bounceInUp', '1s');
    this.setupCharacterCounter();
  }

  async handleCloseModal(e) {
    e.preventDefault();

    const bluredOne = this.ui.modal.dialog;
    const fieldset = this.ui.modal.fieldset;

    await this.animationManager?.hideAnimation(fieldset, 'bounceOutDown', '1s');
    await this.animationManager?.blurOutElement(bluredOne);

    this.importFormErrors.clearAllErrors();
    this.manualFormErrors.clearAllErrors();

    this.ui.modal.titleInput.value = '';
    this.ui.modal.subtaskInput.value = '';
    this.ui.modal.textArea.value = '';

    this.handlerClearCounters();
  }
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

    hideElement(manualForm);
    await this.animationManager.showAnimation(importForm, 'fadeIn', '.5s');

    this.localStates.modalCurrentMode = importForm;
  }

  /**
   * ========================================
   * FORM SUBMIT METHOD
   * ========================================
   */
  async handleImportSubmit(e) {
    e.preventDefault();
    try {
      console.log('import submit');
    } catch (err) {
      console.error('import Submit Error:');
    }
  }
  async handleManualSubmit(e) {
    e.preventDefault();
    try {
      // const nameInputData = this.ui.modal.titleInput.value.trim() || '';
      console.log('manual submit');

      // const roadmapData = {
      //   title: nameInputData,
      // };

      // if (typeof this.handlers.onAdd === 'function') {
      //   this.handlers.onAdd(roadmapData);
      // }
    } catch (err) {
      console.error('Form sending error:', err);
    }
  }

  /**
   * ========================================
   * RENDER ROADMAP CAONTAINER METHOD
   * ========================================
   */

  createNodeUl(data) {
    const ul = document.createElement('ul');
    ul.classList.add('hidden', 'roadmap__list');
    if (data.id) {
      ul.id = `ul-${data.id}`;
    }

    this.ui.roadmap.content.appendChild(ul);
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
  async onDeleteAnimation(oldEl) {
    await this.animationManager?.hideAnimation(oldEl, 'flipOutX', '1s');
    oldEl.remove();
  }

  findItemEl(roadmapID) {
    return (
      this.ui.selector.list.querySelector(`[data-id="${roadmapID}"]`) || null
    );
  }
  bouncingBtn() {
    const btn = this.ui.modal.openModalBtn;
    if (btn) {
      this.animationManager?.bounceBtn(btn);
    }
  }

  // activeBackButton() {
  //   const backBtn = document.getElementById('btn-back');
  //   if (backBtn) {
  //     backBtn.removeEventListener('click', this.handleGoBack);
  //     backBtn.addEventListener('click', this.handleGoBack.bind(this));
  //     console.log('kliknieto w back');
  //   }
  // }
}
