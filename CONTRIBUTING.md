# Contributing to AccessSphere AI

Thank you for your interest in contributing! This document describes how to set up a development environment and the quality gates you need to pass before submitting a pull request.

---

## Development Setup

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 22 |
| Python | ≥ 3.12 |
| Git | any recent version |

### Backend

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
pip install -r requirements-dev.txt

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
npm install
npm run dev          # Vite dev server + proxy to :8000
```

---

## Quality Gates (all must pass before merging)

### Python backend

```bash
ruff check app tests          # lint — zero findings
mypy app                      # strict type check — zero errors
interrogate app               # docstring coverage ≥ 95%
python -m radon cc app -n C   # complexity — no grade C or worse
coverage run -m pytest
coverage report -m --fail-under=90
```

### TypeScript frontend

```bash
npm run typecheck             # tsc --noEmit — zero errors
npm run lint                  # oxlint — zero warnings
npm test                      # vitest — all pass
npm run build                 # production build — must succeed
```

---

## Pull Request Checklist

- [ ] All CI checks pass (see `.github/workflows/ci.yml`)
- [ ] New Python code has docstrings on every public function/class
- [ ] New TypeScript code has proper type annotations (no implicit `any`)
- [ ] Security-sensitive changes are reflected in `SECURITY.md`
- [ ] New features are listed in `CHANGELOG.md` under `[Unreleased]`

---

## Code Style

- **Python**: `ruff` handles formatting; follow the existing module docstring convention.
- **TypeScript**: `oxlint` enforces rules; use `React.FC` and explicit return types on custom hooks.
- **CSS**: Feature-co-located `.css` files alongside each page/component; use CSS custom properties from `src/index.css`.

---

## License

By contributing you agree that your contributions will be licensed under the [MIT License](LICENSE).
