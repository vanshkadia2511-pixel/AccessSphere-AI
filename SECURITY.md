# Security Policy

AccessSphere AI is designed for high-traffic, public-facing deployment during the FIFA World Cup 2026. This document describes the threat model, the controls in place, and how to report a vulnerability.

## Reporting a Vulnerability

Please open a private security advisory on the repository (GitHub → Security → Advisories → "Report a vulnerability") rather than a public issue. Include reproduction steps and the affected endpoint or component. Reports are triaged within 48 hours.

## Threat Model

| Asset | Threat | Mitigation |
|---|---|---|
| Gemini API key | Leakage via responses, logs, or client bundle | Key lives only in server-side env; `/healthz` reports mode only; never logged or echoed |
| Chat endpoint | Abuse / cost amplification / DoS | Per-IP token-bucket rate limit (20 req/min), 429 on burst; Redis-backed limiter shares the ceiling across replicas |
| User messages | Prompt injection / role override | Frozen system instruction states user turns cannot override rules; venue facts are grounded in function results only |
| API payloads | Oversized / malformed input | Pydantic caps: message ≤ 2000 chars, history ≤ 20 turns, needs enum, `extra="forbid"` on the request body → 422 before any handler runs |
| Static file server | Path traversal (`../`, encoded, symlink) | Fallback route resolves the candidate path and rejects anything outside the built `dist/` directory |
| Browser session | XSS, clickjacking, MIME sniffing, Spectre-class leaks | Strict CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), `X-Frame-Options: DENY`, `nosniff`, COOP/CORP `same-origin`, HSTS — set by API middleware and mirrored in `vercel.json` for static hosting |
| Fan privacy | PII retention | Stateless by design: chat content is never persisted and message bodies are never logged; history round-trips through the client |

## Controls Checklist

- **No secrets committed** — `.env` is git-ignored; `.env.example` contains placeholders only.
- **Strict security headers on every response** — enforced by FastAPI middleware and verified by automated tests (`tests/test_backend.py`).
- **Rate limiting** — in-memory token bucket by default (bounded memory via idle-bucket pruning); atomic Redis Lua script when `REDIS_URL` is set.
- **Input validation** — all request bodies and query parameters validated by Pydantic/FastAPI before handler code runs.
- **No CORS wildcard** — the UI is same-origin with the API; no CORS middleware is registered.
- **XSS-safe rendering** — React virtual DOM only; no `dangerouslySetInnerHTML` anywhere in the codebase.
- **Error hygiene** — stream failures emit a generic `{"type": "error"}` frame; stack traces never reach the client.
- **Dependency hygiene** — lockfiles committed; `npm audit` and `pip` pinned minimums reviewed each release.

## Supported Versions

Only the latest `master` build is supported with security fixes.
