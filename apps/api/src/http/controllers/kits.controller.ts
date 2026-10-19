import { Request, Response } from "express";
import { z } from "zod";
import { serializeKit } from "../../domain/kit/serialize.js";
import { KitsService } from "../../services/kits.service.js";
import { RegenerationService } from "../../services/regeneration.service.js";
import { ConflictError, NotFoundError } from "../middleware/errors.js";

const kitsService = new KitsService();
const regenService = new RegenerationService();

export const createKitSchema = z.object({
  jd: z.string().min(10),
  company_url: z.string().url(),
  days: z.number().int().min(1).max(60)
});

export async function handleCreateKit(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const result = await kitsService.createKit(userId, req.body);
  res.status(result.existing ? 200 : 202).json(result);
}

export async function handleListKits(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kits = await kitsService.listKits(userId);
  res.status(200).json({ kits: kits.map(serializeKit) });
}

export async function handleGetKit(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.id);
  const kit = await kitsService.getKit(kitId, userId);
  if (!kit) throw new NotFoundError("Kit not found");
  res.status(200).json({ kit: serializeKit(kit), version: kit.version });
}

export async function handlePatchQuestion(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.id);
  const qId = String(req.params.qId);
  const { updates, expectedVersion } = req.body;
  const ok = await kitsService.patchQuestion(kitId, userId, qId, updates, expectedVersion);
  if (!ok) throw new ConflictError();
  res.status(200).json({ success: true });
}

export async function handleAddQuestion(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.id);
  const { category, question, guidance, difficulty, expectedVersion } = req.body;
  const ok = await kitsService.addQuestion(kitId, userId, category, question, guidance, difficulty, expectedVersion);
  if (!ok) throw new ConflictError();
  res.status(201).json({ success: true });
}

export async function handleDeleteQuestion(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.id);
  const qId = String(req.params.qId);
  const { expectedVersion } = req.body;
  const ok = await kitsService.deleteQuestion(kitId, userId, qId, expectedVersion);
  if (!ok) throw new ConflictError();
  res.status(200).json({ success: true });
}

export async function handleRegenerate(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.id);
  const { section, category, expectedVersion } = req.body;

  let updatedKit = null;
  if (section === "schedule") {
    updatedKit = await regenService.regenerateSchedule(kitId, userId, expectedVersion);
  } else if (category) {
    updatedKit = await regenService.regenerateCategory(kitId, userId, category, expectedVersion);
  }

  if (!updatedKit) throw new ConflictError("Regeneration failed or version conflict");
  res.status(200).json({ kit: serializeKit(updatedKit), version: updatedKit.version });
}

export async function handleUndo(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const kitId = String(req.params.id);
  const restored = await regenService.undo(kitId, userId);
  if (!restored) throw new NotFoundError("No snapshot available to undo");
  res.status(200).json({ kit: serializeKit(restored), version: restored.version });
}
