import { FormErrors } from '../../Services/validators/uiErrorHandler.js';

import { showElement, hideElement, toggleElement } from '../../utils/helper.js';
export class SelectorView {
  constructor(root = 'roadmap-view', { animationManager } = {}) {
    const rootEl =
      typeof root === 'string' ? document.getElementById(root) : root;
    if (!rootEl) {
      throw new Error('Roadmap root not found (selector or element invalid)');
    }
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
      content: this._q('.roadmap__content'),
      addBtnContainer: this._q('#add-node-btn-cont'),
    };

    this.ui.modal = {
      /**
       * ========================================
       *  MODAL WINDOWS
       * ========================================
       */
      modalDialog: this._q('#add-roadmap-dialog'),
      modalFieldset: this._q('#add-roadmap-fieldset'),

      /**
       * ========================================
       *  MODAL FORM ELEMENTS
       * ========================================
       */

      form: this._q('#create-map-form'),
      titleInput: this._q('#create-map-input'),

      /**
       * ========================================
       * MODAL BUTTONS
       * ========================================
       */

      submitBtn: this._q('#create-map-submit-btn'),
      cancelBtn: this._q('#create-map-cancel-btn'),
      openModalBtn: this._q('#selector-open-modal-ID'),
    };

    /**
     * ========================================
     * LOCAL STATES
     * ========================================
     */
    this.localStates = {
      bound: false,
      isLoading: false,
      countersBound: false,
    };

    /**
     * ========================================
     * HANDLERS
     * ========================================
     */
    this.handlers = {
      onAdd: null,
      onEnterRoadmap: null,
      onDelete: null,
      onQuitRoadmap: null,
    };
    /**
     * ========================================
     * SERVICES
     * ========================================
     */
    this.animationManager = animationManager || null;
    this.formErrors = new FormErrors('create-map-form');

    this.listeners = [
      {
        el: this.ui.selector.list,
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
        el: this.ui.modal.form,
        event: 'submit',
        handler: this.handleSubmit.bind(this),
      },
      {
        el: this.ui.modal.form,
        event: 'click',
        handler: this.handleClearError.bind(this),
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
    console.log('roadmap selector destoryed!');
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
      case 'enter-roadmap':
        this.handleEnterRoadmap(btn);
        break;

      case 'delete-roadmap':
        this.handleDeleteRoadmap(btn);
        break;
    }
  }

  async setupEnterAnimaton(roadmapID) {
    const { panel } = this.ui.selector;
    const { content, addBtnContainer } = this.ui.roadmap;

    const targetUl = content.querySelector(`ul[id="${roadmapID}"]`);
    if (!targetUl) throw new Error('Cant find targetUl!');

    const backBtn = content.querySelector('#btn-back');
    if (!backBtn) throw new Error('Cant find backBtn!');

    hideElement(backBtn); // I hide it earlier to show it at the end of the sequence and so that it doesn't get in the way

    this._qa('.roadmap__list').forEach(
      (
        ul // I hide all roadmap containers
      ) => ul.classList.add('hidden')
    );
    //Animated Show/Hide Sequence

    //1)I hide the container for selecting the roadmap:
    await this.animationManager?.hideAnimation(panel, 'fadeOutRight', '.5s');

    //2)shows the content container, all are hidden here!
    await this.animationManager?.showAnimation(content, 'fadeInRight', '.1s');

    //3) shows the correct ul according to the ID
    await this.animationManager?.showAnimation(targetUl, 'fadeInRight', '.5s');

    //4) Buttons:

    //back
    await this.animationManager?.showBtns(backBtn, '.2s');

    // shows the global button for adding nodes
    await this.animationManager?.showBtns(addBtnContainer, '.2s');
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

  async handleEnterRoadmap(btn) {
    try {
      if (!btn) throw new Error('cant find button!');
      const li = btn.closest('.roadmap-selector__item');

      if (!li) throw new Error('the li element is invalid');
      const roadmapId = `${li.dataset.id}`;

      if (typeof this.handlers.onEnterRoadmap === 'function') {
        this.handlers.onEnterRoadmap(roadmapId);
      }
    } catch (err) {
      console.error('error when entering the roadmap:', err);
    }
  }

  async handleDeleteRoadmap(btn) {
    try {
      const li = btn.closest('.roadmap-selector__item');
      if (!li) throw new Error('Cant find LI!');
      const roadmapID = li.dataset.id;

      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('aria-pressed', 'true');

      if (typeof this.handlers.onDelete === 'function') {
        this.handlers.onDelete(roadmapID);
      }
    } catch (err) {
      console.error('Error while deleting the roadmap--View:');
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
  }

  async handleCloseModal(e) {
    e?.preventDefault?.();
    const btn = this._q('.selector-modal__btn--confirm');
    const bluredOne = this.ui.modal.modalDialog;
    const fieldset = this.ui.modal.modalFieldset;

    this.animationManager?.buttonOneAnimation(btn, 'rubberBand');
    await this.animationManager?.hideAnimation(fieldset, 'bounceOutDown', '1s');
    await this.animationManager?.blurOutElement(bluredOne);

    this.formErrors.clearAllErrors();
    this.ui.modal.titleInput.value = '';
    this.handlerClearCounters();
  }
  /**
   * ========================================
   * FORM SUBMIT METHOD
   * ========================================
   */
  async handleSubmit(e) {
    e.preventDefault();
    try {
      const nameInputData = this.ui.modal.titleInput.value.trim() || '';

      const roadmapData = {
        title: nameInputData,
      };

      if (typeof this.handlers.onAdd === 'function') {
        this.handlers.onAdd(roadmapData);
      }
    } catch (err) {
      console.error('Form sending error:', err);
    }
  }

  /**
   * ========================================
   * RENDER ROADMAP SELECTOR METHOD
   * ========================================
   */

  async render(data, opts = {}) {
    const { isNew = false, isInitial = false, index = 0 } = opts;
    const li = document.createElement('li');
    li.classList.add('roadmap-selector__item');
    if (data.id) {
      li.dataset.id = data.id;
    }
    li.innerHTML = `<p class=" roadmap-selector__title">${data.title}</p>
                    <div class="roadmap-selector__title-divider"></div>
                    <div class="roadmap-selector__item-actions">
                         <button  class="roadmap-selector__btn roadmap-selector__btn--delete"
                                  aria-label="Delete roadmap"
                                  data-action = "delete-roadmap">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                        <button class="roadmap-selector__btn roadmap-selector__btn--enter"
                                aria-label = "Enter roadmap"
                                data-action ="enter-roadmap">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>

                        </button>
                    </div>
                    <div class="roadmap-selector__item-time">
                      <span class="roadmap-selector__item-time--title">Total time:</span>
                      <p class ="roadmap-selector__item-time--node">00:00:00</p>
                    </div>`;
    this.ui.selector.list.appendChild(li);
    if (isNew) {
      await this.animationManager.addElementAnimation(li, 'bounceInLeft', '1s');
    } else if (isInitial) {
      const anim = index % 2 === 0 ? 'backInLeft' : 'backInRight';
      this.animationManager?.addElementAnimation(li, anim, '1s');
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
   * RENDER ROADMAP BACKBUTTON AND ITS CONTAINER
   * ========================================
   */

  renderBackBtn() {
    const backContDiv = document.createElement('div');
    backContDiv.classList.add('roadmap__content-action-wrap');

    backContDiv.innerHTML = `
         
            <button id="btn-back" class="roadmap__btn roadmap__btn--back" data-action="back" aria-label="Back to roadmaps">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
            </button>`;
    this.ui.roadmap.content.appendChild(backContDiv);
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
