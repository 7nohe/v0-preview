import { describe, it, expect } from 'vitest';
import { MessageKind } from '../../src/lib/messaging';

declare const chrome: any;

// Minimal stub messaging harness
function withBackground(handler: (send: (msg: any, cb: (res: any) => void) => void) => Promise<void>) {
  // naive in-memory listeners
  const listeners: any[] = [];
  chrome.runtime = {
    onMessage: { addListener: (fn: any) => listeners.push(fn), removeListener: (_fn: any) => { } },
    sendMessage: (msg: any, cb?: (res: any) => void) => {
      for (const l of listeners) {
        let responded = false;
        l(msg, {}, (response: any) => { responded = true; cb?.(response); });
        if (!responded) cb?.(undefined);
      }
    }
  };
  return handler((m, cb) => chrome.runtime.sendMessage(m, cb));
}

describe('LAST_OPENED contract (T034)', () => {
  it('emits broadcast after notify', async () => {
    await withBackground(async send => {
      // import background after stubbing chrome
      await import('../../src/background/serviceWorker');
      let broadcast: any;
      chrome.runtime.onMessage.addListener((msg: any) => { if (msg?.type === MessageKind.LAST_OPENED && msg.item) broadcast = msg; });
      const item = { url: 'https://demo-x.vusercontent.net', kind: 'demo', ts: Date.now() };
      await new Promise<void>(resolve => send({ type: MessageKind.LAST_OPENED, item }, () => resolve()));
      expect(broadcast).toBeDefined();
      expect(broadcast.item.url).toBe(item.url);
    });
  });
});
