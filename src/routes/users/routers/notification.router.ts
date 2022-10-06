import express = require("express");
import { NotificationService } from "../../../services/notification";
import { PageableMapper, UserMapper } from "../mappers";

const router = express.Router();


router.post("/get-notification", async (req: any, res: any, next: any) => {
  try {
    const userDto = UserMapper.mapToDto({ id: req.user.userId });
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await NotificationService.getNotification(userDto, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.get("/get-unread-notification-count", async (req: any, res: any, next: any) => {
  try {
    const userDto = UserMapper.mapToDto({ id: req.user.userId });
    const result = await NotificationService.getUnreadNotificationCount(userDto);
    return res.status(200).json({ notificationCount: result });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export { router as NotificationRouter };