import { CourseReportDto, ProfitDto, SalaryDto, StudentReportDto } from "../../dto";
import RevenueDto from "../../dto/responses/revenue.dto";
import { Fee } from "../../entities/Fee";
import { Salary } from "../../entities/Salary";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserTeacher } from "../../entities/UserTeacher";
import { UserTutor } from "../../entities/UserTutor";
import BranchRepository from "../../repositories/branch/branch.repository.impl";
import EmployeeRepository from "../../repositories/userEmployee/employee.repository.impl";
import { UserRole } from "../../utils/constants/role.constant";
import { TermCourse } from "../../utils/constants/termCuorse.constant";
import { NotEnoughPermissionError } from "../../utils/errors/notEnoughPermission.error";
import BusinessServiceInterface from "./business.service.interface";
import BusinessRepository from "../../repositories/business/business.repository.impl";

class BusinessServiceImpl implements BusinessServiceInterface {
	async getRevenueData(employeeId: number, reportYear: number): Promise<RevenueDto> {
		const revenue = new RevenueDto();
		revenue.year = reportYear;
		const isManager = await BranchRepository.checkIsManager(employeeId);

		if(!isManager){
			throw new NotEnoughPermissionError();
		}
		const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
		const branchId = employee?.worker.branch.id;

		const now = new Date();
		var fromDateQuery = new Date(reportYear, 0, 1, 0, 0, 0); 
		var toDateQuery = now;
		if(now.getFullYear() == reportYear){
			toDateQuery = now;
		}else {
			var toDateQuery = new Date(reportYear, 11, 31, 23, 59, 59); 
		}

		revenue.amountShortTermCourse = await BusinessRepository.getTotalCourseReportData(branchId, TermCourse.ShortTerm, fromDateQuery, toDateQuery);

		revenue.amountLongTermCourse = await BusinessRepository.getTotalCourseReportData(branchId, TermCourse.LongTerm, fromDateQuery, toDateQuery);

		revenue.totalStudent = await BusinessRepository.getTotalStudentUntilYear(toDateQuery);

		const preYearRevenue = await BusinessRepository.getRevenue(
			branchId,
			 new Date(fromDateQuery.getFullYear() - 1, 0, 1),
			 new Date(toDateQuery.getFullYear() - 1, 11, 31, 23, 59, 59)
		);

		if (preYearRevenue !== undefined){
			revenue.preYearRevenue = parseInt(preYearRevenue.sum);
		}else {
			revenue.preYearRevenue = 0;
		}
		
		const shortTermFee = await BusinessRepository.getCourseFeeReportData(branchId, TermCourse.ShortTerm, fromDateQuery, toDateQuery);

		const longTermFee = await BusinessRepository.getCourseFeeReportData(branchId, TermCourse.LongTerm, fromDateQuery, toDateQuery);

		const shortTermRevenue = Array(toDateQuery.getMonth() + 1).fill(0);
		const longTermRevenue = Array(toDateQuery.getMonth() + 1).fill(0);

		shortTermFee.forEach(fee => {
			shortTermRevenue[fee.transCode.payDate.getMonth()] += fee.transCode.amount;
		});
		longTermFee.forEach(fee => {
			longTermRevenue[fee.transCode.payDate.getMonth()] += fee.transCode.amount;
		});

		revenue.shortTermRevenue = shortTermRevenue;
		revenue.longTermRevenue = longTermRevenue;
		
		return revenue;
	}

	async getSalaryData(employeeId: number, reportYear: number): Promise<SalaryDto>{
		const salary = new SalaryDto();
		salary.year = reportYear;
		const isManager = await BranchRepository.checkIsManager(employeeId);

		if(!isManager){
			throw new NotEnoughPermissionError();
		}
		const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
		const branchId = employee?.worker.branch.id;

		const now = new Date();
		var fromDateQuery = new Date(reportYear, 0, 1, 0, 0, 0); 
		var toDateQuery = now;
		if(now.getFullYear() == reportYear){
			toDateQuery = now;
		}else {
			var toDateQuery = new Date(reportYear, 11, 31, 23, 59, 59); 
		}

		salary.amountEmployee = await UserEmployee.createQueryBuilder("employee")
																							.leftJoinAndSelect("employee.worker", "worker")
																							.leftJoinAndSelect("worker.user", "user")
																							.leftJoinAndSelect("worker.branch", "branch")
																							.where("branch.id = :id", {id: branchId})
																							.andWhere("worker.startDate <= :toDateQuery", {toDateQuery})
																							.getCount();

		salary.amountTeacher = await UserTeacher.createQueryBuilder("teacher")
																						.leftJoinAndSelect("teacher.worker", "worker")
																						.leftJoinAndSelect("worker.user", "user")
																						.leftJoinAndSelect("worker.branch", "branch")
																						.where("branch.id = :id", {id: branchId})
																						.andWhere("worker.startDate <= :toDateQuery", {toDateQuery})
																						.getCount();

		salary.amountTutor = await UserTutor.createQueryBuilder("tutor")
																						.leftJoinAndSelect("tutor.worker", "worker")
																						.leftJoinAndSelect("worker.user", "user")
																						.leftJoinAndSelect("worker.branch", "branch")
																						.where("branch.id = :id", {id: branchId})
																						.andWhere("worker.startDate <= :toDateQuery", {toDateQuery})
																						.getCount();
		
		const employeeSalary = await BusinessRepository.getSalaryReportData(branchId, UserRole.EMPLOYEE, fromDateQuery, toDateQuery);


		const teacherSalary = await BusinessRepository.getSalaryReportData(branchId, UserRole.TEACHER, fromDateQuery, toDateQuery);

		
		const tutorSalary = await BusinessRepository.getSalaryReportData(branchId, UserRole.TUTOR, fromDateQuery, toDateQuery);

		const employeeSalaryAccordMonth = Array(toDateQuery.getMonth() + 1).fill(0);
		const teacherSalaryAccordMonth = Array(toDateQuery.getMonth() + 1).fill(0);
		const tutorSalaryAccordMonth = Array(toDateQuery.getMonth() + 1).fill(0);
		employeeSalary.forEach(salary => {
			employeeSalaryAccordMonth[salary.transCode.payDate.getMonth()] += salary.transCode.amount;
		});
		teacherSalary.forEach(salary => {
			teacherSalaryAccordMonth[salary.transCode.payDate.getMonth()] += salary.transCode.amount;
		});
		tutorSalary.forEach(salary => {
			tutorSalaryAccordMonth[salary.transCode.payDate.getMonth()] += salary.transCode.amount;
		});

		salary.employeeSalary = employeeSalaryAccordMonth;
		salary.teacherSalary = teacherSalaryAccordMonth;
		salary.tutorSalary = tutorSalaryAccordMonth;
		
		return salary;
	}

	async getProfitData(employeeId: number, reportYear: number): Promise<ProfitDto>{
		const profit = new ProfitDto();
		profit.year = reportYear;
		const isManager = await BranchRepository.checkIsManager(employeeId);

		if(!isManager){
			// Throw Error
		}
		const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
		const branchId = employee?.worker.branch.id;

		const now = new Date();
		var fromDateQuery = new Date(reportYear, 0, 1, 0, 0, 0); 
		var toDateQuery = now;
		if(now.getFullYear() == reportYear){
			toDateQuery = now;
		}else {
			var toDateQuery = new Date(reportYear, 11, 31, 23, 59, 59); 
		}
		const revenue = await Fee.createQueryBuilder("fee")
														.leftJoinAndSelect("fee.course", "course")
														.leftJoinAndSelect("course.curriculum", "curriculum")
														.leftJoinAndSelect("fee.transCode", "transaction")
														.leftJoinAndSelect("transaction.branch", "branch")
														.where("branch.id = :id", {id: branchId})
														.andWhere("transaction.payDate >= :fromDateQuery", {fromDateQuery})
														.andWhere("transaction.payDate <= :toDateQuery", {toDateQuery})
														.getMany();

		const salary = await Salary.createQueryBuilder("salary")
															.leftJoinAndSelect("salary.transCode", "transaction")
															.leftJoinAndSelect("transaction.branch", "branch")
															.leftJoinAndSelect("salary.worker", "worker")
															.leftJoinAndSelect("worker.user", "user")
															.where("branch.id = :id", {id: branchId})
															.andWhere("transaction.payDate >= :fromDateQuery", {fromDateQuery})
															.andWhere("transaction.payDate <= :toDateQuery", {toDateQuery})
															.getMany();

		const preYearRevenue = await Fee.createQueryBuilder("fee")
																			.leftJoinAndSelect("fee.transCode", "transaction")
																			.leftJoinAndSelect("transaction.branch", "branch")
																			.select("SUM(transaction.amount)", "sum")
																			.where("branch.id = :id", {id: branchId})
																			.andWhere("transaction.payDate >= :fromDateQuery", {fromDateQuery: new Date(fromDateQuery.getFullYear() - 1, 0, 1)})
																			.andWhere("transaction.payDate <= :toDateQuery", {toDateQuery: new Date(toDateQuery.getFullYear() - 1, 11, 31, 23, 59, 59)})
																			.getRawOne();

		const preYearSalary = await Salary.createQueryBuilder("salary")
																			.leftJoinAndSelect("salary.transCode", "transaction")
																			.leftJoinAndSelect("transaction.branch", "branch")
																			.select("SUM(transaction.amount)", "sum")
																			.where("branch.id = :id", {id: branchId})
																			.andWhere("transaction.payDate >= :fromDateQuery", {fromDateQuery: new Date(fromDateQuery.getFullYear() - 1, 0, 1)})
																			.andWhere("transaction.payDate <= :toDateQuery", {toDateQuery: new Date(toDateQuery.getFullYear() - 1, 11, 31, 23, 59, 59)})
																			.getRawOne();
		if (preYearRevenue !== undefined){
			profit.preYearRevenue = parseInt(preYearRevenue.sum);
		}else {
			profit.preYearRevenue = 0;
		}

		if (preYearSalary !== undefined){
			profit.preYearSalary = parseInt(preYearSalary.sum);
		}else {
			profit.preYearSalary = 0;
		}
		
		const revenueAccordMonth = Array(toDateQuery.getMonth() + 1).fill(0);
		const salaryAccordMonth = Array(toDateQuery.getMonth() + 1).fill(0);

		revenue.forEach(fee => {
			revenueAccordMonth[fee.transCode.payDate.getMonth()] += fee.transCode.amount;
		});
		salary.forEach(salary => {
			salaryAccordMonth[salary.transCode.payDate.getMonth()] += salary.transCode.amount;
		});

		profit.revenue = revenueAccordMonth;
		profit.salary = salaryAccordMonth;
		
		return profit;
	}

	async getStudentReportData(employeeId: number, reportYear: number): Promise<StudentReportDto>{
		const isManager = await BranchRepository.checkIsManager(employeeId);

		if(!isManager){
			throw new NotEnoughPermissionError();
		}
		const studentReport = new StudentReportDto();
		studentReport.year = reportYear;

		const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
		const branchId = employee?.worker.branch.id;

		const now = new Date();
		var fromDateQuery = new Date(reportYear, 0, 1, 0, 0, 0); 
		var toDateQuery = now;
		if(now.getFullYear() == reportYear){
			toDateQuery = now;
		}else {
			var toDateQuery = new Date(reportYear, 11, 31, 23, 59, 59); 
		}
		const newStudent = await BusinessRepository.getNewStudentReportData(fromDateQuery, toDateQuery);

		studentReport.preYearNewStudent = await BusinessRepository.getTotalNewStudent(new Date(fromDateQuery.getFullYear() - 1, 0, 1), 
																																						new Date(toDateQuery.getFullYear() - 1, 11, 31, 23, 59, 59));

		studentReport.totalStudentUntilQueryYear = await BusinessRepository.getTotalStudentUntilYear(toDateQuery);

		const stdParticipateCourse = await BusinessRepository.getSPCReportData(branchId, fromDateQuery, toDateQuery);

		studentReport.preYearStdParticipateCourse = await BusinessRepository.getTotalSPC(
			branchId, 
			new Date(fromDateQuery.getFullYear() - 1, 0, 1), 
			new Date(toDateQuery.getFullYear() - 1, 11, 31, 23, 59, 59)
		)

		studentReport.queryYearStdParticipateCourse = await BusinessRepository.getTotalSPC(branchId, fromDateQuery, toDateQuery)

		
		const newStudentAccordMonth = Array(toDateQuery.getMonth() + 1).fill(0);
		const stdParticipateCourseAccordMonth: Set<number>[] = [];
		for(let i = 0; i<toDateQuery.getMonth() + 1;i++){
			stdParticipateCourseAccordMonth.push(new Set());
		}

		newStudent.forEach(student => {
			newStudentAccordMonth[(new Date(student.user.createdAt)).getMonth()] += 1;
		});

		stdParticipateCourse.forEach(spc => {
			const openingDate = new Date(spc.course.openingDate);
			const closingDate = spc.course.closingDate === null? new Date(spc.course.expectedClosingDate): new Date(spc.course.closingDate);

			const startMonth = openingDate.getTime() > fromDateQuery.getTime()? openingDate.getMonth() : 0;
			const endMonth = closingDate.getTime() > toDateQuery.getTime()? 11: closingDate.getMonth();

			for(let i = startMonth; i <= endMonth; i++){
				stdParticipateCourseAccordMonth[i].add(spc.student.user.id);
			}
		});
		studentReport.newStudent = newStudentAccordMonth;
		studentReport.stdParticipateCourse = stdParticipateCourseAccordMonth.map(value => value.size);
		
		return studentReport;
	}

	async getCourseReportData(employeeId: number, reportYear: number): Promise<CourseReportDto>{
		const isManager = await BranchRepository.checkIsManager(employeeId);
		if(!isManager){
			throw new NotEnoughPermissionError();
		}
		const courseReport = new CourseReportDto();
		courseReport.year = reportYear;

		const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
		const branchId = employee?.worker.branch.id;

		const now = new Date();
		var fromDateQuery = new Date(reportYear, 0, 1, 0, 0, 0); 
		var toDateQuery = now;
		if(now.getFullYear() == reportYear){
			toDateQuery = now;
		}else {
			var toDateQuery = new Date(reportYear, 11, 31, 23, 59, 59); 
		}

		const shortTermCourse = await BusinessRepository.getCourseReportData(branchId, TermCourse.ShortTerm, fromDateQuery, toDateQuery);
		courseReport.totalPreYearShortTermCourse = await BusinessRepository.getTotalCourseReportData(branchId, 
			TermCourse.ShortTerm,
			new Date(fromDateQuery.getFullYear() - 1, 0, 1),
			new Date(toDateQuery.getFullYear() - 1, 11, 31, 23, 59, 59));

		const longTermCourse = await BusinessRepository.getCourseReportData(branchId, TermCourse.LongTerm, fromDateQuery, toDateQuery);
		courseReport.totalPreYearLongTermCourse = await BusinessRepository.getTotalCourseReportData(branchId, 
			TermCourse.LongTerm,
			new Date(fromDateQuery.getFullYear() - 1, 0, 1),
			new Date(toDateQuery.getFullYear() - 1, 11, 31, 23, 59, 59));

		courseReport.totalQueryYearShortTermCourse = shortTermCourse.length;
		courseReport.totalQueryYearLongTermCourse = longTermCourse.length;
		

		
		const shortTermCourseAccordMonth = Array(toDateQuery.getMonth() + 1).fill(0);
		const longTermCourseAccordMonth= Array(toDateQuery.getMonth() + 1).fill(0);
		
		shortTermCourse.forEach(course => {
			const openingDate = new Date(course.openingDate);
			const closingDate = course.closingDate === null? new Date(course.expectedClosingDate): new Date(course.closingDate);

			const startMonth = openingDate.getTime() > fromDateQuery.getTime()? openingDate.getMonth() : 0;
			const endMonth = closingDate.getTime() > toDateQuery.getTime()? 11: closingDate.getMonth();

			for(let i = startMonth; i <= endMonth; i++){
				shortTermCourseAccordMonth[i] += 1;
			}
		});

		longTermCourse.forEach(course => {
			const openingDate = new Date(course.openingDate);
			const closingDate = course.closingDate === null? new Date(course.expectedClosingDate): new Date(course.closingDate);

			const startMonth = openingDate.getTime() > fromDateQuery.getTime()? openingDate.getMonth() : 0;
			const endMonth = closingDate.getTime() > toDateQuery.getTime()? 11: closingDate.getMonth();

			for(let i = startMonth; i <= endMonth; i++){
				longTermCourseAccordMonth[i] += 1;
			}
		});

		courseReport.shortTermCourse = shortTermCourseAccordMonth;
		courseReport.longTermCourse = longTermCourseAccordMonth;
		
		return courseReport;
	}
}

export const BusinessService = new BusinessServiceImpl();