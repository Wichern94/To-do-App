export class CalendarView {
  constructor(root = '.calendar') {
    const rootEl =
      typeof root === 'string' ? document.querySelector(root) : root;
    if (!(rootEl instanceof Element)) {
      throw new Error('Calendar root not found (selector or element invalid)');
    }

    this.ui = { root: rootEl };

    this._q = (sel) => this.ui.root.querySelector(sel);
    this._qa = (sel) => this.ui.root.querySelectorAll(sel);

    this.ui.months = {
      list: this._q('.calendar__months-carousel'),
      prevBtn: this._q('.calendar__months-nav--prev'),
      nextBtn: this._q('.calendar__months-nav--next'),
    };

    this.ui.weekSelector = {
      list: this._q('.calendar__meta-carousel--week'),
      prevBtn: this._q('.calendar__meta-nav-week-prev'),
      nextBtn: this._q('.calendar__meta-nav-week-next'),
    };

    this.ui.yearSelector = {
      list: this._q('.calendar__meta-carousel--year'),
      prevBtn: this._q('.calendar__meta-nav-year-prev'),
      nextBtn: this._q('.calendar__meta-nav-year-next'),
    };

    this.ui.weekdays = {
      list: this._q('.calendar__days-selector'),
    };

    this.ui.grid = {
      root: this._q('.calendar__grid'),
      list: this._q('.calendar__grid-list'),
    };
    this._bound = false;

    this.onWeekdayClick = null;
    this.listeners = [
      {
        el: this.ui.weekdays.list,
        event: 'click',
        handler: this.handleWeekdaySelect.bind(this),
      },
      {
        el: this.ui.months.prevBtn,
        event: 'click',
        handler: this.handleMonthPrevClick.bind(this),
      },
      {
        el: this.ui.months.nextBtn,
        event: 'click',
        handler: this.handleMonthNextClick.bind(this),
      },
      {
        el: this.ui.yearSelector.prevBtn,
        event: 'click',
        handler: this.handleYearPrevClick.bind(this),
      },
      {
        el: this.ui.yearSelector.nextBtn,
        event: 'click',
        handler: this.handleYearNextClick.bind(this),
      },
      {
        el: this.ui.weekSelector.prevBtn,
        event: 'click',
        handler: this.handleWeekSelectPrevClick.bind(this),
      },
      {
        el: this.ui.weekSelector.nextBtn,
        event: 'click',
        handler: this.handleWeekSelectNextClick.bind(this),
      },
    ];
  }
  // Private, recursive method that loops through the entire this.ui object
  _findAndValidateUiElements(obj, parentKey = '') {
    Object.entries(obj).forEach(([key, el]) => {
      // We create the full path to the element
      const fullPath = parentKey ? `${parentKey}.${key}` : key;
      if (el instanceof Element) return;
      if (
        el instanceof NodeList ||
        el instanceof HTMLCollection ||
        Array.isArray(el)
      ) {
        for (const node of el) {
          if (!(node instanceof Element)) {
            console.warn(`Missing DOM element inside Collection:${fullPath}`);
          }
        }
        return;
      }

      // We check if the given element is an object and not a DOM element
      if (
        el &&
        typeof el === 'object' &&
        !(el instanceof Element) &&
        !(el instanceof NodeList) &&
        !(el instanceof HTMLCollection)
      ) {
        // If so, we call the function recursively on this nested object
        this._findAndValidateUiElements(el, fullPath);
        return;
      }
      // If it's not an object, we check if it's a DOM element
      if (!el) console.warn(`Missing DOM element: ${fullPath}`);
    });
  }

  activate() {
    if (this._bound) return;
    this._findAndValidateUiElements(this.ui);

    this.listeners.forEach(({ el, event, handler }) => {
      if (el) {
        el.addEventListener(event, handler);
      }
    });
    this._bound = true;
  }

  deactivate() {
    if (!this._bound) return;
    this.listeners.forEach(({ el, event, handler }) => {
      if (el) {
        el.removeEventListener(event, handler);
      }
    });
    this._bound = false;
  }
  bind({
    onMonthPrev,
    onMonthNext,
    onWeekdayClick,
    onYearPrev,
    onYearNext,
    onWeekSelectPrev,
    onWeekSelectNext,
  } = {}) {
    this.onMonthPrev = onMonthPrev ?? (() => {});
    this.onMonthNext = onMonthNext ?? (() => {});
    this.onWeekdayClick = onWeekdayClick ?? (() => {});
    this.onYearPrev = onYearPrev ?? (() => {});
    this.onYearNext = onYearNext ?? (() => {});
    this.onWeekSelectPrev = onWeekSelectPrev ?? (() => {});
    this.onWeekSelectNext = onWeekSelectNext ?? (() => {});
  }

  handleWeekdaySelect(e) {
    const btn = e.target.closest('button[data-iso]');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true')
      return;

    const iso = Number(btn.dataset.iso);
    console.log('ISO:', iso);

    if (!Number.isInteger(iso) || iso < 1 || iso > 7) {
      console.warn('Invalid ISO value:', iso);
      return;
    }
    if (typeof this.onWeekdayClick === 'function') {
      this.onWeekdayClick(iso);
    }
  }

  handleMonthPrevClick() {
    if (typeof this.onMonthPrev === 'function') this.onMonthPrev();
  }
  handleMonthNextClick() {
    if (typeof this.onMonthNext === 'function') this.onMonthNext();
  }
  handleYearPrevClick() {
    if (typeof this.onYearPrev === 'function') this.onYearPrev();
  }
  handleYearNextClick() {
    if (typeof this.onYearNext === 'function') this.onYearNext();
  }
  handleWeekSelectPrevClick() {
    if (typeof this.onWeekSelectPrev === 'function') this.onWeekSelectPrev();
  }
  handleWeekSelectNextClick() {
    if (typeof this.onWeekSelectNext === 'function') this.onWeekSelectNext();
  }
}
