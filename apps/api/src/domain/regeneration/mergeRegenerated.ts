import { Category, Flashcard, Question } from "../kit/schema.js";
import { isItemProtected } from "./itemState.js";

export function mergeRegeneratedQuestions(
  currentQuestions: Question[],
  targetCategory: Category,
  incomingQuestions: Question[]
): Question[] {
  const result: Question[] = [];
  const incomingQueue = [...incomingQuestions];

  for (const current of currentQuestions) {
    if (current.category !== targetCategory) {
      result.push(current);
      continue;
    }

    if (isItemProtected(current)) {
      result.push(current);
      continue;
    }

    if (incomingQueue.length > 0) {
      result.push(incomingQueue.shift()!);
    }
  }

  while (incomingQueue.length > 0) {
    result.push(incomingQueue.shift()!);
  }

  return result;
}

export function mergeRegeneratedFlashcards(
  currentCards: Flashcard[],
  incomingCards: Flashcard[]
): Flashcard[] {
  const result: Flashcard[] = [];
  const incomingQueue = [...incomingCards];

  for (const current of currentCards) {
    if (isItemProtected(current)) {
      result.push(current);
      continue;
    }

    if (incomingQueue.length > 0) {
      result.push(incomingQueue.shift()!);
    }
  }

  while (incomingQueue.length > 0) {
    result.push(incomingQueue.shift()!);
  }

  return result;
}
