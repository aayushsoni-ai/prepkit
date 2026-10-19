import { z } from "zod";
import { Requirement } from "../../domain/kit/schema.js";

export const flashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1),
      requirement_ids: z.array(z.string().min(1))
    })
  )
});

export type FlashcardsOutput = z.infer<typeof flashcardsOutputSchema>;

export function buildFlashcardsPrompt(requirements: Requirement[]): string {
  const reqList = requirements.map((r) => `- [${r.id}] ${r.text}`).join("\n");

  return [
    "Generate concise, high-impact active recall flashcards for an engineer preparing for this interview.",
    "Front should be a sharp technical question, concept prompt, or scenario.",
    "Back should be the clear, punchy answer or mental model (1 to 3 sentences maximum).",
    "Every flashcard must reference at least one valid requirement id in 'requirement_ids'.",
    "\nRequirements:\n",
    reqList,
    "\nReturn JSON matching:",
    '{"flashcards": [{"front": "...", "back": "...", "requirement_ids": ["..."]}]}'
  ].join("\n");
}
