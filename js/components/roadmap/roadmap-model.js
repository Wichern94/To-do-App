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
    const nodeID = await this.FsS.addCollectionElement(
      dataObj,
      this.refObj.COL,
      this.refObj.SUBCOL
    );

    return nodeID;
  }
  async batchNodes(roadmapID, dataObj) {
    const allData = await this.FsS.batchAddNodes(
      roadmapID,
      dataObj,
      this.refObj.COL,
      this.refObj.SUBCOL
    );
    return allData;
  }
}
