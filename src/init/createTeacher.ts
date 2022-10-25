import { faker } from "@faker-js/faker";
import { Branch } from "../entities/Branch";
import { User } from "../entities/UserEntity";
import { UserTeacher } from "../entities/UserTeacher";
import { Worker } from "../entities/Worker";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import { Sex } from "../utils/constants/sex.constant";
import { slugify } from "../utils/functions/slugify";
import * as bcrypt from "bcryptjs";
import { Account } from "../entities/Account";

export const createTeachers = async (branches: Branch[]) => {
  const teachers = [];
  const avatars = [
    "/assets/images/avatar/student1.jpg",
    "/assets/images/avatar/student2.jpg",
    "/assets/images/avatar/student3.jpg",
    "/assets/images/avatar/student4.png",
    "/assets/images/avatar/student5.jpg",
    "/assets/images/avatar/teacher.jpg",
  ];
  for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
    const numberOfTeachers = faker.datatype.number({ min: 3, max: 10 });
    const branch = branches[branchIndex];
    const slugs: string[] = [];

    for (let index = 0; index < numberOfTeachers; index++) {
      let user = new User();
      const gender: "male" | "female" = faker.helpers.arrayElement([Sex.FEMALE, Sex.MALE]);
      user.email = faker.internet.email();
      user.fullName = faker.name.firstName(gender) + " " + faker.name.lastName(gender);
      user.phone = faker.random.numeric(10);
      user.dateOfBirth = new Date(
        faker.datatype.number({ min: 1960, max: 1999 }),
        faker.datatype.number({ min: 0, max: 11 }),
        faker.datatype.number({ min: 1, max: 28 }),
      )
      user.sex = gender as Sex;
      user.address = faker.address.state() + ", " + faker.address.country();
      user.role = UserRole.TEACHER;
      user.avatar = faker.helpers.arrayElement(avatars);
      user = await User.save(user);


      let worker = new Worker();
      worker.user = user;
      worker.startDate = faker.datatype.datetime({
        min: (new Date(user.dateOfBirth.getFullYear() + 22, 0, 1)).getTime(),
        max: (new Date(2021, 5, 1)).getTime(),
      });
      worker.salaryDate = faker.datatype.datetime({
        min: worker.startDate.getTime(),
        max: (new Date()).getTime(),
      });
      worker.coefficients = 90;
      worker.nation = "Kinh";
      worker.passport = faker.phone.number("############");
      worker.homeTown = faker.address.cityName();
      worker.branch = branch;
      worker = await Worker.save(worker);
      worker.user = user;

      let teacher = new UserTeacher();
      let slug = slugify(user.fullName);
      if (slugs.indexOf(slug) > -1) slug += '-' + faker.datatype.number();
      slugs.push(slug);
      teacher.slug = slug;
      teacher.worker = worker;
      teacher.experience = faker.lorem.paragraphs();
      teacher.shortDesc = faker.lorem.paragraphs();
      teacher = await UserTeacher.save(teacher);
      teacher.worker = worker;


      const hashTeacherPW = bcrypt.hashSync("teacher" + (teachers.length + 1), 10);
      await Account.save(Account.create({
        username: "teacher" + (teachers.length + 1),
        password: hashTeacherPW,
        role: AccountRole.TEACHER,
        user: user,
      }));
      teachers.push(teacher);
    }
  }
  console.log(`Created ${teachers.length} teachers`);
  return teachers;
}