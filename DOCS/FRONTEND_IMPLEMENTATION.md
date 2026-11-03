# Frontend Implementation Plan (Server Actions)

Status: **implemented** 2026-11-03 (uncommitted). Revision 2: uses **Server Actions instead of Route Handlers**.
This turns [FRONTEND_PLAN.md](FRONTEND_PLAN.md) into concrete changes, based on the current code and the backend as built (`D:\projects\My Portfolio Backend`, commits `04bc23c`, `adfc05d`).
Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [BACKEND_PLAN.md](BACKEND_PLAN.md)

## Why Server Actions fit here

- **The browser still never talks to the backend.** An action's code runs only on the server. The client gets only an encrypted action ID, which it POSTs back to the page.
- **The contact form becomes a real `<form action>`.** It can use `useActionState`, it submits even before JS hydrates (progressive enhancement), and there's no hand-written `fetch` or JSON parsing.
- **Recording a view is a mutation.** The Next 16 docs show exactly this pattern: an action called from `useEffect` inside `startTransition`, with a view counter as the example (`01-app/01-getting-started/07-mutating-data.md` › useEffect).
- **The framework adds protection.** Actions get a CSRF Origin/Host check and a 1 MB body limit for free (`01-app/02-guides/server-actions.md` › Security).
- **Pages stay static.** Actions run only when they're invoked, so `/blog` and `/blog/[slug]` remain SSG.

### Trade-offs, and how the plan handles them

| Behaviour (per the docs) | Impact | Handling |
|---|---|---|
| The client sends actions **one at a time** | Several reads in a row would queue | Each page makes **at most one** action call: one record per post page, one batched read on `/blog`. |
| Actions are public POST endpoints | Anyone can call them with any input | Every action validates its input: known slugs only, the same field rules as today, a max length on everything. |
| Action IDs change between deploys | A tab left open across a deploy can fail an action ("Failed to find Server Action") | The view counter fails silently and shows no count. The contact form shows "Please refresh and try again." |
| Actions aren't meant for cached reads | The read on the blog index isn't cached | That's fine, because counts are live by design. One small call per page view. |

## Backend contract (unchanged)

All endpoints use the envelope `{ metadata: { status, requestId, correlationId, httpStatusCode }, data, userMessageCollection }`.

| Next helper | Backend call | `data` |
|---|---|---|
| `createContactMessage` | `POST /portfolioapi/v1/ContactMessages` with `{ name, email, message }` | `{ id, createdAt }` (201) |
| `recordPostView` | `POST /portfolioapi/v1/PostViews/{slug}` | `{ slug, viewCount, counted }` |
| `getPostViews` | `GET /portfolioapi/v1/PostViews?slugs=a&slugs=b` (1–100 slugs) | `{ totalCount, postViewCollection: [{ slug, viewCount }] }` |

Every call sends `X-API-Key`, plus the visitor's `X-Forwarded-For` (first entry) and `User-Agent`. Inside an action these come from `await headers()` (`next/headers`).
The backend's single-post `GET /PostViews/{slug}` isn't needed, because recording a view already returns the count.

## Changes, file by file

### 1. `package.json`
- Add the `server-only` dependency. *(Already installed. I'll uninstall it if you reject the plan.)*

### 2. `.env.example`
Append:
```
# Portfolio backend (repo: My Portfolio Backend). Server-only, never prefix with NEXT_PUBLIC_.
# Leave empty to disable: view counts are hidden and the contact form only emails.
BACKEND_URL=http://127.0.0.1:8000
BACKEND_API_KEY=            # must equal API_KEY in the backend's .env
```
`.env.local` also needs these two values. I can copy `API_KEY` across from the backend's `.env` without printing it.

### 3. `src/types/backend.ts` (new)
These types mirror the backend DTOs:
- `ResponseMetadata`, `UserMessageItem`, `StandardResponse<T>`
- `ContactMessageCreated`, `PostViewRecorded`, `PostViewCollection`, `ContactMessageInput`

Every type is explicit, with no `any`.

### 4. `src/lib/backend.ts` (new, server only)
- Starts with `import "server-only"`.
- `isBackendConfigured()` and `class BackendError extends Error { status: number | null }`.
- `visitorHeaders()` reads `await headers()` and returns `{ "X-Forwarded-For", "User-Agent" }` (first XFF entry only).
- `backendFetch<T>(path, { method, body, searchParams })`:
  - Sets `X-API-Key`, `Content-Type` and `Accept`, plus the visitor headers.
  - Uses `cache: "no-store"` and `signal: AbortSignal.timeout(3000)`.
  - Unwraps the envelope, returning `data` or throwing `BackendError`.
- Typed helpers: `createContactMessage`, `recordPostView`, `getPostViews`. `getPostViews` returns a `Record<string, number>`.
- `isBot(ua)` with `/bot|crawler|spider|crawling|preview|headless|lighthouse/i`.

### 5. `src/app/actions/contact.ts` (new, `"use server"`) → replaces `src/app/api/contact/route.ts`
- `submitContact(prev: ContactFormState, formData: FormData): Promise<ContactFormState>`, where `ContactFormState = { status: "idle" | "sent" | "error"; error?: string }`.
- It reads `name`, `email`, `message` and `company` from `FormData`. Each must be a string; anything else is rejected.
- The honeypot, required fields, email pattern and length limits are **identical to today's route** (200/200/5000).
- It stores the message in the backend (try/catch, logged), then sends the email through Resend as today.

| Stored | Emailed | Result |
|---|---|---|
| any | yes | `{ status: "sent" }` |
| yes | no | `{ status: "sent" }`, with the error logged. The message is safe in the DB. |
| no | no | `{ status: "error", error: "Failed to send message." }` |

- **Delete** `src/app/api/contact/route.ts` (and the now-empty `src/app/api/`).

### 6. `src/components/sections/contact-form.tsx` (changed)
- Switch to `const [state, formAction, pending] = useActionState(submitContact, { status: "idle" })` with `<form action={formAction}>`.
- Inputs get `name` attributes. Field values stay as they are today: controlled inputs keep their values after an error. React 19 resets uncontrolled forms after an action, which would wipe the user's text when sending fails.
- The client-side `canSubmit` check, the "Sending…" label (from `pending`), the success message, error text and styling all stay the same.
- If the action itself throws (network failure, stale action ID), the form shows "Something went wrong. Please refresh and try again."

### 7. `src/app/actions/post-views.ts` (new, `"use server"`)
- `recordView(slug: string): Promise<number | null>`:
  - Returns `null` without calling the backend if `typeof slug !== "string"`, the slug isn't in `getAllPostSlugs()`, the request is from a bot, or the backend isn't configured.
  - Otherwise returns `viewCount`, or `null` on a backend error.
- `getViewCounts(slugs: string[]): Promise<Record<string, number> | null>`:
  - Checks it received an array of strings, keeps only known slugs, removes duplicates, caps at 100, then makes one backend call.
  - Returns `null` on any failure.

### 8. `next.config.ts` (changed)
- Actions run inside the page that invokes them (`/blog`, `/blog/[slug]`). They read `src/content/blog/*.mdx` at runtime through `getAllPostSlugs()`. Next only traces those files into the serverless bundle if they're listed explicitly.
- Add `outputFileTracingIncludes: { "/blog/**": ["./src/content/blog/**"] }` (and `"/blog"`).
- Before writing this, I'll check the exact option name and key format in `node_modules/next/dist/docs`.

### 9. `src/components/blog/view-counter.tsx` (new, `"use client"`)
- On mount it runs `startTransition(async () => setCount(await recordView(slug)))`, following the docs pattern.
- A `useRef` guard stops Strict Mode's double effect from counting twice.
- It renders ` · 1,234 views` (`1 view` in the singular), and nothing while loading or when the count is null.

### 10. `src/app/blog/[slug]/page.tsx` (changed)
- The meta line becomes `{formatDate(post.date)} · {post.readingTime}<ViewCounter slug={slug} />`.
- The page stays SSG.

### 11. `src/components/blog/post-view-counts.tsx` (new, `"use client"`)
- `PostViewCountsProvider({ slugs, children })` calls `getViewCounts(slugs)` once after mount and puts the result in context.
- `PostViewCount({ slug })` renders ` · N views`, or nothing.

### 12. `src/app/blog/page.tsx` and `post-card.tsx` (changed)
- `BlogPage` wraps the list in `<PostViewCountsProvider slugs={posts.map(p => p.slug)}>`.
- `PostCard` stays a server component, with its reading-time line changed to `{post.readingTime}<PostViewCount slug={post.slug} />`.

### 13. Docs
- Update `ARCHITECTURE.md` (topology and request flows) and `FRONTEND_PLAN.md` to say Server Actions instead of `/api/contact` and `/api/views`.

## As built: differences from the plan above

- **The contact form doesn't use `<form action>`.** It keeps `onSubmit` and dispatches with `startTransition(() => formAction(formData))`. React 19 automatically resets a form after a `<form action>` submit, which would clear the visitor's text when sending fails. The cost is that the form needs JS, as it did before.
- **A client wrapper turns a thrown action into a form error.** `submitContactSafely` in `contact-form.tsx` catches the error (network failure, stale action ID) and shows a message instead of hitting the error boundary.
- **The tracing keys are `"/blog"` and `"/blog/*"`.** After `npm run build`, both `.next/server/app/blog/page.js.nft.json` and `.next/server/app/blog/[slug]/page.js.nft.json` list the `.mdx` files.
- **Requests without a user agent are treated as bots** (`isBot(null) === true`). The visitor IP falls back to `x-real-ip` when `x-forwarded-for` is missing.
- **Local port:** the KaiAvora backend also defaults to :8000. During the first test, :8000 was KaiAvora, so the view call got a 404 and the count was hidden (soft failure, working as designed). Run only the portfolio backend on :8000, or change `BACKEND_URL`.

### Verification (2026-11-03, `next start` + backend on :8000)
- `npm run lint`, `tsc --noEmit` and `npm run build` pass. `/blog` is `○` and `/blog/[slug]` is `●`, and `/api/contact` is gone.
- Post page `/blog/welcome-to-the-site` shows `JAN 5, 2026 · 1 MIN READ · 1 VIEW`, and a reload keeps it at 1 view (once-per-day de-duplication).
- `/blog` shows `1 min read · 0 views` and `1 min read · 1 view` from a single batched call.
- Contact form: the success message appears, the row is stored (`GET /ContactMessages`, with `ipAddress` forwarded), and no Resend error is logged.
- **Not yet tested:** behaviour with the backend stopped. The code path returns `null` and hides the count, and the email-only fallback is unchanged.

## Out of scope
- The privacy note about storing IPs with contact messages.
- Deploying the backend and setting `BACKEND_URL` and `BACKEND_API_KEY` in Vercel. Until then production behaves as today: counts are hidden and the contact form only emails.

## Verification
1. `npm run lint` and `npm run build`. `/blog` and `/blog/[slug]` must still be static/SSG (`○`/`●`), and `/api/contact` must be gone from the route list.
2. With the backend running on :8000:
   - A post's count goes up by 1, and a reload doesn't change it.
   - `/blog` shows the counts.
   - The contact form stores a row (Swagger `GET /ContactMessages`) and sends the email.
   - A failed send keeps the typed text in the form.
3. With the backend stopped: there are no counts, and the contact form still emails.
4. Commit on `main` (pushed to `origin/master`) only after you approve.
