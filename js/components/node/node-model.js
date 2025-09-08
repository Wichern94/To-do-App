export class NodeModel {
  constructor(fullNodeData = {}) {
    this.data = { ...fullNodeData };
    // timer state (mapuj z timerSeconds, jeśli trzeba)
    this.timer = {
      accumulatedMs: (Number(fullNodeData.timerSeconds) || 0) * 1000,
      startedAt: null,
      isRunning: !!fullNodeData.isRunning,
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
    // payload do zapisu w bazie:
    // timerSeconds, accumulatedMs, startedAt|null, isRunning, paused, checkedSubtasks, nodeCompleted, completedAt?
  }
}
