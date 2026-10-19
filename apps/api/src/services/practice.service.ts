import { Flashcard } from "../domain/kit/schema.js";
import { buildPracticeQueue } from "../domain/practice/buildQueue.js";
import { calculateRequirementMastery, WeakSpotsReport } from "../domain/practice/mastery.js";
import { KitsRepository } from "../persistence/repositories/kits.repo.js";
import { PracticeRepository } from "../persistence/repositories/practice.repo.js";

export class PracticeService {
  private readonly practiceRepo = new PracticeRepository();
  private readonly kitsRepo = new KitsRepository();

  async recordRating(userId: string, cardId: string, confidence: number): Promise<void> {
    const clamped = Math.max(1, Math.min(5, Math.round(confidence)));
    await this.practiceRepo.recordRating(userId, cardId, clamped);
  }

  async getQueue(userId: string, kitId: string, limit = 10, filterReqIds?: string[]): Promise<Flashcard[]> {
    const kitModel = await this.kitsRepo.findById(kitId, userId);
    if (!kitModel) return [];

    const history = await this.practiceRepo.getHistoryMap(userId);
    return buildPracticeQueue(kitModel.kit.flashcards, history, kitModel.kit.role.requirements, limit, filterReqIds);
  }

  async getMastery(userId: string, kitId: string): Promise<WeakSpotsReport | null> {
    const kitModel = await this.kitsRepo.findById(kitId, userId);
    if (!kitModel) return null;

    const history = await this.practiceRepo.getHistoryMap(userId);
    return calculateRequirementMastery(kitModel.kit.role.requirements, kitModel.kit.flashcards, history);
  }
}
