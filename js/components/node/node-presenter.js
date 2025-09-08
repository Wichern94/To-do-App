import { NodeModel } from './node-model.js';
import { NodeView } from './node-view.js';

export class NodePresenter {
  constructor(fullNodeData, plumbManager, firestoreService, options = {}) {
    this.model = new NodeModel(fullNodeData);
    this.view = new NodeView();
    this.plumb = plumbManager;
    this.fs = firestoreService;
    this.options = options;

    this._uiTick = null; // interval do odświeżania napisu (nie liczenia czasu!)
    this._suppressFsUpdate = false; // guard przed echo-loop realtime
  }

  // === API kompatybilne z RoadmapPresenter ===
  render() {
    this.view.render(this.model.data);

    // bindy UI -> metody prezentera:
    this.view.bindStart(() => this._onStart());
    this.view.bindPause(() => this._onPause());
    this.view.bindContinue(() => this._onStart());
    this.view.bindStop(() => this._onStop());
    this.view.bindAccordion(() => this._onToggleAccordion());

    // początkowy stan UI:
    this._refreshTimerUI(); // ustawi tekst zgodnie z model.getElapsedMs()
    this._refreshButtonsUI(); // pokaże właściwe guziki (start/pause/cont/stop)
    this._refreshCheckboxesUI(); // odblokuj/zablokuj, wpisz checkedSubtasks

    if (this.options?.isNew) {
      // animacja pojawienia — możesz wywołać przez view/animation manager
    }
  }

  setNodeListForRoadmap(nodes, { current: plumbManager } = {}) {
    // zgodność z istniejącym API
    this.allNodeInstances = nodes;
    this.plumb = plumbManager || this.plumb;
  }

  enableNode() {
    this.view.setEnabled(true);
    this.view.showButtons({ start: true });
  }
  disableNode() {
    this.view.setEnabled(false);
    this.view.showButtons({});
    this._stopUiTick();
  }
  setActive() {
    // jak dziś: border, timer visible, checkboxes enabled, plumb lines
    this.view.showTimer();
    this.view.setCheckboxesEnabled(true);
    this.view.drawPlumbLines(this.plumb /* ul element jeżeli potrzebny */);
    // jeśli node był „paused”, pokaż continue; inaczej start
  }

  drawConnectionLines() {
    this.view.drawPlumbLines(this.plumb /* ul element */);
  }

  destroy() {
    this._stopUiTick();
    this._unsubRealtime?.();
    this.view.destroy();
  }

  // === Handlery ===
  _onStart() {
    if (this.model.timer.isRunning) return;
    this.model.start();
    this._startUiTick();
    this._refreshButtonsUI();
    this.view.setCheckboxesEnabled(true);
    this._updateFs({ silent: false }); // zapis snapshotu (isRunning:true)
  }

  _onPause() {
    if (!this.model.timer.isRunning) return;
    this.model.pause();
    this._refreshTimerUI(); // od razu odśwież
    this._stopUiTick();
    this._refreshButtonsUI();
    this.view.setCheckboxesEnabled(false);
    this._updateFs({ silent: false }); // snapshot (isRunning:false, accumulatedMs)
  }

  _onStop() {
    this.model.stop();
    this._refreshTimerUI();
    this._stopUiTick();
    this._refreshButtonsUI();
    this.view.setCheckboxesEnabled(false);
    // tutaj wywołujesz przeniesienie do Finished tak jak dotąd
    // this.fs.moveElementToFinished(...)
  }

  _onToggleAccordion() {
    /* animacja/view toggle */
  }

  // === UI tick (tylko do WYŚWIETLANIA, nie do liczenia) ===
  _startUiTick() {
    if (this._uiTick) return;
    this._uiTick = setInterval(() => this._refreshTimerUI(), 1000);
  }
  _stopUiTick() {
    if (!this._uiTick) return;
    clearInterval(this._uiTick);
    this._uiTick = null;
  }
  _refreshTimerUI() {
    const secs = Math.floor(this.model.getElapsedMs() / 1000);
    this.view.setTimerText(this._formatTime(secs));
  }
  _refreshButtonsUI() {
    const r = this.model.timer.isRunning;
    this.view.showButtons({
      start: !r,
      pause: r,
      continue: !r && this.model.timer.accumulatedMs > 0,
      stop: false, // lub według Twojej logiki
    });
  }
  _refreshCheckboxesUI() {
    this.view.writeCheckedSubtasks(this.model.data.checkedSubtasks || []);
    this.view.setCheckboxesEnabled(this.model.timer.isRunning);
    const percent = this.model.getProgressPercent?.() ?? 0;
    this.view.setProgress(percent);
  }

  // === Realtime ===
  realTimeListener() {
    if (this._unsubRealtime) return;
    this._unsubRealtime = this.fs.listenToElement(
      this.model.data.roadmapID,
      'roadmaps',
      'nodes',
      this.model.data.id,
      {
        onUpdate: (partial) => this._handleRealtimeUpdate(partial),
        onDelete: () => this._handleRealtimeDelete(),
      }
    );
  }
  _handleRealtimeUpdate(partial) {
    this._suppressFsUpdate = true;
    this.model.hydrate(partial); // zaktualizuj stan
    this._refreshButtonsUI();
    this._refreshTimerUI();
    this.view.writeCheckedSubtasks(this.model.data.checkedSubtasks || []);
    this._suppressFsUpdate = false;
  }
  _handleRealtimeDelete() {
    this.destroy();
    this.options?.onDelete?.(this);
  }

  // === FS update helper ===
  _updateFs({ silent = false } = {}) {
    if (this._suppressFsUpdate) return; // echo-guard
    const payload = this.model.snapshot();
    this.fs.updateElements(
      this.model.data.roadmapID,
      'roadmaps',
      'nodes',
      this.model.data.id,
      payload
    );
  }

  _formatTime(totalSeconds) {
    // użyj Twojej funkcji formatowania HH:MM:SS (bez gotowca)
  }
}
