# Quickstart: v0.app Preview/Demo URL Opener Extension

## Prerequisites
- Node.js >= 20
- pnpm or npm
- Chrome (latest)

## Install
```
pnpm install
```

## Dev Build (watch)
```
pnpm dev
```
(Loads crxjs/Vite dev server; load unpacked `dist` or `extension` directory per config.)

## Extract & Open Latest Demo URL (Smoke Test)
1. Open v0.app chat with at least one preview iframe.
2. Click extension icon (or press Cmd+Shift+Y / Ctrl+Shift+Y once command bound in Chrome extensions shortcuts page).
3. Expect a new tab with transformed `https://demo-...` URL.
4. Re-trigger quickly: should NOT open a duplicate within debounce window.

## List All URLs
1. Open popup.
2. Confirm ordered list newest→oldest.
3. Click older item -> opens in new tab.

## No URL Scenario
1. Open v0.app chat before any preview is rendered.
2. Trigger extension.
3. Observe retry then message "Preview URLが見つかりません".

## Run Tests (once created)
```
pnpm test
```

## Performance Check (baseline)
```
pnpm test:perf
```
Verify extraction <300ms.

## Updating Patterns (Future)
Currently patterns are fixed (iframe id `v0-preview-*`). No user customization in initial release.

## Adjusting Debounce Window
1. Open extension Options.
2. Set Debounce (ms) between 500–4000 (step 250).
3. Save and reopen popup; rapid duplicate pushes now reflect new window.

## Troubleshooting
| Symptom | Action |
|---------|--------|
| No URL detected | Verify iframe id starts with v0-preview- | 
| Opens preview- not demo- | Check conversion logic flag in preferences |
| Duplicate opens | Increase debounceMs in preferences |
