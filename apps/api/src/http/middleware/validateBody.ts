import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "./errors.js";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      next(new ValidationError(`Request validation failed: ${details}`, parsed.error.issues));
      return;
    }
    req.body = parsed.data;
    next();
  };
}
