import { PageableDto } from "../../dto";
import maskedCommentDto from "../../dto/responses/maskedComment.dto";
import { Branch } from "../../entities/Branch";
import { Course } from "../../entities/Course";
import { Tag } from "../../entities/Tag";
import { CourseRepository, Pageable } from "../../repositories";
import BranchRepository from "../../repositories/branch/branch.repository.impl";
import StudentParticipateCourseRepository from "../../repositories/studentParticipateCourse/studentParticipateCourse.repository.impl";
import TagRepository from "../../repositories/tag/tag.repository.impl";
import UserStudentRepository from "../../repositories/userStudent/userStudent.repository.impl";
import { CurriculumLevel } from "../../utils/constants/curriculum.constant";
import GuestServiceInterface from "./guest.service.interface";


class GuestServiceImpl implements GuestServiceInterface {
  async getBranches(): Promise<Branch[]> {
    return await BranchRepository.findBranch();
  }


  async getStudentCount(): Promise<number> {
    return await UserStudentRepository.countStudents();
  }


  async getCompletedCourseCount(): Promise<number> {
    return await CourseRepository.countCompletedCourse();
  }


  async getCurriculumTags(): Promise<Tag[]> {
    return await TagRepository.getCurriculumTags();
  }


  async getTopComments(): Promise<maskedCommentDto[]> {
    const participations = await StudentParticipateCourseRepository.getTopComments();
    const maskedComment = participations
      .map(participation => ({
        comment: participation.comment,
        starPoint: participation.starPoint,
        userFullName: participation.isIncognito ? "Người dùng đã ẩn danh" : participation.student.user.fullName,
        commentDate: participation.commentDate,
        avatar: participation.isIncognito ? undefined : participation.student.user.avatar,
      }));
    return maskedComment;
  }


  async getCourses(pageableDto: PageableDto, level?: CurriculumLevel,
    curriculumTag?: string, branchId?: number): Promise<{ total: number, courses: Course[] }> {
    const pageable = new Pageable(pageableDto);
    const [total, courses] = await Promise.all([
      CourseRepository.countCoursesForGuest(level, curriculumTag, branchId),
      CourseRepository.getCoursesForGuest(pageable, level, curriculumTag, branchId),
    ]);
    return { total, courses };
  }


  async getCourseDetail(courseSlug: string): Promise<Course | null> {
    const result = await CourseRepository.getCourseDetailForGuest(courseSlug);
    if (result === null) return result;
    if ((new Date()) >= new Date(result.openingDate)) return null;
    return result;
  }
}

const GuestService = new GuestServiceImpl();
export default GuestService;