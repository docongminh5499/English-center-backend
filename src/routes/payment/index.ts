import * as express from "express";
import { guard } from "../../middlewares/guard";
import { PaymentService } from "../../services/payment";
import { UserRole } from "../../utils/constants/role.constant";
const router = express.Router();


router.use(guard([UserRole.PARENT, UserRole.STUDENT]));


router.post("/get-student-order-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await PaymentService.getStudentOrderDetail(req.body.studentId, req.body.courseSlug, req.body.parentId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/on-success-student-participate-course", async (req: any, res: any, next: any) => {
  try {
    const result = await PaymentService.onSuccessStudentParticipateCourse(
      req.body.studentId, req.body.courseSlug, req.body.orderId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/student-payment", async (req: any, res: any, next: any) => {
  try {
    const result = await PaymentService.studentPayment(
      req.body.studentId, req.body.courseSlug, req.body.orderId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



export default router;