export interface PreviewUrlCandidate {
  url: string;
  ts?: number; // optional timestamp extracted contextually
}

export interface PreviewUrl {
  url: string;
  kind: 'preview' | 'demo';
  ts: number; // normalized timestamp; if missing use Date.now fallback
}

const PREVIEW_HOST_PREFIX = 'preview-';
const DEMO_HOST_PREFIX = 'demo-';

/**
 * Convert a preview host to a demo host preserving remainder of hostname.
 * preview-xxxxxxxx.vusercontent.net -> demo-xxxxxxxx.vusercontent.net
 */
export function convertPreviewToDemo(input: string): string {
  try {
    const u = new URL(input);
    if (u.hostname.startsWith(PREVIEW_HOST_PREFIX)) {
      u.hostname = DEMO_HOST_PREFIX + u.hostname.substring(PREVIEW_HOST_PREFIX.length);
    }
    return u.toString();
  } catch {
    return input; // return original if not a valid URL
  }
}

/** Remove exact duplicate URL strings preserving first occurrence order. */
export function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const u of urls) {
    if (!seen.has(u)) {
      seen.add(u);
      result.push(u);
    }
  }
  return result;
}

/**
 * Normalize, dedupe and order candidates deterministically.
 * Ordering rule (spec assumption): lexical host asc, path asc, timestamp desc.
 */
export function normalizeAndOrder(candidates: PreviewUrlCandidate[]): PreviewUrl[] {
  const enriched: PreviewUrl[] = candidates.map(c => {
    let kind: 'preview' | 'demo' = 'preview';
    try {
      const u = new URL(c.url);
      if (u.hostname.startsWith(DEMO_HOST_PREFIX)) kind = 'demo';
      if (u.hostname.startsWith(PREVIEW_HOST_PREFIX)) kind = 'preview';
    } catch {
      // keep default
    }
    return {
      url: c.url,
      kind,
      ts: c.ts ?? Date.now()
    };
  });

  // de-duplicate by url keeping earliest entry (already sequential order)
  const seen = new Set<string>();
  const deduped: PreviewUrl[] = [];
  for (const item of enriched) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => {
    try {
      const au = new URL(a.url); const bu = new URL(b.url);
      if (au.hostname < bu.hostname) return -1;
      if (au.hostname > bu.hostname) return 1;
      if (au.pathname < bu.pathname) return -1;
      if (au.pathname > bu.pathname) return 1;
      // newer timestamp first (desc)
      return b.ts - a.ts;
    } catch {
      return a.url.localeCompare(b.url);
    }
  });
}
