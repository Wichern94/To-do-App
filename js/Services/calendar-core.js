export class DateManager {
  static getYear() {
    return new Date().getFullYear();
  }
  static getMonthIndex() {
    return new Date().getMonth();
  }
  static getDayOfMonth() {
    return new Date().getDate();
  }
  static getDayOfWeek() {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  }
  static daysInMonth(y = this.getYear(), m = this.getMonth()) {
    const days = new Date(y, m + 1, 0).getDate(); // 1: first day of month, 0: last day of prev Month
    return days;
  }
  static firstDayOfMonth(y = this.getYear(), m = this.getMonth()) {
    const day = new Date(y, m, 1);
    console.log("dzien", day);
  }
}
