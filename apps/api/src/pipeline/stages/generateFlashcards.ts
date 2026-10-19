import { createFlashcardId } from "../../domain/kit/ids.js";
import { Flashcard } from "../../domain/kit/schema.js";
import { PipelineContext } from "../context.js";
import { buildFlashcardsPrompt, flashcardsOutputSchema } from "../prompts/flashcards.prompt.js";

export async function runGenerateFlashcardsStage(ctx: PipelineContext): Promise<Flashcard[]> {
  const reqs = ctx.groundedRequirements;
  if (reqs.length === 0) {
    ctx.flashcards = [];
    ctx.checkpoint("generate_flashcards", []);
    return [];
  }

  if (ctx.isBudgetExceeded()) {
    ctx.flashcards = [];
    ctx.checkpoint("generate_flashcards", { skipped: true, reason: "budget_exceeded" });
    return [];
  }

  const prompt = buildFlashcardsPrompt(reqs);
  const result = await ctx.options.llm.generateJson(flashcardsOutputSchema, prompt, {
    modelTier: "light"
  });

  const validReqIds = new Set(reqs.map((r) => r.id));
  const fallbackReqId = reqs[0].id;

  const cards: Flashcard[] = result.flashcards.map((fc) => {
    const matched = fc.requirement_ids.filter((id) => validReqIds.has(id));
    return {
      id: createFlashcardId(),
      front: fc.front,
      back: fc.back,
      requirement_ids: matched.length > 0 ? matched : [fallbackReqId],
      origin: "generated",
      edited: false,
      pinned: false,
      updatedAt: new Date().toISOString()
    };
  });

  ctx.flashcards = cards;
  ctx.checkpoint("generate_flashcards", { count: cards.length });
  return cards;
}
