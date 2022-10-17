import { faker } from "@faker-js/faker";
import { UserAdmin } from "../entities/UserAdmin";
import { User } from "../entities/UserEntity";
import { AccountRole, UserRole } from "../utils/constants/role.constant";
import { Sex } from "../utils/constants/sex.constant";
import * as bcrypt from "bcryptjs";
import { Account } from "../entities/Account";


export const createAdmin = async () => {
    const avatars = [
        "/assets/images/avatar/student1.jpg",
        "/assets/images/avatar/student2.jpg",
        "/assets/images/avatar/student3.jpg",
        "/assets/images/avatar/student4.png",
        "/assets/images/avatar/student5.jpg",
    ];

    let user = new User();
    const gender: "male" | "female" = faker.helpers.arrayElement([Sex.FEMALE, Sex.MALE]);
    user.email = faker.internet.email();
    user.fullName = faker.name.firstName(gender) + " " + faker.name.lastName(gender);
    user.phone = faker.random.numeric(10);
    user.dateOfBirth = new Date(
        faker.datatype.number({ min: 1950, max: 1980 }),
        faker.datatype.number({ min: 0, max: 11 }),
        faker.datatype.number({ min: 1, max: 28 }),
    )
    user.sex = gender as Sex;
    user.address = faker.address.state() + ", " + faker.address.country();
    user.role = UserRole.ADMIN;
    user.avatar = faker.helpers.arrayElement(avatars);
    user = await User.save(user);

    let admin = new UserAdmin();
    admin.user = user;
    admin = await UserAdmin.save(admin);
    admin.user = user;

    const hashPasswordAdmin = bcrypt.hashSync("admin", 10);
    await Account.save(Account.create({
        username: "admin",
        password: hashPasswordAdmin,
        role: AccountRole.ADMIN,
        user: user,
    }));

    console.log("Created 1 admin account.")
}