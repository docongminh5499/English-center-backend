import * as express from "express";
import { BusinessService } from "../../../services/business";
const router = express.Router();

router.get("/get-revenue-report", async (req: any, res: any, next: any) => {
  try {
    // TODO: Admin get all courses, not depending on teacher id
    console.log("BUSINESS REVENUE");
    const employeeId = req.user.userId;
    const params = req.query;
    const result = await BusinessService.getRevenueData(
      employeeId,
      params.reportYear
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-salary-report", async (req: any, res: any, next: any) => {
  try {
    // TODO: Admin get all courses, not depending on teacher id
    console.log("BUSINESS SALARY");
    const employeeId = req.user.userId;
    const params = req.query;
    const result = await BusinessService.getSalaryData(
      employeeId,
      params.reportYear
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-profit-report", async (req: any, res: any, next: any) => {
  try {
    // TODO: Admin get all courses, not depending on teacher id
    console.log("BUSINESS PROFIT");
    const employeeId = req.user.userId;
    const params = req.query;
    const result = await BusinessService.getProfitData(
      employeeId,
      params.reportYear
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-student-report", async (req: any, res: any, next: any) => {
  try {
    // TODO: Admin get all courses, not depending on teacher id
    console.log("STUDENT REPORT");
    const employeeId = req.user.userId;
    const params = req.query;
    const result = await BusinessService.getStudentReportData(
      employeeId,
      params.reportYear
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-course-report", async (req: any, res: any, next: any) => {
  try {
    // TODO: Admin get all courses, not depending on teacher id
    console.log("COURSE REPORT");
    const employeeId = req.user.userId;
    const params = req.query;
    const result = await BusinessService.getCourseReportData(
      employeeId,
      params.reportYear
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export { router as EmployeeBusinessRouter };
