export class ListModel {
  constructor(firestoreService) {
    this.FsS = firestoreService;
    this.COL = 'todoList';
  }
  async loadAll() {
    const rows = await this.FsS.loadUserCollection(this.COL);
    const sortedRows = rows.sort((a, b) => a.createdAt - b.createdAt);
    return sortedRows.map(this._normalize);
  }
  async createTask({ title, desc }) {
    const id = await this.FsS.addCollection(
      { title, desc, done: false },
      this.COL
    );
    if (!id) return await this.loadAll();

    const a11yId = 'a11y-' + String(id).slice(0, 8);
    await this.FsS.updateCollection({ a11yId }, this.COL, id);

    return await this.loadAll();
  }

  async finishTask(id) {
    await this.FsS.deleteDocument(id, this.COL);
    return await this.loadAll();
  }

  _normalize = (raw) => ({
    id: raw.id,
    title: raw.title ?? '',
    desc: raw.desc ?? '',
    done: Boolean(raw.done),
    createdAt: raw.createdAt ?? null,
    a11yId: raw.a11yId ?? 'a11y-' + String(raw.id).slice(0, 8),
  });
}
