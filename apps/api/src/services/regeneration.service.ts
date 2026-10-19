import { createQuestionId } from "../domain/kit/ids.js";
import { Category, Kit, Question } from "../domain/kit/schema.js";
import { countKeptAndReplaced } from "../domain/regeneration/itemState.js";
import { mergeRegeneratedQuestions } from "../domain/regeneration/mergeRegenerated.js";
import { allocateSchedule } from "../domain/schedule/allocateSchedule.js";
import { GroqLlmClient } from "../llm/groq.js";
import { KitsRepository } from "../persistence/repositories/kits.repo.js";
import { buildTechnicalPrompt, generatedQuestionsOutputSchema } from "../pipeline/prompts/technical.prompt.js";
import { getEnv } from "../config/env.js";

export class RegenerationService {
  private readonly kitsRepo = new KitsRepository();

  async getPreview(kitId: string, userId: string, category: Category): Promise<{ kept: number; replaced: number }> {
    const model = await this.kitsRepo.findById(kitId, userId);
    if (!model) return { kept: 0, replaced: 0 };
    const categoryQuestions = model.kit.questions.filter((q) => q.category === category);
    return countKeptAndReplaced(categoryQuestions);
  }

  async regenerateCategory(kitId: string, userId: string, category: Category, expectedVersion: number): Promise<Kit | null> {
    const initial = await this.kitsRepo.findById(kitId, userId);
    if (!initial) return null;

    const snapshot = JSON.parse(JSON.stringify(initial.kit)) as Kit;
    const catReqs = initial.kit.role.requirements.filter((r) => r.category === category);
    const keptTitles = initial.kit.questions.filter((q) => q.category === category && q.edited).map((q) => q.question);

    const prompt = buildTechnicalPrompt(catReqs, keptTitles);
    const env = getEnv();
    const llm = new GroqLlmClient({
      apiKey: env.GROQ_API_KEY || "dummy",
      heavyModel: env.GROQ_MODEL_HEAVY,
      lightModel: env.GROQ_MODEL_LIGHT
    });

    let newQuestions: Question[] = [];
    try {
      const generated = await llm.generateJson(generatedQuestionsOutputSchema, prompt, { modelTier: "heavy" });
      newQuestions = generated.questions.map((q) => ({
        id: createQuestionId(),
        category,
        question: q.question,
        guidance: q.guidance,
        difficulty: q.difficulty,
        requirement_ids: q.requirement_ids.length > 0 ? q.requirement_ids : (catReqs[0] ? [catReqs[0].id] : []),
        origin: "generated" as const,
        edited: false,
        pinned: false,
        updatedAt: new Date().toISOString()
      }));
    } catch {
      newQuestions = catReqs.map((r) => ({
        id: createQuestionId(),
        category,
        question: `Explain your experience with ${r.text}`,
        guidance: "Provide concrete examples.",
        difficulty: 2 as const,
        requirement_ids: [r.id],
        origin: "generated" as const,
        edited: false,
        pinned: false,
        updatedAt: new Date().toISOString()
      }));
    }

    const latest = await this.kitsRepo.findById(kitId, userId);
    if (!latest) return null;

    const merged = mergeRegeneratedQuestions(latest.kit.questions, category, newQuestions);
    const updatedKit = { ...latest.kit, questions: merged };

    const success = await this.kitsRepo.updateWithVersion(kitId, userId, latest.kit.version, updatedKit, snapshot);
    return success ? updatedKit : null;
  }

  async regenerateSchedule(kitId: string, userId: string, expectedVersion: number): Promise<Kit | null> {
    const latest = await this.kitsRepo.findById(kitId, userId);
    if (!latest) return null;

    const snapshot = JSON.parse(JSON.stringify(latest.kit)) as Kit;
    const updatedSchedule = allocateSchedule(latest.kit.questions, latest.kit.role.requirements, latest.kit.days_available);
    const updatedKit = { ...latest.kit, schedule: updatedSchedule };

    const success = await this.kitsRepo.updateWithVersion(kitId, userId, latest.kit.version, updatedKit, snapshot);
    return success ? updatedKit : null;
  }

  async undo(kitId: string, userId: string): Promise<Kit | null> {
    const restored = await this.kitsRepo.restoreSnapshot(kitId, userId);
    return restored ? restored.kit : null;
  }
}
