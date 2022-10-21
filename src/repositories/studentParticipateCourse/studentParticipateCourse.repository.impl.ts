import { Brackets } from "typeorm";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import Pageable from "../helpers/pageable";
import StudentParticipateCourseRepositoryInterface from "./studentParticipateCourse.repository.interface";

class StudentParticipateCourseRepositoryImpl implements StudentParticipateCourseRepositoryInterface {
  async findStudentsByCourseSlug(courseSlug: string, pageable: Pageable, query?: string | undefined): Promise<StudentParticipateCourse[]> {
    let queryStmt = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .leftJoinAndSelect("studentPaticipateCourses.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug });

    if (query !== undefined && query.trim().length > 0) {
      queryStmt = queryStmt.andWhere(new Brackets(qb => {
        qb.where("userStudent.fullName LIKE :query", { query: '%' + query + '%' })
          .orWhere("userStudent.id LIKE :query", { query: '%' + query + '%' })
      }));
    }
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }



  async countStudentsByCourseSlug(courseSlug: string, query?: string | undefined): Promise<number> {
    let queryStmt = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .leftJoinAndSelect("studentPaticipateCourses.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug });

    if (query !== undefined && query.trim().length > 0) {
      queryStmt = queryStmt.andWhere(new Brackets(qb => {
        qb.where("userStudent.fullName LIKE :query", { query: '%' + query + '%' })
          .orWhere("userStudent.id LIKE :query", { query: '%' + query + '%' })
      }));
    }
    return await queryStmt.getCount();
  }


  async countCommentsByCourseSlug(courseSlug: string): Promise<number> {
    let queryStmt = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .andWhere("starPoint is not null");
    return await queryStmt.getCount();
  }


  async countStarPointsTypeByCourseSlug(courseSlug: string): Promise<object> {
    let queryStmt = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .select("starPoint", "starPoint")
      .addSelect("count(starPoint)", "starPointTypeCount")
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .andWhere("starPoint is not null")
      .groupBy("starPoint");

    const starPointTypeCount: any = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    const result = await queryStmt.execute();
    result.forEach((data: any) => {
      starPointTypeCount[data["starPoint"]] = parseInt(data["starPointTypeCount"]);
    })
    return starPointTypeCount;
  }


  async getAverageStarPointByCourseSlug(courseSlug: string): Promise<number> {
    let queryStmt = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .select("avg(starPoint)", "avgPoint")
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .andWhere("starPoint is not null");
    return (await queryStmt.getRawOne()).avgPoint;
  }


  async getCommentsByCourseSlug(courseSlug: string, pageable: Pageable): Promise<StudentParticipateCourse[]> {
    let queryStmt = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .leftJoinAndSelect("studentPaticipateCourses.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .andWhere("starPoint is not null")
      .orderBy({ "studentPaticipateCourses.commentDate": "DESC" });
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }



  async checkStudentParticipateCourse(studentId: number, courseSlug: string): Promise<boolean> {
    const count = await StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .leftJoinAndSelect("studentPaticipateCourses.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .andWhere("userStudent.id = :studentId", { studentId })
      .getCount();
    return count > 0;
  }
}



const StudentParticipateCourseRepository = new StudentParticipateCourseRepositoryImpl();
export default StudentParticipateCourseRepository;