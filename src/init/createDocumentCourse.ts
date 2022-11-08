import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course";
import { Document } from "../entities/Document";

export const createDocumentCourse = async (course: Course) => {
    const numberOfDocuments = faker.datatype.number({ min: 4, max: 10 });
    const src = ["https://www.google.com", "/assets/images/avatar/student1.jpg"];

    for (let index = 0; index < numberOfDocuments; index++) {
        let document = new Document();
        document.name = faker.random.words();
        document.author = faker.name.fullName();
        document.pubYear = faker.datatype.number({ min: 1900, max: 2010 });
        document.src = faker.helpers.arrayElement(src);
        document.course = course;
        document = await document.save();
    }
    console.log(`Created ${numberOfDocuments} documents for course with id = ${course.id}`);
}