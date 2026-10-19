import { Category, Question, Requirement } from "../kit/schema.js";

function formatCategory(category: Category): string {
  if (category === "system-design") return "System Design";
  if (category === "company-fit") return "Company Fit";
  if (category === "behavioural") return "Behavioural";
  return "Technical";
}

export function generateFocusLabel(
  dayQuestions: Question[],
  requirementsMap: Map<string, Requirement>,
  phase: "learn" | "review"
): string {
  if (dayQuestions.length === 0) {
    return "Nothing to schedule";
  }

  const categoryCounts = new Map<Category, number>();
  const reqCounts = new Map<string, number>();

  for (const q of dayQuestions) {
    categoryCounts.set(q.category, (categoryCounts.get(q.category) ?? 0) + 1);
    for (const reqId of q.requirement_ids) {
      reqCounts.set(reqId, (reqCounts.get(reqId) ?? 0) + 1);
    }
  }

  let dominantCategory: Category = dayQuestions[0].category;
  let maxCatCount = 0;
  for (const [cat, count] of categoryCounts.entries()) {
    if (count > maxCatCount) {
      dominantCategory = cat;
      maxCatCount = count;
    }
  }

  let dominantReqText = "";
  let maxReqCount = 0;
  for (const [reqId, count] of reqCounts.entries()) {
    if (count > maxReqCount) {
      const req = requirementsMap.get(reqId);
      if (req) {
        dominantReqText = req.text;
        maxReqCount = count;
      }
    }
  }

  const catLabel = formatCategory(dominantCategory);
  const prefix = phase === "review" ? "Review & Mastery" : catLabel;

  if (dominantReqText) {
    const truncatedReq = dominantReqText.length > 40
      ? `${dominantReqText.slice(0, 37)}...`
      : dominantReqText;
    return `${prefix}: ${truncatedReq}`;
  }

  return `${catLabel} Foundations`;
}
