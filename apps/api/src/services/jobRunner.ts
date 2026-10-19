import { createId } from "../domain/kit/ids.js";
import { GeminiLlmClient } from "../llm/gemini.js";
import { GroqLlmClient } from "../llm/groq.js";
import { FallbackLlmClient, LlmClient } from "../llm/client.js";
import { TokenBucketLimiter } from "../llm/limiter.js";
import { JobModel } from "../persistence/models/job.model.js";
import { JobsRepository } from "../persistence/repositories/jobs.repo.js";
import { KitsRepository } from "../persistence/repositories/kits.repo.js";
import { computeFingerprint } from "../pipeline/fingerprint.js";
import { runPipeline } from "../pipeline/runPipeline.js";
import { getEnv } from "../config/env.js";

function getPipelineLlm(): LlmClient {
  const env = getEnv();
  const limiter = new TokenBucketLimiter({ rpm: env.LLM_RPM_BUDGET, tpm: env.LLM_TPM_BUDGET });

  if (env.LLM_PROVIDER === "groq" && env.GROQ_API_KEY) {
    const groq = new GroqLlmClient({ apiKey: env.GROQ_API_KEY, limiter });
    if (env.GEMINI_API_KEY) {
      return new FallbackLlmClient(groq, new GeminiLlmClient({ apiKey: env.GEMINI_API_KEY, limiter }));
    }
    return groq;
  }

  if (env.GEMINI_API_KEY) {
    const gemini = new GeminiLlmClient({ apiKey: env.GEMINI_API_KEY, limiter });
    if (env.GROQ_API_KEY) {
      return new FallbackLlmClient(gemini, new GroqLlmClient({ apiKey: env.GROQ_API_KEY, limiter }));
    }
    return gemini;
  }

  return new GroqLlmClient({ apiKey: env.GROQ_API_KEY || "dummy", limiter });
}

export class JobRunner {
  private readonly jobsRepo = new JobsRepository();
  private readonly kitsRepo = new KitsRepository();
  private readonly queue: Array<() => Promise<void>> = [];
  private activeCount = 0;
  private readonly maxConcurrency = 2;

  async recoverBootInterruptedJobs(): Promise<number> {
    return this.jobsRepo.markInterruptedRunningJobs();
  }

  async enqueue(task: () => Promise<void>): Promise<void> {
    this.queue.push(task);
    this.processNext();
  }

  private processNext(): void {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    this.activeCount++;
    const task = this.queue.shift()!;
    task().finally(() => {
      this.activeCount--;
      this.processNext();
    });
  }

  async startJob(userId: string, input: { jd: string; company_url: string; days: number }): Promise<{ jobId: string; kitId: string }> {
    const kitId = createId("kit");
    const jobId = createId("job");
    const fingerprint = computeFingerprint(userId, input.jd, input.company_url);

    const job: JobModel = {
      _id: jobId,
      user_id: userId,
      kit_id: kitId,
      fingerprint,
      status: "pending",
      stage_outputs: {},
      etag: `W/"${Date.now()}"`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.jobsRepo.create(job);

    void this.enqueue(async () => {
      await this.jobsRepo.setStatus(jobId, "running");
      const llm = getPipelineLlm();

      const result = await runPipeline(
        { id: kitId, jd: input.jd, company_url: input.company_url, days: input.days, userId },
        {
          llm,
          allowPrivateHosts: getEnv().ALLOW_PRIVATE_HOSTS,
          onProgress: async (event) => {
            await this.jobsRepo.updateProgress(jobId, event.stage, event.output);
          }
        }
      );

      if (result.success) {
        await this.kitsRepo.create({
          _id: kitId,
          user_id: userId,
          fingerprint,
          kit: result.kit,
          updated_at: new Date().toISOString()
        });
        await this.jobsRepo.setStatus(jobId, "completed");
      } else {
        await this.jobsRepo.setStatus(jobId, "failed", result.error);
      }
    });

    return { jobId, kitId };
  }
}
