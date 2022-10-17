import { faker } from "@faker-js/faker";
import { User } from "../entities/UserEntity";
import { UserParent } from "../entities/UserParent";
import { UserStudent } from "../entities/UserStudent";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import { Sex } from "../utils/constants/sex.constant";
import * as bcrypt from "bcryptjs";
import { Account } from "../entities/Account";


export const createParents = async (students: UserStudent[]) => {
    const parents = [];
    const avatars = [
        "/assets/images/avatar/student1.jpg",
        "/assets/images/avatar/student2.jpg",
        "/assets/images/avatar/student3.jpg",
        "/assets/images/avatar/student4.png",
        "/assets/images/avatar/student5.jpg",
    ];

    for (let index = 0; index < 10; index++) {
        let user = new User();
        const gender: "male" | "female" = faker.helpers.arrayElement([Sex.FEMALE, Sex.MALE]);
        user.email = faker.internet.email();
        user.fullName = faker.name.firstName(gender) + " " + faker.name.lastName(gender);
        user.phone = faker.random.numeric(10);
        user.dateOfBirth = new Date(
            faker.datatype.number({ min: 1950, max: 1970 }),
            faker.datatype.number({ min: 0, max: 11 }),
            faker.datatype.number({ min: 1, max: 28 }),
          )
        user.sex = gender as Sex;
        user.address = faker.address.state() + ", " + faker.address.country();
        user.role = UserRole.PARENT;
        user.avatar = faker.helpers.arrayElement(avatars);
        user = await User.save(user);

        let parent = new UserParent();
        parent.user = user;
        parent.userStudents = faker.helpers.arrayElements(students, faker.datatype.number({ min: 1, max: 3 }));
        parent = await UserParent.save(parent);
        parent.user = user;
        

        const hashPasswordParent = bcrypt.hashSync("parent" + (index + 1), 10);
        await Account.save(Account.create({
            username: "parent" + (index + 1),
            password: hashPasswordParent,
            role: AccountRole.PARENT,
            user: user,
        }));

        parents.push(parent);
    }
    console.log(`Created ${parents.length} parents`);
    return parents;
}