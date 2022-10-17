import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course"
import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { UserStudent } from "../entities/UserStudent"

export const createStudentParticipateCourse = async (course: Course, students: UserStudent[]) => {
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
    studentAttendCourse.course = course;
    studentAttendCourse = await StudentParticipateCourse.save(studentAttendCourse);
    studentAttendCourse.student = students[index];
    studentAttendCourses.push(studentAttendCourse);
  }
  console.log(`Created ${studentAttendCourses.length} student participations for course with id = ${course.id}`);
  return studentAttendCourses;
}