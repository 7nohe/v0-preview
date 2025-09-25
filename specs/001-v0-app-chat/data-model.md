# Data Model: v0.app Preview/Demo URL Opener

## Entities

### PreviewURL
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| rawOrigin | string | Original iframe origin URL (preview host) | MUST be valid https URL |
| demoUrl | string | Transformed demo URL (preview- → demo-) | MUST be https & host replaced if prefix present |
| detectedTimestamp | number | Epoch ms when extraction occurred | >= 0 |
| sourceNodeIndex | number | Index of iframe among matches at extraction | >=0 |
| isDuplicate | boolean | True if another entry with same demoUrl already seen | derived |
| openedRecently | boolean | True if user opened in debounce window | derived transient |

### UserPreference
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| openMode | "auto" | "auto" or "list" | default "auto" |
| patterns | string[] | Additional origin regex patterns | length <= 10, each valid regex |
| lastOpenedUrl | string | Last demoUrl opened | optional, valid https |
| debounceMs | number | Debounce threshold for repeated opens | 200–3000 step 100 |
| focusBehavior | "focus" | focus or notify | default focus (TBD) |

### ExtractionAttempt
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| attemptIndex | number | Retry attempt # | 0..4 |
| success | boolean | Whether iframe found | boolean |
| elapsedMs | number | Time from initial trigger | >=0 |

### MetricsEvent (Logging abstraction)
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| eventType | string | e.g., "extraction.success", "extraction.none" | enumerated |
| timestamp | number | Epoch ms | >=0 |
| payload | object | Minimal structured data (counts) | no PII |

## Relationships
- UserPreference has many PreviewURL (conceptual historical list, may not persist all).
- ExtractionAttempt sequence relates to one user trigger.
- MetricsEvent emitted per trigger & key result (success/fail).

## State Transitions
1. Triggered → Retrying (0..n attempts) → Found | NotFound.
2. Found → Opened (tab created) → Debounced (if subsequent within debounceMs).
3. Preferences Updated → Re-render popup (list ordering preserved).

## Derived / Business Rules
- demoUrl = rawOrigin with first occurrence of "https://preview-" replaced with "https://demo-" if present.
- Latest preview = highest sourceNodeIndex at extraction moment.
- Duplicates filtered so only first (latest) retained in display list OR consolidated (pending R1 decision).
- openedRecently true if (now - lastOpenedTimestamp) < debounceMs.

## Validation Rules
- All URLs must start with https:// and end with a valid domain segment `.vusercontent.net` (subject to pattern extension).
- patterns entries failing regex compile ignored + logged.
- debounceMs outside allowed range resets to default (e.g., 1200ms) and emits metrics event.

## Open Questions Mapping
- R1 affects duplicate presentation.
- R2 influences persistence of lastOpenedUrl & preference fields.
- R5 may expand patterns population mechanism.
- R6 finalizes debounceMs default.
- R7 sets focusBehavior default.

## Performance Considerations
- Extraction should avoid full DOM traversal: direct querySelectorAll for `iframe[id^="v0-preview-"]`.
- Sorting cost negligible (≤5 iframes). Maintain O(n) pass with reverse scan.

## Security & Privacy
- No storage of raw chat text.
- Only origin URLs and metadata captured; ephemeral arrays cleared after popup close.
