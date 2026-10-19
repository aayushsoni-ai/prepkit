import { Request, Response } from "express";
import { JobsRepository } from "../../persistence/repositories/jobs.repo.js";
import { NotFoundError } from "../middleware/errors.js";

const jobsRepo = new JobsRepository();

export async function handleGetJob(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const jobId = String(req.params.id);

  const job = await jobsRepo.findById(jobId, userId);
  if (!job) throw new NotFoundError("Job not found");

  if (req.headers["if-none-match"] === job.etag) {
    res.status(304).end();
    return;
  }

  res.setHeader("ETag", job.etag);
  res.status(200).json({ job });
}

export async function handleResumeJob(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const jobId = String(req.params.id);

  const job = await jobsRepo.findById(jobId, userId);
  if (!job) throw new NotFoundError("Job not found");

  await jobsRepo.setStatus(jobId, "running");
  res.status(200).json({ resumed: true });
}
