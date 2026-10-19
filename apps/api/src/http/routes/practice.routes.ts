import { Router } from "express";
import { handleGetMastery, handleGetQueue, handleRateCard, rateCardSchema } from "../controllers/practice.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireJsonHeader } from "../middleware/requireJsonHeader.js";
import { requireSession } from "../middleware/requireSession.js";
import { validateBody } from "../middleware/validateBody.js";

const router = Router();

router.use(requireSession);

router.post("/rate", requireJsonHeader, validateBody(rateCardSchema), asyncHandler(handleRateCard));
router.get("/:kitId/queue", asyncHandler(handleGetQueue));
router.get("/:kitId/mastery", asyncHandler(handleGetMastery));

export default router;
