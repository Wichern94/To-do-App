import ERRORS, { FormValidator } from '../../Services/form-validator.js';
import { RoadmapPlumbManager } from '../../Services/plumb-manager.js';
import { NodeElement } from '../node/node-element.js';
// import { NodeElement } from '../node-component.js';

export class RoadmapPresenter {
  constructor(model, view, roadmapID, callbacks = {}) {
    this.model = model;
    this.view = view;

    this.roadmapID = roadmapID;
    this.plumb = null;
    this.nodes = [];

    this.onQuitRequest = callbacks.onQuitRequest || null;
    this.onManualSubmitSuccess = callbacks.onManualSubmitSuccess || null;
    this.onCopySuccess = callbacks.onCopySuccess || null;
    this.onImportSubmitSuccess = callbacks.onImportSubmitSuccess || null;
  }
  /**
   * ========================================
   * INITIALIZATION METHOD
   * ========================================
   */
  async init() {
    try {
      this.view.activate();
      this.rootUl = this.view.getRootUl(this.roadmapID);

      this._ensurePlumb();
      this._bindViewCallbacks();

      this.view.setupCharacterCounter();
      if (!this.rootUl) throw new Error('rootUL not found!');

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
  _redrawConnections(node) {
    node?.drawConnectionLines();
    const interval = setInterval(() => {
      this.plumb?.jsPlumbInstance?.revalidate(this.rootUl);
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

  async addNode(fullNode) {
    try {
      this._ensurePlumb();
      const newNode = this._createNodeElement(fullNode, { isNew: true });

      this._mountNode(newNode);
      const index = this.nodes.length - 1;
      const activeNode = this.nodes.find(
        (node) => node.nodeData.wasActive === true
      );
      if (index === 0) {
        newNode.enableNode();
      } else {
        newNode.disableNode();
      }
      if (activeNode) {
        this._redrawConnections?.(newNode);
      }
    } catch (err) {
      console.error('ADD NODE ERROR:', err);
    }
  }

  _findActiveNode() {
    return this.nodes.find((n) => n.nodeData.wasActive); //?? null this.nodes[0]
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
  closeAllAccordeon() {
    this.nodes.forEach((n) => n.closeAccordeon?.());
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
      onModalOpen: async (e) => await this._handleOpenModal(e),
      onModalClose: async (e) => await this._handleCloseModal(),
      onQuitRoadmap: () => {
        this.closeAllAccordeon();
        if (typeof this.onQuitRequest === 'function') {
          this.onQuitRequest();
        }
      },
      onAddSubtask: async (rawData) => this._handleAddSubtask(rawData),
      onManualSubmit: async (rawFormData) =>
        await this._handleManualSubmit(rawFormData),
      onPromtCopy: async () => await this._handleCopyPromt(),
      onImportSubmit: async (rawText) =>
        await this._handleImportSubmit(rawText),
      onManualSwitch: async (btn) => this.view.handleManualSwitch(btn),
      onImportSwitch: async (btn) => this.view.handleImportSwitch(btn),
    });
  }

  _unbindViewCallbacks() {
    this.view.unbind();
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
      console.error('ADD SUBBTASK ERROR:', err);
    }
  }
  async _handleManualSubmit(rawForm) {
    if (this.model.isSubmitting) return;
    try {
      const raw = String(rawForm ?? '');
      if (!raw.trim()) {
        this.view?.manualFormErrors?.showError?.(
          'create-map-title',
          ERRORS.E_VALUE_EMPTY
        );
        return;
      }
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

      let list = [];
      try {
        list = await this._fetchNodes();
      } catch (e) {
        const msg = ERRORS[e.code] || 'Failed to load existing nodes.';
        this.view?.manualFormErrors?.showError?.('create-map-title', msg);

        this.view.setPending?.(false);
        this.model.isSubmitting = false;
        return;
      }

      const order = this._computeNextOrder(list);

      const nodeData = {
        title: draft.title,
        subtasks: draft.subtasks,
        roadmapID: this.roadmapID,
        order: order,
        wasActive: false,
      };

      const id = await this.model.createNode(nodeData);
      if (!id) throw new Error('Node ID not found!');

      await this.addNode({ ...nodeData, id });

      this.model.resetDraft();
      this.view.clearManualForm();
      await this.view.closeModal();

      if (typeof this.onManualSubmitSuccess === 'function') {
        this.onManualSubmitSuccess({ ...nodeData, id });
      }
    } catch (err) {
      console.error('ONMANUAL SUBMIT ERROR:', err);
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
      console.error('OPEN MODAL FAILED:', err);
    }
  }
  async _handleCloseModal() {
    try {
      this.view.clearManualForm();
      this.view.clearImportForm();
      await this.view.closeModal();
    } catch (err) {
      console.error('CLOSE MODAL FAILED:', err);
    }
  }
  async _handleCopyPromt() {
    const promtText = `Generate a learning roadmap in JSON format for <HERE, WRITE WHAT THE ROADMAP SHOULD BE ABOUT!!>. The structure should be an array of objects, with each object having a "title" key and a "subtasks" array.

Requirements:
- The title should be concise, a maximum of 3-4 words, specific, and describe the learning stage.
- Each "subtask" should be a maximum of 5 words.
- Subtask names should also be concise but readable.
- Do not limit the number of stages or the number of subtasks.
- Omit any additional comments—the response should contain **only** pure JSON in the specified format.

Example structure:

[
{
"title": "SCSS and Sass Basics",
"subtasks": ["Sass CSS differences", "Sass installation", "Variables and nesting"]
},
{
"title": "Mixins and Functions",
"subtasks": ["Defining mixins", "Mixin arguments", "Mixins with @content", "Creating functions", "Mixin vs function differences"]
}
]
`;
    navigator.clipboard
      .writeText(promtText)
      .then(() => {
        if (typeof this.onCopySuccess === 'function') {
          this.onCopySuccess();
        }
      })
      .catch((err) => {
        console.error('PROMT COPY ERROR:', err, 'using fallback...');

        const ta = document.createElement('textarea');
        ta.value = promtText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();

        this.onCopySuccess?.();
      });
  }

  async _handleImportSubmit(rawText) {
    if (this.model.isSubmitting) return;
    try {
      const raw = String(rawText ?? '');
      if (!raw.trim()) {
        this.view?.importFormErrors?.showError?.(
          'import',
          ERRORS.E_VALUE_EMPTY
        );
        return;
      }
      const parsedData = this._parseImportText(rawText);

      this.model.isSubmitting = true;
      this.view.setPending?.(true);

      const cleaned = parsedData.map((n) => ({
        ...n,
        title: this.normalizeInput(n.title),
        subtasks: n.subtasks.map((s) => this.normalizeInput(s)),
      }));
      let list = [];
      try {
        list = await this._fetchNodes();
      } catch (e) {
        const msg = ERRORS[e.code] || 'Failed to load existing nodes.';
        this.view?.importFormErrors?.showError?.('import', msg);

        this.view.setPending?.(false);
        this.model.isSubmitting = false;
        return;
      }

      const order = this._computeNextOrder(list);

      const nodesData = cleaned.map((node, i) => {
        return {
          ...node,
          order: order + i,
          wasActive: false,
          roadmapID: this.roadmapID,
        };
      });
      const allData = await this.model.batchNodes(this.roadmapID, nodesData);
      const length = allData.length;

      for (const node of allData) {
        await this.addNode(node, node.id);
      }
      if (typeof this.onImportSubmitSuccess === 'function') {
        this.onImportSubmitSuccess({ length });
      }
      this.view.clearImportForm();
      await this.view.closeModal();
    } catch (err) {
      console.error('IMPORT SUBMIT ERROR:', err);
      const message = ERRORS[err.code] || 'An unknown error occurred.';

      this.view?.importFormErrors?.showError?.('import', message);
    } finally {
      this.model.isSubmitting = false;
      this.view.setPending?.(false);
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
  _parseImportText(jsonText) {
    try {
      const parsedData = JSON.parse(jsonText);

      if (!Array.isArray(parsedData)) {
        throw { code: 'E_TOPLEVEL_NOT_ARRAY' };
      }
      parsedData.forEach((node, index) => {
        switch (true) {
          case typeof node !== 'object' || node === null || Array.isArray(node):
            throw { code: 'E_ITEM_NOT_OBJECT', index };
          case !node.title:
            throw { code: 'E_TITLE_MISSING', index };
          case typeof node.title !== 'string':
            throw { code: 'E_TITLE_TYPE', index };
          case node.title.trim() === '':
            throw { code: 'E_TITLE_EMPTY', index };
          case !Array.isArray(node.subtasks):
            throw { code: 'E_SUBTASKS_NOT_ARRAY', index };
          case node.subtasks.some((subtask) => typeof subtask !== 'string'):
            throw { code: 'E_SUBTASK_TYPE', index };
          case node.subtasks.some((subtask) => subtask.trim() === ''):
            throw { code: 'E_SUBTASK_EMPTY', index };
        }
      });

      return parsedData;
    } catch (err) {
      if (typeof err === 'object' && err.code) {
        throw err;
      }
      throw { code: 'E_JSON_PARSE', message: err.message };
    }
  }
}
