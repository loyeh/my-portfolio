# Backend Session Prompt

Paste the block below as the first message of a new Claude Code session opened in `D:\projects\My Portfolio Backend`.
Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [BACKEND_PLAN.md](BACKEND_PLAN.md) · [FRONTEND_PLAN.md](FRONTEND_PLAN.md)

```
Continue setting up this repo: the FastAPI + PostgreSQL backend for my portfolio site.

Background:
- A previous session scaffolded this repo on 2026-11-02, following the plan in
  `D:\projects\My Portfolio\DOCS\` (ARCHITECTURE.md, BACKEND_PLAN.md, FRONTEND_PLAN.md).
  Read those docs and this repo's CLAUDE.md and README.md first.
- The layout and naming copy my KaiAvora Backend
  (`C:\Users\Dokanize.ir\Documents\Projects\KaiAvora Project\KaiAvora Backend`):
  - layers: controllers/v1 → services → repositories → entities, plus mappers and
    models/requests|responses *_dto.py
  - every response goes through the StandardResponse envelope via build_response
  - PascalCase paths under /portfolioapi/v1
  Keep all new code in that shape.
- Hard rule: never use dict[str, Any] or Any-typed payloads. Every request, response,
  health and error body is a Pydantic DTO, and `mypy --strict` must pass.
- Current state:
  - ruff, black, mypy and pytest all pass (34 passed).
  - The 4 integration tests in tests/integration are skipped until TEST_DATABASE_URL is set.
  - `git init` is done, with nothing committed yet.
  - The .venv is created, with requirements-dev.txt installed.
- Database: PostgreSQL 18 is installed natively on :5432
  (`C:\Program Files\PostgreSQL\18\bin`). docker-compose.yml maps its Postgres to host
  port 5433 to avoid the clash. Docker isn't installed yet.

What to do now:
1. Check that `.env` exists and has DATABASE_URL, API_KEY, VISITOR_HASH_SALT and
   TEST_DATABASE_URL set. If it doesn't, tell me exactly what's missing.
   Don't print secret values.
2. Make sure the `portfolio` and `portfolio_test` databases exist. If they don't, give me
   the createdb commands to run myself with `!`.
3. Run `alembic upgrade head` against `portfolio`. Then run the full check suite:
   pytest (including the integration tests), ruff, black --check and mypy.
   Fix any failures at the root cause.
4. Start uvicorn on :8000. Smoke-test /portfolioapi/v1/HealthCheck, then POST a
   ContactMessage and a PostView using my API key, and show me the response envelopes.
5. When everything is green, propose a commit message and wait for my OK before
   committing.

After that, the next piece of work is the Next.js side, in the portfolio repo
(FRONTEND_PLAN.md). Don't touch that repo from this session.
```

The prompt contains no secrets. The API key and passwords stay in the backend's `.env`, which is git-ignored.
