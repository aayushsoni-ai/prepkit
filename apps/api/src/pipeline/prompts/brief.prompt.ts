import { z } from "zod";
import { wrapUntrustedText } from "../../llm/untrusted.js";

export const briefOutputSchema = z.object({
  summary: z.string(),
  what_company_does: z.string(),
  culture: z.string()
});

export type BriefOutput = z.infer<typeof briefOutputSchema>;

export function buildBriefPrompt(pagesContent: string, companyName: string): { prompt: string; systemInstruction: string } {
  if (!pagesContent || pagesContent.trim().length === 0) {
    return {
      prompt: "EMPTY",
      systemInstruction: ""
    };
  }

  const { wrappedText, systemInstruction } = wrapUntrustedText(pagesContent);

  const prompt = [
    `Synthesize a concise company briefing for ${companyName} strictly using the provided scraped website text.`,
    "Detail: 1) Executive summary, 2) Exactly what product/service the company builds and who their customers are, 3) Company values and work culture.",
    "If the text does not contain this information, state that it was not found. Do NOT invent company facts.",
    "Return JSON matching: {\"summary\": \"...\", \"what_company_does\": \"...\", \"culture\": \"...\"}",
    "\nScraped text:",
    wrappedText
  ].join("\n");

  return { prompt, systemInstruction };
}
