import { faker } from "@faker-js/faker";
import { Transaction } from "../entities/Transaction";
import { TransactionConstants } from "../entities/TransactionConstants";
import { UserEmployee } from "../entities/UserEmployee";
import { UserTeacher } from "../entities/UserTeacher";
import { UserTutor } from "../entities/UserTutor";
import { Salary } from "../entities/Salary";
import { TransactionType } from "../utils/constants/transaction.constant";
import { StudySession } from "../entities/StudySession";
import moment = require("moment");
import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { Lecture } from "../entities/Lecture";


export const createSalary = async (teachers: UserTeacher[],
  employees: UserEmployee[], tutors: UserTutor[], constants: TransactionConstants) => {
  // Teacher
  for (const teacher of teachers) {
    let currentDate = new Date(teacher.worker.startDate);
    let salaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.salaryDay);
    if (salaryDate <= currentDate) salaryDate.setMonth(salaryDate.getMonth() + 1);
    while (true) {
      if ((new Date()) < salaryDate) break;
      // Query all study session
      const studySessions = await StudySession
        .createQueryBuilder('ss')
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .where("ss.date >= :beginingDate", { beginingDate: moment(currentDate).format("YYYY-MM-DD") })
        .andWhere("ss.date < :endingDate", { endingDate: moment(salaryDate).format("YYYY-MM-DD") })
        .andWhere("ss.teacherWorker = :teacherId", { teacherId: teacher.worker.user.id })
        .getMany();
      // Amount of fee
      let amount = 0;
      for (const ss of studySessions) {
        const [studentPaticipateCourseCount, lectureCount] = await Promise.all([
          StudentParticipateCourse
            .createQueryBuilder("spc")
            .where("spc.courseId = :courseId", { courseId: ss.course.id })
            .getCount(),
          Lecture
            .createQueryBuilder("lecture")
            .where("curriculumId = :curriculumId", { curriculumId: ss.course.curriculum.id })
            .getCount()
        ])
        const totalPrice = ss.course.price * studentPaticipateCourseCount;
        const numberOfSessions = lectureCount;  // Not count addition study sessions
        const pricePerSession = totalPrice / numberOfSessions;
        amount = amount + pricePerSession * constants.tutorProportion;
      }
      amount = amount + constants.baseSalary * teacher.worker.coefficients;
      // Create transaction
      const transaction = new Transaction();
      transaction.transCode = faker.random.numeric(16)
      transaction.content = `Tiền lương tháng ${salaryDate.getMonth() + 1}`;
      transaction.amount = amount;
      transaction.type = TransactionType.Salary;
      transaction.branch = teacher.worker.branch;
      const savedTransaction = await Transaction.save(transaction);
      // Create salary
      const salary = new Salary();
      salary.transCode = savedTransaction;
      salary.worker = teacher.worker;
      salary.payDate = new Date(salaryDate);
      await Salary.save(salary);
      // Reset data
      currentDate = new Date(salaryDate);
      salaryDate.setMonth(salaryDate.getMonth() + 1);
    }
    teacher.worker.salaryDate = new Date(currentDate);
    await UserTeacher.upsert(teacher, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
    await teacher.reload();
  }
  // Tutors
  for (const tutor of tutors) {
    let currentDate = new Date(tutor.worker.startDate);
    let salaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.salaryDay);
    if (salaryDate <= currentDate) salaryDate.setMonth(salaryDate.getMonth() + 1);
    while (true) {
      if ((new Date()) < salaryDate) break;
      // Query all study session
      const studySessions = await StudySession
        .createQueryBuilder('ss')
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .where("ss.date >= :beginingDate", { beginingDate: moment(currentDate).format("YYYY-MM-DD") })
        .andWhere("ss.date < :endingDate", { endingDate: moment(salaryDate).format("YYYY-MM-DD") })
        .andWhere("ss.tutorWorker = :tutorId", { tutorId: tutor.worker.user.id })
        .getMany();
      // Amount of fee
      let amount = 0;
      for (const ss of studySessions) {
        const [studentPaticipateCourseCount, lectureCount] = await Promise.all([
          StudentParticipateCourse
            .createQueryBuilder("spc")
            .where("spc.courseId = :courseId", { courseId: ss.course.id })
            .getCount(),
          Lecture
            .createQueryBuilder("lecture")
            .where("curriculumId = :curriculumId", { curriculumId: ss.course.curriculum.id })
            .getCount()
        ])
        const totalPrice = ss.course.price * studentPaticipateCourseCount;
        const numberOfSessions = lectureCount;  // Not count addition study sessions
        const pricePerSession = totalPrice / numberOfSessions;
        amount = amount + pricePerSession * constants.tutorProportion;
      }
      amount = amount + constants.baseSalary * tutor.worker.coefficients;
      // Create transaction
      const transaction = new Transaction();
      transaction.transCode = faker.random.numeric(16)
      transaction.content = `Tiền lương tháng ${salaryDate.getMonth() + 1}`;
      transaction.amount = amount;
      transaction.type = TransactionType.Salary;
      transaction.branch = tutor.worker.branch;
      const savedTransaction = await Transaction.save(transaction);
      // Create salary
      const salary = new Salary();
      salary.transCode = savedTransaction;
      salary.worker = tutor.worker;
      salary.payDate = new Date(salaryDate);
      await Salary.save(salary);
      // Reset data
      currentDate = new Date(salaryDate);
      salaryDate.setMonth(salaryDate.getMonth() + 1);
    }
    tutor.worker.salaryDate = new Date(currentDate);
    await UserTutor.upsert(tutor, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
    await tutor.reload();
  }
  // Employee
  for (const employee of employees) {
    let currentDate = new Date(employee.worker.startDate);
    let salaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.salaryDay);
    if (salaryDate <= currentDate) salaryDate.setMonth(salaryDate.getMonth() + 1);
    while (true) {
      if ((new Date()) < salaryDate) break;
      let amount = constants.baseSalary * employee.worker.coefficients;
      // Create transaction
      const transaction = new Transaction();
      transaction.transCode = faker.random.numeric(16)
      transaction.content = `Tiền lương tháng ${salaryDate.getMonth() + 1}`;
      transaction.amount = amount;
      transaction.type = TransactionType.Salary;
      transaction.branch = employee.worker.branch;
      const savedTransaction = await Transaction.save(transaction);
      // Create salary
      const salary = new Salary();
      salary.transCode = savedTransaction;
      salary.worker = employee.worker;
      salary.payDate = new Date(salaryDate);
      await Salary.save(salary);
      // Reset data
      currentDate = new Date(salaryDate);
      salaryDate.setMonth(salaryDate.getMonth() + 1);
    }
    employee.worker.salaryDate = new Date(currentDate);
    await UserEmployee.upsert(employee, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
    await employee.reload();
  }
}