import { createQuestionId } from "../kit/ids.js";
import { Question, Requirement } from "../kit/schema.js";

export function createFallbackQuestion(requirement: Requirement): Question {
  return {
    id: createQuestionId(),
    category: requirement.category,
    question: `How have you applied ${requirement.text} in previous projects, and what trade-offs or challenges did you address?`,
    guidance: `Provide concrete examples demonstrating your hands-on experience with ${requirement.text}, including implementation details and measurable outcomes.`,
    difficulty: 2,
    requirement_ids: [requirement.id],
    origin: "generated",
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };
}

export function generateFallbackQuestions(uncoveredRequirements: Requirement[]): Question[] {
  return uncoveredRequirements.map((req) => createFallbackQuestion(req));
}
