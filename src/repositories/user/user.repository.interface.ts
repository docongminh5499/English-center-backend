import { User } from "../../entities/UserEntity";
import Pageable from "../helpers/pageable";

export default interface UserRepository {
    findUserByid: (userId: number) => Promise<User | null>;

    findUserByFullName: (fullName: string, pageable: Pageable) => Promise<User[]>;

    countUserByFullName: (fullName: string) => Promise<number>;

    findUserByUsername: (username: string) => Promise<User>;
}