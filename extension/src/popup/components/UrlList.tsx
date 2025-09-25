import React from 'react';
import type { PreviewItem } from '../../lib/messaging';
import { UrlItem } from './UrlItem';

interface Props {
  items: PreviewItem[];
  onOpen: (it: PreviewItem) => void;
  lastOpened?: string;
  activeIndex?: number;
}

export const UrlList: React.FC<Props> = ({ items, onOpen, lastOpened, activeIndex }) => {
  if (!items.length) return <p className="text-xs text-gray-500">No preview URLs detected yet.</p>;
  return (
    <ul className="space-y-1" role="listbox" aria-label="Preview and demo URLs">
      {items.map((i, idx) => (
        <UrlItem
          key={i.url}
          item={i}
          onOpen={onOpen}
          isActive={i.url === lastOpened || idx === activeIndex}
          aria-selected={idx === activeIndex}
        />
      ))}
    </ul>
  );
};
