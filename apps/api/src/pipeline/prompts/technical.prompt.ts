import { z } from "zod";
import { Requirement } from "../../domain/kit/schema.js";

export const generatedQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      guidance: z.string().min(1),
      difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      requirement_ids: z.array(z.string().min(1))
    })
  )
});

export type GeneratedQuestionsOutput = z.infer<typeof generatedQuestionsOutputSchema>;

export function buildTechnicalPrompt(requirements: Requirement[], existingQuestions: string[] = []): string {
  const reqList = requirements.map((r) => `- [${r.id}] ${r.text} (priority: ${r.priority})`).join("\n");
  const existingSection = existingQuestions.length > 0
    ? `\nExisting questions to NOT duplicate:\n${existingQuestions.map((q) => `- ${q}`).join("\n")}`
    : "";

  return [
    "You are an expert technical interviewer. Generate targeted technical interview questions directly testing these requirements.",
    "Every question must reference at least one requirement id in 'requirement_ids'.",
    "Include an insightful, practical answer outline / guidance for evaluation.",
    "Assign difficulty: 1 (fundamental/warmup), 2 (mid-level practical), or 3 (advanced architectural/edge cases).",
    existingSection,
    "\nTarget Requirements:\n",
    reqList,
    "\nReturn strictly valid JSON matching:",
    '{"questions": [{"question": "...", "guidance": "...", "difficulty": 1|2|3, "requirement_ids": ["..."]}]}'
  ].join("\n");
}
