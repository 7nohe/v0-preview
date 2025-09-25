// Simple metrics/log wrapper (T025)
interface TimingSample {
  name: string;
  durationMs: number;
  ts: number;
}

const timings: TimingSample[] = [];

export function time<T>(name: string, fn: () => T | Promise<T>): Promise<T> | T {
  const start = performance.now();
  const done = (result: T) => {
    const durationMs = performance.now() - start;
    timings.push({ name, durationMs, ts: Date.now() });
    // structured console log
    // eslint-disable-next-line no-console
    console.log('[metrics]', name, { durationMs });
    return result;
  };
  const value = fn();
  if (value instanceof Promise) {
    return (value as Promise<T>).then(v => done(v));
  }
  return done(value as T);
}

export function getTimings() {
  return [...timings];
}
