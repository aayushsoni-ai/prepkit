export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  retryAfterSeconds?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function parseRetryAfter(headerValue?: string): number | null {
  if (!headerValue) return null;
  const asNum = parseFloat(headerValue);
  if (!isNaN(asNum) && asNum >= 0) {
    return Math.ceil(asNum * 1000);
  }
  const asDate = new Date(headerValue).getTime();
  if (!isNaN(asDate)) {
    return Math.max(0, asDate - Date.now());
  }
  return null;
}

export function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as HttpError;
  const code = err.status ?? err.statusCode;
  if (code === 429) return true;
  if (code && code >= 500 && code <= 599) return true;
  const msg = err.message.toLowerCase();
  return msg.includes("rate limit") || msg.includes("timeout") || msg.includes("429");
}

export async function executeWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelay = options.initialDelayMs ?? 500;
  const maxDelay = options.maxDelayMs ?? 10000;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation(attempt);
    } catch (err) {
      lastError = err;
      if (attempt >= maxRetries || !isRetryableError(err)) {
        throw err;
      }

      const retryAfterMs = (err as HttpError).retryAfterSeconds
        ? (err as HttpError).retryAfterSeconds! * 1000
        : null;

      const backoffMs = Math.min(
        maxDelay,
        initialDelay * Math.pow(2, attempt) + Math.random() * 200
      );

      const delay = retryAfterMs ?? backoffMs;
      await sleep(delay);
    }
  }

  throw lastError;
}
