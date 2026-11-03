# Frontend Plan: Connecting Next.js to the Portfolio Backend

Status: **implemented** 2026-11-03 with **Server Actions** (uncommitted). The file-by-file details and as-built notes are in [FRONTEND_IMPLEMENTATION.md](FRONTEND_IMPLEMENTATION.md).
Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [BACKEND_PLAN.md](BACKEND_PLAN.md)

> This plan originally used Route Handlers (`/api/contact`, `/api/views/[slug]`, `/api/views`). On 2026-11-03 it switched to Server Actions, and `/api/contact` was removed.

This project runs **Next.js 16.2**. As `AGENTS.md` says, check `node_modules/next/dist/docs/` before writing code. The relevant guides are:
- `01-app/01-getting-started/07-mutating-data.md`: Server Functions, including calling an action from `useEffect` to update a view count
- `01-app/02-guides/server-actions.md`: sequential dispatch, security, deployment
- `01-app/02-guides/data-security.md`: `server-only`
- `01-app/03-api-reference/05-config/01-next-config-js/output.md`: `outputFileTracingIncludes`

## Principles

- **The browser never talks to the backend.** Only Server Actions call it, through `src/lib/backend.ts` (`import "server-only"`), using `BACKEND_URL` and `BACKEND_API_KEY`. Neither variable has the `NEXT_PUBLIC_` prefix.
- **Blog pages stay static (SSG).** View counts load on the client after the page renders, so publishing a post never depends on the backend being up.
- **Failures are soft.** If the backend is down or unconfigured, the contact form still emails and view counts are simply hidden.
- **Every action is a public endpoint.** Each one re-validates its input: known slugs only, and the same contact field rules as before.

## 1. Environment (`.env.example` / `.env.local`)

```
BACKEND_URL=http://127.0.0.1:8000   # KaiAvora also defaults to 8000; don't run both
BACKEND_API_KEY=                    # must equal API_KEY in the backend repo's .env
```

## 2. Files

| File | Role |
|---|---|
| `src/types/backend.ts` | Types that mirror the backend DTOs (`StandardResponse<T>`, `ContactMessageCreated`, `PostViewRecorded`, `PostViewCollection`, …) |
| `src/lib/backend.ts` | Server-only client. Adds `X-API-Key`, forwards the visitor's IP and user agent (from `headers()`), uses a 3 s timeout and `no-store`, and unwraps the envelope. Helpers: `createContactMessage`, `recordPostView`, `getPostViews`, `isBot`. |
| `src/app/actions/contact.ts` | `submitContact` action. Validates, checks the honeypot, stores the message, then emails it. Success if either step worked. |
| `src/app/actions/post-views.ts` | `recordView(slug)` and `getViewCounts(slugs)` actions. Known slugs only, bots skipped. |
| `src/components/sections/contact-form.tsx` | Calls `useActionState(submitContact)`. Controlled inputs, so text survives an error. |
| `src/components/blog/view-counter.tsx` | Calls `recordView` once on mount and renders ` · N views`. |
| `src/components/blog/post-view-counts.tsx` | Provider plus `PostViewCount`: one `getViewCounts` call for the whole blog index. |
| `src/app/blog/[slug]/page.tsx`, `src/app/blog/page.tsx`, `src/components/blog/post-card.tsx` | Render the counters. |
| `next.config.ts` | `outputFileTracingIncludes` ships `src/content/blog/**` with the blog pages, which slug validation needs at runtime. |
| ~~`src/app/api/contact/route.ts`~~ | Removed and replaced by the `submitContact` action. |

## 3. Client IP forwarding

On Vercel, the action reads the visitor's IP from the first `x-forwarded-for` entry (falling back to `x-real-ip`) and the user agent from `user-agent`. It forwards both to the backend as `X-Forwarded-For` and `User-Agent`. The backend validates the IP in `parse_client_ip`.

## 4. Bot filtering

`/bot|crawler|spider|crawling|preview|headless|lighthouse/i`, plus requests with no user agent at all. A match skips the backend call. Bots that don't run JS never call the action anyway.

## 5. Verification

1. `npm run lint` and `npm run build`. `/blog` must stay `○` and `/blog/[slug]` must stay `●`.
2. With the backend up:
   - A post's count goes up once, and a reload doesn't change it.
   - The count appears on `/blog`.
   - The contact form stores a row (Swagger `GET /ContactMessages`) and sends the email.
3. With the backend down: posts render without counts, and the contact form still emails.
4. Production: deploy the backend, then set `BACKEND_URL` and `BACKEND_API_KEY` in Vercel. Until then production behaves as before.
