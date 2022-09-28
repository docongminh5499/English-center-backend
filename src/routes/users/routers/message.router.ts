import * as express from "express";
import { MessageService } from "../../../services/message";
import { PageableMapper, UserMapper } from "../mappers";

const router = express.Router();

router.post("/get-contacts", async (req: any, res: any, next: any) => {
  try {
    const contacts = await MessageService.getContacts(req.user.userId);
    return res.status(200).json(contacts);
  } catch (err) {
    console.log(err);
    next(err);
  }
}
);

router.post("/find-contacts", async (req: any, res: any, next: any) => {
  try {
    const contacts = await MessageService.findContacts(req.body.name);
    return res.status(200).json(contacts);
  } catch (err) {
    console.log(err);
    next(err);
  }
}
);

router.post("/get-messages", async (req: any, res: any, next: any) => {
  try {
    const userDto = UserMapper.mapToDto({ id: req.user.userId });
    const targetUserDto = UserMapper.mapToDto(req.body.target);
    const pageableDto = PageableMapper.mapToDto(req.body);
    const messageListDto = await MessageService.getMessages(userDto, targetUserDto, pageableDto);
    return res.status(200).json(messageListDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
}
);

router.post("/get-unread-messages-count", async (req: any, res: any, next: any) => {
  try {
    const userDto = UserMapper.mapToDto({ id: req.user.userId });
    const count = await MessageService.getUnreadMessageCount(userDto);
    return res.status(200).json({ messageCount: count });
  } catch (err) {
    console.log(err);
    next(err);
  }
}
);

export { router as MessageRouter };