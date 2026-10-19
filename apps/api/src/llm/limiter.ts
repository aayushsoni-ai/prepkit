export interface RateLimiterOptions {
  rpm: number;
  tpm: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class TokenBucketLimiter {
  private readonly rpm: number;
  private readonly tpm: number;
  private availableRequests: number;
  private availableTokens: number;
  private lastRefillTimestamp: number;

  constructor(options: RateLimiterOptions) {
    this.rpm = Math.max(1, options.rpm);
    this.tpm = Math.max(100, options.tpm);
    this.availableRequests = this.rpm;
    this.availableTokens = this.tpm;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = Math.max(0, now - this.lastRefillTimestamp);
    this.lastRefillTimestamp = now;

    const requestRefill = (elapsedMs / 60000) * this.rpm;
    const tokenRefill = (elapsedMs / 60000) * this.tpm;

    this.availableRequests = Math.min(this.rpm, this.availableRequests + requestRefill);
    this.availableTokens = Math.min(this.tpm, this.availableTokens + tokenRefill);
  }

  estimateTokens(text: string): number {
    return Math.max(1, Math.ceil(text.length / 4));
  }

  async acquire(estimatedTokens: number): Promise<void> {
    const requiredTokens = Math.min(this.tpm, estimatedTokens);

    while (true) {
      this.refill();

      if (this.availableRequests >= 1 && this.availableTokens >= requiredTokens) {
        this.availableRequests -= 1;
        this.availableTokens -= requiredTokens;
        return;
      }

      const requestWaitMs = this.availableRequests < 1
        ? Math.ceil(((1 - this.availableRequests) / this.rpm) * 60000)
        : 0;

      const tokenWaitMs = this.availableTokens < requiredTokens
        ? Math.ceil(((requiredTokens - this.availableTokens) / this.tpm) * 60000)
        : 0;

      const waitMs = Math.max(50, Math.max(requestWaitMs, tokenWaitMs));
      await sleep(waitMs);
    }
  }

  reset(): void {
    this.availableRequests = this.rpm;
    this.availableTokens = this.tpm;
    this.lastRefillTimestamp = Date.now();
  }
}
