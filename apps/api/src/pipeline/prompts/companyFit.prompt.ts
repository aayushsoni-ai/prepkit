import { Requirement } from "../../domain/kit/schema.js";

export function buildCompanyFitPrompt(requirements: Requirement[], existingQuestions: string[] = []): string {
  const reqList = requirements.map((r) => `- [${r.id}] ${r.text} (priority: ${r.priority})`).join("\n");
  const existingSection = existingQuestions.length > 0
    ? `\nExisting questions to NOT duplicate:\n${existingQuestions.map((q) => `- ${q}`).join("\n")}`
    : "";

  return [
    "You are evaluating company fit, product vision, and mission alignment.",
    "Generate thoughtful interview questions that evaluate candidate motivation, domain knowledge, and philosophical alignment with company values.",
    "Every question must reference at least one requirement id in 'requirement_ids'.",
    "Provide evaluation guidance detailing authentic vs superficial responses.",
    "Assign difficulty: 1 (basic motivation), 2 (deep culture scenario), or 3 (complex ethics/strategic alignment).",
    existingSection,
    "\nTarget Requirements:\n",
    reqList,
    "\nReturn strictly valid JSON matching:",
    '{"questions": [{"question": "...", "guidance": "...", "difficulty": 1|2|3, "requirement_ids": ["..."]}]}'
  ].join("\n");
}
