# Research: Chrome拡張 v0.app Preview/Demo URL Opener (Phase 0)

## Objective
Resolve all outstanding unknowns to allow Phase 1 design without speculative implementation. Each item below MUST reach a DECIDED state with explicit rationale.

## Research Items
| ID | Topic | Question | Acceptance Criteria | Status | Decision | Rationale | Alternatives |
|----|-------|----------|---------------------|--------|----------|-----------|-------------|
| R1 | Duplicate consolidation | 表示テキスト/件数表現 | Clear UX rule (e.g., latest only OR group count) | DECIDED | Keep latest only; implicit consolidation | Reduces cognitive load; ordering already provides temporal context | Badge/count adds noise |
| R2 | Storage scope | sync vs local | Chosen storage API + fallback behavior defined | DECIDED | Use chrome.storage.sync w/ fallback to defaults | Small (<1KB) payload, multi-device benefit outweighs minimal latency | local only (less utility) |
| R3 | Shortcut mapping | Default key | Non-conflicting cross-platform combo chosen | DECIDED | Cmd+Shift+Y (Mac) / Ctrl+Shift+Y (Win/Linux) via one command | Low collision per Chrome docs; mnemonic (Y for v0?) | Alt+Shift+P (less mnemonic) |
| R4 | Popup UI spec | Truncation + full view | Max chars + tooltip/copy interaction defined | DECIDED | Truncate middle after 60 chars; full URL via title attribute | Simple, no extra components; native tooltip | Dedicated modal (overkill) |
| R5 | Pattern configurability | External patterns? | Mechanism or explicit non-support documented | DECIDED | Not supported initial release (hard-coded iframe id rule) | Keeps scope tight; reduces security surface | JSON patterns (adds parsing & UI complexity) |
| R6 | Debounce adjustability | User range | Config range (e.g., 200–2000ms step 100) documented | DECIDED | Allow 500–4000ms step 250 in options (stored debounceMs) | Power users can tune frequency; prevents spam | Fixed value (less flexible) |
| R7 | Background tab behavior | Focus vs notify | Defined: focus tab OR show badge/notification | DECIDED | Always open in new tab (do not auto-focus existing) | Predictable; avoids stealing focus | Badge + reuse tab (complex heuristics) |
| R8 | Accessibility | Keyboard/ARIA | All interactive elements reachable & aria-label present | DECIDED | Roles listbox/option + arrow nav + Enter activate + focus ring | Meets WCAG 2.1 AA basics for list selection | Rely on defaults (insufficient semantics) |
| R9 | Test framework finalize | Vitest vs Jest | Framework chosen with coverage integration | DECIDED | Vitest (speed, ESM friendliness, jsdom) | Lower overhead vs Jest; integrates with Vite | Jest (slower cold start) |
| R10 | Performance baseline harness | Measurement method | Repeatable extraction benchmark script defined | DECIDED | Vitest perf test with synthetic DOM (50 msgs, 5 iframes) threshold <300ms | Automatable in CI | Manual profiling (inconsistent) |
| R11 | Security/CSP | CSP & permissions | Minimal host_permissions & no eval usage | DECIDED | Restrict host to *.vusercontent.net + v0.app content script; no eval | Principle: least privilege | Broad host patterns (unnecessary risk) |

## Methodology
- For each OPEN item: evaluate in minimal spike branch if needed (no production code).
- Record measurable evaluation (timings, extension size) where relevant.

## Planned Experiments
1. Extraction micro-benchmark with synthetic DOM of 50 messages & 5 iframes.
2. Storage API write/read latency (sync vs local) small payload (<1KB).
3. Shortcut conflict check (common Chrome reserved combos).

## Risk Log
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| sync storage quota or sync delay | Settings feel laggy | Low | Keep payload small (<2KB) |
| DOM changes break selector | No URL found | Medium | Fallback pattern scan + telemetry log |
| Shortcut conflict | Feature unusable | Medium | Provide alternative in options |

## Pending Decisions Checklist
- [x] Duplicate consolidation rule
- [x] Storage API choice finalized
- [x] Shortcut default picked
- [x] Popup UI truncation length + copy interaction
- [x] Pattern configuration decision
- [x] Debounce range or fixed value
- [x] Background tab focus/notification policy
- [x] Accessibility baseline
- [x] Test framework finalize
- [x] Performance harness approach
- [x] CSP/permissions minimal set

## Exit Criteria
All checklist items above checked with DECISION rows populated. Then proceed to Phase 1.
