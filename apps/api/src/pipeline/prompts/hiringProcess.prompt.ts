import { z } from "zod";
import { wrapUntrustedText } from "../../llm/untrusted.js";

export const hiringProcessOutputSchema = z.object({
  stages: z.array(z.string())
});

export type HiringProcessOutput = z.infer<typeof hiringProcessOutputSchema>;

export function buildHiringProcessPrompt(hiringPagesContent: string): { prompt: string; systemInstruction: string } {
  const { wrappedText, systemInstruction } = wrapUntrustedText(hiringPagesContent);

  const prompt = [
    "Read the following company hiring/careers pages and identify the specific interview stages (e.g. Recruiter Screen, Technical Coding, Take-Home Project, System Design, Team Fit).",
    "If no interview process or stages are stated in the text, return an empty array for 'stages'. Do NOT invent stages.",
    "Return JSON format: {\"stages\": [\"Stage 1\", \"Stage 2\"]}",
    "\nPage content:",
    wrappedText
  ].join("\n");

  return { prompt, systemInstruction };
}
