import { FormErrors } from './uiErrorHandler.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';
import { db } from './firebase-init.js';
import { serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';
import { GetCaruselPosition } from './components/carousel-settings.js';
import { RoudMapModal } from './components/roud-modal.js';
import { RoadmapSelector } from './components/roadmap-selector.js';
import { FirestoreService } from './Services/Service.js';
import { NodeElement } from './components/node-component.js';
import { RoadmapPlumbManager } from './Services/plumb-manager.js';
import { AnimationManager } from './Services/animation-manager.js';
import { ToastManager } from './Services/toastify-manger.js';
import { ListView } from './components/list/list-view.js';
import { ListController } from './components/list/list-controller.js';
import { ListModel } from './components/list/list.model.js';
import { selectorView } from './components/roadmap/selector-view.js';
import { SelectorModel } from './components/roadmap/selector-model.js';
import { SelectorPresenter } from './components/roadmap/selector-presenter.js';
export class TodoApp {
  constructor(user, viewManager) {
    this.user = user;
    this.viewManger = viewManager;
    this.carusel = new GetCaruselPosition('carousel-cont', '.carousel-item');
    this.firestoreService = new FirestoreService(this.user.uid);

    this.carusel.setCaruselToMiddle();
    this.initCarusel();

    this.nodesByRoadmap = {};
    this.activeRoadmapId = null;
    this.activeRoadmapInstance = null;
    this.plumbManagers = {};
    this.AnimationManager = new AnimationManager();
    this.SelectorModel = new SelectorModel(this.firestoreService);
    this.selectorView = new selectorView('roadmap-view', {
      animationManager: this.AnimationManager,
    });
    this.SelectorPresenter = new SelectorPresenter(
      this.SelectorModel,
      this.selectorView,
      {
        onRenderRequest: async (roadmapID) => {
          await this.selectorView.setupEnterAnimaton(roadmapID);
          await this.renderNodesForRoadmap(roadmapID);

          const interval = setInterval(() => {
            // <-naprawiam linie zeby sie nie rozjechały
            this.plumbManagers[roadmapID]?.jsPlumbInstance?.revalidate(
              roadmapID
            );
            this.plumbManagers[roadmapID]?.jsPlumbInstance?.repaintEverything();
          }, 10); // co 10ms przez 300ms

          setTimeout(() => {
            clearInterval(interval);
          }, 1500); // zatrzymaj po 300ms
        },
      }
    );

    this.mainHamburger = new MainMenuHandler(
      'main-hamburger',
      'main-burger-exit',
      'main-burger-menu'
    );

    this.userSettings = new SettingsMenuHandler(
      'user-menu-btn',
      'user-menu-exit',
      'open-user-settings',
      'logout-btn'
    );
  }
  initCarusel() {
    this.carusel.onViewChange = (mode) => {
      this.viewManger.showMode(mode.sectionId, mode.indicatorId);
      if (mode.sectionId === 'roadmap-view') {
        this.roudmapModal?.activate();
        this.SelectorPresenter.init();
        // this.roadmapSelector?.activate();

        // this.firestoreService
        //   .loadUserCollection('roadmaps')
        //   .then((roadmapData) => {
        //     this.roadmapSelector.loadRoadmapList(roadmapData);
        //   })
        //   .catch((err) => {
        //     console.error('błąd przy ładowaniu roudmap:', err);
        //   });
      } else {
        this.roudmapModal?.deactivate();
      }
      if (mode.sectionId === 'list-view') {
        if (!this.listView) {
          const section = document.getElementById('list-view'); // sekcja slajdu
          const root = section?.matches('.todo')
            ? section
            : section?.querySelector('.todo'); // KONKRETNY root widoku
          if (!root) {
            console.error('Brak .todo w #list-view');
            return;
          }
          this.listModel = new ListModel(this.firestoreService);

          this.listView = new ListView(root, {
            animationManager: this.AnimationManager,
          });
          this.ListController = new ListController(
            this.listModel,
            this.listView
          );
          this.ListController.init();
        }
      }
    };
  }
  async renderNodesForRoadmap(roadmapID, newNodeID = null) {
    try {
      this.activeRoadmapId = roadmapID;
      const ul = document.getElementById(roadmapID);
      // sprawdze czy jest ul zanim utowrze plumbmangera, aby uniknac problemu
      if (!ul) {
        console.warn('nie znaleziono ul o id:', roadmapID);
        return;
      }

      // jesli plumManger juz cos ma to resetuje/usuwam
      //aby uniknac dublowania
      if (this.plumbManagers?.[roadmapID]) {
        this.plumbManagers[roadmapID].destroy();
        delete this.plumbManagers[roadmapID];
      }

      // kazda Roadmapa ma swoją instacje plumMangera
      this.plumbManagers[roadmapID] = new RoadmapPlumbManager(ul);

      //czyszcze roadmapy zeby uniknac dublikatów
      Array.from(ul.querySelectorAll('.roadmap-node')).forEach((child) =>
        ul.removeChild(child)
      );

      //pobieram dane z bazy
      const nodeList = await this.firestoreService.getElementsfromSubCollection(
        roadmapID,
        'roadmaps',
        'nodes'
      );
      console.log('node list to:', nodeList);
      if (!Array.isArray(nodeList) || nodeList.length === 0) return;

      //sortuje według order w kolejnosci od najmniejszego do nawiekszego
      const sortedNodeList = nodeList.sort((a, b) => a.order - b.order);

      const nodes = []; // <-tablica na nody

      sortedNodeList.forEach((nodeData, index) => {
        const isNew = nodeData.id === newNodeID;
        // kazdy node jest osobną  instacja NodeElement
        const node = new NodeElement(
          nodeData,
          this.plumbManagers[roadmapID],
          this.firestoreService,
          {
            isNew,
            onDelete: this.handleNodeDeleted.bind(this),
          }
        );

        // renderuje i dodaje do tablicy
        node.render();

        node.setNodeListForRoadmap(nodes, this.plumbManagers);
        nodes.push(node);

        if (index === 0) {
          node.enableNode();
        } else {
          node.disableNode();
        }
      });
      //flaga
      let activeNode = null;
      // sprawdzam czy były aktywne
      nodes.forEach((node) => {
        if (node.nodeData.wasActive === true) {
          activeNode = node;
        }
      });
      // jesli byly rysuje linie i aktywuje przyciski
      if (activeNode) {
        activeNode.setActive();
        activeNode.drawConnectionLines();
      }
      this.nodesByRoadmap[roadmapID] = nodes;
    } catch (err) {
      console.error('błąd przy wczytywaniu roadmapy:', err);
    }
  }

  async handleNodeDeleted(deletedNode) {
    const roadmap = deletedNode.nodeData.roadmapID;
    const nodeList = this.nodesByRoadmap[roadmap];

    const index = nodeList.findIndex(
      (n) => n.nodeData.id === deletedNode.nodeData.id
    );
    if (index === -1) return;

    nodeList.splice(index, 1);
  }
  // lista--------------------------------------------------------------
  async loadAndRenderUserTasks() {
    try {
      const storagedTasks = await this.taskManager.loadUserTasks(this.user.uid);
      storagedTasks.forEach((task) => this.taskManager.addTaskToUI(task));
    } catch (error) {
      console.error('błąd przy ładowaniu i renderowaniu zadań:', error);
    }
  }
}
//klasa do obsługi przycisku wyloguj
export class LogoutButtonHandler {
  constructor(buttonID) {
    this.button = document.getElementById(buttonID);
    this.setLogoutListener();
  }
  setLogoutListener() {
    if (this.button) {
      this.button.addEventListener('click', (e) => {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('auth:logout'));
        window.location.reload();
      });
    }
  }
}

// szablon Okienek ktore pokazuje/ukrywam

export class ToggleableMenu {
  constructor(openBtnID, closeBtnID, mainMenuID) {
    this.openBtn = document.getElementById(openBtnID);
    this.closeBtn = document.getElementById(closeBtnID);
    this.menu = document.getElementById(mainMenuID);
    this.bindEvents();
  }

  //metoda łapiąca eventy
  bindEvents() {
    this.openBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.menu.classList.remove('hidden');
    });

    this.closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.menu?.classList.add('hidden');
    });
  }
  show() {
    this.menu?.classList.remove('hidden');
  }
  hide() {
    this.menu?.classList.add('hidden');
  }
}
// klasa obsługi main menu dziedziczona z szablonu menu

export class MainMenuHandler extends ToggleableMenu {
  constructor(openBtnID, closeBtnID, mainMenuID) {
    super(openBtnID, closeBtnID, mainMenuID);
    {
    }
  }
}
// to samo tylk  do Usersettingsow
export class SettingsMenuHandler extends ToggleableMenu {
  constructor(openBtnID, closeBtnID, mainMenuID, logoutBtnID) {
    super(openBtnID, closeBtnID, mainMenuID);
    {
      this.logoutBtn = new LogoutButtonHandler(logoutBtnID);
    }
  }
}
