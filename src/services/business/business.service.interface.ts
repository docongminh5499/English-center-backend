import { CourseReportDto, ProfitDto, SalaryDto, StudentReportDto } from "../../dto";
import RevenueDto from "../../dto/responses/revenue.dto";

export default interface BusinessService {
	getRevenueData: (employeeId: number, reportYear: number) => Promise<RevenueDto>;
	
	getSalaryData: (employeeId: number, reportYear: number) => Promise<SalaryDto>;
	
	getProfitData: (employeeId: number, reportYear: number) => Promise<ProfitDto>;

	getStudentReportData: (employeeId: number, reportYear: number) => Promise<StudentReportDto>;
	
	getCourseReportData: (employeeId: number, reportYear: number) => Promise<CourseReportDto>;
}