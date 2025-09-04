export class RoadmapModel {
  constructor(firestoreService) {
    this.FsS = firestoreService;
    this.COL = 'roadmaps';
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
  //   async loadAll() {
  //     const rows = await this.FsS.loadUserCollection(this.COL);
  //     const sortedRows = rows.sort((a, b) => a.createdAt - b.createdAt);
  //     return sortedRows.map(this._normalize);
  //   }
  //   async createRoadmap({ title }) {
  //     const id = await this.FsS.addCollection(
  //       { title, done: false, createdAt: Date.now() },
  //       this.COL
  //     );
  //     if (!id) return await this.loadAll();

  //     const a11yId = 'a11y-' + String(id).slice(0, 8);
  //     await this.FsS.updateCollection({ a11yId }, this.COL, id);

  //     return await this.loadAll();
  //   }

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
