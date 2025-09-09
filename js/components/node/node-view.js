import { FormErrors } from '../../uiErrorHandler.js';

import { showElement, hideElement, toggleElement } from '../../utils/helper.js';
export class NodeView {
  constructor(root = null, { animationManager } = {}) {
    /**
     * ========================================
     * ROOT + QUERYHELPER
     * ========================================
     */
    this.ui = { root: root };

    this._q = (sel) => this.ui.root.querySelector(sel);

    this._qa = (sel) => this.ui.root.querySelectorAll(sel);

    /**
     * ========================================
     *  BUTTONS
     * ========================================
     */

    this.ui.buttons = {
      accordionBtn: this._q('.roadmap-node__accordion-btn'),
      startBtn: this._q('.roadmap-node__btn--play'),
      pauseBtn: this._q('.roadmap-node__btn--pause'),
      continueBtn: this._q('.roadmap-node__btn--continue'),
      stopBtn: this._q('.roadmap-node__btn--stop'),
    };

    /**
     * ========================================
     *      CONTAINERS
     * ========================================
     */
    this.ui.containers = {
      progressBarCont: this._q('.roadmap-node__progress'),
      butttonsCont: this._q('.roadmap-node__actions'),
      subtaskCont: this._q('.roadmap-node__subtasks'), //subtaskList
      checkBoxCont: this._qa('.subtask-item__checkbox--disabled'), //checkBoxList
    };

    /**
     * ========================================
     *  Elements
     * ========================================
     */

    this.ui.elements = {
      nodeContent: this._q('.roadmap-node__content'),
      activeBorder: this._q('.roadmap-node__active-border'),
      timer: this._q('.roadmap-node__time'),
      progressText: this._q('.roadmap-node__progress-text'),
      progressFill: this._q('.roadmap-node__progress-fill'),
    };

    /**
     * ========================================
     * LOCAL STATES
     * ========================================
     */
    this.localStates = {
      bound: false,
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

    this.listeners = [
      {
        el: this.ui.modal.fieldset,
        event: 'click',
        handler: this.setupModal.bind(this),
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
  //Metoda renderowania elementów roadmapy
  render(dataObj) {
    const rightUl = document.getElementById(dataObj.roadmapID);
    const title = dataObj.title;
    const subUlID = `sub-${dataObj.id}`; //<-tworze id dla pojemnika na subtaski
    if
    const li = document.createElement('li');

    li.classList.add('roadmap-node', 'node');

    if (this.nodeData.id) {
      li.dataset.id = this.nodeData.id; //<-nadaje id takie jak ten z firebase
      li.id = `node-${this.nodeData.id}`;
      li.dataset.order = this.nodeData.order;
    }
    if (this.nodeData.order % 2 === 0) {
      li.classList.add('left');
    } else {
      li.classList.add('right');
    }

    //tworze html noda
    li.innerHTML = `
        
          <div class="active-border hidden roadmap-node__active-border"></div>
            <div class="roadmap-node__content">
                <div class="title-roudmap roadmap-node__header">

                    <span class="node-text roadmap-node__title" data-role ="title">${title}</span>
                    
                    

                    <button class="node-acc-btn roadmap-node__accordion-btn" 
                      type="button"
                      aria-expanded="false"
                      aria-controls="${subUlID}"
                      aria-label="Toggle subtasks">
                    <svg xmlns="http://www.w3.org/2000/svg"
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
                   
            <div class="roadmap-node__header-divider">
              <span class="node-time roadmap-node__time"></span>
            </div>
            <div class="node-btn-container roadmap-node__actions"
                 role="group"
                 aria-label="Node Controls">
              
            
                 <button class="stop-btn roud-btns hidden roadmap-node__btn roadmap-node__btn--stop"
                         aria-label="stop node"
                         type="button">Stop

                         <svg class="roud-btns-svg"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="2.5"
                              stroke="currentColor"
                              class="size-6">
                              <path stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                        </svg>
                </button>
            
                <button class="play-btn roud-btns hidden roadmap-node__btn roadmap-node__btn--play"
                        aria-label="start node"
                        type="button">Start
              
                        <svg  class="roud-btns-svg"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none" viewBox="0 0 24 24"
                              stroke-width="2.5"
                              stroke="currentColor"
                              class="size-6">
                              <path stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                </button>
                 
                <button class= "pause-btn roud-btns hidden roadmap-node__btn roadmap-node__btn--pause"
                        aria-label="Pause node"
                        type="button">Pause

                        <svg class="roud-btns-svg"xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                             stroke-width="2.5"
                             stroke="currentColor"
                             class="size-6">
                             <path stroke-linecap="round"
                             stroke-linejoin="round"
                             d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                        </svg>
                </button>

                <button class="roadmap-node__btn roadmap-node__btn--continue hidden"
                        aria-label="Continue node"
                        type="button">Continue

                        <svg  class="roud-btns-svg"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none" viewBox="0 0 24 24"
                              stroke-width="2.5"
                              stroke="currentColor"
                              class="size-6">
                              <path stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                </button>
            </div>

            <div class="progress-container hidden roadmap-node__progress"
                 aria-label="Progress">
                
                 <div class="progress-bar roadmap-node__progress-bar">
                    <div class="progress-fill roadmap-node__progress-fill"></div>
                    <span class="progress-text roadmap-node__progress-text"></span>
                </div>
            </div>
                
               

                
    
            <ul id ="${subUlID}" class="subtask-list hidden roadmap-node__subtasks" role ="list">
                    
                </ul>
                </div>
            `;
    this.ui.root = li;
    this.ui.nodeContent = li.querySelector('.roadmap-node__content');
    this.ui.activeBorder = li.querySelector('.active-border');
    this.ui.timer = li.querySelector('.node-time');
    this.ui.progressBarCont = li.querySelector('.progress-container');
    this.ui.accordionBtn = li.querySelector('.node-acc-btn');
    this.ui.startBtn = li.querySelector('.play-btn');
    this.ui.pauseBtn = li.querySelector('.pause-btn');
    this.ui.continueBtn = li.querySelector('.continue-btn');
    this.ui.stopBtn = li.querySelector('.stop-btn');
    this.ui.btnContainer = li.querySelector('.node-btn-container');
    this.ui.subtaskList = li.querySelector('.subtask-list');
    this.ui.progressText = li.querySelector('.progress-text');
    this.ui.progressFill = li.querySelector('.progress-fill');
    this.ui.timer = li.querySelector('.node-time');

    rightUl?.appendChild(li); // <-dodaje do odpowiedniego UL

    if (this.options?.isNew) {
      this.animationManager.addElementAnimation(li, 'rollIn', '1s');
    }

    const subtasks = this.nodeData.subtasks;
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      // <- jesli subtask jest tablica, i nie jest pusta
      return;
    }

    const getSubUL = document.getElementById(subUlID);
    if (getSubUL) {
      // jezeli mamy juz  odpowiedni ul

      subtasks.forEach((subtask) => {
        const subLi = document.createElement('li');
        subLi.classList.add('subtask-item');
        subLi.dataset.id = `subLi-${this.nodeData.id}`;
        subLi.innerHTML = `
                    <label class="subtask subtask-item__label">
                            <input type="checkbox" class = "roud-disabld-checkbox subtask-item__checkbox--disabled" />
                            <span class="custom-check subtask-item__checkbox--custom"></span>
                            <span class="subtask-text subtask-item__checkbox--text">${subtask}</span>
                    </label>`;

        getSubUL.appendChild(subLi);
        const checkbox = subLi.querySelector('input[type="checkbox"]');
        const subtaskText = subtask;
        if (this.nodeData.checkedSubtasks?.includes(subtaskText)) {
          checkbox.checked = true;
        }
      });
      this.ui.checkBoxList = li.querySelectorAll('.roud-disabld-checkbox');
    }
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
   * HELPER METHODS
   * ========================================
   */

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
