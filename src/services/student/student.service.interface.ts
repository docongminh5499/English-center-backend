import { Course } from "../../entities/Course";


export default interface StudentService {
    getCoursesByUsername: (username: string) => Promise<Course[]>;
}