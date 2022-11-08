import { Tag } from "../../entities/Tag";
import { TagsType } from "../../utils/constants/tags.constant";
import TagRepositoryInterface from "./tag.repository.interface";

class TagRepositoryImpl implements TagRepositoryInterface {
  async getCurriculumTags(): Promise<Tag[]> {
    return await Tag.createQueryBuilder("tag")
      .where("tag.type = :type", { type: TagsType.Curriculum })
      .getMany();
  }
}


const TagRepository = new TagRepositoryImpl();
export default TagRepository;