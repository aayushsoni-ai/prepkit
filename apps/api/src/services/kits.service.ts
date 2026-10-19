import { createQuestionId } from "../domain/kit/ids.js";
import { Category, Kit, Question } from "../domain/kit/schema.js";
import { markEdited, markUserItem } from "../domain/regeneration/itemState.js";
import { allocateSchedule } from "../domain/schedule/allocateSchedule.js";
import { KitsRepository } from "../persistence/repositories/kits.repo.js";
import { computeFingerprint } from "../pipeline/fingerprint.js";
import { JobRunner } from "./jobRunner.js";

export class KitsService {
  private readonly kitsRepo = new KitsRepository();
  private readonly jobRunner = new JobRunner();

  async createKit(userId: string, input: { jd: string; company_url: string; days: number }): Promise<{ kitId: string; jobId?: string; existing: boolean }> {
    const fingerprint = computeFingerprint(userId, input.jd, input.company_url);
    const existing = await this.kitsRepo.findByFingerprint(userId, fingerprint);

    if (existing) {
      return { kitId: existing._id, existing: true };
    }

    const { jobId, kitId } = await this.jobRunner.startJob(userId, input);
    return { kitId, jobId, existing: false };
  }

  async getKit(kitId: string, userId: string): Promise<Kit | null> {
    const model = await this.kitsRepo.findById(kitId, userId);
    return model ? model.kit : null;
  }

  async listKits(userId: string): Promise<Kit[]> {
    const models = await this.kitsRepo.findAllByUserId(userId);
    return models.map((m) => m.kit);
  }

  async patchQuestion(kitId: string, userId: string, questionId: string, updates: Partial<Question>, expectedVersion: number): Promise<boolean> {
    const model = await this.kitsRepo.findById(kitId, userId);
    if (!model) return false;

    const kit = model.kit;
    const index = kit.questions.findIndex((q) => q.id === questionId);
    if (index === -1) return false;

    const original = kit.questions[index];
    kit.questions[index] = markEdited(original, updates);

    return this.kitsRepo.updateWithVersion(kitId, userId, expectedVersion, kit);
  }

  async addQuestion(kitId: string, userId: string, category: Category, question: string, guidance: string, difficulty: 1 | 2 | 3, expectedVersion: number): Promise<boolean> {
    const model = await this.kitsRepo.findById(kitId, userId);
    if (!model) return false;

    const newQ: Question = markUserItem({
      id: createQuestionId(),
      category,
      question,
      guidance,
      difficulty,
      requirement_ids: []
    });

    const kit = model.kit;
    kit.questions.push(newQ);
    return this.kitsRepo.updateWithVersion(kitId, userId, expectedVersion, kit);
  }

  async deleteQuestion(kitId: string, userId: string, questionId: string, expectedVersion: number): Promise<boolean> {
    const model = await this.kitsRepo.findById(kitId, userId);
    if (!model) return false;

    const snapshot = JSON.parse(JSON.stringify(model.kit)) as Kit;
    const kit = model.kit;
    kit.questions = kit.questions.filter((q) => q.id !== questionId);
    for (const day of kit.schedule.days) {
      day.question_ids = day.question_ids.filter((id) => id !== questionId);
    }

    return this.kitsRepo.updateWithVersion(kitId, userId, expectedVersion, kit, snapshot);
  }

  async changeDays(kitId: string, userId: string, newDays: number, expectedVersion: number): Promise<boolean> {
    const model = await this.kitsRepo.findById(kitId, userId);
    if (!model) return false;

    const kit = model.kit;
    kit.days_available = newDays;
    kit.schedule = allocateSchedule(kit.questions, kit.role.requirements, newDays);

    return this.kitsRepo.updateWithVersion(kitId, userId, expectedVersion, kit);
  }
}
