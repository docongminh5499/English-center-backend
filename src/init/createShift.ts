import { Shift } from "../entities/Shift";
import { Weekday } from "../utils/constants/weekday.constant";

export async function createShifts() {
  const weekDays = [
    Weekday.Monday,
    Weekday.Tuesday,
    Weekday.Wednesday,
    Weekday.Thursday,
    Weekday.Friday,
    Weekday.Saturday,
    Weekday.Sunday,
  ];

  const shiftInDay = 14;
  const shifts = [];

  for (const weekDay of weekDays) {
    for (let offset = 0; offset < shiftInDay; offset++) {
      let shift = new Shift();
      shift.weekDay = weekDay;
      shift.startTime = new Date(2000, 10, 10, 7 + offset, 0, 0, 0);
      shift.endTime = new Date(2000, 10, 10, 7 + offset + 1, 0, 0, 0);
      // shift.id = parseInt(cvtWeekDay2Num(weekDay) + (shift.startTime.getHours() < 10 ? '0' : '') + shift.startTime.getHours());
      
      shift = await Shift.save(shift);
      shifts.push(shift);
    }
  }
  console.log(`Created ${shifts.length} shifts`);
  return shifts;
}