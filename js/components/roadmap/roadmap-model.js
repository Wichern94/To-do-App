export class RoadmapModel {
  constructor(firestoreService) {
    this.FsS = firestoreService;
    this.refObj = { COL: 'roadmaps', SUBCOL: 'nodes' };
    this._draft = { title: '', subtasks: [] };
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
  async getExistedNodes(roadmapID) {
    try {
      if (!roadmapID.startsWith('ul-'))
        throw new Error('roadmapID is not in the correct format!');
      const existingNodes = await this.FsS.getElementsfromSubCollection(
        roadmapID,
        this.refObj.COL,
        this.refObj.SUBCOL
      );
      return existingNodes;
    } catch (err) {
      console.error('getExistedNodes Error:', err);
    }
  }
  //   async loadAll() {
  //     const rows = await this.FsS.loadUserCollection(this.COL);
  //     const sortedRows = rows.sort((a, b) => a.createdAt - b.createdAt);
  //     return sortedRows.map(this._normalize);
  //   }
  async createNode(DataObj) {
    const nodeID = await this.FsS.addCollectionElement(
      DataObj,
      this.refObj.COL,
      this.refObj.SUBCOL
    );

    return nodeID;
  }

  //   async finishRoadmap(roadmapID) {
  //     if (roadmapID.startsWith('ul-')) {
  //       const slicedID = roadmapID.slice(3);
  //       await this.FsS.deleteDocument(slicedID, this.COL);
  //     } else {
  //       await this.FsS.deleteDocument(roadmapID, this.COL);
  //       return await this.loadAll();
  //     }
  //   }

  //   _normalize = (raw) => ({
  //     id: raw.id,
  //     title: raw.title ?? '',
  //     desc: raw.desc ?? '',
  //     done: Boolean(raw.done),
  //     createdAt: raw.createdAt ?? null,
  //     a11yId: raw.a11yId ?? 'a11y-' + String(raw.id).slice(0, 8),
  //   });
}
