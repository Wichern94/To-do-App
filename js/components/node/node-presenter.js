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
  get hasSubtasks() {
    return (
      Array.isArray(this.nodeData.subtasks) && this.nodeData.subtasks.length > 0
    );
  }
  get isRunning() {
    return this.nodeData.isRunning;
  }
  get wasActive() {
    return this.nodeData.wasActive;
  }
  get subtasksStatus() {
    const total =
      this.nodeData?.progress?.total ?? this.nodeData?.subtasks?.length ?? 0;

    const done =
      this.nodeData?.progress?.doneCount ??
      this.nodeData?.checkedSubtasks?.length ??
      0;

    const allDone = total > 0 && done === total;

    return {
      done,
      total,
      allDone,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }

  render() {
    this.view.render(this.nodeData);
    this._bindViewCallbacks();
    this.view.activate();
    this._renderControls();
    if (this.isRunning) this._startUiTick();
    // this._restoreButtonsState();

    // this.view.showProgress(this.hasSubtasks);

    // if (this.isRunning) {
    //   this.view.showButtons({ pause: true, accordionBtn: this.hasSubtasks });
    //   this._showTimerOnRender(true);
    //   this._startUiTick();
    // } else if (this.nodeData.accumulatedMs > 0) {
    //   this.view.showButtons({ continue: true, accordionBtn: this.hasSubtasks });
    //   this._showTimerOnRender(true);
    // } else {
    //   this.view.showButtons({ start: true, accordionBtn: this.hasSubtasks });
    //   this.view.showTimer(false);
    // }

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
    this.view.showButtons({ start: true, accordionBtn: this.hasSubtasks });

    this.view.showProgress(false);
    this.view.setSubtasksDisabled(true);
    this.view.showTimer(false);
  }
  disableNode() {
    this.view.setUnlockedUI(false);
    this.view.showProgress(false);
    this.view.showButtons({ accordionBtn: this.hasSubtasks });

    this.view.setSubtasksDisabled(true);
    this.view.showTimer(false);
  }
  setActive() {
    if (this.localState.isActive) return;
    this.localState.isActive = true;
    this.view.setActiveUI(true);
    this._renderControls();
    // this._showTimerOnRender(true);

    // if (this.nodeData.subtasks.length > 0) {
    //   this.view.showButtons({ pause: true, accordionBtn: this.hasSubtasks });
    //   this.view.setSubtasksDisabled(false);
    //   this.view.showProgress(true);
    // } else {
    //   this.view.showButtons({ stop: true, accordionBtn: this.hasSubtasks });
    //   this.view.setSubtasksDisabled(true);
    //   this.view.showProgress(false);
    // }
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
    // this.view.setTimerText(this.formatHHMMSS(this.model.getElapsedMs()));
    this._startUiTick();
    this._renderControls();
  }

  async _handleOnPause() {
    await this.model.pause();
    // if (this.nodeData.subtasks.length > 0) {
    //   this.view.showButtons({ continue: true, accordionBtn: true });
    //   this.view.setSubtasksDisabled(true);
    this._stopUiTick();
    this._renderControls();
    // this.view.setTimerText(this.formatHHMMSS(this.model.getElapsedMs()));
  }

  async _handleOnStop() {
    await this.model.stop();
    this.localState.isActive = false;
    this._stopUiTick();
    this.view.setAndLaunchCofetti();

    this._renderControls();
  }

  async _handleOnContinue(btn) {
    await this.model.start();
    // if (this.nodeData.subtasks.length > 0) {
    //   this.view.showButtons({ pause: true, accordionBtn: true });
    //   this.view.setSubtasksDisabled(false);
    // }
    // this._showTimerOnRender(true);

    this._startUiTick();
    this._renderControls();
  }
  _handleOnAccordion() {
    console.log('snapshot', this.model.snapshot());
    console.log('allNodeInstances', this.allNodeInstances);
    this.finishNode();
  }
  _handleOnSubtaskChange({ doneCount, total, checkedIds }) {
    this.model.setCheckedSubtasks(checkedIds);
    this.model.setProgress(doneCount, total);

    // const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    // this.view.setProgress({ doneCount, total, percent });
    // this._applySubtaskRules(doneCount, total);
    const { done, total: t, percent } = this.subtasksStatus;
    this.view.setProgress({ doneCount: done, total: t, percent });

    this._renderControls();
  }
  _applySubtaskRules(doneCount, total) {
    if (total === 0 || doneCount === total) {
      this.view.showButtons({ stop: true, accordionBtn: this.hasSubtasks });
      this.view.setSubtasksDisabled(true);
    } else {
      this.view.setSubtasksDisabled(false);
      this.view.showButtons(
        this.isRunning
          ? { pause: true, accordionBtn: this.hasSubtasks }
          : { continue: true, accordionBtn: this.hasSubtasks }
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

  _renderControls() {
    const hasSubtasks = this.hasSubtasks; // getter: subtasks.length > 0
    const isRunning = this.isRunning; // getter: nodeData.isRunning
    const wasActive = this.wasActive; // getter: nodeData.wasActive
    const allDone = this.subtasksStatus.allDone;
    const isCompleted = !!this.nodeData?.nodeCompleted;

    let buttons;

    if (isCompleted) {
      buttons = { accordionBtn: false }; // nic do klikania; ewentualnie "restart" w przyszłości
    } else if (hasSubtasks && allDone) {
      buttons = { stop: true, accordionBtn: true };
    } else if (!hasSubtasks) {
      // brak subtasków
      if (isRunning || wasActive) {
        buttons = { stop: true, accordionBtn: false };
      } else {
        buttons = { start: true, accordionBtn: false };
      }
    } else if (isRunning) {
      buttons = { pause: true, accordionBtn: true };
    } else if (wasActive) {
      buttons = { continue: true, accordionBtn: true };
    } else {
      buttons = { start: true, accordionBtn: true };
    }

    // subtasks edytowalne tylko gdy:
    // - są i
    // - task jest w trakcie (isRunning) i
    // - nie jesteśmy w trybie STOP
    const subtasksDisabled = !hasSubtasks || buttons.stop || !isRunning;

    // progress pokazuj tylko gdy są subtasks
    const showProgress = hasSubtasks;

    // timer pokazuj gdy:
    // - leci (isRunning) lub
    // - coś już naliczyliśmy (accumulatedMs > 0) lub
    // - był aktywny (wasActive)
    const showTimer =
      isRunning || (this.nodeData?.accumulatedMs ?? 0) > 0 || wasActive;

    // Render UI
    this.view.showButtons(buttons);
    this.view.setSubtasksDisabled(subtasksDisabled);
    this.view.showProgress(showProgress);
    this.view.showTimer(showTimer);

    if (!isRunning) {
      this.view.setTimerText(this.formatHHMMSS(this.model.getElapsedMs()));
    }
  }
  getNextPresenter() {
    const sorted = [...this.allNodeInstances].sort(
      (a, b) => a.nodeData.order - b.nodeData.order
    );
    const idx = sorted.findIndex((p) => p.nodeData.id === this.nodeData.id);
    return idx >= 0 ? sorted[idx + 1] ?? null : null;
  }
  async finishNode() {
    try {
      const nextNode = this.getNextPresenter();
      const currentBorder = this.view.getNodeBorder();
      if (!nextNode) {
        this.view.fadeOutAnimation();
        this.model.moveToFinished();
        this.view.hide(currentBorder);

        this.plumb.jsPlumbInstance.deleteEveryConnection();
        this.plumb.jsPlumbInstance.deleteEveryEndpoint();
      } else {
        const currentRoot = this.view.getRoot();
        const nextRoot = nextNode.view.getRoot();
        await this.view.lineAnimation(currentRoot, nextRoot);
      }
    } catch (err) {
      console.error('FINISH NODE ERROR:', err);
    }
  }
}
