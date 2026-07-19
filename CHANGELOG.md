# Changelog

All notable changes to AccessSphere AI are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [1.0.0] – 2026-07-19

### Added
- **Grounded Gemini 2.5 Flash assistant** — manual function-calling loop (`app/assistant.py`) over four typed tool declarations: `get_venue_info`, `find_accessible_services`, `get_live_status`, `plan_visit`.
- **Streaming chat endpoint** (`POST /api/chat/stream`) — NDJSON delta frames with graceful mid-stream error handling.
- **Gemini Vision OCR endpoint** (`POST /api/vision-ocr`) — base64 image → accessibility-annotated English translation; falls back to offline description when no key is set.
- **Deterministic offline engine** (`app/offline.py`) — keyword/intent engine for en/es/fr/ar; identical tool interface to the live path; activates automatically on no-key or API error.
- **16-venue FIFA WC 2026 dataset** (`data/venues.json`) — gates, accessibility services, transport, and simulated live-ops feed.
- **Per-IP token-bucket rate limiter** — in-memory (default) and Redis-backed (distributed, atomic Lua script).
- **Strict security headers** on every response — CSP `default-src 'self'`, HSTS, COOP/CORP `same-origin`, `X-Frame-Options: DENY`, `Permissions-Policy`.
- **Path-traversal-hardened static fallback** — resolves and rejects encoded `../` and symlink escapes.
- **React 19 SPA** — 8 pages (Dashboard, Assistant, Navigation, LiveMap, Planner, Vision, Profile, Evaluation) with glassmorphism design, WCAG 2.1 AA compliance.
- **86 automated tests** — 50 pytest (backend) + 36 Vitest (frontend).
- **Full CI pipeline** (`.github/workflows/ci.yml`) — ruff, mypy --strict, interrogate, radon, pytest + coverage, tsc --noEmit, oxlint, vitest, vite build.

### Security
- API key read from server-side environment only — never bundled or logged.
- `dangerouslySetInnerHTML` is not used anywhere in the codebase.
- Pydantic `extra="forbid"` on `ChatRequest` — unknown fields rejected with 422.

---

## [Unreleased]
- E2E Playwright test suite with axe-core WCAG 2.1 A/AA scans per route.
- Mutation testing with Stryker on deterministic domain logic.
- Production deployment to Google Cloud Run (`asia-south1`).
