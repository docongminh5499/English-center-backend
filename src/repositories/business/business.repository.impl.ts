import { Brackets } from "typeorm";
import { Course } from "../../entities/Course";
import { TermCourse } from "../../utils/constants/termCuorse.constant";
import BusinessRepositoryInterface from "./business.repository.interface";
import { UserStudent } from "../../entities/UserStudent";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { Fee } from "../../entities/Fee";
import { UserRole } from "../../utils/constants/role.constant";
import { Salary } from "../../entities/Salary";

class BusinessRepositoryImpl implements BusinessRepositoryInterface {

	async getCourseReportData(branchId: number | undefined, type: TermCourse, fromDateQuery: Date, toDateQuery: Date): Promise<Course[]>{
		const course =  await Course.createQueryBuilder("course")
		.leftJoinAndSelect("course.branch", "branch")
		.leftJoinAndSelect("course.curriculum", "curriculum")
		.where("branch.id = :branchId", {branchId})
		.andWhere("curriculum.type = :type", {type: type})
		.andWhere(new Brackets(qb => {
			qb.where(new Brackets(qb => {
				qb.where("course.openingDate >= :openFromDateQuery", {openFromDateQuery: fromDateQuery})
				.andWhere("course.openingDate <= :openToDateQuery", {openToDateQuery: toDateQuery});                                 
			}))
			.orWhere(new Brackets(qb => {
				qb.where("course.expectedClosingDate >= :closeFromDateQuery", {closeFromDateQuery: fromDateQuery})
				.andWhere("course.expectedClosingDate <= :closeToDateQuery", {closeToDateQuery: toDateQuery});                                 
			}));                                 
		}))
		.getMany();

		return course;
	}

	async getTotalCourseReportData(branchId: number | undefined, type: TermCourse, fromDateQuery: Date, toDateQuery: Date): Promise<number>{
		const total = await Course.createQueryBuilder("course")
		.leftJoinAndSelect("course.branch", "branch")
		.leftJoinAndSelect("course.curriculum", "curriculum")
		.where("branch.id = :branchId", {branchId})
		.andWhere("curriculum.type = :type", {type: type})
		.andWhere(new Brackets(qb => {
			qb.where(new Brackets(qb => {
				qb.where("course.openingDate >= :openFromDateQuery", {openFromDateQuery: fromDateQuery})
				.andWhere("course.openingDate <= :openToDateQuery", {openToDateQuery: toDateQuery});                                 
			}))
			.orWhere(new Brackets(qb => {
				qb.where("course.expectedClosingDate >= :closeFromDateQuery", {closeFromDateQuery: fromDateQuery})
				.andWhere("course.expectedClosingDate <= :closeToDateQuery", {closeToDateQuery: toDateQuery});                                 
			}));                                 
		}))
		.getCount();

		return total;
	}

	async getNewStudentReportData(fromDateQuery: Date, toDateQuery: Date): Promise<UserStudent[]>{
		const newStudent = await UserStudent.createQueryBuilder("student")
		.leftJoinAndSelect("student.user", "user")
		.where("user.createdAt >= :fromDateQuery", {fromDateQuery})
		.andWhere("user.createdAt <= :toDateQuery", {toDateQuery})
		.getMany();

		return newStudent;
	}

	async getTotalNewStudent(fromDateQuery: Date, toDateQuery: Date): Promise<number>{
		const total = await UserStudent.createQueryBuilder("student")
			.leftJoinAndSelect("student.user", "user")
			.where("user.createdAt >= :fromDateQuery", {fromDateQuery: fromDateQuery})
			.andWhere("user.createdAt <= :toDateQuery", {toDateQuery: toDateQuery})
			.getCount();

		return total;
	}

	async getTotalStudentUntilYear(toDateQuery: Date) : Promise<number>{
		const total = await UserStudent.createQueryBuilder("student")
			.leftJoinAndSelect("student.user", "user")
			.where("user.createdAt <= :toDateQuery", {toDateQuery})
			.getCount();

		return total;
	}

	async getTotalSPC(branchId: number | undefined, fromDateQuery: Date, toDateQuery: Date): Promise<number>{
		const total = await StudentParticipateCourse.createQueryBuilder("spc")
		.leftJoinAndSelect("spc.course", "course")
		.leftJoinAndSelect("course.branch", "branch")
		.leftJoinAndSelect("spc.student", "student")
		.leftJoinAndSelect("student.user", "user")
		.where("branch.id = :branchId", {branchId})
		.andWhere("course.openingDate >= :fromDateQuery", {fromDateQuery})
		.andWhere("course.openingDate <= :toDateQuery", {toDateQuery})
		.groupBy("user.id")
		.getCount();

		return total;
	}

	async getSPCReportData(branchId: number | undefined, fromDateQuery: Date, toDateQuery: Date): Promise<StudentParticipateCourse[]>{
		const spc = await StudentParticipateCourse.createQueryBuilder("spc")
		.leftJoinAndSelect("spc.course", "course")
		.leftJoinAndSelect("course.branch", "branch")
		.leftJoinAndSelect("spc.student", "student")
		.leftJoinAndSelect("student.user", "user")
		.where("branch.id = :branchId", {branchId})
		.andWhere(new Brackets(qb => {
			qb.where(new Brackets(qb => {
				qb.where("course.openingDate >= :openFromDateQuery", {openFromDateQuery: fromDateQuery})
				.andWhere("course.openingDate <= :openToDateQuery", {openToDateQuery: toDateQuery});                                 
			}))
			.orWhere(new Brackets(qb => {
				qb.where("course.expectedClosingDate >= :closeFromDateQuery", {closeFromDateQuery: fromDateQuery})
				.andWhere("course.expectedClosingDate <= :closeToDateQuery", {closeToDateQuery: toDateQuery});                                 
			}));                                 
		}))
		.getMany();

		return spc;
	}

	async getRevenue(branchId: number | undefined, fromDateQuery: Date, toDateQuery: Date): Promise<any>{
		const revenue = await Fee.createQueryBuilder("fee")
		.leftJoinAndSelect("fee.course", "course")
		.leftJoinAndSelect("course.curriculum", "curriculum")
		.leftJoinAndSelect("fee.transCode", "transaction")
		.leftJoinAndSelect("transaction.branch", "branch")
		.select("SUM(transaction.amount)", "sum")
		.where("branch.id = :id", {id: branchId})
		.andWhere("transaction.payDate >= :fromDateQuery", {fromDateQuery: fromDateQuery})
		.andWhere("transaction.payDate <= :toDateQuery", {toDateQuery: toDateQuery})
		.getRawOne();

		return revenue;
	}

	async getCourseFeeReportData(branchId: number | undefined, type: TermCourse, fromDateQuery: Date, toDateQuery: Date): Promise<Fee[]>{
		const fee = await Fee.createQueryBuilder("fee")
		.leftJoinAndSelect("fee.course", "course")
		.leftJoinAndSelect("course.curriculum", "curriculum")
		.leftJoinAndSelect("fee.transCode", "transaction")
		.leftJoinAndSelect("transaction.branch", "branch")
		.where("branch.id = :id", {id: branchId})
		.andWhere("curriculum.type = :type", {type: type})
		.andWhere("transaction.payDate >= :fromDateQuery", {fromDateQuery})
		.andWhere("transaction.payDate <= :toDateQuery", {toDateQuery})
		.getMany();

		return fee;
	}

	async getSalaryReportData(branchId: number | undefined, role: UserRole, fromDateQuery: Date, toDateQuery: Date) : Promise<Salary[]>{
		const salary = await Salary.createQueryBuilder("salary")
		.leftJoinAndSelect("salary.transCode", "transaction")
		.leftJoinAndSelect("transaction.branch", "branch")
		.leftJoinAndSelect("salary.worker", "worker")
		.leftJoinAndSelect("worker.user", "user")
		.where("branch.id = :id", {id: branchId})
		.andWhere("user.role = :role", {role: role})
		.andWhere("transaction.payDate >= :fromDateQuery", {fromDateQuery})
		.andWhere("transaction.payDate <= :toDateQuery", {toDateQuery})
		.getMany();

		return salary;
	}
}

const BusinessRepository = new BusinessRepositoryImpl();
export default BusinessRepository;