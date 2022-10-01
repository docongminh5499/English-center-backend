import { SignOutSocketStatusDto, SocketDto, UserDto } from "../../dto";
import { SocketStatusRepository, UserRepository } from "../../repositories";
import SocketServiceInterface from "./socket.service.interface";

class SocketServiceImpl implements SocketServiceInterface {
  async signin(user: UserDto, socket: SocketDto): Promise<boolean> {
    if (user.id === undefined) return false;

    const foundUser = await UserRepository.findUserByid(user.id);
    if (foundUser === null) return false;
    return SocketStatusRepository.add(socket.id, foundUser);
  }



  async signout(socket: SocketDto): Promise<SignOutSocketStatusDto> {
    const result = new SignOutSocketStatusDto();
    result.connLeft = 0;

    const socketStatus = await SocketStatusRepository.findBySocketId(socket.id);
    if (socketStatus !== null) {
      await SocketStatusRepository.remove(socket.id);
      const connLeft = await SocketStatusRepository.findAllSocketConnByUser(socketStatus.user.id);
      result.connLeft = connLeft.length;
      result.userId = socketStatus.user.id;
      return result;
    }
    return result;
  }
}

const SocketService = new SocketServiceImpl();
export default SocketService;