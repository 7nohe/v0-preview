import { describe, it, expect, vi } from 'vitest';
import { retryExtraction } from '../../src/lib/retryExtraction';

describe('retry logic (T010)', () => {
  it('attempts up to 5 times with 300ms interval before failing', async () => {
    vi.useFakeTimers();
    const task = vi.fn().mockRejectedValue(new Error('fail'));
    const promise = retryExtraction({ task });
    // advance timers for 4 intervals (5 attempts)
    for (let i = 0; i < 5; i++) {
      await vi.runAllTimersAsync();
    }
    await expect(promise).rejects.toThrow('fail');
    expect(task).toHaveBeenCalledTimes(5);
    vi.useRealTimers();
  });

  it('resolves early when a retry succeeds', async () => {
    vi.useFakeTimers();
    const task = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('ok');
    const promise = retryExtraction({ task });
    for (let i = 0; i < 3; i++) {
      await vi.runAllTimersAsync();
    }
    await expect(promise).resolves.toBe('ok');
    expect(task).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });
});
