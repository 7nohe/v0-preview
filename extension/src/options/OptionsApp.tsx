import React, { useEffect, useState } from 'react';
import { loadPreferences, savePreferences } from '../lib/preferences';

export const OptionsApp: React.FC = () => {
  const [debounceMs, setDebounceMs] = useState(2000);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    loadPreferences().then(p => setDebounceMs(p.debounceMs));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await savePreferences({ debounceMs: debounceMs });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="p-4 text-sm">
      <h1 className="font-semibold mb-4">Extension Preferences</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-xs mb-1">Debounce (ms)</span>
          <input
            type="number"
            min={200}
            max={5000}
            value={debounceMs}
            onChange={e => setDebounceMs(Number(e.target.value))}
            className="border rounded px-2 py-1 w-32 text-sm"
          />
        </label>
        <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Save</button>
        {saved && <span className="text-green-600 text-xs ml-2">Saved</span>}
      </form>
    </div>
  );
};

export default OptionsApp;
