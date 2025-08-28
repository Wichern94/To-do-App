import { FormErrors } from '../uiErrorHandler.js';
import { showElement, hideElement, toggleElement } from '../utils/helper.js';
export class RoadmapSelector {
  constructor({ elements, callbacks = {}, services = {} }) {
    this.elements = {
      //przyciski:

      newMapBtn: document.getElementById(elements.newMapBtnID),
      setRoadmapSubmitBtn: document.getElementById(
        elements.setRoadmapSubmitBtnID
      ),
      abandonRoadmapSubmitBtn: document.getElementById(
        elements.abandonRoadmapSubmitBtnID
      ),
      listToggler: document.getElementById(elements.listTogglerID),
      //kontenery:
      uiPanel: document.getElementById(elements.uiPanelID),
      titleContainer: document.getElementById(elements.titleContainerID),
      setRoadmapContainer: document.getElementById(
        elements.setRoadmapContainerID
      ),
      ulContainer: document.getElementById(elements.ulContainerID),
      ulContDiv: document.getElementById(elements.ulContDivID),
      addBtnContainer: document.getElementById(elements.addBtnContainerID),
      //Elementy formularzy:

      setRoadmapForm: document.getElementById(elements.setRoadmapFormID),
      setInputTitle: document.getElementById(elements.setInputTitleID),
    };
    //Callbacki:
    this.onSubmit = callbacks.onSubmit;
    this.onDelete = callbacks.onDelete;
    this.onEnterRoadmap = callbacks.onEnterRoadmap;
    this.onQuitRoadmap = callbacks.onQuitRoadmap;

    //Zewnetrzne serwisy:
    this.firestoreService = services.firestoreService;
    this.FormErr = new FormErrors('create-map-form');
    this.animationManager = services.animationManager;

    //listenery:
    this.listeners = [
      {
        el: 'newMapBtn',
        event: 'click',
        handler: this.showAddRoadmap.bind(this),
      },
      {
        el: 'abandonRoadmapSubmitBtn',
        event: 'click',
        handler: this.hideAddRoadmap.bind(this),
      },
      {
        el: 'setRoadmapSubmitBtn',
        event: 'click',
        handler: this.handleSubmit.bind(this),
      },
      {
        el: 'setRoadmapForm',
        event: 'click',
        handler: this.handleClearError.bind(this),
      },
      {
        el: 'ulContainer',
        event: 'click',
        handler: this.handleUlClick.bind(this),
      },
    ];

    //Pojemniki:

    this.roadmaps = [];
    this.activeRoadmapId = null;
  }

  activate() {
    console.log('aktywowano activite RiadmapSelectora');

    this.listeners.forEach(({ el, event, handler }) => {
      this.elements[el]?.addEventListener(event, handler);
    });
  }

  deactivate() {
    this.listeners.forEach(({ el, event, handler }) => {
      this.elements[el]?.removeEventListener(event, handler);
    });
  }

  async showAddRoadmap() {
    const bluredOne = this.elements.setRoadmapContainer;
    const fieldset = this.elements.uiPanel;
    await this.animationManager.blurInElement(bluredOne);
    await this.animationManager.showAnimation(fieldset, 'bounceInUp', '1s');
  }
  async hideAddRoadmap() {
    const bluredOne = this.elements.setRoadmapContainer;
    const fieldset = this.elements.uiPanel;

    await this.animationManager.hideAnimation(fieldset, 'bounceOutDown', '1s');
    await this.animationManager.blurOutElement(bluredOne);

    this.FormErr.clearAllErrors();
    this.elements.setInputTitle.value = '';
  }
  async handleSubmit(e) {
    e.preventDefault();
    try {
      //trim usuwa spacje,taby, itd!
      const nameInputData = this.elements.setInputTitle.value.trim(); //<-pobieram Value z impota czyli tytuł

      if (!nameInputData) {
        this.FormErr.showError('create-map-title', 'Nazwij mapę!');
        return;
      }
      if (this.roadmaps.some((r) => r.title === nameInputData)) {
        this.FormErr.showError('create-map-title', 'Nazwa juz instnieje!');
        return;
      }
      //tworze Obiekt z danymi
      const roadData = {
        title: nameInputData,
        createdAt: Date.now(),
      };
      this.isRoadmapSubmitting = true;
      const id = await this.firestoreService.addCollection(
        roadData,
        'roadmaps'
      );
      if (!id) throw new Error('brak ID z bazy Danych!');

      const fullData = { ...roadData, id, isNew: true };
      const { isNew, ...RoadDataWithoutFlag } = fullData; //<- destrukturyzacja, zeby bylo bez isNew
      this.roadmaps.push(RoadDataWithoutFlag); //<- dodaje do pojemnika

      this.createRoadmapLi(fullData);
      this.createNodeUl(fullData);
      this.hideAddRoadmap(); //<- ukrywam Modal

      if (typeof this.onSubmit === 'function') {
        this.onSubmit(fullData);
      }
    } catch (error) {
      console.error('bład tworzenia mapy!', error);
    } finally {
      this.isRoadmapSubmitting = false;
    }
  }

  handleClearError(e) {
    this.FormErr.clearError(e.target.name);
  }
  async createRoadmapLi(data) {
    const li = document.createElement('li');
    li.classList.add('roadmap-list-item', 'roadmap-selector__item');
    if (data.id) {
      li.dataset.id = data.id;
    }
    li.innerHTML = `<p class="roadmap-list-item-text roadmap-selector__title">${data.title}</p>
                    <div class="roadmap-selector__title-divider"></div>
                    <div class="list-bttns roadmap-selector__item-actions">
                         <button  class="delete-road-btn roud-list-btns roadmap-selector__btn roadmap-selector__btn--delete" aria-label="Delete roadmap" data-action = "delete">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                        <button class="enter-road-btn roud-list-btns roadmap-selector__btn roadmap-selector__btn--enter" aria-label = "Enter roadmap" data-action ="enter">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>

                        </button>
                    </div>
                    <div class="roadmap-selector__item-time">
                      <span class="roadmap-selector__item-time--title">Total time:</span>
                      <p class ="roadmap-selector__item-time--node">00:00:00</p>
                    </div>`;
    this.elements.ulContainer.appendChild(li);
    if (data.isNew) {
      await this.animationManager.addElementAnimation(li, 'bounceInLeft', '1s');
    }
  }

  loadRoadmapList(roadmaps) {
    if (!Array.isArray(roadmaps)) return;
    console.log('ZAŁADOWANO MAPE');

    this.elements.ulContainer.innerHTML = '';
    const existingBackBtn = this.elements.ulContDiv.querySelector('#btn-back');
    if (!existingBackBtn) {
      const backContDiv = document.createElement('div');
      backContDiv.classList.add('roadmap__content-action-wrap');

      backContDiv.innerHTML = `
         
            <button id="btn-back" class="roud-list-btns roadmap__btn roadmap__btn--back" data-action="back" aria-label="Back to roadmaps">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
            </button>`;
      this.elements.ulContDiv.appendChild(backContDiv);
      this.activeBackButton();
    }

    roadmaps.forEach((road) => {
      this.createRoadmapLi(road);
      const existingUl = this.elements.ulContDiv.querySelector(
        `ul[data-id="ul-${road.id}"]`
      );

      if (existingUl) return;
      this.createNodeUl(road);
    });

    this.roadmaps = [...roadmaps];
    this.checkRoudmaps();
  }

  handleUlClick(e) {
    const deleteBtn = e.target.closest('.delete-road-btn'); //<- wybieram przycisk najblizszy targtowi eventu
    const enterBtn = e.target.closest('.enter-road-btn');
    const li =
      deleteBtn?.closest('.roadmap-list-item') ||
      enterBtn?.closest('.roadmap-list-item');

    if (deleteBtn) {
      this.handleDelete(li);
    } else if (enterBtn) {
      this.handleEnterRoadmap(li);
    }
  }
  async handleDelete(li) {
    try {
      if (!li) throw new Error('Nie znaleziono elementu LI!');

      const deleteBtn = li.querySelector('.delete-road-btn');
      deleteBtn.classList.add('disabled-btn');
      const roadmapID = li?.dataset.id;

      if (!roadmapID) throw new Error('Nie znaleziono ID Roadmapy!');
      const success = await this.firestoreService.deleteDocument(
        roadmapID,
        'roadmaps'
      );

      if (success) {
        // usuwanie zapomcą filter: nie modyfikuje oryginalnej tablicy, tylko zwracam nową
        this.roadmaps = this.roadmaps.filter((map) => map.id !== roadmapID); // i przypisuję ją z powrotem
        const li = document.querySelector(
          `.roadmap-list-item[data-id="${roadmapID}"]`
        );
        await this.animationManager.addElementAnimation(
          li,
          'bounceOutRight',
          '1s'
        );
        li?.remove();
        this.checkRoudmaps();
      }

      if (typeof this.onDelete === 'function') {
        this.onDelete(roadmapID);
      }
    } catch (error) {
      console.error('bład przy usuwaniu:', error);
    }
  }

  checkRoudmaps() {
    let liCreated = false;
    if (this.elements.ulContainer.querySelector('li')) {
      console.log('tytul nagłowku:', this.elements.titleContainer);
      this.elements.titleContainer.textContent = 'Yours Roadmaps:';
      liCreated = true;
    } else {
      this.elements.titleContainer.textContent = 'You dont have any Roadmaps!';
    }
    return liCreated;
  }
  createNodeUl(data) {
    const ul = document.createElement('ul');
    ul.classList.add('roadmap-list', 'hidden', 'roadmap__list');
    if (data.id) {
      ul.id = `ul-${data.id}`;
    }

    this.elements.ulContDiv.appendChild(ul);

    if (this.elements.ulContDiv.querySelector('ul')) {
      console.log('utworzono nowy ul:', ul);
    }
  }
  async handleEnterRoadmap(li) {
    const btn = li.querySelector('.enter-road-btn');
    if (!btn) return;

    const roadmapID = li?.dataset.id;
    if (!roadmapID) return;

    //dodaje aktywne id do konstruktora
    this.activeRoadmapId = roadmapID;

    //przekazuje callback żeby go potem podac to roud-modal
    if (typeof this.onEnterRoadmap === 'function') {
      this.onEnterRoadmap(`ul-${roadmapID}`);
    }
    //stałe:
    const targetUl = this.elements.ulContDiv.querySelector(
      `ul[id="ul-${roadmapID}"]`
    ); //<-wlasciy ul
    const backBtn = this.elements.ulContDiv.querySelector('#btn-back');
    const ulContainer = this.elements.ulContDiv; // <- pojemnik na ulki
    const mapMenu = this.elements.listToggler; // <-panel wyboru roadmapy
    const addModalContainer = this.elements.addBtnContainer; //<- pojemnik na przycisk do dodawania nodów
    // przygotowanie elemtów:

    hideElement(backBtn); // ukrywam wczesniej zeby pokazac go  nakoniec sekwencji i zeby nie przeszkadzal
    ulContainer.querySelectorAll('.roadmap-list').forEach(
      (
        ul // ukrywam wszystkie ulki roadmap
      ) => ul.classList.add('hidden')
    );
    //Sekwecja Animowana pokazywania/ukrywania

    //1)ukrywam pojemnik na wybor roadmap:
    await this.animationManager.hideAnimation(mapMenu, 'fadeOutRight', '.5s');

    //2)pokazuje pojemnik na ulki wszytskie sa tu ukryte!
    await this.animationManager.showAnimation(
      ulContainer,
      'fadeInRight',
      '.1s'
    );

    //3) pokazuje własciwy ul zgodny z ID
    await this.animationManager.showAnimation(targetUl, 'fadeInRight', '.5s');

    //4) Przyciski:

    //powrót
    await this.animationManager.showBtns(backBtn, '.2s');

    // pokazuje globalny przycisk dodawania nodów
    await this.animationManager.showBtns(addModalContainer, '.2s');
  }

  activeBackButton() {
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.removeEventListener('click', this.handleGoBack);
      backBtn.addEventListener('click', this.handleGoBack.bind(this));
    }
  }

  async handleGoBack() {
    // przygotowanie elemtów:
    const targetUl = document.querySelector(
      `ul[id="ul-${this.activeRoadmapId}"]`
    );
    const backBtn = this.elements.ulContDiv.querySelector('#btn-back');
    const ulContainer = this.elements.ulContDiv; // <- pojemnik na ulki
    const mapMenu = this.elements.listToggler; // <-panel wyboru roadmapy
    const addModalContainer = this.elements.addBtnContainer; //<- pojemnik na przycisk do dodawania nodów
    const roadmapID = `ul-${this.activeRoadmapId}`;
    //Sekwecja Animowana pokazywania/ukrywania
    //1) Przyciski:

    //powrót
    await this.animationManager.hideBtns(backBtn, '.2s');

    // ukrywam globalny przycisk dodawania nodów
    await this.animationManager.hideBtns(addModalContainer, '.2s');

    //2) ukrywam własciwy ul zgodny z ID
    await this.animationManager.hideAnimation(targetUl, 'fadeOutLeft', '.5s');
    console.log('log pohide target ul');

    //3) ukrywam pojemnik na ulki wszytskie sa tu ukryte!
    await this.animationManager.hideAnimation(
      ulContainer,
      'fadeOutLeft',
      '.1s'
    );
    //1)ukrywam pojemnik na wybor roadmap:
    await this.animationManager.showAnimation(mapMenu, 'fadeInLeft', '.5s');

    if (typeof this.onQuitRoadmap === 'function') {
      this.onQuitRoadmap(roadmapID);
    }
  }
}
