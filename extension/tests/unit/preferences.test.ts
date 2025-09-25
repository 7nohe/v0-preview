import { describe, it, expect, vi } from 'vitest';
import { loadPreferences, savePreferences, DEFAULT_PREFS, PREFERENCES_KEY } from '../../src/lib/preferences';

declare const chrome: any;

describe('preferences (T033)', () => {
  it('returns defaults when storage empty', async () => {
    chrome.storage = { sync: { get: vi.fn((keys: string[], cb: any) => cb({})), set: vi.fn((_v: any, cb: any) => cb?.()) } };
    const prefs = await loadPreferences();
    expect(prefs.debounceMs).toBe(DEFAULT_PREFS.debounceMs);
  });

  it('merges stored preference over defaults', async () => {
    chrome.storage = { sync: { get: vi.fn((_k: string[], cb: any) => cb({ [PREFERENCES_KEY]: { debounceMs: 1234 } })), set: vi.fn((_v: any, cb: any) => cb?.()) } };
    const prefs = await loadPreferences();
    expect(prefs.debounceMs).toBe(1234);
  });

  it('savePreferences writes merged object', async () => {
    const store: any = { [PREFERENCES_KEY]: { debounceMs: 2000 } };
    chrome.storage = {
      sync: {
        get: vi.fn((_k: string[], cb: any) => cb(store)),
        set: vi.fn((v: any, cb: any) => { Object.assign(store, v); cb?.(); })
      }
    };
    await savePreferences({ debounceMs: 1500 });
    expect(store[PREFERENCES_KEY].debounceMs).toBe(1500);
  });
});
