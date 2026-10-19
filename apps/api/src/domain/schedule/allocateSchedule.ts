import { Question, Requirement, ScheduleDay } from "../kit/schema.js";
import { generateFocusLabel } from "./focusLabel.js";
import { estimateQuestionMinutes, scoreQuestion } from "./weights.js";

function calculateDayMinutes(questions: Question[]): number {
  if (questions.length === 0) return 0;
  const questionMinutes = questions.reduce((acc, q) => acc + estimateQuestionMinutes(q.difficulty), 0);
  const total = questionMinutes + 10;
  return Math.ceil(total / 5) * 5;
}

function distributeLearnQuestions(questions: Question[], learnCount: number): Question[][] {
  const buckets: Question[][] = Array.from({ length: learnCount }, () => []);
  if (questions.length === 0 || learnCount === 0) return buckets;

  const totalMinutes = questions.reduce((acc, q) => acc + estimateQuestionMinutes(q.difficulty), 0);
  const targetMinutes = totalMinutes / learnCount;

  let qIdx = 0;
  for (let d = 0; d < learnCount; d++) {
    buckets[d].push(questions[qIdx++]);
    let currentMinutes = estimateQuestionMinutes(buckets[d][0].difficulty);

    const remainingDaysAfterThis = learnCount - 1 - d;
    while (qIdx < questions.length) {
      const remainingQuestions = questions.length - qIdx;
      if (remainingQuestions <= remainingDaysAfterThis) break;

      const nextMinutes = estimateQuestionMinutes(questions[qIdx].difficulty);
      if (currentMinutes + nextMinutes > targetMinutes && currentMinutes >= targetMinutes) {
        break;
      }
      buckets[d].push(questions[qIdx++]);
      currentMinutes += nextMinutes;
    }
  }

  while (qIdx < questions.length) {
    buckets[learnCount - 1].push(questions[qIdx++]);
  }

  return buckets;
}

function getReviewQuestions(questions: Question[], reviewDayIndex: number, reviewDaysCount: number): Question[] {
  if (questions.length === 0) return [];
  const topQuestions = questions.slice(0, Math.min(questions.length, 10));
  const isLastReviewDay = reviewDayIndex === reviewDaysCount - 1;
  if (isLastReviewDay) {
    return topQuestions;
  }
  const chunkSize = Math.max(1, Math.floor(topQuestions.length / reviewDaysCount));
  const start = (reviewDayIndex * chunkSize) % topQuestions.length;
  return topQuestions.slice(start, start + chunkSize);
}

export function allocateSchedule(
  questions: Question[],
  requirements: Requirement[],
  daysAvailable: number
): { days: ScheduleDay[] } {
  const reqMap = new Map<string, Requirement>(requirements.map((r) => [r.id, r]));

  const sortedQuestions = [...questions].sort((a, b) => {
    const scoreDiff = scoreQuestion(b, reqMap) - scoreQuestion(a, reqMap);
    if (scoreDiff !== 0) return scoreDiff;
    return a.id.localeCompare(b.id);
  });

  let reviewCount = daysAvailable <= 2 ? 0 : Math.max(1, Math.floor(daysAvailable * 0.25));
  let learnCount = daysAvailable - reviewCount;

  if (sortedQuestions.length < learnCount) {
    learnCount = sortedQuestions.length;
    reviewCount = daysAvailable - learnCount;
  }

  const learnBuckets = distributeLearnQuestions(sortedQuestions, learnCount);
  const days: ScheduleDay[] = [];

  for (let i = 0; i < learnCount; i++) {
    const dayQuestions = learnBuckets[i];
    days.push({
      day: i + 1,
      phase: "learn",
      focus: generateFocusLabel(dayQuestions, reqMap, "learn"),
      minutes: calculateDayMinutes(dayQuestions),
      question_ids: dayQuestions.map((q) => q.id)
    });
  }

  for (let j = 0; j < reviewCount; j++) {
    const reviewQuestions = getReviewQuestions(sortedQuestions, j, reviewCount);
    days.push({
      day: learnCount + j + 1,
      phase: "review",
      focus: generateFocusLabel(reviewQuestions, reqMap, "review"),
      minutes: calculateDayMinutes(reviewQuestions),
      question_ids: reviewQuestions.map((q) => q.id)
    });
  }

  return { days };
}
