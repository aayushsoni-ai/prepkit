import { Router } from "express";
import { handleGetJob, handleResumeJob } from "../controllers/jobs.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireSession } from "../middleware/requireSession.js";

const router = Router();

router.use(requireSession);

router.get("/:id", asyncHandler(handleGetJob));
router.post("/:id/resume", asyncHandler(handleResumeJob));

export default router;
