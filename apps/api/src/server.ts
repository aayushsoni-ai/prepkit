import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";
import { closeDatabase, connectToDatabase } from "./persistence/db.js";
import { JobRunner } from "./services/jobRunner.js";

async function main(): Promise<void> {
  const env = getEnv();

  try {
    await connectToDatabase(env.MONGODB_URI);
  } catch {}

  const runner = new JobRunner();
  await runner.recoverBootInterruptedJobs();

  const app = createApp();
  const server = app.listen(env.PORT, () => {});

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  void main();
}
