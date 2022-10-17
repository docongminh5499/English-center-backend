import { faker } from "@faker-js/faker";
import { Tag } from "../entities/Tag"
import { TagsType } from "../utils/constants/tags.constant";

export const createTag = async () => {
    const tags = [];
    for (let index = 0; index < 30; index++) {
        let tag = new Tag();
        tag.name = faker.random.words();
        tag.type = TagsType.Question;
        tag = await tag.save();
        tags.push(tag);
    }
    console.log(`Created ${tags.length} tags`);
    return tags;
}