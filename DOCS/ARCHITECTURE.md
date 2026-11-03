# Architecture

Status: **approved**. Backend implemented 2026-11-02 in a separate repo: `D:\projects\My Portfolio Backend`. Frontend wiring implemented 2026-11-03 with **Server Actions**.
Related: [BACKEND_PLAN.md](BACKEND_PLAN.md) · [FRONTEND_PLAN.md](FRONTEND_PLAN.md) · [FRONTEND_IMPLEMENTATION.md](FRONTEND_IMPLEMENTATION.md)

## Goal

Add a Python + PostgreSQL backend to the portfolio for two features:

1. **Contact messages:** every contact-form submission is stored in Postgres, and the Resend email is still sent.
2. **Post view counts:** each blog post shows a view count. A visitor is counted at most once per post per day.

## Topology

```
 Browser
   │  (Server Action POSTs to the current page, no secrets)
   ▼
 Next.js 16 app (Vercel)                         ── src/
   ├─ pages: static (SSG) as today
   ├─ submitContact()          app/actions/contact.ts     ──┐
   └─ recordView() /           app/actions/post-views.ts  ──┤  server-to-server
      getViewCounts()          (via src/lib/backend.ts)     │  X-API-Key + standard headers
                                                            ▼
 Portfolio Backend: FastAPI (Render/Railway/Fly) ── repo: My Portfolio Backend
   └─ /portfolioapi/v1/...
        │  SQLAlchemy 2.0 async + asyncpg
        ▼
 PostgreSQL 18 (local install / Docker / Neon / Supabase)
```

### Key decisions

| Decision | Choice | Why |
|---|---|---|
| Who calls the backend | **Only the Next.js server**, from Server Actions through the `server-only` client `src/lib/backend.ts` | The browser never sees the backend URL or API key, CORS stays off, and blog pages stay statically generated. |
| Next.js entry points | **Server Actions**, not Route Handlers | The contact form uses `useActionState`, there is no hand-written fetch/JSON plumbing, and Next adds a CSRF Origin check. Each page makes at most one action call, so the client's one-at-a-time action dispatch doesn't matter. |
| Service auth | Shared secret in the `X-API-Key` header | Simplest option that works for one trusted caller. Compared in constant time. |
| Backend layout | Copy of the KaiAvora Backend layering: controller → service → repository → entity, plus mappers and DTOs | Same shape across your projects. Details in BACKEND_PLAN.md. |
| Wire format | KaiAvora `StandardResponse[T]` envelope, camelCase JSON, PascalCase resource paths | Same conventions as KaiAvora. |
| Typing | **No `dict[str, Any]` anywhere.** Every payload, including health checks, is a Pydantic DTO. `mypy --strict`. | Your rule for this project. |
| Repo layout | **Separate repo** `D:\projects\My Portfolio Backend`, alongside this one | The two deploy independently, like the KaiAvora Backend / Webapp split. They are coupled only by the API contract. These docs stay in the frontend repo (also the KaiAvora convention). |
| Email | Stays in Next.js (Resend) | It already works. The backend only stores the message. |

## Request flows

### Contact form

1. The contact form submits its `FormData` to the `submitContact` Server Action.
2. The action validates the input and checks the honeypot (same rules as the old `/api/contact` route, which was removed).
3. The action calls `POST /portfolioapi/v1/ContactMessages` with the API key and forwards the visitor's IP as `X-Client-IP` and their `User-Agent`.
4. The backend validates the input again, inserts a row into `contact_messages`, and returns `201` with an envelope containing `{id, createdAt}`.
5. The action sends the email through Resend (unchanged).
6. Failure policy: success if either the store or the email worked, so a message is never lost. Failures are logged. If both fail, the form shows "Failed to send message." A thrown action (network failure, or a stale action ID after a deploy) shows "Please refresh and try again."

### Post view

1. A post page (still static) renders a `<ViewCounter slug>` client component.
2. When the page mounts, the component calls the `recordView(slug)` Server Action once. The action accepts only slugs of existing posts, skips obvious bots by user agent, and calls `POST /portfolioapi/v1/PostViews/{slug}`, forwarding the client IP as `X-Client-IP` and the user agent (both read with `headers()`).
3. The backend computes `HMAC-SHA256(salt, ip|ua|utcDate)`. Inserting `(slug, visitor_hash, day)` with `ON CONFLICT DO NOTHING` decides whether this is a new view. Only a new view increments `post_views.count`. The response returns the current count.
4. The blog index reads counts for all posts in one call: the `getViewCounts(slugs)` Server Action → `GET /portfolioapi/v1/PostViews?slugs=...`.
5. If the backend is unconfigured or unavailable, the actions return `null` and no count is shown.

## Data model

| Table | Columns | Notes |
|---|---|---|
| `contact_messages` | `id` UUID PK, `name` varchar(200), `email` varchar(200), `message` text, `ip_address` inet null, `user_agent` varchar(512) null, `created_at`, `updated_at` | Indexed on `created_at` |
| `post_views` | `slug` varchar(200) PK, `view_count` bigint, `created_at`, `updated_at` | One row per post |
| `post_view_events` | PK (`slug`, `visitor_hash` char(64), `view_date` date) | Used only for de-duplication. Old rows can be pruned. Indexed on `view_date`. |

## Privacy

- Raw IPs are **not stored for views**. Only a salted hash that changes daily is kept, so visitors can't be tracked across days.
- Contact messages store the sender's IP and user agent to help with spam handling. The site footer or privacy note should mention this.
- Logs mask email addresses, following the KaiAvora `mask_email` convention.

## Environments

| Env | Next.js | Backend | DB |
|---|---|---|---|
| Local | `npm run dev` on :3000 | `uvicorn` on :8000 (or `docker compose up --build`). The KaiAvora backend also defaults to :8000, so don't run both at once, or move one of them and change `BACKEND_URL` to match. | Native PostgreSQL 18 on :5432, or the Docker one on host port **5433** |
| Production | Vercel | Render, Railway or Fly (Docker image) | Neon or Supabase |

Secrets: `BACKEND_API_KEY` (Next) must equal `API_KEY` (backend). `VISITOR_HASH_SALT` and `DATABASE_URL` are set only on the backend.

> Note: PostgreSQL 18 is installed natively and listens on :5432. That's why Docker's Postgres is published on 5433. Docker itself isn't installed yet; `docker-compose.yml` is ready for when it is.
