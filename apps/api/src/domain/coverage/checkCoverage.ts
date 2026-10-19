import { Coverage, Question, Requirement } from "../kit/schema.js";

export interface CoverageReport {
  coverage: Coverage;
  uncoveredMustHaves: Requirement[];
  uncoveredNiceToHaves: Requirement[];
}

export function checkCoverage(
  requirements: Requirement[],
  questions: Question[],
  passes = 1
): CoverageReport {
  const coveredReqIds = new Set<string>();

  for (const q of questions) {
    for (const reqId of q.requirement_ids) {
      coveredReqIds.add(reqId);
    }
  }

  let mustTotal = 0;
  let mustCovered = 0;
  let niceTotal = 0;
  let niceCovered = 0;

  const uncoveredMustHaves: Requirement[] = [];
  const uncoveredNiceToHaves: Requirement[] = [];
  const uncoveredIds: string[] = [];

  for (const req of requirements) {
    const isCovered = coveredReqIds.has(req.id);
    if (req.priority === "must") {
      mustTotal++;
      if (isCovered) {
        mustCovered++;
      } else {
        uncoveredMustHaves.push(req);
        uncoveredIds.push(req.id);
      }
    } else {
      niceTotal++;
      if (isCovered) {
        niceCovered++;
      } else {
        uncoveredNiceToHaves.push(req);
        uncoveredIds.push(req.id);
      }
    }
  }

  const coverage: Coverage = {
    passes,
    must_have_total: mustTotal,
    must_have_covered: mustCovered,
    nice_to_have_total: niceTotal,
    nice_to_have_covered: niceCovered,
    uncovered_requirement_ids: uncoveredIds
  };

  return {
    coverage,
    uncoveredMustHaves,
    uncoveredNiceToHaves
  };
}
