# Tasks: Chrome拡張 v0.app Chat Preview/Demo URL Opener

**Input**: Design documents from `/specs/001-v0-app-chat/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Phase 3.1: Setup
- [X] T001 Create extension project structure `extension/` with folders: src/content, src/background, src/popup/components, src/options, src/lib, src/styles, tests/{unit,integration,performance}
- [X] T002 Initialize project with Vite + React + TypeScript + @crxjs/vite-plugin + Tailwind v4 (`package.json`, `tsconfig.json`, `tailwind.config.js`, Tailwind Vite plugin setup)
- [X] T003 [P] Add ESLint + Prettier config (`.eslintrc.cjs`, `.prettierrc`) with strict TypeScript rules
- [X] T004 [P] Add Vitest test setup (`vitest.config.ts`) + testing-library/react + jsdom
- [X] T005 Create `manifest.config.ts` (MV3) with minimal permissions and host pattern for `https://*.vusercontent.net/*`
- [X] T006 Add Tailwind base stylesheet `extension/src/styles/index.css` and import in popup
- [X] T007 Define environment scripts in `package.json` (dev, build, test, test:perf, lint)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation logic beyond scaffolding**
- [X] T008 [P] Unit test extraction conversion (preview- → demo-) in `tests/unit/urlLogic.test.ts`
- [X] T009 [P] Unit test duplicate filtering & ordering logic in `tests/unit/urlLogic.test.ts` (separate describe)
- [X] T010 [P] Unit test retry logic (5 attempts 300ms) using fake timers in `tests/unit/retryLogic.test.ts`
- [X] T011 [P] Integration test popup list rendering & selection in `tests/integration/popupInteraction.test.ts`
- [X] T012 [P] Integration test debounce (double trigger within window) in `tests/integration/debounce.test.ts`
- [X] T013 [P] Contract test messaging EXTRACT_LATEST response shape in `tests/contract/extractLatest.contract.test.ts`
- [X] T014 [P] Contract test messaging LIST_ALL response ordering in `tests/contract/listAll.contract.test.ts`
- [X] T015 [P] Performance baseline test extraction under synthetic DOM (≤50 messages & 5 iframes) in `tests/performance/extraction.bench.ts`

## Phase 3.3: Core Implementation
- [X] T016 Implement URL logic module `extension/src/lib/urlLogic.ts` (conversion, ordering, duplicate filter) to satisfy T008–T009
- [X] T017 Implement retry helper `extension/src/lib/retryExtraction.ts` used by content script (supports max 5 attempts) for T010
- [X] T018 Implement messaging types & constants `extension/src/lib/messaging.ts` for contract tests
- [X] T019 Implement content script `extension/src/content/extractPreview.ts` (DOM query + messaging) without side effects beyond postMessage
- [X] T020 Implement background service worker `extension/src/background/serviceWorker.ts` (handles EXTRACT_LATEST, LIST_ALL, applies debounce, emits LAST_OPENED)
- [X] T021 Implement popup React app `extension/src/popup/App.tsx` (list rendering, selection open, highlight last opened)
- [X] T022 Implement popup components: `UrlList.tsx`, `UrlItem.tsx`, `EmptyState.tsx`
- [X] T023 Implement user preference storage abstraction `extension/src/lib/preferences.ts` (sync fallback local) (pending R2 decision placeholder config)
- [X] T024 Implement options page (conditional) `extension/src/options/OptionsApp.tsx` with debounce + patterns form (if R5 unresolved keep feature flagged off)
- [X] T025 Implement metrics/log wrapper `extension/src/lib/metrics.ts` (structured console + future hook)
- [X] T026 Manifest finalize (MV3) with commands (keyboard shortcut placeholder) & permissions minimal (`tabs`, `storage`)

## Phase 3.4: Integration
- [X] T027 Wire popup to background (chrome.runtime messages) and highlight last opened; update tests if needed
- [X] T028 Wire content script injection path (ensure script listed/automatically injected on v0.app domain)
- [X] T029 Add accessibility roles & keyboard navigation to popup (R8) `UrlList.tsx`
- [X] T030 Add performance measurement hook around extraction & log metrics (Principle IV) `metrics.ts`
- [X] T031 Add security hardening: CSP review, ensure no unsafe-eval, restrict host_permissions in manifest
- [X] T032 Implement options page enablement toggle in manifest (if decisions finalized) else stub

## Phase 3.5: Polish
- [ ] T033 [P] Add additional unit tests for preferences + debounce persistence `tests/unit/preferences.test.ts`
- [ ] T034 [P] Add contract test for LAST_OPENED event emission `tests/contract/lastOpened.contract.test.ts`
- [ ] T035 [P] Add ARIA/accessibility tests (role, focus order) `tests/integration/a11y.test.ts`
- [ ] T036 [P] Add performance regression guard (compare baseline) `tests/performance/extraction.regress.test.ts`
- [ ] T037 Update quickstart with keyboard shortcut + options usage
- [ ] T038 Update research.md decisions (mark OPEN -> DECIDED) and link in plan
- [ ] T039 Refactor & remove duplication (consolidate utils) `extension/src/lib/*`
- [ ] T040 Add coverage/lint CI config file `.github/workflows/ci.yml` (if repo CI used)
- [ ] T041 Final README / CHANGELOG entry referencing Principle IDs
- [ ] T042 Manual exploratory test log `specs/001-v0-app-chat/manual-testing.md`

## Dependencies
- Setup (T001–T007) before any test tasks.
- All Tests (T008–T015) must exist & fail before Core (T016–T026).
- URL logic (T016) before background/content that depend (T019–T020).
- Retry helper (T017) before content script (T019).
- Messaging types (T018) before content & background (T019–T020) and contract tests.
- Preferences (T023) before options page (T024) and background usage (T020 update if storing state).
- Integration tasks (T027–T032) after core components exist.
- Polish tasks (T033–T042) after Integration.

## Parallel Execution Examples
```
# Example: Run core test suite creation in parallel after setup
Task: T008 Unit test extraction conversion
Task: T009 Unit test duplicate filtering
Task: T010 Unit test retry logic
Task: T011 Integration test popup
Task: T012 Integration test debounce
Task: T013 Contract test EXTRACT_LATEST
Task: T014 Contract test LIST_ALL
Task: T015 Performance baseline test

# Example: Polish parallel group
Task: T033 Preferences unit tests
Task: T034 LAST_OPENED contract test
Task: T035 Accessibility tests
Task: T036 Performance regression guard
```

## Validation Checklist
- [ ] All design entities represented in tasks
- [ ] Tests precede implementation
- [ ] Parallel tasks touch distinct files
- [ ] Performance baseline included (T015)
- [ ] Accessibility covered (T029, T035)
- [ ] Observability/metrics included (T025, T030)
- [ ] Research decisions update task included (T038)

