import { faker } from "@faker-js/faker";
import { Branch } from "../entities/Branch";
import { User } from "../entities/UserEntity";
import { Worker } from "../entities/Worker";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import { Sex } from "../utils/constants/sex.constant";
import * as bcrypt from "bcryptjs";
import { Account } from "../entities/Account";
import { UserEmployee } from "../entities/UserEmployee";

export const createEmployees = async (branches: Branch[]) => {
  const employees = [];
  const avatars = [
    "/assets/images/avatar/student1.jpg",
    "/assets/images/avatar/student2.jpg",
    "/assets/images/avatar/student3.jpg",
    "/assets/images/avatar/student4.png",
    "/assets/images/avatar/student5.jpg",
    "/assets/images/avatar/teacher.jpg",
  ];
  for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
    const numberOfEmployees = faker.datatype.number({ min: 3, max: 10 });
    const branch = branches[branchIndex];
    const employeeOfCurrentBranch = [];

    for (let index = 0; index < numberOfEmployees; index++) {
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
      user.role = UserRole.EMPLOYEE;
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

      let employee = new UserEmployee();
      employee.worker = worker;
      employee = await UserEmployee.save(employee);
      employee.worker = worker;

      const hashEmployeePW = bcrypt.hashSync("employee" + (employees.length + 1), 10);
      await Account.save(Account.create({
        username: "employee" + (employees.length + 1),
        password: hashEmployeePW,
        role: AccountRole.EMPLOYEE,
        user: user,
      }));
      employees.push(employee);
      employeeOfCurrentBranch.push(employee);
    }
    branch.userEmployee = faker.helpers.arrayElement(employeeOfCurrentBranch);
    await branch.save();
  }
  console.log(`Created ${employees.length} employees`);
  return employees;
}