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
    /**
     * ========================================
     * GETTERS
     * ========================================
     */
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
  get controlStatus() {
    const ctx = {
      hasSubtasks: this.hasSubtasks,
      isRunning: this.isRunning,
      wasActive: this.wasActive,
      allDone: this.subtasksStatus.allDone,
      isCompleted: !!this.nodeData?.nodeCompleted,
    };

    if (ctx.isCompleted) return 'COMPLETED';
    else if (ctx.hasSubtasks && ctx.allDone) return 'SUBTASKS_DONE';
    else if (!ctx.hasSubtasks && (ctx.isRunning || ctx.wasActive))
      return 'NO_SUBTASKS';
    else if (!ctx.hasSubtasks && !ctx.isRunning && !ctx.wasActive)
      return 'NO_SUBTASKS_IDLE';
    else if (ctx.isRunning) return 'RUNNING';
    else if (!ctx.isRunning && ctx.wasActive && ctx.hasSubtasks)
      return 'PAUSED';
    else return 'IDLE';
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  REDNDER
   * ========================================
   */
  render() {
    this.view.render(this.nodeData);
    this._bindViewCallbacks();
    this.view.activate();

    this._renderControls();
    if (this.isRunning) this._startUiTick();
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  STAGE METHODS
   * ========================================
   */
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

    this.drawConnectionLines();
  }

  destroy() {
    this.closeAccordeon();
    this._stopUiTick();
    this.view.deactivate();
    this.view.unbind();
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  CALLBACKS METHODS
   * ========================================
   */

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
    this._startUiTick();
    this._renderControls();
  }

  async _handleOnPause() {
    await this.model.pause();
    this._stopUiTick();
    this._renderControls();
  }

  async _handleOnStop() {
    await this.model.stop();
    this.localState.isActive = false;
    this.closeAccordeon();
    this.view.setAndLaunchCofetti();
    this._stopUiTick();
    this._renderControls();
    await this.finishNode();
  }

  async _handleOnContinue() {
    await this.model.start();
    this._startUiTick();
    this._renderControls();
  }

  _handleOnAccordion() {}

  _handleOnSubtaskChange({ doneCount, total, checkedIds }) {
    this.model.setCheckedSubtasks(checkedIds);
    this.model.setProgress(doneCount, total);
    const { done, total: t, percent } = this.subtasksStatus;
    this.view.setProgress({ doneCount: done, total: t, percent });
    this._renderControls();
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  JS PLUMB
   * ========================================
   */
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
    this.view.repaintLoop(this.plumb, this, { duration: 200 });
  }

  clearLines(root) {
    this.plumb.jsPlumbInstance.deleteConnectionsForElement(root);
    this.plumb.jsPlumbInstance.removeAllEndpoints(root);
    this.plumb.jsPlumbInstance.remove(root);
  }
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  TIME
   * ========================================
   */
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
  /**
   * ========================================
   *
   * ========================================
   */
  /**
   * ========================================
   *  CONTROL METHODS
   * ========================================
   */
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

  _renderControls() {
    const state = this.controlStatus;

    const buttons = this.setButtons(state);

    const subtasksDisabled =
      !this.hasSubtasks || buttons.stop || !this.isRunning;

    const showProgress = this.hasSubtasks;

    const showTimer =
      this.isRunning ||
      (this.nodeData?.accumulatedMs ?? 0) > 0 ||
      this.wasActive;

    this.view.showButtons(buttons);
    this.view.setSubtasksDisabled(subtasksDisabled);
    this.view.showProgress(showProgress);
    this.view.showTimer(showTimer);
    const { done, total: t, percent } = this.subtasksStatus;
    this.view.setProgress({ doneCount: done, total: t, percent });

    if (!this.isRunning) {
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

        this.plumb.destroy();
      } else {
        const currentRoot = this.view.getRoot();
        const nextRoot = nextNode.view.getRoot();

        await this.view.lineAnimation(currentRoot, nextRoot);

        this.view.hide(currentBorder);
        await this.view.hideCurrentNodeSequence(currentRoot);
        this.model.moveToFinished();
        this.allNodeInstances = this.allNodeInstances.filter((p) => p !== this);
        this.clearLines(currentRoot);

        await this.activateNextNode(nextNode);
      }
    } catch (err) {
      console.error('FINISH NODE ERROR:', err);
    }
  }

  async activateNextNode(next) {
    if (!next) return;
    await next.model.start();
    next.enableNode();
    next.setActive();
    next._startUiTick();
    next._renderControls();
    next.view.repaintLoop(next.plumb, next, { duration: 200 });
    await next.view.enterSequenceAnimation();
  }

  setButtons(state) {
    let buttons;
    switch (state) {
      case 'COMPLETED':
        buttons = { stop: true, accordionBtn: false };
        break;

      case 'SUBTASKS_DONE':
        buttons = { stop: true, accordionBtn: true };
        break;

      case 'NO_SUBTASKS':
        buttons = { stop: true, accordionBtn: false };
        break;

      case 'NO_SUBTASKS_IDLE':
        buttons = { start: true, accordionBtn: false };
        break;

      case 'RUNNING':
        buttons = { pause: true, accordionBtn: true };
        break;

      case 'PAUSED':
        buttons = { continue: true, accordionBtn: true };
        break;

      case 'IDLE':
        buttons = { start: true, accordionBtn: true };
        break;
    }
    return buttons;
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

  setNodeListForRoadmap(nodes, { current: plumbManager } = {}) {
    // zgodność z istniejącym API
    this.allNodeInstances = nodes;
    this.plumb = plumbManager || this.plumb;
  }

  closeAccordeon() {
    if (this.view.getAccordionOpen()) {
      this.view.animateAccordion(false);
    }
  }
}
