export class GetCaruselPosition {
  constructor(caruselContainer, caruselItems) {
    this.container = document.getElementById(caruselContainer);
    this.items = Array.from(document.querySelectorAll(caruselItems));

    this.currentIndex = null;
    this.scrollTimeout = null;
    this.onViewChange = null;

    this.applyMode();
    this.setupQueries();

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

    this.watchScroll();
  }
  get mq() {
    return window.matchMedia('(min-width: 768px)');
  }

  get mqTouch() {
    return window.matchMedia('(pointer: coarse)');
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

  watchScroll() {
    this.container.addEventListener('scroll', () => {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        const itemWidth = this.items[1]?.offsetWidth;
        const gap = 12;
        const fullItemWidth = itemWidth + gap;
        const scrLeft = this.container.scrollLeft;
        this.currentIndex = Math.round(scrLeft / fullItemWidth);
        const mode = this.getViewKey();
        if (mode && typeof this.onViewChange === 'function') {
          this.onViewChange(mode);
        }
      }, 100);
    });
  }
  getIndex() {
    return this.currentIndex;
  }
  getViewKey() {
    if (!this.modeMap) return;
    const keyArr = Object.keys(this.modeMap);

    const viewKey = keyArr.find(
      (key) => this.modeMap[key].index === this.currentIndex
    );

    if (!viewKey) return null;

    const { sectionId, indicatorId } = this.modeMap[viewKey];

    return {
      viewKey,
      sectionId,
      indicatorId,
    };
  }
  setupQueries() {
    this.mq.addEventListener('change', () => this.applyMode());
    this.mqTouch.addEventListener('change', () => this.applyMode());
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
      if (mode.viewKey === 'list') {
        this.setupLeft();
      } else if (mode.viewKey === 'roadmap') {
        this.setupRight();
      }
    }

    const btnContainer = document.querySelector('.auth-carousel__navigations');

    if (btnContainer) {
      btnContainer.classList.toggle('hidden', !isVisible);
      btnContainer.addEventListener('click', this.enableButons.bind(this));
    }
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
    if (btn) {
      btn.disabled = disable;
      btn.setAttribute('aria-disabled', disable);
      if (disable) {
        btn.classList.add('inactive');
      } else {
        btn.classList.remove('inactive');
      }
    }
  }
}
