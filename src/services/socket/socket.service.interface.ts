import { SignOutSocketStatusDto, SocketDto, UserDto } from "../../dto";

export default interface SocketService {
    signin: (user: UserDto, socket: SocketDto) => Promise<boolean>;

    signout: (socket: SocketDto) => Promise<SignOutSocketStatusDto>;
}