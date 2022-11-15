import { User } from "../entities/UserEntity";
import { UserStudent } from "../entities/UserStudent";
import { faker } from '@faker-js/faker';
import { Sex } from "../utils/constants/sex.constant";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import * as bcrypt from "bcryptjs";
import { Account } from "../entities/Account";

export const createStudentUser = async (): Promise<UserStudent[]> => {
    const students = [];
    const avatars = [
        "/assets/images/avatar/student1.jpg",
        "/assets/images/avatar/student2.jpg",
        "/assets/images/avatar/student3.jpg",
        "/assets/images/avatar/student4.png",
        "/assets/images/avatar/student5.jpg",
    ];

    for (let index = 0; index < 80; index++) {
        let user = new User();
        const gender: "male" | "female" = faker.helpers.arrayElement([Sex.FEMALE, Sex.MALE]);
        user.email = faker.internet.email();
        user.fullName = faker.name.firstName(gender) + " " + faker.name.lastName(gender);
        user.phone = faker.random.numeric(10);
        user.dateOfBirth = new Date(
            faker.datatype.number({ min: 1980, max: 2016 }),
            faker.datatype.number({ min: 0, max: 11 }),
            faker.datatype.number({ min: 1, max: 28 }),
        )
        user.sex = gender as Sex;
        user.address = faker.address.state() + ", " + faker.address.country();
        user.role = UserRole.STUDENT;
        user.avatar = faker.helpers.arrayElement(avatars);
        user = await User.save(user);

        let student = new UserStudent();
        student.user = user;
        student = await UserStudent.save(student);
        student.user = user;


        const hashPasswordStudent = bcrypt.hashSync("student" + (index + 1), 10);
        await Account.save(Account.create({
            username: "student" + (index + 1),
            password: hashPasswordStudent,
            role: AccountRole.STUDENT,
            user: user,
        }));

        students.push(student);
    }
    console.log(`Created ${students.length} students`);
    return students;
}