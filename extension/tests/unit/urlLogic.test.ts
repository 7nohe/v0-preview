import { describe, it, expect } from 'vitest';
import { convertPreviewToDemo, normalizeAndOrder, dedupeUrls } from '../../src/lib/urlLogic';

// T008 conversion test

describe('urlLogic conversion (T008)', () => {
  it('converts preview host to demo host', () => {
    const input = 'https://preview-abc123.vusercontent.net/path';
    const output = convertPreviewToDemo(input);
    expect(output).toBe('https://demo-abc123.vusercontent.net/path');
  });
  it('leaves non-preview host unchanged', () => {
    const input = 'https://demo-xyz.vusercontent.net/a';
    expect(convertPreviewToDemo(input)).toBe(input);
  });
});

// T009 duplicate filtering & ordering

describe('urlLogic duplicate filtering & ordering (T009)', () => {
  it('removes duplicates and sorts deterministically (lexical host, path, timestamp desc)', () => {
    const now = Date.now();
    const items = [
      { url: 'https://preview-b.vusercontent.net/z', ts: now - 1000 },
      { url: 'https://preview-a.vusercontent.net/a', ts: now - 500 },
      { url: 'https://preview-a.vusercontent.net/a', ts: now - 400 }, // duplicate
      { url: 'https://demo-c.vusercontent.net/m', ts: now - 300 }
    ];
    const ordered = normalizeAndOrder(items);
    const urls = ordered.map(o => o.url);
    // lexical host: demo-c..., preview-a..., preview-b...
    expect(urls).toEqual([
      'https://demo-c.vusercontent.net/m',
      'https://preview-a.vusercontent.net/a',
      'https://preview-b.vusercontent.net/z'
    ]);
  });

  it('dedupeUrls keeps first occurrence order', () => {
    const list = ['a', 'b', 'a', 'c', 'b'];
    expect(dedupeUrls(list)).toEqual(['a', 'b', 'c']);
  });
});
