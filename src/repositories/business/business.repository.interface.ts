import { Course } from "../../entities/Course";
import { Fee } from "../../entities/Fee";
import { Salary } from "../../entities/Salary";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { UserStudent } from "../../entities/UserStudent";
import { UserRole } from "../../utils/constants/role.constant";
import { TermCourse } from "../../utils/constants/termCuorse.constant";

export default interface BusinessRepository {
	getCourseReportData: (branchId: number | undefined, type: TermCourse, fromDateQuery: Date, toDateQuery: Date) => Promise<Course[]>;

	getTotalCourseReportData: (branchId: number | undefined, type: TermCourse, fromDateQuery: Date, toDateQuery: Date) => Promise<number>;

	getNewStudentReportData: (fromDateQuery: Date, toDateQuery: Date) => Promise<UserStudent[]>;

	getTotalNewStudent: (fromDateQuery: Date, toDateQuery: Date) => Promise<number>;

	getTotalStudentUntilYear: (toDateQuery: Date) => Promise<number>;

	getTotalSPC: (branchId: number | undefined, fromDateQuery: Date, toDateQuery: Date) => Promise<number>;

	getSPCReportData: (branchId: number | undefined, fromDateQuery: Date, toDateQuery: Date) => Promise<StudentParticipateCourse[]>;

	getRevenue: (branchId: number | undefined, fromDateQuery: Date, toDateQuery: Date) => Promise<any>;

	getCourseFeeReportData: (branchId: number | undefined, type: TermCourse, fromDateQuery: Date, toDateQuery: Date) => Promise<Fee[]>;

	getSalaryReportData: (branchId: number | undefined, role: UserRole, fromDateQuery: Date, toDateQuery: Date) => Promise<Salary[]>;
}