import { checkCoverage } from "../../domain/coverage/checkCoverage.js";
import { createFallbackQuestion } from "../../domain/coverage/fallbackQuestions.js";
import { createQuestionId } from "../../domain/kit/ids.js";
import { Category, Question, Requirement } from "../../domain/kit/schema.js";
import { PipelineContext } from "../context.js";
import { buildBehaviouralPrompt } from "../prompts/behavioural.prompt.js";
import { buildCompanyFitPrompt } from "../prompts/companyFit.prompt.js";
import { buildSystemDesignPrompt } from "../prompts/systemDesign.prompt.js";
import { buildTechnicalPrompt, generatedQuestionsOutputSchema } from "../prompts/technical.prompt.js";

function getPromptForCategory(category: Category, reqs: Requirement[], existing: string[] = []): string {
  if (category === "behavioural") return buildBehaviouralPrompt(reqs, existing);
  if (category === "system-design") return buildSystemDesignPrompt(reqs, existing);
  if (category === "company-fit") return buildCompanyFitPrompt(reqs, existing);
  return buildTechnicalPrompt(reqs, existing);
}

async function callCategoryPrompt(ctx: PipelineContext, category: Category, reqs: Requirement[]): Promise<Question[]> {
  const prompt = getPromptForCategory(category, reqs);
  const result = await ctx.options.llm.generateJson(generatedQuestionsOutputSchema, prompt, { modelTier: "heavy" });

  const validReqIdSet = new Set(reqs.map((r) => r.id));
  const fallbackReqId = reqs[0]?.id;

  return result.questions.map((q) => {
    const matchedIds = q.requirement_ids.filter((id) => validReqIdSet.has(id));
    return {
      id: createQuestionId(),
      category,
      question: q.question,
      guidance: q.guidance,
      difficulty: q.difficulty,
      requirement_ids: matchedIds.length > 0 ? matchedIds : (fallbackReqId ? [fallbackReqId] : []),
      origin: "generated" as const,
      edited: false,
      pinned: false,
      updatedAt: new Date().toISOString()
    };
  });
}

export async function runGenerateQuestionsStage(ctx: PipelineContext): Promise<Question[]> {
  const reqs = ctx.groundedRequirements;
  if (reqs.length === 0) {
    ctx.questions = [];
    ctx.coverage = checkCoverage([], [], 1).coverage;
    return [];
  }

  const categoryBuckets = new Map<Category, Requirement[]>();
  for (const req of reqs) {
    const list = categoryBuckets.get(req.category) ?? [];
    list.push(req);
    categoryBuckets.set(req.category, list);
  }

  let questions: Question[] = [];
  for (const [category, catReqs] of categoryBuckets.entries()) {
    const generated = await callCategoryPrompt(ctx, category, catReqs);
    questions.push(...generated);
  }

  let passes = 1;
  let report = checkCoverage(reqs, questions, passes);

  while (report.uncoveredMustHaves.length > 0 && passes < 3) {
    passes++;
    const gapBuckets = new Map<Category, Requirement[]>();
    for (const req of report.uncoveredMustHaves) {
      const list = gapBuckets.get(req.category) ?? [];
      list.push(req);
      gapBuckets.set(req.category, list);
    }

    for (const [category, gapReqs] of gapBuckets.entries()) {
      const repaired = await callCategoryPrompt(ctx, category, gapReqs);
      questions.push(...repaired);
    }

    report = checkCoverage(reqs, questions, passes);
  }

  if (report.uncoveredMustHaves.length > 0) {
    for (const req of report.uncoveredMustHaves) {
      questions.push(createFallbackQuestion(req));
    }
    report = checkCoverage(reqs, questions, passes);
  }

  ctx.questions = questions;
  ctx.coverage = report.coverage;
  ctx.checkpoint("generate_questions", { count: questions.length, passes, coveredMust: report.coverage.must_have_covered });
  return questions;
}
