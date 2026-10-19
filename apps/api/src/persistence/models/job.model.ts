import { PipelineStageName } from "../../pipeline/progress.js";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "interrupted";

export interface JobModel {
  _id: string;
  user_id: string;
  kit_id: string;
  fingerprint: string;
  status: JobStatus;
  current_stage?: PipelineStageName;
  stage_outputs: Record<string, unknown>;
  error?: { code: string; message: string };
  etag: string;
  created_at: string;
  updated_at: string;
}
