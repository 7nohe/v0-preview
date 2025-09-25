# v0 Preview/Demo URL Opener (Extension)

Early scaffolding. Implementation will follow TDD per `specs/001-v0-app-chat/tasks.md`.

## Scripts
- `dev`: run Vite dev + CRX
- `build`: production bundle
- `lint`: ESLint
- `test`: Vitest run all tests

## Architecture (planned)
- content script extracts preview iframe origins
- background manages list & messaging
- popup displays list & allows open

## Next
1. Write failing tests (Phase 3.2)
2. Implement core modules to satisfy tests
