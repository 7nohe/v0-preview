export interface RetryOptions<T> {
  maxAttempts?: number; // default 5
  intervalMs?: number; // default 300
  task: () => Promise<T> | T;
  shouldRetry?: (error: unknown, attempt: number) => boolean; // default always true until maxAttempts
}

export async function retryExtraction<T>(opts: RetryOptions<T>): Promise<T> {
  const {
    maxAttempts = 5,
    intervalMs = 300,
    task,
    shouldRetry = () => true
  } = opts;
  let attempt = 0;
  let lastErr: unknown;
  while (attempt < maxAttempts) {
    try {
      return await task();
    } catch (e) {
      lastErr = e;
      attempt++;
      if (attempt >= maxAttempts || !shouldRetry(e, attempt)) {
        break;
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
  throw lastErr ?? new Error('retryExtraction: unknown failure');
}
