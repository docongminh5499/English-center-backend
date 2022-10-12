import { DeleteResult, UpdateResult } from "typeorm";
import { Curriculum } from "../../entities/Curriculum";
import CurriculumRepositoryInterface from "./curriculum.repository.interface";

class CurriculumRepositoryImpl implements CurriculumRepositoryInterface {
  async getCurriculumList(): Promise<Curriculum[]> {
    return await Curriculum.createQueryBuilder("curriculum")
      .where("curriculum.latest = true")
      .getMany();
  }


  async getCurriculumById(curriculumId: number): Promise<Curriculum | null> {
    return await Curriculum.createQueryBuilder("curriculum")
      .leftJoinAndSelect("curriculum.lectures", "lectures")
      .where("curriculum.id = :curriculumId", { curriculumId })
      .getOne();
  }


  async deleteCurriculumById(curriculumId: number): Promise<boolean> {
    const result: DeleteResult = await Curriculum
      .createQueryBuilder()
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