import { Tag } from "../entities/Tag";
import { TagsType } from "../utils/constants/tags.constant";

export const createCurriculumTag = async () => {
    const tags = [];

    const tagNames = [
        "Kinh doanh", "Giao tiếp", "Du lịch", "Học thuật",
        "Trẻ em", "Các kỳ thi", "Ngữ pháp", "Phổ thông (lớp 6 - 12)"
    ];

    for (let index = 0; index < tagNames.length; index++) {
        let tag = new Tag();
        tag.name = tagNames[index];
        tag.type = TagsType.Curriculum;
        tag = await tag.save();
        tags.push(tag);
    }
    console.log(`Created ${tags.length} curriculum tags`);
    return tags;
}