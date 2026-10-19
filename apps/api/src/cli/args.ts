export interface CliArgs {
  inputPath: string;
  outputPath: string;
  concurrency?: number;
}

export function parseCliArgs(args: string[]): CliArgs {
  let inputPath = "apps/api/fixtures/cases.sample.json";
  let outputPath = "kits.json";
  let concurrency: number | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--input" && i + 1 < args.length) {
      inputPath = args[++i];
    } else if (arg === "--output" && i + 1 < args.length) {
      outputPath = args[++i];
    } else if (arg === "--concurrency" && i + 1 < args.length) {
      concurrency = parseInt(args[++i], 10);
    }
  }

  return {
    inputPath,
    outputPath,
    concurrency
  };
}
