import { Requirement } from "../../domain/kit/schema.js";

export function buildSystemDesignPrompt(requirements: Requirement[], existingQuestions: string[] = []): string {
  const reqList = requirements.map((r) => `- [${r.id}] ${r.text} (priority: ${r.priority})`).join("\n");
  const existingSection = existingQuestions.length > 0
    ? `\nExisting questions to NOT duplicate:\n${existingQuestions.map((q) => `- ${q}`).join("\n")}`
    : "";

  return [
    "You are a Principal Distributed Systems Architect. Generate rigorous system design and architecture interview problems testing scalability, data modeling, reliability, and trade-offs.",
    "Every question must reference at least one requirement id in 'requirement_ids'.",
    "Provide evaluation guidance detailing bottleneck identification, CAP theorem considerations, and concrete architectural choices.",
    "Assign difficulty: 1 (basic component design), 2 (distributed scaling challenge), or 3 (complex failure modes and state synchronization).",
    existingSection,
    "\nTarget Requirements:\n",
    reqList,
    "\nReturn strictly valid JSON matching:",
    '{"questions": [{"question": "...", "guidance": "...", "difficulty": 1|2|3, "requirement_ids": ["..."]}]}'
  ].join("\n");
}
