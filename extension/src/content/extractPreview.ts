import { convertPreviewToDemo } from '../lib/urlLogic';
import { MessageKind, type PreviewItem } from '../lib/messaging';

// Scan DOM for iframes whose id starts with v0-preview-
function scan(): PreviewItem[] {
  const iframes = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe[id^="v0-preview-"]'));
  const results: PreviewItem[] = [];
  const now = Date.now();
  for (const f of iframes) {
    const origin = (f.dataset as any).origin as string | undefined; // dataset.origin per clarification
    if (!origin) continue;
    try {
      const previewUrl = origin.startsWith('http') ? origin : `https://${origin}`;
      const demoUrl = convertPreviewToDemo(previewUrl);
      const ts = now; // placeholder; could parse timestamp later
      results.push({ url: previewUrl, kind: 'preview', ts });
      if (demoUrl !== previewUrl) {
        results.push({ url: demoUrl, kind: 'demo', ts });
      }
    } catch {
      // ignore malformed
    }
  }
  return results;
}

// Send list to background for aggregation
function dispatch() {
  const items = scan();
  if (!items.length) return;
  chrome.runtime.sendMessage({ type: MessageKind.PUSH_ITEMS, items });
}

// Initial & mutation observer (lightweight)
dispatch();
const mo = new MutationObserver(() => {
  // debounced via background; send every structural change
  dispatch();
});
mo.observe(document.body, { subtree: true, childList: true });
