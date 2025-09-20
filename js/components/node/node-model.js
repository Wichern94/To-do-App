export class NodeModel {
  constructor(fullNodeData = {}, firestoreService) {
    this.data = {
      id: null,
      roadmapID: null,
      title: '',
      order: 0,
      subtasks: [],
      accumulatedMs: 0,
      startedAt: null,
      isRunning: false,
      wasActive: false,
      nodeCompleted: false,
      completedAt: null,
      progress: {
        doneCount: 0,
        total: Array.isArray(fullNodeData.subtasks)
          ? fullNodeData.subtasks.length
          : 0,
      },
      checkedSubtasks: [],
      timerSeconds: 0,
      ...fullNodeData,
    };
    this.FsS = firestoreService;
    this.refObj = { COL: 'roadmaps', SUBCOL: 'nodes' };
    this._suppressFsUpdate = false;
    this._pendingPatch = {};
    this._debounceTimer = null;
  }
  /**
   * ========================================
   *  GETTERS
   * ========================================
   */

  get col() {
    return this.refObj.COL;
  }
  get subcol() {
    return this.refObj.SUBCOL;
  }
  get roadmapID() {
    return this.data.roadmapID;
  }
  get nodeID() {
    return this.data.id;
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  TIME / NODE STATE
   * ========================================
   */

  async start() {
    if (this.data.isRunning) {
      console.warn('Node is already running, cannot start again.');
      return;
    }
    this.data.wasActive = true;
    this.data.isRunning = true;
    this.data.startedAt = Date.now();
    // Persist (PATCH): Save only changed fields to Firestore

    await this._save({
      wasActive: this.data.wasActive,
      isRunning: this.data.isRunning,
      startedAt: this.data.startedAt,
      accumulatedMs: this.data.accumulatedMs,
    });
  }

  async pause() {
    if (!this.data.isRunning) {
      console.warn('Node is not running, cannot pause.');
      return;
    }
    this.data.accumulatedMs += Date.now() - this.data.startedAt;
    this.data.startedAt = null;
    this.data.isRunning = false;

    await this._save({
      isRunning: this.data.isRunning,
      startedAt: this.data.startedAt,
      accumulatedMs: this.data.accumulatedMs,
    });
  }

  async stop() {
    if (this.data.isRunning) {
      await this.pause();
    }
    this.data.nodeCompleted = true;
    this.data.completedAt = Date.now();

    await this._save({
      nodeCompleted: this.data.nodeCompleted,
      completedAt: this.data.completedAt,
    });
  }

  getElapsedMs() {
    const now = Date.now();
    return (
      this.data.accumulatedMs +
      (this.data.isRunning && this.data.startedAt
        ? now - this.data.startedAt
        : 0)
    );
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  SUBTASKS SETTERS
   * ========================================
   */

  setProgress(doneCount, total) {
    if (
      this.data.progress.doneCount === doneCount &&
      this.data.progress.total === total
    ) {
      return;
    }
    this.data.progress = { doneCount, total };
    this.queueSave({
      progress: this.data.progress,
    });
  }
  setCheckedSubtasks(idsArray) {
    this.data.checkedSubtasks = idsArray;
    this.queueSave({
      checkedSubtasks: this.data.checkedSubtasks,
    });
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   * FIREBASE METHODS
   * ========================================
   */
  async _save(patch) {
    try {
      if (this._suppressFsUpdate) {
        console.warn('Save skipped: update in progress');
        return;
      }
      if (typeof patch !== 'object' || patch === null) {
        throw new Error('Invalid data for UPDATE!');
      }
      if (Object.keys(patch).length === 0) {
        throw new Error('Value object is empty!');
      }
      this._suppressFsUpdate = true;
      await this.FsS.updateElements(
        this.roadmapID,
        this.col,
        this.subcol,
        this.nodeID,
        patch
      );
    } catch (err) {
      console.error('PATCH ERROR:', err);
    } finally {
      this._suppressFsUpdate = false;
    }
  }

  queueSave(patch, delay = 500) {
    this._pendingPatch = { ...(this._pendingPatch || {}), ...patch };
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(async () => {
      await this._save(this._pendingPatch);
      this._pendingPatch = {};
    }, delay);
  }

  async moveToFinished() {
    const payload = this.getCompletedata();
    const refObj = {
      collection: 'roadmaps',
      subCollection: 'nodes',
    };

    const copyRefObj = {
      collection: 'Finished_Roadmaps',
      subCollection: 'Finished_Nodes',
    };
    await this.FsS.moveElementToFinished(payload, refObj, copyRefObj);
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  HELPERS
   * ========================================
   */

  snapshot() {
    return {
      id: this.data.id,
      roadmapID: this.data.roadmapID,
      title: this.data.title,
      order: this.data.order,
      subtasks: this.data.subtasks,
      accumulatedMs: this.data.accumulatedMs,
      startedAt: this.data.startedAt,
      isRunning: this.data.isRunning,
      wasActive: this.data.wasActive,
      nodeCompleted: this.data.nodeCompleted,
      completedAt: this.data.completedAt,
      progress: this.data.progress,
      checkedSubtasks: this.data.checkedSubtasks,
    };
  }

  getCompletedata() {
    return {
      id: this.data.id,
      roadmapID: this.data.roadmapID,
      title: this.data.title,
      order: this.data.order,
      subtasks: this.data.subtasks,
      checkedSubtasks: this.data.checkedSubtasks,
      progress: this.data.progress,
      accumulatedMs: this.data.accumulatedMs,
      completedAt: this.data.completedAt ?? Date.now(),
      nodeCompleted: this.data.nodeCompleted ?? true,
    };
  }

  hydrate(raw) {
    if (typeof raw !== 'object' || raw === null) {
      console.error('Invalid data for hydration.');
      return;
    }
    this.data = { ...this.data, ...raw };
    return this.data;
  }
}
// QUEUESAVE:

// Debounce is used here to prevent spamming Firestore with multiple rapid updates.
// For example, when a user checks several subtasks in quick succession, we want to
// batch those changes and send only one PATCH request after a short delay.
// This reduces network overhead, avoids hitting Firestore write limits,
// and prevents unnecessary echo loops from realtime listeners.
