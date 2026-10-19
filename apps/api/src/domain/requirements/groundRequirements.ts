import { Requirement } from "../kit/schema.js";
import { inferPriority } from "./inferPriority.js";
import { routeCategory } from "./routeCategory.js";

export interface CandidateRequirement {
  id: string;
  text: string;
  evidence: string;
  priority?: "must" | "nice";
  category?: "technical" | "behavioural" | "system-design" | "company-fit";
}

function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim().toLowerCase();
}

export function isEvidenceGrounded(evidence: string, jobDescription: string): boolean {
  if (!evidence || evidence.trim().length === 0) {
    return false;
  }
  const cleanEvidence = normalizeWhitespace(evidence);
  const cleanJd = normalizeWhitespace(jobDescription);
  return cleanJd.includes(cleanEvidence);
}

export function groundRequirements(
  candidates: CandidateRequirement[],
  jobDescription: string,
  hiringStages: string[] = []
): Requirement[] {
  const grounded: Requirement[] = [];

  for (const candidate of candidates) {
    if (!isEvidenceGrounded(candidate.evidence, jobDescription)) {
      continue;
    }

    const priority = inferPriority(candidate.text, candidate.evidence);
    const category = candidate.category && ["technical", "behavioural", "system-design", "company-fit"].includes(candidate.category)
      ? candidate.category
      : routeCategory(candidate.text, hiringStages);

    grounded.push({
      id: candidate.id,
      text: candidate.text.trim(),
      evidence: candidate.evidence.trim(),
      priority,
      category
    });
  }

  return grounded;
}
