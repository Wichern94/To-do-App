import { FormValidator } from '../../Services/form-validator.js';
import { RoadmapPlumbManager } from '../../Services/plumb-manager.js';
import { NodeElement } from '../node-component.js';

export class RoadmapPresenter {
  constructor(model, view, roadmapID, callbacks = {}) {
    this.model = model;
    this.view = view;

    this.roadmapID = roadmapID;
    this.plumb = null;
    this.nodes = [];

    this.onQuitRequest = callbacks.onQuitRequest || null;
    this.onSubmitSuccess = callbacks.onSubmitSuccess || null;
  }
  /**
   * ========================================
   * INITIALIZATION METHOD
   * ========================================
   */
  async init() {
    try {
      this.view.activate();
      this._bindViewCallbacks();

      this.rootUl = this.view.getRootUl(this.roadmapID);
      if (!this.rootUl) throw new Error('rootUL not found!');

      this._ensurePlumb();
      const list = await this._fetchNodes();
      const sorted = this._sortByOrder(list);

      this._clearRenderedNodes();
      this._mountAll(sorted);

      const active = this._findActiveNode();
      if (active) this._applyActive(active);
    } catch (err) {
      console.error('INITIALIZATION ERROR:', err);
    }
  }
  async reload() {
    try {
      this.rootUl = this.view.getRootUl(this.roadmapID);
      if (!this.rootUl) throw new Error('rootUL not found!');

      this._ensurePlumb();
      const list = await this._fetchNodes();
      if (!list) throw new Error('List not Found!');
      const sorted = this._sortByOrder(list);

      this._clearRenderedNodes();
      this._mountAll(sorted);

      const active = this._findActiveNode();
      if (active) this._applyActive(active);
    } catch (err) {
      console.error('RELOAD ERROR:', err);
    }
  }

  destroy() {
    this._unbindViewCallbacks?.();
    for (const n of this.nodes) n.destroy?.();
    this.nodes = [];
    this.plumb?.destroy?.();
    this.plumb = null;
    this.rootUl = null;
    this.view.deactivate();
  }

  /**
   * ========================================
   * PLUMB METHODS
   * ========================================
   */
  _ensurePlumb() {
    if (!this.plumb) {
      this.plumb = new RoadmapPlumbManager(this.rootUl);
    }
  }
  _redrawConnections() {
    const interval = setInterval(() => {
      this.plumb?.jsPlumbInstance?.revalidate(this.roadmapID);
      this.plumb?.jsPlumbInstance?.repaintEverything();
    }, 10);
    setTimeout(() => {
      clearInterval(interval);
    }, 1500);
  }

  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * NODE METHODS
   * ========================================
   */
  _createNodeElement(nodeData, { isNew = false } = {}) {
    return new NodeElement(nodeData, this.plumb, this.model.FsS, {
      isNew,
      onDelete: (node) => this.removeNode(node.nodeData.id),
    });
  }
  removeNode(id) {
    const i = this.nodes.findIndex((n) => n.nodeData.id === id);
    if (i !== -1) {
      this.nodes[i].destroy?.();
      this.nodes.splice(i, 1);
    }
  }

  addNode(fullNode) {
    this._ensurePlumb();
    const node = this._createNodeElement(fullNode, { isNew: true });
    this._mountNode(node);
    this._redrawConnections?.();
  }

  _findActiveNode() {
    return (
      this.nodes.find((n) => n.nodeData.wasActive) ?? this.nodes[0] ?? null
    );
  }

  _applyActive(node) {
    node.setActive();
    node.drawConnectionLines();
  }

  _clearRenderedNodes() {
    this.nodes.forEach((n) => n.destroy?.());
    this.nodes = [];
    this.rootUl.querySelectorAll('.roadmap-node').forEach((el) => el.remove());
  }

  _mountNode(node) {
    node.render();
    node.setNodeListForRoadmap(this.nodes, { current: this.plumb });
    this.nodes.push(node);
  }
  _mountAll(list) {
    list.forEach((data, i) => {
      const node = this._createNodeElement(data);
      this._mountNode(node);
      if (i === 0) node.enableNode();
      else node.disableNode();
    });
  }
  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * CALLBACKS BIND
   * ========================================
   */
  _bindViewCallbacks() {
    this.view.bind({
      onModalOpen: async (e) => this._handleOpenModal(e),

      onModalClose: async (e) => this._handleCloseModal(),

      onQuitRoadmap: () => {
        if (typeof this.onQuitRequest === 'function') {
          this.onQuitRequest();
        }
      },

      onAddSubtask: async (rawData) => this._handleAddSubtask(rawData),

      onManualSubmit: async (rawFormData) =>
        this._handleManualSubmit(rawFormData),
    });
  }
  _unbindViewCallbacks() {
    this.view.deactivate();
  }
  /**
   * ========================================
   *
   * ========================================
   */

  /**
   * ========================================
   * CALLBACKS Methods
   * ========================================
   */
  _handleAddSubtask(raw) {
    try {
      const value = this.normalizeInput(raw);
      const ok = FormValidator.validateOneInput(
        value,
        'roadmap-subelements',
        this.view.manualFormErrors
      );

      if (!ok) {
        this.view.animateInvalidBtn();
        return;
      }
      this.model.addDraftSubtask(value);

      this.view.clearSubtaskInputAndContainer();
      this.view.renderSubtasks(this.model.getDraft().subtasks);
    } catch (err) {
      console.error('Add Subtask Error:', err);
    }
  }
  async _handleManualSubmit(rawForm) {
    if (this.model.isSubmitting) return;
    try {
      const title = this.normalizeInput(rawForm.title);

      const ok = FormValidator.validateOneInput(
        title,
        'create-map-title',
        this.view.manualFormErrors
      );
      if (!ok) return;

      this.model.setDraftTitle(title);
      const draft = this.model.getDraft();

      this.model.isSubmitting = true;
      this.view.setPending?.(true);

      const list = await this._fetchNodes();
      const order = this._computeNextOrder(list);

      const nodeData = {
        title: draft.title,
        subtasks: draft.subtasks,
        roadmapID: this.roadmapID,
        order: order,
        wasActive: false,
      };

      const nodeID = await this.model.createNode(nodeData);
      if (!nodeID) throw new Error('Node ID not found!');

      this.addNode({ ...nodeData, nodeID });

      this.model.resetDraft();
      this.view.clearManualForm();
      await this.view.closeModal();
    } catch (err) {
      console.error('onManualSubmit Error:');
    } finally {
      this.model.isSubmitting = false;
      this.view.setPending?.(false);
    }
  }
  async _handleOpenModal(e) {
    try {
      this.model.resetDraft();

      this.view.clearManualForm();
      this.view.clearImportForm();

      await this.view.openModal(e);
    } catch (err) {
      console.error('Open Modal failed:', err);
    }
  }
  async _handleCloseModal() {
    try {
      this.view.clearManualForm();
      this.view.clearImportForm();
      await this.view.closeModal();
    } catch (err) {
      console.error('Open Modal failed:', err);
    }
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
  async _fetchNodes() {
    return await this.model.getExistingNodes(this.roadmapID);
  }
  _sortByOrder(list) {
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  _computeNextOrder(nodes) {
    const max = nodes
      .map((n) => (Number.isFinite(n?.order) ? n.order : -1))
      .reduce((acc, v) => (v > acc ? v : acc), -1);
    return max + 1;
  }
  normalizeInput(raw) {
    if (typeof raw !== 'string') return '';

    let value = raw.trim();

    value = value.replace(/\s+/g, ' ');

    value = value.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

    value = value.replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, '');

    return value;
  }
}
