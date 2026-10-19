import { Question, Requirement } from "../kit/schema.js";

export function getPriorityWeight(question: Question, requirementsMap: Map<string, Requirement>): number {
  let hasMust = false;
  let hasNice = false;

  for (const reqId of question.requirement_ids) {
    const req = requirementsMap.get(reqId);
    if (!req) continue;
    if (req.priority === "must") {
      hasMust = true;
      break;
    }
    if (req.priority === "nice") {
      hasNice = true;
    }
  }

  if (hasMust) return 30;
  if (hasNice) return 10;
  return 10;
}

export function scoreQuestion(question: Question, requirementsMap: Map<string, Requirement>): number {
  const priorityWeight = getPriorityWeight(question, requirementsMap);
  let score = priorityWeight + question.difficulty * 3;
  if (question.category === "system-design") {
    score += 2;
  }
  return score;
}

export function estimateQuestionMinutes(difficulty: 1 | 2 | 3): number {
  if (difficulty === 1) return 10;
  if (difficulty === 2) return 15;
  return 25;
}
