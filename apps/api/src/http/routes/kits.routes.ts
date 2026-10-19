import { Router } from "express";
import {
  createKitSchema,
  handleAddQuestion,
  handleCreateKit,
  handleDeleteQuestion,
  handleGetKit,
  handleListKits,
  handlePatchQuestion,
  handleRegenerate,
  handleUndo
} from "../controllers/kits.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createRateLimiter } from "../middleware/rateLimits.js";
import { requireJsonHeader } from "../middleware/requireJsonHeader.js";
import { requireSession } from "../middleware/requireSession.js";
import { validateBody } from "../middleware/validateBody.js";

const kitCreationLimiter = createRateLimiter(10, 60000);
const router = Router();

router.use(requireSession);

router.post("/", kitCreationLimiter, requireJsonHeader, validateBody(createKitSchema), asyncHandler(handleCreateKit));
router.get("/", asyncHandler(handleListKits));
router.get("/:id", asyncHandler(handleGetKit));
router.patch("/:id/questions/:qId", requireJsonHeader, asyncHandler(handlePatchQuestion));
router.post("/:id/questions", requireJsonHeader, asyncHandler(handleAddQuestion));
router.delete("/:id/questions/:qId", requireJsonHeader, asyncHandler(handleDeleteQuestion));
router.post("/:id/regenerate", requireJsonHeader, asyncHandler(handleRegenerate));
router.post("/:id/undo", requireJsonHeader, asyncHandler(handleUndo));

export default router;
