export type PipelineStageName =
  | "validate_input"
  | "extract_requirements"
  | "crawl_company"
  | "find_hiring_process"
  | "search_discussion"
  | "build_brief"
  | "generate_questions"
  | "generate_flashcards"
  | "assemble_kit";

export type StageStatus = "waiting" | "running" | "done" | "skipped" | "failed";

export interface StageProgress {
  stage: PipelineStageName;
  status: StageStatus;
  message?: string;
  output?: unknown;
  timestamp: string;
}

export type ProgressCallback = (progress: StageProgress) => void | Promise<void>;

export function createProgressEvent(
  stage: PipelineStageName,
  status: StageStatus,
  message?: string,
  output?: unknown
): StageProgress {
  return {
    stage,
    status,
    message,
    output,
    timestamp: new Date().toISOString()
  };
}
