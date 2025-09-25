# Feature Specification: Chrome拡張: v0.appチャット画面からPreview URL抽出&新規タブ起動

**Feature Branch**: `001-v0-app-chat`  
**Created**: 2025-09-24  
**Status**: Draft  
**Input**: User description: "v0.appのchat画面からpreview urlを抽出して別タブで開けるChrome拡張を作成してください。"

## Extraction Clarification (2025-09-24)
提供された手順に基づき、Preview → Demo URL 取得仕様を以下で確定:
1. DOM上で `iframe[id^="v0-preview-"]` を `document.querySelector` で取得。
2. その `iframe.dataset.origin` から例: `https://preview-xxxx.vusercontent.net` を得る。
3. 文字列中の先頭 `preview-` を `demo-` に置換し、`https://demo-xxxx.vusercontent.net` を最終アクセスURLとする。
4. 複数iframeがある場合は DOM 出現順の最新 (最下部) を「最新」と定義。
5. iframe がまだ存在しないタイミングでの発火時は 300ms 間隔で最大 5 回再試行し、取得失敗時に「Preview URLが見つかりません」を表示。

この手順は FR 群へ反映済み。従来の単純な正規表現パターン走査は補助 (フォールバック) とし、iframe取得が主経路。

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no low-level code specifics)
- 👥 Written for business/stakeholder clarity (日本語要求を英語化して明確化)

### Section Requirements
Mandatory sections completed below.

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
v0.appのチャット画面を閲覧しているユーザーとして、チャット内に表示・返信されたUIのPreview URL（例: `https://v0.dev/preview/...` や同等の一時URL）が複数存在する場合でも、ワンクリックで最新または選択したPreviewを新しいブラウザタブで素早く開き、反復デザイン確認の手間と時間を減らしたい。

### Acceptance Scenarios
1. **Given** ユーザーがv0.appのチャット画面を開いている, **When** 拡張機能のアクションをトリガーする(アイコン/ショートカット), **Then** 直近の最新Preview(Demo変換後) URLが解析され新規タブで開かれる。
2. **Given** チャット内に複数のPreview iframeが存在する, **When** ユーザーが拡張ポップアップで一覧表示から特定のURLを選択する, **Then** 選択したDemo URLが新規タブで開かれる。
3. **Given** iframe未挿入タイミングでユーザーが実行, **When** 最大リトライ回数到達, **Then** 「Preview URLが見つかりません」メッセージが表示される。
4. **Given** チャットが非アクティブタブでユーザーが他作業中, **When** ショートカットを押す, **Then** (仕様検討中) [NEEDS CLARIFICATION: バックグラウンドタブでアクティブ化 or 通知ポリシー確定].

### Edge Cases
- 複数iframeが同時に存在し一部破棄される場合の最新決定 (常に現在DOMに残る最後のノードを採用)。
- dataset.origin 未定義や空文字の場合のフォールバック: 旧パターンマッチ探索。
- preview→demo 置換失敗 (期待接頭辞がない) 場合はそのままのURLを提示し警告表示。
- リトライ中にユーザーが別タブへ移動した場合は中断し通知。
- 同一URLを短時間に連続オープンする多重起動防止 (前回と同一 + <2秒の場合は抑止)。

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST detect active tab domain and proceed only if it matches v0.app chat page pattern.
- **FR-002 (Updated)**: System MUST primarily obtain the latest preview origin via `iframe[id^="v0-preview-"]`'s `dataset.origin`; if none found after retries, fallback to pattern scan.
- **FR-003 (Updated)**: System MUST convert retrieved origin host prefix `preview-` to `demo-` when constructing the final navigated URL; if conversion not applicable, use original.
- **FR-004**: System MUST identify the most recent preview iframe by DOM order (last matching iframe node at action time)。
- **FR-005**: System MUST open the most recent converted Demo URL in a new browser tab upon primary action trigger。
- **FR-006**: System MUST provide a secondary UI (popup or context menu) listing all discovered preview iframe origins (after conversion) newest→oldest。
- **FR-007**: System MUST allow user to click a listed URL entry to open it in a new tab。
- **FR-008**: System MUST show a user-facing message when no Preview/Demo URL is found after max retries。
- **FR-009**: System MUST handle duplicate identical URLs gracefully (list the latest occurrence only) [NEEDS CLARIFICATION: Consolidation表示テキスト].
- **FR-010**: System MUST expose a configurable setting to enable/disable automatic opening vs listing-first mode [NEEDS CLARIFICATION: 設定保存場所(同期/ローカル?)].
- **FR-011**: System MUST support a keyboard shortcut to trigger the “open latest Demo URL” action。[NEEDS CLARIFICATION: 推奨ショートカットキー]
- **FR-012**: System MUST log (for debugging) the count of iframes detected and whether fallback path was used。
- **FR-013**: System MUST avoid opening more than one tab per trigger (idempotent for rapid double-click)。
- **FR-014**: System MUST validate URL format before opening (reject invalid / non-HTTP(S) strings)。
- **FR-015**: System MUST present URLs in popup with truncated display + full copy-on-click or tooltip [NEEDS CLARIFICATION: UI表示仕様詳細].
- **FR-016**: System MUST degrade safely when site structure changes (catch exceptions and show fallback message instead of failing silently)。
- **FR-017**: System MUST support future expansion of iframe id or origin pattern list without code changes (configurable pattern array) [NEEDS CLARIFICATION: 外部設定手段の有無].
- **FR-018**: System MUST ensure actions complete within <300ms after user trigger for ≤50 chat messages and ≤5 preview iframes。
- **FR-019**: System MUST provide deterministic ordering so repeated triggers open the same "latest" URL until a newer iframe appears。
- **FR-020**: System MUST NOT collect or transmit chat content externally (privacy constraint)。
- **FR-021 (New)**: System MUST implement up to 5 retries at 300ms interval if no iframe is initially present before declaring absence。
- **FR-022 (New)**: System MUST prevent reopening identical URL if the same URL was opened within the last 2 seconds (debounce) [NEEDS CLARIFICATION: 時間閾値調整可能性].
- **FR-023 (New)**: System MUST indicate in the popup which URL was last opened (state highlight)。

### Key Entities *(include if feature involves data)*
- **PreviewURL**: attributes: rawOrigin, demoUrl, detectedTimestamp, sourceNodeIndex, isDuplicate(Boolean), openedRecently(Boolean)。
- **UserPreference**: attributes: openMode(auto|list), patterns(list), lastOpenedUrl, debounceMs.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs) → High-level only; Chrome拡張であることは文脈上のWHAT
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders (明確な価値: 時短 / 確実性)
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (複数残存: 設計フェーズで解消)
- [ ] Requirements are testable and unambiguous (曖昧点は明示済)
- [ ] Success criteria are measurable (300ms, retries, debounce)
- [ ] Scope is clearly bounded (v0.app chat page context)
- [ ] Dependencies and assumptions identified (Chrome extension environment assumed)

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
