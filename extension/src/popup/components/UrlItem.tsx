import React from 'react';
import type { PreviewItem } from '../../lib/messaging';

interface Props {
  item: PreviewItem;
  onOpen: (item: PreviewItem) => void;
  isActive: boolean;
}

export const UrlItem: React.FC<Props & { 'aria-selected'?: boolean }> = ({ item, onOpen, isActive, ...rest }) => {
  return (
    <li>
      <button
        role="option"
        className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring ${isActive ? 'bg-gray-100 ring-1 ring-indigo-400' : ''}`}
        onClick={() => onOpen(item)}
        {...rest}
      >
        <span className="font-mono text-xs break-all block">{item.url}</span>
        <span className="text-[10px] text-gray-500">{item.kind} • {new Date(item.ts).toLocaleTimeString()}</span>
      </button>
    </li>
  );
};
