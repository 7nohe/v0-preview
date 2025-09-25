<!--
Sync Impact Report
Version change: 0.1.0 (initial template) → 1.0.0
Modified principles: (template placeholders replaced with concrete principles)
Added sections: Performance & Resource Standards, Delivery Workflow & Quality Gates
Removed sections: None (all template slots instantiated)
Templates requiring updates:
	.specify/templates/plan-template.md ✅ (Constitution reference remains valid; gates align with principles I-V)
	.specify/templates/spec-template.md ✅ (Testable requirement language consistent with Principle II & III)
	.specify/templates/tasks-template.md ✅ (TDD & performance tasks reflect Principles II, III, IV)
	.specify/templates/agent-file-template.md ⚠ Pending manual review to incorporate new principle names explicitly if referenced
Deferred TODOs: NONE
-->

# V0 Preview Project Constitution

## Core Principles

### I. Code Quality Is Enforced, Not Assumed
All committed code MUST meet objective quality gates: zero lint errors, cyclomatic complexity within agreed thresholds (default <=10 per function), clear naming, and no dead or commented‑out legacy blocks at merge time. Architectural boundaries (modules, layers) MUST be explicit; cross-layer imports require justification in the PR description. Any new public interface MUST ship with usage documentation in the same PR. No TODO/FIXME comments can merge unless linked to a tracked issue. Rationale: Explicit, measurable rules prevent silent erosion of maintainability and reduce downstream refactor cost.

### II. Test-First & Comprehensive Coverage (NON‑NEGOTIABLE)
All functional behavior MUST originate from failing tests (Red → Green → Refactor). Minimum coverage thresholds: 90% line, 80% branch on changed code; critical core modules (auth, persistence, data processing) MUST reach 95% line coverage. Each bug fix MUST include a regression test that fails before the fix. Contract tests define external behavior; unit tests isolate logic; integration tests validate cross-module correctness; performance tests protect thresholds (see Principle IV). Merges without green CI (including performance and lint gates) are forbidden. Rationale: Prevents regressions and ensures design clarity before implementation details solidify.

### III. Consistent User Experience & Interface Contracts
User-facing outputs (CLI messages, API responses, file formats) MUST be deterministic, versioned when breaking, and follow a documented style guide (tone, tense, field naming). Breaking output changes REQUIRE a version bump and migration notes. Error surfaces MUST be structured (machine-parseable JSON or defined schema) plus a concise human-readable message. Documentation QUICKSTART paths MUST remain executable after each release; CI MUST run a smoke test that executes the quickstart to validate freshness. Rationale: Predictability lowers user cognitive load and stabilizes integrations.

### IV. Performance & Resource Discipline
Every feature MUST declare at least one measurable performance or resource acceptance criterion (latency, throughput, memory, startup time). Default global baselines (override only with justification): p95 API latency < 200ms (local test harness), steady‑state memory growth < 5% over 1h synthetic load, critical operations complete < 2s, and CLI startup < 400ms. Performance tests MUST fail the build if regression >10% from last green baseline. Any optimization beyond baselines MUST include a benchmark demonstrating net gain ≥15% vs prior. Rationale: Guardrails maintain responsiveness and prevent reactive optimization crises.

### V. Observability & Traceable Change History
All meaningful state transitions and error paths MUST emit structured logs with correlation IDs. Metrics MUST exist for latency, error rate, and throughput of critical paths. Each PR MUST include a concise CHANGE SUMMARY (what & why). Changes affecting principles MUST reference the principle ID (I–V) in the PR description. Rationale: High-fidelity telemetry plus contextual change intent accelerates debugging and audits.

## Performance & Resource Standards
These standards operationalize Principles III & IV:
- Latency Benchmarks: Define baseline metrics in `/performance/baselines.md`; updated only after deliberate benchmark PR.
- Benchmark Method: Use stable synthetic dataset; record environment (CPU, memory) and commit hash.
- Regression Policy: >5% warning, >10% hard failure (CI blocks merge) unless waiver approved (documented in PR with mitigation plan).
- Resource Budgets: Memory ceilings per service/module documented; exceeding ceiling triggers investigation task creation.
- Data Format Stability: Output schema changes require semantic version bump (see Governance) unless additive & backward compatible.

## Delivery Workflow & Quality Gates
Workflow stages aligned to Principles I–V:
1. Specification: All functional requirements MUST be testable (Principle II) and user-visible outputs defined (Principle III).
2. Plan: Constitution Check MUST enumerate any anticipated deviations; unjustified complexity blocked (Principle I).
3. Tests First: Contract + unit + integration + performance scaffold BEFORE implementation (Principles II & IV).
4. Implementation: Small commits; each commit passes lint + unit gate locally; feature flag incomplete large features.
5. Review: Reviewer checklist: quality metrics (I), test adequacy (II), UX/output stability (III), performance targets (IV), observability additions (V).
6. Pre-Merge CI Gates: lint, security scan, coverage thresholds, performance regression check, quickstart smoke test, benchmark delta validation.
7. Post-Merge: Baselines updated only on explicit benchmark approval; documentation sync job validates quickstart & API docs.

## Governance
Authority & Amendment:
- This constitution supersedes conflicting development practices.
- Amendments REQUIRE: (a) proposal PR tagging `governance`, (b) impact analysis (principles affected, templates needing updates), (c) version bump rationale, (d) migration/transition guidance if breaking.

Versioning Policy (Semantic Governance Version):
- MAJOR: Removal/redefinition of a principle or backward-incompatible tightening of mandatory thresholds.
- MINOR: Addition of a new principle, new mandatory gate, or expansion of measurable criteria.
- PATCH: Wording clarity, non-normative examples, threshold clarifications without stricter enforcement.

Compliance & Review:
- Every PR description MUST include a Compliance Section noting any deviations (NONE if fully compliant).
- Quarterly (or every 25 merged feature PRs, whichever first) governance audit reviews adherence metrics (lint trend, coverage drift, perf regressions).
- Waivers expire after one release cycle and MUST include mitigation task IDs.

Enforcement:
- CI is the primary enforcement mechanism; maintainers MUST NOT override failing normative gates.
- Repeated non-compliance (≥3 waived merges in a quarter) triggers a remediation plan requirement.

Change Log & Traceability:
- Maintain `CHANGELOG.md` entries referencing principle IDs where relevant.
- Performance baseline updates logged in `/performance/baselines.md` with before/after metrics.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Provide original adoption date | **Last Amended**: 2025-09-24
