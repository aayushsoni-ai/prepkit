import { Router } from "express";
import { handleLogin, handleLogout, handleMe, handleRegister, loginSchema, registerSchema } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter } from "../middleware/rateLimits.js";
import { requireJsonHeader } from "../middleware/requireJsonHeader.js";
import { requireSession } from "../middleware/requireSession.js";
import { validateBody } from "../middleware/validateBody.js";

const authLimiter = createRateLimiter(20, 60000);
const router = Router();

router.post("/register", authLimiter, requireJsonHeader, validateBody(registerSchema), asyncHandler(handleRegister));
router.post("/login", authLimiter, requireJsonHeader, validateBody(loginSchema), asyncHandler(handleLogin));
router.post("/logout", asyncHandler(handleLogout));
router.get("/me", requireSession, asyncHandler(handleMe));

export default router;
