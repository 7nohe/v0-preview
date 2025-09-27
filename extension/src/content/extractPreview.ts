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

// Mutation observer handle so we can disconnect when extension context goes away
let stopped = false;
let observer: MutationObserver | null = null;

function stop() {
  if (stopped) return;
  stopped = true;
  observer?.disconnect();
  observer = null;
}

function handleRuntimeError(error: unknown) {
  const message = (error as Error | undefined)?.message ?? '';
  if (message.includes('Extension context invalidated')) {
    stop();
  }
}

// Send list to background for aggregation
function dispatch() {
  if (stopped) return;
  const runtime = chrome?.runtime;
  if (!runtime?.id) {
    stop();
    return;
  }

  const items = scan();
  if (!items.length) return;

  try {
    const maybePromise = runtime.sendMessage({ type: MessageKind.PUSH_ITEMS, items }) as unknown;
    if (maybePromise && typeof (maybePromise as Promise<unknown>).catch === 'function') {
      (maybePromise as Promise<unknown>).catch(handleRuntimeError);
    }
  } catch (error) {
    handleRuntimeError(error);
  }
}

// Initial & mutation observer (lightweight)
dispatch();

if (document.body) {
  observer = new MutationObserver(() => {
    // debounced via background; send every structural change
    dispatch();
  });
  observer.observe(document.body, { subtree: true, childList: true });
} else {
  window.addEventListener('DOMContentLoaded', () => {
    if (stopped || observer) return;
    observer = new MutationObserver(() => dispatch());
    observer.observe(document.body!, { subtree: true, childList: true });
    dispatch();
  });
}
