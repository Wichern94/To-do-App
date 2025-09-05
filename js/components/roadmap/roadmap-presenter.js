import { FormValidator } from '../../Services/form-validator.js';
export class RoadmapPresenter {
  constructor(model, view, callbacks = {}) {
    this.model = model;
    this.view = view;
    this.renderedIds = new Set();
    this.isInitialPaint = true;
    this.SEEN_KEY = 'seenRoadmapsIds';

    this.onQuitRequest = callbacks.onQuitRequest || null;
    this.onSubmitSuccess = callbacks.onSubmitSuccess || null;
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
          await this.view.handleCloseModal();
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
          const existingNodes = await this.model.getExistedNodes(
            this.view.takeRoadmapID
          );

          const maxOrder = Math.max(...existingNodes.map((n) => n.order ?? 0));
          const newOrder = isFinite(maxOrder) ? maxOrder + 1 : 0;

          const nodeDataWithOrder = {
            ...nodeData,
            order: newOrder,
            wasActive: false,
          };

          const nodeID = this.model.createNode(nodeDataWithOrder);
          if (!nodeID) throw new Error('Node ID not found!');

          const fullData = { ...nodeDataWithOrder, id: nodeID };

          if (typeof this.onSubmitSuccess === 'function') {
            this.onSubmitSuccess(fullData);
          }
          this.view.clearManualForm();
          await this.view.handleCloseModal();
        } catch (err) {
          console.error('onManualSubmit Error:');
        }
      },
    });
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
