import { Course } from "../../entities/Course";
import { CourseRepository, UserRepository } from "../../repositories";
import StudentServiceInterface from "./student.service.interface";

class StudentServiceImpl implements StudentServiceInterface {
    async getCoursesByUsername(username: string) : Promise<Course[]>{
        const user = await UserRepository.findUserByUsername(username);
        const studentCourse = await CourseRepository.findCourseByStudent(user.id);
        return studentCourse;
    }
}

const StudentService = new StudentServiceImpl();
export default StudentService;