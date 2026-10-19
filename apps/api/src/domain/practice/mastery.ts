import { Flashcard, Requirement } from "../kit/schema.js";
import { CardPracticeRecord } from "./buildQueue.js";

export interface RequirementMastery {
  requirement_id: string;
  text: string;
  priority: "must" | "nice";
  category: "technical" | "behavioural" | "system-design" | "company-fit";
  cards_count: number;
  practiced_cards_count: number;
  average_confidence: number;
  status: "untouched" | "needs-work" | "mastered";
}

export interface WeakSpotsReport {
  requirements: RequirementMastery[];
  untouched_count: number;
  needs_work_count: number;
  mastered_count: number;
  weakest_requirement_ids: string[];
}

export function calculateRequirementMastery(
  requirements: Requirement[],
  cards: Flashcard[],
  historyMap: Map<string, CardPracticeRecord>
): WeakSpotsReport {
  const reqCardsMap = new Map<string, Flashcard[]>();
  for (const card of cards) {
    for (const reqId of card.requirement_ids) {
      const existing = reqCardsMap.get(reqId) ?? [];
      existing.push(card);
      reqCardsMap.set(reqId, existing);
    }
  }

  const list: RequirementMastery[] = [];

  for (const req of requirements) {
    const linkedCards = reqCardsMap.get(req.id) ?? [];
    let sumConfidence = 0;
    let practicedCount = 0;

    for (const card of linkedCards) {
      const record = historyMap.get(card.id);
      if (record && record.practice_count > 0) {
        practicedCount++;
        sumConfidence += record.last_confidence;
      }
    }

    const avg = practicedCount > 0 ? Number((sumConfidence / practicedCount).toFixed(1)) : 0;
    let status: "untouched" | "needs-work" | "mastered" = "untouched";
    if (practicedCount > 0) {
      status = avg >= 3.5 ? "mastered" : "needs-work";
    }

    list.push({
      requirement_id: req.id,
      text: req.text,
      priority: req.priority,
      category: req.category,
      cards_count: linkedCards.length,
      practiced_cards_count: practicedCount,
      average_confidence: avg,
      status
    });
  }

  list.sort((a, b) => {
    if (a.priority === "must" && b.priority !== "must") return -1;
    if (a.priority !== "must" && b.priority === "must") return 1;
    return a.average_confidence - b.average_confidence;
  });

  const untouchedCount = list.filter((r) => r.status === "untouched").length;
  const needsWorkCount = list.filter((r) => r.status === "needs-work").length;
  const masteredCount = list.filter((r) => r.status === "mastered").length;

  const weakestRequirementIds = list
    .filter((r) => r.status !== "mastered")
    .map((r) => r.requirement_id);

  return {
    requirements: list,
    untouched_count: untouchedCount,
    needs_work_count: needsWorkCount,
    mastered_count: masteredCount,
    weakest_requirement_ids: weakestRequirementIds
  };
}
