import React, { useCallback, useEffect, useState } from 'react';
import { MessageKind, type PreviewItem } from '../lib/messaging';
import { UrlList } from './components/UrlList';
import { EmptyState } from './components/EmptyState';

export function App() {
  const [isSupportedContext, setSupportedContext] = useState<boolean | null>(null);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastOpened, setLastOpened] = useState<string | undefined>();

  const fetchLatest = useCallback((options?: { showSpinner?: boolean }) => {
    if (options?.showSpinner) {
      setLoading(true);
    }

    chrome.runtime.sendMessage({ type: MessageKind.LIST_ALL }, (res: any) => {
      if (chrome.runtime.lastError) {
        console.debug('Failed to refresh preview list', chrome.runtime.lastError);
        setLoading(false);
        return;
      }

      if (res?.ok && Array.isArray(res.items)) {
        setItems(res.items);
        if (res.items.length) {
          setCursor(prev => (prev >= res.items.length ? res.items.length - 1 : prev));
        } else {
          setCursor(0);
        }
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const [tab] = tabs;
      const url = tab?.url ?? '';
      let hostname: string | undefined;
      try {
        hostname = new URL(url).hostname;
      } catch (e) {
        // ignore parse errors
      }

      if (hostname && (hostname === 'v0.app' || hostname.endsWith('.v0.app'))) {
        setSupportedContext(true);
        fetchLatest({ showSpinner: true });
      } else {
        setSupportedContext(false);
        setLoading(false);
      }
    });
  }, [fetchLatest]);

  useEffect(() => {
    if (isSupportedContext === false) {
      return;
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        fetchLatest({ showSpinner: items.length === 0 });
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchLatest, items.length, isSupportedContext]);

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
    if (!items.length) {
      setCursor(0);
      return;
    }
    setCursor(prev => (prev >= items.length ? items.length - 1 : prev));
  }, [items.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor(c => {
          const next = c + 1;
          return next >= items.length ? items.length - 1 : next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor(c => {
          const prev = c - 1;
          return prev < 0 ? 0 : prev;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        open(items[cursor]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, cursor]);

  const activeItem = items.length ? items[cursor] : undefined;
  let activeHost: string | undefined;
  if (activeItem) {
    try {
      activeHost = new URL(activeItem.url).hostname.replace(/^www\./, '');
    } catch (e) {
      // ignore parse errors
    }
  }

  let lastOpenedHost: string | undefined;
  if (lastOpened) {
    try {
      lastOpenedHost = new URL(lastOpened).hostname.replace(/^www\./, '');
    } catch (e) {
      // ignore parse errors
    }
  }

  const handleOpenActive = () => {
    if (activeItem) {
      open(activeItem);
    }
  };

  const handleRefresh = () => {
    fetchLatest({ showSpinner: true });
  };

  if (isSupportedContext === false) {
    return (
      <div className="mx-auto flex min-w-[320px] max-w-[360px] flex-col items-center justify-center gap-4 rounded-[28px] border border-slate-700/40 bg-slate-950/95 p-6 text-center text-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.45)]">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">v0.app で開いてください</p>
          <p className="text-xs text-slate-300/80">このポップアップは v0.app のページでのみ利用できます。</p>
        </div>
      </div>
    );
  }

  if (isSupportedContext === null) {
    return (
      <div className="mx-auto flex min-w-[320px] max-w-[360px] items-center justify-center rounded-[28px] border border-slate-700/40 bg-slate-950/95 p-6 text-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.45)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-sky-300" aria-hidden="true" />
      </div>
    );
  }

  const openButtonClasses = activeItem
    ? 'group inline-flex w-full items-center justify-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_14px_30px_rgba(56,189,248,0.45)] transition duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto'
    : 'group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300/70 transition duration-200 sm:w-auto';

  return (
    <div className="mx-auto min-w-[320px] max-w-[360px] border border-slate-700/30 bg-slate-950/90 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.45)]">
      <div className="relative overflow-hidden ">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(79,70,229,0.32)0%,rgba(14,116,144,0.22)45%,rgba(236,72,153,0.28)100%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-[-30%] top-[-45%] h-56 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.55),transparent_65%)] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-[-20%] bottom-[-35%] h-60 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.42),transparent_60%)] blur-3xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-6">
          <header className="px-5 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]">v0 Preview</h1>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sky-200 shadow-[0_10px_30px_rgba(30,41,59,0.32)] transition duration-200 hover:border-white/30 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-65"
                aria-label="Refetch previews"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-sky-300" aria-hidden="true" />
                ) : (
                  <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M12.58 5.42a4.5 4.5 0 1 0 .17 7.16.75.75 0 1 1 .96 1.14 6 6 0 1 1-.22-9.55l.05-.05V3.75a.75.75 0 0 1 1.5 0v2.5c0 .41-.34.75-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.29Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-indigo-100/80">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100/30 bg-indigo-500/20 px-3 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {items.length ? '最新のURLが揃っています' : 'URLを検出するまでお待ちください'}
              </span>
              {lastOpenedHost && (
                <span className="inline-flex max-w-[180px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-indigo-100/70">Last opened</span>
                  <span className="truncate text-xs font-semibold text-white" title={lastOpened}>
                    {lastOpenedHost}
                  </span>
                </span>
              )}
            </div>
          </header>

          <section className="space-y-4 px-5">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 shadow-[0_18px_40px_rgba(79,70,229,0.22)] backdrop-blur">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <p className="truncate text-base font-semibold text-white" title={activeItem?.url ?? '---'}>
                      {activeItem ? activeItem.url : 'リストからURLを選択してください'}
                    </p>
                    {activeHost && <p className="text-xs text-indigo-100/70">{activeHost}</p>}
                  </div>
                  <div className="flex w-full justify-end sm:w-auto">
                    <button
                      type="button"
                      onClick={handleOpenActive}
                      disabled={!activeItem}
                      className={`${openButtonClasses} disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/10 disabled:text-slate-300/70 disabled:shadow-none`}
                    >
                      <span>プレビューを開く</span>
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5.75 10a.75.75 0 0 1 .75-.75h6.19l-2.22-2.22a.75.75 0 0 1 1.06-1.06l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06l2.22-2.22H6.5A.75.75 0 0 1 5.75 10Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-100/75">↑ / ↓ で選択、Enter で即座にプレビューを起動できます。</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-indigo-100/75">
              <span className="font-semibold uppercase tracking-[0.25em]">Timeline</span>
              <span className="text-indigo-100/60">最近のURL一覧</span>
            </div>

            <div className="custom-scroll max-h-72 space-y-3 overflow-y-auto pr-1 mb-12">
              {loading ? (
                <EmptyState />
              ) : (
                <UrlList
                  items={items}
                  onOpen={open}
                  lastOpened={lastOpened}
                  activeIndex={cursor}
                  onHighlight={index => setCursor(index)}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
