export enum Weekday {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export function cvtWeekDay2Num(weekDay: Weekday){
  switch(weekDay){
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
