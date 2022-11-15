import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course";
import { createAdmin } from "./createAdmin";
import { createBranches } from "./createBranch";
import { createClassrooms } from "./createClassroom";
import { createCourse } from "./createCourse";
import { createCurriculums } from "./createCurriculum";
import { createCurriculumTag } from "./createCurriculumTags";
import { createDocumentCourse } from "./createDocumentCourse";
import { createEmployees } from "./createEmployee";
import { createExercise } from "./createExerciseCourse";
import { createParents } from "./createParent";
import { createSalary } from "./createSalary";
import { createShifts } from "./createShift";
import { createStudentAttendStudySession } from "./createStudentAttendStudySession";
import { createStudentDoExercise } from "./createStudentDoExercise";
import { createStudentParticipateCourse } from "./createStudentParticipateCourse";
import { createStudentUser } from "./createStudentUser";
import { createStudySession } from "./createStudySession";
import { createTag } from "./createTag";
import { createTeachers } from "./createTeacher";
import { createTeacherPreferCurriculums } from "./createTeacherPreferCurriculum";
import { createTransactionConstants } from "./createTransactionConstants";
import { createTutors } from "./createTutor";

export async function initData() {

  console.log("---------------------- Starting init data ----------------------");

  const constants = await createTransactionConstants();

  const tags = await createTag();

  const curriculumTags = await createCurriculumTag();

  const shifts = await createShifts();

  await createAdmin();

  const branches = await createBranches();

  await createClassrooms(branches);

  const curriculums = await createCurriculums(curriculumTags);

  const teachers = await createTeachers(branches);

  const prefered = await createTeacherPreferCurriculums(teachers, curriculums);

  const tutors = await createTutors(branches, shifts);

  const employees = await createEmployees(branches);

  const students = await createStudentUser();

  await createParents(students);

  const courses = await createCourse(curriculums, branches, prefered);

  courses.sort((prev: Course, next: Course) => {
    if (prev.openingDate > next.openingDate) return 1;
    else if (prev.openingDate < next.openingDate) return -1;
    return 0;
  });

  for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
    const studySessions = await createStudySession(courses[courseIndex], teachers);
    const participations = await createStudentParticipateCourse(courses[courseIndex], studySessions, constants, employees);
    await createDocumentCourse(courses[courseIndex]);
    const exercises = await createExercise(courses[courseIndex], faker.helpers.arrayElements(tags, 10));
    await createStudentAttendStudySession(participations, studySessions);
    await createStudentDoExercise(courses[courseIndex], exercises, participations);
  }
  await createSalary(teachers, employees, tutors, constants);
  

  console.log("----------------------- Ending init data -----------------------")
}

