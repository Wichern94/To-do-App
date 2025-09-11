export class NodeModel {
  constructor(fullNodeData = {}, firestoreService) {
    this.data = {
      id: null,
      roadmapID: null,
      title: '',
      order: 0,
      subtasks: [],
      checkedSubtasks: [],

      accumulatedMs: 0,
      startedAt: null,
      isRunning: false,

      wasActive: false,
      isActive: false,
      nodeCompleted: false,

      paused: false,
      timerSeconds: 0,
      ...fullNodeData,
    };
    this.FsS = firestoreService;
    this.refObj = { COL: 'roadmaps', SUBCOL: 'nodes' };
    // timer state (mapuj z timerSeconds, jeśli trzeba)
    this.timer = {
      accumulatedMs: (Number(fullNodeData.timerSeconds) || 0) * 1000,
      startedAt: null,
      isRunning: !!fullNodeData.isRunning,
    };
    this.state = {
      isActive: false,
      accumulatedMs: 0,
      startedAt: null,
      isRunning: false,
      wasActive: false,
      subtasks: [],
    };
  }

  hydrate(partial) {
    /* zaktualizuj data/timer z realtime */
  }
  start() {
    /* set startedAt=Date.now, isRunning=true */
  }
  pause() {
    /* add delta to accumulatedMs, clear startedAt, isRunning=false */
  }
  stop() {
    /* pause(); set completedAt in data */
  }
  getElapsedMs() {
    /* accumulated + (running ? now - startedAt : 0) */
  }

  toggleSubtask(i) {
    /* zaktualizuj checkedSubtasks + policz % */
  }
  getProgressPercent() {
    /* zwróć % z checkedSubtasks/subtasks */
  }

  snapshot() {
    return {
      accumulatedMs: this.state.accumulatedMs,
      startedAt: this.state.startedAt,
      isRunning: this.state.isRunning,
      wasActive: this.state.wasActive,
      isActive: this.state.isActive,
      subtasks: this.state.subtasks.map((task) => task.snapshot()),
    };
  }
}
