import React from 'react';

export const EmptyState: React.FC = () => (
  <div className="flex h-40 flex-col items-center justify-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-6 text-center text-sm text-indigo-100/75 shadow-[0_18px_40px_rgba(30,41,59,0.25)]">
    <div className="relative flex h-14 w-14 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/25" aria-hidden="true" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-transparent border-t-sky-300" aria-hidden="true" />
      </span>
    </div>
    <span className="sr-only">Loading preview links</span>
    <div className="space-y-1 text-xs leading-relaxed text-indigo-100/75">
      <p>プレビューリンクを探索しています…</p>
      <p className="text-indigo-100/60">最新のチャットをチェックしてしばらくお待ちください。</p>
    </div>
  </div>
);
