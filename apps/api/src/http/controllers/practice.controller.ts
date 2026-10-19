import { Request, Response } from "express";
import { z } from "zod";
import { PracticeService } from "../../services/practice.service.js";
import { NotFoundError } from "../middleware/errors.js";

const practiceService = new PracticeService();

export const rateCardSchema = z.object({
  cardId: z.string().min(1),
  confidence: z.number().min(1).max(5)
});

export async function handleRateCard(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { cardId, confidence } = req.body;
  await practiceService.recordRating(userId, cardId, confidence);
  res.status(200).json({ success: true });
}

export async function handleGetQueue(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.kitId);
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const filterReqIds = req.query.filterReqIds ? (req.query.filterReqIds as string).split(",") : undefined;

  const queue = await practiceService.getQueue(userId, kitId, limit, filterReqIds);
  res.status(200).json({ queue });
}

export async function handleGetMastery(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.kitId);
  const report = await practiceService.getMastery(userId, kitId);
  if (!report) throw new NotFoundError("Kit not found");
  res.status(200).json({ report });
}
