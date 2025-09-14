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
    this._showTimerOnRender(true);

    if (this.nodeData.subtasks.length > 0) {
      this.view.showButtons({ pause: true, accordionBtn: true });
      this.view.setSubtasksDisabled(false);
      this.view.showProgress(true);
    } else {
      this.view.showButtons({ stop: true, accordionBtn: false });
      this.view.setSubtasksDisabled(true);
      this.view.showProgress(false);
    }
    this.drawConnectionLines();
    // jeśli node był „paused”, pokaż continue; inaczej start
  }

  drawConnectionLines() {
    if (!this.plumb.jsPlumbInstance) return;
    this.plumb.jsPlumbInstance.deleteEveryConnection();

    const sortedNodes = this.view.findAndSortNodes(this.nodeData.roadmapID);

    const anchorsLeftRight = ['Right', 'Left'];
    const anchorsTopBottom = ['Bottom', 'Top'];

    sortedNodes.forEach((currentNode, index) => {
      const nextNode = sortedNodes[index + 1];
      if (!nextNode) return;
      const order = Number(currentNode.dataset.order);

      const anchors = order % 2 === 0 ? anchorsTopBottom : anchorsLeftRight; // jesli parzysta to top-bottom, jesli nie to left-right

      this.plumb?.connect(currentNode.id, nextNode.id, anchors);
    });
    this.view.repaintLoop(this.plumb, { duration: 200 });
  }

  destroy() {
    this._stopUiTick();
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

  async _handleOnStart() {
    await this.model.start();
    this.setActive();
    this.view.setTimerText(this.formatHHMMSS(this.model.getElapsedMs()));
    this._startUiTick();
  }

  async _handleOnPause() {
    await this.model.pause();
    if (this.nodeData.subtasks.length > 0) {
      this.view.showButtons({ continue: true, accordionBtn: true });
      this.view.setSubtasksDisabled(true);
    }
    this._stopUiTick();
    this.view.setTimerText(this.formatHHMMSS(this.model.getElapsedMs()));
  }

  async _handleOnStop(btn) {
    await this.model.stop();
    this.view.showButtons({});
    this.view.setSubtasksDisabled(true);
    this._stopUiTick();
  }

  async _handleOnContinue(btn) {
    await this.model.start();
    if (this.nodeData.subtasks.length > 0) {
      this.view.showButtons({ pause: true, accordionBtn: true });
      this.view.setSubtasksDisabled(false);
    }
    this._showTimerOnRender(true);

    this._startUiTick();
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
        this.nodeData.isRunning
          ? { pause: true, accordionBtn: true }
          : { continue: true, accordionBtn: true }
      );
    }
  }
  formatHHMMSS(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    //divide the whole seconds by 3600 (the number of seconds in an hour) and round down to access whole hours.
    const hours = Math.floor(totalSeconds / 3600);

    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const h = hours.toString().padStart(2, '0');
    const m = mins.toString().padStart(2, '0');
    const s = secs.toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  _startUiTick() {
    if (this._uiTick) {
      return;
    }
    this._uiTick = setInterval(() => {
      const elapsedMs = this.model.getElapsedMs();
      const formattedTime = this.formatHHMMSS(elapsedMs);
      this.view.setTimerText(formattedTime);
    }, 500);
  }
  _stopUiTick() {
    if (this._uiTick) {
      clearInterval(this._uiTick);
      this._uiTick = null;
    }
  }
  _showTimerOnRender(value) {
    this.view.showTimer(value);
    this.view.setTimerText(this.formatHHMMSS(this.model.getElapsedMs()));
  }
}
