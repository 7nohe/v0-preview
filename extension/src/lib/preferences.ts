// Preferences abstraction (T023)
export interface UserPreferences {
  debounceMs: number; // debounce window for background acceptance of pushes
}

export const DEFAULT_PREFS: UserPreferences = {
  debounceMs: 2000
};

export const PREFERENCES_KEY = 'v0PreviewPreferences';

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    return await new Promise<UserPreferences>(resolve => {
      chrome.storage.sync.get([PREFERENCES_KEY], (data: Record<string, unknown>) => {
        if (data && data[PREFERENCES_KEY]) resolve({ ...DEFAULT_PREFS, ...data[PREFERENCES_KEY] });
        else resolve(DEFAULT_PREFS);
      });
    });
  } catch {
    // fallback local
    return DEFAULT_PREFS;
  }
}

export async function savePreferences(p: Partial<UserPreferences>): Promise<void> {
  const merged = { ...(await loadPreferences()), ...p };
  return new Promise<void>(resolve => {
    chrome.storage.sync.set({ [PREFERENCES_KEY]: merged }, () => resolve());
  });
}
