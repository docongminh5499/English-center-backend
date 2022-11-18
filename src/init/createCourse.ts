import { faker } from "@faker-js/faker";
import { Branch } from "../entities/Branch";
import { Course } from "../entities/Course";
import { Curriculum } from "../entities/Curriculum";
import { TeacherPreferCurriculum } from "../entities/TeacherPreferCurriculum";
import { UserTeacher } from "../entities/UserTeacher";
import { slugify } from "../utils/functions/slugify";

export const createCourse = async (curriculums: Curriculum[], branches: Branch[], prefered: TeacherPreferCurriculum[]) => {
  const courses = [];
  const slugs: string[] = [];
  const capacities = [25, 30, 40, 60];

  for (let index = 0; index < curriculums.length; index++) {
    const curriculum = curriculums[index];
    const numberOfCourse = faker.datatype.number({ min: 15, max: 20 });

    const teachersPreferCurriculum: UserTeacher[] = [];
    prefered.forEach(prefer => {
      if (prefer.curriculum.id === curriculum.id) 
        teachersPreferCurriculum.push(prefer.teacher);
    })

    for (let courseIndex = 0; courseIndex < numberOfCourse; courseIndex++) {
      const name = faker.lorem.sentence();
      let slug = slugify(name);
      if (slugs.indexOf(slug) > -1) slug += '-' + faker.datatype.number();
      slugs.push(slug);

      const openingDate = faker.datatype.datetime({
        min: (new Date(2019, 0, 1)).getTime(),
        max: (new Date(2024, 0, 1)).getTime(),
      });
      const expectedClosingDate = faker.datatype.datetime({
        min: openingDate.getTime(),
        max: (new Date(2024, 0, 1)).getTime(),
      });
      const closingDate = null;
      let course = new Course();
      course.name = name;
      course.slug = slug;
      course.maxNumberOfStudent = faker.helpers.arrayElement(capacities);
      course.price = parseFloat(faker.finance.amount(5, 30, 1)) * 1000000;
      course.openingDate = openingDate;
      course.expectedClosingDate = expectedClosingDate;
      course.closingDate = closingDate;
      course.image = "/assets/images/course/init_course.jpg";
      course.curriculum = curriculum;
      course.teacher = faker.helpers.arrayElement(teachersPreferCurriculum);
      course.branch = faker.helpers.arrayElement(branches);
      course.lockTime = null;
      course = await course.save();
      courses.push(course);
    }
  }
  console.log(`Created ${courses.length} courses`);
  return courses;
}