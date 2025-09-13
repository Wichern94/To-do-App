import { NodeModel } from './node-model.js';
import { NodeView } from './node-view.js';
import { AnimationManager } from '../../Services/animation-manager.js';

export class NodePresenter {
  constructor(fullNodeData, plumbManager, firestoreService, options = {}) {
    this.plumb = plumbManager;
    this.animationManager = new AnimationManager(this.plumb);
    this.model = new NodeModel(fullNodeData, firestoreService);
    this.view = new NodeView(null, { animationManager: this.animationManager });

    this.options = options;
    this.allNodeInstances = [];
    this._uiTick = null;
    this._suppressFsUpdate = false;
    this.localState = { isActive: false };
  }
  get nodeData() {
    return this.model.data;
  }
  get ui() {
    return this.view.ui;
  }

  // === API kompatybilne z RoadmapPresenter ===
  render() {
    this.view.render(this.nodeData);
    this._bindViewCallbacks();
    this.view.activate();

    // początkowy stan UI:
    // this._refreshTimerUI(); // ustawi tekst zgodnie z model.getElapsedMs()
    // this._refreshButtonsUI(); // pokaże właściwe guziki (start/pause/cont/stop)
    // this._refreshCheckboxesUI(); // odblokuj/zablokuj, wpisz checkedSubtasks

    // if (this.options?.isNew) {
    //   // animacja pojawienia — możesz wywołać przez view/animation manager
    // }
  }

  setNodeListForRoadmap(nodes, { current: plumbManager } = {}) {
    // zgodność z istniejącym API
    this.allNodeInstances = nodes;
    this.plumb = plumbManager || this.plumb;
  }

  enableNode() {
    this.view.setUnlockedUI(true);
    this.view.showButtons(
      this.nodeData.subtasks.length > 0
        ? { start: true, accordionBtn: true }
        : { start: true, accordionBtn: false }
    );
    this.view.showProgress(false);
    this.view.setSubtasksDisabled(true);
    this.view.showTimer(false);
  }
  disableNode() {
    this.view.setUnlockedUI(false);
    this.view.showProgress(false);
    this.view.showButtons(
      this.nodeData.subtasks.length > 0
        ? { accordionBtn: true }
        : { accordionBtn: false }
    );
    this.view.setSubtasksDisabled(true);
    this.view.showTimer(false);
  }
  setActive() {
    if (this.localState.isActive) return;
    this.localState.isActive = true;
    this.view.setActiveUI(true);
    this.view.showTimer(true);
    this.view.showProgress(true);
    this.view.showButtons({ pause: true, accordionBtn: true });
    this.view.setSubtasksDisabled(false);
    // this.view.drawPlumbLines(this.plumb /* ul element jeżeli potrzebny */);
    // jeśli node był „paused”, pokaż continue; inaczej start
  }

  drawConnectionLines() {
    console.log('linie');

    // this.view.drawPlumbLines(this.plumb /* ul element */);
  }

  destroy() {
    // this._stopUiTick();
    // this._unsubRealtime?.();
    this.view.deactivate();
    this.view.unbind();
  }
  _bindViewCallbacks() {
    this.view.bind({
      onStart: (btn) => this._handleOnStart(btn),
      onPause: (btn) => this._handleOnPause(btn),
      onStop: (btn) => this._handleOnStop(btn),
      onContinue: (btn) => this._handleOnContinue(btn),
      onToggleAccordion: (next) => this._handleOnAccordion(next),
      onSubtaskChange: ({ doneCount, total, checkedIds }) =>
        this._handleOnSubtaskChange({ doneCount, total, checkedIds }),
    });
  }
  _handleOnStart(btn) {
    console.log('start', this.model.snapshot());
  }
  _handleOnPause(btn) {
    console.log('pause', btn);
  }
  _handleOnStop(btn) {
    console.log('stop', btn);
  }
  _handleOnContinue(btn) {
    console.log('Continue', btn);
  }
  _handleOnAccordion(next) {
    console.log('next:', next);
  }
  _handleOnSubtaskChange({ doneCount, total, checkedIds }) {
    this.model.setCheckedSubtasks(checkedIds);
    this.model.setProgress(doneCount, total);
    const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    this.view.setProgress({ doneCount, total, percent });
    this._applySubtaskRules(doneCount, total);
  }
  _applySubtaskRules(doneCount, total) {
    if (total === 0 || doneCount === total) {
      this.view.showButtons({ stop: true });
      this.view.setSubtasksDisabled(true);
    } else {
      this.view.setSubtasksDisabled(false);
      this.view.showButtons(
        this.nodeData.isRunning ? { pause: true } : { continue: true }
      );
    }
  }
}
