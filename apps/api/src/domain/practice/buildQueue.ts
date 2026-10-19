import { Flashcard, Requirement } from "../kit/schema.js";

export interface CardPracticeRecord {
  card_id: string;
  last_confidence: number;
  last_practiced_at: string;
  practice_count: number;
}

export function buildPracticeQueue(
  cards: Flashcard[],
  historyMap: Map<string, CardPracticeRecord>,
  requirements: Requirement[],
  limit = 10,
  filterRequirementIds?: string[]
): Flashcard[] {
  const reqMap = new Map<string, Requirement>(requirements.map((r) => [r.id, r]));

  let candidateCards = cards;
  if (filterRequirementIds && filterRequirementIds.length > 0) {
    const filterSet = new Set(filterRequirementIds);
    candidateCards = cards.filter((card) =>
      card.requirement_ids.some((reqId) => filterSet.has(reqId))
    );
  }

  const sorted = [...candidateCards].sort((a, b) => {
    const aRecord = historyMap.get(a.id);
    const bRecord = historyMap.get(b.id);

    const aConfidence = aRecord ? aRecord.last_confidence : 0;
    const bConfidence = bRecord ? bRecord.last_confidence : 0;

    if (aConfidence !== bConfidence) {
      return aConfidence - bConfidence;
    }

    const aTime = aRecord ? new Date(aRecord.last_practiced_at).getTime() : 0;
    const bTime = bRecord ? new Date(bRecord.last_practiced_at).getTime() : 0;
    if (aTime !== bTime) {
      return aTime - bTime;
    }

    const aHasMust = a.requirement_ids.some((id) => reqMap.get(id)?.priority === "must");
    const bHasMust = b.requirement_ids.some((id) => reqMap.get(id)?.priority === "must");
    if (aHasMust && !bHasMust) return -1;
    if (!aHasMust && bHasMust) return 1;

    return a.id.localeCompare(b.id);
  });

  return sorted.slice(0, limit);
}
