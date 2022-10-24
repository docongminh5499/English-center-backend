import { faker } from "@faker-js/faker";
import { Classroom } from "../entities/Classroom";
import { Course } from "../entities/Course";
import { Shift } from "../entities/Shift";
import { UserTeacher } from "../entities/UserTeacher";
import { UserTutor } from "../entities/UserTutor";
import ClassroomRepository from "../repositories/classroom/classroom.repository.impl";
import ShiftRepository from "../repositories/shift/shift.repository.impl";
import TutorRepository from "../repositories/userTutor/tutor.repository.impl";
import { Weekday } from "../utils/constants/weekday.constant";
import { StudySession } from "../entities/StudySession";
import { cvtWeekDay2Num } from "../utils/constants/weekday.constant";

// const dayNum = [1, 2, 3, 4, 5, 6, 0];

interface ChoseSchedule {
  choseTeacher: UserTeacher;
  choseShifts: Shift[][];
  choseClassroom: Classroom[];
  choseTutor: UserTutor[];
}

let weekDays = [
  Weekday.Monday,
  Weekday.Tuesday,
  Weekday.Wednesday,
  Weekday.Thursday,
  Weekday.Friday,
  Weekday.Saturday,
  Weekday.Sunday,
];

export async function createStudySession(course: Course, teachers: UserTeacher[]) {
  const choseSchedule: ChoseSchedule = {
    choseTeacher: course.teacher,
    choseShifts: [],
    choseClassroom: [],
    choseTutor: [],
  }
  const numberOfSessionsPerWeek = faker.datatype.number({ min: 1, max: 3 });
  const availableShiftsofTeacher = await ShiftRepository.findAvailableShiftsOfTeacher(
    choseSchedule.choseTeacher.worker.user.id,
    course.openingDate
  );
  const classifiedShifts: any = {};
  availableShiftsofTeacher.forEach(shift => {
    if (!classifiedShifts[shift.weekDay])
      classifiedShifts[shift.weekDay] = [];
    classifiedShifts[shift.weekDay].push(shift);
  });

  weekDays = faker.helpers.shuffle(weekDays);
  for (let key of weekDays) {
    const shifts: Shift[] = classifiedShifts[key];
    const numberOfShifts = course.curriculum.shiftsPerSession;
    const shiftIndex: number[] = Array(shifts.length - numberOfShifts).fill(0).map((_, index) => index);
    for (let index of faker.helpers.shuffle(shiftIndex)) {
      if (shifts[index].startTime.getHours() + numberOfShifts === shifts[index + numberOfShifts].startTime.getHours()) {
        const shiftIds = shifts.slice(index, index + numberOfShifts).map(shift => shift.id);
        const availableClassrooms = await ClassroomRepository
          .findClassroomAvailable(course.branch.id, course.openingDate, shiftIds)
        const availableTutors = await TutorRepository.findTutorsAvailable(course.openingDate, shiftIds)
        if (availableClassrooms.length !== 0 && availableTutors.length !== 0) {
          choseSchedule.choseClassroom.push(faker.helpers.arrayElement(availableClassrooms));
          choseSchedule.choseTutor.push(faker.helpers.arrayElement(availableTutors))
          choseSchedule.choseShifts.push(shifts.slice(index, index + numberOfShifts));
          break;
        }
      }
    }
    if (choseSchedule.choseShifts.length === numberOfSessionsPerWeek)
      break;
  }

  const numberOfLectures = course.curriculum.lectures.length;
  const studySessions = [];

  // choseShifts, shiftArray in choseShifts, choseTutor, choseClassroom 
  // in choseSchedule need to have at least 1 element.
  const sortedScheduleIndex: number[] = Array(numberOfSessionsPerWeek).fill(0).map((_, index) => index);
  sortedScheduleIndex.sort((prevIndex: number, nextIndex: number) => {
    if (cvtWeekDay2Num(choseSchedule.choseShifts[prevIndex][0].weekDay) >
      cvtWeekDay2Num(choseSchedule.choseShifts[nextIndex][0].weekDay))
      return 1;
    else if (cvtWeekDay2Num(choseSchedule.choseShifts[prevIndex][0].weekDay) <
      cvtWeekDay2Num(choseSchedule.choseShifts[nextIndex][0].weekDay))
      return -1;
    else return 0;
  });

  choseSchedule.choseShifts = sortedScheduleIndex.map(index => choseSchedule.choseShifts[index]);
  choseSchedule.choseClassroom = sortedScheduleIndex.map(index => choseSchedule.choseClassroom[index]);
  choseSchedule.choseTutor = sortedScheduleIndex.map(index => choseSchedule.choseTutor[index]);

  let sheduleIndex = -1;
  let firstDayOfSession = new Date();

  for (let index = 0; index < numberOfSessionsPerWeek; index++) {
    const openingDate = new Date(course.openingDate.getTime());
    const openingDateOffset = openingDate.getDay() == 0 ? 7 : openingDate.getDay()
    const offset = cvtWeekDay2Num(choseSchedule.choseShifts[index][0].weekDay) - 2;
    const date = openingDate.getDate() - openingDateOffset + offset + 1;
    const firstDay = new Date(openingDate.setDate(date));

    if (firstDay >= course.openingDate) {
      sheduleIndex = index;
      firstDayOfSession = firstDay;
      break;
    }
  }

  if (sheduleIndex === -1) {
    const openingDate = new Date(course.openingDate.getTime());
    const openingDateOffset = openingDate.getDay() == 0 ? 7 : openingDate.getDay()
    const offset = cvtWeekDay2Num(choseSchedule.choseShifts[0][0].weekDay) - 2;
    const date = openingDate.getDate() - openingDateOffset + offset + 8;
    firstDayOfSession = new Date(openingDate.setDate(date));
    sheduleIndex = 0;
  }


  for (let index = 0; index < numberOfLectures; index++) {
    const week = Math.floor(index / numberOfSessionsPerWeek) + 1;
    const dayName = index % numberOfSessionsPerWeek + 1;
    const date = new Date(firstDayOfSession.getTime());


    let studySession = new StudySession();
    studySession.name = `Tuần ${week}, Buổi ${dayName}`;
    studySession.date = date;
    studySession.isTeacherAbsent = false;
    studySession.notes = faker.lorem.paragraphs();
    studySession.course = course;
    studySession.shifts = choseSchedule.choseShifts[sheduleIndex];
    studySession.tutor = choseSchedule.choseTutor[sheduleIndex];
    studySession.teacher = choseSchedule.choseTeacher;
    studySession.classroom = choseSchedule.choseClassroom[sheduleIndex];
    studySession = await studySession.save();
    studySessions.push(studySession);

    if (index === numberOfLectures - 1) {
      course.expectedClosingDate = new Date(date.getTime());
      if (date <= new Date()) {
        const lastShift = studySession.shifts[studySession.shifts.length - 1];
        const closedHour = faker.datatype.number({ min: lastShift.endTime.getHours() + 1, max: 24 });
        const closeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), closedHour, 0, 0);
        course.closingDate = closeDate;
      }
      await course.save();
      break;
    }

    const lastSchedultIndex = sheduleIndex;
    sheduleIndex = (sheduleIndex + 1) % numberOfSessionsPerWeek;
    let offset = cvtWeekDay2Num(choseSchedule.choseShifts[sheduleIndex][0].weekDay) - cvtWeekDay2Num(choseSchedule.choseShifts[lastSchedultIndex][0].weekDay);
    offset = offset <= 0 ? offset + 7 : offset;
    firstDayOfSession = new Date(firstDayOfSession.setDate(firstDayOfSession.getDate() + offset));
  }
  console.log(`Created ${studySessions.length} study sessions for course with id = ${course.id}`);
  return studySessions;
}