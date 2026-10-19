import { PipelineStageName } from "../../pipeline/progress.js";
import { getDb } from "../db.js";
import { JobModel, JobStatus } from "../models/job.model.js";

const memoryJobs = new Map<string, JobModel>();

export class JobsRepository {
  async findById(jobId: string, userId: string): Promise<JobModel | null> {
    try {
      const db = getDb();
      return await db.collection<JobModel>("jobs").findOne({ _id: jobId, user_id: userId });
    } catch {
      const job = memoryJobs.get(jobId);
      if (!job || job.user_id !== userId) return null;
      return job;
    }
  }

  async create(job: JobModel): Promise<JobModel> {
    try {
      const db = getDb();
      await db.collection<JobModel>("jobs").insertOne({ ...job });
      return job;
    } catch {
      memoryJobs.set(job._id, job);
      return job;
    }
  }

  async updateProgress(jobId: string, stage: PipelineStageName, output?: unknown): Promise<void> {
    const now = new Date().toISOString();
    const updateObj: Record<string, unknown> = {
      status: "running",
      current_stage: stage,
      updated_at: now,
      etag: `W/"${Date.now()}"`
    };
    if (output !== undefined) {
      updateObj[`stage_outputs.${stage}`] = output;
    }

    try {
      const db = getDb();
      await db.collection<JobModel>("jobs").updateOne({ _id: jobId }, { $set: updateObj });
    } catch {
      const j = memoryJobs.get(jobId);
      if (j) {
        j.status = "running";
        j.current_stage = stage;
        j.updated_at = now;
        j.etag = `W/"${Date.now()}"`;
        if (output !== undefined) {
          j.stage_outputs[stage] = output;
        }
      }
    }
  }

  async setStatus(jobId: string, status: JobStatus, error?: { code: string; message: string }): Promise<void> {
    const now = new Date().toISOString();
    try {
      const db = getDb();
      await db.collection<JobModel>("jobs").updateOne(
        { _id: jobId },
        {
          $set: {
            status,
            updated_at: now,
            etag: `W/"${Date.now()}"`,
            ...(error ? { error } : {})
          }
        }
      );
    } catch {
      const j = memoryJobs.get(jobId);
      if (j) {
        j.status = status;
        j.updated_at = now;
        j.etag = `W/"${Date.now()}"`;
        if (error) j.error = error;
      }
    }
  }

  async markInterruptedRunningJobs(): Promise<number> {
    const now = new Date().toISOString();
    try {
      const db = getDb();
      const res = await db.collection<JobModel>("jobs").updateMany(
        { status: "running" },
        { $set: { status: "interrupted", updated_at: now } }
      );
      return res.modifiedCount;
    } catch {
      let count = 0;
      for (const j of memoryJobs.values()) {
        if (j.status === "running") {
          j.status = "interrupted";
          j.updated_at = now;
          count++;
        }
      }
      return count;
    }
  }
}
