# Contracts: Messaging & Interfaces

## Content Script → Background Messages
| Message | Payload | Response | Description |
|---------|---------|----------|-------------|
| EXTRACT_LATEST | { retry:boolean } | { demoUrl?:string, found:boolean, attempts:number } | Request extraction & conversion |
| LIST_ALL | none | { urls: DemoUrlItem[] } | Return ordered list (newest→oldest) |

### Types
```
DemoUrlItem {
  demoUrl: string;
  rawOrigin: string;
  detectedTimestamp: number;
  isDuplicate: boolean;
}
```

## Background → Popup Events (future)
| Event | Payload | Description |
|-------|---------|-------------|
| LAST_OPENED | { demoUrl:string, at:number } | Notify popup to highlight last opened |

## Error Handling
- All responses include HTTP-like code field: 0 (OK), 1 (NOT_FOUND), 2 (ERROR).
- Unexpected exceptions return code=2 with message string (non-sensitive).

## Performance Notes
- EXTRACT_LATEST must resolve <300ms under baseline DOM size.

## Open Points
- Whether LIST_ALL includes duplicates collapsed depends on R1 decision.
