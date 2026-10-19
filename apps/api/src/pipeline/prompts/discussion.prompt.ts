import { z } from "zod";
import { wrapUntrustedText } from "../../llm/untrusted.js";

export const discussionOutputSchema = z.object({
  summary: z.string(),
  key_takeaways: z.array(z.string())
});

export type DiscussionOutput = z.infer<typeof discussionOutputSchema>;

export function buildDiscussionPrompt(discussionSnippets: string): { prompt: string; systemInstruction: string } {
  const { wrappedText, systemInstruction } = wrapUntrustedText(discussionSnippets);

  const prompt = [
    "Summarize the public discussion threads concerning interviews and culture for this company.",
    "Highlight real candidate experiences, common themes, and interview tips.",
    "If the discussion text contains no useful signals, return 'No substantial public interview discussions found.'",
    "Return JSON matching: {\"summary\": \"...\", \"key_takeaways\": [\"...\"]}",
    "\nDiscussion data:",
    wrappedText
  ].join("\n");

  return { prompt, systemInstruction };
}
