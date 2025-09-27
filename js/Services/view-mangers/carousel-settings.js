export class GetCaruselPosition {
  constructor(caruselContainer, caruselItems) {
    this.container = document.getElementById(caruselContainer);
    this.items = Array.from(document.querySelectorAll(caruselItems));

    this.currentIndex = null;
    this.scrollTimeout = null;
    this.onViewChange = null;

    this.mq = window.matchMedia('(min-width: 768px)');
    this.mqTouch = window.matchMedia('(pointer: coarse)');

    this._onScroll = this._onScroll.bind(this);
    this._onMqChange = this.applyMode.bind(this);
    this._onMqTouch = this.applyMode.bind(this);
    this._onNavClick = this.enableButons.bind(this);

    this.modeMap = {
      roadmap: {
        index: 0,
        sectionId: 'roadmap-view',
        indicatorId: 'sep-r',
        label: 'Roadmapa',
      },
      list: {
        index: 1,
        sectionId: 'list-view',
        indicatorId: 'sep-l',
        label: 'Lista',
      },
    };

    this.nav = document.querySelector('.auth-carousel__navigations');
    if (this.nav) this.nav.addEventListener('click', this._onNavClick);

    this.applyMode();
    this.setupQueries();
    this.watchScroll();
  }

  getIndex() {
    return this.currentIndex;
  }

  getViewKey() {
    if (!this.modeMap) return null;
    const viewKey = Object.keys(this.modeMap).find(
      (key) => this.modeMap[key].index === this.currentIndex
    );
    if (!viewKey) return null;
    const { sectionId, indicatorId } = this.modeMap[viewKey];
    return { viewKey, sectionId, indicatorId };
  }

  setupQueries() {
    this.mq?.addEventListener('change', this._onMqChange);
    this.mqTouch?.addEventListener('change', this._onMqTouch);
  }

  applyMode() {
    if (this.mqTouch.matches) {
      this.enableDesktop(false);
    } else if (this.mq.matches) {
      this.enableDesktop(true);
    }
  }

  enableDesktop(isVisible) {
    const mode = this.getViewKey();
    if (mode) {
      if (mode.viewKey === 'list') this.setupLeft();
      else if (mode.viewKey === 'roadmap') this.setupRight();
    }
    const btnContainer =
      this.nav ?? document.querySelector('.auth-carousel__navigations');
    if (btnContainer) btnContainer.classList.toggle('hidden', !isVisible);
  }

  watchScroll() {
    if (!this.container) return;
    this.container.addEventListener('scroll', this._onScroll);
  }

  _onScroll() {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      const itemWidth = this.items[1]?.offsetWidth;
      const gap = 12;
      if (!itemWidth) return;
      const fullItemWidth = itemWidth + gap;
      const scrLeft = this.container.scrollLeft;
      this.currentIndex = Math.round(scrLeft / fullItemWidth);

      const mode = this.getViewKey();
      if (mode && typeof this.onViewChange === 'function')
        this.onViewChange(mode);
    }, 100);
  }

  setCaruselToLeft() {
    const itemWidth = this.items[1]?.offsetWidth;
    const gap = 12;
    if (!itemWidth) return;
    const fullItemWidth = itemWidth + gap;
    const { index } = this.modeMap['list'];
    this.container.scrollLeft = fullItemWidth * index;
  }

  setCaruselToRight() {
    const itemWidth = this.items[0]?.offsetWidth;
    const gap = 12;
    if (!itemWidth) return;
    const fullItemWidth = itemWidth + gap;
    const { index } = this.modeMap['roadmap'];
    this.container.scrollLeft = fullItemWidth * index;
  }

  setupLeft() {
    this.setCaruselToLeft();
    this.setButtonState('left', true);
    this.setButtonState('right', false);
  }

  setupRight() {
    this.setCaruselToRight();
    this.setButtonState('right', true);
    this.setButtonState('left', false);
  }

  enableButons(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true')
      return;

    const actions = btn.dataset.action;
    if (!actions) return;

    switch (actions) {
      case 'left':
        this.setupLeft();
        break;
      case 'right':
        this.setupRight();
        break;
    }
  }

  setButtonState(action, disable) {
    const btn = document.querySelector(`button[data-action="${action}"]`);
    if (!btn) return;
    btn.disabled = disable;
    btn.setAttribute('aria-disabled', String(disable));
    btn.classList.toggle('inactive', !!disable);
  }

  destroy() {
    if (this.container && this._onScroll) {
      this.container.removeEventListener('scroll', this._onScroll);
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }

    if (this.mq && this._onMqChange)
      this.mq.removeEventListener('change', this._onMqChange);
    if (this.mqTouch && this._onMqTouch)
      this.mqTouch.removeEventListener('change', this._onMqTouch);

    if (this.nav && this._onNavClick)
      this.nav.removeEventListener('click', this._onNavClick);

    this.onViewChange = null;
    this._onScroll =
      this._onMqChange =
      this._onMqTouch =
      this._onNavClick =
        null;
  }
}
