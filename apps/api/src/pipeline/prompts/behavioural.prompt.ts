import { Requirement } from "../../domain/kit/schema.js";

export function buildBehaviouralPrompt(requirements: Requirement[], existingQuestions: string[] = []): string {
  const reqList = requirements.map((r) => `- [${r.id}] ${r.text} (priority: ${r.priority})`).join("\n");
  const existingSection = existingQuestions.length > 0
    ? `\nExisting questions to NOT duplicate:\n${existingQuestions.map((q) => `- ${q}`).join("\n")}`
    : "";

  return [
    "You are an executive engineering manager. Generate behavioral and situational interview questions testing collaboration, leadership, and conflict resolution using the STAR method.",
    "Every question must reference at least one requirement id in 'requirement_ids'.",
    "Provide evaluation guidance detailing strong vs weak signals for the response.",
    "Assign difficulty: 1 (straightforward scenario), 2 (nuanced situational trade-off), or 3 (high-stakes leadership/adversity).",
    existingSection,
    "\nTarget Requirements:\n",
    reqList,
    "\nReturn strictly valid JSON matching:",
    '{"questions": [{"question": "...", "guidance": "...", "difficulty": 1|2|3, "requirement_ids": ["..."]}]}'
  ].join("\n");
}
