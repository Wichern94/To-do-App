import { FormValidator } from '../../Services/form-validator.js';
export class RoadmapPresenter {
  constructor(model, view, callbacks = {}) {
    this.model = model;
    this.view = view;
    this.renderedIds = new Set();
    this.isInitialPaint = true;
    this.SEEN_KEY = 'seenRoadmapsIds';

    this.onQuitRequest = callbacks.onQuitRequest || null;
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

      onModalOpen: async (e) => {
        try {
          this.model.resetDraft();

          this.view.clearManualForm();
          this.view.clearImportForm();

          await this.view.handleOpenModal(e);
        } catch (err) {
          console.error('Open Modal failed:', err);
        }
      },

      onModalClose: async (e) => {
        try {
          this.view.clearManualForm();
          this.view.clearImportForm();
          await this.view.handleCloseModal(e);
        } catch (err) {
          console.error('Open Modal failed:', err);
        }
      },

      onQuitRoadmap: () => {
        if (typeof this.onQuitRequest === 'function') {
          this.onQuitRequest();
        }
      },
      onAddSubtask: async (rawData) => {
        try {
          const normalizedData = this.normalizeInput(rawData);
          const isValid = FormValidator.validateOneInput(
            normalizedData,
            'roadmap-subelements',
            this.view.manualFormErrors
          );

          if (!isValid) {
            this.view.animateInvalidBtn();
            return;
          }
          this.model.addDraftSubtask(normalizedData);

          this.view.clearSubtaskInputAndContainer();
          this.view.renderSubtasks(this.model.getDraft().subtasks);
        } catch (err) {
          console.error('onAddSubtask Error:', err);
        }
      },
      onManualSubmit: async (rawFormData) => {
        try {
          const normalizedTitle = this.normalizeInput(rawFormData.title);

          const isValid = FormValidator.validateOneInput(
            normalizedTitle,
            'create-map-title',
            this.view.manualFormErrors
          );

          if (!isValid) return;
          this.model.setDraftTitle(normalizedTitle);
          const draft = this.model.getDraft();

          const nodeData = {
            title: draft.title,
            subtasks: draft.subtasks,
            roadmapID: this.view.takeRoadmapID,
          };
          console.log('obiekt nodeData:', nodeData);
        } catch (err) {
          console.error('onManualSubmit Error:');
        }
      },

      //       onEnterRoadmap: async (roadmapId) => {
      //         try {
      //           if (typeof roadmapId !== 'string') {
      //             throw new Error('RoadmapID is not a String!');
      //           }

      //           if (typeof this.onRenderRequest === 'function') {
      //             this.onRenderRequest(roadmapId);
      //           }
      //         } catch (err) {
      //           console.error('Pressenter error when entering the roadmap!');
      //         }
      //       },

      //       onDelete: async (roadmapId) => {
      //         try {
      //           const oldEl = this.view.findItemEl(roadmapId);
      //           const roadmaps = await this.model.finishRoadmap(roadmapId);

      //           if (!oldEl) throw new Error('oldEl is not valid');
      //           await this.view.onDeleteAnimation(oldEl);

      //           this.renderedIds.delete(roadmapId);
      //           sessionStorage.setItem(
      //             this.SEEN_KEY,
      //             JSON.stringify([...this.renderedIds])
      //           );

      //           this._renderRoadmaps(roadmaps);
      //         } catch (err) {
      //           console.error('finish failed');
      //         }
      //       },
    });

    //     const roadmaps = await this.model.loadAll();
    //     const seenFromSession = JSON.parse(
    //       sessionStorage.getItem(this.SEEN_KEY) || '[]'
    //     );
    //     this.renderedIds = new Set(seenFromSession);

    //     roadmaps.forEach((t) => this.renderedIds.add(t.id));

    //     this._renderRoadmaps(roadmaps);
    //     this.isInitialPaint = false;
    //   }
    //   /**
    //    * ========================================
    //    * RENDER METHODS
    //    * ========================================
    //    */
    //   _renderRoadmaps(roadmaps) {
    //     if (!Array.isArray(roadmaps)) return;
    //     this.view.ui.selector.list.innerHTML = '';

    //     const existingBackBtn =
    //       this.view.ui.roadmap.content.querySelector('#btn-back');
    //     if (!existingBackBtn) {
    //       this.view.renderBackBtn();
    //     }

    //     const visible = roadmaps.filter((r) => !r.done);

    //     visible.forEach((r, i) => {
    //       const isNew = !this.renderedIds.has(r.id);
    //       this.view.render(r, { isNew, isInitial: this.isInitialPaint, index: i });

    //       this._renderULforNodes(r);
    //       this.renderedIds.add(r.id);
    //     });

    //     sessionStorage.setItem(
    //       this.SEEN_KEY,
    //       JSON.stringify([...this.renderedIds])
    //     );
    //   }
    //   _renderULforNodes(roadmap) {
    //     const existingUl = this.view.ui.root.querySelector(
    //       `ul[data-id="ul-${roadmap.id}"]`
    //     );

    //     if (existingUl) return;
    //     this.view.createNodeUl(roadmap);
  }
  normalizeInput(raw) {
    if (typeof raw !== 'string') return '';

    let value = raw.trim();

    value = value.replace(/\s+/g, ' ');

    value = value.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

    value = value.replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, '');

    return value;
  }

  destroy() {
    this.view.deactivate();
  }
}
