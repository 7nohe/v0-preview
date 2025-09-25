import { MessageKind, type PreviewItem, type ListAllResponse, type ExtractLatestResponse, type PushItemsRequest, type LastOpenedNotifyRequest } from '../lib/messaging';
import { normalizeAndOrder } from '../lib/urlLogic';
import { time } from '../lib/metrics';
import { loadPreferences, type UserPreferences } from '../lib/preferences';

// declare chrome for TS (MV3 environment provides it at runtime)
declare const chrome: any;

interface InternalState {
  items: Map<string, PreviewItem>; // keyed by url
  lastOpened?: PreviewItem;
  lastDispatchTs: number;
}

const state: InternalState = {
  items: new Map(),
  lastDispatchTs: 0
};

let prefs: UserPreferences = { debounceMs: 2000 };
// Load preferences asynchronously (fire and forget)
loadPreferences().then(p => { prefs = p; });
// React to external preference changes
chrome.storage.onChanged.addListener((changes: Record<string, any>, area: string) => {
  if (area === 'sync' && changes['v0PreviewPreferences']) {
    const next = changes['v0PreviewPreferences'].newValue as UserPreferences | undefined;
    if (next && typeof next.debounceMs === 'number') {
      prefs = next;
    }
  }
});

function upsertItems(incoming: PreviewItem[]) {
  for (const it of incoming) {
    // Keep latest timestamp if existing
    const existing = state.items.get(it.url);
    if (!existing || existing.ts < it.ts) {
      state.items.set(it.url, it);
    }
  }
}

function listAll(): PreviewItem[] {
  return normalizeAndOrder(Array.from(state.items.values()).map(i => ({ url: i.url, ts: i.ts })));
}

chrome.runtime.onMessage.addListener((msg: any, _sender: any, sendResponse: (res: any) => void) => {
  if (msg?.type === MessageKind.PUSH_ITEMS && Array.isArray((msg as PushItemsRequest).items)) {
    time('pushItems', () => {
      const now = Date.now();
      if (now - state.lastDispatchTs >= prefs.debounceMs) {
        state.lastDispatchTs = now;
        upsertItems((msg as PushItemsRequest).items);
      }
    });
    sendResponse({ ok: true });
    return true;
  }
  if (msg?.type === MessageKind.EXTRACT_LATEST) {
    const ordered = listAll();
    const latest = ordered[0];
    const res: ExtractLatestResponse = { ok: true, latest };
    sendResponse(res);
    return true;
  }
  if (msg?.type === MessageKind.LAST_OPENED && (msg as LastOpenedNotifyRequest).item) {
    state.lastOpened = (msg as LastOpenedNotifyRequest).item;
    // Broadcast to all clients (fire-and-forget)
    chrome.runtime.sendMessage({ type: MessageKind.LAST_OPENED, item: state.lastOpened });
    sendResponse({ ok: true });
    return true;
  }
  if (msg?.type === MessageKind.LIST_ALL) {
    const ordered = listAll();
    const res: ListAllResponse = { ok: true, items: ordered };
    sendResponse(res);
    return true;
  }
});

chrome.action.onClicked.addListener(() => {
  // reserved for keyboard shortcut / manual open semantics later
});
