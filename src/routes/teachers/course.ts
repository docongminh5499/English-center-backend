import * as express from "express";
import { Course } from "../../entities/Course";

const router = express.Router();

router.get("/get-course", async (req: any, res: any, next: any) => {
  try {
    const limit: number = Number(req.query.limit) || 12;
    const skip: number = Number(req.query.skip) || 0;

    const [courses, numberCourses] = await Promise.all([
      Course.createQueryBuilder()
        .select([
          "id AS id",
          "name AS name",
          "image AS image",
          "openingDate AS openingDate",
        ])
        .where("teacherWorker = :id", { id: req.user.userId })
        .orderBy("openingDate", "DESC")
        .addOrderBy("name", "ASC")
        .limit(limit)
        .offset(skip)
        .execute(),
      Course.createQueryBuilder()
        .where("teacherWorker = :id", { id: req.user.userId })
        .getCount(),
    ]);

    return res.json({
      courses: courses,
      total: numberCourses,
      limit: limit,
      skip: skip,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export { router as CourseRouter };
