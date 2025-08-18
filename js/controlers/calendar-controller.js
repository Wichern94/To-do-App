import { DateCore } from './Services/date-core.js';

export class CalendarController {
  constructor(view, callbacks = {}, options = {}) {
    this.view = view;
    //callbacks
    this.onDateChange = callbacks.onDateChange ?? (() => {});
    this.onMonthChange = callbacks.onMonthChange ?? (() => {});

    // The state of the object that will store the current values.
    this.state = null;
    // The init() method runs all the logic after the object is created.
    this.init(options);
  }
  init(options = {}) {
    this.state = this._computeInitialState(options);
    this.view.bind({
      onMonthPrev: () => this.goPrevMonth(),
      onMonthNext: () => this.goNextMonth(),
      // onYearPrev: () => this.goPrevYear(),
      // onYearNext: () => this.goNextYear(),
      // onWeekSelectPrev: () => this.goWeekSelectPrev(),
      // onWeekSelectNext: () => this.goWeekSelectNext(),
      // onWeekdayClick: (iso) => this.selectWeekday(iso),
    });
    this.view.activate();

    const year = DateCore.getYear(this.state.currentDate);
    const monthIndex = DateCore.getMonthIndex(this.state.currentDate);

    this.view.renderMonths({ year, activeMonthIndex: monthIndex });

    this.view.renderWeekdays({ activeIsoDay: this.state.selectedIsoDay });

    this.view.renderHourGrid({ date: this.state.selectedDate });

    this.view.scrollActiveMonthIntoView();

    this.onMonthChange({ year, monthIndex });
    this.onDateChange(this.state.selectedDate);
  }

  _computeInitialState({ initialDate, initialISODay } = {}) {
    // If initialDate is not provided, this will be new Date()
    // If initialISODay is not provided, this will be undefined

    //Base time + protection against DST.
    const middayBase =
      initialDate instanceof Date ? new Date(initialDate) : new Date();
    middayBase.setHours(12, 0, 0, 0);

    // 2) Year/Month of view + currentDate = 1st day of the month (also at 12:00)
    const year = DateCore.getYear(middayBase);
    const monthIndex = DateCore.getMonthIndex(middayBase);

    // currentDate is the first day of the month we will be working with.
    const currentDate = new Date(year, monthIndex, 1);
    currentDate.setHours(12, 0, 0, 0);
    // 3) Determining ISO of the day (1..7) with validation/fallback
    let iso = Number.isInteger(initialISODay)
      ? initialISODay
      : DateCore.isoDay(middayBase);
    // fix garbage: throw in range 1..7
    if (iso < 1 || iso > 7) {
      iso = ((iso % 7) + 7) % 7 || 7;
    }

    // 4) First occurrence of this ISO-day in the current month
    const isoFirstOfMonth = DateCore.isoDay(currentDate);
    const offset = (iso - isoFirstOfMonth + 7) % 7;
    const day = 1 + offset;

    const selectedDate = new Date(year, monthIndex, day);
    selectedDate.setHours(12, 0, 0, 0);

    return {
      currentDate, //day of the month, 12:00
      selectedIsoDay: iso, // 1..7
      selectedDate, // iso appearance this month, 12:00
    };
  }
}
