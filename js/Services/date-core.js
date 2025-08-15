const MS_PER_DAY = 86_400_000;

export class DateCore {
  //A)
  static getYear(date = new Date()) {
    return date.getFullYear();
  }
  // Active slide indicator in the months carouse
  static getMonthIndex(date = new Date()) {
    return date.getMonth();
  }
  // Base value used when clamping a day across month changes
  static getDayOfMonth(date = new Date()) {
    return date.getDate();
  }
  //ISO weekday (Mon=1 … Sun=7)
  static isoDay(date = new Date()) {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  }
  //B)
  // day 0 of next month = last day of current month
  static daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }
  // First day of the month at 00:00
  static startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  //C)
  // Clamp the day to the last valid day of the target month (returns 00:00)
  static clampDay(year, monthIndex, day) {
    // Calculate the maximum number of days in a given month.
    const maxDays = this.daysInMonth(year, monthIndex);
    // Make sure that the day does not exceed this value.
    const clampedDay = Math.min(day, maxDays);
    // Return a new, corrected Date object with the time set to 00:00:00.
    return new Date(year, monthIndex, clampedDay, 0, 0, 0);
  }

  static addMonths(date, delta) {
    // midday -  It is a DST "guardian" against problems with time zones and summer/winter time
    //delta - how many months I want to move the date forward.
    const midday = new Date(date.getTime());
    midday.setHours(12, 0, 0, 0);
    // 1.  get the year, month and day based by DST GUARD.
    const year = midday.getFullYear();
    const month = midday.getMonth();
    const day = midday.getDate();
    // calculate target year/month.
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
  static isoWeekNumber(date) {
    const n = this.isoDay(date); //<- downloading the day of the week number in ISO format
    const thursday = this.addDays(date, 4 - n); //<- Move the date to the Thursday of the same ISO week.

    const isoYear = thursday.getFullYear(); //<- Gets the year from the thursday object. Using thursday ensures that you are always in the correct year.
    const jan4th = new Date(isoYear, 0, 4); //<- ISO 8601 ensures that this day is always in the first week of the year.

    const startISO = this.startOfISOWeek(jan4th); //finds Monday of the first week of the year.

    //Calculates the total number of days between the beginning of the first week of the year and Thursday of my date.
    const diffDays = Math.floor((thursday - startISO) / MS_PER_DAY);
    //is the difference in milliseconds. Dividing by 86400000 (the number of milliseconds in a day) converts this to the number of days.

    // divide the number of days by 7 and round down to get the number of full weeks that have elapsed.
    return 1 + Math.floor(diffDays / 7); //<- You add 1 because weeks are counted from 1, not 0.
  }
  static isoWeekYear(date) {
    const n = this.isoDay(date);
    const thursday = this.addDays(date, 4 - n);
    return thursday.getFullYear();
  }
  static fromISOWeek(isoYear, isoWeek) {
    // 1. Find the reference point: January 4th of the given year.
    // January 4th is ALWAYS in the first ISO week of the year.
    const jan4th = new Date(isoYear, 0, 4);

    const startISO = this.startOfISOWeek(jan4th);
    return this.addDays(startISO, (isoWeek - 1) * 7);
  }
}

window.DateCore = DateCore; // for debuging
