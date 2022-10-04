import { validate } from "class-validator";
import { DeleteResult } from "typeorm";
import { SocketStatus } from "../../entities/SocketStatus";
import { User } from "../../entities/UserEntity";
import { ValidationError } from "../../utils/errors/validation.error";
import SocketStatusRepositoryInterface from "./socketStatus.repository.interface";

class SocketStatusRepositoryImpl implements SocketStatusRepositoryInterface {
  async add(socketId: string, user: User): Promise<boolean> {
    const existedSocketStatus = await SocketStatus.findOneBy({ socketId: socketId });
    if (existedSocketStatus !== null) return false;

    const socketStatus = new SocketStatus();
    socketStatus.socketId = socketId;
    socketStatus.user = user;
    
    const validateErrors = await validate(socketStatus);
    if (validateErrors.length)  throw new ValidationError(validateErrors);

    const savedSocketStatus = await socketStatus.save();
    return savedSocketStatus.id !== undefined;
  }


  async remove(socketId: string): Promise<boolean> {
    const result: DeleteResult = await SocketStatus
      .createQueryBuilder()
      .delete()
      .where("socketId = :socketId", { socketId })
      .execute();
    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  };

  async findBySocketId(socketId: string): Promise<SocketStatus | null> {
    return SocketStatus.findOne({
      where: { socketId: socketId },
      relations: ["user"]
    });
  }

  async findAllSocketConnByUser(userId: number): Promise<SocketStatus[]> {
    return SocketStatus.createQueryBuilder("socket")
      .where("socket.userId = :userId", { userId })
      .getMany();
  }

}

const SocketStatusRepository = new SocketStatusRepositoryImpl();
export default SocketStatusRepository;