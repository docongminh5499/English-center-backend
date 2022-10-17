import { faker } from "@faker-js/faker";
import { Branch } from "../entities/Branch";
import { Classroom } from "../entities/Classroom";
import { ClassroomFunction } from "../utils/constants/classroom.constant";

export const createClassrooms = async (branches: Branch[]) => {
    const classrooms = [];
    const functions = [
        ClassroomFunction.WAREHOUSE_ROOM,
        ClassroomFunction.MEETING_ROOM,
        ClassroomFunction.CLASSROOM,
        ClassroomFunction.CLASSROOM,
        ClassroomFunction.CLASSROOM,
        ClassroomFunction.CLASSROOM,
        ClassroomFunction.CLASSROOM,
    ];
    const capacities = [25, 30, 40, 60];

    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
        const numberOfClassroom = faker.datatype.number({ min: 5, max: 10 });
        const branch = branches[branchIndex];
        for (let index = 0; index < numberOfClassroom; index++) {
            let classroom = new Classroom();
            classroom.name = "P" + faker.datatype.number({ min: 100, max: 999 });
            classroom.branch = branch;
            classroom.function = faker.helpers.arrayElement(functions);
            if (classroom.function === ClassroomFunction.WAREHOUSE_ROOM)
                classroom.capacity = 0;
            else classroom.capacity = faker.helpers.arrayElement(capacities);
            classroom = await Classroom.save(classroom);
            classrooms.push(classroom);
        }
    }
    console.log(`Created ${classrooms.length} classrooms`);
    return classrooms;
}