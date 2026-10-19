import { Kit } from "./schema.js";

export interface InvariantResult {
  valid: boolean;
  errors: string[];
}

export function validateKitInvariants(kit: Kit): InvariantResult {
  const errors: string[] = [];
  const reqIdSet = new Set<string>();

  for (const req of kit.role.requirements) {
    if (reqIdSet.has(req.id)) {
      errors.push(`Duplicate requirement id: ${req.id}`);
    }
    reqIdSet.add(req.id);
  }

  const questionIdSet = new Set<string>();
  for (const q of kit.questions) {
    if (questionIdSet.has(q.id)) {
      errors.push(`Duplicate question id: ${q.id}`);
    }
    questionIdSet.add(q.id);

    if (![1, 2, 3].includes(q.difficulty)) {
      errors.push(`Question ${q.id} has invalid difficulty: ${q.difficulty}`);
    }

    for (const reqId of q.requirement_ids) {
      if (!reqIdSet.has(reqId)) {
        errors.push(`Question ${q.id} references non-existent requirement: ${reqId}`);
      }
    }
  }

  const flashcardIdSet = new Set<string>();
  for (const card of kit.flashcards) {
    if (flashcardIdSet.has(card.id)) {
      errors.push(`Duplicate flashcard id: ${card.id}`);
    }
    flashcardIdSet.add(card.id);

    for (const reqId of card.requirement_ids) {
      if (!reqIdSet.has(reqId)) {
        errors.push(`Flashcard ${card.id} references non-existent requirement: ${reqId}`);
      }
    }
  }

  if (kit.schedule.days.length !== kit.days_available) {
    errors.push(`Schedule days length ${kit.schedule.days.length} does not match days_available ${kit.days_available}`);
  }

  for (let i = 0; i < kit.schedule.days.length; i++) {
    const day = kit.schedule.days[i];
    if (day.day !== i + 1) {
      errors.push(`Schedule day index mismatch: expected ${i + 1}, got ${day.day}`);
    }
    if (!Number.isInteger(day.minutes) || day.minutes < 0) {
      errors.push(`Day ${day.day} minutes must be a non-negative integer`);
    }
    for (const qId of day.question_ids) {
      if (!questionIdSet.has(qId)) {
        errors.push(`Day ${day.day} references non-existent question: ${qId}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function assertKitInvariants(kit: Kit): void {
  const result = validateKitInvariants(kit);
  if (!result.valid) {
    throw new Error(`Kit invariants violation: ${result.errors.join("; ")}`);
  }
}
