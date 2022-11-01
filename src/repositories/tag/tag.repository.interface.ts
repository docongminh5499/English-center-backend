import { Tag } from "../../entities/Tag";

export default interface TagRepository {
    getCurriculumTags: () => Promise<Tag[]>;
}