import { GetCaruselPosition } from './components/carousel-settings.js';
import { FirestoreService } from './Services/Service.js';

import { AnimationManager } from './Services/animation-manager.js';
import { ToastManager } from './Services/toastify-manger.js';

import { ListView } from './components/list/list-view.js';
import { ListController } from './components/list/list-controller.js';
import { ListModel } from './components/list/list.model.js';

import { SelectorView } from './components/selector/selector-view.js';
import { SelectorModel } from './components/selector/selector-model.js';
import { SelectorPresenter } from './components/selector/selector-presenter.js';

import { RoadmapView } from './components/roadmap/roadmap-view.js';
import { RoadmapPresenter } from './components/roadmap/roadmap-presenter.js';
import { RoadmapModel } from './components/roadmap/roadmap-model.js';

export class TodoApp {
  constructor(user, viewManager) {
    this.user = user;
    this.viewManger = viewManager;
    this.carusel = new GetCaruselPosition('carousel-cont', '.carousel-item');
    this.firestoreService = new FirestoreService(this.user.uid);

    this.carusel.setCaruselToMiddle();
    this.initCarusel();
    this.state = {};

    this.nodesByRoadmap = {};

    this.AnimationManager = new AnimationManager();
  }
  initCarusel() {
    this.carusel.onViewChange = (mode) => {
      this.viewManger.showMode(mode.sectionId, mode.indicatorId);
      if (mode.sectionId === 'roadmap-view') {
        this.setupSelector(mode.sectionId);
        this.state.view = 'selector';
      } else {
        this.teardownSelector();
        this.state.view = null;
      }
      if (mode.sectionId === 'list-view') {
        this.setupList(mode.sectionId);

        this.state.view = 'list';
      } else {
        this.teardownList();
        this.state.view = null;
      }
    };
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

  setupList(sectionId) {
    if (this.listController) {
      this.listController?.init();
    } else {
      this.listModel = new ListModel(this.firestoreService);
      this.listView = new ListView(sectionId, {
        animationManager: this.AnimationManager,
      });
      this.listController = new ListController(this.listModel, this.listView);
      this.listController?.init();
    }
  }

  setupSelector(sectionId) {
    if (this.selectorPresenter) {
      this.selectorPresenter.init();
    } else {
      this.selectorModel = new SelectorModel(this.firestoreService);
      this.selectorView = new SelectorView(sectionId, {
        animationManager: this.AnimationManager,
      });
      this.selectorPresenter = new SelectorPresenter(
        this.selectorModel,
        this.selectorView,
        {
          onRenderRequest: async (roadmapId) => {
            this.state = { activeRoadmapID: `ul-${roadmapId}` };

            await this.selectorView.setupEnterAnimaton(
              this.state.activeRoadmapID
            );
            this.state.view = 'roadmap';

            this.setupRoadmap(sectionId);
          },
        }
      );
      this.selectorPresenter.init();
    }
  }
  setupRoadmap(sectionId) {
    if (this.state.activeRoadmapID && this.state.view === 'roadmap') {
      this.roadmapModel = new RoadmapModel(this.firestoreService);

      this.roadmapView = new RoadmapView(sectionId, {
        animationManager: this.AnimationManager,
      });

      this.roadmapPresenter = new RoadmapPresenter(
        this.roadmapModel,
        this.roadmapView,
        this.state.activeRoadmapID,
        {
          onQuitRequest: async () => {
            if (this.state.activeRoadmapID === null) return;
            await this.roadmapView.handleQuitAnimation(
              this.state.activeRoadmapID
            );
            this.state.activeRoadmapID = null;
            this.teardownRoadmap();
          },
          onSubmitSuccess: async () => {
            ToastManager.success('👍 Adding a single Element Successful!');
          },
          onCopySuccess: () => {
            ToastManager.info(`Copied to clipboard!`);
          },
          onImportSubmitSuccess: ({ length }) => {
            ToastManager.success(`👍 ${length} Items added!`);
          },
        }
      );
    }
    this.roadmapPresenter?.init();
  }

  teardownList() {
    this.listController?.destroy();
    this.listView?.handlerClearCounters();
  }
  teardownSelector() {
    this.selectorPresenter?.destroy();
    this.selectorView?.handlerClearCounters();
  }
  teardownRoadmap() {
    this.roadmapView?.handlerClearCounters();
    this.roadmapPresenter?.destroy();
  }
}

// lista--------------------------------------------------------------
//   async loadAndRenderUserTasks() {
//     try {
//       const storagedTasks = await this.taskManager.loadUserTasks(this.user.uid);
//       storagedTasks.forEach((task) => this.taskManager.addTaskToUI(task));
//     } catch (error) {
//       console.error('błąd przy ładowaniu i renderowaniu zadań:', error);
//     }
//   }
// }
// //klasa do obsługi przycisku wyloguj
// export class LogoutButtonHandler {
//   constructor(buttonID) {
//     this.button = document.getElementById(buttonID);
//     this.setLogoutListener();
//   }
//   setLogoutListener() {
//     if (this.button) {
//       this.button.addEventListener('click', (e) => {
//         e.preventDefault();
//         document.dispatchEvent(new CustomEvent('auth:logout'));
//         window.location.reload();
//       });
//     }
//   }
// }

// szablon Okienek ktore pokazuje/ukrywam

// export class ToggleableMenu {
//   constructor(openBtnID, closeBtnID, mainMenuID) {
//     this.openBtn = document.getElementById(openBtnID);
//     this.closeBtn = document.getElementById(closeBtnID);
//     this.menu = document.getElementById(mainMenuID);
//     this.bindEvents();
//   }

//   //metoda łapiąca eventy
//   bindEvents() {
//     this.openBtn?.addEventListener('click', (e) => {
//       e.preventDefault();
//       this.menu.classList.remove('hidden');
//     });

//     this.closeBtn?.addEventListener('click', (e) => {
//       e.preventDefault();
//       this.menu?.classList.add('hidden');
//     });
//   }
//   show() {
//     this.menu?.classList.remove('hidden');
//   }
//   hide() {
//     this.menu?.classList.add('hidden');
//   }
// }
// // klasa obsługi main menu dziedziczona z szablonu menu

// export class MainMenuHandler extends ToggleableMenu {
//   constructor(openBtnID, closeBtnID, mainMenuID) {
//     super(openBtnID, closeBtnID, mainMenuID);
//     {
//     }
//   }
// }
// // to samo tylk  do Usersettingsow
// export class SettingsMenuHandler extends ToggleableMenu {
//   constructor(openBtnID, closeBtnID, mainMenuID, logoutBtnID) {
//     super(openBtnID, closeBtnID, mainMenuID);
//     {
//       this.logoutBtn = new LogoutButtonHandler(logoutBtnID);
//     }
//   }
// }
