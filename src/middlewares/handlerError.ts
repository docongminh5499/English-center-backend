import { QueryFailedError } from "typeorm/error/QueryFailedError";
import { BaseError } from "../utils/errors/base.error";
import { QueryDatabaseError } from "../utils/errors/query.error";

export function handlerError(err: Error, req: any, res: any, next: any) {
  if (err instanceof QueryFailedError) {
    const error = new QueryDatabaseError();
    return res
      .status(error.statusCode)
      .send({ error: true, ...error.serialize() });
  } else if (err instanceof BaseError)
    return res.status(err.statusCode).send({ error: true, ...err.serialize() });
  return res.status(500).send({ error: true, message: "Internal Error" });
}
