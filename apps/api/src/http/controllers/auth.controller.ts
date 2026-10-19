import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../../services/auth.service.js";

const authService = new AuthService();

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function setSessionCookie(res: Response, token: string): void {
  res.cookie("prepkit_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function handleRegister(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const { user, rawToken } = await authService.register(email, password);
  setSessionCookie(res, rawToken);
  res.status(201).json({ user });
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const { user, rawToken } = await authService.login(email, password);
  setSessionCookie(res, rawToken);
  res.status(200).json({ user });
}

export async function handleLogout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.prepkit_session;
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie("prepkit_session");
  res.status(200).json({ success: true });
}

export async function handleMe(req: Request, res: Response): Promise<void> {
  res.status(200).json({ user: req.user });
}
