import { faker } from "@faker-js/faker";
import moment = require("moment");
import { Course } from "../entities/Course"
import { Fee } from "../entities/Fee";
import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { StudySession } from "../entities/StudySession";
import { Transaction } from "../entities/Transaction";
import { TransactionConstants } from "../entities/TransactionConstants";
import { UserEmployee } from "../entities/UserEmployee";
import { UserStudent } from "../entities/UserStudent"
import { TermCourse } from "../utils/constants/termCuorse.constant";
import { TransactionType } from "../utils/constants/transaction.constant";


const diffDays = (date1: Date, date2: Date) => {
  const diffTime: number = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}


const findAvailableStudents = async (course: Course, shiftIds: number[]): Promise<UserStudent[]> => {
  const busyStudentIdsQuery = StudentParticipateCourse.createQueryBuilder("p")
    .leftJoin("p.course", "course")
    .leftJoin("course.studySessions", "ss")
    .leftJoin("ss.shifts", "shifts")
    .where("ss.date >= :beginingDate", { beginingDate: moment(course.openingDate).format("YYYY-MM-DD") })
    .andWhere("ss.date <= :endingDate", { endingDate: moment(course.expectedClosingDate).format("YYYY-MM-DD") })
    .andWhere(`shifts.id IN (:...ids)`, { ids: shiftIds })
    .select("p.studentId")
    .distinct(true);
  return await UserStudent.createQueryBuilder("s")
    .leftJoinAndSelect("s.user", "user")
    .where(`user.id NOT IN (${busyStudentIdsQuery.getQuery()})`)
    .setParameters(busyStudentIdsQuery.getParameters())
    .getMany();
}


export const createStudentParticipateCourse = async (course: Course,
  studySessions: StudySession[], constants: TransactionConstants, employees: UserEmployee[]) => {
  const sameBranchEmployees = employees.filter(e => e.worker.branch.id === course.branch.id) || [];

  let shiftIds: number[] = [];
  studySessions.forEach(ss => {
    const ssShiftIds = ss.shifts.map(s => s.id);
    shiftIds = shiftIds.concat(ssShiftIds);
  });
  const availableStudents: UserStudent[] = await findAvailableStudents(course, shiftIds);
  const students = faker.helpers.arrayElements(availableStudents, 15);
  const studentAttendCourses = [];
  for (let index = 0; index < students.length; index++) {
    let studentAttendCourse = new StudentParticipateCourse();
    studentAttendCourse.student = students[index];
    if (course.closingDate !== null) {
      const hasComment = faker.helpers.arrayElement([true, false]);
      if (hasComment) {
        studentAttendCourse.comment = faker.lorem.paragraphs();
        studentAttendCourse.starPoint = faker.datatype.number({ min: 1, max: 5 });
        studentAttendCourse.isIncognito = faker.helpers.arrayElement([false, false, true]);
        studentAttendCourse.commentDate = faker.datatype.datetime({
          min: course.closingDate.getTime(),
          max: (new Date()).getTime(),
        });
      }
    }
    // Giả định luôn đăng ký trước khi khóa học bắt đầu
    let isFirst = true;
    let isFinished = false;
    let currentDate = new Date(course.openingDate);
    let feeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.feeDay);
    if (feeDate <= currentDate) feeDate.setMonth(feeDate.getMonth() + 1);
    if (diffDays(feeDate, currentDate) < 10) feeDate.setMonth(feeDate.getMonth() + 1);
    if (course.curriculum.type === TermCourse.ShortTerm) {
      const transaction = new Transaction();
      transaction.transCode = faker.random.numeric(16)
      transaction.content = `Tiền học phí khóa học "${course.name}"`;
      transaction.amount = course.price;
      transaction.type = TransactionType.Fee;
      transaction.branch = course.branch;
      transaction.payDate = faker.datatype.datetime({
        min: (new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10)).getTime(),
        max: currentDate.getTime()
      });
      transaction.userEmployee = faker.helpers.arrayElement(sameBranchEmployees);
      const savedTransaction = await Transaction.save(transaction);
      // Create free
      const fee = new Fee();
      fee.transCode = savedTransaction;
      fee.userStudent = students[index];
      fee.course = course;
      await Fee.save(fee);
      feeDate = new Date(course.expectedClosingDate);
    } else while (true) {
      if ((new Date()) < feeDate) isFinished = true;
      if (course.expectedClosingDate <= feeDate) {
        feeDate = new Date(course.expectedClosingDate);
        isFinished = true;
      } else if (diffDays(course.expectedClosingDate, feeDate) < 10) {
        feeDate = new Date(course.expectedClosingDate);
        isFinished = true;
      }
      // Amount of fee
      const amount = diffDays(feeDate, currentDate) / diffDays(course.expectedClosingDate, course.openingDate) * course.price;
      // Create transaction
      const transaction = new Transaction();
      transaction.transCode = faker.random.numeric(16)
      transaction.content = `Tiền học phí tháng ${currentDate.getMonth() + 1}`;
      transaction.amount = amount;
      transaction.type = TransactionType.Fee;
      transaction.branch = course.branch;
      transaction.payDate = isFirst
        ? faker.datatype.datetime({
          min: (new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10)).getTime(),
          max: currentDate.getTime()
        })
        : faker.datatype.datetime({
          min: currentDate.getTime(),
          max: (new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.feeDueDay)).getTime(),
        });
      transaction.userEmployee = faker.helpers.arrayElement(sameBranchEmployees);
      const savedTransaction = await Transaction.save(transaction);
      // Create free
      const fee = new Fee();
      fee.transCode = savedTransaction;
      fee.userStudent = students[index];
      fee.course = course;
      await Fee.save(fee);
      // Reset data
      isFirst = false;
      if (isFinished) break;
      currentDate = new Date(feeDate);
      feeDate.setMonth(feeDate.getMonth() + 1);
    }
    studentAttendCourse.billingDate = new Date(feeDate);
    studentAttendCourse.course = course;
    studentAttendCourse = await StudentParticipateCourse.save(studentAttendCourse);
    studentAttendCourse.student = students[index];
    studentAttendCourses.push(studentAttendCourse);
  }
  console.log(`Created ${studentAttendCourses.length} student participations for course with id = ${course.id}`);
  return studentAttendCourses;
}