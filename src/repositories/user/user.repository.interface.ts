import { User } from "../../entities/UserEntity";

export default interface UserRepository {
    findUserByid: (userId: number) => Promise<User | null>;

    findUserByFullName: (fullName: string) => Promise<User[]>;
}