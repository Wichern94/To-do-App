export class DateCore {
  //A)
  static getYear(date = new Date()) {
    return date.getFullYear();
  }
  // active slide indicator in the carousel
  static getMonthIndex(date = new Date()) {
    return date.getMonth();
  }
  // base for clamping when changing the month
  static getDayOfMonth(date = new Date()) {
    return date.getDate();
  }
  // everything ISO (week start, week number).
  static isoDay(date = new Date()) {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  }
  //B)
  static daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate(); // 1: first day of month, day 0 == last day of prev Month
  }
  static startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  //C)
  static clampDay(year, monthIndex, day) {
    // 1. We will calculate the maximum number of days in a given month.
    const maxDays = this.daysInMonth(year, monthIndex);
    // 2. We will make sure that the day does not exceed this value.
    const clampedDay = Math.min(day, maxDays);
    // 3. We will return a new, corrected Date object with the time set to 00:00:00.
    return new Date(year, monthIndex, clampedDay, 0, 0, 0);
  }

  static addMonths(date, delta) {
    // midday -  It is a DST "guardian" against problems with time zones and summer/winter time
    //delta - how many months do you want to move the date forward.
    const midday = new Date(date.getTime());
    midday.setHours(12, 0, 0, 0);
    // 1. We will get the year, month and day based by DST GUARD.
    const year = midday.getFullYear();
    const month = midday.getMonth();
    const day = midday.getDate();
    // Here we will calculate target year/month.
    const totalMonths = year * 12 + month + delta; //<- I am converting the current date into the total number of months since year 0.
    const targetYear = Math.floor(totalMonths / 12); //I divide the total number of months by 12
    const targetMonth = ((totalMonths % 12) + 12) % 12;

    //This method corrects the day to ensure it is within the range of the new month.
    const out = this.clampDay(targetYear, targetMonth, day);

    return out;
  }
  static addYears(date, delta) {
    const midday = new Date(date.getTime());
    midday.setHours(12, 0, 0, 0);

    const year = midday.getFullYear();
    const month = midday.getMonth();
    const day = midday.getDate();

    const targetYear = year + delta;
    const targetMonth = month;

    const out = this.clampDay(targetYear, targetMonth, day);

    return out;
  }
  static addDays(date, n) {
    const midday = new Date(date.getTime());
    midday.setHours(12, 0, 0, 0);
    // The setDate method automatically handles switching to the next/previous month or year,
    midday.setDate(midday.getDate() + n);

    midday.setHours(0, 0, 0, 0);

    return midday;
  }
  //D)
  static startOfISOWeek(date) {
    // 1. Protection against modification: We create a copy of the date
    const midday = new Date(date.getTime());
    midday.setHours(12, 0, 0, 0);
    // 2. Calculate how many days you need to go back.
    const offset = this.isoDay(midday) - 1;
    // 3. Use addDays to go back to Monday.
    const monday = this.addDays(midday, -offset);

    return monday;
  }
}

window.DateCore = DateCore; // for debuging
