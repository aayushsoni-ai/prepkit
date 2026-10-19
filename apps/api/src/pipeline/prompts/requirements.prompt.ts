import { z } from "zod";
import { wrapUntrustedText } from "../../llm/untrusted.js";

export const rawRequirementsOutputSchema = z.object({
  company_name: z.string().default("Unknown Company"),
  role_title: z.string().default("Software Engineer"),
  role_level: z.string().default("mid"),
  requirements: z.array(
    z.object({
      text: z.string().min(1),
      evidence: z.string().min(1)
    })
  )
});

export type RawRequirementsOutput = z.infer<typeof rawRequirementsOutputSchema>;

export function buildRequirementsPrompt(rawJd: string): { prompt: string; systemInstruction: string } {
  const { wrappedText, systemInstruction } = wrapUntrustedText(rawJd);

  const prompt = [
    "Analyze the following job description and extract the role title, inferred company name, role level, and explicit requirements.",
    "For EVERY requirement, you MUST provide the exact verbatim sentence from the text as 'evidence'. Do NOT paraphrase or invent evidence.",
    "Return JSON matching:",
    '{"company_name": "...", "role_title": "...", "role_level": "junior|mid|senior|staff|lead", "requirements": [{"text": "...", "evidence": "..."}]}',
    "\nJob description:",
    wrappedText
  ].join("\n");

  return { prompt, systemInstruction };
}
