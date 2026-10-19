import { NextFunction, Request, Response } from "express";
import { ValidationError } from "./errors.js";

export function requireJsonHeader(req: Request, _res: Response, next: NextFunction): void {
  const mutatingMethods = ["POST", "PUT", "PATCH"];
  if (mutatingMethods.includes(req.method)) {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.toLowerCase().includes("application/json")) {
      next(new ValidationError("Mutating requests must specify Content-Type: application/json"));
      return;
    }
  }
  next();
}
