import React, { useEffect, useRef } from 'react';
import type { PreviewItem } from '../../lib/messaging';
import { UrlItem } from './UrlItem';

interface Props {
  items: PreviewItem[];
  onOpen: (it: PreviewItem) => void;
  lastOpened?: string;
  activeIndex?: number;
  onHighlight?: (index: number) => void;
}

export const UrlList: React.FC<Props> = ({ items, onOpen, lastOpened, activeIndex, onHighlight }) => {
  if (!items.length)
    return (
      <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-8 text-center text-sm text-indigo-100/75 shadow-[0_12px_30px_rgba(30,41,59,0.25)]">
        <p className="font-semibold text-white/90">No preview URLs yet</p>
        <p className="mt-2 text-xs text-indigo-100/70">チャットでプレビューやデモのリンクが共有されるとここに並びます。</p>
      </div>
    );

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    if (activeIndex == null || activeIndex < 0 || activeIndex >= buttonRefs.current.length) return;
    const node = buttonRefs.current[activeIndex];
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIndex, items.length]);

  const activeId = activeIndex != null && activeIndex >= 0 ? `preview-option-${activeIndex}` : undefined;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-5 top-3 bottom-8 w-px bg-gradient-to-b from-white/40 via-indigo-200/25 to-transparent" aria-hidden="true" />
      <ul
        className="flex flex-col gap-3"
        role="listbox"
        aria-label="Preview and demo URLs"
        tabIndex={0}
        aria-activedescendant={activeId}
      >
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;
          const isLastOpened = item.url === lastOpened;
          return (
            <UrlItem
              key={item.url}
              id={`preview-option-${idx}`}
              ref={el => {
                buttonRefs.current[idx] = el;
              }}
              item={item}
              onOpen={onOpen}
              isActive={isActive}
              isLastOpened={isLastOpened}
              aria-selected={isActive}
              onHighlight={onHighlight ? () => onHighlight(idx) : undefined}
            />
          );
        })}
      </ul>
    </div>
  );
};
