import { showElement, hideElement } from '../../utils/helper.js';
export class NodeView {
  constructor(root = null, { animationManager } = {}) {
    /**
     * ========================================
     * ROOT + QUERYHELPER
     * ========================================
     */
    this.ui = {
      root: null,
      buttons: {},
      containers: {},
      elements: {},
    };
    if (root instanceof HTMLElement && root.tagName === 'LI') {
      this.ui.root = root;
    } else if (typeof root === 'string') {
      const element = document.querySelector(root);
      if (element instanceof HTMLElement && element.tagName === 'LI') {
        this.ui.root = element;
      } else {
        this.ui.root = null;
      }
    } else {
      this.ui.root = null;
    }

    /**
     * ========================================
     * LOCAL STATES
     * ========================================
     */
    this.localStates = {
      bound: false,
      isRendered: false,
      isAnimating: false,
    };

    /**
     * ========================================
     * HANDLERS
     * ========================================
     */
    this.initialHandlers = {
      onStart: null,
      onPause: null,
      onStop: null,
      onContinue: null,
      onToggleAccordion: null,
      onSubtaskChange: null,
    };
    this.handlers = null;
    /**
     * ========================================
     * SERVICES
     * ========================================
     */
    this.animationManager = animationManager || null;

    this.listeners = [];
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
    if (this.localStates.bound || !this.localStates.isRendered) return;
    this._findAndValidateUiElements(this.ui);

    this.listeners.forEach(({ el, event, handler }) => {
      if (el) {
        el.addEventListener(event, handler);
      }
    });
    this.localStates.bound = true;
  }

  bind(handlers = {}) {
    if (!this.localStates.isRendered) {
      throw new Error('Cannot bind to unrendered component.');
    }
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
  _buildListeners() {
    this.listeners = [
      {
        el: this.ui.elements.nodeContent,
        event: 'click',
        handler: this.handleSetUI.bind(this),
      },
      {
        el: this.ui.containers.subtaskCont,
        event: 'change',
        handler: this.sendOnSubtaskChange.bind(this),
      },
    ];
  }
  _setRefs() {
    if (this.ui.root) {
      this._q = (sel) => this.ui.root.querySelector(sel);
      this._qa = (sel) => this.ui.root.querySelectorAll(sel);

      /**
       * ========================================
       *  BUTTONS
       * ========================================
       */

      this.ui.buttons = {
        accordionBtn: this._q('.roadmap-node__accordion-btn'),
        start: this._q('.roadmap-node__btn--play'),
        pause: this._q('.roadmap-node__btn--pause'),
        continue: this._q('.roadmap-node__btn--continue'),
        stop: this._q('.roadmap-node__btn--stop'),
      };

      /**
       * ========================================
       *      CONTAINERS
       * ========================================
       */
      this.ui.containers = {
        progressBarCont: this._q('.roadmap-node__progress'),
        buttonsCont: this._q('.roadmap-node__actions'),
        subtaskCont: this._q('.roadmap-node__subtasks'), //subtaskList
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
    }
  }
  /**
   * ========================================
   *  RENDER METHOD
   * ========================================
   */
  //Metoda renderowania elementów roadmapy
  render(dataObj) {
    if (this.localStates.isRendered) return;
    if (!this.ui.root) {
      const rightUl = document.getElementById(dataObj.roadmapID);
      const title = dataObj.title;
      const subUlID = `sub-${dataObj.id}`; //<-tworze id dla pojemnika na subtaski

      this.ui.root = document.createElement('li');
      const li = this.ui.root;

      li.classList.add('roadmap-node', 'node');

      if (dataObj.id) {
        li.dataset.id = dataObj.id; //<-nadaje id takie jak ten z firebase
        li.id = `node-${dataObj.id}`;
        li.dataset.order = dataObj.order;
      }
      if (dataObj.order % 2 === 0) {
        li.classList.add('left');
      } else {
        li.classList.add('right');
      }

      //tworze html noda
      li.innerHTML = `
        
          <div class=" hidden roadmap-node__active-border"></div>
            <div class="roadmap-node__content">
                <div class="roadmap-node__header">

                    <span class="roadmap-node__title" data-role ="title">${title}</span>
                    
                    

                    <button class="roadmap-node__accordion-btn" 
                      type="button"
                      aria-expanded="false"
                      aria-controls="${subUlID}"
                      aria-label="Toggle subtasks"
                      data-action="toggle-accordion">
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
              <span class="roadmap-node__time"
                    aria-live="polite"></span>
            </div>
            <div class="roadmap-node__actions"
                 role="group"
                 aria-label="Node Controls">
              
            
                 <button class="hidden roadmap-node__btn roadmap-node__btn--stop"
                         aria-label="stop node"
                         type="button"
                         data-action="stop">Stop

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
            
                <button class="hidden roadmap-node__btn roadmap-node__btn--play"
                        aria-label="start node"
                        type="button"
                        data-action="start">Start
              
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
                 
                <button class= "hidden roadmap-node__btn roadmap-node__btn--pause"
                        aria-label="Pause node"
                        type="button"
                        data-action="pause">Pause

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
                        type="button"
                        data-action="continue">Continue

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

            <div class="hidden roadmap-node__progress"
                 aria-label="Progress">
                
                 <div class="roadmap-node__progress-bar">
                    <div class="roadmap-node__progress-fill"></div>
                    <span class="roadmap-node__progress-text"></span>
                </div>
            </div>
                
               

                
    
            <ul id ="${subUlID}" class="hidden roadmap-node__subtasks" role ="list">
                    
                </ul>
                </div>
            `;

      rightUl?.appendChild(li); // <-dodaje do odpowiedniego UL

      this._setRefs();
      this.renderSubtask(dataObj, subUlID);
      this._buildListeners();
      this.localStates.isRendered = true;
    }
  }
  renderSubtask(dataObj, subUlID) {
    const subtasks = dataObj.subtasks;
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      // <- jesli subtask jest tablica, i nie jest pusta
      return;
    }

    const getSubUL = this._q(`#${subUlID}`);
    if (getSubUL) {
      // jezeli mamy juz  odpowiedni ul

      subtasks.forEach((subtask, i) => {
        const subLi = document.createElement('li');
        subLi.classList.add('subtask-item');
        subLi.dataset.id = this.generateUniqueId();
        subLi.innerHTML = `
                    <label class="subtask-item__label">
                            <input type="checkbox" class ="subtask-item__checkbox--disabled" />
                            <span class="subtask-item__checkbox--custom"></span>
                            <span class="subtask-item__checkbox--text">${subtask}</span>
                    </label>`;

        getSubUL.appendChild(subLi);
        const checkbox = subLi.querySelector('input[type="checkbox"]');
        const subtaskText = subtask;
        if (dataObj.checkedSubtasks?.includes(subtaskText)) {
          checkbox.checked = true;
        }
      });
    }
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

  handleSetUI(e) {
    const btn = e.target.closest('[data-action]');

    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true')
      return;

    const action = btn.dataset.action;
    if (!action) return;

    switch (action) {
      case 'start':
        this.sendOnStart(btn);
        break;

      case 'stop':
        this.sendOnStop(btn);
        break;

      case 'continue':
        this.sendOnContinue(btn);
        break;

      case 'pause':
        this.sendOnPause(btn);
        break;

      case 'toggle-accordion':
        this.sendOnToggleAccordion(btn);
        break;
    }
  }
  setProgress({ doneCount, total, percent }) {
    this.ui.elements.progressText.textContent = `${percent}%`;
    this.ui.elements.progressFill.style.width = `${percent}%`;
    // a11y:
    const bar = this.ui.containers.progressBarCont;
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuenow', String(doneCount));
  }
  showProgress(show) {
    if (show) {
      showElement(this.ui.containers.progressBarCont);
    } else {
      hideElement(this.ui.containers.progressBarCont);
    }
  }

  setSubtasksDisabled(disabled) {
    this.ui.containers.subtaskCont
      ?.querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => {
        cb.disabled = disabled;
      });
  }

  getAccordionOpen() {
    return (
      this.ui.buttons.accordionBtn.getAttribute('aria-expanded') === 'true'
    );
  }
  setAccordion(open) {
    this.ui.buttons.accordionBtn.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );
  }
  async animateAccordion(open) {
    const btn = this.ui.buttons.accordionBtn;
    const list = this.ui.containers.subtaskCont;
    const node = this.ui.elements.nodeContent;

    try {
      if (!this.localStates.isRendered) {
        console.warn('Cannot use Accordion before render!');
        return false;
      }
      if (this.localStates.isAnimating || this.getAccordionOpen() === open)
        return false;

      if (!btn || !list || !node) {
        throw new Error('cannot animate Accordion - missing elements');
      }
      if (!this.animationManager) {
        this.setAccordion(open);
        return false;
      }

      this.localStates.isAnimating = true;

      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      await this.animationManager?.toggleAccordeon(btn, list, node);
      this.setAccordion(open);
      return true;
    } catch (err) {
      console.error('ACCORDION ERROR:', err);
      return false;
    } finally {
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
      this.localStates.isAnimating = false;
    }
  }

  setUnlockedUI(isUnlocked) {
    if (!this.ui.root) {
      console.warn('Cannot enable/disable a node that has not been rendered.');
      return;
    }
    if (isUnlocked) {
      this.ui.root?.classList.remove('disabled-node');
      this.animationManager?.showBtns(this.ui.containers.buttonsCont, '1.5s');
    } else {
      this.ui.elements.nodeContent?.classList.add('disabled-node');

      hideElement(this.ui.containers.buttonsCont);
      hideElement(this.ui.elements.timer);
    }
  }
  showButtons(options = {}) {
    for (const [name, element] of Object.entries(this.ui.buttons)) {
      if (element) {
        const shouldShow = options[name] || false;
        if (shouldShow) {
          showElement(element);
        } else {
          hideElement(element);
        }
      }
    }
  }
  setTimerText(text) {
    if (typeof text === 'string') {
      this.ui.elements.timer.textContent = text;
    }
  }

  showTimer(show) {
    if (show) {
      showElement(this.ui.elements.timer);
    } else {
      hideElement(this.ui.elements.timer);
    }
  }

  setActiveUI(isActive) {
    if (isActive) {
      this.ui.elements.nodeContent.classList.remove('disabled-node');
      showElement(this.ui.elements.activeBorder);
    } else {
      this.ui.elements.nodeContent.classList.add('disabled-node');
      hideElement(this.ui.elements.activeBorder);
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

  sendOnStart(btn) {
    if (typeof this.handlers.onStart === 'function') {
      this.handlers.onStart(btn);
    }
  }

  sendOnStop(btn) {
    if (typeof this.handlers.onStop === 'function') {
      this.handlers.onStop(btn);
    }
  }

  sendOnContinue(btn) {
    if (typeof this.handlers.onContinue === 'function') {
      this.handlers.onContinue(btn);
    }
  }

  sendOnPause(btn) {
    if (typeof this.handlers.onPause === 'function') {
      this.handlers.onPause(btn);
    }
  }
  async sendOnToggleAccordion() {
    const next = !this.getAccordionOpen();
    const changed = await this.animateAccordion(next);

    if (changed !== false) {
      this.handlers.onToggleAccordion?.(next);
    }
  }
  sendOnSubtaskChange(e) {
    const target = e.target;
    if (target.matches('input[type="checkbox"]')) {
      const subtask = target.closest('[data-id]');

      if (subtask) {
        const allCheckboxes = this.ui.containers.subtaskCont.querySelectorAll(
          'input[type="checkbox"]'
        );
        const total = allCheckboxes.length;
        const doneCount = [...allCheckboxes].filter((cb) => cb.checked).length;

        if (typeof this.handlers.onSubtaskChange === 'function') {
          this.handlers.onSubtaskChange({ doneCount, total });
        }
      }
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
  generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomPart}`;
  }

  animateInvalidBtn() {
    this.animationManager?.addElementAnimation(
      this.ui.modal.subtaskBtn,
      'shakeX',
      '1s'
    );
  }
}
