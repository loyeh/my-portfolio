import "server-only";
import { headers } from "next/headers";
import type {
  ContactMessageCreated,
  ContactMessageInput,
  PostViewCollection,
  PostViewRecorded,
  StandardResponse,
} from "@/types/backend";

// Server-only client for the portfolio backend (repo: My Portfolio Backend).
// The browser never sees BACKEND_URL or BACKEND_API_KEY; only Server Actions call this.

const API_PREFIX = "/portfolioapi/v1";
const TIMEOUT_MS = 3000;
const MAX_USER_AGENT_LENGTH = 512;

const BOT_UA_PATTERN = /bot|crawler|spider|crawling|preview|headless|lighthouse/i;

export class BackendError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

export function isBackendConfigured(): boolean {
  return Boolean(process.env.BACKEND_URL && process.env.BACKEND_API_KEY);
}

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_UA_PATTERN.test(userAgent);
}

interface VisitorInfo {
  ip: string | null;
  userAgent: string | null;
}

/**
 * The original visitor's IP and user agent, read from the incoming request.
 * On Vercel the first x-forwarded-for entry here is the real visitor IP.
 */
export async function getVisitor(): Promise<VisitorInfo> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const ip = forwardedFor ?? h.get("x-real-ip");
  const userAgent = h.get("user-agent")?.slice(0, MAX_USER_AGENT_LENGTH) ?? null;
  return { ip, userAgent };
}

type HttpMethod = "GET" | "POST";

interface BackendRequest {
  method: HttpMethod;
  body?: ContactMessageInput;
  searchParams?: URLSearchParams;
}

async function backendFetch<T>(path: string, { method, body, searchParams }: BackendRequest): Promise<T> {
  const baseUrl = process.env.BACKEND_URL;
  const apiKey = process.env.BACKEND_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new BackendError("Backend is not configured.");
  }

  const url = new URL(`${API_PREFIX}${path}`, baseUrl);
  if (searchParams) url.search = searchParams.toString();

  const visitor = await getVisitor();
  const requestHeaders = new Headers({ Accept: "application/json", "X-API-Key": apiKey });
  if (body) requestHeaders.set("Content-Type", "application/json");
  // Not X-Forwarded-For: Vercel overwrites that on outbound calls with this server's IP,
  // which would collapse every visitor into one. The backend reads X-Client-IP.
  if (visitor.ip) requestHeaders.set("X-Client-IP", visitor.ip);
  if (visitor.userAgent) requestHeaders.set("User-Agent", visitor.userAgent);

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const envelope = (await response.json().catch(() => null)) as StandardResponse<T> | null;

  if (!response.ok || !envelope || envelope.data === null) {
    const reason = envelope?.userMessageCollection?.[0]?.text ?? response.statusText;
    throw new BackendError(`Backend ${method} ${path} failed: ${reason}`, response.status);
  }

  return envelope.data;
}

export function createContactMessage(input: ContactMessageInput): Promise<ContactMessageCreated> {
  return backendFetch<ContactMessageCreated>("/ContactMessages", { method: "POST", body: input });
}

export function recordPostView(slug: string): Promise<PostViewRecorded> {
  return backendFetch<PostViewRecorded>(`/PostViews/${encodeURIComponent(slug)}`, {
    method: "POST",
  });
}

export async function getPostViews(slugs: string[]): Promise<Record<string, number>> {
  const searchParams = new URLSearchParams();
  for (const slug of slugs) searchParams.append("slugs", slug);

  const collection = await backendFetch<PostViewCollection>("/PostViews", {
    method: "GET",
    searchParams,
  });

  const counts: Record<string, number> = {};
  for (const view of collection.postViewCollection) counts[view.slug] = view.viewCount;
  return counts;
}
