# Backend Plan: Portfolio Backend (FastAPI + PostgreSQL)

Status: **implemented** 2026-11-02 in the separate repo `D:\projects\My Portfolio Backend`. The tree below is the repo root (shown as `backend/`).
Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [FRONTEND_PLAN.md](FRONTEND_PLAN.md)

The folder structure and naming copy **KaiAvora Backend** (`KaiAvora Project/KaiAvora Backend`), scaled down to two domains: **contact messages** and **post views**. Anything KaiAvora has only for HIPAA, Entra, Celery or payments (encryption, audit, PHI soft delete, integrations, tasks, analytics DB) is left out.

**Project rule:** never use `dict[str, Any]` (or a bare `Any` payload). Every request body, response body, health payload and error envelope is a Pydantic DTO, and `mypy --strict` enforces it.

## 1. Folder structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                              # create_app(), lifespan, middleware, exception handlers
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── health_controller.py
│   │       ├── contact_message_controller.py
│   │       └── post_view_controller.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                        # Settings + @lru_cache get_settings()
│   │   ├── database.py                      # Base, init_engine, dispose_engine, session_scope
│   │   ├── dependencies.py                  # require_api_key (ApiKeyDep)
│   │   ├── logger.py                        # structlog + request_id_ctx
│   │   └── visitor_hash.py                  # HMAC daily visitor fingerprint
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py                      # re-exports + get_db dependency
│   │   └── base_repository.py               # BaseRepository[EntityType]
│   ├── entities/
│   │   ├── __init__.py                      # imports every entity (mapper registry)
│   │   ├── audit_mixin.py                   # TimestampMixin
│   │   ├── contact_message_entity.py
│   │   ├── post_view_entity.py
│   │   └── post_view_event_entity.py
│   ├── mappers/
│   │   ├── __init__.py
│   │   ├── contact_message_mapper.py
│   │   └── post_view_mapper.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── request_id.py                    # X-Request-ID / X-Correlation-ID
│   │   ├── security_headers.py
│   │   └── rate_limit.py                    # in-memory, per client IP, writes only
│   ├── models/
│   │   ├── __init__.py
│   │   ├── requests/
│   │   │   ├── __init__.py
│   │   │   ├── standard_headers.py          # StandardRequestHeaders
│   │   │   ├── contact_message_request_dto.py
│   │   │   └── post_view_request_dto.py     # PostViewCountsQueryDto (slugs)
│   │   └── responses/
│   │       ├── __init__.py
│   │       ├── standard_response.py         # StandardResponse[T], ResponseMetadata, enums
│   │       ├── base_collection_response_dto.py
│   │       ├── health_check_response_dto.py
│   │       ├── contact_message_response_dto.py
│   │       ├── contact_message_collection_response_dto.py
│   │       ├── post_view_response_dto.py
│   │       └── post_view_collection_response_dto.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── contact_message_repository.py
│   │   ├── post_view_repository.py
│   │   └── post_view_event_repository.py
│   ├── routers/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── router.py                    # v1_router, mounts controllers
│   ├── services/
│   │   ├── __init__.py
│   │   ├── contact_message_service.py
│   │   └── post_view_service.py
│   └── utils/
│       ├── __init__.py
│       ├── general.py                       # to_camel_case, mask_email
│       ├── headers.py                       # get_standard_headers, _parse_client_ip
│       ├── response_builder.py              # build_response()
│       ├── exception_handlers.py
│       └── exceptions/
│           ├── __init__.py
│           ├── base.py                      # BaseServiceException
│           └── domain_exceptions.py         # NotFoundError, ValidationError, UnauthorizedError, …
├── alembic/
│   ├── env.py                               # async; URL from Settings
│   ├── script.py.mako
│   └── versions/
│       └── 0001_contact_messages_post_views.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py                          # app + AsyncClient fixtures
│   ├── test_health.py
│   ├── test_auth.py
│   ├── test_contact_messages.py
│   ├── test_post_views.py
│   ├── test_request_dto_extra_forbid.py     # every request DTO has extra="forbid"
│   ├── test_migration_revisions.py
│   └── integration/
│       ├── __init__.py
│       └── test_post_views_database.py      # real Postgres, skipped without TEST_DATABASE_URL
├── scripts/
│   └── prune_post_view_events.py            # delete dedupe rows older than N days
├── .dockerignore
├── .env.example
├── .gitignore
├── alembic.ini
├── CLAUDE.md                                # backend-specific agent guide (KaiAvora style)
├── docker-compose.yml                       # postgres:18-alpine (host :5433) + api
├── Dockerfile                               # multi-stage, non-root, migrate then exec uvicorn
├── pyproject.toml                           # tool config only (ruff, black, mypy, pytest)
├── README.md
├── requirements.txt                         # pinned runtime deps
└── requirements-dev.txt                     # -r requirements.txt + test/lint tools
```

## 2. Naming conventions (same as KaiAvora)

| Layer | File | Class or symbol |
|---|---|---|
| Controller | `controllers/v1/<domain>_controller.py` | `router = APIRouter(tags=[...])` |
| Service | `services/<domain>_service.py` | `ContactMessageService(db)` |
| Repository | `repositories/<domain>_repository.py` | `ContactMessageRepository(BaseRepository[ContactMessageEntity])` |
| Entity | `entities/<table_singular>_entity.py` | `ContactMessageEntity(Base, TimestampMixin)` |
| Mapper | `mappers/<domain>_mapper.py` | pure functions such as `request_to_entity`, `entity_to_response_dto` |
| Request DTO | `models/requests/<domain>_request_dto.py` | `ContactMessageRequestDto` |
| Response DTO | `models/responses/<domain>_response_dto.py` | `ContactMessageResponseDto` |
| Collection DTO | `models/responses/<domain>_collection_response_dto.py` | `ContactMessageCollectionResponseDto` with `totalCount` and `contactMessageCollection` |
| Migration | `alembic/versions/NNNN_<snake_description>.py` | `revision = "0001"` |
| Tests | `tests/test_<domain>.py` | `test_<behavior>` |

DTO config, copied from KaiAvora:

```python
model_config = ConfigDict(
    alias_generator=AliasGenerator(
        validation_alias=lambda field_name: to_camel_case(field_name),
        serialization_alias=lambda field_name: to_camel_case(field_name),
    ),
    from_attributes=True,
    populate_by_name=True,
    str_strip_whitespace=True,   # request DTOs
    extra="forbid",              # request DTOs (enforced by a test)
)
```

## 3. Wire format

- Base path: **`/portfolioapi/v1`**. Swagger UI is at **`/portfolioapi`** (FastAPI's built-in `docs_url`; no vendored static assets).
- Resource segments are **PascalCase plurals**. Path params use camelCase aliases.
- Every route depends on `headers: StandardRequestHeaders = Depends(get_standard_headers)`.
- Every response goes through `build_response(data=..., headers=headers)`, which returns this envelope:
  `{ metadata: {status, requestId, correlationId, httpStatusCode}, data, userMessageCollection }`
  It also echoes `X-Request-ID`, `X-Correlation-ID`, `Action-Status-Code` and `Action-Status` as response headers.
- Errors (`HTTPException`, `RequestValidationError`, `BaseServiceException`, any unhandled exception) are wrapped in the same envelope by `utils/exception_handlers.py`.

**One change from KaiAvora:** there is no `CustomAPIRouter`. In KaiAvora it exists so `build_response()` can skip response validation, and it carries `dict[str, Any]` in its signatures. FastAPI already skips `response_model` validation whenever a handler returns a `Response` object. So plain `APIRouter` with `response_model=StandardResponse[XDto]` gives the same OpenAPI docs and runtime behavior without `Any`. Standard error responses are declared once on `v1_router` with `responses={401: {"model": ErrorResponseDto}, 422: {...}, 500: {...}}`.

## 4. Endpoints

All endpoints except `/HealthCheck` require `X-API-Key`.

| Method | Path | Body / query | `data` returned |
|---|---|---|---|
| GET | `/portfolioapi/v1/HealthCheck` | none | `HealthCheckResponseDto {status, database}`. Runs `SELECT 1`; returns 503 envelope if the DB is down. |
| POST | `/portfolioapi/v1/ContactMessages` | `ContactMessageRequestDto {name, email, message}` | `ContactMessageCreatedResponseDto {id, createdAt}` (201) |
| GET | `/portfolioapi/v1/ContactMessages?skip=&limit=` | none | `ContactMessageCollectionResponseDto {totalCount, contactMessageCollection[]}`, newest first |
| GET | `/portfolioapi/v1/ContactMessages/{contactMessageId}` | none | `ContactMessageResponseDto`, or a 404 envelope |
| POST | `/portfolioapi/v1/PostViews/{slug}` | none. Visitor comes from the `X-Forwarded-For` and `User-Agent` headers | `PostViewResponseDto {slug, viewCount, counted}` |
| GET | `/portfolioapi/v1/PostViews/{slug}` | none | `PostViewResponseDto` (0 if never viewed) |
| GET | `/portfolioapi/v1/PostViews?slugs=a&slugs=b` | `slugs` 1–100, each matching `^[a-z0-9]+(?:-[a-z0-9]+)*$` | `PostViewCollectionResponseDto {totalCount, postViewCollection[]}` |

Validation follows `src/app/api/contact/route.ts`: name ≤ 200, email ≤ 200 and must match `^[^\s@]+@[^\s@]+\.[^\s@]+$`, message 1–5000, all trimmed. The honeypot field stays in Next.js only, so it is not part of the backend DTO.

## 5. Layer responsibilities

- **Controller:** HTTP shape only. Builds the service, calls it, returns `build_response`.
- **Service:**
  - `ContactMessageService.create(request, headers)` builds an entity through the mapper (IP and user agent come from the headers), saves it through the repository, commits, logs `contact_message_created` with a masked email, and returns the DTO.
  - `PostViewService.record_view(slug, headers)` computes the visitor hash, calls `PostViewEventRepository.try_insert(...) -> bool`, and if the view is new calls `PostViewRepository.increment(slug) -> int` (`INSERT … ON CONFLICT DO UPDATE … RETURNING`). Both run in one transaction.
- **Repository:** SQLAlchemy queries only; no business rules.
- **core/visitor_hash.py:** `compute_visitor_hash(ip, user_agent, view_date) -> str` (HMAC-SHA256 with `VISITOR_HASH_SALT`).
- **core/dependencies.py:** `require_api_key` compares the header to `Settings.api_key` with `secrets.compare_digest`. On failure it raises `UnauthorizedError` (401 envelope). It is applied per router in `router.py`: `dependencies=[Depends(require_api_key)]`.

## 6. Settings (`core/config.py`)

`app_name`, `app_version`, `environment: Literal["local","dev","production"]`, `debug`, `api_host`, `api_port`, `database_url: PostgresDsn` (`postgresql+asyncpg://…`), `database_echo`, `database_pool_size`, `database_max_overflow`, `api_key: SecretStr`, `visitor_hash_salt: SecretStr`, `rate_limit_per_minute`, `log_level`, `log_json`. Read from `.env` locally and from environment variables in production. `get_settings()` is wrapped in `@lru_cache` and is called inside functions, never at import time.

## 7. Dependencies (pinned, matching KaiAvora versions)

`requirements.txt`:

| Package | Version |
|---|---|
| fastapi | 0.136.1 |
| starlette | 1.3.1 |
| uvicorn[standard] | 0.32.1 |
| pydantic | 2.10.3 |
| pydantic-settings | 2.6.1 |
| sqlalchemy[asyncio] | 2.0.36 |
| asyncpg | 0.30.0 |
| alembic | 1.14.0 |
| structlog | 24.4.0 |

`requirements-dev.txt`: `-r requirements.txt`, then pytest 8.3.4, pytest-asyncio 0.24.0, pytest-cov 6.0.0, httpx 0.28.1, ruff 0.8.4, black 24.10.0, mypy 1.13.0 and pip-audit 2.7.3.

Tool config in `pyproject.toml` is the same as KaiAvora: ruff rules E/F/I/B/UP/S/ASYNC/SIM/C4/RUF, black at line length 100, `mypy --strict` with the pydantic plugin, and pytest with `asyncio_mode = "auto"` and warnings treated as errors.

## 8. Testing

- Unit and API tests use `httpx.AsyncClient` with `ASGITransport` and replace `get_db` with fakes (the KaiAvora pattern), so no database is needed. They cover the envelope shape, 401 without or with a wrong key, 422 enveloped validation errors, the slug regex, and mapper and service logic.
- Integration tests in `tests/integration/` run against a real Postgres when `TEST_DATABASE_URL` is set; otherwise they are skipped. They cover de-duplication (same visitor twice counts 1, a new visitor counts 2) and concurrent increments.
- `test_request_dto_extra_forbid.py` checks that every request DTO sets `extra="forbid"`.
- `test_migration_revisions.py` checks that the Alembic revisions form a single linear chain.

## 9. Commands (documented in the backend repo's CLAUDE.md and README)

```bash
cd "D:/projects/My Portfolio Backend"
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
copy .env.example .env
# native Postgres 18 on :5432 (createdb -U postgres portfolio), or: docker compose up -d postgres (:5433)
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
# Swagger: http://127.0.0.1:8000/portfolioapi

.venv/Scripts/python.exe -m pytest
.venv/Scripts/python.exe -m ruff check app tests
.venv/Scripts/python.exe -m black --check app tests
.venv/Scripts/python.exe -m mypy app
```

## 10. Implementation order (after approval)

1. Skeleton: `requirements*.txt`, `pyproject.toml`, `.env.example`, `.gitignore`, `core/config.py`, `core/logger.py`, `core/database.py`, `db/`.
2. Wire format: `models/requests/standard_headers.py`, `models/responses/standard_response.py`, `utils/` (headers, response builder, exceptions, handlers), middleware, `main.py`, `routers/v1/router.py`, health controller, and `test_health.py`.
3. Entities, `audit_mixin.py`, Alembic `env.py`, and migration `0001`.
4. Contact messages: DTOs, mapper, repository, service, controller and tests.
5. Post views: `visitor_hash.py`, DTOs, mapper, repositories, service, controller and tests.
6. Auth (`require_api_key`), rate limiting, `test_auth.py`, and `test_request_dto_extra_forbid.py`.
7. `Dockerfile`, `docker-compose.yml`, `README.md`, `CLAUDE.md`, and the prune script.
8. Verify: `pytest`, `ruff`, `black --check` and `mypy --strict` all pass locally. Integration tests run once a Postgres is available.

Frontend wiring is a separate step; see [FRONTEND_PLAN.md](FRONTEND_PLAN.md).

## 11. Out of scope (for now)

Admin UI for reading messages (use Swagger or `psql`), marking messages read or archived, deploying the backend, and CI pipelines.
