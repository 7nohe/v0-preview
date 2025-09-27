import React from 'react';
import type { PreviewItem } from '../../lib/messaging';

interface Props {
  item: PreviewItem;
  onOpen: (item: PreviewItem) => void;
  isActive: boolean;
  isLastOpened?: boolean;
  onHighlight?: () => void;
}

export const UrlItem = React.forwardRef<HTMLButtonElement, Props & { 'aria-selected'?: boolean; id?: string }>(({ item, onOpen, isActive, isLastOpened, onHighlight, ...rest }, ref) => {
  const kindLabel = item.kind.replace(/_/g, ' ').toUpperCase();
  const date = new Date(item.ts);
  const timestamp = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let hostname = item.url;
  try {
    hostname = new URL(item.url).hostname.replace(/^www\./, '');
  } catch (e) {
    // noop – fall back to full URL when parsing fails
  }

  const baseClasses = 'group relative flex w-full items-start gap-4 overflow-hidden rounded-[22px] border border-white/12 bg-slate-900/30 px-4 py-3 text-left transition-all duration-300 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';
  const stateClasses = isActive
    ? 'border-white/35 shadow-[0_32px_70px_rgba(56,189,248,0.32)]'
    : 'hover:border-indigo-300/35 hover:bg-white/10 hover:shadow-[0_18px_38px_rgba(30,41,59,0.32)]';
  const markerClasses = isActive
    ? 'bg-gradient-to-br from-sky-300 via-emerald-300 to-indigo-500 shadow-[0_0_20px_rgba(56,189,248,0.55)]'
    : 'bg-white/25';
  const overlayClasses = isActive
    ? 'opacity-100 bg-[linear-gradient(135deg,rgba(129,140,248,0.55)0%,rgba(56,189,248,0.48)50%,rgba(236,72,153,0.42)100%)]'
    : 'opacity-0 bg-white/0 group-hover:bg-white/10 group-hover:opacity-100';

  return (
    <li className="relative pl-12">
      <span className={`pointer-events-none absolute left-5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-white/30 transition duration-300 ${markerClasses}`} aria-hidden="true" />
      <button
        role="option"
        ref={ref}
        className={`${baseClasses} ${stateClasses}`}
        onClick={() => onOpen(item)}
        onMouseEnter={onHighlight}
        onFocus={onHighlight}
        {...rest}
      >
        <span
          className={`pointer-events-none absolute inset-[1px] rounded-[20px] transition duration-300 ease-out ${overlayClasses}`}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-1 flex-col gap-2">
          <p className={`break-words text-[12px] leading-relaxed ${isActive ? 'text-indigo-50/95' : 'text-slate-300/80'}`}>{item.url}</p>
          {isLastOpened && (
            <div className="inline-flex items-center gap-1 self-start rounded-full border border-emerald-300/50 bg-emerald-400/25 px-2 py-0.5 text-[10px] font-medium text-emerald-50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
              最後に開いた
            </div>
          )}
          <div className="inline-flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] transition ${isActive ? 'border-white/40 bg-white/20 text-white/85' : 'border-white/20 bg-white/10 text-indigo-100/70'}`}>
              {kindLabel}
            </span>
          </div>
        </div>
      </button>
    </li>
  );
});

UrlItem.displayName = 'UrlItem';
