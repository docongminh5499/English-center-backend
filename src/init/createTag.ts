import { faker } from "@faker-js/faker";
import { Tag } from "../entities/Tag"

export const createTag = async () => {
    const tags = [];
    for (let index = 0; index < 30; index++) {
        const tag = new Tag();
        tag.name = faker.random.words();
        await tag.save();
        tags.push(tag);
    }
    return tags;
}