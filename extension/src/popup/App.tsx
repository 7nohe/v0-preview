import React, { useEffect, useState } from 'react';
import { MessageKind, type PreviewItem } from '../lib/messaging';
import { UrlList } from './components/UrlList';
import { EmptyState } from './components/EmptyState';

export function App() {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastOpened, setLastOpened] = useState<string | undefined>();

  useEffect(() => {
    chrome.runtime.sendMessage({ type: MessageKind.LIST_ALL }, (res: any) => {
      if (res?.ok && Array.isArray(res.items)) {
        setItems(res.items);
      }
      setLoading(false);
    });
  }, []);

  function open(item: PreviewItem) {
    chrome.tabs.create({ url: item.url });
    setLastOpened(item.url);
    chrome.runtime.sendMessage({ type: MessageKind.LAST_OPENED, item });
  }

  // listen for broadcast LAST_OPENED events (multi-popup future-proof)
  useEffect(() => {
    function handler(msg: any) {
      if (msg?.type === MessageKind.LAST_OPENED && msg.item) {
        setLastOpened(msg.item.url);
      }
    }
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  // keyboard navigation
  const [cursor, setCursor] = useState<number>(0);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor(c => (c + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor(c => (c - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        open(items[cursor]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, cursor]);

  return (
    <div className="p-2 text-sm text-gray-900 w-72">
      <h1 className="font-semibold mb-2">Preview/Demo URLs</h1>
      {loading ? <EmptyState /> : <UrlList items={items} onOpen={open} lastOpened={lastOpened} activeIndex={cursor} />}
    </div>
  );
}

export default App;
