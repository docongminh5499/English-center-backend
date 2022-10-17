import { faker } from "@faker-js/faker";
import { Branch } from "../entities/Branch";
import { User } from "../entities/UserEntity";
import { Worker } from "../entities/Worker";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import { Sex } from "../utils/constants/sex.constant";
import { slugify } from "../utils/functions/slugify";
import * as bcrypt from "bcryptjs";
import { Account } from "../entities/Account";
import { UserTutor } from "../entities/UserTutor";
import { Shift } from "../entities/Shift";


export const createTutors = async (branches: Branch[], shifts: Shift[]) => {
  const tutors = [];
  const avatars = [
    "/assets/images/avatar/student1.jpg",
    "/assets/images/avatar/student2.jpg",
    "/assets/images/avatar/student3.jpg",
    "/assets/images/avatar/student4.png",
    "/assets/images/avatar/student5.jpg",
    "/assets/images/avatar/teacher.jpg",
  ];
  for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
    const numberOfTutors = faker.datatype.number({ min: 3, max: 10 });
    const branch = branches[branchIndex];
    const slugs: string[] = [];

    for (let index = 0; index < numberOfTutors; index++) {
      let user = new User();
      const gender: "male" | "female" = faker.helpers.arrayElement([Sex.FEMALE, Sex.MALE]);
      user.email = faker.internet.email();
      user.fullName = faker.name.firstName(gender) + " " + faker.name.lastName(gender);
      user.phone = faker.random.numeric(10);
      user.dateOfBirth = new Date(
        faker.datatype.number({ min: 1980, max: 2000 }),
        faker.datatype.number({ min: 0, max: 11 }),
        faker.datatype.number({ min: 1, max: 28 }),
      )
      user.sex = gender as Sex;
      user.address = faker.address.state() + ", " + faker.address.country();
      user.role = UserRole.TUTOR;
      user.avatar = faker.helpers.arrayElement(avatars);
      user = await User.save(user);


      let worker = new Worker();
      worker.user = user;
      worker.startDate = faker.datatype.datetime({
        min: (new Date(user.dateOfBirth.getFullYear() + 18, 0, 1)).getTime(),
        max: (new Date(2021, 0, 1)).getTime(),
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


      let tutor = new UserTutor();
      let slug = slugify(user.fullName);
      if (slugs.indexOf(slug) > -1) slug += '-' + faker.datatype.number();
      slugs.push(slug);
      tutor.slug = slug;
      tutor.worker = worker;
      tutor.shifts = faker.helpers.arrayElements(shifts, faker.datatype.number({ min: 30, max: 60 }));
      tutor = await UserTutor.save(tutor);
      tutor.worker = worker;


      const hashTutor = bcrypt.hashSync("tutor" + (tutors.length + 1), 10);
      await Account.save(Account.create({
        username: "tutor" + (tutors.length + 1),
        password: hashTutor,
        role: AccountRole.TUTOR,
        user: user,
      }));
      tutors.push(tutor);
    }
  }
  console.log(`Created ${tutors.length} tutors`);
  return tutors;
}