import * as express from "express";
import * as http from "http";
import * as cors from "cors";
import UserRouter from "./routes/users";
import TeacherRouter from "./routes/teachers";
import { json, urlencoded } from "body-parser";
import { NotFoundError } from "./utils/errors/notFound.error";
import { handlerError } from "./middlewares/handlerError";
import { extractUser } from "./middlewares/extractUser";

const app = express();

app.set("trust proxy", true);
app.use(cors())
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(extractUser);

app.use(express.static('public'))
app.use("/api/users", UserRouter);
app.use("/api/teachers", TeacherRouter);

app.all("*", async (req: any, res: any, next: any) => {
  return next(new NotFoundError());
});

app.use(handlerError);

const server = http.createServer(app);
export { server };
