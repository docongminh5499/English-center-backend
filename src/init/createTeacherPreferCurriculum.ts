import { faker } from "@faker-js/faker";
import { Curriculum } from "../entities/Curriculum";
import { TeacherPreferCurriculum } from "../entities/TeacherPreferCurriculum";
import { UserTeacher } from "../entities/UserTeacher";

export const createTeacherPreferCurriculums = async (teachers: UserTeacher[], curriculums: Curriculum[]) => {
    const prefered = [];
    for (let index = 0; index < teachers.length; index++) {
        const teacher = teachers[index];
        const curriculum = faker.helpers.arrayElements(curriculums, faker.datatype.number({ min: 5, max: 15 }))
        for (let curIndex = 0; curIndex < curriculum.length; curIndex++) {
            let prefer = new TeacherPreferCurriculum();
            prefer.teacher = teacher;
            prefer.curriculum = curriculum[curIndex];
            let savedPrefer = await TeacherPreferCurriculum.save(prefer);
            savedPrefer.teacher = teacher;
            savedPrefer.curriculum = curriculum[curIndex];
            prefered.push(savedPrefer);
        }
    }
    return prefered;
}