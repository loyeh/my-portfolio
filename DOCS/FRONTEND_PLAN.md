# Frontend Plan: Connecting Next.js to the Portfolio Backend

Status: **approved**, not started. The backend ([BACKEND_PLAN.md](BACKEND_PLAN.md)) is implemented in `D:\projects\My Portfolio Backend`.
Related: [ARCHITECTURE.md](ARCHITECTURE.md)

This project runs **Next.js 16.2**. As `AGENTS.md` says, check `node_modules/next/dist/docs/` before writing code. The relevant guides are `01-app/01-getting-started/15-route-handlers.md`, `01-app/02-guides/backend-for-frontend.md` and `01-app/02-guides/environment-variables.md`. Points that matter here:
- Route handler `params` is a Promise. Type it with the global `RouteContext<'/api/views/[slug]'>` helper.
- Non-GET route handlers are never cached. GET handlers are also uncached by default.

## Principles

- **The browser never talks to the backend.** Only route handlers and server code call it, using `BACKEND_URL` and `BACKEND_API_KEY`. Neither variable has the `NEXT_PUBLIC_` prefix.
- **Blog pages stay static (SSG).** View counts load on the client after the page renders, so publishing a post never depends on the backend being up.
- **Failures are soft.** If the backend is down, the contact form still emails and view counts are simply hidden.

## 1. Environment (`.env.example` / `.env.local`)

```
# Portfolio backend (repo: My Portfolio Backend). Server-only, never prefix with NEXT_PUBLIC_.
BACKEND_URL=http://127.0.0.1:8000
BACKEND_API_KEY=            # must equal API_KEY in the backend repo's .env
```

## 2. New and changed files

| File | Change |
|---|---|
| `src/types/backend.ts` | **New.** TypeScript types that mirror the backend DTOs: `StandardResponse<T>`, `ResponseMetadata`, `ContactMessageCreated`, `PostView`, `PostViewCollection`. |
| `src/lib/backend.ts` | **New.** Server-only client. Starts with `import "server-only"` (add the `server-only` package). Contains `backendFetch<T>(path, init, clientHeaders)`, which adds `X-API-Key`, forwards `X-Forwarded-For` and `User-Agent`, uses a 3 s timeout (`AbortSignal.timeout`) and `cache: "no-store"`, unwraps the envelope and returns `data` or throws `BackendError`. It also has typed helpers: `createContactMessage`, `recordPostView`, `getPostView`, `getPostViews`. |
| `src/app/api/contact/route.ts` | **Changed.** After the current validation and honeypot check, call `createContactMessage(...)` inside try/catch and log failures. Then send the email as today. Return 502 only if the email fails *and* the message was not stored. |
| `src/app/api/views/[slug]/route.ts` | **New.** `POST` validates the slug against `getAllPostSlugs()` (404 for unknown slugs, so the table can't be filled with junk), returns `{ viewCount: null }` without calling the backend for bot user agents, and otherwise calls `recordPostView`. `GET` returns the current count. Both return `{ viewCount: number \| null }`, with null when the backend is unavailable. |
| `src/app/api/views/route.ts` | **New.** `GET ?slugs=a&slugs=b` calls `getPostViews` and returns `{ counts: Record<string, number> }`. Slugs are capped at 100 and filtered to known posts. |
| `src/components/blog/view-counter.tsx` | **New** client component (`"use client"`). On mount it POSTs once per slug, with a guard against React Strict Mode's double effect in development. It renders `· 1,234 views` styled like the existing meta line (`font-mono text-xs`), and renders nothing while loading or on error. |
| `src/app/blog/[slug]/page.tsx` | **Changed.** Render `<ViewCounter slug={slug} />` next to `{formatDate(post.date)} · {post.readingTime}`. |
| `src/components/blog/post-card.tsx` + `src/app/blog/page.tsx` | **Changed.** The blog index fetches all counts in one call through a small client wrapper (`PostViewCounts` context) and passes them to each `PostCard`, which shows `{readingTime} · {n} views`. |
| `.env.example` | **Changed.** Adds the two variables above. |

## 3. Client IP forwarding

On Vercel, a route handler reads the client IP from the `x-forwarded-for` request header (first entry) and the user agent from `user-agent`. It forwards both to the backend as `X-Forwarded-For` and `User-Agent`. On the backend, `get_standard_headers` → `_parse_client_ip` validates the IP; this is already part of the KaiAvora pattern.

## 4. Bot filtering

A simple regex in the views route: `/bot|crawler|spider|crawling|preview|headless|lighthouse/i`. A match skips the backend call. Link-unfurl bots and Lighthouse runs then don't inflate counts.

## 5. Testing and verification

1. Run `npm run lint` and `npm run build`. The build must still prerender `/blog/[slug]` statically; check the `○`/`●` markers in the build output.
2. Manual run with the backend up: open a post and confirm the count increments once, stays the same on reload, and appears on the `/blog` index. Submit the contact form and confirm the row appears in `GET /ContactMessages` (Swagger) and the email arrives.
3. Manual run with the backend down: posts render with no count shown, and the contact form still sends the email.

## 6. Order of work

1. Add the env variables, `src/types/backend.ts` and `src/lib/backend.ts`.
2. Update the contact route to store messages.
3. Add the views route handlers.
4. Add `ViewCounter` to the post page.
5. Add counts to the blog index.
6. Run lint and build, then the manual checks above.
