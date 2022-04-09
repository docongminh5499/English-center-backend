import { validate } from "class-validator";
import { ValidationError } from "../utils/errors/validation.error";

export const ValidateRequest =
  (EntityClass: any) =>
  async (req: any, res: any, next: any) => {
    req.body = Object.assign(new EntityClass(), req.body);
    const validateErrors = await validate(req.body);
    if (validateErrors.length) return next(new ValidationError(validateErrors));
    next();
  };
