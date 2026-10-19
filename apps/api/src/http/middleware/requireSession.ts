import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../services/auth.service.js";
import { UnauthorizedError } from "./errors.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

const authService = new AuthService();

export async function requireSession(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const cookieToken = req.cookies?.prepkit_session;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = cookieToken || bearerToken;
  if (!token) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }

  const user = await authService.validateSession(token);
  if (!user) {
    next(new UnauthorizedError("Invalid or expired session"));
    return;
  }

  req.user = user;
  next();
}
