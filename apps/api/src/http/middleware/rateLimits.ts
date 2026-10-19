import { NextFunction, Request, Response } from "express";
import { ApiError } from "./errors.js";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || "global";
    const now = Date.now();

    const bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= maxRequests) {
      next(new ApiError(429, "RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later."));
      return;
    }

    bucket.count++;
    next();
  };
}
