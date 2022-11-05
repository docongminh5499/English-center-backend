import moment = require("moment");

export enum Weekday {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export function cvtWeekDay2Num(weekDay: Weekday) {
  switch (weekDay) {
    case Weekday.Monday:
      return 2;
    case Weekday.Tuesday:
      return 3;
    case Weekday.Wednesday:
      return 4;
    case Weekday.Thursday:
      return 5;
    case Weekday.Friday:
      return 6;
    case Weekday.Saturday:
      return 7;
    case Weekday.Sunday:
      return 8;
  }
}


export function getWeekdayFromDate(date: Date) {
  const day = moment(date).toDate().getDay();
  switch (day) {
    case 0:
      return Weekday.Sunday;
    case 1:
      return Weekday.Monday;
    case 2:
      return Weekday.Tuesday;
    case 3:
      return Weekday.Wednesday;
    case 4:
      return Weekday.Thursday;
    case 5:
      return Weekday.Friday;
    case 6:
      return Weekday.Saturday;
    default:
      return null;
  }
}