import { FormValidator } from '../../Services/form-validator.js';
export class SelectorPresenter {
  constructor(model, view, callbacks = {}) {
    this.model = model;
    this.view = view;
    this.renderedIds = new Set();
    this.isInitialPaint = true;
    this.SEEN_KEY = 'seenRoadmapsIds';
    this.state = {};
    this.onRenderRequest = callbacks.onRenderRequest || null;
  }
  /**
   * ========================================
   * INITIALIZATION METHOD
   * ========================================
   */
  async init() {
    this.view.activate();
    this.view.bind({
      // taking all callbacks

      onAdd: async (roadmapData) => {
        try {
          const isValid = FormValidator.validateOneInput(
            roadmapData.title,
            'create-map-title',
            this.view.formErrors
          );
          console.log(roadmapData);

          if (!isValid) return;

          const roadmaps = await this.model.createRoadmap(roadmapData);
          this._renderRoadmaps(roadmaps);
          this.view.handleCloseModal();
        } catch (err) {
          console.error('Add failed:', err);
        }
      },

      onEnterRoadmap: async (roadmapID) => {
        try {
          if (typeof roadmapID !== 'string') {
            throw new Error('RoadmapID is not a String!');
          }
          this.state = { activeRoadmapID: roadmapID };

          if (typeof this.onRenderRequest === 'function') {
            this.onRenderRequest(this.state.activeRoadmapID);
          }
        } catch (err) {
          console.error('Pressenter error when entering the roadmap!');
        }
      },

      onDelete: async (roadmapID) => {
        try {
          const oldEl = this.view.findItemEl(roadmapID);
          const roadmaps = await this.model.finishRoadmap(roadmapID);

          if (!oldEl) throw new Error('oldEl is not valid');
          await this.view.animateOldRoadmap(oldEl);

          this.renderedIds.delete(roadmapID);
          sessionStorage.setItem(
            this.SEEN_KEY,
            JSON.stringify([...this.renderedIds])
          );

          this._renderRoadmaps(roadmaps);
        } catch (err) {
          console.error('finish failed');
        }
      },

      onQuitRoadmap: async () => {
        try {
          console.log(this.state.activeRoadmapID);

          await this.view.setupQuitAnimation(this.state.activeRoadmapID);
          this.state.activeRoadmapID = null;
        } catch (err) {
          console.error('Error while Quiting Roadmap!');
        }
      },
    });

    const roadmaps = await this.model.loadAll();
    const seenFromSession = JSON.parse(
      sessionStorage.getItem(this.SEEN_KEY) || '[]'
    );
    this.renderedIds = new Set(seenFromSession);

    roadmaps.forEach((t) => this.renderedIds.add(t.id));

    this._renderRoadmaps(roadmaps);
    this.isInitialPaint = false;
  }
  /**
   * ========================================
   * RENDER METHODS
   * ========================================
   */
  _renderRoadmaps(roadmaps) {
    if (!Array.isArray(roadmaps)) return;
    this.view.ui.selector.list.innerHTML = '';

    const existingBackBtn =
      this.view.ui.roadmap.content.querySelector('#btn-back');
    if (!existingBackBtn) {
      this.view.renderBackBtn();
      this.view.activeBackButton();
    }

    const visible = roadmaps.filter((r) => !r.done);

    visible.forEach((r, i) => {
      const isNew = !this.renderedIds.has(r.id);
      this.view.render(r, { isNew, isInitial: this.isInitialPaint, index: i });

      this._renderULforNodes(r);
      this.renderedIds.add(r.id);
    });
    console.log('rendered ids:', this.renderedIds);

    sessionStorage.setItem(
      this.SEEN_KEY,
      JSON.stringify([...this.renderedIds])
    );
  }
  _renderULforNodes(roadmap) {
    const existingUl = this.view.ui.root.querySelector(
      `ul[data-id="ul-${roadmap.id}"]`
    );

    if (existingUl) return;
    this.view.createNodeUl(roadmap);
  }
}
