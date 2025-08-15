import { showElement, hideElement, toggleElement } from "../utils/helper.js";

export class CalendarView {
  constructor(root = ".calendar") {
    const rootEl =
      typeof root === "string" ? document.querySelector(root) : root;
    if (!(rootEl instanceof Element)) {
      throw new Error("Calendar root not found (selector or element invalid)");
    }

    this.ui = { root: rootEl };

    this._q = (sel) => this.ui.root.querySelector(sel);
    this._qa = (sel) => this.ui.root.querySelectorAll(sel);

    this.ui.months = {
      list: this._q(".calendar__months-carousel"),
      prevBtn: this._q(".calendar__months-nav--prev"),
      nextBtn: this._q(".calendar__months-nav--next"),
    };

    this.ui.weekSelector = {
      list: this._q(".calendar__meta-carousel--week"),
      prevBtn: this._q(".calendar__meta-nav-week-prev"),
      nextBtn: this._q(".calendar__meta-nav-week-next"),
    };

    this.ui.yearSelector = {
      list: this._q(".calendar__meta-carousel--year"),
      prevBtn: this._q(".calendar__meta-nav-year-prev"),
      nextBtn: this._q(".calendar__meta-nav-year-next"),
    };

    this.ui.weekdays = {
      list: this._q(".calendar__days-selector"),
    };

    this.ui.grid = {
      root: this._q(".calendar__grid"),
      list: this._q(".calendar__grid-list"),
    };

    this.listeners = [
      {
        el: this.ui.months.prevBtn,
        event: "click",
        handler: this.testBtn.bind(this),
      },
      {
        el: this.ui.months.nextBtn,
        event: "click",
        handler: this.testBtn2.bind(this),
      },
    ];
  }
  // Private, recursive method that loops through the entire this.ui object
  _findAndValidateUiElements(obj, parentKey = "") {
    Object.entries(obj).forEach(([key, el]) => {
      // We create the full path to the element
      const fullPath = parentKey ? `${parentKey}.${key}` : key;

      // We check if the given element is an object and not a DOM element
      if (typeof el === "object" && el !== null && !el.nodeType) {
        // If so, we call the function recursively on this nested object
        this._findAndValidateUiElements(el, fullPath);
      } else {
        // If it's not an object, we check if it's a DOM element
        if (!el) {
          console.warn(`Missing DOM element: ${fullPath}`);
        }
      }
    });
  }

  activate() {
    this._findAndValidateUiElements(this.ui);

    this.listeners.forEach(({ el, event, handler }) => {
      if (el) {
        el.addEventListener(event, handler);
      }
    });
  }

  deactivate() {
    this.listeners.forEach(({ el, event, handler }) => {
      if (el) {
        el.removeEventListener(event, handler);
      }
    });
  }
  testBtn() {
    alert("kliknieto w prev");
  }
  testBtn2() {
    alert("kliknieto w next");
  }
}
window.CalendarView = CalendarView; // for debuging
