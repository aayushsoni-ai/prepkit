import { Brief, Coverage, Flashcard, Question, Requirement } from "../domain/kit/schema.js";
import { LlmClient } from "../llm/client.js";
import { CrawlResult } from "../retrieval/crawler.js";
import { DiscussionThread } from "../retrieval/discussion/hackerNews.js";
import { ProgressCallback } from "./progress.js";

export interface PipelineInput {
  id?: string;
  company_name?: string;
  role_title?: string;
  jd: string;
  company_url: string;
  days: number;
  userId?: string;
}

export interface PipelineOptions {
  llm: LlmClient;
  softBudgetMs?: number;
  allowPrivateHosts?: boolean;
  searchProvider?: "hackernews" | "brave";
  braveApiKey?: string;
  onProgress?: ProgressCallback;
}

export interface ValidatedInput {
  id: string;
  jd: string;
  company_url: string;
  days: number;
  company_name: string;
  role_title: string;
  userId: string;
}

export class PipelineContext {
  public readonly input: PipelineInput;
  public readonly options: PipelineOptions;
  public readonly startTime: number;
  public readonly softBudgetMs: number;

  public validatedInput?: ValidatedInput;
  public groundedRequirements: Requirement[] = [];
  public crawlResult?: CrawlResult;
  public hiringStages: string[] = [];
  public discussions: DiscussionThread[] = [];
  public brief?: Brief;
  public questions: Question[] = [];
  public flashcards: Flashcard[] = [];
  public coverage?: Coverage;
  public warnings: string[] = [];
  public checkpoints: Record<string, unknown> = {};

  constructor(input: PipelineInput, options: PipelineOptions) {
    this.input = input;
    this.options = options;
    this.startTime = Date.now();
    this.softBudgetMs = options.softBudgetMs ?? 180000;
  }

  isBudgetExceeded(): boolean {
    return Date.now() - this.startTime >= this.softBudgetMs;
  }

  checkpoint(stageName: string, output: unknown): void {
    this.checkpoints[stageName] = output;
  }
}
