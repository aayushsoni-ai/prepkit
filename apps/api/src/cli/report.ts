import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
import { SerializedKit } from "../domain/kit/serialize.js";

export interface BatchCaseResult {
  id: string;
  status: "ok" | "failed";
  kit: SerializedKit | null;
  error: { code: string; message: string } | null;
}

export interface BatchReport {
  version: string;
  generated_at: string;
  kits: BatchCaseResult[];
}

export class BatchReportWriter {
  private readonly outputPath: string;
  private readonly results: BatchCaseResult[] = [];

  constructor(outputPath: string) {
    this.outputPath = outputPath;
  }

  async recordResult(result: BatchCaseResult): Promise<void> {
    this.results.push(result);
    const report: BatchReport = {
      version: "1.0",
      generated_at: new Date().toISOString(),
      kits: [...this.results]
    };
    await mkdir(dirname(this.outputPath), { recursive: true });
    await writeFile(this.outputPath, JSON.stringify(report, null, 2), "utf-8");
  }

  getResults(): BatchCaseResult[] {
    return [...this.results];
  }
}
