export class RoadmapModel {
  constructor(firestoreService) {
    this.FsS = firestoreService;
    this.refObj = { COL: 'roadmaps', SUBCOL: 'nodes' };
    this._draft = { title: '', subtasks: [] };
    this.isSubmitting = false;
  }
  resetDraft() {
    this._draft = {
      title: '',
      subtasks: [],
    };
  }
  addDraftSubtask(value) {
    this._draft.subtasks.push(value);
  }
  setDraftTitle(value) {
    this._draft.title = value;
  }
  getDraft() {
    return this._draft;
  }
  async getExistingNodes(roadmapID) {
    if (typeof roadmapID !== 'string' || !roadmapID) {
      const e = new Error('Invalid roadmapID');
      e.code = 'E_INVALID_ROADMAP_ID';
      throw e;
    }
    try {
      return await this.FsS.getElementsfromSubCollection(
        roadmapID,
        this.refObj.COL,
        this.refObj.SUBCOL
      );
    } catch (err) {
      if (!err.code) err.code = 'E_FETCH_NODES';
      throw err;
    }
  }

  async createNode(dataObj) {
    const subtasks = this._normalizeSubtasks(dataObj.subtasks);
    const payload = {
      ...dataObj,
      subtasks,
      checkedSubtasks: Array.isArray(dataObj.checkedSubtasks)
        ? dataObj.checkedSubtasks
        : [],
    };

    const nodeID = await this.FsS.addCollectionElement(
      payload,
      this.refObj.COL,
      this.refObj.SUBCOL
    );

    return nodeID;
  }
  async batchNodes(roadmapID, dataObj) {
    const normalizeNodes = dataObj.map((n) => ({
      ...n,
      subtasks: this._normalizeSubtasks(n.subtasks),
      checkedSubtasks: Array.isArray(n.checkedSubtasks)
        ? n.checkedSubtasks
        : [],
    }));
    const allData = await this.FsS.batchAddNodes(
      roadmapID,
      normalizeNodes,
      this.refObj.COL,
      this.refObj.SUBCOL
    );
    return allData;
  }
  _generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomPart}`;
  }
  _normalizeSubtasks(input = []) {
    return input.map((item, i) => {
      if (typeof item === 'string') {
        return { id: this._generateUniqueId(), title: item };
      }
      const title = item.title ?? '';
      const id = item.id ?? this._generateUniqueId();
      return { id, title };
    });
  }
}
