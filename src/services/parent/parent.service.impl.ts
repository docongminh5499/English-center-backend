import moment = require("moment");
import * as path from "path";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import { CourseListDto, CredentialDto, FileDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Exercise } from "../../entities/Exercise";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { UserParent } from "../../entities/UserParent";
import { AccountRepository, CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import StudySessionRepository from "../../repositories/studySession/studySession.repository.impl";
import UserParentRepository from "../../repositories/userParent/userParent.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import { AVATAR_DESTINATION_SRC } from "../../utils/constants/avatar.constant";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { AppDataSource } from "../../utils/functions/dataSource";
import ParentServiceInterface from "./parent.service.interface";

class ParentServiceImpl implements ParentServiceInterface {
	async getUserParent(parentId: number) : Promise<UserParent | null>{
		if (parentId === null || parentId === undefined)
			throw new NotFoundError();

		const userParent = await UserParentRepository.findUserParent(parentId);

		return userParent;
	}

	async getCoursesForTimetableByParent(studentId: number) : Promise<Course[] | null>{
		if(studentId === null || studentId === undefined)
			throw new NotFoundError();
		const courses = await CourseRepository.findCourseForTimetableByStudent(studentId);
		return courses;
	}

	async getPagecbleStudentCourses(studentId: number, pageableDto: PageableDto, queryable: Queryable<Course>) : Promise<CourseListDto>{
		console.log("STUDENT SERVICE");
        const selectable = new Selectable()
            .add("Course.id", "id")
            .add("Course.image", "image")
            .add("Course.closingDate", "closingDate")
            .add("Course.name", "name")
            .add("Course.openingDate", "openingDate")
            .add("Course.expectedClosingDate", "expectedClosingDate")
            .add("slug", "slug");
        const sortable = new Sortable()
            .add("openingDate", "DESC")
            .add("name", "ASC");
        const pageable = new Pageable(pageableDto);

        const [courseCount, courseList] = await Promise.all([
            CourseRepository.countCourseByStudent(queryable, studentId),
            CourseRepository.findCourseByStudent(pageable, sortable, selectable, queryable, studentId)
        ]);
        
        const courseListDto = new CourseListDto();
        courseListDto.courses = courseList;
        courseListDto.limit = pageable.limit;
        courseListDto.skip = pageable.offset;
        courseListDto.total = courseCount;

        return courseListDto;
	}

    async getCourseDetail(studentId: number, courseSlug: string) : Promise<Course | null>{
        const course = await CourseRepository.findBriefCourseBySlug(courseSlug);
        if(course === null)
            return null;
        course?.studentPaticipateCourses.forEach(value => console.log(value.student.user.id))
        if (course?.studentPaticipateCourses.filter(value => value.student.user.id == studentId).length === 0) 
            return null;
        return course;
    }

    async getAttendance(studentId: number, courseSlug: string) : Promise<UserAttendStudySession[]>{
        console.log("STUDENT ATTENDANCE SERVICE");
        const attendance = await StudySessionRepository.findStudySessionByStudent(studentId, courseSlug);
        // console.log(attendance);
        return attendance!;
    }

    async getAllExercises(courseId: number) : Promise<Exercise[] | null>{
        try{
            console.log(courseId);
            const exercise = await Exercise.createQueryBuilder("exercise")
                                    .where("courseId = :courseId", {courseId: courseId})
                                    .getMany();
            return exercise;
        } catch(error){
            console.log(error);
            return null;
        }
    }

    async getStudentDoExercise(studentId: number, courseId: number) : Promise<StudentDoExercise[] | null>{
        try{
            const studentDoExercise = StudentDoExercise.createQueryBuilder("studentDoExercise")
                                                       .leftJoinAndSelect("studentDoExercise.student", "student")
                                                       .leftJoinAndSelect("student.user", "user")
                                                       .leftJoinAndSelect("studentDoExercise.exercise", "exercise")
                                                       .leftJoinAndSelect("exercise.course", "course")
                                                       .where("user.id = :studentId", {studentId})
                                                       .andWhere("course.id = :courseId", {courseId})
                                                       .getMany();
            return studentDoExercise;
        } catch(error){
            console.log(error);
            return null;
        }
    }

    async modifyPersonalInformation(userId: number, userParent: UserParent, avatarFile?: FileDto | null): Promise<CredentialDto | null> {
		const persistenceUserParent = await UserParent
                                            .createQueryBuilder("userParent")
                                            .leftJoinAndSelect("userParent.user", "user")
                                            .where("user.id = :userId", {userId})
                                            .getOne();

		if (persistenceUserParent === null)
			throw new NotFoundError("Không tìm thấy thông tin cá nhân của bạn.");
		const oldAvatarSrc = persistenceUserParent.user.avatar;

		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect()
		await queryRunner.startTransaction()
		try {
			persistenceUserParent.user.fullName = userParent.user.fullName;
			persistenceUserParent.user.dateOfBirth = moment(userParent.user.dateOfBirth).toDate();
			persistenceUserParent.user.sex = userParent.user.sex;
			persistenceUserParent.user.address = userParent.user.address;
			persistenceUserParent.user.email = userParent.user.email;
			persistenceUserParent.user.phone = userParent.user.phone;

			if (avatarFile && avatarFile.filename)
            persistenceUserParent.user.avatar = AVATAR_DESTINATION_SRC + avatarFile.filename;

			const savedUser = await queryRunner.manager.save(persistenceUserParent.user);
			await queryRunner.manager.upsert(UserParent, persistenceUserParent, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
			await persistenceUserParent.reload();

			await queryRunner.commitTransaction();
			await queryRunner.release();
			if (avatarFile && avatarFile.filename && oldAvatarSrc && oldAvatarSrc.length > 0) {
				const filePath = path.join(process.cwd(), "public", oldAvatarSrc);
				fs.unlinkSync(filePath);
			}
			const account = await AccountRepository.findByUserId(savedUser.id);
			const credentialDto = new CredentialDto();
			credentialDto.token = jwt.sign({
				fullName: account?.user.fullName,
				userId: account?.user.id,
				userName: account?.username,
				role: account?.role,
				avatar: account?.user.avatar,
				version: account?.version,
			}, process.env.TOKEN_KEY || "", { expiresIn: "1d" });
			return credentialDto;
		} catch (error) {
			console.log(error);
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
			throw error;
		}
	}
}

const ParentService = new ParentServiceImpl();
export default ParentService;
