import { DeleteResult, UpdateResult } from "typeorm";
import { Curriculum } from "../../entities/Curriculum";
import CurriculumRepositoryInterface from "./curriculum.repository.interface";

class CurriculumRepositoryImpl implements CurriculumRepositoryInterface {
  async getCurriculumList(): Promise<Curriculum[]> {
    return await Curriculum.createQueryBuilder("curriculum")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("curriculum.tags", "tags")
      .where("curriculum.latest = true")
      .getMany();
  }


  async getCurriculumById(curriculumId: number): Promise<Curriculum | null> {
    return await Curriculum.createQueryBuilder("curriculum")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("curriculum.lectures", "lectures")
      .leftJoinAndSelect("curriculum.tags", "tags")
      .where("curriculum.id = :curriculumId", { curriculumId })
      .andWhere("curriculum.latest = true")
      .getOne();
  }


  async deleteCurriculumById(curriculumId: number): Promise<boolean> {
    const result: DeleteResult = await Curriculum
      .createQueryBuilder()
      .setLock("pessimistic_write")
      .useTransaction(true)
      .delete()
      .where("id = :curriculumId", { curriculumId })
      .execute();
    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  }


  async setNullCurriculumById(curriculumId: number): Promise<boolean> {
    const result: UpdateResult = await Curriculum
      .createQueryBuilder()
      .setLock("pessimistic_write")
      .useTransaction(true)
      .update()
      .where("id = :curriculumId", { curriculumId })
      .set({ latest: false })
      .execute();
    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  }
}


const CurriculumRepository = new CurriculumRepositoryImpl();
export default CurriculumRepository;