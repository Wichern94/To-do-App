export class ViewManager {
  constructor() {
    this.views = document.querySelectorAll('.apk-look');
    this.modes = document.querySelectorAll('.modes');
    this.dots = document.querySelectorAll('.dot');
  }
  //1. VIEWS--------------------------------------------------------------------

  hideAllViews() {
    this.views.forEach((view) => view.classList.add('hidden'));
  }
  hideOneView(id) {
    const apkView = document.getElementById(id);
    apkView.classList.add('hidden');
  }

  showView(viewId) {
    this.hideAllViews();
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.remove('hidden');
      document.dispatchEvent(new CustomEvent('view:changed'));
    } else {
      console.error(`View with id "${viewId}" not found.`);
    }
  }
  //2.MODES---------------------------------------------------------------------

  hideAllModes() {
    this.modes.forEach((mode) => mode.classList.add('hidden'));
  }

  hideOnemode(id) {
    const apkMode = document.getElementById(id);
    apkMode.classList.add('hidden');
  }

  showMode(sectionId, indicatorId) {
    this.hideAllModes();
    const mode = document.getElementById(sectionId);
    if (mode) {
      mode.classList.remove('hidden');
    } else {
      console.error(`Mode with id "${sectionId}" not found.`);
    }
    this.dots.forEach((dot) => dot.classList.remove('active'));
    const rightDot = document.getElementById(indicatorId);
    if (rightDot) {
      rightDot.classList.add('active');
    } else {
      console.error(`Separator ${indicatorId} not found!`);
    }
  }
}
