import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course"
import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { UserStudent } from "../entities/UserStudent"

export const createStudentParticipateCourse = async (course: Course, students: UserStudent[]) => {
    for (let index = 0; index < students.length; index++) {
        const studentAttendCourse = new StudentParticipateCourse();
        studentAttendCourse.student = students[index];
        const hasComment = faker.helpers.arrayElement([true, false]);
        if (hasComment) {
            studentAttendCourse.comment = faker.lorem.paragraph();
            studentAttendCourse.starPoint = faker.datatype.number({ min: 1, max: 5 });
            studentAttendCourse.isIncognito = faker.helpers.arrayElement([false, false, true]);
            studentAttendCourse.commentDate = faker.datatype.datetime({
                min: (new Date(2019, 0, 1)).getTime(),
                max: (new Date(2022, 0, 1)).getTime(),
            });
        }
        studentAttendCourse.course = course;
        await StudentParticipateCourse.save(studentAttendCourse);
    }
}