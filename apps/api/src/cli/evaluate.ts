export async function evaluate(): Promise<void> {}

if (process.argv[1]?.endsWith("evaluate.ts")) {
  void evaluate();
}
